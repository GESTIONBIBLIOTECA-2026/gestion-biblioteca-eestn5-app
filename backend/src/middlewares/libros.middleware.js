/* ==========================================================================
   libros.middleware.js - Validación del catálogo · Grupo 6
   Si un filtro está mal responde 400 y NO se toca la base.
   ========================================================================== */

import { limpiar } from "./predicados.js";

/* --- Buscador: ?texto=&categoria=&disponibilidad= --- */
export const validarFiltrosLibros = (req, res, next) => {
    const { texto, categoria = 0, disponibilidad = "" } = req.query;
    req.filtros = { texto: limpiar(texto).slice(0, 100), categoria: Number(categoria) || 0, disponibilidad };

    if (!["", "disponible", "agotado"].includes(disponibilidad)) {
        return res.status(400).json({ error: "La disponibilidad tiene que ser disponible o agotado." });
    }
    next();
};
