/* ==========================================================================
   MÓDULO: api.js - Consumo del Backend (Fetch & Async/Await)
   Todas las peticiones al servidor Express pasan por acá.
   ========================================================================== */

import { API_URL } from "./config.js";
import { obtenerToken } from "./storage.js";


/**
 * Petición al backend. Devuelve el JSON completo: { payload, mensaje }.
 * Si el servidor responde con error (400, 401, 404, 500...) lanza un Error con:
 *   error.message (lo que mandó el backend), error.status y error.campos
 */
async function pedir(ruta, metodo = "GET", datos = null) {

    // 1. Petición HTTP con el token y un límite de espera de 10 segundos
    const response = await fetch(`${API_URL}${ruta}`, {
        method: metodo,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${obtenerToken()}`
        },
        body: datos ? JSON.stringify(datos) : null,
        signal: AbortSignal.timeout(10000)
    });

    // 2. Segundo await: el cuerpo JSON a objeto JS
    const data = await response.json().catch(() => ({}));

    // 3. fetch NO entra al catch con un 400 o un 500: hay que revisar response.ok
    if (!response.ok) {
        const error = new Error(data.error || `Error HTTP: ${response.status}`);
        error.status = response.status;
        error.campos = data.campos;
        throw error;
    }

    return data;
}


// --- Sesión ---
export const iniciarSesion = (dni, clave) => pedir("/auth/login", "POST", { dni, clave });
export const obtenerSesionActual = () => pedir("/auth/perfil");

// --- Inicio del administrador / Dashboard ---
export const obtenerMetricas = () => pedir("/dashboard");   // { libros_total, prestamos_activos, alumnos_morosos }
export const obtenerUltimosPrestamos = (limite = 5) => pedir(`/prestamos?limite=${limite}`);

// --- Usuarios (Grupo 5) ---
export const listarUsuarios = (filtros = {}) => pedir(`/usuarios?${new URLSearchParams(filtros)}`);
export const obtenerUsuario = (id) => pedir(`/usuarios/${id}`);
export const obtenerHistorial = (id) => pedir(`/usuarios/${id}/historial`);
export const registrarUsuario = (datos) => pedir("/usuarios", "POST", datos);
export const modificarUsuario = (id, datos) => pedir(`/usuarios/${id}`, "PUT", datos);
export const cambiarEstado = (id, estado, motivo = "") => pedir(`/usuarios/${id}/estado`, "PATCH", { estado, motivo });
export const obtenerCursos = () => pedir("/cursos");

// --- Libros: catálogo e inventario (Grupo 6) ---
export const listarLibros = (filtros = {}) => pedir(`/libros?${new URLSearchParams(filtros)}`);
export const obtenerResumenLibros = () => pedir("/libros/resumen");
export const obtenerCategorias = () => pedir("/libros/categorias");
export const registrarLibro = (datos) => pedir("/libros", "POST", datos);
export const modificarLibro = (id, datos) => pedir(`/libros/${id}`, "PUT", datos);
export const cambiarStock = (id, cambio) => pedir(`/libros/${id}/stock`, "PATCH", { cambio });
export const darDeBajaLibro = (id) => pedir(`/libros/${id}`, "DELETE");

// --- Mesa de entrada y préstamos mostrador (Grupo 4) ---
export const listarPrestamos = (params = {}) => pedir(`/prestamos?${new URLSearchParams(params)}`);
export const cambiarEstadoPedido = (id, estado) => pedir(`/prestamos/${id}/estado`, "PATCH", { estado });
export const actualizarVencidos = () => pedir("/prestamos/actualizar-vencidos", "POST");

// --- Mi perfil ---
export const obtenerMiPerfil = () => pedir("/perfil");
export const guardarMiPerfil = (datos) => pedir("/perfil", "PUT", datos);
export const cambiarMiClave = (datos) => pedir("/perfil/clave", "PUT", datos);
export const obtenerMiCuenta = () => pedir("/perfil/historial");   // inicio del alumno / docente

// --- Pedidos y reservas del alumno (Grupo 4) ---
export const solicitarReserva = ({ libroId, cantidad = 1, fechaDevolucion }) =>
    pedir("/mis-pedidos", "POST", {
        libro_id: libroId,
        cantidad,
        fecha_devolucion_estimada: fechaDevolucion
    });
export const obtenerMisPedidos = () => pedir("/mis-pedidos/historial");
export const obtenerPerfilAlumno = () => pedir("/mis-pedidos/perfil");

