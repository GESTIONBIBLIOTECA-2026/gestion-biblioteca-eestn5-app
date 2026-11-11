/* ==========================================================================
   libros.middleware.js - Validación del catálogo · Grupo 6
   Si un dato está mal responde 400 { error, campos } y NO se toca la base.
   ========================================================================== */

import { limpiar, rechazar } from "./predicados.js";

const esEnteroEntre = (valor, min, max) => Number.isInteger(valor) && valor >= min && valor <= max;
const esIsbnValido = (isbn) => /^[\dXx-]{10,20}$/.test(isbn);

/* --- Buscador: ?texto=&categoria=&disponibilidad= --- */
export const validarFiltrosLibros = (req, res, next) => {
    const { texto, categoria = 0, disponibilidad = "" } = req.query;
    req.filtros = { texto: limpiar(texto).slice(0, 100), categoria: Number(categoria) || 0, disponibilidad };

    if (!["", "disponible", "agotado"].includes(disponibilidad)) {
        return res.status(400).json({ error: "La disponibilidad tiene que ser disponible o agotado." });
    }
    next();
};

/* --- Alta y modificación: { titulo, autores, editorial, isbn, categoria_id, anio, cantidad } --- */
export const validarLibro = (req, res, next) => {
    const body = req.body ?? {};
    const datos = {
        titulo: limpiar(body.titulo),
        autores: limpiar(body.autores).split(",").map((a) => a.trim()).filter(Boolean),   // "Borges, Bioy" → 2 autores
        editorial: limpiar(body.editorial) || null,
        isbn: limpiar(body.isbn) || null,
        categoria_id: Number(body.categoria_id),
        anio: body.anio ? Number(body.anio) : null,
        cantidad: Number(body.cantidad)
    };
    const campos = {};

    if (datos.titulo.length < 1 || datos.titulo.length > 200) campos.titulo = "Escribí el título del libro.";
    if (datos.autores.length === 0 || datos.autores.some((a) => a.length > 120)) campos.autores = "Escribí al menos un autor (separados por coma).";
    if (datos.editorial?.length > 100) campos.editorial = "La editorial puede tener hasta 100 caracteres.";
    if (datos.isbn && !esIsbnValido(datos.isbn)) campos.isbn = "El ISBN tiene que tener entre 10 y 20 números o guiones.";
    if (!esEnteroEntre(datos.categoria_id, 1, 65535)) campos.categoria_id = "Elegí una categoría.";
    if (datos.anio !== null && !esEnteroEntre(datos.anio, 1450, new Date().getFullYear())) campos.anio = "El año no es válido.";

    // La cantidad solo se pide en el alta (después se cambia con "Actualizar stock")
    if (req.method === "POST" && !esEnteroEntre(datos.cantidad, 1, 50)) campos.cantidad = "La cantidad tiene que ser entre 1 y 50 ejemplares.";

    if (Object.keys(campos).length > 0) return rechazar(res, campos);

    req.body = datos;
    next();
};

/* --- Stock: { cambio } → +3 suma ejemplares, -2 da de baja ejemplares --- */
export const validarStock = (req, res, next) => {
    const cambio = Number(req.body?.cambio);

    if (!esEnteroEntre(Math.abs(cambio), 1, 50)) {
        return rechazar(res, { cambio: "Escribí cuántos ejemplares sumar (ej: 3) o sacar (ej: -2), hasta 50." });
    }
    req.body = { cambio };
    next();
};
