# 🧠 Guía de Razonamiento y Arquitectura: Cómo Pensar en MVC

**Proyecto:** Sistema de Gestión de Biblioteca — E.E.S.T N° 5 (7º 5ta)  
**Materia:** Desarrollo de Software para Plataformas Móviles  
**Profesor:** Axel Castellano Gutiérrez  
**Repositorio:** `GESTIONBIBLIOTECA-2026/gestion-biblioteca-eestn5-2026`  

---

## 🛑 Principio Rector: Entender Antes de Escribir

> **El código es la última consecuencia de haber entendido el problema.**  
> Si se sientan a teclear sin saber cómo viajan los datos, terminan mezclando HTML con SQL o copiando fragmentos que no saben cómo depurar.  
> Cada funcionalidad se razona de **atrás hacia adelante**: desde los datos hacia la interfaz.

---

## 🔄 El Método de Pensamiento en 4 Pasos

Cada vez que su equipo deba construir algo en el sistema, **está prohibido arrancar por la pantalla**.  
Deben reunirse, discutir y responderse las siguientes preguntas en este orden estricto:

```text
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│ 1. MODEL        │ ──►  │ 2. CONTROLLER   │ ──►  │ 3. ROUTER       │ ──►  │ 4. VISTA (DOM)  │
│ ¿Qué datos hay? │      │ ¿Qué reglas hay?│      │ ¿Cómo lo expongo?│     │ ¿Cómo lo muestro?
└─────────────────┘      └─────────────────┘      └─────────────────┘      └─────────────────┘
```

---

### 1️⃣ Paso 1: El Modelo (`models/`) — *El Contrato con los Datos*
El Modelo es el único que conoce la base de datos MySQL en Aiven Cloud. No sabe qué es HTTP, no sabe qué es un botón ni qué es una respuesta JSON.

**Preguntas que el grupo debe responderse antes de escribir una sola línea:**
* ¿A qué tabla necesito consultar o modificar (`libros`, `pedidos`, `usuarios`)?
* ¿Qué operación relacional necesito hacer: una lectura (`SELECT`), una inserción (`INSERT`) o una actualización (`UPDATE`)?
* ¿Qué parámetros necesita recibir esta función para no fallar (un `id`, un texto, un objeto)?
* ¿Qué me va a devolver la base de datos (un array de filas, un objeto único o un `insertId`)?

> **Criterio de prueba:** Esta función solo debe encargarse de hablar con MySQL. Si no hay conexión o la consulta está mal escrita, el error debe originarse acá.

---

### 2️⃣ Paso 2: El Controlador (`controllers/`) — *El Cerebro y las Reglas de Negocio*
El Controlador recibe la petición del cliente y decide qué hacer. No ejecuta SQL directo: le pide ayuda al Modelo.

**Preguntas que el grupo debe responderse:**
* ¿Qué datos me está mandando el usuario en la petición (`req.params`, `req.query` o `req.body`)?
* ¿Qué validaciones de seguridad y negocio tengo que aplicar antes de tocar la base de datos?
  * *¿Vienen campos vacíos?*
  * *¿El ID es un número válido?*
  * *¿Hay stock disponible?*
  * *¿El alumno está habilitado o está suspendido?*
* Si algo está mal: ¿Qué código de error HTTP corresponde devolver (`400 Bad Request`, `404 Not Found`) y qué mensaje claro le doy al usuario?
* Si todo está bien: ¿Llamo al Modelo correspondiente y respondo con `200 OK` o `201 Created` entregando el resultado en un objeto JSON (`{ payload: ... }`)?

---

### 3️⃣ Paso 3: El Enrutador (`routes/`) — *La Puerta de Entrada (API REST)*
El Router define cómo el mundo exterior (el navegador) se comunica con nuestro servidor Node.js.

**Preguntas que el grupo debe responderse:**
* ¿Qué verbo HTTP representa la acción que quiero hacer?
  * `GET`: Solo para pedir y leer información (nunca modifica datos).
  * `POST`: Para crear un nuevo recurso (un nuevo libro, un nuevo préstamo, un login).
  * `PUT` o `PATCH`: Para modificar o actualizar el estado de algo existente (devolución, sanción).
  * `DELETE`: Para dar de baja.
* ¿Cuál es la URL semántica y limpia? (Ejemplo: `/api/libros` para todos, `/api/libros/:id` para uno puntual).
* ¿A qué función del Controlador debe despachar esta ruta?

---

### 4️⃣ Paso 4: La Vista y el Cliente (`frontend/`) — *El Consumo y la Experiencia*
Recién cuando los 3 pasos anteriores existen y responden en Postman o en el navegador, se programa la interfaz.

