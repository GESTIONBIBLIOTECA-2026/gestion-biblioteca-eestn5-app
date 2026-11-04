/* ==========================================================================
   db.js - Pool de conexiones a MySQL (Aiven) con mysql2
   Los Models importan "connection" y hacen connection.query(sql, [valores])
   ========================================================================== */

import mysql from "mysql2/promise";
import { readFileSync, existsSync } from "fs";
import { DB } from "../config/config.js";

// 1. SSL: con el ca.pem de Aiven se valida el servidor; sin él, va cifrado igual
const ssl = !DB.ssl ? undefined
    : existsSync(DB.caPath) ? { ca: readFileSync(DB.caPath, "utf8") }
    : { rejectUnauthorized: false };

// 2. Pool: conexiones abiertas y reutilizables (los datos salen SOLO del .env)
const connection = mysql.createPool({
    host: DB.host,
    port: DB.port,
    user: DB.user,
    password: DB.password,
    database: DB.database,
    ssl,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true,      // fechas como texto ("2026-10-15"): no se corren de día
    decimalNumbers: true    // SUM() y COUNT() llegan como número
});

// 3. Cada conexión nueva usa la hora de Argentina (NOW(), CURRENT_DATE)
connection.pool.on("connection", (conexion) => {
    conexion.query("SET time_zone = ?", [DB.zonaHoraria]);
});

// 4. Testeo visual de conexión a Aiven Cloud
export const comprobarConexion = async () => {
    try {
        const [filas] = await connection.query("SELECT DATABASE() AS base, VERSION() AS version");
        console.log(`✅ MySQL ${filas[0].version} conectado a la base "${filas[0].base}" en Aiven Cloud`);
    } catch (error) {
        console.error(`❌ Error crítico conectando a Aiven Cloud: ${error.message}`);
    }
};

export default connection;
