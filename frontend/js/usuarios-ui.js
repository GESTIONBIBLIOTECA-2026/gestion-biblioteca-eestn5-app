/* ==========================================================================
   MÓDULO: usuarios-ui.js - Plantillas HTML de la gestión de usuarios
   Fila de la tabla, opciones del menú "Acciones" y ficha con el historial activo.
   ========================================================================== */

import { escapar, fechaCorta, iniciales } from "./ui.js";

// Condición del usuario → texto y clase CSS de la etiqueta
const CONDICIONES = {
    habilitado: ["Habilitado", "activo"],
    atraso: ["Con atraso", "inactivo"],
    suspendido: ["Suspendido", "inactivo"],
    baja: ["De baja", "inactivo"]
};

// Estado de un préstamo del historial → [texto, clase]
function estadoPrestamo({ estado, dias_atraso }) {
    if (estado === "devuelto") return dias_atraso > 0 ? [`Devuelto con ${dias_atraso} día(s) de atraso`, "atraso"] : ["Devuelto", "ok"];
    if (dias_atraso > 0) return [`Atrasado ${dias_atraso} día(s)`, "atraso"];
    if (estado === "pendiente") return ["Reserva pendiente", "neutro"];
    if (estado === "cancelado") return ["Cancelado", "neutro"];
    return ["En curso", "curso"];
}

// Un ítem de las listas de la ficha (préstamo o sanción)
const crearItemHTML = (titulo, detalle, [texto, clase]) => `
    <li>
        <div><strong>${escapar(titulo)}</strong><span>${detalle}</span></div>
        <em class="etiqueta-movimiento ${clase}">${texto}</em>
    </li>`;


// Fila de la tabla de usuarios (la dirección se ve en la ficha)
export function crearFilaUsuarioHTML({ id, nombre_completo, correo, dni, curso, telefono, rol, condicion }) {
    const [texto, clase] = CONDICIONES[condicion];
    return `
        <tr>
            <td>
                <div class="usuario-identidad">
                    <span class="usuario-avatar">${escapar(iniciales(nombre_completo))}</span>
                    <div><strong>${escapar(nombre_completo)}</strong><small>${escapar(correo)}</small></div>
                </div>
            </td>
            <td>${escapar(dni)}</td>
            <td>${escapar(curso ?? "—")}</td>
            <td>${escapar(telefono)}</td>
            <td>${escapar(rol)}</td>
            <td><span class="estado-usuario ${clase}">${texto}</span></td>
            <td><button type="button" class="boton-acciones" data-abrir-acciones="${id}" aria-haspopup="menu">Acciones</button></td>
        </tr>`;
}


// Opciones del menú "Acciones" según la condición del usuario
export function crearOpcionesAccionesHTML({ id, condicion }) {
    const opciones = [["Ver ficha", "ver"], ["Editar", "editar"]];

    if (condicion === "baja") opciones.push(["Reactivar", "habilitar"]);
    else if (condicion === "suspendido") opciones.push(["Reactivar", "habilitar"], ["Dar de baja", "baja", "peligro"]);
    else opciones.push(["Suspender", "suspender"], ["Dar de baja", "baja", "peligro"]);

    return opciones.map(([texto, accion, clase = ""]) =>
        `<button type="button" role="menuitem" class="menu-acciones-opcion ${clase}" data-accion="${accion}" data-id="${id}">${texto}</button>`
    ).join("");
}


// Ficha del usuario: datos + historial activo (entregas, devoluciones, atrasos y sanciones)
export function crearFichaHTML({ usuario, resumen, prestamos, sanciones }) {

    const datos = [
        ["Correo", usuario.correo], ["Teléfono", usuario.telefono],
        ["Curso", usuario.curso ?? "—"], ["Condición", CONDICIONES[usuario.condicion][0]],
        ["Dirección", usuario.direccion, "completo"], ["Fecha de alta", fechaCorta(usuario.fecha_alta)]
    ].map(([etiqueta, valor, clase = ""]) => `<div class="${clase}"><dt>${etiqueta}</dt><dd>${escapar(valor)}</dd></div>`);

    const numeros = { Entregas: resumen.entregas, Devoluciones: resumen.devoluciones, Atrasos: resumen.atrasos, "En curso": resumen.en_curso };

    const listaPrestamos = prestamos.map((p) => crearItemHTML(p.titulo,
        `${fechaCorta(p.fecha_entrega ?? p.fecha_pedido)} · ${p.fecha_devolucion_real
            ? `devuelto el ${fechaCorta(p.fecha_devolucion_real)}` : `vence el ${fechaCorta(p.fecha_devolucion_estimada)}`}`,
        estadoPrestamo(p))).join("");

    const listaSanciones = sanciones.map((s) => crearItemHTML(s.motivo || s.tipo,
        `Desde ${fechaCorta(s.fecha_inicio)}${s.fecha_fin ? ` hasta ${fechaCorta(s.fecha_fin)}` : ""} · ${escapar(s.aplicada_por ?? "")}`,
        s.en_vigor ? ["En vigor", "atraso"] : ["Levantada", "neutro"])).join("");

    return `
        <dl class="ficha-datos">${datos.join("")}</dl>
        <section class="ficha-historial">
            <h3>Historial activo</h3>
            <div class="ficha-resumen">
                ${Object.entries(numeros).map(([etiqueta, n]) => `<div><strong>${n}</strong><span>${etiqueta}</span></div>`).join("")}
            </div>
            ${listaPrestamos ? `<ul class="ficha-movimientos">${listaPrestamos}</ul>` : `<p class="historial-vacio">Todavía no tiene préstamos registrados.</p>`}
            ${listaSanciones ? `<h3>Sanciones</h3><ul class="ficha-movimientos">${listaSanciones}</ul>` : ""}
        </section>`;
}
