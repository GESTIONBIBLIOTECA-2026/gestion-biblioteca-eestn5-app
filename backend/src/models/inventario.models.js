/* ==========================================================================
   inventario.models.js - Alta, modificación, stock y baja de libros · Grupo 6
   Cada operación toca varias tablas (libros, autores, editoriales, ejemplares):
   por eso va en una transacción: se guarda todo o nada.
   ========================================================================== */

import { conTransaccion } from "../database/db.js";
import { bloquearLibro, exigirStock } from "./ejemplar.models.js";
import { noExiste, conflicto } from "./errores.models.js";

// ID de una fila por nombre; si no existe, la crea (editoriales y autores)
const idPorNombre = async (conexion, tabla, columna, nombre) => {
    const [rows] = await conexion.query(`SELECT id FROM ${tabla} WHERE ${columna} = ? LIMIT 1`, [nombre]);
    if (rows[0]) return rows[0].id;
    const [nuevo] = await conexion.query(`INSERT INTO ${tabla} (${columna}) VALUES (?)`, [nombre]);
    return nuevo.insertId;
};

// Editorial, ISBN repetido y autores (lo comparten el alta y la modificación)
const guardarDatos = async (conexion, id, { titulo, autores, editorial, isbn, categoria_id, anio }) => {
    if (isbn) {
        const [repetido] = await conexion.query("SELECT titulo FROM libros WHERE isbn = ? AND id <> ?", [isbn, id ?? 0]);
        if (repetido[0]) throw conflicto(`Ese ISBN ya es de «${repetido[0].titulo}».`);
    }
    const editorialId = editorial ? await idPorNombre(conexion, "editoriales", "nombre", editorial) : null;
    const datos = [isbn, titulo, categoria_id, editorialId, anio];

    if (id) {
        const [r] = await conexion.query(
            "UPDATE libros SET isbn = ?, titulo = ?, categoria_id = ?, editorial_id = ?, anio_publicacion = ? WHERE id = ? AND activo = TRUE",
            [...datos, id]);
        if (r.affectedRows === 0) throw noExiste("No hay ningún libro activo con ese ID.");
        await conexion.query("DELETE FROM libros_autores WHERE libro_id = ?", [id]);
    } else {
        const [r] = await conexion.query(
            "INSERT INTO libros (isbn, titulo, categoria_id, editorial_id, anio_publicacion) VALUES (?, ?, ?, ?, ?)", datos);
        id = r.insertId;
    }
    for (const autor of autores) {
        const autorId = await idPorNombre(conexion, "autores", "nombre_completo", autor);
        await conexion.query("INSERT IGNORE INTO libros_autores (libro_id, autor_id) VALUES (?, ?)", [id, autorId]);
    }
    return id;
};

// Suma ejemplares nuevos con código de inventario INV-<libro>-<número>
const agregarEjemplares = async (conexion, libroId, cantidad) => {
    const [[{ total }]] = await conexion.query("SELECT COUNT(*) AS total FROM ejemplares WHERE libro_id = ?", [libroId]);
    const filas = Array.from({ length: cantidad }, (_, i) => [libroId, `INV-${libroId}-${String(total + i + 1).padStart(3, "0")}`]);
    await conexion.query("INSERT INTO ejemplares (libro_id, codigo_inventario) VALUES ?", [filas]);
};

export const crearLibro = (datos) => conTransaccion(async (conexion) => {
    const id = await guardarDatos(conexion, null, datos);
    await agregarEjemplares(conexion, id, datos.cantidad);
    return id;
});

export const actualizarLibro = (id, datos) => conTransaccion((conexion) => guardarDatos(conexion, id, datos));

// Stock: cambio > 0 suma ejemplares; cambio < 0 da de baja ejemplares que están en el estante
export const cambiarStock = (id, cambio) => conTransaccion(async (conexion) => {
    const libro = await bloquearLibro(conexion, id);
    if (cambio > 0) return agregarEjemplares(conexion, id, cambio);

    await exigirStock(conexion, libro, -cambio);   // no se pueden sacar los que están reservados
    await conexion.query(
        "UPDATE ejemplares SET estado = 'baja' WHERE libro_id = ? AND estado = 'disponible' ORDER BY id DESC LIMIT ?",
        [id, -cambio]);
});

// Baja lógica del título: solo si no tiene ejemplares afuera ni reservas
export const darDeBajaLibro = (id) => conTransaccion(async (conexion) => {
    const libro = await bloquearLibro(conexion, id);
    const [[uso]] = await conexion.query(
        "SELECT COUNT(*) AS activos FROM pedidos WHERE libro_id = ? AND estado IN ('pendiente', 'prestado', 'vencido')", [id]);
    if (uso.activos > 0) throw conflicto(`«${libro.titulo}» tiene ${uso.activos} préstamo(s) o reserva(s) sin cerrar.`);

    await conexion.query("UPDATE libros SET activo = FALSE WHERE id = ?", [id]);
    return libro.titulo;
});
