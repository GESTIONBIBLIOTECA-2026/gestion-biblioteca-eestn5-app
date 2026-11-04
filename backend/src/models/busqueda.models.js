/* ==========================================================================
   busqueda.models.js - Búsqueda avanzada de usuarios · Grupo 5
   Nombre, DNI y curso combinados + filtro rápido (chips) + paginación.
   ========================================================================== */

import connection from "../database/db.js";
import { ATRASO, CONDICION, COLUMNAS, DESDE } from "./usuario.models.js";

// Condición SQL de cada chip del buscador
const FILTROS_SQL = {
    todos: "u.estado <> 'baja'",
    alumnos: "u.estado <> 'baja' AND r.nombre = 'alumno'",
    docentes: "u.estado <> 'baja' AND r.nombre = 'docente'",
    administradores: "u.estado <> 'baja' AND r.nombre = 'administrador'",
    morosos: `u.estado <> 'baja' AND ${ATRASO}`,
    suspendidos: `u.estado <> 'baja' AND (${CONDICION}) IN ('suspendido', 'atraso')`,
    bajas: "u.estado = 'baja'"
};

export const buscarUsuarios = async ({ nombre, dni, curso, filtro, pagina, porPagina }) => {

    // 1. Condiciones de texto con "?" (cada palabra del nombre tiene que aparecer)
    const condiciones = ["TRUE"];
    const valores = [];

    nombre.split(" ").filter(Boolean).forEach((palabra) => {
        condiciones.push("u.nombre_completo LIKE ?");
        valores.push(`%${palabra}%`);
    });
    if (dni) {
        condiciones.push("u.dni LIKE ?");
        valores.push(`${dni}%`);
    }
    if (curso) {
        condiciones.push("c.nombre LIKE ?");
        valores.push(`%${curso}%`);
    }

    const where = condiciones.join(" AND ");

    // 2. Cuántos hay en cada chip, en UNA sola consulta (SUM de cada condición)
    const columnas = Object.entries(FILTROS_SQL).map(([clave, sql]) => `COALESCE(SUM(${sql}), 0) AS ${clave}`).join(", ");
    const [[contadores]] = await connection.query(`SELECT ${columnas} ${DESDE} WHERE ${where}`, valores);

    // 3. La página pedida (si ya no existe, la última)
    const totalPaginas = Math.max(1, Math.ceil(contadores[filtro] / porPagina));
    const paginaReal = Math.min(pagina, totalPaginas);

    const [usuarios] = await connection.query(
        `SELECT ${COLUMNAS} ${DESDE} WHERE ${where} AND ${FILTROS_SQL[filtro]}
         ORDER BY u.nombre_completo LIMIT ? OFFSET ?`,
        [...valores, porPagina, (paginaReal - 1) * porPagina]
    );

    return { usuarios, contadores, pagina: paginaReal, total_paginas: totalPaginas };
};
