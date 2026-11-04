/* ==========================================================================
   limiteIntentos.middleware.js - Freno contra adivinar contraseñas
   Después de 5 logins fallidos, esa IP queda bloqueada 5 minutos.
   ========================================================================== */

const MAX_INTENTOS = 5;
const BLOQUEO_MS = 5 * 60 * 1000;
const intentos = new Map();   // ip → { cantidad, hasta }

export const limitarIntentos = (req, res, next) => {

    const registro = intentos.get(req.ip);

    // 1. ¿Está bloqueada?
    if (registro?.hasta > Date.now()) {
        return res.status(429).json({ error: "Demasiados intentos fallidos. Esperá unos minutos y probá de nuevo." });
    }

    // 2. Cuando termina la respuesta: 401 suma un intento, 200 los borra
    res.on("finish", () => {
        if (res.statusCode === 200) return intentos.delete(req.ip);
        if (res.statusCode !== 401) return;

        const cantidad = registro && !registro.hasta ? registro.cantidad + 1 : 1;
        intentos.set(req.ip, { cantidad, hasta: cantidad >= MAX_INTENTOS ? Date.now() + BLOQUEO_MS : null });
    });

    next();
};
