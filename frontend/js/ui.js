/* ==========================================================================
   MÓDULO: ui.js - Formato de datos y plantillas HTML (Template Literals)
   Las páginas importan de acá lo que necesitan dibujar.
   ========================================================================== */

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];


/* --- Seguridad: los datos que se meten con innerHTML se escapan (evita XSS) --- */
export function escapar(texto) {
    return String(texto ?? "")
        .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}


/* --- Fechas: "2026-09-30 18:40:00" → "30 sep 2026"  (null → "—") --- */
export function fechaCorta(texto) {
    if (!texto) return "—";
    const [anio, mes, dia] = texto.slice(0, 10).split("-").map(Number);
    return `${dia} ${MESES[mes - 1]} ${anio}`;
}

/* --- Hoy en texto largo: "Jueves, 15 de octubre de 2026" --- */
export function fechaDeHoy() {
    const texto = new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/* --- Aviso flotante abajo a la derecha (#avisoFlotante) --- */
let temporizador;

export function mostrarAviso(texto, esError = false) {
    const aviso = document.querySelector("#avisoFlotante");

    aviso.textContent = texto;
    aviso.classList.toggle("error", esError);
    aviso.classList.toggle("exito", !esError);
    aviso.hidden = false;

    clearTimeout(temporizador);
    temporizador = setTimeout(() => { aviso.hidden = true; }, 4000);
}


/* --- Formularios: marca los campos con error que manda el backend { campo: "mensaje" } --- */
export function marcarCampos(formulario, campos = {}) {
    formulario.querySelectorAll("[data-pista]").forEach((pista) => {
        const mensaje = campos[pista.dataset.pista] ?? "";
        pista.textContent = mensaje;
        pista.classList.toggle("error", Boolean(mensaje));
    });
}


/* ==========================================================================
   PLANTILLAS HTML GENERALES
   ========================================================================== */

// Fila con un mensaje que ocupa toda la tabla (cargando, vacío o error)
export const crearFilaMensajeHTML = (texto, columnas) =>
    `<tr><td colspan="${columnas}" class="celda-mensaje">${escapar(texto)}</td></tr>`;
