/* ==========================================================================
   validaciones.middleware.js - Validación de parámetros y consultas
   Frenan los datos mal cargados ANTES de llegar al controlador y a la base.
   Si algo está mal: return res.status(400). Si está bien: next().
   Los formularios (alta, modificación, perfil y contraseña) están en formularios.middleware.js
   ========================================================================== */

import { ESTADOS, FILTROS, USUARIOS_POR_PAGINA } from "../config/config.js";
import { limpiar, limpiarDni, esDniValido, rechazar } from "./predicados.js";

/* --- ID de la URL: /api/usuarios/:id o /api/libros/:id --- */
export const validarID = (req, res, next) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "El ID tiene que ser un número entero mayor a 0." });
    }

    req.id = id;
    next();
};

/* --- DNI de la URL: /api/usuarios/dni/:dni --- */
export const validarDniParam = (req, res, next) => {
    req.dni = limpiarDni(req.params.dni);

    if (!esDniValido(req.dni)) {
        return res.status(400).json({ error: "El DNI tiene que tener entre 7 y 8 números." });
    }

    next();
};

/* --- Login: { dni, clave } --- */
export const validarLogin = (req, res, next) => {
    const dni = limpiarDni(req.body?.dni);
    const clave = String(req.body?.clave ?? "");

    if (!esDniValido(dni) || !clave) {
        return res.status(400).json({ error: "Completá el DNI (7 u 8 números) y la contraseña." });
    }

    req.body = { dni, clave };
    next();
};

/* --- ?limite= de los últimos préstamos (1 a 50, por defecto 5) --- */
export const validarLimite = (req, res, next) => {
    req.limite = Number(req.query.limite ?? 5);

    if (!Number.isInteger(req.limite) || req.limite < 1 || req.limite > 50) {
        return res.status(400).json({ error: "El límite tiene que ser un número entre 1 y 50." });
    }

    next();
};

/* --- Búsqueda: ?nombre=&dni=&curso=&filtro=&pagina= --- */
export const validarBusqueda = (req, res, next) => {
    const { nombre, dni, curso, filtro = "todos", pagina = 1 } = req.query;

    req.filtros = {
        nombre: limpiar(nombre).slice(0, 120),
        dni: limpiarDni(dni).slice(0, 8),
        curso: limpiar(curso).slice(0, 30),
        filtro,
        pagina: Number(pagina),
        porPagina: USUARIOS_POR_PAGINA
    };

    if (!FILTROS.includes(filtro) || !Number.isInteger(req.filtros.pagina) || req.filtros.pagina < 1) {
        return res.status(400).json({ error: "El filtro o la página no son válidos." });
    }

    next();
};

/* --- Cambio de estado: { estado, motivo } --- */
export const validarEstado = (req, res, next) => {
    const estado = String(req.body?.estado ?? "");
    const motivo = limpiar(req.body?.motivo).slice(0, 255);

    if (!ESTADOS.includes(estado)) {
        return res.status(400).json({ error: "El estado tiene que ser habilitado, suspendido o baja." });
    }

    if (estado === "suspendido" && motivo.length < 3) {
        return rechazar(res, { motivo: "Escribí el motivo de la suspensión." });
    }

    req.body = { estado, motivo: motivo || null };
    next();
};
