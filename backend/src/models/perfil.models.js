/* ==========================================================================
   perfil.models.js - "Mi perfil": datos propios y contraseña
   ========================================================================== */

import connection from "../database/db.js";

export const getHashClave = async (id) => {
    const [rows] = await connection.query("SELECT password_hash FROM usuarios WHERE id = ?", [id]);
    return rows[0]?.password_hash;
};

export const actualizarPerfil = async (id, { nombre_completo, correo, telefono, direccion }) => {
    const sql = "UPDATE usuarios SET nombre_completo = ?, correo = ?, telefono = ?, direccion = ? WHERE id = ?";
    await connection.query(sql, [nombre_completo, correo, telefono, direccion, id]);
};

export const actualizarClave = async (id, password_hash) => {
    await connection.query("UPDATE usuarios SET password_hash = ? WHERE id = ?", [password_hash, id]);
};
