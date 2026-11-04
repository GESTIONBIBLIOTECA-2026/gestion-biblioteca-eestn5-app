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

// --- Catálogo de libros (Grupo 6) · solo lectura ---
export const listarLibros = (filtros = {}) => pedir(`/libros?${new URLSearchParams(filtros)}`);
export const obtenerCategorias = () => pedir("/libros/categorias");

// --- Mi perfil ---
export const obtenerMiPerfil = () => pedir("/perfil");
export const guardarMiPerfil = (datos) => pedir("/perfil", "PUT", datos);
export const cambiarMiClave = (datos) => pedir("/perfil/clave", "PUT", datos);
export const obtenerMiCuenta = () => pedir("/perfil/historial");   // inicio del alumno / docente
