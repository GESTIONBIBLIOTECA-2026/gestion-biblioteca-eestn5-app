/* ==========================================================================
   respuestas.js - Respuestas HTTP que repiten varios controladores
   ========================================================================== */

// Error inesperado (la base no responde, etc.) → 500 con un mensaje claro
export const error500 = (res, error, mensaje) => {
    console.error(`${mensaje}:`, error.message);
    return res.status(500).json({ error: mensaje });
};
