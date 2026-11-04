/* ==========================================================================
   libros.controllers.js - Controlador del Catálogo · Grupo 6 (solo lectura)
   ========================================================================== */

import { getCatalogoLibros, getLibroPorId, getCategorias } from "../models/libro.models.js";
import { error500 } from "./respuestas.js";

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

/* --- GET /api/libros/categorias --- */
export const getListaCategorias = async (req, res) => {
    try {
        return res.json({ payload: await getCategorias() });
    } catch (error) {
        return error500(res, error, "No se pudieron cargar las categorías");
    }
};
