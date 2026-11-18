/* ==========================================================================
   MÓDULO: mis-prestamos-ui.js - Plantillas de "Mis préstamos" · Grupo 4
   Convierte los pedidos y los filtros en HTML. No toca el DOM:
   las usa mis-prestamos.js (y el diálogo para las fechas).
   Estados: pendiente (para retirar) | prestado | vencido | devuelto | cancelado
   ========================================================================== */

import { escapar, fechaCorta } from "./ui.js";
import { textoPlazo, plural } from "./inicio-usuario-ui.js";
import { crearTarjetaLibroHTML } from "./libros-ui.js";


/* --- Cada filtro es una función que decide si el pedido entra (HOF .filter) --- */
export const FILTROS = {
    todos: () => true,
    reservas: (p) => p.estado === "pendiente",
    en_curso: (p) => ["prestado", "vencido"].includes(p.estado),
    devueltos: (p) => p.estado === "devuelto",
    atrasos: (p) => p.estado === "vencido" || p.dias_atraso > 0
};

/* --- Texto cuando el filtro activo no tiene pedidos --- */
export const TEXTOS_VACIOS = {
    todos: "Todavía no pediste libros. Elegí uno en «Pedir un libro» y solicitá el préstamo.",
    reservas: "No tenés reservas pendientes.",
    en_curso: "No tenés libros en tu poder.",
    devueltos: "Todavía no devolviste ningún libro.",
    atrasos: "No tenés préstamos atrasados. ¡Estás al día!"
};

// Los docentes no piden desde la app: sus préstamos se cargan en el mostrador
export const VACIO_DOCENTE = "No tenés préstamos en esta lista. Los préstamos de los docentes se registran en el mostrador de la biblioteca.";

export const NO_HABILITADO = "Tu cuenta no está habilitada para pedir libros en este momento.";

const SIN_LIBROS = "No encontramos libros con esos filtros.";


/* --- Texto sin tildes ni mayúsculas: "Física" encuentra "fisica" --- */
export const normalizar = (texto) => String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();


/* --- Fechas en formato "AAAA-MM-DD" (el que usan los <input type="date">) --- */
const dosDigitos = (numero) => String(numero).padStart(2, "0");

