/* ==========================================================================
   MÓDULO: pedidos.js - Mesa de Entrada y Préstamos (pedidos.html) · Grupo 4
   - Listar pedidos y reservas ... GET   /api/prestamos?estado=&busqueda=
   - Confirmar entrega física .... PATCH /api/prestamos/:id/estado (prestado)
   - Registrar devolución ........ PATCH /api/prestamos/:id/estado (devuelto)
   - Cancelar reserva ............ PATCH /api/prestamos/:id/estado (cancelado)
   - Control de vencimientos ..... POST  /api/prestamos/actualizar-vencidos
   ========================================================================== */

import { listarPrestamos, cambiarEstadoPedido, actualizarVencidos } from "./api.js";
import { escapar, fechaCorta, mostrarAviso, crearFilaMensajeHTML } from "./ui.js";

// 🎯 1. Nodos del DOM
const cuerpoTabla = document.querySelector("#cuerpoTablaPedidos");
const inputBuscar = document.querySelector("#inputBuscarPedidos");
const tabsEstado = document.querySelectorAll(".tab-estado");
const cntPendientes = document.querySelector("#cntPendientes");
const cntPrestados = document.querySelector("#cntPrestados");
const cntVencidos = document.querySelector("#cntVencidos");
const btnActualizarVencidos = document.querySelector("#btnActualizarVencidos");

// 🧠 2. Estado
let estadoActivo = "pendiente";
let pedidos = [];

const ESTILOS_ESTADO = {
    pendiente: ["Para retirar", "reserva"],
    prestado: ["En préstamo", "en-curso"],
    devuelto: ["Devuelto", "devuelto"],
    vencido: ["Vencido / Mora", "atrasado"],
    cancelado: ["Cancelado", "devuelto"]
};

// 🎨 3. Funciones de UI
function crearFilaPedidoHTML(p) {
    const [etiqueta, clase] = ESTILOS_ESTADO[p.estado] || [p.estado, "neutro"];
    const fechaEstimada = fechaCorta(p.fecha_devolucion_estimada);
    const fechaPedido = fechaCorta(p.fecha_pedido);

    let accionesHTML = `<span class="texto-mutado">Finalizado</span>`;

    if (p.estado === "pendiente") {
        accionesHTML = `
            <div class="acciones-mostrador">
                <button type="button" class="boton-accion-mostrador boton-entregar" data-accion="entregar" data-id="${p.id}" data-titulo="${escapar(p.titulo)}" title="Entregar libro al alumno">
                    <i data-lucide="check-circle"></i>
                    <span>Confirmar entrega</span>
                </button>
                <button type="button" class="boton-accion-mostrador boton-cancelar" data-accion="cancelar" data-id="${p.id}" title="Cancelar pedido">
                    <i data-lucide="x-circle"></i>
                    <span>Cancelar</span>
                </button>
            </div>
        `;
    } else if (p.estado === "prestado" || p.estado === "vencido") {
        accionesHTML = `
            <div class="acciones-mostrador">
                <button type="button" class="boton-accion-mostrador boton-devolver" data-accion="devolver" data-id="${p.id}" data-titulo="${escapar(p.titulo)}" title="Registrar reingreso físico al inventario">
                    <i data-lucide="book-down"></i>
                    <span>Registrar devolución</span>
                </button>
            </div>
        `;
    }

    return `
        <tr>
            <td><strong>#${p.id}</strong></td>
            <td>
                <div class="pedido-alumno">
                    <strong>${escapar(p.nombre_completo)}</strong>
                    <small>DNI ${Number(p.dni).toLocaleString("es-AR")}</small>
                </div>
            </td>
            <td>
                <div class="pedido-libro">
                    <strong>${escapar(p.titulo)}</strong>
                    <small>${p.cantidad > 1 ? `${p.cantidad} ejemplares` : "1 ejemplar"}</small>
                </div>
            </td>
            <td>${fechaPedido}</td>
            <td>${fechaEstimada}</td>
            <td><span class="estado ${clase}">${etiqueta}</span></td>
            <td>${accionesHTML}</td>
        </tr>
    `;
}

