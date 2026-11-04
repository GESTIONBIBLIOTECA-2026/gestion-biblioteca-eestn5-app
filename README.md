# 📱 Biblioteca Invaluable · App para alumnos y docentes (Grupo 5)

**Progressive Web App (PWA)** del sistema de biblioteca, hecha con la teoría de la **clase 07**.
Es solo para **alumnos y docentes**: el administrador usa la plataforma web de escritorio (si intenta entrar acá,
el backend responde `403`).

- **Frontend:** HTML + CSS (carpeta `css/`) + JS con ES Modules, instalable como app (manifest + Service Worker).
- **Backend:** Node.js + Express con arquitectura **MVC**, todo en JavaScript (sin PHP).
- **Base de datos:** MySQL en Aiven, conectada desde Node con **`mysql2`** (pool de conexiones + SSL).

```text
[ PWA ]  fetch()  ─►  [ Service Worker ]  ─►  [ Express: Router ➔ Controller ➔ Model ]  ─►  mysql2  ─►  [ MySQL Aiven ]
 frontend/             frontend/sw.js           backend/ (puerto 3000)                       src/database/db.js
```

> 🧠 **Guía de Razonamiento y Arquitectura MVC (Obligatoria para G4, G5 y G6):**  
> Consultá [docs/roadmap-implementacion-mvc.md](docs/roadmap-implementacion-mvc.md) para entender el flujo mental en 4 pasos (Model ➔ Controller ➔ Router ➔ View) y el orden de dependencias entre los 3 grupos.

---

## 📂 Estructura

```text
.
├── frontend/
│   ├── index.html                inicio de sesión (start_url de la app)
│   ├── inicio-usuario.html       mi cuenta: credencial digital, préstamos, reservas, historial y sanciones
│   ├── catalogo.html             buscador de libros con disponibilidad (Grupo 6)
│   ├── configuracion.html        mis datos, contraseña y apariencia
│   ├── manifest.json             PWA: nombre, colores, íconos y display "standalone"
│   ├── sw.js                     PWA: Service Worker (App Shell en caché + datos offline)
│   ├── assets/icons/             icon-192x192.png e icon-512x512.png (maskable)
│   ├── css/                      estilo-general.css (temas, menú lateral, encabezado, botones), componentes.css
│   │                             (paneles, filtros, etiquetas), login.css, inicio-base.css, inicio-usuario.css,
│   │                             catalogo.css, configuracion.css
│   └── js/                       ES Modules (import / export), cada archivo ~100 líneas o menos
│       ├── config.js             URL del backend
│       ├── api.js                fetch al backend (async/await, response.ok, AbortSignal)
│       ├── storage.js            sesión en localStorage (JSON); al cerrar sesión borra los datos guardados offline
│       ├── ui.js                 fechas, aviso flotante, errores de formularios y plantillas generales
│       ├── tema.js               modo claro / oscuro con classList (script común en el <head>)
│       ├── sesion.js             protege las páginas + encabezado (nombre, reloj, menú del perfil)
│       ├── pwa.js                registra sw.js y maneja el botón "Instalar app" (beforeinstallprompt)
│       ├── login.js              index.html
│       ├── inicio-usuario.js     inicio-usuario.html: préstamos, devoluciones pendientes e historial
│       ├── inicio-usuario-ui.js  plantillas: plazos, números de la cuenta, préstamos e historial
│       ├── cuenta-usuario.js     credencial digital, aviso de la cuenta y sanciones
│       ├── catalogo.js           catalogo.html: buscador en vivo con filtros combinados
│       ├── libros-ui.js          plantilla de la tarjeta de libro y estado del stock
│       └── configuracion.js      configuracion.html: mis datos y contraseña
│
└── backend/                      MVC: index.js ➔ Router ➔ Controller ➔ Model ➔ MySQL
    ├── index.js                  servidor Express (cors, express.json, rutas) + sirve frontend/
    ├── .env.example              plantilla (el .env real NO se sube)
    ├── src/
    │   ├── config/               env.js (.env con fail-fast), constants.js (roles que usan la app), config.js (re-exporta)
    │   ├── database/db.js        pool de mysql2 → MySQL Aiven (SSL)
    │   ├── models/               MODEL: solo SQL con comodines "?", devuelve datos
    │   │   ├── usuario.models.js, usuario.sql.js, perfil.models.js, sancion.models.js
    │   │   └── libro.models.js (catálogo, solo lectura)
    │   ├── controllers/          CONTROLLER: auth, perfil, sanciones (mi historial), libros + respuestas.js
    │   ├── routes/               ROUTER: auth, perfil, libros
    │   └── middlewares/          auth (token), validaciones (URL), formularios (body), predicados, libros, límite de intentos
    └── scripts/                  schema.sql, datos-prueba-grupo5.sql, inicializar-bd.js, generar-hash.js
```

### Endpoints

> Todas menos el login piden el header `Authorization: Bearer <token>` y aceptan solo **alumnos y docentes**
> (`verificarSesion`). Un alumno/docente suspendido puede iniciar sesión para ver su estado; de baja no entra nadie.

| Método | Ruta | Qué hace |
|---|---|---|
| `POST` | `/api/auth/login` | Body `{ "dni", "clave" }` → `{ payload: { token, usuario } }`. Si es administrador → `403` |
| `GET` | `/api/auth/perfil` | Quién está logueado → `{ payload: { id, nombre, rol } }` |
| `GET` | `/api/perfil` | Mis datos completos (pantalla Configuración) |
| `PUT` | `/api/perfil` | Body `{ nombre_completo, correo, telefono, direccion }` (el DNI y el rol no se cambian desde acá) |
| `PUT` | `/api/perfil/clave` | Body `{ clave_actual, clave_nueva, confirmacion }` |
| `GET` | `/api/perfil/historial` | Mi cuenta: mis datos, préstamos con `dias_restantes`, reservas y sanciones |
| **Grupo 6 (integrado, solo lectura)** | | |
| `GET` | `/api/libros?texto=&categoria=&disponibilidad=` | Catálogo con stock. `disponibilidad`: `disponible` o `agotado` |
| `GET` | `/api/libros/:id` | Un libro con autores, editorial, categoría y stock |
| `GET` | `/api/libros/categorias` | Categorías para los selectores |

