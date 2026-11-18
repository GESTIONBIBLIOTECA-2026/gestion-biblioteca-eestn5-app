# 2. Cómo funciona por dentro

## El mapa general

```text
[ Celular o PC ]
      │  fetch("/api/…")  +  token
      ▼
[ FRONTEND  ·  HTML + CSS + JavaScript ]        → se ve en el navegador (Vercel)
      │  HTTP + JSON
      ▼
[ BACKEND  ·  Node.js + Express ]               → piensa y decide
   index.js ➔ Router ➔ Controller ➔ Model
      │  SQL con comodines (?)
      ▼
[ BASE DE DATOS  ·  MySQL ]                     → guarda todo (Aiven)
```

**La analogía del restaurante** (sirve mucho para explicarlo):

| Capa | En la app | En el restaurante |
|---|---|---|
| Frontend | Lo que ves y tocás | El menú y el salón |
| Router | Decide qué ruta atiende el pedido | El mozo que toma el pedido |
| Controller | Valida y decide qué hacer | La cocina, que aplica la receta |
| Model | Lee y escribe en la base | El depósito con los ingredientes |
| MySQL | Guarda los datos | La heladera y la alacena |

---

## El backend (Node.js + Express)

Carpeta `backend/`. Se usa el patrón **MVC** (Modelo – Vista – Controlador), que en este proyecto queda así:

| Carpeta | Qué hace | Ejemplo |
|---|---|---|
| `src/routes/` | Define las URL y quién puede entrar | `prestamos.routes.js`: `/api/prestamos` solo administrador |
| `src/controllers/` | Recibe el pedido, valida y responde | `mis-pedidos.controllers.js`: crea el pedido del alumno |
| `src/models/` | Habla con la base: SQL con `?` (nunca texto pegado) | `prestamo.models.js`: `crearPedido`, `cambiarEstadoPedido` |
| `src/middlewares/` | Filtros que pasan antes del controlador | `auth.middleware.js`: revisa el token y el rol |
| `src/config/` | Puertos, roles, duración del token, conexión | `env.js` lee el `.env` |
| `src/database/db.js` | Pool de conexiones a MySQL (`mysql2`) | Reutiliza conexiones en vez de abrir una por pedido |
| `index.js` | Arranca el servidor y arma las rutas | También sirve los archivos del frontend |

**Tres middlewares que conviene nombrar:**

- `verificarSesion`: exige un token válido; deja el usuario en `req.usuario`.
- `verificarAlumno`: solo alumnos (los docentes y el admin reciben **403**).
- `verificarAdmin`: solo administradores.

---

## El frontend (HTML + CSS + JavaScript)

Carpeta `frontend/`. **No hay React, Angular ni Bootstrap**: HTML semántico, CSS con variables y JavaScript moderno con **módulos** (`import` / `export`).

| Archivo | Rol |
|---|---|
| `js/api.js` | **Todas** las llamadas al servidor pasan por acá (`fetch`, token, manejo de errores) |
| `js/storage.js` | Guarda y lee la sesión en `localStorage` |
| `js/sesion.js` | Protege las páginas, muestra el nombre y el menú del perfil |
| `js/ui.js` | Funciones chicas compartidas: escapar HTML, fechas, avisos |
| `js/tema.js` | Modo claro / oscuro (se carga primero para que no parpadee) |
| `js/pwa.js` | Registra el Service Worker y muestra "Instalar app" |
| `js/*-ui.js` | Plantillas de HTML (tarjetas, filas, estados) |
| `js/<pantalla>.js` | La lógica de cada pantalla |

**Por qué módulos:** cada archivo tiene una responsabilidad y no se repite código. Por ejemplo, la tarjeta de un libro se arma en un solo lugar (`libros-ui.js`) y la usan el catálogo y "Mis préstamos".

---

## Cómo viaja un pedido (el recorrido completo)

Ejemplo: **Valentina pide "Cosmos" desde el celular**.

1. Toca **Reservar** → `mis-prestamos.js` abre el diálogo con la cantidad y la fecha.
2. Confirma → `mis-prestamos-dialogo.js` valida en el navegador (cantidad ≥ 1, no más que el stock, fecha de hoy en adelante).
3. `api.js` manda `POST /api/mis-pedidos` con el token en el encabezado `Authorization`.
4. `mis-pedidos.routes.js` → `verificarAlumno` (traduce el token en un usuario) → `postMiPedido`.
5. El controlador llama a `crearPedido()` y **abre una transacción**:
   - bloquea al usuario y al libro (`FOR UPDATE`) para que dos pedidos simultáneos no se pisen;
   - recalcula la **condición** de la cuenta (habilitado / atraso / suspendido);
   - calcula el **stock libre** = ejemplares disponibles − pendientes;
   - valida la fecha contra la fecha de hoy del servidor;
   - inserta el pedido en estado **`pendiente`** y una línea en el historial.
6. Responde `201`. El frontend recarga los datos: el pedido aparece como **"Para retirar"** y los números de arriba cambian.
7. En la biblioteca, el bibliotecario abre `pedidos.html`, ve el pedido y toca **Confirmar entrega** → `PATCH /api/prestamos/:id/estado` con `{ "estado": "prestado" }`.
8. `cambiarEstadoPedido()` busca ejemplares disponibles, los marca como prestados, guarda la **fecha de entrega** y anota el cambio en el historial.
9. Cuando el alumno lo devuelve, el bibliotecario marca `devuelto` y los ejemplares vuelven a estar disponibles.

