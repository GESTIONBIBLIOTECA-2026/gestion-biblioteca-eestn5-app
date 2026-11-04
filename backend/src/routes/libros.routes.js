/* ==========================================================================
   libros.routes.js - Rutas del Catálogo  (/api/libros) · Grupo 6
   Solo lectura: el alumno o docente busca libros y mira su disponibilidad.
   ========================================================================== */

import express from "express";
import { getCatalogo, getLibro, getListaCategorias } from "../controllers/libros.controllers.js";
import { verificarSesion } from "../middlewares/auth.middleware.js";
import { validarID } from "../middlewares/validaciones.middleware.js";
import { validarFiltrosLibros } from "../middlewares/libros.middleware.js";

const router = express.Router();

router.use(verificarSesion);                                    // todas piden sesión

router.get("/", validarFiltrosLibros, getCatalogo);             // catálogo + buscador
router.get("/categorias", getListaCategorias);                  // para los selectores
router.get("/:id", validarID, getLibro);                        // un libro con su stock

export default router;
