/* ==========================================================================
   MÓDULO: libros-dialogos.js - Ventanas de la gestión de catálogo · Grupo 6
   - Alta y modificación ... POST / PUT /api/libros
   - Actualizar stock ...... PATCH /api/libros/:id/stock
   - Dar de baja ........... DELETE /api/libros/:id
   Cuando algo cambia avisa con el evento "libros-actualizados" (libros.js recarga).
   ========================================================================== */

import { registrarLibro, modificarLibro, cambiarStock, darDeBajaLibro } from "./api.js";
import { mostrarAviso, marcarCampos } from "./ui.js";

// 🎯 Nodos del DOM
const $ = (selector) => document.querySelector(selector);
const formularioLibro = $("#formularioLibro");
const formularioStock = $("#formularioStock");
const formularioBaja = $("#formularioBaja");

// 🧠 Estado: el libro con el que se está trabajando (null = alta)
let libroActual = null;

const CAMPOS = ["titulo", "autores", "editorial", "isbn", "categoria_id", "anio"];
const leer = (formulario) => Object.fromEntries(new FormData(formulario));
const avisarCambios = () => document.dispatchEvent(new Event("libros-actualizados"));

// Envía el formulario: si sale bien cierra la ventana; si no, marca los campos con error
async function enviar(formulario, peticion) {
    marcarCampos(formulario);
    try {
        const { mensaje } = await peticion();
        formulario.closest("dialog").close();
        mostrarAviso(mensaje);
        avisarCambios();
    } catch (error) {
        marcarCampos(formulario, error.campos);
        mostrarAviso(error.message, true);
    }
}


/* --- Alta (sin libro) o modificación (con libro) --- */
export function abrirFormularioLibro(libro = null) {
    libroActual = libro;
    formularioLibro.reset();
    marcarCampos(formularioLibro);
    if (libro) CAMPOS.forEach((campo) => { formularioLibro.elements[campo].value = libro[campo] ?? ""; });

    $("#grupoCantidad").hidden = Boolean(libro);   // el stock después se cambia con "Actualizar stock"
    $("#tituloDialogoLibro").textContent = libro ? `Modificar «${libro.titulo}»` : "Registrar libro nuevo";
    $("#botonGuardarLibro").textContent = libro ? "Guardar cambios" : "Guardar libro";
    $("#dialogoLibro").showModal();
}

export function abrirStock(libro) {
    libroActual = libro;
    formularioStock.reset();
    marcarCampos(formularioStock);
    $("#tituloStock").textContent = `Stock de «${libro.titulo}»`;
    $("#textoStock").textContent = `Hoy tiene ${libro.ejemplares_totales} ejemplar(es): ${libro.ejemplares_disponibles} en el estante`
        + `${libro.cantidad_reservada ? ` (${libro.cantidad_reservada} reservado/s)` : ""}.`;
    $("#dialogoStock").showModal();
}

export function abrirBaja(libro) {
    libroActual = libro;
    $("#tituloBaja").textContent = `Dar de baja «${libro.titulo}»`;
    $("#dialogoBaja").showModal();
}


// 🖱️ Eventos
formularioLibro.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const datos = leer(formularioLibro);
    enviar(formularioLibro, () => (libroActual ? modificarLibro(libroActual.id, datos) : registrarLibro(datos)));
});

formularioStock.addEventListener("submit", (evento) => {
    evento.preventDefault();
    enviar(formularioStock, () => cambiarStock(libroActual.id, leer(formularioStock).cambio));
});

formularioBaja.addEventListener("submit", (evento) => {
    evento.preventDefault();
    enviar(formularioBaja, () => darDeBajaLibro(libroActual.id));
});