function actualizarContadores(lista) {
    if (cntPendientes) cntPendientes.textContent = lista.filter((p) => p.estado === "pendiente").length;
    if (cntPrestados) cntPrestados.textContent = lista.filter((p) => p.estado === "prestado").length;
    if (cntVencidos) cntVencidos.textContent = lista.filter((p) => p.estado === "vencido").length;
}

function renderizarTabla() {
    const textoBuscado = (inputBuscar?.value || "").trim().toLowerCase();

    const filtrados = pedidos.filter((p) => {
        const coincideEstado = estadoActivo === "todos" || p.estado === estadoActivo;
        const coincideTexto = !textoBuscado ||
            String(p.nombre_completo || "").toLowerCase().includes(textoBuscado) ||
            String(p.dni || "").includes(textoBuscado) ||
            String(p.titulo || "").toLowerCase().includes(textoBuscado);
        return coincideEstado && coincideTexto;
    });

    cuerpoTabla.innerHTML = filtrados.length
        ? filtrados.map(crearFilaPedidoHTML).join("")
        : crearFilaMensajeHTML(pedidos.length ? "No hay registros con ese filtro." : "No hay pedidos en esta sección.", 7);

    window.lucide?.createIcons();
}

// 🌐 4. Carga de datos
async function cargarMesaDeEntrada() {
    cuerpoTabla.innerHTML = crearFilaMensajeHTML("Cargando registros de mesa de entrada...", 7);
    try {
        const respuesta = await listarPrestamos();
        pedidos = respuesta.payload || [];
        actualizarContadores(pedidos);
        renderizarTabla();
    } catch (error) {
        cuerpoTabla.innerHTML = crearFilaMensajeHTML(error.message || "Error al cargar pedidos.", 7);
    }
}

// 🖱️ 5. Eventos
tabsEstado.forEach((tab) => {
    tab.addEventListener("click", () => {
        tabsEstado.forEach((t) => {
            t.classList.remove("activo");
            t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("activo");
        tab.setAttribute("aria-selected", "true");
        estadoActivo = tab.dataset.estado;
        renderizarTabla();
    });
});

inputBuscar?.addEventListener("input", renderizarTabla);

btnActualizarVencidos?.addEventListener("click", async () => {
    btnActualizarVencidos.disabled = true;
    try {
        const res = await actualizarVencidos();
        mostrarAviso(res.mensaje || "Control de vencimientos realizado.");
        await cargarMesaDeEntrada();
    } catch (error) {
        mostrarAviso(error.message || "No se pudo actualizar vencimientos.", true);
    } finally {
        btnActualizarVencidos.disabled = false;
    }
});

// Delegación de eventos en las acciones de la tabla
cuerpoTabla.addEventListener("click", async (evento) => {
    const boton = evento.target.closest("[data-accion]");
    if (!boton) return;

    const id = Number(boton.dataset.id);
    const accion = boton.dataset.accion;
    const titulo = boton.dataset.titulo || "el libro";

    if (!id || !accion) return;

    boton.disabled = true;

    try {
        if (accion === "entregar") {
            const res = await cambiarEstadoPedido(id, "prestado");
            mostrarAviso(res.mensaje || `¡Entrega confirmada! «${titulo}» pasa a estar en préstamo.`);
        } else if (accion === "devolver") {
            const res = await cambiarEstadoPedido(id, "devuelto");
            mostrarAviso(res.mensaje || `¡Devolución registrada! «${titulo}» reingresó al stock.`);
        } else if (accion === "cancelar") {
            const res = await cambiarEstadoPedido(id, "cancelado");
            mostrarAviso(res.mensaje || "Reserva cancelada correctamente.");
        }
        await cargarMesaDeEntrada();
    } catch (error) {
        mostrarAviso(error.message || "No se pudo realizar la acción.", true);
    } finally {
        boton.disabled = false;
    }
});

// 🚀 6. Inicialización
cargarMesaDeEntrada();

