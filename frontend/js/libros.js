/* ==========================================================================
   MÓDULO: libros.js - Gestión de catálogo (libros.html) · Grupo 6
   - Resumen ........... GET /api/libros/resumen
   - Catálogo + filtros  GET /api/libros?texto=&categoria=&disponibilidad=
   - Categorías ........ GET /api/libros/categorias (selectores)
   Ventanas (alta, edición, stock y baja): libros-dialogos.js
   ========================================================================== */

import { listarLibros, obtenerResumenLibros, obtenerCategorias } from "./api.js";
import { crearFilaMensajeHTML, activarCierreDialogos } from "./ui.js";
import { crearFilaLibroHTML, llenarCategorias } from "./libros-ui.js";
import { abrirFormularioLibro, abrirStock, abrirBaja } from "./libros-dialogos.js";

// 🎯 1. Nodos del DOM
const formularioFiltros = document.querySelector("#formularioFiltros");
const cuerpoLibros = document.querySelector("#cuerpoLibros");

// 🧠 2. Estado: los libros que se ven en la tabla
let libros = [];

// Qué hace cada botón de una fila (data-accion)
const ACCIONES = { editar: abrirFormularioLibro, stock: abrirStock, baja: abrirBaja };


// 🌐 3. Carga de datos (Loading → Éxito → Error)
async function cargarResumen() {
    try {
        const { payload: r } = await obtenerResumenLibros();
        const numeros = { resumenTitulos: r.titulos, resumenEjemplares: r.ejemplares, resumenDisponibles: r.disponibles, resumenFuera: r.fuera_de_servicio };
        Object.entries(numeros).forEach(([id, valor]) => { document.getElementById(id).textContent = valor; });
    } catch (error) {
        // Sin resumen la tabla sigue funcionando
    }
}

async function cargarLibros() {
    cuerpoLibros.innerHTML = crearFilaMensajeHTML("Cargando catálogo...", 7);

    try {
        const { payload } = await listarLibros(Object.fromEntries(new FormData(formularioFiltros)));
        libros = payload;
        cuerpoLibros.innerHTML = libros.length
            ? libros.map(crearFilaLibroHTML).join("")
            : crearFilaMensajeHTML("No hay libros que coincidan con la búsqueda.", 7);
        document.querySelector("#totalLibros").textContent = libros.length;
    } catch (error) {
        cuerpoLibros.innerHTML = crearFilaMensajeHTML(error.status ? error.message : "No hay conexión con el servidor.", 7);
    }
    window.lucide?.createIcons();
}

async function cargarCategorias() {
    try {
        llenarCategorias((await obtenerCategorias()).payload);
    } catch (error) {
        // Sin categorías no se puede cargar un libro: el formulario lo va a avisar
    }
}

const recargar = () => Promise.all([cargarResumen(), cargarLibros()]);


// 🖱️ 4. Eventos
formularioFiltros.addEventListener("submit", (evento) => { evento.preventDefault(); cargarLibros(); });
formularioFiltros.addEventListener("reset", () => setTimeout(cargarLibros));   // después de que se vacíen los campos
document.querySelector("#botonNuevoLibro").addEventListener("click", () => abrirFormularioLibro());
document.addEventListener("libros-actualizados", recargar);

// Delegación: un solo listener para los botones de todas las filas
cuerpoLibros.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-accion]");
    if (!boton) return;
    const libro = libros.find((l) => l.id === Number(boton.dataset.id));
    ACCIONES[boton.dataset.accion](libro);
});


// 🚀 5. Inicialización
activarCierreDialogos();
cargarCategorias();
recargar();
