/* ==========================================================================
   MÓDULO: mis-prestamos-dialogo.js - Pedir un libro (mis-prestamos.html) · Grupo 4
   El <dialog> de confirmación: cantidad, fecha estimada y envío del pedido.
   El pedido queda en estado "pendiente": la biblioteca lo confirma después
   y recién ahí reserva el ejemplar.
   ========================================================================== */

import { solicitarReserva } from "./api.js";
import { mostrarAviso } from "./ui.js";
import { hoyISO, sumarDiasISO, NO_HABILITADO } from "./mis-prestamos-ui.js";

const $ = (selector) => document.querySelector(selector);


/**
 * Prepara el diálogo y devuelve { abrir }.
 * alConfirmar: se llama después de que el backend acepta el pedido (para recargar).
 */
export function crearDialogoPedido({ alConfirmar }) {

    // 🎯 Nodos del DOM
    const dialogo = $("#dialogoPedido");
    const formulario = $("#formularioPedido");
    const campoLibroId = $("#pedidoLibroId");
    const campoTitulo = $("#pedidoTitulo");
    const campoCantidad = $("#pedidoCantidad");
    const campoStock = $("#pedidoStock");
    const campoFecha = $("#pedidoFecha");
    const cajaError = $("#errorPedido");
    const btnConfirmar = $("#btnConfirmarPedido");

    // 🧠 Estado del diálogo
    let libroSeleccionado = null;


    /* --- Mensajes de error del formulario --- */
    function mostrarError(mensaje) {
        cajaError.textContent = mensaje;
        cajaError.hidden = false;
    }

    function limpiarError() {
        cajaError.hidden = true;
    }

    function errorStock() {
        return `Solo hay ${libroSeleccionado.stock_reservable} ejemplar(es) disponible(s).`;
    }


    /* --- Abrir con los datos del libro elegido --- */
    function abrir(libro) {
        if (!libro || libro.stock_reservable < 1) {
            mostrarAviso(NO_HABILITADO, true);
            return;
        }

        libroSeleccionado = libro;

        campoLibroId.value = libro.id;
        campoTitulo.value = libro.titulo;
        campoStock.textContent = `${libro.stock_reservable} ejemplar(es) disponible(s) para reservar`;

        campoCantidad.max = libro.stock_reservable;
        campoCantidad.value = 1;

        const hoy = hoyISO();
        campoFecha.min = hoy;
        campoFecha.value = sumarDiasISO(hoy, 7);

        limpiarError();
        dialogo.showModal();
        window.lucide?.createIcons();

        campoCantidad.focus();
        campoCantidad.select();
    }


    /* --- Cerrar (con la cruz, "Cancelar", Escape o clic afuera) --- */
    function cerrar() {
        if (dialogo.open) dialogo.close();
        libroSeleccionado = null;
    }


    /* --- Enviar el pedido al backend --- */
    async function enviar(evento) {
        evento.preventDefault();

        const libro = libroSeleccionado;
        if (!libro) return;

        const cantidad = Number(campoCantidad.value);
        const fecha = campoFecha.value;

        if (!Number.isInteger(cantidad) || cantidad < 1) {
            return mostrarError("Ingresá una cantidad válida.");
        }
        if (cantidad > libro.stock_reservable) {
            return mostrarError(errorStock());
        }
        if (!fecha || fecha < hoyISO()) {
            return mostrarError("Elegí una fecha de devolución de hoy en adelante.");
        }

        const textoOriginal = btnConfirmar.innerHTML;
        btnConfirmar.disabled = true;
        btnConfirmar.textContent = "Enviando...";
        limpiarError();

        try {
            const respuesta = await solicitarReserva({ libroId: libro.id, cantidad, fechaDevolucion: fecha });

            cerrar();
            mostrarAviso(respuesta.mensaje || "Pedido enviado. Queda pendiente de confirmación.");
            await alConfirmar();
        } catch (error) {
            mostrarError(error.message || "No se pudo enviar el pedido.");
        } finally {
            btnConfirmar.disabled = false;
            btnConfirmar.innerHTML = textoOriginal;
            window.lucide?.createIcons();
        }
    }


    /* --- Eventos del diálogo --- */
    formulario.addEventListener("submit", enviar);
    $("#btnCerrarDialogoPedido").addEventListener("click", cerrar);
    $("#btnCancelarDialogoPedido").addEventListener("click", cerrar);

    // Clic en el fondo oscuro (fuera de la tarjeta)
    dialogo.addEventListener("click", (evento) => {
        if (evento.target === dialogo) cerrar();
    });

    dialogo.addEventListener("close", () => {
        libroSeleccionado = null;
        limpiarError();
    });

    // Aviso en vivo si se pasa del stock
    campoCantidad.addEventListener("input", () => {
        if (!libroSeleccionado) return;

        const cantidad = Number(campoCantidad.value);
        if (Number.isInteger(cantidad) && cantidad > libroSeleccionado.stock_reservable) {
            mostrarError(errorStock());
        } else {
            limpiarError();
        }
    });

    return { abrir };
}
