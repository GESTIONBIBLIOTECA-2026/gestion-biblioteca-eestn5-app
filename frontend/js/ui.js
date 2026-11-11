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

/* --- Iniciales de un nombre: "Franco Barufaldi" → "FB" --- */
export const iniciales = (nombre) =>
    String(nombre ?? "").split(" ").filter(Boolean).slice(0, 2).map((parte) => parte[0]).join("").toUpperCase();

/* --- Cierre accesible de <dialog> con botones [data-cerrar-dialogo] --- */
export function activarCierreDialogos() {
    document.addEventListener("click", (evento) => {
        evento.target.closest("[data-cerrar-dialogo]")?.closest("dialog")?.close();
    });
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

/* --- Fila de la tabla de préstamos en el panel de inicio --- */
export function crearFilaPrestamoHTML(prestamo) {
    const { nombre_completo, titulo, fecha_prestamo, fecha_devolucion_estimada, fecha_devolucion_real, estado, dias_atraso } = prestamo;
    const atrasado = estado === "vencido" || dias_atraso > 0;
    const etiqueta = estado === "devuelto" ? ["Devuelto", "devuelto"] : atrasado ? ["Atrasado", "atrasado"] : ["En curso", "en-curso"];

    return `
        <tr>
            <td>${escapar(nombre_completo)}</td>
            <td>${escapar(titulo)}</td>
            <td>${fechaCorta(fecha_prestamo)}</td>
            <td>${fechaCorta(fecha_devolucion_real ?? fecha_devolucion_estimada)}</td>
            <td><span class="estado ${etiqueta[1]}">${etiqueta[0]}</span></td>
        </tr>`;
}

// Fila con un mensaje que ocupa toda la tabla (cargando, vacío o error)
export const crearFilaMensajeHTML = (texto, columnas) =>
    `<tr><td colspan="${columnas}" class="celda-mensaje">${escapar(texto)}</td></tr>`;
