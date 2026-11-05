/* ==========================================================================
   MÓDULO: libros-ui.js - Plantillas HTML del catálogo · Grupo 6
   Las usa catalogo.html (alumnos y docentes).
   ========================================================================== */

import { escapar } from "./ui.js";

/* --- Estado del libro según su stock → [texto, clase de color] (texto + color, nunca solo color) --- */
function estadoLibro({ ejemplares_totales, ejemplares_disponibles, stock_reservable }) {
    if (ejemplares_totales === 0) return ["Sin ejemplares", "gris"];
    if (stock_reservable > 0) return ["Disponible", "verde"];
    if (ejemplares_disponibles > 0) return ["Reservado", "ambar"];   // está en el estante, pero ya lo separó alguien
    return ["Prestado", "azul"];
}

/* --- Opciones de las categorías para todos los <select data-categorias> de la página --- */
export function llenarCategorias(categorias) {
    document.querySelectorAll("[data-categorias]").forEach((select) => {
        select.querySelectorAll("option:not(:first-child)").forEach((opcion) => opcion.remove());

        // createElement + append (clase 04 §1.5); textContent no deja pasar HTML
        categorias.forEach(({ id, nombre }) => {
            const opcion = document.createElement("option");
            opcion.value = id;
            opcion.textContent = nombre;
            select.append(opcion);
        });
    });
}

/* --- Tarjeta del catálogo para alumnos y docentes (catalogo.html) --- */
export function crearTarjetaLibroHTML(libro) {
    const [texto, clase] = estadoLibro(libro);
    const hayStock = libro.stock_reservable > 0;
    const detalle = [libro.categoria, libro.editorial, libro.anio].filter(Boolean).map(escapar).join(" · ");
    // Si el libro tiene portada, la imagen se dibuja encima del ícono; si no carga, se sigue viendo el ícono
    const portada = libro.portada_url ? `<img src="${escapar(libro.portada_url)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : "";

    return `
        <article class="tarjeta-libro">
            <div class="tarjeta-libro-portada"><span class="icono" aria-hidden="true">📖</span>${portada}</div>
            <div class="tarjeta-libro-info">
                <h3>${escapar(libro.titulo)}</h3>
                <p>${escapar(libro.autores ?? "Sin autor")}</p>
                <small>${detalle}</small>
            </div>
            <div class="tarjeta-libro-pie">
                <span class="etiqueta ${clase}">${hayStock ? `${texto} · ${libro.stock_reservable} libre/s` : texto}</span>
                <small>${libro.ejemplares_totales} ejemplar(es) en la biblioteca</small>
            </div>
        </article>`;
}
