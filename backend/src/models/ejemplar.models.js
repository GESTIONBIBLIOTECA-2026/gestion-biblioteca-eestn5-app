/* ==========================================================================
   ejemplar.models.js - Stock de ejemplares de un libro · Grupo 6
   Reciben "conexion": se usan DENTRO de una transacción (conTransaccion).
   FOR UPDATE bloquea el libro: dos cambios de stock no se pisan.
   ========================================================================== */

import { noExiste, conflicto } from "./errores.models.js";

// Bloquea la fila del libro hasta el commit (y avisa si no existe o ya está de baja)
export const bloquearLibro = async (conexion, libroId) => {
    const [libros] = await conexion.query(
        "SELECT id, titulo FROM libros WHERE id = ? AND activo = TRUE FOR UPDATE", [libroId]
    );
    if (!libros[0]) throw noExiste("No hay ningún libro activo con ese ID.");
    return libros[0];
};

// ¿Quedan ejemplares libres en el estante? (los reservados ya los separó alguien)
export const exigirStock = async (conexion, libro, cantidad) => {
    const [[{ disponibles, reservados }]] = await conexion.query(
        `SELECT (SELECT COUNT(*) FROM ejemplares WHERE libro_id = ? AND estado = 'disponible') AS disponibles,
                (SELECT COALESCE(SUM(cantidad), 0) FROM pedidos WHERE libro_id = ? AND estado = 'pendiente') AS reservados`,
        [libro.id, libro.id]
    );
    const libres = disponibles - reservados;
    if (libres < cantidad) {
        const detalle = reservados > 0 ? ` (${reservados} reservado/s para retirar)` : "";
        throw conflicto(`No quedan ejemplares libres de «${libro.titulo}»: hay ${Math.max(libres, 0)}${detalle}.`);
    }
};
