/* ==========================================================================
   MÓDULO: login.js - Pantalla de Inicio de Sesión (index.html)
   Solo entran alumnos y docentes: si entra un administrador, el backend
   responde 403 y se muestra su mensaje.
   ========================================================================== */

import { iniciarSesion, obtenerSesionActual } from "./api.js";
import { guardarSesion, obtenerToken } from "./storage.js";

// Página a la que va el alumno o docente después de entrar
const PAGINA_INICIO = "inicio-usuario.html";


// 🎯 1. Nodos del DOM
const formulario    = document.querySelector("#formularioLogin");
const campoDni      = document.querySelector("#dni");
const campoClave    = document.querySelector("#clave");
const botonLogin    = document.querySelector("#botonLogin");
const botonVerClave = document.querySelector("#botonVerClave");
const alerta        = document.querySelector("#alertaLogin");
const textoAlerta   = document.querySelector("#textoAlerta");


// 🎨 2. Funciones de UI
function mostrarError(mensaje) {
    textoAlerta.textContent = mensaje;
    alerta.hidden = false;
}


// 🌐 3. Si ya hay una sesión válida, va directo a su inicio
async function revisarSesion() {
    if (!obtenerToken()) return;

    try {
        const sesion = await obtenerSesionActual();
        const destino = sesion.payload?.rol === "administrador" ? "usuarios.html" : PAGINA_INICIO;
        window.location.replace(destino);
    } catch (error) {
        // Token vencido o servidor apagado: se queda en el login
    }
}


// 🖱️ 4. Eventos

// 👁️ Mostrar / ocultar contraseña
botonVerClave.addEventListener("click", () => {
    const oculta = campoClave.type === "password";
    campoClave.type = oculta ? "text" : "password";
    botonVerClave.setAttribute("aria-label", oculta ? "Ocultar contraseña" : "Mostrar contraseña");
});

// 🔑 Enviar el formulario
formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    alerta.hidden = true;

    if (!campoDni.value.trim() || !campoClave.value) {
        return mostrarError("Completá el DNI y la contraseña.");
    }

    botonLogin.disabled = true;

    try {
        // POST /api/auth/login → { token, usuario }
        const { payload } = await iniciarSesion(campoDni.value.trim(), campoClave.value);
        guardarSesion(payload);
        const destino = payload?.usuario?.rol === "administrador" ? "usuarios.html" : PAGINA_INICIO;
        window.location.href = destino;

    } catch (error) {
        // Sin status = error de red (el backend está apagado)
        mostrarError(error.status ? error.message : "No hay conexión con el servidor. Probá de nuevo.");
        campoClave.value = "";
        campoClave.focus();

    } finally {
        botonLogin.disabled = false;
    }
});


// 🚀 5. Inicialización
revisarSesion();
