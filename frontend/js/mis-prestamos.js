/* ==========================================================================
   MÓDULO: mis-prestamos.js - Pedidos y préstamos del alumno (mis-prestamos.html)
   - Pedir un libro ..... GET /api/libros + POST /api/mis-pedidos
   - Mis pedidos ........ GET /api/perfil/historial (incluye dias_restantes)
   - Estado de la cuenta  GET /api/mis-pedidos/perfil (puede_pedir, solo alumnos)
   Flujo: el alumno solicita → queda "pendiente" → la biblioteca lo entrega.
   Los docentes solo consultan sus préstamos: no piden desde la app.
   Las plantillas están en mis-prestamos-ui.js, el dibujo en
   mis-prestamos-render.js y el diálogo en mis-prestamos-dialogo.js.
   ========================================================================== */

import { obtenerMiCuenta, obtenerPerfilAlumno, listarLibros, obtenerCategorias } from "./api.js";
import { mostrarAviso } from "./ui.js";
import { llenarCategorias } from "./libros-ui.js";
import { NO_HABILITADO } from "./mis-prestamos-ui.js";
import { crearVistas } from "./mis-prestamos-render.js";
import { crearDialogoPedido } from "./mis-prestamos-dialogo.js";

const $ = (selector) => document.querySelector(selector);


// 🎯 1. Nodos del DOM
const panelPedir = $("#panelPedir");
const formularioFiltros = $("#formularioFiltros");
const listaLibros = $("#listaLibros");
const contadorLibros = $("#contadorLibros");
const bannerSancion = $("#bannerSancion");
const bannerTitulo = $("#bannerTitulo");
const bannerMensaje = $("#bannerMensaje");
const filtrosPedidos = $("#filtrosPedidos");
const listaPedidos = $("#listaPedidos");
const contadorPedidos = $("#contadorPedidos");


// 🧠 2. Estado de la página (una sola copia de los datos que llegan de la API)
const estado = {
    usuario: null,
    prestamos: [],
    sanciones: [],
    libros: [],
    esAlumno: false,
    puedePedir: false,
    condicion: "",
    filtro: "todos",
    cargando: true,
    errorCuenta: null,
    errorLibros: null
};


// 🖼️ 3. Vistas (render) y diálogo
const vistas = crearVistas(estado, {
    metricas: $("#metricas"),
    banner: bannerSancion,
    bannerTitulo,
    bannerMensaje,
    formularioFiltros,
    listaLibros,
    contadorLibros,
    filtrosPedidos,
    listaPedidos,
    contadorPedidos
});

const dialogo = crearDialogoPedido({ alConfirmar: () => cargarTodo() });


// 🌐 4. Carga de datos

async function cargarTodo({ aviso = false } = {}) {
    estado.cargando = true;
    estado.errorCuenta = null;
    estado.errorLibros = null;
    vistas.pedidos();

    // Cuenta, catálogo y categorías se piden en paralelo
    const [cuentaRes, librosRes, categoriasRes] = await Promise.allSettled([
        obtenerMiCuenta(),
        listarLibros(),
        obtenerCategorias()
    ]);

    // 1. Cuenta e historial (funciona para alumnos y docentes)
    if (cuentaRes.status === "fulfilled") {
        const payload = cuentaRes.value.payload ?? {};
        estado.usuario = payload.usuario ?? null;
        estado.prestamos = payload.prestamos ?? [];
        estado.sanciones = payload.sanciones ?? [];
    } else {
        estado.errorCuenta = cuentaRes.reason?.message || "No se pudieron cargar tus préstamos.";
    }

    // 2. ¿Es alumno? Solo el alumno puede pedir libros desde la app.
    //    /api/mis-pedidos/perfil es solo para alumnos (a un docente le da 403),
    //    por eso se consulta únicamente cuando el rol es alumno.
    estado.esAlumno = estado.usuario?.rol === "alumno";
    estado.puedePedir = false;

    if (estado.esAlumno) {
        try {
            const perfil = (await obtenerPerfilAlumno()).payload ?? {};
            estado.puedePedir = Boolean(perfil.puede_pedir);
            estado.condicion = perfil.condicion ?? "";
        } catch (error) {
            estado.puedePedir = false;
        }
    }

    // 3. Catálogo y categorías
    if (librosRes.status === "fulfilled") {
        estado.libros = librosRes.value.payload ?? [];
    } else {
        estado.errorLibros = librosRes.reason?.message || "No se pudo cargar el catálogo.";
    }

    if (categoriasRes.status === "fulfilled") {
        llenarCategorias(categoriasRes.value.payload ?? []);
    }

    // 4. Dibujar todo
    estado.cargando = false;
    panelPedir.hidden = !estado.esAlumno;

    vistas.metricas();
    vistas.aviso();
    vistas.banner();
    vistas.libros();
    vistas.pedidos();

    window.lucide?.createIcons();

    if (aviso) mostrarAviso("Datos actualizados.");
}


// 🖱️ 5. Eventos

function conectarEventos() {
    // Buscador del catálogo: filtra en vivo sobre la lista ya cargada
    formularioFiltros.addEventListener("input", vistas.libros);
    formularioFiltros.addEventListener("submit", (evento) => evento.preventDefault());

    // Botón "Reservar" de cada tarjeta (delegación de eventos)
    listaLibros.addEventListener("click", (evento) => {
        const boton = evento.target.closest("[data-reservar-libro]");
        if (!boton) return;

        if (!estado.puedePedir) {
            mostrarAviso(NO_HABILITADO, true);
            return;
        }

        const libro = estado.libros.find((l) => l.id === Number(boton.dataset.reservarLibro));
        if (libro) dialogo.abrir(libro);
    });

    // Filtros de "Mis pedidos y préstamos"
    filtrosPedidos.addEventListener("click", (evento) => {
        const boton = evento.target.closest("[data-filtro]");
        if (!boton) return;

        estado.filtro = boton.dataset.filtro;
        vistas.pedidos();
    });

    // Actualizar a mano (por si cambió el stock o la confirmaron en el mostrador)
    $("#btnActualizar").addEventListener("click", async (evento) => {
        const boton = evento.currentTarget;
        boton.disabled = true;
        await cargarTodo({ aviso: true });
        boton.disabled = false;
    });
}


// 🚀 6. Inicialización (espera a que sesion.js valide el token)

let iniciado = false;

function iniciar() {
    if (iniciado) return;
    iniciado = true;
    conectarEventos();
    cargarTodo();
}

document.addEventListener("sesion-verificada", iniciar);

// Si sesion.js ya validó antes de que este módulo se cargara
if (!document.documentElement.classList.contains("verificando-sesion")) iniciar();
