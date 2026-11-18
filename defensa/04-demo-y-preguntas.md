# 4. Demo en vivo y preguntas

## Antes de empezar (5 minutos antes)

1. **Abrí la app** (la publicada o `npm start` → `http://localhost:3000`).
2. **Dos ventanas:** una normal para el alumno y una **de incógnito** para el administrador (así no se pisan las sesiones).
3. **Probá el circuito una vez** y después **cancelá** el pedido de prueba desde el panel, para que la demo te salga limpia.
4. Tené a mano: alumno `99010001` / `prueba123` · admin `30111222` / `gaby12345678`.
5. Si la app venía abierta de antes y no ves tus cambios: **F12 → Application → Service Workers → tildá "Update on reload"** y recargá.

---

## Guion de 5 minutos (el orden que mejor se entiende)

### 1. Login del alumno (30 s)
Entrás con el DNI y la clave y aparece **Mi biblioteca**: nombre, credencial digital y el resumen.

> "El login lo resuelve el servidor: compara la contraseña con un hash y devuelve un token que vence en 8 horas. La credencial digital reemplaza la de papel y tiene un código para el mostrador."

### 2. Catálogo (30 s)
Buscás "cosmos", mostrás los filtros y la disponibilidad ("Disponible · 2 libres").

> "El stock no se carga a mano: se calcula con los ejemplares disponibles menos los que ya están reservados en pedidos pendientes."

### 3. Pedir un libro (1 min) ← **el momento clave**
Vas a **Mis préstamos**, elegís el libro, ponés cantidad y fecha, y confirmás.

> "El pedido queda **pendiente**, 'Para retirar'. No se aprueba solo: lo tiene que confirmar la biblioteca. Fijate que el stock bajó de 2 a 1 al instante: el sistema ya lo reservó para mí."

Mostrá los números de arriba (reservas para retirar) y el filtro **Reservas 1**.

### 4. El bibliotecario confirma (1 min)
En la ventana del administrador: **Pedidos → el pedido pendiente → Confirmar entrega**.

> "Acá se cierra el circuito: al confirmar, el sistema elige un ejemplar físico, guarda la fecha de entrega y deja registrado quién lo autorizó."

### 5. El alumno lo ve en su celular (30 s)
Volvés a la ventana del alumno → **Actualizar** → el pedido dice **"En préstamo"** con los días que faltan.

> "Ese es el mismo dato visto desde los dos lados. No hay una base para el celular y otra para la computadora: es la misma."

### 6. Devolución (30 s)
El administrador marca **Devuelto** → el alumno actualiza → "Devuelto" y el stock vuelve a 2.

### 7. Extras (si hay tiempo)
- **Cuenta sancionada:** entrá con `99010026` / `prueba123` → banner "Cuenta en condición: SUSPENDIDO" y todos los botones en "No habilitado".
- **Docente:** `99010031` / `prueba123` → no aparece "Pedir un libro".
- **Modo claro:** menú del perfil → Apariencia.
- **Celular:** F12 → modo dispositivo (390 px) o abrir desde el celular.
- **PWA:** botón "Instalar app" y, si querés sorprender, F12 → Network → **Offline** → recargar: la app sigue abriendo.

> **Consejo:** no expliques todo de una. Mostrá el circuito (pedir → confirmar → devolver) y dejá los detalles para las preguntas.

---

## Preguntas probables y respuestas cortas

**1. ¿Qué es esta app?**
Una PWA para la biblioteca: el alumno pide libros desde el celular y el bibliotecario los entrega y controla el stock desde el panel.

**2. ¿Qué es una PWA?**
Una página web que se instala como app, tiene ícono propio y puede abrir sin internet. No hace falta publicarla en Play Store.

**3. ¿Por qué no usaron React/Angular?**
Porque el objetivo era aprender la base: DOM, `fetch`, módulos y CSS. Sin frameworks no hay compilación y el código se entiende línea por línea.

**4. ¿Cómo guardan las contraseñas?**
Nunca se guardan en texto: se guarda un **hash** con `bcrypt`. Al entrar se compara el hash, no la clave. Aunque alguien vea la base, no puede leer las contraseñas.

**5. ¿Qué es el token JWT?**
Un texto firmado por el servidor que dice quién sos y qué rol tenés. El navegador lo manda en cada pedido y el servidor lo verifica. Vence a las 8 horas.

**6. ¿Y si alguien modifica el token?**
No sirve: está firmado con un secreto que solo tiene el servidor. Si lo cambian, el servidor responde 401 y lo manda al login.

**7. ¿Cómo evitan que dos alumnos pidan el mismo libro?**
Dos controles. En la pantalla se muestra el stock reservable y se limita la cantidad; en el servidor, dentro de una transacción, se bloquea el libro y se vuelve a calcular el stock. Si no alcanza, responde 409 y el pedido no se crea.

**8. ¿Por qué el pedido no queda aprobado automáticamente?**
Porque el libro se entrega físicamente en el mostrador. El alumno **solicita** y la biblioteca **confirma**; así queda registro de quién entregó y cuándo.

