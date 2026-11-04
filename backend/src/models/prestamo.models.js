/* Gestión de pedidos y préstamos — Grupo 4 */
import connection from "../database/db.js";

// Consulta de solo lectura para el panel de Inicio (mantiene la forma de respuesta del Grupo 5).
export async function obtenerUltimosPrestamos(limite = 5) {
  const n = Number.isInteger(limite) && limite >= 1 && limite <= 50 ? limite : 5;
  const [rows] = await connection.query(
    `SELECT nombre_completo, titulo, COALESCE(fecha_entrega, fecha_pedido) AS fecha_prestamo,
            fecha_devolucion_estimada, fecha_devolucion_real, estado, dias_atraso
     FROM vista_historial_usuario
     WHERE estado IN ('prestado', 'vencido', 'devuelto')
     ORDER BY fecha_prestamo DESC LIMIT ?`, [n]);
  return rows;
}

export async function listarPedidos({ estado, busqueda } = {}) {
  const filtros = [];
  const params = [];
  if (estado && ["pendiente","prestado","devuelto","vencido","cancelado"].includes(estado)) {
    filtros.push("p.estado = ?"); params.push(estado);
  }
  if (busqueda) {
    filtros.push("(u.nombre_completo LIKE ? OR u.dni LIKE ? OR l.titulo LIKE ?)");
    const q = `%${busqueda}%`; params.push(q,q,q);
  }
  const sql = `SELECT p.id, p.usuario_id, u.nombre_completo, u.dni, p.libro_id, l.titulo,
      p.cantidad, p.fecha_pedido, p.fecha_devolucion_estimada, p.fecha_entrega,
      p.fecha_devolucion_real, p.estado
    FROM pedidos p JOIN usuarios u ON u.id=p.usuario_id JOIN libros l ON l.id=p.libro_id
    ${filtros.length ? "WHERE "+filtros.join(" AND ") : ""}
    ORDER BY FIELD(p.estado,'pendiente','vencido','prestado','devuelto','cancelado'), p.fecha_pedido DESC`;
  const [rows] = await connection.query(sql, params);
  return rows;
}

export async function crearPedido({ usuarioId, libroId, cantidad, fechaDevolucion, registradoPor }) {
  const conn = await connection.getConnection();
  try {
    await conn.beginTransaction();
    const [users] = await conn.query(
      `SELECT u.id,u.estado,
       CASE WHEN u.estado <> 'habilitado' THEN u.estado
       WHEN EXISTS (SELECT 1 FROM sanciones s WHERE s.usuario_id=u.id AND s.activa=TRUE
          AND (s.fecha_fin IS NULL OR s.fecha_fin>=CURRENT_DATE)) THEN 'suspendido'
       WHEN EXISTS (SELECT 1 FROM pedidos p WHERE p.usuario_id=u.id AND
          (p.estado='vencido' OR (p.estado='prestado' AND p.fecha_devolucion_estimada<CURRENT_DATE))) THEN 'atraso'
       ELSE 'habilitado' END AS condicion
       FROM usuarios u WHERE u.id=? FOR UPDATE`, [usuarioId]);
    if (!users.length) { const e=new Error("No existe el alumno indicado."); e.status=404; throw e; }
    if (users[0].condicion !== "habilitado") { const e=new Error(`El alumno no puede pedir libros: estado ${users[0].condicion}.`); e.status=409; throw e; }

    const [books] = await conn.query(
      `SELECT l.id,l.titulo,l.activo,
       (SELECT COUNT(*) FROM ejemplares e WHERE e.libro_id=l.id AND e.estado='disponible') AS disponibles,
       (SELECT COALESCE(SUM(p.cantidad),0) FROM pedidos p WHERE p.libro_id=l.id AND p.estado='pendiente') AS reservados
       FROM libros l WHERE l.id=? FOR UPDATE`, [libroId]);
    if (!books.length || !books[0].activo) { const e=new Error("El libro no existe o está fuera de circulación."); e.status=404; throw e; }
    const libre = Number(books[0].disponibles)-Number(books[0].reservados);
    if (!Number.isInteger(cantidad) || cantidad < 1) { const e=new Error("La cantidad debe ser al menos 1."); e.status=400; throw e; }
    if (libre < cantidad) { const e=new Error(`Stock insuficiente. Ejemplares reservables: ${Math.max(0,libre)}.`); e.status=409; throw e; }
    const fechaReal = typeof fechaDevolucion === "string" ? new Date(`${fechaDevolucion}T00:00:00Z`) : null;
    if (!fechaDevolucion || !/^\d{4}-\d{2}-\d{2}$/.test(fechaDevolucion) ||
        !fechaReal || Number.isNaN(fechaReal.getTime()) || fechaReal.toISOString().slice(0, 10) !== fechaDevolucion) {
      const e=new Error("Indicá una fecha de devolución válida."); e.status=400; throw e;
    }
    const [hoyRows] = await conn.query("SELECT DATE_FORMAT(CURRENT_DATE, '%Y-%m-%d') AS hoy");
    if (fechaDevolucion < hoyRows[0].hoy) {
      const e=new Error("La fecha de devolución debe ser hoy o una fecha futura."); e.status=400; throw e;
    }
    const [result] = await conn.query(
      `INSERT INTO pedidos (usuario_id,libro_id,cantidad,fecha_devolucion_estimada,estado)
       VALUES (?,?,?,?, 'pendiente')`, [usuarioId,libroId,cantidad,fechaDevolucion]);
    await conn.query(
      `INSERT INTO pedido_historial (pedido_id,estado_anterior,estado_nuevo,registrado_por,observacion)
       VALUES (?,NULL,'pendiente',?,'Pedido creado')`, [result.insertId, registradoPor || null]);
    await conn.commit();
    return { id: result.insertId, estado: "pendiente" };
  } catch (error) { await conn.rollback(); throw error; }
  finally { conn.release(); }
}