export const hoyISO = () => {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${dosDigitos(hoy.getMonth() + 1)}-${dosDigitos(hoy.getDate())}`;
};

export const sumarDiasISO = (fechaISO, dias) => {
    const [anio, mes, dia] = fechaISO.split("-").map(Number);
    const fecha = new Date(anio, mes - 1, dia + dias);
    return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
};

// Días entre dos fechas "AAAA-MM-DD..." (sin horas, así no se corre de día)
const diasEntre = (desde, hasta) => Math.round(
    (new Date(String(hasta).slice(0, 10)) - new Date(String(desde).slice(0, 10))) / 86400000
);


/* --- Estado del pedido → [texto, clase de color] (texto + color: nunca solo color) --- */
function estadoDe(p) {
    if (p.estado === "pendiente") return ["Para retirar", "reserva"];
    if (p.estado === "cancelado") return ["Cancelado", "devuelto"];
    if (p.estado === "devuelto") return ["Devuelto", "devuelto"];
    if (p.estado === "vencido" || p.dias_atraso > 0) return [textoPlazo(p), "atrasado"];
    return [textoPlazo(p), p.dias_restantes <= 2 ? "aviso" : "en-curso"];
}

/* --- Los días que faltan (o de atraso) a la izquierda de la tarjeta --- */
function bloquePlazo(p) {
    const dias = Number(p.dias_restantes) || 0;
    const numero = Math.abs(dias);
    const unidad = dias < 0 ? "de atraso" : dias === 0 ? "vence hoy" : numero === 1 ? "día" : "días";

    return `<div class="prestamo-plazo"><strong>${numero}</strong><span>${unidad}</span></div>`;
}

/* --- Barra que se va llenando a medida que se acerca la devolución --- */
function barraPlazo(p) {
    const desde = p.fecha_entrega ?? p.fecha_pedido;
    const total = Math.max(diasEntre(desde, p.fecha_devolucion_estimada), 1);
    const avance = Math.min(100, Math.max(4, Math.round(((total - p.dias_restantes) / total) * 100)));

    return `<div class="barra-plazo"><span style="width: ${avance}%"></span></div>`;
}

/* --- Una línea con las fechas que importan según el estado --- */
function detallePedido(p) {
    const cantidad = p.cantidad > 1 ? ` · ${plural(p.cantidad, "ejemplar")}` : "";

    if (p.estado === "pendiente") {
        return `Pedido el <b>${fechaCorta(p.fecha_pedido)}</b> · Retiralo en el mostrador${cantidad}`;
    }
    if (p.estado === "prestado" || p.estado === "vencido") {
        return `Retirado el <b>${fechaCorta(p.fecha_entrega)}</b> · Devolver hasta el <b>${fechaCorta(p.fecha_devolucion_estimada)}</b>${cantidad}`;
    }
    if (p.estado === "devuelto") {
        const atraso = p.dias_atraso > 0 ? ` · <b>${plural(p.dias_atraso, "día")} de atraso</b>` : "";
        return `Retirado el <b>${fechaCorta(p.fecha_entrega)}</b> · Devuelto el <b>${fechaCorta(p.fecha_devolucion_real)}</b>${atraso}${cantidad}`;
    }
    return `Pedido el <b>${fechaCorta(p.fecha_pedido)}</b> · Reserva cancelada${cantidad}`;
}

/* --- Una fila de "Mis pedidos y préstamos" --- */
export function crearPedidoHTML(p) {
    const [texto, clase] = estadoDe(p);
    const enCurso = FILTROS.en_curso(p);
    const pendiente = p.estado === "pendiente";

    const plazo = enCurso
        ? bloquePlazo(p)
        : `<div class="prestamo-plazo"><i data-lucide="${pendiente ? "bookmark" : p.estado === "devuelto" ? "check" : "x"}"></i></div>`;

    const cantidad = p.cantidad > 1 ? `<span class="mp-cantidad">${p.cantidad} ejemplares</span>` : "";

    return `
        <li class="prestamo ${clase}">
            ${plazo}
            <div class="prestamo-info">
                <strong>${escapar(p.titulo)}${cantidad}</strong>
                <span>${detallePedido(p)}</span>
                ${enCurso ? barraPlazo(p) : ""}
            </div>
            <em class="estado ${clase}">${escapar(texto)}</em>
        </li>`;
}


/* --- Orden: primero lo pendiente, después lo que está en tu poder y al final el historial --- */
const GRUPO_ESTADO = { pendiente: 0, vencido: 1, prestado: 1, devuelto: 2, cancelado: 2 };

export function ordenarPedidos(lista) {
    return [...lista].sort((a, b) => {
        const grupoA = GRUPO_ESTADO[a.estado] ?? 3;
        const grupoB = GRUPO_ESTADO[b.estado] ?? 3;
        if (grupoA !== grupoB) return grupoA - grupoB;

        if (grupoA === 1) return (a.dias_restantes ?? 0) - (b.dias_restantes ?? 0);
        if (grupoA === 0) return String(a.fecha_pedido).localeCompare(String(b.fecha_pedido));
        return String(b.fecha_pedido).localeCompare(String(a.fecha_pedido));
    });
}


/* --- Toda la lista, o el mensaje de "no hay nada con este filtro" --- */
export function crearListaPedidosHTML(pedidos, filtro, esAlumno) {
    if (!pedidos.length) {
        return `<li class="lista-vacia">${esAlumno ? TEXTOS_VACIOS[filtro] : VACIO_DOCENTE}</li>`;
    }

    return pedidos.map(crearPedidoHTML).join("");
}


/* --- Tarjetas del catálogo: búsqueda por título/autor + categoría + "solo con stock" --- */
export function filtrarLibros(libros, { texto, categoria, disponibles }) {
    const buscado = normalizar(texto);
    const idCategoria = Number(categoria ?? 0);

    return libros.filter((libro) => {
        const textoLibro = normalizar(`${libro.titulo} ${libro.autores ?? ""}`);
        const coincideTexto = !buscado || textoLibro.includes(buscado);
        const coincideCategoria = !idCategoria || libro.categoria_id === idCategoria;
        const coincideStock = !disponibles || libro.stock_reservable > 0;
        return coincideTexto && coincideCategoria && coincideStock;
    });
}

/* --- Tarjetas del catálogo, o el aviso de "sin resultados" --- */
export function crearCatalogoHTML(libros) {
    if (!libros.length) return `<p class="panel-vacio">${SIN_LIBROS}</p>`;
    return libros.map(crearTarjetaLibroHTML).join("");
}