**9. ¿Qué pasa si el alumno está sancionado?**
El servidor calcula la condición (`habilitado`, `atraso`, `suspendido`). Si no está habilitado, la pantalla muestra el catálogo pero con los botones deshabilitados y un aviso, y el backend rechaza el pedido igual.

**10. ¿Cómo saben si un préstamo está vencido?**
Se compara la fecha estimada de devolución con la fecha de hoy. El panel tiene la acción "Actualizar vencidos": pasa el pedido a `vencido` y registra la sanción por atraso. Además, los días de atraso se calculan también al mostrar el historial, así el dato nunca queda viejo.

**11. ¿Qué es MVC?**
Un patrón para ordenar el backend en tres partes: el **Modelo** (habla con la base), el **Controlador** (valida y decide) y las **Vistas/rutas** (lo que ve el usuario). Así cada archivo hace una sola cosa.

**12. ¿Dónde está la base de datos?**
En MySQL. En la versión publicada está en Aiven (en la nube) y en la escuela se puede usar MySQL local. La conexión se configura con un archivo `.env` que no se sube al repositorio.

**13. ¿Qué pasa si se cae la base?**
El servidor responde con un error controlado (500) y un mensaje claro, no se rompe la app. Además, gracias al Service Worker, las últimas pantallas se pueden seguir viendo.

**14. ¿Funciona sin internet?**
Sí, para **consultar**: abre y muestra lo último que se guardó. Para **pedir** hace falta conexión, porque el pedido se guarda en el servidor.

**15. ¿Qué parte hiciste vos?**
La pantalla **Mis préstamos**: pedir un libro, ver y filtrar los pedidos, los números y los avisos de la cuenta, el diálogo de reserva con sus validaciones, y los estilos y el menú de esa sección.

**16. ¿Qué mejorarían?**
Notificaciones cuando el libro está listo para retirar, renovación en línea, un lector de código de barras para el mostrador y un informe de los libros más pedidos.

**17. ¿Cómo lo publicaron?**
El frontend y la API en **Vercel**; la base en **Aiven**. El mismo código corre en la escuela con `npm start` en `http://localhost:3000`.

**18. ¿Qué es lo más difícil que resolvieron?**
El control de stock sin que dos personas se queden con la misma copia: hay que bloquear el libro, recalcular el stock y confirmar todo dentro de una transacción.

---

## Si algo falla en vivo

| Síntoma | Qué hacer |
|---|---|
| No aparecen los cambios que hiciste | F12 → Application → Service Workers → "Update on reload" y recargá (el Service Worker guarda la versión vieja) |
| "Tenés que iniciar sesión" / te manda al login | El token venció (8 h): volvé a entrar |
| El libro dice "Sin stock" | Ya está reservado o prestado: elegí otro y explicá que el sistema lo está cuidando |
| El pedido no aparece en el panel | Recargá el panel; si no, revisá que sea el mismo libro y el mismo alumno |
| Página en blanco | Revisá la consola (F12): puede ser que el backend esté apagado o sin conexión a la base |
| El administrador no entra | Verificá la clave del administrador en tu base |

**Frase para salir del paso:** "Ese error es del entorno (base o conexión), no de la lógica: el sistema responde con un mensaje controlado". Y mostralo: el manejo de errores también es parte del trabajo.

---

## Glosario mínimo

| Palabra | Qué es, en simple |
|---|---|
| **API** | La puerta por donde el frontend pide datos al backend |
| **Endpoint** | Una dirección de esa API (por ejemplo `POST /api/mis-pedidos`) |
| **JSON** | Formato de texto para mandar datos: `{ "cantidad": 1 }` |
| **Token / JWT** | Credencial firmada que prueba quién sos en cada pedido |
| **Hash** | "Huella" de una contraseña: no se puede volver atrás |
| **Middleware** | Filtro que revisa algo antes de llegar al controlador (token, rol, datos) |
| **MVC** | Modelo (base de datos) – Controlador (reglas) – Vista (rutas/pantalla) |
| **CRUD** | Crear, leer, actualizar y borrar (las cuatro operaciones básicas) |
| **Transacción** | Varios cambios que se guardan todos juntos o no se guarda ninguno |
| **Vista SQL** | Una consulta guardada en la base que se usa como si fuera una tabla |
| **Service Worker** | Programa que corre aparte y guarda archivos para funcionar sin internet |
| **Variable CSS** | Un color o medida definida una vez y usada en toda la app |
| **DOM** | El árbol de elementos de la página que JavaScript puede modificar |
| **Responsive** | Que la pantalla se adapte a celular, tablet y computadora |
| **`fetch`** | La función de JavaScript para pedir datos a un servidor |
| **CORS** | Permiso que da el servidor para que otra dirección pueda consultarlo |

---

## Cierre (para decir al final)

> "La app resuelve el circuito completo de una biblioteca: el alumno pide, la biblioteca confirma, el sistema controla el stock y las fechas, y todo queda registrado. Está hecha con tecnologías web estándar, se instala como app, funciona sin internet para consultar y la misma base la usan los tres módulos del proyecto."
