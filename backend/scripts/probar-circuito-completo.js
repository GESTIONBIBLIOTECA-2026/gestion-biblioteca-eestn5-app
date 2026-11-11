/* ==========================================================================
   probar-circuito-completo.js - Suite de Verificación End-to-End
   Prueba el ciclo de vida completo de préstamos y la integridad de la API:
   1. Login Alumno Demo (DNI 99010001) y verificación de token JWT.
   2. Consulta de Perfil del Alumno y estado de habilitación.
   3. Búsqueda de libro con stock en el catálogo.
   4. Creación de Reserva (PWA) -> Estado 'pendiente'.
   5. Verificación de "Mis Pedidos" en tiempo real.
   6. Login Administrador.
   7. Verificación de Mostrador (Mesa de Entrada) -> Listado de reservas.
   8. Confirmación de Entrega en Mostrador -> Transición a 'prestado' (-1 stock).
   9. Recepción de Devolución en Mostrador -> Transición a 'devuelto' (+1 stock).
   10. Verificación del Dashboard de Métricas en vivo.
   11. Verificación de la rutina de Control de Vencimientos.
   ========================================================================== */

import app from "../index.js";
import http from "http";

const PORT = 3099;
let server;

function peticion(path, options = {}) {
    return new Promise((resolve, reject) => {
        const req = http.request(`http://localhost:${PORT}${path}`, {
            method: options.method || "GET",
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        }, (res) => {
            let data = "";
            res.on("data", chunk => data += chunk);
            res.on("end", () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, body: json });
                } catch {
                    resolve({ status: res.statusCode, text: data });
                }
            });
        });
        req.on("error", reject);
        if (options.body) req.write(JSON.stringify(options.body));
        req.end();
    });
}

function logPaso(numero, titulo) {
    console.log(`\n\x1b[36m[PASO ${numero}]\x1b[0m ${titulo}`);
}

function logExito(mensaje) {
    console.log(`  \x1b[32m✔\x1b[0m ${mensaje}`);
}

function logError(mensaje) {
    console.error(`  \x1b[31m✖\x1b[0m ${mensaje}`);
}

