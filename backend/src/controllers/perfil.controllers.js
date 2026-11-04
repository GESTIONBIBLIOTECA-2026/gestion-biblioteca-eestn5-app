/* ==========================================================================
   perfil.controllers.js - "Mi perfil" (pantalla Configuración)
   Siempre se usa req.usuario.id (sale del token), nunca un ID del navegador.
   ========================================================================== */

import bcrypt from "bcryptjs";
import { getUsuarioPorId, buscarCorreoRepetido } from "../models/usuario.models.js";
import { actualizarPerfil, getHashClave, actualizarClave } from "../models/perfil.models.js";
import { error500 } from "./respuestas.js";


/* --- GET /api/perfil --- */
export const getMiPerfil = async (req, res) => {
    try {
        const usuario = await getUsuarioPorId(req.usuario.id);
        return res.json({ payload: usuario });
    } catch (error) {
        return error500(res, error, "No se pudieron leer tus datos");
    }
};


/* --- PUT /api/perfil   Body: { nombre_completo, correo, telefono, direccion } --- */
export const putMiPerfil = async (req, res) => {
    try {
        const { id } = req.usuario;

        // 1. El correo no puede ser de otro usuario
        const [repetido] = await buscarCorreoRepetido(req.body.correo, id);
        if (repetido) {
            const mensaje = `Ese correo ya es de ${repetido.nombre_completo}.`;
            return res.status(409).json({ error: mensaje, campos: { correo: mensaje } });
        }

        // 2. Guardar y devolver los datos actualizados
        await actualizarPerfil(id, req.body);
        const usuario = await getUsuarioPorId(id);

        return res.json({ mensaje: "Se guardaron los cambios de tu perfil.", payload: usuario });

    } catch (error) {
        return error500(res, error, "No se pudieron guardar tus datos");
    }
};


/* --- PUT /api/perfil/clave   Body: { clave_actual, clave_nueva, confirmacion } --- */
export const putMiClave = async (req, res) => {
    try {
        const { clave_actual, clave_nueva } = req.body;

        // 1. La contraseña actual tiene que coincidir con la guardada
        const hash = await getHashClave(req.usuario.id);
        if (!(await bcrypt.compare(clave_actual, hash))) {
            const mensaje = "La contraseña actual no es correcta.";
            return res.status(400).json({ error: mensaje, campos: { clave_actual: mensaje } });
        }

        // 2. Se guarda la nueva como hash bcrypt (nunca en texto)
        await actualizarClave(req.usuario.id, await bcrypt.hash(clave_nueva, 10));

        return res.json({ mensaje: "Tu contraseña se cambió correctamente." });

    } catch (error) {
        return error500(res, error, "No se pudo cambiar la contraseña");
    }
};
