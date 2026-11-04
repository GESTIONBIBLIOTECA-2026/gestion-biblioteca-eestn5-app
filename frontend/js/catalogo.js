/* ==========================================================================
   MÓDULO: catalogo.js - Catálogo para alumnos y docentes (catalogo.html) · Grupo 6
   - Libros ...... GET /api/libros            (una sola carga)
   - Categorías .. GET /api/libros/categorias
   El buscador filtra EN VIVO sobre la lista ya cargada (HOF .filter):
   título o autor + categoría + "solo disponibles" (filtros combinados).
   ========================================================================== */

import { listarLibros, obtenerCategorias } from "./api.js";
import { escapar } from "./ui.js";
import { crearTarjetaLibroHTML, llenarCategorias } from "./libros-ui.js";

// 🎯 1. Nodos del DOM
const formularioFiltros = document.querySelector("#formularioFiltros");
const grilla = document.querySelector("#grillaLibros");

// 🧠 2. Estado
let libros = [];

// Texto sin tildes ni mayúsculas: "Física" encuentra "fisica"
const normalizar = (texto) => String(texto ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();


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


// 🌐 4. Carga de datos (las dos consultas viajan en paralelo)
async function cargarCatalogo() {
    try {
        const [catalogo, categorias] = await Promise.all([listarLibros(), obtenerCategorias()]);
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


// 🚀 6. Inicialización
cargarCatalogo();
