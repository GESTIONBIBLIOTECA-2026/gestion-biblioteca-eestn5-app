import connection from "../database/db.js";

export const getMetricasTotales = async () => {
    const [libros] = await connection.query("SELECT COUNT(*) AS total FROM libros WHERE activo = TRUE");
    const [prestamos] = await connection.query("SELECT COUNT(*) AS total FROM pedidos WHERE estado IN ('prestado', 'vencido')");
    const [morosos] = await connection.query(
        `SELECT COUNT(DISTINCT usuario_id) AS total 
         FROM pedidos 
         WHERE estado = 'vencido' OR (estado = 'prestado' AND fecha_devolucion_estimada < CURRENT_DATE)`
    );

    
    return {
        libros_total: libros[0]?.total || 0,
        prestamos_activos: prestamos[0]?.total || 0,
        alumnos_morosos: morosos[0]?.total || 0
    };
};
