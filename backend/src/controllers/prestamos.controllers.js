/* Controladores del módulo de pedidos — Grupo 4 */
import { obtenerUltimosPrestamos, listarPedidos, crearPedido, cambiarEstadoPedido, historialPedidos, actualizarVencidos } from "../models/prestamo.models.js";

const responderError = (res, error, mensaje) => {
  console.error(mensaje, error.message);
  return res.status(error.status || 500).json({ error: error.status ? error.message : mensaje });
};

export const getPrestamos = async (req,res) => {
  try {
    // El Inicio del panel utiliza ?limite=5 y conserva el formato de su tabla de lectura.
    if (req.query.limite !== undefined) {
      const limite = Number(req.query.limite);
      if (!Number.isInteger(limite) || limite < 1 || limite > 50) {
        return res.status(400).json({ error: "El límite tiene que ser un número entre 1 y 50." });
      }
      return res.json({ payload: await obtenerUltimosPrestamos(limite) });
    }
    const pedidos = await listarPedidos({ estado: req.query.estado, busqueda: (req.query.q || "").trim() });
    res.json({ payload: pedidos });
  } catch (error) { responderError(res,error,"No se pudieron cargar los pedidos."); }
};

export const postPedido = async (req,res) => {
  try {
    const usuarioId = Number(req.body.usuario_id);
    const libroId = Number(req.body.libro_id);
    const cantidad = Number(req.body.cantidad ?? 1);
    if (!Number.isInteger(usuarioId) || usuarioId < 1 || !Number.isInteger(libroId) || libroId < 1) {
      return res.status(400).json({ error: "Indicá un usuario y un libro válidos." });
    }
    const pedido = await crearPedido({
      usuarioId, libroId, cantidad,
      fechaDevolucion: req.body.fecha_devolucion_estimada,
      registradoPor: req.usuario?.id
    });
    res.status(201).json({ mensaje: "Pedido creado correctamente.", payload: pedido });
  } catch (error) { responderError(res,error,"No se pudo crear el pedido."); }
};

export const patchEstadoPedido = async (req,res) => {
  try {
    const id = Number(req.params.id);
    const estado = String(req.body.estado || "").toLowerCase();
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "ID de pedido inválido." });
    if (!["prestado","devuelto","vencido","cancelado"].includes(estado)) {
      return res.status(400).json({ error: "Estado no válido." });
    }
    const payload = await cambiarEstadoPedido(id,estado,req.usuario?.id);
    res.json({ mensaje: "Estado actualizado correctamente.", payload });
  } catch (error) { responderError(res,error,"No se pudo actualizar el pedido."); }
};

export const getHistorialPedidos = async (req,res) => {
  try {
    const usuarioId = req.query.usuario_id ? Number(req.query.usuario_id) : undefined;
    if (usuarioId !== undefined && (!Number.isInteger(usuarioId) || usuarioId < 1))
      return res.status(400).json({ error: "Usuario inválido." });
    res.json({ payload: await historialPedidos({ usuarioId }) });
  } catch (error) { responderError(res,error,"No se pudo cargar el historial."); }
};

export const postActualizarVencidos = async (req,res) => {
  try {
    const cantidad = await actualizarVencidos(req.usuario?.id);
    res.json({ mensaje: "Control de vencimientos realizado.", payload: { actualizados: cantidad } });
  } catch (error) { responderError(res,error,"No se pudieron actualizar los vencimientos."); }
};
