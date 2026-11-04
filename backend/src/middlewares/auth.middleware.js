/* ==========================================================================
   auth.middleware.js - "Molinete" de las rutas protegidas
   - verificarSesion: sesión válida de usuario (alumno, docente o admin)
   - verificarAdmin: exige rol administrador habilitado
   - verificarAlumno: exige rol alumno no dado de baja
   ========================================================================== */

import jwt from "jsonwebtoken";
import { JWT_SECRET, ROLES_APP } from "../config/config.js";
import { getSesion } from "../models/usuario.models.js";

// Regla de acceso básica: rol permitido en la plataforma y no dado de baja
export const puedeEntrar = ({ rol, estado }) => ROLES_APP.includes(rol) && estado !== "baja";

export const verificarSesion = async (req, res, next) => {
    const [tipo, token] = (req.headers.authorization || "").split(" ");

    if (tipo !== "Bearer" || !token) {
        return res.status(401).json({ error: "Tenés que iniciar sesión." });
    }

    try {
        const { id } = jwt.verify(token, JWT_SECRET);
        const usuario = await getSesion(id);

        if (!usuario || !puedeEntrar(usuario)) {
            return res.status(401).json({ error: "Tu usuario ya no tiene acceso. Iniciá sesión de nuevo." });
        }

        req.usuario = {
            id: usuario.id,
            nombre: usuario.nombre_completo,
            rol: usuario.rol,
            estado: usuario.estado
        };
        next();

    } catch (error) {
        return res.status(401).json({ error: "La sesión venció. Iniciá sesión de nuevo." });
    }
};

export const verificarAdmin = async (req, res, next) => {
    await verificarSesion(req, res, () => {
        if (req.usuario.rol !== "administrador" || req.usuario.estado !== "habilitado") {
            return res.status(403).json({ error: "Tu usuario no tiene permisos de administrador." });
        }
        next();
    });
};

export const verificarAlumno = async (req, res, next) => {
    await verificarSesion(req, res, () => {
        if (req.usuario.rol !== "alumno" || req.usuario.estado === "baja") {
            return res.status(403).json({ error: "La cuenta no tiene acceso al área de alumnos." });
        }
        next();
    });
};