> **Fijate en la idea central:** el alumno **pide**, pero el préstamo lo **confirma la biblioteca**. Así el sistema no entrega libros solo y queda registro de quién hizo cada paso.

---

## Login y sesión (JWT)

1. El alumno escribe DNI y contraseña en `index.html`.
2. `POST /api/auth/login`: el servidor busca el usuario, compara la clave con el **hash** guardado usando `bcrypt` (la contraseña real nunca se guarda).
3. Si está bien, devuelve un **token JWT** firmado con un secreto del servidor y **válido 8 horas**. El token dice quién sos y qué rol tenés, pero no incluye la contraseña.
4. El navegador lo guarda en `localStorage` (`biblioteca_sesion_v1`) y desde ahí **cada pedido** lo manda en `Authorization: Bearer <token>`.
5. `sesion.js` pregunta `GET /api/auth/perfil` para confirmar que el token sigue siendo válido. Mientras tanto, la página está oculta con la clase `verificando-sesion` (así nadie ve datos antes de tiempo). Si el token venció, borra la sesión y vuelve al login.
6. Si quien entra es **administrador**, la app lo manda al panel (`panel.html`).

**Por qué está bien así:** el navegador no decide el rol, solo lo transporta. La decisión final siempre la toma el servidor mirando el token. Si alguien cambia el `localStorage` a mano, el servidor igual lo rechaza (401/403).

---

## La base de datos

MySQL, con estas tablas (las importantes):

| Tabla | Qué guarda |
|---|---|
| `usuarios` | Alumnos, docentes y administradores (DNI, nombre, curso, clave en hash, estado) |
| `roles`, `cursos` | Catálogos de roles y divisiones ("1ro 1ra", "4to 2da"…) |
| `libros`, `autores`, `categorias`, `editoriales`, `libros_autores` | El catálogo |
| `ejemplares` | **Cada copia física** de un libro, con su estado: `disponible`, `prestado`, … |
| `pedidos` | La solicitud: quién, qué libro, cuántos, fechas y **estado** |
| `pedido_ejemplares` | Qué copia física exacta se llevó en cada pedido |
| `pedido_historial` | Cada cambio de estado, con quién lo hizo y cuándo (auditoría) |
| `sanciones` | Suspensiones y atrasos |

**Diferencia clave: libro ≠ ejemplar.**
"Cosmos" es **un libro**; la biblioteca puede tener **2 ejemplares** de ese libro. El pedido apunta al libro, y recién en la entrega se elige qué ejemplar físico sale. Por eso dos alumnos pueden pedir el mismo título si hay dos copias.

**Vistas (consultas guardadas):**

- `vista_stock_libros`: calcula el stock de cada libro (disponibles y reservados).
- `vista_historial_usuario`: arma el historial de cada persona con los días de atraso.

**La fórmula del stock (la que más se pregunta):**

```text
stock_reservable = ejemplares disponibles − ejemplares ya reservados en pedidos pendientes
```

Si hay 2 copias y una persona ya pidió una (pendiente), quedan **1 reservable**. Eso evita que dos alumnos se lleven la misma copia.

---

## La PWA (instalar y funcionar sin internet)

| Pieza | Archivo | Qué hace |
|---|---|---|
| Manifiesto | `manifest.json` | Nombre, íconos, colores y que se abra sin barra del navegador |
| Service Worker | `sw.js` | Intercepta las peticiones y decide si responde de la caché o de internet |
| Registro | `js/pwa.js` | Lo activa y maneja el botón **Instalar app** |

**Tres estrategias de caché** (esto suena técnico pero es simple):

- **Cache First** → pantallas, CSS, JS e íconos: se abren al instante y sin internet.
- **Network First** → consultas `GET /api/…`: primero internet, y si no hay, muestra lo último guardado.
- **Network Only** → login, guardar perfil y cambiar contraseña: nunca se guardan (son datos sensibles).

> Cada vez que se cambia un HTML, CSS o JS hay que **subir el número de versión** (`CACHE_NAME`) en `sw.js`. Así los celulares bajan la versión nueva en vez de quedarse con la vieja.

---

## ¿Dónde corre?

| | |
|---|---|
| **En la escuela / para probar** | `npm start` levanta el backend en `http://localhost:3000` y el mismo servidor entrega las páginas del frontend |
| **En internet** | Vercel publica el frontend y la API (`api/index.js` + `vercel.json`) |
| **Base de datos** | MySQL en Aiven, con conexión cifrada (SSL) |
| **Configuración** | Todo lo sensible (usuario, clave, secreto del token) va en un archivo `.env` que **no se sube** al repositorio |

---

## Decisiones técnicas (por si preguntan "¿por qué?")

| Decisión | Por qué |
|---|---|
| **Sin frameworks** | Es un proyecto escolar: se aprende la base (DOM, `fetch`, módulos) y no hay que compilar nada |
| **JWT en vez de sesiones con cookies** | Funciona igual en el celular y en Vercel (serverless), y el servidor no tiene que guardar sesiones |
| **Contraseñas con hash (bcrypt)** | Si alguien viera la base, no puede leer las claves reales |
| **`?` en el SQL** | Evita inyección SQL: los datos viajan separados de la consulta |
| **Transacciones (`BEGIN` / `COMMIT` / `ROLLBACK`)** | Si algo falla a la mitad (por ejemplo, no hay ejemplares), no queda nada a medio guardar |
| **Variables CSS y modo claro/oscuro** | Un solo lugar define los colores y el tema cambia con una clase |
| **Service Worker** | La app abre rápido y sirve para consultar aunque el WiFi de la escuela falle |
