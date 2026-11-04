/* ==========================================================================
   cursos.controllers.js - Controlador de Cursos · Grupo 5
   ========================================================================== */

import { getCursos } from "../models/curso.models.js";

/* --- GET /api/cursos --- */
export const getListaCursos = async (req, res) => {
    try {
        return res.json({ payload: await getCursos() });
    } catch (error) {
        console.error("Error al listar cursos:", error.message);
        return res.status(500).json({ error: "No se pudieron cargar los cursos." });
    }
};
