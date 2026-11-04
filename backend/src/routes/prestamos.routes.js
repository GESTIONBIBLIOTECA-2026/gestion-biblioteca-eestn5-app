/* Rutas del módulo Grupo 4: /api/prestamos */
import express from "express";
import { getPrestamos, postPedido, patchEstadoPedido, getHistorialPedidos, postActualizarVencidos } from "../controllers/prestamos.controllers.js";
import { verificarAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.use(verificarAdmin);
router.get("/", getPrestamos);
router.get("/historial", getHistorialPedidos);
router.post("/", postPedido);
router.post("/actualizar-vencidos", postActualizarVencidos);
router.patch("/:id/estado", patchEstadoPedido);

export default router;
