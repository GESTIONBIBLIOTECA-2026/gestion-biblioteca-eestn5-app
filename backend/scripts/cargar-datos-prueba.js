/* ==========================================================================
   cargar-datos-prueba.js - Ejecuta datos-prueba-grupo5.sql en la base del .env
   Uso (desde backend/):  node scripts/cargar-datos-prueba.js
   Correr antes "npm run db:init" (crea tablas y la columna anio_inscripcion).
   ========================================================================== */

import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import connection from "../src/database/db.js";
import { DB } from "../src/config/config.js";

const rutaDatos = fileURLToPath(new URL("./datos-prueba-grupo5.sql", import.meta.url));

// Todo por la MISMA conexión: la variable @clave_demo vive en la sesión.
// Si db.js exporta un pool se pide una conexión; si es una conexión, se usa directo.
const esPool = typeof connection.getConnection === "function";
const conexion = esPool ? await connection.getConnection() : connection;

try {
    const datos = await readFile(rutaDatos, "utf8");
    const sentencias = datos
        .replace(/^\s*--.*$/gm, "")
        .split(";")
        .map((sentencia) => sentencia.trim())
        .filter(Boolean);

    // Transacción: se guarda todo o nada
    await conexion.beginTransaction();
    try {
        for (const sentencia of sentencias) {
            await conexion.query(sentencia);
        }
        await conexion.commit();
    } catch (error) {
        await conexion.rollback();
        throw error;
    }

    console.log(`Datos de prueba cargados en "${DB.database}" (${sentencias.length} sentencias).`);
} finally {
    if (esPool) conexion.release();
    await connection.end();
}
