/* ==========================================================================
   curso.models.js - Modelo de Cursos · Grupo 5
   ========================================================================== */

import connection from "../database/db.js";

// Todos los cursos con cuántos alumnos activos tiene cada uno
export const getCursos = async () => {
    const sql = `SELECT c.id, c.nombre, COUNT(u.id) AS alumnos
                 FROM cursos c
                 LEFT JOIN usuarios u ON u.curso_id = c.id AND u.estado <> 'baja'
                 GROUP BY c.id, c.nombre
                 ORDER BY c.nombre`;
    const [rows] = await connection.query(sql);
    return rows;
};