export async function cambiarEstadoPedido(id, nuevoEstado, registradoPor) {
  const conn = await connection.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query("SELECT * FROM pedidos WHERE id=? FOR UPDATE", [id]);
    if (!rows.length) { const e=new Error("No se encontró el pedido."); e.status=404; throw e; }
    const p=rows[0], anterior=p.estado;
    const permitidos = { pendiente:["prestado","cancelado"], prestado:["devuelto","vencido"], vencido:["devuelto"], devuelto:[], cancelado:[] };
    if (!(permitidos[anterior] || []).includes(nuevoEstado)) {
      const e=new Error(`No se puede cambiar de ${anterior} a ${nuevoEstado}.`); e.status=409; throw e;
    }
    // Serializa cambios de stock con las nuevas reservas del mismo libro.
    await conn.query("SELECT id FROM libros WHERE id=? FOR UPDATE", [p.libro_id]);
    if (nuevoEstado === "prestado") {
      const [ejemplares] = await conn.query(
        "SELECT id FROM ejemplares WHERE libro_id=? AND estado='disponible' ORDER BY id LIMIT ? FOR UPDATE",
        [p.libro_id, p.cantidad]);
      if (ejemplares.length < p.cantidad) { const e=new Error("No hay suficientes ejemplares disponibles para entregar."); e.status=409; throw e; }
      for (const ej of ejemplares) {
        await conn.query("UPDATE ejemplares SET estado='prestado' WHERE id=?", [ej.id]);
        await conn.query("INSERT INTO pedido_ejemplares (pedido_id,ejemplar_id) VALUES (?,?)", [id,ej.id]);
      }
      await conn.query("UPDATE pedidos SET estado='prestado',fecha_entrega=NOW() WHERE id=?", [id]);
    } else if (nuevoEstado === "devuelto") {
      const [ejemplares] = await conn.query("SELECT ejemplar_id FROM pedido_ejemplares WHERE pedido_id=? FOR UPDATE", [id]);
      for (const ej of ejemplares) await conn.query("UPDATE ejemplares SET estado='disponible' WHERE id=? AND estado='prestado'", [ej.ejemplar_id]);
      await conn.query("UPDATE pedidos SET estado='devuelto',fecha_devolucion_real=NOW() WHERE id=?", [id]);
    } else {
      await conn.query("UPDATE pedidos SET estado=? WHERE id=?", [nuevoEstado,id]);
    }
    const observaciones = {
      prestado: "Entrega registrada en el mostrador",
      devuelto: "Devolución recibida en el mostrador",
      vencido: "Pedido marcado como vencido",
      cancelado: "Pedido cancelado"
    };
    await conn.query(
      "INSERT INTO pedido_historial (pedido_id,estado_anterior,estado_nuevo,registrado_por,observacion) VALUES (?,?,?,?,?)",
      [id,anterior,nuevoEstado,registradoPor || null, observaciones[nuevoEstado] || null]);
    await conn.commit();
    return { id, estado: nuevoEstado, estadoAnterior: anterior };
  } catch (error) { await conn.rollback(); throw error; }
  finally { conn.release(); }
}

export async function historialPedidos({ usuarioId } = {}) {
  const params=[];
  let where="";
  if (usuarioId) { where="WHERE p.usuario_id=?"; params.push(usuarioId); }
  const [rows] = await connection.query(
    `SELECT p.id AS pedido_id,p.usuario_id,u.nombre_completo,u.dni,l.titulo,p.cantidad,
     p.fecha_pedido,p.fecha_entrega,p.fecha_devolucion_estimada,p.fecha_devolucion_real,p.estado,
     CASE WHEN p.fecha_devolucion_real IS NOT NULL THEN GREATEST(DATEDIFF(DATE(p.fecha_devolucion_real),p.fecha_devolucion_estimada),0)
     WHEN p.estado IN ('prestado','vencido') THEN GREATEST(DATEDIFF(CURRENT_DATE,p.fecha_devolucion_estimada),0) ELSE 0 END AS dias_atraso
     FROM pedidos p JOIN usuarios u ON u.id=p.usuario_id JOIN libros l ON l.id=p.libro_id
     ${where} ORDER BY p.fecha_pedido DESC`, params);
  return rows;
}

export async function actualizarVencidos(registradoPor) {
  const conn = await connection.getConnection();
  try {
    await conn.beginTransaction();
    const [vencidos] = await conn.query(
      `SELECT id FROM pedidos WHERE estado='prestado' AND fecha_devolucion_estimada<CURRENT_DATE FOR UPDATE`);
    for (const pedido of vencidos) {
      await conn.query("UPDATE pedidos SET estado='vencido' WHERE id=? AND estado='prestado'", [pedido.id]);
      await conn.query(
        `INSERT INTO pedido_historial (pedido_id,estado_anterior,estado_nuevo,registrado_por,observacion)
         VALUES (?, 'prestado', 'vencido', ?, 'Vencimiento detectado automáticamente')`,
        [pedido.id, registradoPor || null]);
    }
    await conn.commit();
    return vencidos.length;
  } catch (error) { await conn.rollback(); throw error; }
  finally { conn.release(); }
}
