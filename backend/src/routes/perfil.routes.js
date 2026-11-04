/* ==========================================================================
   perfil.routes.js - Rutas de "Mi perfil" y "Mi cuenta"  (/api/perfil)
   Las usan los alumnos y docentes de la app.
   Siempre trabajan con el usuario del token, nunca con un ID que mande el navegador.
   ========================================================================== */

import express from "express";
import { getMiPerfil, putMiPerfil, putMiClave } from "../controllers/perfil.controllers.js";
import { getMiHistorial } from "../controllers/sanciones.controllers.js";
import { verificarSesion } from "../middlewares/auth.middleware.js";
import { validarPerfil, validarClave } from "../middlewares/formularios.middleware.js";

const router = express.Router();

router.use(verificarSesion);                          // todas piden sesión (cualquier rol)

router.get("/", getMiPerfil);                         // GET /api/perfil
router.get("/historial", getMiHistorial);             // GET /api/perfil/historial  (inicio del alumno/docente)
router.put("/", validarPerfil, putMiPerfil);          // PUT /api/perfil
router.put("/clave", validarClave, putMiClave);       // PUT /api/perfil/clave

export default router;
