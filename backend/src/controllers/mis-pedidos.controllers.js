/* Controllers del área de pedidos para el alumno (Grupo 4). */
import { actualizarVencidos, crearPedido, historialPedidos } from "../models/prestamo.models.js";
import { listarLibrosParaPedido } from "../models/libro.models.js";
import { getUsuarioPorId } from "../models/usuario.models.js";

const responderError = (res, error, mensaje) => {
    console.error(mensaje, error.message);
    return res.status(error.status || 500).json({ error: error.status ? error.message : mensaje });
};

export const getPerfilAlumno = async (req, res) => {
    try {
        const usuario = await getUsuarioPorId(req.usuario.id);
        if (!usuario) return res.status(404).json({ error: "No se encontró el perfil del alumno." });
        return res.json({ payload: {
            id: usuario.id, nombre: usuario.nombre_completo, dni: usuario.dni,
            rol: usuario.rol, estado: usuario.estado, condicion: usuario.condicion,
            curso: usuario.curso, puede_pedir: usuario.condicion === "habilitado"
        } });
    } catch (error) { return responderError(res, error, "No se pudo consultar el perfil del alumno."); }
};

export const getCatalogoAlumno = async (req, res) => {
    try {
        const q = String(req.query.q || "").trim().slice(0, 100);
        return res.json({ payload: await listarLibrosParaPedido(q) });
    } catch (error) { return responderError(res, error, "No se pudo cargar el catálogo."); }
};

export const postMiPedido = async (req, res) => {
    try {
        const libroId = Number(req.body.libro_id);
        const cantidad = Number(req.body.cantidad ?? 1);
        const fechaDevolucion = req.body.fecha_devolucion_estimada;
        if (!Number.isInteger(libroId) || libroId < 1) return res.status(400).json({ error: "Seleccioná un libro válido." });
        if (!Number.isInteger(cantidad) || cantidad < 1) return res.status(400).json({ error: "La cantidad debe ser un número entero mayor que cero." });
        const pedido = await crearPedido({ usuarioId: req.usuario.id, libroId, cantidad, fechaDevolucion, registradoPor: req.usuario.id });
        return res.status(201).json({ mensaje: "Reserva registrada. Tu pedido quedó pendiente de confirmación en la biblioteca.", payload: pedido });
    } catch (error) { return responderError(res, error, "No se pudo registrar la reserva."); }
};

export const getMiHistorial = async (req, res) => {
    try {
        await actualizarVencidos();
        return res.json({ payload: await historialPedidos({ usuarioId: req.usuario.id }) });
    } catch (error) { return responderError(res, error, "No se pudo cargar tu historial."); }
};
