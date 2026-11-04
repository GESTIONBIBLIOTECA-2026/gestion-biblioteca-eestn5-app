/* ==========================================================================
   env.js - Infraestructura: variables de entorno del archivo .env
   Fail-fast: si falta una variable obligatoria, el servidor NO arranca
   y avisa cuál es (nada de "localhost" ni "root" por defecto).
   ========================================================================== */

import dotenv from "dotenv";
import { fileURLToPath } from "url";

// 1. Carpeta backend/ (así el .env y el ca.pem se encuentran aunque se arranque desde otra carpeta)
export const CARPETA_BACKEND = fileURLToPath(new URL("../../", import.meta.url));

dotenv.config({ path: `${CARPETA_BACKEND}.env`, quiet: true });

// 2. Variables sin las que el sistema no puede funcionar (Aiven Cloud + sesión)
const OBLIGATORIAS = ["JWT_SECRET", "DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"];
const faltantes = OBLIGATORIAS.filter((nombre) => !process.env[nombre]);

if (faltantes.length > 0) {
    console.error(`❌ Faltan variables en backend/.env: ${faltantes.join(", ")} (mirá .env.example)`);
    process.exit(1);
}

// 3. Servidor y sesión
export const PORT = Number(process.env.PORT) || 3000;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_DURACION = "8h";

// 4. Base de datos MySQL en Aiven (exige SSL: solo se apaga con DB_SSL=false)
export const DB = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL !== "false",
    caPath: process.env.DB_CA_PATH ? `${CARPETA_BACKEND}${process.env.DB_CA_PATH}` : "",
    zonaHoraria: process.env.DB_ZONA_HORARIA || "-03:00"
};