**Preguntas que el grupo debe responderse:**
* ¿Qué evento del usuario inicia la acción (cargar la página `DOMContentLoaded`, hacer un `click` en un botón, escribir en un `input`)?
* ¿Cómo construyo la llamada asíncrona con `fetch()` hacia la ruta que definí en el Paso 3?
* Si la respuesta del servidor es exitosa (`res.ok`): ¿Cómo recorro los datos y qué elementos creo o modifico en el DOM?
* Si el servidor me devolvió un error (código 400 o 500): ¿Dónde y cómo se lo muestro al usuario para que sepa qué corregir?

---

## 🧭 Mapa de Pensamiento por Grupos

---

### 🔵 Para el Grupo 6: Gestión de Inventario y Catálogo

El Grupo 6 debe ser el **primero en arrancar** porque no se puede prestar un libro que no existe en el sistema.

#### 1. ¿Cómo pensar el Catálogo de Libros?
* **Empiecen por el Model:** Necesitan una función que le pida a MySQL los libros ordenados por título, trayendo el stock total y el disponible.
* **Sigan por el Controller:** Si el Modelo les devuelve el listado, empaquétenlo en `{ payload: libros }` y devuelvan `200`. Si falla la base, devuelvan `500`.
* **Definan el Router:** Expongan esa función en una ruta `GET`.
* **Terminen en la Vista:** En su JavaScript, hagan el `fetch()` a esa ruta, tomen el array de libros y piensen: *¿Cómo distingo visualmente un libro con stock de uno que tiene stock 0?* (Un badge verde si hay disponibles, uno rojo si está agotado).

#### 2. ¿Cómo pensar el Alta de Libro?
* **En el Model:** Necesitan una función que inserte un nuevo registro en la tabla de libros.
* **En el Controller:** Antes de insertar, verifiquen: *¿El título viene vacío? ¿La cantidad es menor o igual a cero?* Si es así, no toquen la base de datos: frenen la petición con un error `400`. Si está todo bien, llamen al modelo y respondan `201`.
* **En el Router:** Asócienlo a una ruta `POST`.

---

### 🟠 Para el Grupo 4: Gestión de Pedidos y Préstamos

El Grupo 4 arranca una vez que Grupo 6 tiene libros y se apoya en los usuarios que ya construyó Grupo 5.

#### 1. ¿Cómo pensar la Validación del Alumno (Consumo de G5)?
* No programen backend para esto: **el backend ya lo hizo Grupo 5**.
* En su pantalla (`frontend`), capturen el DNI que escribió el bibliotecario y hagan un `fetch()` al endpoint que dejó G5 (`GET /api/usuarios/dni/:dni`).
* Analicen la respuesta: Si el usuario existe pero su campo `estado` dice "suspendido" o "moroso", piensen: *¿Qué debe pasar con el botón de prestar?* Debe quedar bloqueado.

#### 2. ¿Cómo pensar la Creación del Préstamo?
* **En el Model:** El registro de un préstamo involucra dos cosas:
  1. Insertar la fila en la tabla de préstamos con la fecha límite.
  2. **Modificar la tabla de libros para restar 1 en la cantidad disponible**.
* **En el Controller:** Apliquen las dos reglas de oro antes de prestar:
  1. *¿El alumno puede pedir libros?* (Validar con el modelo de usuarios).
  2. *¿Quedan ejemplares disponibles del libro seleccionado?* (Validar con el modelo de libros).
  Si alguna de las dos falla, respondan con un error explicativo. Si ambas pasan, ejecuten el préstamo.
* **En el Router:** Asócienlo a una ruta `POST`.

#### 3. ¿Cómo pensar la Devolución de un Libro?
* **En el Model:** Marcar el préstamo como devuelto y **sumar 1 a la cantidad disponible del libro**.
* **En el Controller:** Si el préstamo ya estaba devuelto, rechacen la acción. Si estaba pendiente, apliquen la devolución. Si la fecha actual superó la fecha límite pactada, alerten que hubo retraso.
* **En el Router:** Asócienlo a una ruta `PUT`.

---

### 🟢 Para el Grupo 5: Usuarios, Dashboard e Integración

El Grupo 5 ya avanzó el 85% de su módulo de usuarios, pero tiene **dos responsabilidades críticas de integración** para que el sistema funcione en conjunto:

#### 1. ¿Cómo pensar el Dashboard de Inicio (`index.html`) con Métricas Reales?
Actualmente las tarjetas de inicio tienen números fijos o incompletos. El bibliotecario necesita ver la realidad del colegio apenas inicia sesión.
* **En el Model:** Necesitan una función que consulte los totales globales:
  - Total de títulos cargados (consulta a `libros` de G6).
  - Total de préstamos en curso (consulta a `pedidos` de G4).
  - Cantidad de alumnos morosos (préstamos donde `fecha_devolucion_pactada < NOW()`).
