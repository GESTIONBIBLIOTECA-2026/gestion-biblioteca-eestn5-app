/* ==========================================================================
   config.js - Punto único de configuración
   Re-exporta la infraestructura (env.js) y las reglas del negocio (constants.js),
   así el resto del código sigue importando todo desde "config/config.js".
   ========================================================================== */

export * from "./env.js";
export * from "./constants.js";
