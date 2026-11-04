/* ==========================================================================
   MÓDULO: inicio-usuario-ui.js - Plantillas HTML del inicio de alumnos y docentes
   Plazos y estados de los préstamos, números de la cuenta, devoluciones,
   reservas e historial. (Credencial, aviso y sanciones: cuenta-usuario.js)
   ========================================================================== */

import { escapar, fechaCorta } from "./ui.js";

export const plural = (n, palabra) => `${n} ${palabra}${n === 1 ? "" : "s"}`;

// Días entre dos fechas "AAAA-MM-DD..." (sin horas, así no se corre de día)
const diasEntre = (desde, hasta) => Math.round((new Date(hasta.slice(0, 10)) - new Date(desde.slice(0, 10))) / 86400000);

/* --- Plazo de un préstamo en curso: "Vence hoy", "Faltan 3 días", "Vencido hace 2 días" --- */
export function textoPlazo({ dias_restantes: dias }) {
    if (dias < 0) return `Vencido hace ${plural(-dias, "día")}`;
    if (dias === 0) return "Vence hoy";
    if (dias === 1) return "Vence mañana";
    return `Faltan ${plural(dias, "día")}`;
}

/* --- Estado de cualquier préstamo del historial → [texto, clase] --- */
export function estadoPrestamo(p) {
    if (p.estado === "pendiente") return ["Para retirar", "reserva"];
    if (p.estado === "cancelado") return ["Cancelado", "devuelto"];
    if (p.estado === "devuelto") return p.dias_atraso > 0 ? [`Devuelto con ${plural(p.dias_atraso, "día")} de atraso`, "aviso"] : ["Devuelto", "devuelto"];
    if (p.dias_atraso > 0) return [textoPlazo(p), "atrasado"];
    return [textoPlazo(p), p.dias_restantes <= 2 ? "aviso" : "en-curso"];
}

/* --- Las 4 tarjetas con números de la cuenta --- */
export function crearMetricasHTML({ activos, vencidos, reservas, proximo }) {
    const enPoder = activos.reduce((total, p) => total + p.cantidad, 0);   // un docente puede tener 10 de un mismo libro
    const plazo = !proximo ? "—" : proximo.dias_restantes === 0 ? "Hoy" : proximo.dias_restantes === 1 ? "Mañana" : plural(proximo.dias_restantes, "día");

    const tarjetas = [
        ["book-open-check", "Libros en tu poder", enPoder,
            activos.length ? `${plural(activos.length, "préstamo")} en curso` : "No tenés libros prestados", ""],
        ["calendar-clock", "Próxima devolución", plazo,
            proximo ? `${escapar(proximo.titulo)} · ${fechaCorta(proximo.fecha_devolucion_estimada)}` : "Sin vencimientos cercanos",
            proximo?.dias_restantes <= 2 ? "aviso" : ""],
        ["alert-triangle", "Préstamos vencidos", vencidos.length,
            vencidos.length ? "Devolvelos cuanto antes" : "Estás al día", vencidos.length ? "atrasado" : "en-curso"],
        ["bookmark", "Reservas para retirar", reservas.length,
            reservas.length ? "Te esperan en la biblioteca" : "No tenés reservas", ""]
    ];

    return tarjetas.map(([icono, titulo, valor, detalle, tono]) => `
        <article class="metrica ${tono}">
            <span class="metrica-icono"><i data-lucide="${icono}"></i></span>
            <h3>${titulo}</h3>
            <strong>${valor}</strong>
            <p>${detalle}</p>
        </article>`).join("");
}

/* --- Un préstamo en mi poder, con cuenta regresiva y barra del plazo --- */
export function crearDevolucionHTML(p) {
    const [texto, clase] = estadoPrestamo(p);
    const desde = p.fecha_entrega ?? p.fecha_pedido;
    const total = Math.max(diasEntre(desde, p.fecha_devolucion_estimada), 1);
    const avance = Math.min(100, Math.max(4, Math.round(((total - p.dias_restantes) / total) * 100)));
    const numero = p.dias_restantes < 0 ? -p.dias_restantes : p.dias_restantes;
    const unidad = p.dias_restantes < 0 ? "de atraso" : p.dias_restantes === 0 ? "vence hoy" : numero === 1 ? "día" : "días";

    return `
        <li class="prestamo ${clase}">
            <div class="prestamo-plazo"><strong>${numero}</strong><span>${unidad}</span></div>
            <div class="prestamo-info">
                <strong>${escapar(p.titulo)}</strong>
                <span>Retirado el ${fechaCorta(desde)} · devolver hasta el ${fechaCorta(p.fecha_devolucion_estimada)}${p.cantidad > 1 ? ` · <b>${p.cantidad} ejemplares</b>` : ""}</span>
                <div class="barra-plazo"><span style="width: ${avance}%"></span></div>
            </div>
            <em class="estado ${clase}">${texto}</em>
        </li>`;
}

/* --- Una reserva pendiente de retiro --- */
export const crearReservaHTML = (p) => `
    <li class="prestamo reserva">
        <div class="prestamo-plazo"><i data-lucide="bookmark"></i></div>
        <div class="prestamo-info">
            <strong>${escapar(p.titulo)}</strong>
            <span>Pedido el ${fechaCorta(p.fecha_pedido)}${p.cantidad > 1 ? ` · <b>${p.cantidad} ejemplares</b>` : ""} · retiralo en el mostrador</span>
        </div>
        <em class="estado reserva">Para retirar</em>
    </li>`;

/* --- Fila del historial --- */
export function crearFilaHistorialHTML(p) {
    const [texto, clase] = estadoPrestamo(p);
    return `
        <tr>
            <td><strong>${escapar(p.titulo)}</strong>${p.cantidad > 1 ? `<small class="cantidad">${p.cantidad} ejemplares</small>` : ""}</td>
            <td>${fechaCorta(p.fecha_entrega)}</td>
            <td>${fechaCorta(p.fecha_devolucion_estimada)}</td>
            <td>${fechaCorta(p.fecha_devolucion_real)}</td>
            <td><span class="estado ${clase}">${texto}</span></td>
        </tr>`;
}