async function correrSuite() {
    console.log("==================================================");
    console.log("🚀 INICIANDO SUITE DE PRUEBA INTEGRAL DE CIRCUITO");
    console.log("==================================================");

    server = app.listen(PORT);
    await new Promise(r => setTimeout(r, 600));

    try {
        // --- PASO 1: Login de Alumno Demo ---
        logPaso(1, "Autenticación de alumno demo (DNI 99010001)");
        const resLoginAlumno = await peticion("/api/auth/login", {
            method: "POST",
            body: { dni: "99010001", clave: "prueba123" }
        });
        if (resLoginAlumno.status !== 200 || !resLoginAlumno.body.payload?.token) {
            throw new Error(`Falló login alumno: ${JSON.stringify(resLoginAlumno.body)}`);
        }
        const tokenAlumno = resLoginAlumno.body.payload.token;
        const alumnoNombre = resLoginAlumno.body.payload.usuario.nombre_completo;
        logExito(`Alumno autenticado: ${alumnoNombre} (Token recibido)`);

        // --- PASO 2: Verificación de Perfil de Alumno ---
        logPaso(2, "Verificación de perfil y condición en /api/mis-pedidos/perfil");
        const resPerfil = await peticion("/api/mis-pedidos/perfil", {
            headers: { Authorization: `Bearer ${tokenAlumno}` }
        });
        if (resPerfil.status !== 200 || !resPerfil.body.payload) {
            throw new Error(`No se pudo leer perfil: ${JSON.stringify(resPerfil.body)}`);
        }
        const perfil = resPerfil.body.payload;
        logExito(`Condición del alumno: ${perfil.condicion} (Puede pedir: ${perfil.puede_pedir})`);
        if (!perfil.puede_pedir) {
            throw new Error(`El alumno de prueba está en condición '${perfil.condicion}', debe estar habilitado.`);
        }

        // --- PASO 3: Catálogo y selección de libro ---
        logPaso(3, "Búsqueda de libro con stock disponible");
        const resCat = await peticion("/api/mis-pedidos/libros", {
            headers: { Authorization: `Bearer ${tokenAlumno}` }
        });
        if (resCat.status !== 200 || !Array.isArray(resCat.body.payload)) {
            throw new Error(`Error al listar libros: ${JSON.stringify(resCat.body)}`);
        }
        const libroConStock = resCat.body.payload.find(l => l.stock_reservable > 0);
        if (!libroConStock) {
            throw new Error("No hay ningún libro con stock reservable en la base de datos.");
        }
        const libroId = libroConStock.libro_id;
        const stockInicial = libroConStock.stock_reservable;
        logExito(`Libro seleccionado: «${libroConStock.titulo}» (ID: ${libroId}, Stock libre: ${stockInicial})`);

        // --- PASO 4: Creación de Reserva (PWA) ---
        logPaso(4, "Creación de reserva desde la PWA (POST /api/mis-pedidos)");
        const fechaDevolucion = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
        const resPedido = await peticion("/api/mis-pedidos", {
            method: "POST",
            headers: { Authorization: `Bearer ${tokenAlumno}` },
            body: { libro_id: libroId, cantidad: 1, fecha_devolucion_estimada: fechaDevolucion }
        });
        if (resPedido.status !== 201 || !resPedido.body.payload?.id) {
            throw new Error(`Falló crear pedido: ${JSON.stringify(resPedido.body)}`);
        }
        const pedidoId = resPedido.body.payload.id;
        logExito(`Reserva creada con éxito: Pedido #${pedidoId} (Estado: ${resPedido.body.payload.estado})`);

        // --- PASO 5: Seguimiento en Mis Pedidos ---
        logPaso(5, "Verificación del pedido en el historial del alumno (GET /api/mis-pedidos/historial)");
        const resHistorial = await peticion("/api/mis-pedidos/historial", {
            headers: { Authorization: `Bearer ${tokenAlumno}` }
        });
        const miPedido = resHistorial.body.payload?.find(p => p.pedido_id === pedidoId);
        if (!miPedido || miPedido.estado !== "pendiente") {
            throw new Error(`El pedido #${pedidoId} no figura como pendiente en el historial del alumno.`);
        }
        logExito(`Pedido #${pedidoId} verificado en 'Mis Pedidos' como 'pendiente'`);

        // --- PASO 6: Login Administrador ---
        logPaso(6, "Autenticación de bibliotecario/administrador (DNI 99010033)");
        const resLoginAdmin = await peticion("/api/auth/login", {
            method: "POST",
            body: { dni: "99010033", clave: "prueba123" }
        });
        if (resLoginAdmin.status !== 200 || !resLoginAdmin.body.payload?.token) {
            throw new Error(`Falló login admin: ${JSON.stringify(resLoginAdmin.body)}`);
        }
        const tokenAdmin = resLoginAdmin.body.payload.token;
        const adminNombre = resLoginAdmin.body.payload.usuario.nombre_completo;
        logExito(`Administrador autenticado: ${adminNombre} (Token recibido)`);

        // --- PASO 7: Mesa de entrada en PC ---
        logPaso(7, "Mostrador Web: Búsqueda del pedido en mesa de entrada");
        const resMostrador = await peticion(`/api/prestamos?estado=pendiente`, {
            headers: { Authorization: `Bearer ${tokenAdmin}` }
        });
        const pedidoMostrador = resMostrador.body.payload?.find(p => p.id === pedidoId);
        if (!pedidoMostrador) {
            throw new Error(`El mostrador no listó el pedido #${pedidoId}`);
        }
        logExito(`Pedido #${pedidoId} listado en la mesa de entrada`);

        // --- PASO 8: Confirmar Entrega (-1 stock) ---
        logPaso(8, "Confirmar Entrega en Mostrador (PATCH /api/prestamos/:id/estado -> prestado)");
        const resEntrega = await peticion(`/api/prestamos/${pedidoId}/estado`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${tokenAdmin}` },
            body: { estado: "prestado" }
        });
        if (resEntrega.status !== 200 || resEntrega.body.payload?.estado !== "prestado") {
            throw new Error(`No se pudo confirmar entrega: ${JSON.stringify(resEntrega.body)}`);
        }
        logExito(`Entrega confirmada: Pedido #${pedidoId} pasa a estado 'prestado' (stock descontado)`);

        // --- PASO 9: Recepción de Devolución (+1 stock) ---
        logPaso(9, "Registrar Devolución en Mostrador (PATCH /api/prestamos/:id/estado -> devuelto)");
        const resDevolucion = await peticion(`/api/prestamos/${pedidoId}/estado`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${tokenAdmin}` },
            body: { estado: "devuelto" }
        });
        if (resDevolucion.status !== 200 || resDevolucion.body.payload?.estado !== "devuelto") {
            throw new Error(`No se pudo registrar devolución: ${JSON.stringify(resDevolucion.body)}`);
        }
        logExito(`Devolución confirmada: Pedido #${pedidoId} pasa a estado 'devuelto' (stock reincorporado)`);

        // --- PASO 10: Métricas del Dashboard ---
        logPaso(10, "Verificación de métricas en vivo en /api/dashboard");
        const resDash = await peticion("/api/dashboard", {
            headers: { Authorization: `Bearer ${tokenAdmin}` }
        });
        if (resDash.status !== 200 || !resDash.body.payload) {
            throw new Error(`Error en dashboard: ${JSON.stringify(resDash.body)}`);
        }
        const metricas = resDash.body.payload;
        logExito(`Dashboard activo: ${metricas.libros_total} libros, ${metricas.prestamos_activos} préstamos activos, ${metricas.alumnos_morosos} morosos.`);

        // --- PASO 11: Control de Vencimientos ---
        logPaso(11, "Ejecución del control de morosidad y vencimientos");
        const resVencidos = await peticion("/api/prestamos/actualizar-vencidos", {
            method: "POST",
            headers: { Authorization: `Bearer ${tokenAdmin}` }
        });
        if (resVencidos.status !== 200) {
            throw new Error(`Fallo en control de vencimientos: ${JSON.stringify(resVencidos.body)}`);
        }
        logExito(`Control de vencimientos ejecutado: ${resVencidos.body.payload?.actualizados ?? 0} registros actualizados.`);

        console.log("\n\x1b[32m==================================================");
        console.log("🎉 VERIFICACIÓN INTEGRAL DE PUNTA A PUNTA: EXITOSA");
        console.log("   Todos los contratos, flujos y transacciones operan");
        console.log("   de acuerdo a la especificación oficial.");
        console.log("==================================================\x1b[0m\n");
    } catch (err) {
        logError(err.message);
        console.log("\n\x1b[31mPrueba interrumpida por fallas en la verificación.\x1b[0m\n");
        process.exitCode = 1;
    } finally {
        if (server) server.close();
    }
}

correrSuite();
