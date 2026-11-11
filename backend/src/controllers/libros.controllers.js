/* ==========================================================================
   libros.controllers.js - Controlador del Catálogo e Inventario · Grupo 6
   Las reglas del stock las controla el Modelo dentro de la transacción
   (lanza ErrorNegocio) y acá se traducen a 404 / 409 con responderError.
   ========================================================================== */

import { getCatalogoLibros, getLibroPorId, getResumenCatalogo, getCategorias } from "../models/libro.models.js";
import { crearLibro, actualizarLibro, cambiarStock, darDeBajaLibro } from "../models/inventario.models.js";
import { error500, responderError } from "./respuestas.js";

/* --- GET /api/libros?texto=&categoria=&disponibilidad= --- */
export const getCatalogo = async (req, res) => {
    try {
        return res.json({ payload: await getCatalogoLibros(req.filtros) });
    } catch (error) {
        return error500(res, error, "No se pudo cargar el catálogo");
    }
};

/* --- GET /api/libros/:id --- */
export const getLibro = async (req, res) => {
    try {
        const libro = await getLibroPorId(req.id);
        if (!libro) return res.status(404).json({ error: "No hay ningún libro con ese ID." });
        return res.json({ payload: libro });
    } catch (error) {
        return error500(res, error, "No se pudo consultar el libro");
    }
};

/* --- GET /api/libros/resumen   y   GET /api/libros/categorias --- */
export const getResumen = async (req, res) => {
    try {
        return res.json({ payload: await getResumenCatalogo() });
    } catch (error) {
        return error500(res, error, "No se pudo calcular el resumen del catálogo");
    }
};

export const getListaCategorias = async (req, res) => {
    try {
        return res.json({ payload: await getCategorias() });
    } catch (error) {
        return error500(res, error, "No se pudieron cargar las categorías");
    }
};

/* --- POST /api/libros   Body: { titulo, autores, editorial, isbn, categoria_id, anio, cantidad } --- */
export const postLibro = async (req, res) => {
    try {
        const id = await crearLibro(req.body);
        return res.status(201).json({ mensaje: `Se cargó «${req.body.titulo}» con ${req.body.cantidad} ejemplar(es).`, payload: { id } });
    } catch (error) {
        return responderError(res, error, "No se pudo guardar el libro");
    }
};

/* --- PUT /api/libros/:id   (mismo body, sin cantidad) --- */
export const putLibro = async (req, res) => {
    try {
        await actualizarLibro(req.id, req.body);
        return res.json({ mensaje: `Se guardaron los cambios de «${req.body.titulo}».` });
    } catch (error) {
        return responderError(res, error, "No se pudieron guardar los cambios");
    }
};

/* --- PATCH /api/libros/:id/stock   Body: { cambio } --- */
export const patchStock = async (req, res) => {
    try {
        const { cambio } = req.body;
        await cambiarStock(req.id, cambio);
        const texto = cambio > 0 ? `Se sumaron ${cambio} ejemplar(es).` : `Se dieron de baja ${-cambio} ejemplar(es).`;
        return res.json({ mensaje: texto });
    } catch (error) {
        return responderError(res, error, "No se pudo actualizar el stock");
    }
};

/* --- DELETE /api/libros/:id   (baja lógica: el historial de préstamos se conserva) --- */
export const deleteLibro = async (req, res) => {
    try {
        const titulo = await darDeBajaLibro(req.id);
        return res.json({ mensaje: `Se dio de baja «${titulo}» del catálogo.` });
    } catch (error) {
        return responderError(res, error, "No se pudo dar de baja el libro");
    }
};
