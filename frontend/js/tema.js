/* ==========================================================================
   MÓDULO: tema.js - Modo claro / oscuro (script común en el <head>)
   Va antes de los estilos para que la página aparezca con el tema elegido.
   Tema oscuro por defecto; el claro se activa con la clase "modo-claro" en <html>.
   ========================================================================== */

const TEMA_KEY = "biblioteca_tema";
const raiz = document.documentElement;

// 1. Aplicar el tema guardado ya mismo
raiz.classList.toggle("modo-claro", localStorage.getItem(TEMA_KEY) === "claro");

// 2. Los switches de "Apariencia" dicen si está activo el modo claro (lectores de pantalla)
function actualizarSwitches() {
    document.querySelectorAll("[data-cambiar-tema]").forEach((boton) => {
        boton.setAttribute("aria-checked", raiz.classList.contains("modo-claro"));
    });
}

// 3. Delegación: clic en cualquier switch de Apariencia → alterna el tema y lo guarda
document.addEventListener("click", (evento) => {
    if (!evento.target.closest("[data-cambiar-tema]")) return;

    const claro = raiz.classList.toggle("modo-claro");
    localStorage.setItem(TEMA_KEY, claro ? "claro" : "oscuro");
    actualizarSwitches();
});

document.addEventListener("DOMContentLoaded", actualizarSwitches);
