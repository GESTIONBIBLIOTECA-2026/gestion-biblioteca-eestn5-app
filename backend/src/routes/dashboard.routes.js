import express from "express";
import { getDashboard } from "../controllers/dashboard.controllers.js";
import { verificarAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();


router.get("/", verificarAdmin, getDashboard);

export default router;
