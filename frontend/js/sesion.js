/* ==========================================================================
   MÓDULO: sesion.js - Protege las páginas y maneja el encabezado
   - Sin sesión válida → index.html (login)
   - Nombre y rol de quien inició sesión (alumno o docente), fecha y hora
   - Menú del perfil (Ajustes, Apariencia y Cerrar sesión)
   Se incluye en cada página protegida: <script type="module" src="js/sesion.js">
   ========================================================================== */

import { obtenerSesionActual } from "./api.js";
import { obtenerToken, borrarSesion } from "./storage.js";
import { fechaDeHoy } from "./ui.js";


// 🎯 1. Nodos del DOM
const textoFecha  = document.querySelector("[data-fecha-hoy]");
const textoReloj  = document.querySelector("#reloj-actual");
const botonPerfil = document.querySelector("[data-abrir-menu-perfil]");
const menuPerfil  = document.querySelector("#menuPerfil");


// 🎨 2. Funciones de UI
const irAlLogin = () => window.location.replace("index.html");

// Nombre (y rol) en todos los lugares del encabezado. También la usa Configuración.
export function mostrarNombre(nombre, rol = "alumno") {
    document.querySelectorAll("[data-nombre-usuario]").forEach((elemento) => { elemento.textContent = nombre; });
    document.querySelectorAll("[data-rol-usuario]").forEach((elemento) => { elemento.textContent = rol.charAt(0).toUpperCase() + rol.slice(1); });
}

function actualizarReloj() {
    textoFecha.textContent = fechaDeHoy();
    textoReloj.textContent = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

function alternarMenu(abrir) {
    menuPerfil.hidden = !abrir;
    botonPerfil.setAttribute("aria-expanded", abrir);
}


// 🌐 3. Verificar la sesión con el backend (GET /api/auth/perfil)
async function verificarSesion() {
    if (!obtenerToken()) return irAlLogin();

    try {
        const { payload } = await obtenerSesionActual();
        mostrarNombre(payload.nombre, payload.rol);

        // Recién ahora se muestra la página
        document.documentElement.classList.remove("verificando-sesion");
        document.dispatchEvent(new CustomEvent("sesion-verificada"));

    } catch (error) {
        if (error.status === 401) borrarSesion();   // token vencido, inválido o de un administrador
        irAlLogin();
    }
}


// 🖱️ 4. Eventos (delegación en el documento)
document.addEventListener("click", (evento) => {

    // Cerrar sesión
    if (evento.target.closest("[data-cerrar-sesion]")) {
        borrarSesion();
        return irAlLogin();
    }

    // Abrir / cerrar el menú del perfil (clic afuera lo cierra)
    if (evento.target.closest("[data-abrir-menu-perfil]")) return alternarMenu(menuPerfil.hidden);
    if (!evento.target.closest("[data-menu-perfil]")) alternarMenu(false);
});

document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && !menuPerfil.hidden) {
        alternarMenu(false);
        botonPerfil.focus();
    }
});


// 🚀 5. Inicialización
actualizarReloj();
setInterval(actualizarReloj, 30000);
verificarSesion();
