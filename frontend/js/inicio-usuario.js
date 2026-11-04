/* ==========================================================================
   MÓDULO: inicio-usuario.js - Inicio de alumnos y docentes (inicio-usuario.html)
   Todo sale de UNA consulta: GET /api/perfil/historial → { usuario, prestamos, sanciones }
   - Credencial digital y estado de la cuenta
   - Números: libros en mi poder, próxima devolución, vencidos y reservas
   - Devoluciones pendientes (cuántos días faltan), reservas, historial y sanciones
   ========================================================================== */

import { obtenerMiCuenta } from "./api.js";
import { escapar, crearFilaMensajeHTML } from "./ui.js";
import { crearMetricasHTML, crearDevolucionHTML, crearReservaHTML, crearFilaHistorialHTML } from "./inicio-usuario-ui.js";
import { mostrarCredencial, mostrarAvisoCuenta, crearSancionHTML } from "./cuenta-usuario.js";

// 🎯 1. Nodos del DOM
const $ = (selector) => document.querySelector(selector);
const filtrosHistorial = $("#filtrosHistorial");
const cuerpoHistorial = $("#cuerpoHistorial");

// 🧠 2. Estado
let prestamos = [];
let filtroActual = "todos";

// Filtros del historial: cada uno es una función que decide si el préstamo entra (HOF .filter)
const FILTROS = {
    todos: () => true,
    en_curso: (p) => ["prestado", "vencido"].includes(p.estado),
    devueltos: (p) => p.estado === "devuelto",
    atrasos: (p) => p.dias_atraso > 0
};


// 🎨 3. Funciones de UI (credencial y aviso: cuenta-usuario.js)

// Lista de préstamos (devoluciones, reservas o sanciones) con su contador
function mostrarLista(seccion, items, crearHTML, textoVacio) {
    const lista = $(`#${seccion} ul`);
    const contador = $(`#${seccion} .contador-seccion`);
    if (contador) contador.textContent = items.length;

    lista.innerHTML = items.length ? items.map(crearHTML).join("") : `<li class="lista-vacia">${textoVacio}</li>`;
    if (!textoVacio) $(`#${seccion}`).hidden = items.length === 0;   // sin texto vacío = sección opcional
}

function mostrarHistorial() {
    const filtrados = prestamos.filter(FILTROS[filtroActual]);

    cuerpoHistorial.innerHTML = filtrados.length
        ? filtrados.map(crearFilaHistorialHTML).join("")
        : crearFilaMensajeHTML(prestamos.length ? "No hay préstamos con ese filtro." : "Todavía no pediste libros.", 5);

    filtrosHistorial.querySelectorAll("[data-filtro]").forEach((boton) => {
        boton.classList.toggle("activo", boton.dataset.filtro === filtroActual);
        boton.querySelector("span").textContent = prestamos.filter(FILTROS[boton.dataset.filtro]).length;
    });
}


// 🌐 4. Carga de datos (Loading → Éxito → Error)
async function cargarCuenta() {
    try {
        const { payload } = await obtenerMiCuenta();
        const { usuario, sanciones } = payload;
        prestamos = payload.prestamos;

        // Préstamos en mi poder, del más urgente al más tranquilo (los vencidos quedan primero)
        const activos = prestamos.filter(FILTROS.en_curso).sort((a, b) => a.dias_restantes - b.dias_restantes);
        const vencidos = activos.filter(FILTROS.atrasos);
        const reservas = prestamos.filter((p) => p.estado === "pendiente");
        const proximo = activos.find((p) => p.dias_restantes >= 0);

        mostrarCredencial(usuario);
        mostrarAvisoCuenta({ usuario, vencidos, proximo, sanciones });
        $("#metricas").innerHTML = crearMetricasHTML({ activos, vencidos, reservas, proximo });
        mostrarLista("devoluciones", activos, crearDevolucionHTML, "No tenés libros para devolver. ¡Estás al día!");
        mostrarLista("reservas", reservas, crearReservaHTML);
        mostrarLista("sanciones", sanciones, crearSancionHTML);
        mostrarHistorial();

    } catch (error) {
        const mensaje = error.status ? error.message : "No hay conexión con el servidor.";
        $("#textoBienvenida").textContent = mensaje;
        $("#listaDevoluciones").innerHTML = `<li class="lista-vacia">${escapar(mensaje)}</li>`;
        cuerpoHistorial.innerHTML = crearFilaMensajeHTML(mensaje, 5);
    }

    window.lucide?.createIcons();   // íconos de lo que se acaba de dibujar
}


// 🖱️ 5. Eventos (delegación: un solo listener para los filtros)
filtrosHistorial.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-filtro]");
    if (!boton) return;
    filtroActual = boton.dataset.filtro;
    mostrarHistorial();
});


// 🚀 6. Inicialización
cargarCuenta();
