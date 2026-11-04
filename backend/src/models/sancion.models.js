/* ==========================================================================
   sancion.models.js - Historial activo y estado de la cuenta · Grupo 5
   Suspender (sanción), habilitar y dar de baja.
   ========================================================================== */

import connection from "../database/db.js";

// Historial activo: préstamos (la vista calcula los días de atraso) y sanciones
export const getHistorial = async (id) => {
    const [[prestamos], [sanciones]] = await Promise.all([
        connection.query(
            `SELECT pedido_id, titulo, cantidad, fecha_pedido, fecha_entrega, fecha_devolucion_estimada,
                    fecha_devolucion_real, estado, dias_atraso,
                    DATEDIFF(fecha_devolucion_estimada, CURRENT_DATE) AS dias_restantes
             FROM vista_historial_usuario WHERE usuario_id = ? ORDER BY fecha_pedido DESC`,
            [id]
        ),
        connection.query(
            `SELECT s.tipo, s.motivo, s.fecha_inicio, s.fecha_fin, a.nombre_completo AS aplicada_por,
                    (s.activa = TRUE AND (s.fecha_fin IS NULL OR s.fecha_fin >= CURRENT_DATE)) AS en_vigor
             FROM sanciones s LEFT JOIN usuarios a ON a.id = s.aplicada_por
             WHERE s.usuario_id = ? ORDER BY en_vigor DESC, s.fecha_inicio DESC`,
            [id]
        )
    ]);
    return { prestamos, sanciones };
};

// Suspender: guarda la sanción (asociada al préstamo atrasado si tiene uno) y marca al usuario
export const suspenderUsuario = async (id, motivo, adminId) => {
    const [atrasados] = await connection.query(
        `SELECT id FROM pedidos WHERE usuario_id = ?
         AND (estado = 'vencido' OR (estado = 'prestado' AND fecha_devolucion_estimada < CURRENT_DATE)) LIMIT 1`,
        [id]
    );
    const pedidoId = atrasados[0]?.id ?? null;

    await connection.query(
        `INSERT INTO sanciones (usuario_id, pedido_id, tipo, motivo, fecha_inicio, activa, aplicada_por)
         VALUES (?, ?, ?, ?, CURRENT_DATE, TRUE, ?)`,
        [id, pedidoId, pedidoId ? "atraso" : "manual", motivo, adminId]
    );
    await connection.query("UPDATE usuarios SET estado = 'suspendido' WHERE id = ?", [id]);
};

// Habilitar (o reactivar una baja): las sanciones no se borran, se cierran con fecha de hoy
export const habilitarUsuario = async (id) => {
    await connection.query(
        `UPDATE sanciones SET activa = FALSE, fecha_fin = LEAST(COALESCE(fecha_fin, CURRENT_DATE), CURRENT_DATE)
         WHERE usuario_id = ? AND activa = TRUE`,
        [id]
    );
    await connection.query("UPDATE usuarios SET estado = 'habilitado' WHERE id = ?", [id]);
};

// Baja lógica: no se borra (queda el historial) y sus reservas pendientes se cancelan
export const darDeBajaUsuario = async (id, adminId) => {
    await connection.query(
        `INSERT INTO pedido_historial (pedido_id, estado_anterior, estado_nuevo, registrado_por, observacion)
         SELECT id, 'pendiente', 'cancelado', ?, 'Reserva cancelada por la baja del usuario'
         FROM pedidos WHERE usuario_id = ? AND estado = 'pendiente'`,
        [adminId, id]
    );
    const [resultado] = await connection.query(
        "UPDATE pedidos SET estado = 'cancelado' WHERE usuario_id = ? AND estado = 'pendiente'", [id]
    );
    await connection.query("UPDATE usuarios SET estado = 'baja' WHERE id = ?", [id]);
    return resultado.affectedRows;   // reservas canceladas
};
