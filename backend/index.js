/* ==========================================================================
   index.js - Servidor Express · Biblioteca Invaluable App & Panel
   Circuito:  index.js ➔ Router ➔ Controller ➔ Model ➔ MySQL
   ========================================================================== */

// 1. Frameworks, configuración y rutas
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { PORT } from "./src/config/config.js";
import { comprobarConexion } from "./src/database/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import perfilRoutes from "./src/routes/perfil.routes.js";
import librosRoutes from "./src/routes/libros.routes.js";
import usuariosRoutes from "./src/routes/usuarios.routes.js";
import cursosRoutes from "./src/routes/cursos.routes.js";
import prestamosRoutes from "./src/routes/prestamos.routes.js";
import misPedidosRoutes from "./src/routes/mis-pedidos.routes.js";
import dashboardRoutes from "./src/routes/dashboard.routes.js";

// 2. Aplicación y middlewares globales
const app = express();
app.use(cors());           // permite al navegador a recibir la respuesta
app.use(express.json());
// La API usa rutas relativas ("/api"), así que el frontend lo sirve este mismo servidor
const CARPETA_FRONTEND = fileURLToPath(new URL("../frontend", import.meta.url));
app.use(express.static(CARPETA_FRONTEND));   // app y panel en http://localhost:3000

// 3. Rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/perfil", perfilRoutes);
app.use("/api/libros", librosRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/cursos", cursosRoutes);
app.use("/api/prestamos", prestamosRoutes);
app.use("/api/mis-pedidos", misPedidosRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 4. Ruta que no existe → 404
app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

// 5. Middleware de errores (4 parámetros): JSON mal armado u errores no previstos
app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ error: "El cuerpo de la petición no es un JSON válido." });
    }
    console.error("Error no controlado:", err);
    res.status(500).json({ error: "Error interno del servidor" });
});

// 6. Encender el servidor y probar la base de datos
app.listen(PORT, async () => {
    console.log(`🚀 Servidor activo en http://localhost:${PORT}`);
    await comprobarConexion();
});
