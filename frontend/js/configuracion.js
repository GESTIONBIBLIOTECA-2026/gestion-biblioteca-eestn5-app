/* ==========================================================================
   MÓDULO: configuracion.js - Pantalla "Configuración" (configuracion.html)
   - Datos del perfil ..... GET / PUT /api/perfil
   - Contraseña ........... PUT /api/perfil/clave
   - Apariencia ........... el switch luna / sol lo maneja js/tema.js
   ========================================================================== */

import { obtenerMiPerfil, guardarMiPerfil, cambiarMiClave } from "./api.js";
import { mostrarAviso, marcarCampos } from "./ui.js";
import { mostrarNombre } from "./sesion.js";

// 🎯 1. Nodos del DOM
const formularioPerfil = document.querySelector("#formularioPerfil");
const formularioClave  = document.querySelector("#formularioClave");
const avisoClave       = document.querySelector("#avisoClave");

// 🧠 2. Estado (últimos datos guardados, para "Deshacer cambios")
let perfilGuardado = null;

// 🎨 3. Funciones de UI
function completarPerfil(usuario) {
    perfilGuardado = usuario;

    // Los campos se llaman igual que los datos (name="correo" ↔ usuario.correo)
    ["nombre_completo", "dni", "rol", "correo", "telefono", "direccion"].forEach((campo) => {
        formularioPerfil.elements[campo].value = usuario[campo] ?? "";
    });
}

// Datos del formulario como objeto: { nombre_completo, correo, ... }
const leerFormulario = (formulario) => Object.fromEntries(new FormData(formulario));

// 🌐 4. Cargar el perfil
async function cargarPerfil() {
    try {
        const { payload } = await obtenerMiPerfil();
        completarPerfil(payload);
    } catch (error) {
        mostrarAviso(error.message, true);
    }
}

// 🖱️ 5. Eventos

// 💾 Guardar mis datos
formularioPerfil.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    marcarCampos(formularioPerfil);

    try {
        const { mensaje, payload } = await guardarMiPerfil(leerFormulario(formularioPerfil));
        completarPerfil(payload);
        mostrarNombre(payload.nombre_completo, payload.rol);   // el nombre nuevo también en el encabezado
        mostrarAviso(mensaje);
    } catch (error) {
        marcarCampos(formularioPerfil, error.campos);
        mostrarAviso(error.message, true);
    }
});

// ↩️ Deshacer cambios
formularioPerfil.addEventListener("reset", (evento) => {
    evento.preventDefault();
    marcarCampos(formularioPerfil);
    if (perfilGuardado) completarPerfil(perfilGuardado);
});

// 🔑 Cambiar contraseña
formularioClave.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    marcarCampos(formularioClave);
    avisoClave.hidden = true;

    try {
        const { mensaje } = await cambiarMiClave(leerFormulario(formularioClave));
        formularioClave.reset();
        avisoClave.textContent = mensaje;
        avisoClave.hidden = false;
    } catch (error) {
        marcarCampos(formularioClave, error.campos);
        mostrarAviso(error.message, true);
    }
});

// 👁️ Mostrar / ocultar contraseñas (delegación: un solo listener para los 3 botones)
formularioClave.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-ver-clave]");
    if (!boton) return;

    const campo = document.getElementById(boton.dataset.verClave);
    campo.type = campo.type === "password" ? "text" : "password";
});

// 🚀 6. Inicialización
cargarPerfil();
