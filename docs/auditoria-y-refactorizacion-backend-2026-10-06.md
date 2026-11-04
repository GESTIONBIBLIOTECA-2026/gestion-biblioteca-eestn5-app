# Informe Completo de Auditoría y Refactorización Backend
**Fecha:** 6 de Octubre de 2026  
**Materia:** Desarrollo de Software para Plataformas Móviles (7° Año)  
**Institución:** E.E.S.T N° 5 - Lanús  
**Comisión:** Grupo B (Jueves) - Proyecto Gestión Biblioteca  

---

## 🎯 Objetivo de la Refactorización

Este documento explica de manera detallada y pedagógica **cómo estaba estructurado originalmente el código del backend** (sus problemas de mantenibilidad, acoplamiento y carga cognitiva) y **cómo lo modificamos** para alinearlo a las buenas prácticas del desarrollo profesional (Principios SOLID, Arquitectura Limpia y Seguridad Transaccional).

---

## 📑 Índice de Módulos Refactorizados

1. [Módulo de Configuración (`src/config/`)](#1-módulo-de-configuración-srcconfig)
2. [Módulo de Validaciones (`src/middlewares/validaciones.middleware.js`)](#2-módulo-de-validaciones-srcmiddlewaresvalidacionesmiddlewarejs)
3. [Módulo de Rutas (`src/routes/`)](#3-módulo-de-rutas-srcroutes)
4. [Modelo de Usuarios (`src/models/usuario.models.js`)](#4-modelo-de-usuarios-srcmodelsusuariomodelsjs)
5. [Modelo de Libros (`src/models/libro.models.js`)](#5-modelo-de-libros-srcmodelslibromodelsjs)
6. [Modelo de Préstamos (`src/models/prestamo.models.js`)](#6-modelo-de-préstamos-srcmodelsprestamomodelsjs)
7. [Controlador de Préstamos (`src/controllers/prestamos.controllers.js`)](#7-controlador-de-préstamos-srccontrollersprestamoscontrollersjs)

---

## 1. Módulo de Configuración (`src/config/`)

### ❌ Cómo estaba Antes:
Todas las constantes estaban mezcladas dentro de un único archivo `config.js`. Se combinaban credenciales de infraestructura (puerto del servidor, clave secreta de JWT) con reglas puras del negocio (roles de usuarios, estados del sistema, límites de paginación).

```javascript
// ❌ Antes (config.js mezclado):
export const PORT = process.env.PORT || 3000;
export const JWT_SECRET = process.env.JWT_SECRET;
export const ROLES_USUARIOS = ['alumno', 'docente', 'administrador'];
export const USUARIOS_POR_PAGINA = 10;
```

### 🔴 ¿Por qué era un problema?
Viola el principio de **Separación de Intereses (SoC)**. Si cambiaba una regla de negocio del cliente (ej: cambiar la paginación a 15 elementos), había que tocar el mismo archivo que guarda las claves secretas de la aplicación.

### ✅ Cómo lo Modificamos:
Dividimos la configuración en dos archivos especializados y re-exportamos todo de manera transparente en `config.js`:

1. **`env.js`**: Infraestructura y variables de entorno (`PORT`, `JWT_SECRET`, `DB_HOST`).
2. **`constants.js`**: Reglas puras del negocio (`ROLES_USUARIOS`, `ESTADOS_USUARIOS`, `FILTROS_USUARIOS`, `USUARIOS_POR_PAGINA`).
3. **`config.js`**: Re-exporta ambos archivos para mantener la compatibilidad con todas las importaciones existentes.

---

## 2. Módulo de Validaciones (`src/middlewares/validaciones.middleware.js`)

### ❌ Cómo estaba Antes:
Se definían constantes con Expresiones Regulares desnudas y en cada middleware se utilizaba el método `.test()` directamente. Además, la validación del DNI aceptaba rangos erróneos (6 a 10 dígitos).

```javascript
// ❌ Antes (Expresiones regulares repetidas con .test()):
const DNI_VALIDO = /^\d{6,10}$/;

export const validarLogin = (req, res, next) => {
    if (!DNI_VALIDO.test(dniLimpio)) {
        return res.status(400).json({ error: "El DNI solo puede tener números." });
    }
};
```

### 🔴 ¿Por qué era un problema?
- **Ruido Sintáctico:** Recordar y leer `.test(...)` en cada `if` dificulta la lectura del código.
- **Formato Erróneo:** En Argentina los DNI tienen estrictamente entre 7 y 8 dígitos. Aceptar 6 o 10 permitía cargar datos inválidos.

### ✅ Cómo lo Modificamos:
1. Corregimos el patrón del DNI a `/^\d{7,8}$/`.
2. Creamos **Funciones Predicado Semánticas** (funciones auxiliares que devuelven `true` o `false` con nombres narrativos):

```javascript
// ✅ Después (Funciones predicado semánticas):
const esDniValido      = (dni)      => /^\d{7,8}$/.test(String(dni ?? ""));
const esIdValido       = (id)       => /^[1-9]\d{0,9}$/.test(String(id ?? ""));
const esNombreValido   = (nombre)   => /^\p{L}[\p{L} .'-]*$/u.test(String(nombre ?? ""));
const esCorreoValido   = (correo)   => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(correo ?? ""));
const esTelefonoValido = (telefono) => /^[\d\s()+-]+$/.test(String(telefono ?? ""));

// Uso expresivo dentro del middleware:
if (!esDniValido(dniLimpio)) {
    return res.status(400).json({ error: "El DNI tiene que tener entre 7 y 8 números." });
}
```

---

## 3. Módulo de Rutas (`src/routes/`)

### ❌ Cómo estaba Antes:
En algunas rutas se repetía la declaración de middlewares de seguridad (`verificarToken`, `soloAdministrador`) individualmente en cada endpoint.

### 🔴 ¿Por qué era un problema?
Violación del principio **DRY (Don't Repeat Yourself)**. Si se agregaba un nuevo endpoint al módulo de usuarios o préstamos, existía el riesgo de olvidar colocar el middleware y dejar la ruta expuesta al público.

### ✅ Cómo lo Modificamos:
Aprovechamos la tubería global de Express con `router.use(...)` al inicio de cada archivo de rutas:

```javascript
// ✅ Después (Protección unificada de módulo):
const router = express.Router();

// Todas las rutas del módulo exigen sesión activa de administrador
router.use(verificarToken, soloAdministrador);

router.get("/", validarFiltrosUsuarios, getUsuarios);
router.post("/", validarUsuario, postUsuario);
```

---

## 4. Modelo de Usuarios (`src/models/usuario.models.js`)

### ❌ Cómo estaba Antes:
El modelo de usuarios solo ofrecía consultas generales (ej: `getUsuarioPorId`), pero **no tenía un método para consultar y validar a un usuario dentro de una transacción activa** durante el registro de un préstamo.

### 🔴 ¿Por qué era un problema?
Como `usuario.models.js` no ofrecía este método, el modelo de préstamos (`prestamo.models.js`) tuvo que escribir sus propias consultas SQL a la tabla `usuarios`, duplicando el código que calcula sanciones y deudas.

### ✅ Cómo lo Modificamos:
Añadimos la función exportada `obtenerUsuarioParaPrestamo(conexion, dni)` dentro de `usuario.models.js`:

```javascript
// ✅ Después (Método de dominio encapsulado en usuario.models.js):
export const obtenerUsuarioParaPrestamo = async (conexion, dni) => {
    const [usuarios] = await conexion.query(
        `SELECT u.id, u.nombre_completo, u.estado,
                (SELECT COUNT(*) FROM sanciones s
                  WHERE s.usuario_id = u.id AND ${SQL_SANCION_EN_VIGOR}) AS sanciones_activas,
                (SELECT COUNT(*) FROM pedidos p
                  WHERE p.usuario_id = u.id AND ${SQL_PRESTAMO_ATRASADO}) AS prestamos_atrasados
         FROM usuarios u
         WHERE u.dni = ?
         LIMIT 1
         FOR SHARE`,
        [dni]
    );

    const usuario = usuarios[0];

    if (!usuario) throw new ErrorUsuario("NOT_FOUND", "No hay ningún usuario con ese DNI.");
    if (usuario.estado !== "habilitado") throw new ErrorUsuario("CONFLICT", "El usuario no está habilitado.");
    if (usuario.sanciones_activas > 0) throw new ErrorUsuario("CONFLICT", "El usuario tiene una sanción activa.");
    if (usuario.prestamos_atrasados > 0) throw new ErrorUsuario("CONFLICT", "El usuario tiene un préstamo atrasado.");

    return usuario;
};
```
*Detalle técnico:* Recibe el parámetro `conexion` para reutilizar la misma conexión del pool durante la transacción y ejecuta `FOR SHARE` para bloquear lecturas/escrituras concurrentes.

---

## 5. Modelo de Libros (`src/models/libro.models.js`)

### ❌ Cómo estaba Antes:
El archivo `libro.models.js` era muy básico: solo contenía la función `getLibroPorId()`. Toda la validación de ejemplares físicos, stock disponible y bloqueo de filas estaba metida dentro del modelo de préstamos.

### 🔴 ¿Por qué era un problema?
La responsabilidad de saber cuántos ejemplares libres tiene un libro y cómo seleccionar uno disponible le pertenece al dominio de **Libros/Ejemplares**, no al de Préstamos.

### ✅ Cómo lo Modificamos:
Encapsulamos esa lógica creando `obtenerEjemplarParaPrestamo(conexion, libroId)` dentro de `libro.models.js`:

```javascript
// ✅ Después (Encapsulado en libro.models.js):
export const obtenerEjemplarParaPrestamo = async (conexion, libroId) => {
    const [libros] = await conexion.query(
        "SELECT id, titulo FROM libros WHERE id = ? AND activo = TRUE LIMIT 1",
        [libroId]
    );
    if (!libros[0]) throw new ErrorLibro("NOT_FOUND", "No hay ningún libro con ese ID.");

    // Bloquea el ejemplar con FOR UPDATE para evitar que dos préstamos lo tomen al mismo tiempo
    const [ejemplares] = await conexion.query(
        `SELECT id, codigo_inventario FROM ejemplares
         WHERE libro_id = ? AND estado = 'disponible'
         ORDER BY id LIMIT 1 FOR UPDATE`,
        [libroId]
    );
    if (!ejemplares[0]) throw new ErrorLibro("CONFLICT", "No quedan ejemplares disponibles.");

    return { libro: libros[0], ejemplar: ejemplares[0] };
};
```

---

## 6. Modelo de Préstamos (`src/models/prestamo.models.js`)

### ❌ Cómo estaba Antes:
La función `crearPrestamo()` era un bloque monolítico de **135 líneas continuas**. Hacía consultas SQL directas a 5 tablas distintas (`usuarios`, `sanciones`, `libros`, `ejemplares`, `pedidos`) y lanzaba errores con códigos HTTP hardcodeados (`throw new ErrorPrestamo(404, ...)`).

```javascript
// ❌ Antes (Monolito acoplado con códigos HTTP en el modelo):
export class ErrorPrestamo extends Error {
    constructor(status, mensaje) {
        super(mensaje);
        this.status = status; // 👈 Acoplamiento HTTP en la capa de datos
    }
}

export const crearPrestamo = async ({ dni, libroId, adminId, dias }) => {
    // ... 135 líneas con SQL a usuarios, sanciones, libros, ejemplares y pedidos ...
};
```

### 🔴 ¿Por qué era un problema?
1. **Alta Carga Cognitiva:** Imposible de defender o seguir en el pizarrón durante una clase.
2. **Acoplamiento HTTP:** La capa de persistencia/modelo no debe saber qué es un código HTTP `404` o `409`.
3. **Violación de Encapsulamiento:** Escribía SQL directo contra las tablas de usuarios y libros.

### ✅ Cómo lo Modificamos:
Aplicamos el patrón **Extract Method**:
1. Eliminamos las consultas SQL a las tablas de usuarios y libros, delegándolas a `obtenerUsuarioParaPrestamo()` y `obtenerEjemplarParaPrestamo()`.
2. Convertimos `crearPrestamo()` en una función orquestadora limpia de **20 líneas**:

```javascript
// ✅ Después (Orquestador limpio y desacoplado):
export const crearPrestamo = async ({ dni, libroId, adminId, dias }) => {
    const conexion = await connection.getConnection();

    try {
        await conexion.beginTransaction();

        // 1. Delega la validación del usuario a usuario.models.js
        const usuario = await obtenerUsuarioParaPrestamo(conexion, dni);

        // 2. Delega la validación del libro/ejemplar a libro.models.js
        const { libro, ejemplar } = await obtenerEjemplarParaPrestamo(conexion, libroId);

        // 3. Registra el pedido en pedidos y pedido_historial
        const pedidoId = await registrarPedido(conexion, { usuario, libro, ejemplar, adminId, dias });

        await conexion.commit();

        return await consultarPrestamoCreado(conexion, pedidoId, ejemplar.codigo_inventario);

    } catch (error) {
        await conexion.rollback();
        throw error;

    } finally {
        conexion.release();
    }
};
```

---

## 7. Controlador de Préstamos (`src/controllers/prestamos.controllers.js`)

### ❌ Cómo estaba Antes:
El controlador confiaba en que el modelo le devolvía un objeto de error con la propiedad `.status` HTTP precargada:

```javascript
// ❌ Antes (El controlador asumía que el modelo sabía de HTTP):
catch (error) {
    if (error instanceof ErrorPrestamo) {
        return res.status(error.status).json({ error: error.message });
    }
}
```

### 🔴 ¿Por qué era un problema?
Obligaba al modelo a conocer la existencia del protocolo Web (HTTP).

### ✅ Cómo lo Modificamos:
El controlador ahora captura las clases de excepción de dominio (`ErrorPrestamo`, `ErrorUsuario`, `ErrorLibro`) y asume la responsabilidad de traducir el resultado a la respuesta HTTP correspondiente:

```javascript
// ✅ Después (El controlador traduce las excepciones de dominio a HTTP):
catch (error) {
    if (error instanceof ErrorPrestamo || error instanceof ErrorUsuario || error instanceof ErrorLibro) {
        const status = error.status ?? 400;
        return res.status(status).json({ error: error.message });
    }

    console.error("Error al registrar préstamo:", error.message);
    return res.status(500).json({ error: "No se pudo registrar el préstamo en la base de datos." });
}
```

---

## 📊 Resumen Comparativo de la Refactorización

| Dimensión | ❌ Código Original | ✅ Código Refactorizado |
| :--- | :--- | :--- |
| **Modularidad** | `crearPrestamo()` resolví todo en 135 líneas. | Se dividió en 4 funciones especializadas distribuidas en sus modelos correspondientes. |
| **Legibilidad** | Regex desnudas con `.test()` y consultas SQL cruzadas. | Funciones predicado (`esDniValido`) y nombres narrativos. |
| **Encapsulamiento** | `prestamo.models.js` consultaba la tabla `usuarios` a mano. | Cada modelo maneja sus propias tablas (`usuario.models.js`, `libro.models.js`). |
| **Protocolo HTTP** | Los modelos lanzaban errores con status `404` y `409`. | Los modelos lanzan errores de dominio; los controladores traducen a HTTP. |
| **Seguridad DB** | `FOR UPDATE` y `FOR SHARE` pero desordenados. | Transacciones ACID estrictas con `FOR SHARE` (usuarios) y `FOR UPDATE` (ejemplares). |
