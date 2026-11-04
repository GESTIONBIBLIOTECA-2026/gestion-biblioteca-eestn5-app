/* ==========================================================================
   usuario.models.js - Modelo de Usuarios (acceso a datos) · Grupo 5
   Solo consulta la base con comodines "?" y devuelve datos puros.
   ========================================================================== */

import connection from "../database/db.js";

// Atraso = préstamo vencido, o prestado con la fecha de devolución ya pasada
export const ATRASO = `EXISTS (SELECT 1 FROM pedidos p WHERE p.usuario_id = u.id
    AND (p.estado = 'vencido' OR (p.estado = 'prestado' AND p.fecha_devolucion_estimada < CURRENT_DATE)))`;

// Sanción en vigor = activa y sin fecha de fin (o que todavía no llegó)
const SANCION = `EXISTS (SELECT 1 FROM sanciones s WHERE s.usuario_id = u.id
    AND s.activa = TRUE AND (s.fecha_fin IS NULL OR s.fecha_fin >= CURRENT_DATE))`;

// Condición que ve el bibliotecario: baja / suspendido / atraso / habilitado
export const CONDICION = `CASE WHEN u.estado = 'baja' THEN 'baja'
    WHEN u.estado = 'suspendido' OR ${SANCION} THEN 'suspendido'
    WHEN ${ATRASO} THEN 'atraso' ELSE 'habilitado' END`;

// Datos públicos de un usuario (NUNCA el password_hash)
export const COLUMNAS = `u.id, u.dni, u.nombre_completo, c.nombre AS curso, u.correo, u.telefono,
    u.direccion, r.nombre AS rol, u.estado, u.fecha_alta, ${CONDICION} AS condicion,
    (SELECT COUNT(*) FROM pedidos p WHERE p.usuario_id = u.id AND p.estado IN ('prestado', 'vencido')) AS prestamos_en_curso`;

export const DESDE = "FROM usuarios u JOIN roles r ON r.id = u.rol_id LEFT JOIN cursos c ON c.id = u.curso_id";

// Usuario para el login (con el hash de la contraseña)
export const getUsuarioLogin = async (dni) => {
    const sql = `SELECT u.id, u.nombre_completo, u.password_hash, u.estado, r.nombre AS rol
                 FROM usuarios u JOIN roles r ON r.id = u.rol_id WHERE u.dni = ?`;
    const [rows] = await connection.query(sql, [dni]);
    return rows[0];
};

// Rol y estado ACTUALES de quien tiene la sesión (lo usa el middleware)
export const getSesion = async (id) => {
    const sql = `SELECT u.id, u.nombre_completo, u.estado, r.nombre AS rol
                 FROM usuarios u JOIN roles r ON r.id = u.rol_id WHERE u.id = ?`;
    const [rows] = await connection.query(sql, [id]);
    return rows[0];
};

export const getUsuarioPorId = async (id) => {
    const [rows] = await connection.query(`SELECT ${COLUMNAS} ${DESDE} WHERE u.id = ?`, [id]);
    return rows[0];
};

export const getUsuarioPorDni = async (dni) => {
    const [rows] = await connection.query(`SELECT ${COLUMNAS} ${DESDE} WHERE u.dni = ?`, [dni]);
    return rows[0];
};

// Otros usuarios que ya usan ese DNI o ese correo
export const buscarRepetidos = async (dni, correo, idPropio = 0) => {
    const sql = "SELECT dni, correo, nombre_completo FROM usuarios WHERE (dni = ? OR correo = ?) AND id <> ?";
    const [rows] = await connection.query(sql, [dni, correo, idPropio]);
    return rows;
};

// Otro usuario que ya usa ese correo (Mi perfil)
export const buscarCorreoRepetido = async (correo, idPropio) => {
    const sql = "SELECT nombre_completo FROM usuarios WHERE correo = ? AND id <> ?";
    const [rows] = await connection.query(sql, [correo, idPropio]);
    return rows;
};

// ID del curso por nombre. Si no existe, lo crea (INSERT IGNORE no falla si ya está).
const getIdCurso = async (nombre) => {
    if (!nombre) return null;
    await connection.query("INSERT IGNORE INTO cursos (nombre) VALUES (?)", [nombre]);
    const [rows] = await connection.query("SELECT id FROM cursos WHERE nombre = ?", [nombre]);
    return rows[0].id;
};

export const crearUsuario = async ({ dni, nombre_completo, rol, curso, correo, telefono, direccion, password_hash }) => {
    const sql = `INSERT INTO usuarios (dni, nombre_completo, curso_id, correo, telefono, direccion, password_hash, rol_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, (SELECT id FROM roles WHERE nombre = ?))`;
    const [resultado] = await connection.query(sql,
        [dni, nombre_completo, await getIdCurso(curso), correo, telefono, direccion, password_hash, rol]);
    return resultado.insertId;
};

// La contraseña solo cambia si viene password_hash (COALESCE deja la que estaba)
export const actualizarUsuario = async (id, { dni, nombre_completo, rol, curso, correo, telefono, direccion, password_hash }) => {
    const sql = `UPDATE usuarios SET dni = ?, nombre_completo = ?, curso_id = ?, correo = ?, telefono = ?, direccion = ?,
                 rol_id = (SELECT id FROM roles WHERE nombre = ?), password_hash = COALESCE(?, password_hash)
                 WHERE id = ?`;
    const [resultado] = await connection.query(sql,
        [dni, nombre_completo, await getIdCurso(curso), correo, telefono, direccion, rol, password_hash, id]);
    return resultado.affectedRows;
};
