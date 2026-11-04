/* ==========================================================================
   usuarios.controllers.js - Controlador de Usuarios · Grupo 5
   Recibe la petición (req), llama al Modelo, aplica las reglas de negocio
   y arma la respuesta (res) con su código HTTP.
   ========================================================================== */

import bcrypt from "bcryptjs";
import {
    getUsuarioPorId, getUsuarioPorDni, buscarRepetidos, crearUsuario, actualizarUsuario
} from "../models/usuario.models.js";
import { buscarUsuarios } from "../models/busqueda.models.js";

// Error inesperado (la base no responde, etc.) → 500. Lo usan también los otros controladores.
export const error500 = (res, error, mensaje) => {
    console.error(`${mensaje}:`, error.message);
    return res.status(500).json({ error: mensaje });
};

// Si el DNI o el correo ya son de otro usuario → { dni: "...", correo: "..." }
const camposRepetidos = async ({ dni, correo }, idPropio) => {
    const campos = {};
    (await buscarRepetidos(dni, correo, idPropio)).forEach((otro) => {
        if (otro.dni === dni) campos.dni = `Ese DNI ya es de ${otro.nombre_completo}.`;
        if (otro.correo === correo) campos.correo = `Ese correo ya es de ${otro.nombre_completo}.`;
    });
    return campos;
};

/* --- GET /api/usuarios?nombre=&dni=&curso=&filtro=&pagina= --- */
export const getUsuarios = async (req, res) => {
    try {
        return res.json({ payload: await buscarUsuarios(req.filtros) });
    } catch (error) {
        return error500(res, error, "No se pudieron buscar los usuarios");
    }
};

/* --- GET /api/usuarios/:id --- */
export const getUsuario = async (req, res) => {
    try {
        const usuario = await getUsuarioPorId(req.id);
        if (!usuario) return res.status(404).json({ error: "No hay ningún usuario con ese ID." });
        return res.json({ payload: usuario });
    } catch (error) {
        return error500(res, error, "No se pudo leer el usuario");
    }
};

/* --- GET /api/usuarios/dni/:dni   (para que el Grupo 4 valide al usuario antes de un préstamo) --- */
export const getUsuarioDni = async (req, res) => {
    try {
        const usuario = await getUsuarioPorDni(req.dni);
        if (!usuario) return res.status(404).json({ error: "No hay ningún usuario con ese DNI." });
        return res.json({ payload: { ...usuario, puede_pedir: usuario.condicion === "habilitado" } });
    } catch (error) {
        return error500(res, error, "No se pudo leer el usuario");
    }
};

/* --- POST /api/usuarios   Body: { nombre_completo, dni, rol, curso, correo, telefono, direccion, clave } --- */
export const postUsuario = async (req, res) => {
    try {
        const { clave, ...datos } = req.body;

        // 1. El DNI y el correo no pueden estar repetidos
        const campos = await camposRepetidos(datos);
        if (Object.keys(campos).length > 0) {
            return res.status(409).json({ error: Object.values(campos)[0], campos });
        }

        // 2. Se guarda con la contraseña como hash bcrypt
        const id = await crearUsuario({ ...datos, password_hash: await bcrypt.hash(clave, 10) });

        return res.status(201).json({ mensaje: `Se registró a ${datos.nombre_completo}.`, payload: { id } });
    } catch (error) {
        return error500(res, error, "No se pudo guardar el usuario");
    }
};

/* --- PUT /api/usuarios/:id   (la clave es opcional: vacía = no se cambia) --- */
export const putUsuario = async (req, res) => {
    try {
        const { clave, ...datos } = req.body;

        // 1. Un administrador no puede sacarse el rol a sí mismo (se quedaría afuera del panel)
        if (req.id === req.usuario.id && datos.rol !== "administrador") {
            const mensaje = "No podés quitarte el rol de administrador a vos mismo.";
            return res.status(409).json({ error: mensaje, campos: { rol: mensaje } });
        }

        // 2. DNI y correo repetidos
        const campos = await camposRepetidos(datos, req.id);
        if (Object.keys(campos).length > 0) {
            return res.status(409).json({ error: Object.values(campos)[0], campos });
        }

        // 3. Guardar (si no existe, no se modificó ninguna fila)
        const hash = clave ? await bcrypt.hash(clave, 10) : null;
        const modificados = await actualizarUsuario(req.id, { ...datos, password_hash: hash });

        if (modificados === 0) return res.status(404).json({ error: "No hay ningún usuario con ese ID." });

        return res.json({ mensaje: `Se guardaron los cambios de ${datos.nombre_completo}.` });
    } catch (error) {
        return error500(res, error, "No se pudieron guardar los cambios");
    }
};
