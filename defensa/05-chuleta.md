# 5. Chuleta (para imprimir o tener en el celular)

## La app
- **Nombre:** Biblioteca Invaluable — E.E.S.T. N° 5 (7° 5ta).
- **Qué es:** PWA (web instalable) para pedir y gestionar préstamos de la biblioteca.
- **Frontend:** HTML + CSS + JavaScript con módulos. **Sin frameworks.**
- **Backend:** Node.js + Express con **MVC** (Router → Controller → Model).
- **Base de datos:** **MySQL** (Aiven en la nube, con SSL). Consultas con `?` (evita inyección SQL).
- **Seguridad:** contraseñas con **hash bcrypt** + **token JWT** que vence en **8 horas**.
- **Publicación:** Vercel (frontend + API). En la escuela: `npm start` → `localhost:3000`.
- **PWA:** `manifest.json` + `sw.js` (caché) + botón "Instalar app". Abre sin internet para consultar.

## Roles
- **Alumno:** pide libros y ve su cuenta.
- **Docente:** ve su cuenta; **no pide** desde la app.
- **Administrador:** panel completo (usuarios, libros, pedidos, préstamos).
- El **rol lo decide el servidor** con el token, no el navegador.

## El circuito (lo más importante)
1. El alumno **pide** → queda **pendiente ("Para retirar")**.
2. El sistema **reserva** ese ejemplar (descuenta del stock reservable).
3. El bibliotecario **confirma la entrega** → **prestado** (se asigna el ejemplar físico y la fecha).
4. El bibliotecario marca **devuelto** → el ejemplar vuelve a estar disponible.
5. Si la fecha pasa sin devolver → **vencido** + sanción por atraso.

## Estados
`pendiente` → `prestado` | `cancelado` · `prestado` → `devuelto` | `vencido` · `vencido` → `devuelto`
(El servidor rechaza cualquier otro salto: **409**.)

## La fórmula del stock
```text
stock_reservable = ejemplares disponibles − reservados en pedidos pendientes
```
Se controla **en la pantalla** y **otra vez en el servidor**, dentro de una **transacción**.

## Mi módulo (Grupo 4) — Mis préstamos
- **Pantalla:** `mis-prestamos.html` + `css/mis-prestamos.css`.
- **JS:** `mis-prestamos.js` (lógica) · `-ui.js` (plantillas) · `-render.js` (dibujo) · `-dialogo.js` (pedir).
- **Endpoints:** `GET /api/perfil/historial` · `GET /api/mis-pedidos/perfil` · `GET /api/libros` · `GET /api/libros/categorias` · `POST /api/mis-pedidos`.
- **La confirmación** la hace el admin con `PATCH /api/prestamos/:id/estado` (no la usa mi pantalla).
- **No toqué** backend, base de datos ni login. Sí agregué el ítem de menú en 3 páginas y la caché en `sw.js`.

## Cinco frases que suman
1. "El alumno **solicita**, la biblioteca **confirma**: no hay autoaprobación."
2. "El stock se calcula, no se escribe a mano."
3. "Todo cambio de estado queda registrado en `pedido_historial`."
4. "El rol y los permisos se validan en el servidor, no en el navegador."
5. "Reutilicé los componentes de la app, por eso la pantalla nueva se ve igual que el resto."

## Cuentas demo (clave `prueba123` para los DNI que empiezan con 9901)
- Alumno habilitado: `99010001`
- Alumno suspendido: `99010026`
- Docente: `99010031`
- Administrador: `30111222` / `gaby12345678` *(verificá la clave de tu base)*

## Si te trabás
- "Ese error es del entorno (conexión o base), no de la lógica."
- "La app responde con un mensaje controlado; por eso el usuario nunca ve un error técnico."
- "Lo que se ve en el celular y en el panel es **el mismo dato**, no dos sistemas."
