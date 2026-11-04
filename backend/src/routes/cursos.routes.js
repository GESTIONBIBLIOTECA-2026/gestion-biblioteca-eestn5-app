/* ==========================================================================
   cursos.routes.js - Rutas de cursos  (/api/cursos)
   ========================================================================== */

import express from "express";
import { getListaCursos } from "../controllers/cursos.controllers.js";
import { verificarAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verificarAdmin, getListaCursos);   // GET /api/cursos

export default router;
