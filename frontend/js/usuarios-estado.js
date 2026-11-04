/* ==========================================================================
   MÓDULO: usuarios-estado.js - Suspender, dar de baja y reactivar · Grupo 5
   PATCH /api/usuarios/:id/estado  (suspender y dar de baja piden confirmación)
   Cuando algo cambia avisa con el evento "usuarios-actualizados".
   ========================================================================== */

import { cambiarEstado } from "./api.js";
import { mostrarAviso, marcarCampos } from "./ui.js";

// 🎯 Nodos del DOM
const dialogo    = document.querySelector("#dialogoConfirmar");
const formulario = document.querySelector("#formularioConfirmar");

// 🧠 Estado: { id, estado } que espera confirmación
let pendiente = null;


// Guarda el estado nuevo y avisa para que se recargue la tabla
async function guardarEstado(id, estado, motivo = "") {
    try {
        mostrarAviso((await cambiarEstado(id, estado, motivo)).mensaje);
        dialogo.close();
        document.dispatchEvent(new Event("usuarios-actualizados"));
    } catch (error) {
        marcarCampos(formulario, error.campos);
        mostrarAviso(error.message, true);
    }
}

/* --- Reactivar va directo; suspender (con motivo) y dar de baja abren la confirmación --- */
export function cambiarEstadoUsuario({ id, nombre_completo }, estado) {
    if (estado === "habilitado") return guardarEstado(id, estado);

    const suspender = estado === "suspendido";
    pendiente = { id, estado };
    formulario.reset();
    marcarCampos(formulario);

    document.querySelector("#tituloConfirmar").textContent = `${suspender ? "Suspender" : "Dar de baja"} a ${nombre_completo}`;
    document.querySelector("#textoConfirmar").textContent = suspender
        ? "No va a poder pedir libros hasta que lo habilites."
        : "Es una baja lógica: su historial se conserva y se puede reactivar.";
    document.querySelector("#grupoMotivo").hidden = !suspender;
    dialogo.showModal();
}


// 🖱️ Confirmar
formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    guardarEstado(pendiente.id, pendiente.estado, formulario.elements.motivo.value);
});
