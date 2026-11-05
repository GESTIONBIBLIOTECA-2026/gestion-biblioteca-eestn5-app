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
const botonDeshacer    = document.querySelector("#botonDeshacer");
const avisoClave       = document.querySelector("#avisoClave");

// 🧠 2. Estado (últimos datos guardados, para "Deshacer cambios") y campos de cada formulario
let perfilGuardado = null;
const CAMPOS_PERFIL = ["nombre_completo", "correo", "telefono", "direccion"];
const CAMPOS_CLAVE = ["clave_actual", "clave_nueva", "confirmacion"];

// 🎨 3. Funciones de UI
function completarPerfil(usuario) {
    perfilGuardado = usuario;

    // Los campos se llaman igual que los datos (name="correo" ↔ usuario.correo)
    ["nombre_completo", "dni", "rol", "correo", "telefono", "direccion"].forEach((campo) => {
        formularioPerfil.querySelector(`[name="${campo}"]`).value = usuario[campo] ?? "";
    });
}

// Lee los campos pedidos y arma el objeto: { nombre_completo: "...", correo: "...", ... }
function leerFormulario(formulario, campos) {
    const datos = {};
    campos.forEach((campo) => {
        datos[campo] = formulario.querySelector(`[name="${campo}"]`).value;
    });
    return datos;
}

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
        const { mensaje, payload } = await guardarMiPerfil(leerFormulario(formularioPerfil, CAMPOS_PERFIL));
        completarPerfil(payload);
        mostrarNombre(payload.nombre_completo, payload.rol);   // el nombre nuevo también en el encabezado
        mostrarAviso(mensaje);
    } catch (error) {
        marcarCampos(formularioPerfil, error.campos);
        mostrarAviso(error.message, true);
    }
});

// ↩️ Deshacer cambios: vuelve a poner los últimos datos guardados
botonDeshacer.addEventListener("click", () => {
    marcarCampos(formularioPerfil);
    if (perfilGuardado) completarPerfil(perfilGuardado);
});

// 🔑 Cambiar contraseña
formularioClave.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    marcarCampos(formularioClave);
    avisoClave.hidden = true;

    try {
        const { mensaje } = await cambiarMiClave(leerFormulario(formularioClave, CAMPOS_CLAVE));
        CAMPOS_CLAVE.forEach((campo) => { formularioClave.querySelector(`[name="${campo}"]`).value = ""; });
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
