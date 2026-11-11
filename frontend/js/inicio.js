/* ==========================================================================
   MÓDULO: inicio.js - Panel de inicio del administrador (index.html)
   - Métricas reales ........ GET /api/dashboard  (libros, préstamos activos, morosos)
   - Últimos préstamos ...... GET /api/prestamos?limite=5  (solo lectura)
   ========================================================================== */

import { obtenerMetricas, obtenerUltimosPrestamos } from "./api.js";
import { crearFilaPrestamoHTML, crearFilaMensajeHTML } from "./ui.js";


// 🎯 1. Nodos del DOM
const cuerpoPrestamos = document.querySelector("#cuerpoPrestamos");

// Cada contador del panel ↔ la métrica que devuelve el backend
const CONTADORES = {
    "#total-libros": "libros_total",
    "#total-prestamos": "prestamos_activos",
    "#total-morosos": "alumnos_morosos"
};


// 🎨 2. Funciones de UI
function mostrarMetricas(metricas) {
    Object.entries(CONTADORES).forEach(([selector, clave]) => {
        document.querySelector(selector).textContent = metricas ? metricas[clave].toLocaleString("es-AR") : "--";
    });
}


// 🌐 3. Carga de datos (Loading → Éxito → Error)
async function cargarMetricas() {
    try {
        const { payload } = await obtenerMetricas();
        mostrarMetricas(payload);
    } catch (error) {
        mostrarMetricas(null);
    }
}

async function cargarPrestamos() {
    cuerpoPrestamos.innerHTML = crearFilaMensajeHTML("Cargando préstamos...", 5);

    try {
        const { payload: prestamos } = await obtenerUltimosPrestamos(5);

        cuerpoPrestamos.innerHTML = prestamos.length === 0
            ? crearFilaMensajeHTML("Todavía no hay préstamos registrados.", 5)
            : prestamos.map(crearFilaPrestamoHTML).join("");

    } catch (error) {
        cuerpoPrestamos.innerHTML = crearFilaMensajeHTML(error.status ? error.message : "No hay conexión con el servidor.", 5);
    }
}


// 🚀 4. Inicialización (las dos consultas viajan en paralelo)
Promise.all([cargarMetricas(), cargarPrestamos()]);
