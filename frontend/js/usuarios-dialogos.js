/* ==========================================================================
   MÓDULO: usuarios-dialogos.js - Ventanas de la gestión de usuarios
   - Alta y modificación ....... POST / PUT /api/usuarios
   - Ficha e historial activo .. GET  /api/usuarios/:id/historial
   - Cursos para autocompletar . GET  /api/cursos
   Cuando algo cambia avisa con el evento "usuarios-actualizados" (usuarios.js recarga la tabla).
   ========================================================================== */

import { obtenerUsuario, obtenerHistorial, registrarUsuario, modificarUsuario, obtenerCursos } from "./api.js";
import { mostrarAviso, marcarCampos, iniciales } from "./ui.js";
import { crearFichaHTML } from "./usuarios-ui.js";

// 🎯 Nodos del DOM
const dialogoUsuario      = document.querySelector("#dialogoUsuario");
const formularioUsuario   = document.querySelector("#formularioUsuario");
const dialogoFicha        = document.querySelector("#dialogoFicha");

// 🧠 Estado
let idEnEdicion = null;      // null = alta, número = modificación
let idFicha = null;

const avisarCambios = () => document.dispatchEvent(new Event("usuarios-actualizados"));


/* --- Alta (sin usuario) o modificación (con usuario) --- */
export function abrirFormulario(usuario = null) {
    idEnEdicion = usuario?.id ?? null;
    formularioUsuario.reset();
    marcarCampos(formularioUsuario);

    if (usuario) ["nombre_completo", "dni", "rol", "curso", "correo", "telefono", "direccion"]
        .forEach((campo) => { formularioUsuario.elements[campo].value = usuario[campo] ?? ""; });

    document.querySelector("#tituloFormulario").textContent = usuario ? "Modificar usuario" : "Registrar usuario";
    document.querySelector("#etiquetaClave").textContent = usuario ? "Nueva contraseña (opcional)" : "Contraseña inicial *";
    document.querySelector("#botonGuardar").textContent = usuario ? "Guardar cambios" : "Registrar usuario";
    dialogoUsuario.showModal();
}

export async function editarUsuario(id) {
    try {
        abrirFormulario((await obtenerUsuario(id)).payload);
    } catch (error) {
        mostrarAviso(error.message, true);
    }
}

export async function verFicha(id) {
    try {
        const { payload } = await obtenerHistorial(id);
        idFicha = id;
        document.querySelector("#fichaIniciales").textContent = iniciales(payload.usuario.nombre_completo);
        document.querySelector("#fichaNombre").textContent = payload.usuario.nombre_completo;
        document.querySelector("#fichaSubtitulo").textContent = `DNI ${payload.usuario.dni} · ${payload.usuario.rol}`;
        document.querySelector("#fichaCuerpo").innerHTML = crearFichaHTML(payload);
        dialogoFicha.showModal();
    } catch (error) {
        mostrarAviso(error.message, true);
    }
}

/* --- Cursos para el autocompletado (datalist) del buscador y del formulario --- */
export async function cargarCursos() {
    try {
        const { payload } = await obtenerCursos();
        document.querySelector("#listaCursos").innerHTML = payload.map(({ nombre }) => `<option value="${nombre}">`).join("");
    } catch (error) {
        // Sin la lista igual se puede escribir el curso a mano
    }
}


// 🖱️ Eventos
formularioUsuario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    marcarCampos(formularioUsuario);
    const datos = Object.fromEntries(new FormData(formularioUsuario));

    try {
        const { mensaje } = idEnEdicion ? await modificarUsuario(idEnEdicion, datos) : await registrarUsuario(datos);
        dialogoUsuario.close();
        mostrarAviso(mensaje);
        avisarCambios();
        cargarCursos();   // por si se agregó un curso nuevo
    } catch (error) {
        marcarCampos(formularioUsuario, error.campos);
        mostrarAviso(error.message, true);
    }
});

document.querySelector("#botonEditarFicha").addEventListener("click", () => {
    dialogoFicha.close();
    editarUsuario(idFicha);
});

document.querySelectorAll("[data-cerrar-dialogo]").forEach((boton) => {
    boton.addEventListener("click", () => boton.closest("dialog").close());
});