* **En el Controller:** Empaquetar estas tres métricas en un único objeto JSON `{ libros_total, prestamos_activos, alumnos_morosos }`.
* **En el Router:** Exponerlo en una ruta limpia como `GET /api/dashboard`.
* **En la Vista (`inicio.js`):** Al cargar `index.html`, hacer el `fetch()` a esa ruta y actualizar los contadores numéricos del panel.

#### 2. ¿Cómo pensar el Historial Activo en la Ficha del Usuario (`usuarios.html`)?
Cuando el administrador abre la ficha de un alumno, no solo quiere ver su DNI y teléfono: quiere ver **qué libros tiene en su poder**.
* **En el Model:** Necesitan una función que busque en la tabla `pedidos` todos los préstamos asociados a ese `usuario_id`, trayendo el título del libro y la fecha límite.
* **En el Controller:** Devolver el historial del alumno al consultar `GET /api/usuarios/:id/historial`.
* **En la Vista:** Dibujar la lista de préstamos activos y devoluciones dentro del diálogo modal del usuario.

#### 3. El Rol de Soporte Técnico y Base de Datos:
* **Franco Barufaldi (DB Lead):** Asegurar que las credenciales de Aiven Cloud funcionen para todo el curso, asistir a G4 y G6 con las dudas de tablas (`schema.sql`) y **no tocar el código de otros grupos**.
* **Dylan Andrada (Líder General):** Revisar y aprobar los Pull Requests que lleguen a `develop`, asegurándose de que cumplan con la arquitectura MVC antes de mergear.

---

## 📌 Tabla Resumen para Discutir en Grupo

Antes de tocar el código, cada grupo debe poder completar este cuadro en una hoja o en el pizarrón:

| Pregunta de Arquitectura | Grupo 6 (Inventario) | Grupo 4 (Pedidos) | Grupo 5 (Usuarios/Dashboard) |
|---|---|---|---|
| **¿Qué tabla de MySQL toco?** | `libros` | `pedidos` y `libros` (stock) | `usuarios`, `pedidos` y métricas |
| **¿Qué archivo Model creo/uso?** | `libro.models.js` | `prestamo.models.js` | `usuario.models.js` / `busqueda.models.js` |
| **¿Qué regla valida el Controller?** | Título no vacío y stock > 0 | Alumno habilitado y stock disponible | Que el usuario exista y cálculo de moras |
| **¿Qué archivo Controller creo/uso?** | `libros.controllers.js` | `prestamos.controllers.js` | `usuarios.controllers.js` / `perfil.controllers.js` |
| **¿Qué verbo y URL uso en Router?** | `GET /api/libros` / `POST /api/libros` | `POST /api/prestamos` / `PUT /api/prestamos/:id/devolucion` | `GET /api/usuarios/dni/:dni` / `GET /api/dashboard` |
| **¿Qué hace el JavaScript en la Vista?** | `fetch()` para catálogo y buscador | `fetch()` para verificar DNI y prestar | `fetch()` para métricas de inicio y ficha de alumno |

---

## 📁 Mapa Exacto de Archivos por Grupo: Dónde meter mano y qué mejorar

---

### 🔵 GRUPO 6 — Inventario y Catálogo de Libros

#### 🔧 Archivos Existentes a Mejorar:
1. `backend/src/models/libro.models.js`:
   * **Estado actual:** Solo tiene la función `getLibroPorId()`.
   * **Qué agregar:** Crear la función `getCatalogoLibros()` que haga la consulta SQL trayendo todos los libros con sus campos clave (`id`, `titulo`, `autor`, `isbn`, `cantidad_total`, `cantidad_disponible`) ordenados por título.
2. `backend/src/controllers/libros.controllers.js`:
   * **Estado actual:** Solo tiene `getLibro()`.
   * **Qué agregar:** Crear la función `getCatalogo()` que llame a `getCatalogoLibros()` y responda `res.json({ payload: libros })` con manejo de `try/catch`.
3. `backend/src/routes/libros.routes.js`:
   * **Estado actual:** Solo tiene `router.get("/:id", getLibro)`.
   * **Qué agregar:** Agregar la ruta raíz `router.get("/", getCatalogo)` para listar el catálogo completo.

#### 🆕 Archivos Nuevos a Crear (Frontend):
1. `frontend/libros.html`:
   * Maquetar la vista principal de la biblioteca: barra superior con link de regreso al inicio, input buscador (`#input-busqueda`) y un contenedor `<section id="grilla-libros">` vacío para que JavaScript pinte las tarjetas.
2. `frontend/css/libros.css`:
   * Estilos para las tarjetas de libros, badges de stock (verde para disponible, rojo para agotado) y diseño responsivo para móviles.
3. `frontend/js/libros.js`:
   * Función para hacer `fetch("/api/libros")` al cargar la página y generar el HTML dinámico de cada libro.
   * Event listener en el buscador para filtrar en vivo por título o autor.

