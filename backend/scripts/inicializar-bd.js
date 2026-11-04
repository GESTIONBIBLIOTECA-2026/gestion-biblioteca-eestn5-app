import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import connection from "../src/database/db.js";
import { DB } from "../src/config/config.js";

const rutaEsquema = fileURLToPath(new URL("./schema.sql", import.meta.url));

try {
    const esquema = await readFile(rutaEsquema, "utf8");
    const sentencias = esquema
        .replace(/^\s*--.*$/gm, "")
        .split(";")
        .map((sentencia) => sentencia.trim())
        .filter(Boolean);

    for (const sentencia of sentencias) {
        await connection.query(sentencia);
    }

    const [columnasAnioInscripcion] = await connection.query(
        `SELECT COUNT(*) AS cantidad
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'usuarios'
           AND COLUMN_NAME = 'anio_inscripcion'`
    );

    if (columnasAnioInscripcion[0].cantidad === 0) {
        await connection.query(
            "ALTER TABLE usuarios ADD COLUMN anio_inscripcion SMALLINT UNSIGNED NULL DEFAULT (YEAR(CURRENT_DATE))"
        );
    } else {
        await connection.query(
            "ALTER TABLE usuarios MODIFY COLUMN anio_inscripcion SMALLINT UNSIGNED NULL DEFAULT (YEAR(CURRENT_DATE))"
        );
    }

    console.log(`Base "${DB.database}" inicializada correctamente (${sentencias.length} sentencias).`);
} finally {
    await connection.end();
}
