/* ==========================================================================
   MÓDULO: mis-prestamos-render.js - Pintar el estado en la página · Grupo 4
   Recibe el estado (cuenta, pedidos y libros) y los nodos del DOM, y dibuja:
   - Los números de la cuenta y el aviso de la condición
   - El banner de "no podés pedir" y el catálogo con el buscador en vivo
   - La lista de pedidos con sus filtros y contadores
   Las plantillas HTML viven en mis-prestamos-ui.js.
   ========================================================================== */

import { escapar } from "./ui.js";
import { crearMetricasHTML } from "./inicio-usuario-ui.js";
import { mostrarAvisoCuenta } from "./cuenta-usuario.js";
import { FILTROS, ordenarPedidos, crearListaPedidosHTML, crearCatalogoHTML, filtrarLibros } from "./mis-prestamos-ui.js";


export function crearVistas(estado, nodos) {

    // Nodos de la página
    const {
        metricas, banner, bannerTitulo, bannerMensaje, formularioFiltros,
        listaLibros, contadorLibros, filtrosPedidos, listaPedidos, contadorPedidos
    } = nodos;

    // Préstamos en tu poder, del que vence primero al que vence último
    const enCurso = () => estado.prestamos
        .filter(FILTROS.en_curso)
        .sort((a, b) => a.dias_restantes - b.dias_restantes);

    const atrasados = (lista) => lista.filter((p) => p.estado === "vencido" || p.dias_atraso > 0);


    /* --- Números de la cuenta --- */
    function pintarMetricas() {
        const activos = enCurso();

        metricas.innerHTML = crearMetricasHTML({
            activos,
            vencidos: atrasados(activos),
            reservas: estado.prestamos.filter(FILTROS.reservas),
            proximo: activos.find((p) => p.dias_restantes >= 0)
        });
    }


    /* --- Aviso más importante: suspensión, vencidos o vencimiento cercano --- */
    function pintarAviso() {
        if (!estado.usuario) return;

        const activos = enCurso();

        mostrarAvisoCuenta({
            usuario: estado.usuario,
            vencidos: atrasados(activos),
            proximo: activos.find((p) => p.dias_restantes >= 0),
            sanciones: estado.sanciones
        });
    }


    /* --- Banner de la cuenta que no puede pedir (sanción activa o mora) --- */
    function pintarBanner() {
        const mostrar = estado.esAlumno && !estado.puedePedir;
        banner.hidden = !mostrar;
        if (!mostrar) return;

        bannerTitulo.textContent = `Cuenta en condición: ${String(estado.condicion || "suspendido").toUpperCase()}`;
        bannerMensaje.textContent = "Tu cuenta registra sanciones o préstamos vencidos. No podés pedir libros hasta regularizar tu situación en el mostrador.";
    }


    /* --- Catálogo para pedir: filtros en vivo sobre la lista ya cargada --- */
    function pintarLibros() {
        if (!estado.esAlumno) return;

        if (estado.errorLibros) {
            listaLibros.innerHTML = `<p class="panel-vacio">${escapar(estado.errorLibros)}</p>`;
            contadorLibros.textContent = "0";
            return;
        }

        const filtros = Object.fromEntries(new FormData(formularioFiltros));
        const libros = filtrarLibros(estado.libros, filtros);

        contadorLibros.textContent = libros.length;
        listaLibros.innerHTML = crearCatalogoHTML(libros);

        // Con la cuenta suspendida o atrasada se ven los libros, pero no se puede pedir
        if (!estado.puedePedir) {
            listaLibros.querySelectorAll("[data-reservar-libro]").forEach((boton) => {
                boton.disabled = true;
                const texto = boton.querySelector("span");
                if (texto) texto.textContent = "No habilitado";
            });
        }

        window.lucide?.createIcons();
    }


    /* --- Mis pedidos y préstamos: filtros, contadores y filas --- */
    function pintarPedidos() {
        if (estado.cargando) {
            listaPedidos.innerHTML = `<li class="lista-vacia">Cargando tus pedidos...</li>`;
            return;
        }

        if (estado.errorCuenta) {
            listaPedidos.innerHTML = `<li class="lista-vacia">${escapar(estado.errorCuenta)}</li>`;
            contadorPedidos.textContent = "0";
            return;
        }

        contadorPedidos.textContent = estado.prestamos.length;

        filtrosPedidos.querySelectorAll("[data-filtro]").forEach((boton) => {
            const activo = boton.dataset.filtro === estado.filtro;
            boton.classList.toggle("activo", activo);
            boton.setAttribute("aria-pressed", String(activo));
            boton.querySelector("span").textContent = estado.prestamos.filter(FILTROS[boton.dataset.filtro]).length;
        });

        const pedidos = ordenarPedidos(estado.prestamos).filter(FILTROS[estado.filtro]);
        listaPedidos.innerHTML = crearListaPedidosHTML(pedidos, estado.filtro, estado.esAlumno);

        window.lucide?.createIcons();
    }


    return {
        metricas: pintarMetricas,
        aviso: pintarAviso,
        banner: pintarBanner,
        libros: pintarLibros,
        pedidos: pintarPedidos
    };
}
