/* ==========================================================================
   sanciones.controllers.js - Historial activo y estado de la cuenta · Grupo 5
   Suspender, habilitar (o reactivar) y dar de baja, con sus reglas de negocio.
   ========================================================================== */

import { getUsuarioPorId } from "../models/usuario.models.js";
import { getHistorial, suspenderUsuario, habilitarUsuario, darDeBajaUsuario } from "../models/sancion.models.js";
import { error500 } from "./respuestas.js";

// Usuario + historial activo + resumen (usado por getMiHistorial y getHistorialUsuario)
const armarHistorial = async (id) => {
    const usuario = await getUsuarioPorId(id);
    if (!usuario) return null;

    const { prestamos, sanciones } = await getHistorial(id);

    // Resumen con HOFs (.filter)
    const resumen = {
        entregas: prestamos.filter((p) => p.fecha_entrega).length,
        devoluciones: prestamos.filter((p) => p.estado === "devuelto").length,
        atrasos: prestamos.filter((p) => p.dias_atraso > 0).length,
        en_curso: prestamos.filter((p) => ["prestado", "vencido"].includes(p.estado)).length,
        reservas: prestamos.filter((p) => p.estado === "pendiente").length
    };

    return { usuario, resumen, prestamos, sanciones };
};

/* --- GET /api/perfil/historial   Mi cuenta: el historial del usuario logueado --- */
export const getMiHistorial = async (req, res) => {
    try {
        const payload = await armarHistorial(req.usuario.id);
        if (!payload) return res.status(404).json({ error: "No se encontró el perfil del usuario." });
        return res.json({ payload });
    } catch (error) {
        return error500(res, error, "No se pudo cargar tu cuenta");
    }
};

/* --- GET /api/usuarios/:id/historial   Historial activo + resumen para el administrador --- */
export const getHistorialUsuario = async (req, res) => {
    try {
        const payload = await armarHistorial(req.id);
        if (!payload) return res.status(404).json({ error: "No hay ningún usuario con ese ID." });
        return res.json({ payload });
    } catch (error) {
        return error500(res, error, "No se pudo cargar el historial");
    }
};

/* --- PATCH /api/usuarios/:id/estado   Body: { estado: "suspendido" | "habilitado" | "baja", motivo } --- */
export const patchEstado = async (req, res) => {
    try {
        const { estado, motivo } = req.body;

        if (req.id === req.usuario.id && estado !== "habilitado") {
            return res.status(409).json({ error: "No podés suspender ni dar de baja tu propio usuario." });
        }

        const usuario = await getUsuarioPorId(req.id);
        if (!usuario) return res.status(404).json({ error: "No hay ningún usuario con ese ID." });

        const nombre = usuario.nombre_completo;

        // --- Suspender ---
        if (estado === "suspendido") {
            if (usuario.estado === "baja") return res.status(409).json({ error: "El usuario está dado de baja. Reactivalo primero." });
            if (usuario.condicion === "suspendido") return res.status(409).json({ error: "El usuario ya está suspendido." });

            await suspenderUsuario(req.id, motivo, req.usuario.id);
            return res.json({ mensaje: `Se suspendió a ${nombre}: no puede pedir libros hasta que lo habilites.` });
        }

        // --- Habilitar / reactivar ---
        if (estado === "habilitado") {
            if (usuario.condicion === "habilitado") return res.status(409).json({ error: "El usuario ya está habilitado." });

            await habilitarUsuario(req.id);
            const aviso = usuario.condicion === "atraso" ? " Igual tiene un préstamo atrasado: no va a poder pedir libros hasta devolverlo." : "";
            return res.json({ mensaje: `Se habilitó a ${nombre}.${aviso}` });
        }

        // --- Dar de baja (lógica: no se borra, queda el historial) ---
        if (usuario.estado === "baja") return res.status(409).json({ error: "El usuario ya está dado de baja." });
        if (usuario.prestamos_en_curso > 0) {
            return res.status(409).json({ error: `No se puede dar de baja: tiene ${usuario.prestamos_en_curso} libro(s) sin devolver.` });
        }

        const canceladas = await darDeBajaUsuario(req.id, req.usuario.id);
        const reservas = canceladas > 0 ? ` Se cancelaron ${canceladas} reserva(s) pendiente(s).` : "";
        return res.json({ mensaje: `Se dio de baja a ${nombre}.${reservas}` });

    } catch (error) {
        return error500(res, error, "No se pudo cambiar el estado del usuario");
    }
};
