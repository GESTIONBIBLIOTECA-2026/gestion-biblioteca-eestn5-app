/* ==========================================================================
   errores.models.js - Errores de negocio que lanzan los Modelos
   El Modelo NO sabe de HTTP: dice QUÉ pasó ("NO_EXISTE" o "CONFLICTO")
   y el Controlador decide el código (404 o 409) en respuestas.js.
   ========================================================================== */

export class ErrorNegocio extends Error {
    constructor(tipo, mensaje) {
        super(mensaje);
        this.tipo = tipo;   // "NO_EXISTE" | "CONFLICTO"
    }
}

export const noExiste = (mensaje) => new ErrorNegocio("NO_EXISTE", mensaje);
export const conflicto = (mensaje) => new ErrorNegocio("CONFLICTO", mensaje);
