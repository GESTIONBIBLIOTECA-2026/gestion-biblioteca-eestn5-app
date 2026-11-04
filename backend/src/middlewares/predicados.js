/* ==========================================================================
   predicados.js - Limpieza y funciones predicado de validación
   Los usan validaciones.middleware.js (URL / query) y formularios.middleware.js (body).
   Cada predicado responde una pregunta con true / false: esDniValido("30111222") → true
   ========================================================================== */

// Limpieza: espacios de más afuera y "30.111.222" → "30111222"
export const limpiar = (valor) => String(valor ?? "").trim().replace(/\s+/g, " ");
export const limpiarDni = (dni) => String(dni ?? "").replace(/[.\s]/g, "");   // "30.111.222" → "30111222"

// Funciones predicado: preguntan "¿es válido?" y devuelven true / false
export const esDniValido      = (dni)      => /^\d{7,8}$/.test(String(dni ?? ""));
export const esNombreValido   = (nombre)   => /^\p{L}[\p{L} .'-]*$/u.test(String(nombre ?? ""));
export const esCorreoValido   = (correo)   => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(correo ?? ""));
export const esTelefonoValido = (telefono) => /^[\d\s()+-]{6,30}$/.test(String(telefono ?? ""));

// Responde 400 con el primer error y todos los campos marcados: { error, campos }
export const rechazar = (res, campos) => res.status(400).json({
    error: Object.keys(campos).length === 1 ? Object.values(campos)[0] : "Revisá los campos marcados.",
    campos
});
