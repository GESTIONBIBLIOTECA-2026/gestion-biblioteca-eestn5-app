/* ==========================================================================
   libros.routes.js - Rutas del Catálogo e Inventario  (/api/libros) · Grupo 6
   Leer el catálogo: cualquier usuario con sesión (el alumno busca y reserva).
   Cargar, modificar, cambiar stock y dar de baja: solo el administrador.
   ========================================================================== */

import express from "express";
import { getCatalogo, getLibro, getResumen, getListaCategorias, postLibro, putLibro, patchStock, deleteLibro } from "../controllers/libros.controllers.js";
import { verificarSesion, verificarAdmin } from "../middlewares/auth.middleware.js";
import { validarID } from "../middlewares/validaciones.middleware.js";
import { validarFiltrosLibros, validarLibro, validarStock } from "../middlewares/libros.middleware.js";

const router = express.Router();

router.get("/", verificarSesion, validarFiltrosLibros, getCatalogo);                 // catálogo + buscador
router.get("/resumen", verificarAdmin, getResumen);                                  // números del inventario
router.get("/categorias", verificarSesion, getListaCategorias);                      // para los selectores
router.get("/:id", verificarSesion, validarID, getLibro);                            // un libro con su stock
router.post("/", verificarAdmin, validarLibro, postLibro);                           // alta
router.put("/:id", verificarAdmin, validarID, validarLibro, putLibro);               // modificación
router.patch("/:id/stock", verificarAdmin, validarID, validarStock, patchStock);     // sumar / sacar ejemplares
router.delete("/:id", verificarAdmin, validarID, deleteLibro);                       // baja lógica

export default router;