Si un dato está mal, la API responde `400` con `{ error, campos: { correo: "..." } }` y la pantalla marca ese campo.

---

## 📲 La PWA (clase 07)

| Pieza | Archivo | Qué hace |
|---|---|---|
| Manifiesto | `frontend/manifest.json` | Nombre, `short_name` "Biblioteca", `start_url` `index.html`, `display: "standalone"`, colores e íconos |
| Vinculación | `<head>` de las 4 páginas | `<link rel="manifest">`, `theme-color` y las meta etiquetas de iOS (`apple-mobile-web-app-*`) |
| Registro | `frontend/js/pwa.js` | `navigator.serviceWorker.register("sw.js")` cuando carga la página |
| Service Worker | `frontend/sw.js` | `install` (pre-cachea el App Shell), `activate` (borra cachés viejas), `fetch` (estrategias) |
| Instalación | `frontend/js/pwa.js` | Captura `beforeinstallprompt` y muestra el botón **Instalar app** (login y menú lateral) |

Estrategias de caché del `sw.js`:

- **Cache First** → App Shell (HTML, CSS, JS, íconos): carga al instante y abre sin internet.
- **Network First** → `GET /api/...`: datos frescos si hay conexión; offline muestra los últimos guardados.
- **Network Only** → login, guardar perfil y cambiar contraseña (`POST` / `PUT`): nunca se cachean.

> ⚠️ **Cada vez que cambies un HTML, CSS o JS**, subí la versión de `CACHE_NAME` en `sw.js`
> (`biblioteca-app-v1` → `v2`). Si no, los celulares siguen usando los archivos viejos de la caché.
> Mientras programás: F12 → **Application** → **Service Workers** → tildá **Update on reload** y **Bypass for network**.

Los íconos (Lucide) y la fuente Inter siguen viniendo de internet (CDN): sin conexión la app abre igual,
pero sin esos íconos y con la letra del sistema.

### Probarla
1. Encendé el backend (ver abajo) y abrí **http://localhost:3000** en Chrome.
2. F12 → **Application** → **Manifest**: sin errores y con los íconos.
3. **Service Workers**: `sw.js` en verde (*activated and is running*). **Cache Storage**: `biblioteca-app-v1`.
4. Iniciá sesión, tildá **Offline** en *Service Workers* y recargá: la app sigue mostrando tu cuenta y el catálogo.
5. **Lighthouse** → categoría *Progressive Web App* → *Analyze page load*.

---

## 🚀 Cómo levantarlo

> En PowerShell usá `npm.cmd` en vez de `npm` (o cambiá la terminal a **Command Prompt**).

### 1. Instalar dependencias (una sola vez, y cada vez que cambie `package.json`)
```
cd backend
npm.cmd install
```

### 2. Crear `backend/.env`
```
copy .env.example .env
```
Completá los datos de Aiven, guardá el `ca.pem` de Aiven dentro de `backend/` e inventá un texto largo para `JWT_SECRET`.
El backend **no arranca** si falta alguna variable obligatoria (`JWT_SECRET`, `DB_HOST`, `DB_PORT`, `DB_USER`,
`DB_PASSWORD`, `DB_NAME`): avisa cuál falta y se detiene (fail-fast).

### 3. Encender el servidor (una sola terminal)
```
cd backend
npm.cmd run dev
```
Tiene que decir:
```
🚀 Servidor activo en http://localhost:3000
✅ Base de datos conectada
```

### 4. Abrir la app
**http://localhost:3000** (abre `index.html`, el inicio de sesión).

**Datos de prueba (opcional):** `backend/scripts/datos-prueba-grupo5.sql` carga usuarios de ejemplo (DNI 99010016,
clave `prueba123`) con préstamos al día, devueltos, atrasados y sanciones. Al final del archivo está cómo borrarlos.

---

## 🕒 Zona horaria

Cada conexión arranca con `SET time_zone = '-03:00'`, así `NOW()` y `CURRENT_DATE` dan la hora de Argentina
(vencimientos y días de atraso). Se cambia con `DB_ZONA_HORARIA` en `backend/.env`.

---

## 🧯 Problemas comunes

| Mensaje | Solución |
|---|---|
| `Cannot find package 'mysql2'` | Falta `npm.cmd install` dentro de `backend/`. |
| `Access denied for user` | Revisá `DB_USER` / `DB_PASSWORD` en `backend/.env`. |
| `ETIMEDOUT` / `ENOTFOUND` | Revisá `DB_HOST` / `DB_PORT` y que el servicio de Aiven esté en **Running**. |
| `self-signed certificate` / error de SSL | Revisá que `ca.pem` sea el de Aiven y esté en `backend/`. |
| `Falta JWT_SECRET` | Agregalo en `backend/.env`. |
| En la página: "No hay conexión con el servidor" | Falta la terminal con `npm.cmd run dev`. |
| Cambié el CSS/JS y no se ve | Subí `CACHE_NAME` en `sw.js` o usá **Bypass for network** (F12 → Application). |
| "Esta app es para alumnos y docentes" | Entraste con un administrador: usá la plataforma web de escritorio. |
