/* ==========================================================================
   MÓDULO: usuarios.js - Listado de usuarios (usuarios.html) · Grupo 5
   Búsqueda avanzada + chips + paginación.
   Ventanas: usuarios-dialogos.js (alta, ficha) y usuarios-estado.js (suspender, baja)
   Accesos desde el Inicio: usuarios.html#nuevo-usuario y usuarios.html?filtro=morosos
   ========================================================================== */

import { listarUsuarios } from "./api.js";
import { crearFilaMensajeHTML } from "./ui.js";
import { crearFilaUsuarioHTML } from "./usuarios-ui.js";
import { abrirFormulario, editarUsuario, verFicha, cargarCursos } from "./usuarios-dialogos.js";
import { cambiarEstadoUsuario } from "./usuarios-estado.js";
import { activarMenuAcciones } from "./menu-acciones.js";

// 🎯 1. Nodos del DOM
const formularioBusqueda = document.querySelector("#formularioBusqueda");
const chipsFiltro        = document.querySelector("#chipsFiltro");
const cuerpoUsuarios     = document.querySelector("#cuerpoUsuarios");
const paginaAnterior     = document.querySelector("#paginaAnterior");
const paginaSiguiente    = document.querySelector("#paginaSiguiente");

// 🧠 2. Estado
let filtroActual = new URLSearchParams(location.search).get("filtro") ?? "todos";
let paginaActual = 1;
let usuarios = [];


// 🎨 3. Funciones de UI
function mostrarContadores(c) {
    document.querySelector("#totalUsuarios").textContent = c.todos;
    document.querySelector("#totalHabilitados").textContent = c.todos - c.suspendidos;
    document.querySelector("#totalInactivos").textContent = c.suspendidos + c.bajas;
    document.querySelectorAll("[data-cantidad]").forEach((span) => { span.textContent = c[span.dataset.cantidad]; });
}

function elegirFiltro(filtro) {
    filtroActual = filtro;
    paginaActual = 1;
    chipsFiltro.querySelectorAll(".chip").forEach((chip) => chip.classList.toggle("activo", chip.dataset.filtro === filtro));
}

// 🌐 4. Carga de datos (Loading → Éxito → Error)
async function cargarUsuarios() {
    cuerpoUsuarios.innerHTML = crearFilaMensajeHTML("Cargando usuarios...", 7);

    try {
        const busqueda = Object.fromEntries(new FormData(formularioBusqueda));
        const { payload } = await listarUsuarios({ ...busqueda, filtro: filtroActual, pagina: paginaActual });

        ({ usuarios, pagina: paginaActual } = payload);
        cuerpoUsuarios.innerHTML = usuarios.length === 0
            ? crearFilaMensajeHTML("No se encontraron usuarios.", 7)
            : usuarios.map(crearFilaUsuarioHTML).join("");

        mostrarContadores(payload.contadores);
        document.querySelector("#textoPaginacion").textContent = `Página ${payload.pagina} de ${payload.total_paginas}`;
        paginaAnterior.disabled = payload.pagina <= 1;
        paginaSiguiente.disabled = payload.pagina >= payload.total_paginas;

    } catch (error) {
        cuerpoUsuarios.innerHTML = crearFilaMensajeHTML(error.status ? error.message : "No hay conexión con el servidor.", 7);
    }
}

// 🖱️ 5. Eventos
formularioBusqueda.addEventListener("submit", (evento) => { evento.preventDefault(); paginaActual = 1; cargarUsuarios(); });
formularioBusqueda.addEventListener("reset", () => { elegirFiltro("todos"); setTimeout(cargarUsuarios); });
chipsFiltro.addEventListener("click", (evento) => {
    const chip = evento.target.closest("[data-filtro]");
    if (chip) { elegirFiltro(chip.dataset.filtro); cargarUsuarios(); }
});
paginaAnterior.addEventListener("click", () => { paginaActual--; cargarUsuarios(); });
paginaSiguiente.addEventListener("click", () => { paginaActual++; cargarUsuarios(); });
document.querySelector("#botonNuevoUsuario").addEventListener("click", () => abrirFormulario());
document.addEventListener("usuarios-actualizados", cargarUsuarios);

// Menú "Acciones" de cada fila: qué hace cada opción con el usuario elegido
activarMenuAcciones((id) => usuarios.find((u) => u.id === id), {
    ver: (usuario) => verFicha(usuario.id),
    editar: (usuario) => editarUsuario(usuario.id),
    suspender: (usuario) => cambiarEstadoUsuario(usuario, "suspendido"),
    baja: (usuario) => cambiarEstadoUsuario(usuario, "baja"),
    habilitar: (usuario) => cambiarEstadoUsuario(usuario, "habilitado")
});


// 🚀 6. Inicialización
elegirFiltro(filtroActual);
cargarCursos();
cargarUsuarios();

if (location.hash === "#nuevo-usuario") {
    history.replaceState(null, "", location.pathname + location.search);   // así al recargar no se vuelve a abrir
    abrirFormulario();
}
