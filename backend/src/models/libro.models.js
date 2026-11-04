/* ==========================================================================
   libro.models.js - Catálogo de libros (consultas) · Grupo 6
   El stock sale de vista_stock_libros (cuenta los ejemplares de cada título).
   ========================================================================== */

import connection from "../database/db.js";

// Columnas de un libro del catálogo (stock_reservable = disponibles - reservados)
const COLUMNAS = `v.libro_id AS id, v.titulo, v.isbn, v.autores, v.categoria, l.categoria_id,
    ed.nombre AS editorial, l.anio_publicacion AS anio, l.portada_url, v.ejemplares_totales, v.ejemplares_disponibles,
    v.cantidad_reservada, v.stock_reservable`;

const DESDE = `FROM vista_stock_libros v JOIN libros l ON l.id = v.libro_id
    LEFT JOIN editoriales ed ON ed.id = l.editorial_id`;

// Filtro de disponibilidad → condición SQL (texto fijo, nunca datos del usuario)
const DISPONIBILIDAD = {
    "": "TRUE",
    disponible: "v.stock_reservable > 0",
    agotado: "v.stock_reservable = 0"
};

// Catálogo ordenado por título, con buscador (título o autor), categoría y disponibilidad
export const getCatalogoLibros = async ({ texto, categoria, disponibilidad }) => {
    const sql = `SELECT ${COLUMNAS} ${DESDE}
                 WHERE (v.titulo LIKE ? OR v.autores LIKE ?)
                   AND (? = 0 OR l.categoria_id = ?)
                   AND ${DISPONIBILIDAD[disponibilidad]}
                 ORDER BY v.titulo`;
    const [rows] = await connection.query(sql, [`%${texto}%`, `%${texto}%`, categoria, categoria]);
    return rows;
};

export const getLibroPorId = async (id) => {
    const [rows] = await connection.query(`SELECT ${COLUMNAS} ${DESDE} WHERE v.libro_id = ?`, [id]);
    return rows[0];
};

export const getCategorias = async () => {
    const [rows] = await connection.query("SELECT id, nombre FROM categorias ORDER BY nombre");
    return rows;
};

// Catálogo consultable para el módulo de pedidos (Grupo 4)
export const listarLibrosParaPedido = async (busqueda = "") => {
    const termino = `%${String(busqueda).trim()}%`;
    const [rows] = await connection.query(
        `SELECT libro_id, isbn, titulo, categoria, autores, portada_url,
                ejemplares_totales, ejemplares_disponibles, cantidad_reservada,
                stock_reservable, estado_visual
         FROM vista_stock_libros
         WHERE ? = '' OR titulo LIKE ? OR autores LIKE ? OR categoria LIKE ? OR isbn LIKE ?
         ORDER BY titulo ASC LIMIT 500`,
        [String(busqueda).trim(), termino, termino, termino, termino]
    );
    return rows;
};
