/* ==========================================================================
   MÓDULO: catalogo.js - Catálogo para alumnos y docentes (catalogo.html) · Grupo 6
   - Libros ...... GET /api/libros?texto=&categoria=&disponibilidad=
   - Categorías .. GET /api/libros/categorias
   El buscador le pide los libros al backend en cada cambio (evento input).
   MySQL compara sin tildes ni mayúsculas: "fisica" encuentra "Física".
   ========================================================================== */

import { listarLibros, obtenerCategorias } from "./api.js";
import { escapar } from "./ui.js";
import { crearTarjetaLibroHTML, llenarCategorias } from "./libros-ui.js";

// 🎯 1. Nodos del DOM
const formularioFiltros = document.querySelector("#formularioFiltros");
const campoTexto       = formularioFiltros.querySelector("[name=\"texto\"]");
const campoCategoria   = formularioFiltros.querySelector("[name=\"categoria\"]");
const campoDisponibles = formularioFiltros.querySelector("[name=\"disponibles\"]");
const grilla = document.querySelector("#grillaLibros");

// 🧠 2. Estado: número de la última búsqueda (si llega tarde una respuesta vieja, se ignora)
let ultimaBusqueda = 0;


// 🎨 3. Funciones de UI
function mostrarLibros(libros) {
    grilla.innerHTML = libros.length
        ? libros.map(crearTarjetaLibroHTML).join("")
        : `<p class="panel-vacio">No encontramos libros con esa búsqueda.</p>`;
    document.querySelector("#totalLibros").textContent = libros.length;
}

function mostrarError(error) {
    grilla.innerHTML = `<p class="panel-vacio">${escapar(error.status ? error.message : "No hay conexión con el servidor.")}</p>`;
}


// 🌐 4. Carga de datos

// Primera carga: libros y categorías viajan en paralelo
async function cargarCatalogo() {
    try {
        const [catalogo, categorias] = await Promise.all([listarLibros(), obtenerCategorias()]);
        llenarCategorias(categorias.payload);
        mostrarLibros(catalogo.payload);
    } catch (error) {
        mostrarError(error);
    }
}

// Búsqueda con los filtros combinados: título o autor + categoría + "solo disponibles"
async function buscarLibros() {
    ultimaBusqueda = ultimaBusqueda + 1;
    const numero = ultimaBusqueda;
    const disponibilidad = campoDisponibles.checked ? "disponible" : "";

    try {
        const { payload } = await listarLibros(campoTexto.value.trim(), campoCategoria.value, disponibilidad);
        if (numero === ultimaBusqueda) mostrarLibros(payload);
    } catch (error) {
        if (numero === ultimaBusqueda) mostrarError(error);
    }
}


// 🖱️ 5. Eventos
formularioFiltros.addEventListener("input", buscarLibros);    // en vivo, sin botón "Buscar"
formularioFiltros.addEventListener("submit", (evento) => evento.preventDefault());


// 🚀 6. Inicialización
cargarCatalogo();
