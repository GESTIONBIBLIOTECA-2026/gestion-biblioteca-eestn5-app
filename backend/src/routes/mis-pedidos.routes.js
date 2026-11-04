/* API privada del alumno móvil: solo devuelve/crea pedidos del usuario autenticado. */
import express from "express";
import { verificarAlumno } from "../middlewares/auth.middleware.js";
import { getPerfilAlumno, getCatalogoAlumno, postMiPedido, getMiHistorial } from "../controllers/mis-pedidos.controllers.js";

const router = express.Router();
router.use(verificarAlumno);
router.get("/perfil", getPerfilAlumno);
router.get("/libros", getCatalogoAlumno);
router.get("/historial", getMiHistorial);
router.post("/", postMiPedido);
export default router;
