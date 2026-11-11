/* ==========================================================================
   MÓDULO: catalogo.js - Catálogo para alumnos y docentes (catalogo.html) · Grupo 6
   - Libros ...... GET /api/libros            (una sola carga)
   - Categorías .. GET /api/libros/categorias
   El buscador filtra EN VIVO sobre la lista ya cargada (HOF .filter):
   título o autor + categoría + "solo disponibles" (filtros combinados).
   ========================================================================== */

import { listarLibros, obtenerCategorias, solicitarReserva, obtenerPerfilAlumno } from "./api.js";
import { escapar, mostrarAviso } from "./ui.js";
import { crearTarjetaLibroHTML, llenarCategorias } from "./libros-ui.js";

// 🎯 1. Nodos del DOM
const formularioFiltros = document.querySelector("#formularioFiltros");
const grilla = document.querySelector("#grillaLibros");
const bannerSancion = document.querySelector("#bannerSancion");
const bannerTitulo = document.querySelector("#bannerTitulo");
const bannerMensaje = document.querySelector("#bannerMensaje");

// Nodos del modal de reserva
const dialogoReserva = document.querySelector("#dialogoReserva");
const formularioReserva = document.querySelector("#formularioReserva");
const reservaLibroId = document.querySelector("#reservaLibroId");
const reservaTitulo = document.querySelector("#reservaTitulo");
const reservaFecha = document.querySelector("#reservaFecha");
const btnCerrarModalReserva = document.querySelector("#btnCerrarModalReserva");
const btnCancelarReserva = document.querySelector("#btnCancelarReserva");
const btnConfirmarReserva = document.querySelector("#btnConfirmarReserva");

// 🧠 2. Estado
let libros = [];
let perfilAlumno = null;

// Texto sin tildes ni mayúsculas: "Física" encuentra "fisica"
const normalizar = (texto) => String(texto ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const formatearFechaISO = (fecha) => fecha.toISOString().slice(0, 10);

function calcularFechaSugerida(dias = 7) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    return formatearFechaISO(fecha);
}

// 🎨 3. Funciones de UI
function mostrarLibros() {
    const { texto, categoria, disponibles } = Object.fromEntries(new FormData(formularioFiltros));
    const buscado = normalizar(texto);

    const filtrados = libros.filter((l) =>
        normalizar(`${l.titulo} ${l.autores}`).includes(buscado)
        && (categoria === "0" || l.categoria_id === Number(categoria))
        && (!disponibles || l.stock_reservable > 0));

    grilla.innerHTML = filtrados.length
        ? filtrados.map(crearTarjetaLibroHTML).join("")
        : `<p class="panel-vacio">No encontramos libros con esa búsqueda.</p>`;
    document.querySelector("#totalLibros").textContent = filtrados.length;
    window.lucide?.createIcons();
}

function abrirModalReserva(libroId, titulo) {
    if (!dialogoReserva) return;
    reservaLibroId.value = libroId;
    reservaTitulo.value = titulo;
    const hoy = new Date();
    reservaFecha.min = formatearFechaISO(hoy);
    reservaFecha.value = calcularFechaSugerida(7);
    dialogoReserva.showModal();
    window.lucide?.createIcons();
}

function cerrarModalReserva() {
    if (!dialogoReserva) return;
    dialogoReserva.close();
    formularioReserva?.reset();
}

// 🌐 4. Carga de datos
async function verificarEstadoAlumno() {
    try {
        const { payload } = await obtenerPerfilAlumno();
        perfilAlumno = payload;
        if (perfilAlumno && !perfilAlumno.puede_pedir && bannerSancion) {
            bannerSancion.hidden = false;
            bannerTitulo.textContent = `Cuenta en condición: ${String(perfilAlumno.condicion || "suspendido").toUpperCase()}`;
            bannerMensaje.textContent = "Tu cuenta registra sanciones o préstamos vencidos. No podés realizar nuevas reservas hasta regularizar tu situación en el mostrador.";
            window.lucide?.createIcons();
        }
    } catch {
        // En caso de administradores o sesiones externas, no bloquea visualmente
        perfilAlumno = null;
    }
}

async function cargarCatalogo() {
    try {
        const [catalogo, categorias] = await Promise.all([
            listarLibros(),
            obtenerCategorias(),
            verificarEstadoAlumno()
        ]);
        libros = catalogo.payload;
        llenarCategorias(categorias.payload);
        mostrarLibros();
    } catch (error) {
        grilla.innerHTML = `<p class="panel-vacio">${escapar(error.status ? error.message : "No hay conexión con el servidor.")}</p>`;
    }
}

// 🖱️ 5. Eventos
formularioFiltros.addEventListener("input", mostrarLibros);    // en vivo, sin botón "Buscar"
formularioFiltros.addEventListener("submit", (evento) => evento.preventDefault());

// Delegación de click para botón de reserva en la grilla de libros
grilla.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-reservar-libro]");
    if (!boton) return;

    if (perfilAlumno && !perfilAlumno.puede_pedir) {
        mostrarAviso("Tu cuenta no está habilitada para solicitar reservas en este momento.", true);
        return;
    }

    const libroId = Number(boton.dataset.reservarLibro);
    const titulo = boton.dataset.titulo || "Libro seleccionado";
    abrirModalReserva(libroId, titulo);
});

btnCerrarModalReserva?.addEventListener("click", cerrarModalReserva);
btnCancelarReserva?.addEventListener("click", cerrarModalReserva);

formularioReserva?.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const libroId = Number(reservaLibroId.value);
    const fechaDevolucion = reservaFecha.value;

    if (!libroId || !fechaDevolucion) {
        mostrarAviso("Completá la fecha estimada de devolución.", true);
        return;
    }

    btnConfirmarReserva.disabled = true;
    try {
        const respuesta = await solicitarReserva({ libroId, cantidad: 1, fechaDevolucion });
        mostrarAviso(respuesta.mensaje || "¡Reserva registrada con éxito!");
        cerrarModalReserva();

        // Actualizar el catálogo para refrescar el stock_reservable
        const catalogo = await listarLibros();
        libros = catalogo.payload;
        mostrarLibros();
    } catch (error) {
        mostrarAviso(error.message || "No se pudo registrar la reserva.", true);
    } finally {
        btnConfirmarReserva.disabled = false;
    }
});

// 🚀 6. Inicialización
cargarCatalogo();