#### 🗑️ Qué deben purgar / descartar:
* Descartar cualquier subida web y resetear su rama `g6-trujillo` contra `origin/develop` para recuperar la estructura limpia del proyecto.

---

### 🟠 GRUPO 4 — Gestión de Pedidos y Préstamos

#### 🗑️ Qué deben purgar URGENTE:
* **Eliminar todos los archivos PHP:** Borrar de la raíz de su rama `cambiar_estado.php`, `conexion.php`, `crear_pedido.php`, `guardar_pedido.php`, `historial.php`, `index.php`, `pedidos.php` y `base_datos.sql`. Ese código no corre en Node.js.

#### 🔧 Archivos Existentes a Mejorar:
1. `backend/src/models/prestamo.models.js`:
   * **Estado actual:** Solo tiene `getUltimosPrestamos()` (solo lectura para el inicio).
   * **Qué agregar:**
     * Función `crearPrestamo(usuario_id, libro_id, dias)`: Inserta en `pedidos` y ejecuta el `UPDATE libros SET cantidad_disponible = cantidad_disponible - 1`.
     * Función `marcarDevolucion(pedido_id, libro_id)`: Pasa el estado del pedido a `'devuelto'` y ejecuta `UPDATE libros SET cantidad_disponible = cantidad_disponible + 1`.
2. `backend/src/controllers/prestamos.controllers.js`:
   * **Qué agregar:**
     * `postPrestamo(req, res)`: Valida que el alumno no esté suspendido y que el libro tenga stock disponible antes de llamar al modelo. Devuelve `201 Created`.
     * `putDevolucion(req, res)`: Valida que el pedido exista y no esté ya devuelto, y ejecuta la reposición de stock. Devuelve `200 OK`.
3. `backend/src/routes/prestamos.routes.js`:
   * **Qué agregar:**
     * `router.post("/", postPrestamo)`
     * `router.put("/:id/devolucion", putDevolucion)`

#### 🆕 Archivos Nuevos a Crear (Frontend):
1. `frontend/pedidos.html`:
   * Formulario con input de DNI, botón de verificación de alumno, selector de libro y selector de fecha/días de devolución.
   * Tabla o tarjetas con la lista de préstamos activos y botón "Registrar Devolución".
2. `frontend/css/pedidos.css`:
   * Estilos del formulario móvil y estados de los préstamos (a tiempo en verde, atrasado en rojo).
3. `frontend/js/pedidos.js`:
   * Llamada con `fetch()` a `/api/usuarios/dni/:dni` (hecho por G5) para validar si el alumno está habilitado.
   * Envío del formulario con `fetch("/api/prestamos", { method: "POST", body: ... })` para registrar el préstamo.

---

### 🟢 GRUPO 5 — Usuarios, Dashboard Admin y Configuración

#### 🔧 Archivos Existentes a Mejorar / Corregir:
1. `backend/src/config/config.js` y `backend/src/database/db.js`:
   * **Corrección obligatoria:** Eliminar definitivamente `process.env.DB_HOST || "localhost"` y `root`. Exigir variables estrictas de Aiven Cloud con fail-fast para que el sistema avise de inmediato si falta el `.env`.
2. `backend/src/controllers/usuarios.controllers.js`:
   * **Qué mejorar:** Asegurarse de que el endpoint `GET /api/usuarios/dni/:dni` devuelva `{ payload: { id, nombre_completo, curso, estado } }` de forma rápida y limpia para que el Grupo 4 lo consuma sin trabas.
   * Implementar `getHistorialUsuario()` (`GET /api/usuarios/:id/historial`) haciendo el `JOIN` con la tabla `pedidos` para ver qué libros tiene cada usuario.
3. `backend/src/controllers/prestamos.controllers.js` o `busqueda.controllers.js`:
   * **Qué agregar:** Crear la función `getMetricasDashboard()` que consulte los totales globales (`libros_total`, `prestamos_activos`, `alumnos_morosos`) y exponerla en `GET /api/dashboard`.
4. `frontend/js/inicio.js` e `index.html`:
   * **Qué mejorar:** Conectar los números y contadores del inicio (`#total-prestamos`, `#total-morosos`, etc.) para que muestren las métricas reales que devuelve `GET /api/dashboard` en vez de números fijos.
5. `frontend/js/usuarios-ui.js`:
   * **Qué mejorar:** En el modal de detalle del usuario, pintar la sección de préstamos activos consumiendo `/api/usuarios/:id/historial`.

#### 🗑️ Qué deben purgar / delegar:
* Eliminar `frontend/libros.html` y `frontend/css/admin-catalogo.css` de sus ramas (`g5-andrada`, `g5-barufaldi`): el módulo de libros es responsabilidad exclusiva de Grupo 6.

