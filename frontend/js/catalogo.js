/* ==========================================================================
   catalogo.js - Catálogo de libros de la app (catalogo.html) · Grupo 6
   Pide los libros al servidor una sola vez, dibuja una tarjeta por libro
   y, cada vez que el alumno busca o cambia un filtro, muestra solo los que coinciden.
   ========================================================================== */

import { listarLibros, obtenerCategorias } from "./api.js";
import { escapar } from "./ui.js";

// 1. Elementos de la página que vamos a usar
const formularioFiltros = document.querySelector("#formularioFiltros");
const campoTexto = document.querySelector("[name=texto]");
const selectCategoria = document.querySelector("[name=categoria]");
const casillaDisponibles = document.querySelector("[name=disponibles]");
const grilla = document.querySelector("#grillaLibros");
const contador = document.querySelector("#totalLibros");

// 2. Datos que la página recuerda
let libros = [];
const SIN_TILDE = { á: "a", é: "e", í: "i", ó: "o", ú: "u", ü: "u" };


// 3. Funciones de ayuda

// Pasa un texto a minúsculas y sin tildes ("Física" -> "fisica")
function simplificar(texto) {
    const letras = [...texto.toLowerCase()];
    return letras.map((letra) => SIN_TILDE[letra] ?? letra).join("");
}

// Dice en qué estado está un libro: el texto de la etiqueta y su color
function estadoDelLibro(libro) {
    if (libro.ejemplares_totales === 0) return { texto: "Sin ejemplares", color: "gris" };
    if (libro.stock_reservable > 0) return { texto: `Disponible · ${libro.stock_reservable} libre/s`, color: "verde" };
    if (libro.ejemplares_disponibles > 0) return { texto: "Reservado", color: "ambar" };
    return { texto: "Prestado", color: "azul" };
}

// Arma el HTML de la tarjeta de un libro
function crearTarjeta(libro) {
    const estado = estadoDelLibro(libro);

    // Si el libro tiene portada, la foto se pone encima del ícono
    let portada = "";
    if (libro.portada_url) {
        portada = `<img src="${escapar(libro.portada_url)}" alt="" loading="lazy" referrerpolicy="no-referrer">`;
    }

    // Categoría · editorial · año (solo los datos que tenga)
    const datos = [libro.categoria, libro.editorial, libro.anio].filter((dato) => dato);
    const detalle = datos.map((dato) => escapar(dato)).join(" · ");

    return `
        <article class="tarjeta-libro">
            <div class="tarjeta-libro-portada"><i data-lucide="book-open"></i>${portada}</div>
            <div class="tarjeta-libro-info">
                <h3>${escapar(libro.titulo)}</h3>
                <p>${escapar(libro.autores ?? "Sin autor")}</p>
                <small>${detalle}</small>
            </div>
            <div class="tarjeta-libro-pie">
                <span class="etiqueta ${estado.color}">${estado.texto}</span>
                <small>${libro.ejemplares_totales} ejemplar(es) en la biblioteca</small>
            </div>
        </article>`;
}


// 4. Mostrar los libros que cumplen los filtros
function mostrarLibros() {
    const texto = simplificar(campoTexto.value.trim());
    const categoria = Number(selectCategoria.value);
    const soloDisponibles = casillaDisponibles.checked;

    const filtrados = libros.filter((libro) => {
        const coincideTexto = simplificar(`${libro.titulo} ${libro.autores ?? ""}`).includes(texto);
        const coincideCategoria = categoria === 0 || libro.categoria_id === categoria;
        const coincideStock = !soloDisponibles || libro.stock_reservable > 0;
        return coincideTexto && coincideCategoria && coincideStock;
    });

    contador.textContent = filtrados.length;

    if (filtrados.length === 0) {
        grilla.innerHTML = `<p class="panel-vacio">No encontramos libros con esa búsqueda.</p>`;
        return;
    }

    grilla.innerHTML = filtrados.map((libro) => crearTarjeta(libro)).join("");
    window.lucide?.createIcons();   // dibuja los íconos de las tarjetas nuevas
}


// 5. Pedir los libros y las categorías al servidor
async function cargarCatalogo() {
    try {
        const respuestaLibros = await listarLibros();
        const respuestaCategorias = await obtenerCategorias();
        libros = respuestaLibros.payload;

        let opciones = `<option value="0">Todas las categorías</option>`;
        respuestaCategorias.payload.forEach((categoria) => {
            opciones += `<option value="${categoria.id}">${escapar(categoria.nombre)}</option>`;
        });
        selectCategoria.innerHTML = opciones;

        mostrarLibros();
    } catch (error) {
        let mensaje = "No hay conexión con el servidor.";
        if (error.status) mensaje = error.message;
        grilla.innerHTML = `<p class="panel-vacio">${escapar(mensaje)}</p>`;
    }
}


// 6. Lo que pasa cuando el alumno toca algo
formularioFiltros.addEventListener("input", mostrarLibros);   // cada vez que escribe o cambia un filtro
formularioFiltros.addEventListener("submit", (evento) => evento.preventDefault());   // que Enter no recargue la página


// 7. Arranque: apenas se abre la página, pide los datos
cargarCatalogo();
