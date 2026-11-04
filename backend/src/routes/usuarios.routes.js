/* ==========================================================================
   usuarios.routes.js - Rutas de usuarios  (/api/usuarios) · Grupo 5
   ========================================================================== */

import express from "express";
import { getUsuarios, getUsuario, getUsuarioDni, postUsuario, putUsuario } from "../controllers/usuarios.controllers.js";
import { getHistorialUsuario, patchEstado } from "../controllers/sanciones.controllers.js";
import { verificarAdmin } from "../middlewares/auth.middleware.js";
import { validarID, validarDniParam, validarBusqueda, validarEstado } from "../middlewares/validaciones.middleware.js";
import { validarUsuario } from "../middlewares/formularios.middleware.js";

const router = express.Router();

router.use(verificarAdmin);                                              // todas piden sesión de administrador

router.get("/", validarBusqueda, getUsuarios);                           // búsqueda avanzada + listado
router.get("/dni/:dni", validarDniParam, getUsuarioDni);                 // ficha por DNI (Grupo 4)
router.get("/:id", validarID, getUsuario);                               // datos de un usuario
router.get("/:id/historial", validarID, getHistorialUsuario);            // historial activo
router.post("/", validarUsuario, postUsuario);                           // alta
router.put("/:id", validarID, validarUsuario, putUsuario);               // modificación
router.patch("/:id/estado", validarID, validarEstado, patchEstado);      // suspender / habilitar / baja

export default router;
