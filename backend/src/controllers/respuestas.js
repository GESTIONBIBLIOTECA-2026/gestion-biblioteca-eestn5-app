/* ==========================================================================
   respuestas.js - Respuestas HTTP que repiten varios controladores
   ========================================================================== */

import { ErrorNegocio } from "../models/errores.models.js";

const STATUS_NEGOCIO = { NO_EXISTE: 404, CONFLICTO: 409 };

// Error inesperado (la base no responde, etc.) → 500 con un mensaje claro
export const error500 = (res, error, mensaje) => {
    console.error(`${mensaje}:`, error.message);
    return res.status(500).json({ error: mensaje });
};

// Dato repetido o regla de negocio rota → 409 con los campos marcados { error, campos }
export const responder409 = (res, campos) => res.status(409).json({ error: Object.values(campos)[0], campos });

// El Modelo avisó una regla de negocio (404 / 409); cualquier otra cosa es un 500
export const responderError = (res, error, mensaje) => (error instanceof ErrorNegocio
    ? res.status(STATUS_NEGOCIO[error.tipo]).json({ error: error.message })
    : error500(res, error, mensaje));
