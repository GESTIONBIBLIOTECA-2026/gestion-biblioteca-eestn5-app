/* ==========================================================================
   usuario.sql.js - Pedazos de SQL de usuarios (los usa usuario.models.js)
   Son texto fijo: NUNCA llevan datos del
   usuario; los datos siempre van aparte con comodines "?".
   ========================================================================== */

// Atraso = préstamo vencido, o prestado con la fecha de devolución ya pasada
const ATRASO = `EXISTS (SELECT 1 FROM pedidos p WHERE p.usuario_id = u.id
    AND (p.estado = 'vencido' OR (p.estado = 'prestado' AND p.fecha_devolucion_estimada < CURRENT_DATE)))`;

// Sanción en vigor = activa y sin fecha de fin (o que todavía no llegó)
const SANCION = `EXISTS (SELECT 1 FROM sanciones s WHERE s.usuario_id = u.id
    AND s.activa = TRUE AND (s.fecha_fin IS NULL OR s.fecha_fin >= CURRENT_DATE))`;

// Condición de la cuenta: baja / suspendido / atraso / habilitado
const CONDICION = `CASE WHEN u.estado = 'baja' THEN 'baja'
    WHEN u.estado = 'suspendido' OR ${SANCION} THEN 'suspendido'
    WHEN ${ATRASO} THEN 'atraso' ELSE 'habilitado' END`;

// Datos públicos de un usuario (NUNCA el password_hash)
export const COLUMNAS = `u.id, u.dni, u.nombre_completo, c.nombre AS curso, u.correo, u.telefono,
    u.direccion, r.nombre AS rol, u.estado, u.fecha_alta, u.anio_inscripcion, ${CONDICION} AS condicion,
    (SELECT COUNT(*) FROM pedidos p WHERE p.usuario_id = u.id AND p.estado IN ('prestado', 'vencido')) AS prestamos_en_curso`;

export const DESDE = "FROM usuarios u JOIN roles r ON r.id = u.rol_id LEFT JOIN cursos c ON c.id = u.curso_id";
