/* ==========================================================================
   libro.models.js - Catálogo de libros (consultas) · Grupo 6
   El stock sale de vista_stock_libros (cuenta los ejemplares de cada título).
   Cada consulta es UN texto SQL fijo y los datos van aparte con comodines "?".
   ========================================================================== */

import connection from "../database/db.js";

// Catálogo ordenado por título, con buscador (título o autor), categoría y disponibilidad.
// categoria = 0 → todas · disponibilidad = "" → todas, "disponible" o "agotado"
// (stock_reservable = disponibles - reservados)
export const getCatalogoLibros = async ({ texto, categoria, disponibilidad }) => {
    const sql = `SELECT v.libro_id AS id, v.titulo, v.isbn, v.autores, v.categoria, l.categoria_id,
                        ed.nombre AS editorial, l.anio_publicacion AS anio, l.portada_url,
                        v.ejemplares_totales, v.ejemplares_disponibles, v.cantidad_reservada, v.stock_reservable
                 FROM vista_stock_libros v
                 JOIN libros l ON l.id = v.libro_id
                 LEFT JOIN editoriales ed ON ed.id = l.editorial_id
                 WHERE (v.titulo LIKE CONCAT('%', ?, '%') OR v.autores LIKE CONCAT('%', ?, '%'))
                   AND (? = 0 OR l.categoria_id = ?)
                   AND (? = '' OR (? = 'disponible' AND v.stock_reservable > 0) OR (? = 'agotado' AND v.stock_reservable = 0))
                 ORDER BY v.titulo`;
    const parametros = [texto, texto, categoria, categoria, disponibilidad, disponibilidad, disponibilidad];
    const [rows] = await connection.query(sql, parametros);
    return rows;
};

// Un libro con su stock
export const getLibroPorId = async (id) => {
    const sql = `SELECT v.libro_id AS id, v.titulo, v.isbn, v.autores, v.categoria, l.categoria_id,
                        ed.nombre AS editorial, l.anio_publicacion AS anio, l.portada_url,
                        v.ejemplares_totales, v.ejemplares_disponibles, v.cantidad_reservada, v.stock_reservable
                 FROM vista_stock_libros v
                 JOIN libros l ON l.id = v.libro_id
                 LEFT JOIN editoriales ed ON ed.id = l.editorial_id
                 WHERE v.libro_id = ?`;
    const [rows] = await connection.query(sql, [id]);
    return rows[0];
};

export const getCategorias = async () => {
    const sql = "SELECT id, nombre FROM categorias ORDER BY nombre";
    const [rows] = await connection.query(sql);
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
