/* ==========================================================================
   auth.controllers.js - Controlador de Autenticación
   ========================================================================== */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getUsuarioLogin } from "../models/usuario.models.js";
import { JWT_SECRET, JWT_DURACION, ROLES_APP } from "../config/config.js";
import { puedeEntrar } from "../middlewares/auth.middleware.js";
import { error500 } from "./respuestas.js";

// Hash de relleno: si el DNI no existe igual se compara una clave (así no se puede adivinar qué DNI existe)
const HASH_FALSO = bcrypt.hashSync("clave-inexistente", 10);


/* --- POST /api/auth/login   Body: { dni, clave } --- */
export const postLogin = async (req, res) => {
    try {
        const { dni, clave } = req.body;

        // 1. Pedirle el usuario al Modelo y comparar la contraseña con el hash
        const usuario = await getUsuarioLogin(dni);
        const claveOk = await bcrypt.compare(clave, usuario?.password_hash ?? HASH_FALSO);

        if (!usuario || !claveOk) {
            return res.status(401).json({ error: "DNI o contraseña incorrectos." });
        }

        // 2. Reglas de negocio: la app es solo para alumnos y docentes.
        //    De baja no entra nadie; un alumno/docente suspendido sí (ve su estado en el inicio).
        if (!ROLES_APP.includes(usuario.rol)) {
            return res.status(403).json({ error: "Esta app es para alumnos y docentes. Usá la plataforma web de escritorio." });
        }

        if (!puedeEntrar(usuario)) {
            return res.status(403).json({ error: "Tu usuario está dado de baja." });
        }

        // 3. Token de sesión (nunca se manda el password_hash)
        const sesion = { id: usuario.id, nombre: usuario.nombre_completo, rol: usuario.rol };
        const token = jwt.sign(sesion, JWT_SECRET, { expiresIn: JWT_DURACION });

        return res.json({ payload: { token, usuario: sesion } });

    } catch (error) {
        return error500(res, error, "No se pudo conectar con la base de datos");
    }
};


/* --- GET /api/auth/perfil   Quién está logueado: { id, nombre, rol } (lo carga el middleware) --- */
export const getPerfil = (req, res) => res.json({ payload: req.usuario });
