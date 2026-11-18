# 3. Mi módulo: "Mis préstamos" (Grupo 4)

## En una frase

Agregué a la app una pantalla nueva, **`mis-prestamos.html`**, donde el alumno pide un libro y sigue el estado de cada pedido (reservado, en su poder, devuelto o atrasado), con el control de stock y la confirmación a cargo del bibliotecario.

---

## Qué puede hacer el alumno en esa pantalla

1. **Ver su situación:** cuántos libros tiene, cuál vence primero, si tiene algo vencido y cuántas reservas espera retirar.
2. **Pedir un libro:** buscar por título o autor, filtrar por categoría, ver cuántos ejemplares hay y solicitar el préstamo indicando cantidad y fecha estimada de devolución.
3. **Seguir cada pedido:** "Para retirar", "En préstamo" con los días que faltan, "Devuelto", "Cancelado" o "Con atraso".
4. **Filtrar su historial:** Todos, Reservas, En curso, Devueltos y Con atraso, con el número al lado de cada uno.

---

## El flujo completo, paso a paso

```text
  Alumno pide  ──►  PENDIENTE ("Para retirar")  ──►  PRESTADO ("En préstamo")
                         │                              │
                    la biblioteca                  la fecha pasa
                     lo cancela                    sin devolver
                         │                              │
                         ▼                              ▼
                     CANCELADO                       VENCIDO
                                                        │
                                                   lo devuelve
                                                        ▼
                                                     DEVUELTO
```

| Paso | Quién | Qué pasa |
|---|---|---|
| 1 | Alumno | Elige el libro, la cantidad y la fecha. **No** puede elegir un estado: el pedido nace `pendiente` |
| 2 | Sistema | Descuenta ese ejemplar del **stock reservable** para que otro no lo pida |
| 3 | Bibliotecario | Ve el pedido en `pedidos.html` y confirma la entrega → estado `prestado` (se guarda la fecha de entrega y se asignan los ejemplares físicos) |
| 4 | Bibliotecario | Cuando vuelve el libro marca `devuelto` → los ejemplares vuelven a estar disponibles |
| 5 | Sistema | Revisa los vencimientos (el panel tiene el botón "Actualizar vencidos" y también se controla al consultar el historial de pedidos): si la fecha pasó y sigue `prestado`, lo marca `vencido` y registra una **sanción por atraso** |

> **La regla más importante:** el alumno **solicita**, no se autoaprueba. El ejemplar se entrega recién cuando la biblioteca confirma. Eso es lo que se pidió y lo que hace que el sistema sea confiable.

---

## Lo que usa del backend (no modifiqué el backend)

| Método | Ruta | Para qué la usa mi pantalla | Quién puede |
|---|---|---|---|
| `GET` | `/api/perfil/historial` | Mi cuenta, mis préstamos con `dias_restantes` y mis sanciones | Alumno y docente |
| `GET` | `/api/mis-pedidos/perfil` | Si mi cuenta está habilitada (`puede_pedir` y `condicion`) | **Solo alumno** |
| `GET` | `/api/libros` | El catálogo con `stock_reservable` | Alumno y docente |
| `GET` | `/api/libros/categorias` | Las opciones del filtro de categorías | Alumno y docente |
| `POST` | `/api/mis-pedidos` | **Crear el pedido** (queda `pendiente`) | **Solo alumno** |
| `PATCH` | `/api/prestamos/:id/estado` | La usa el **bibliotecario** en su panel, no mi pantalla | Solo administrador |

El backend ya tenía este circuito implementado (crear pedido pendiente + cambiar estado con control de stock). **Mi trabajo fue la parte visible y la experiencia del alumno**, sin tocar la base de datos ni las rutas.

---

## Los archivos que agregué

| Archivo | Líneas | Responsabilidad |
|---|---|---|
| `frontend/mis-prestamos.html` | 369 | La pantalla: menú, encabezado, métricas, catálogo, lista de pedidos y diálogo |
| `frontend/css/mis-prestamos.css` | 85 | Solo los estilos propios (el resto se reutiliza de las hojas existentes) |
| `frontend/js/mis-prestamos.js` | 190 | Estado, carga de datos, eventos e inicio de la página |
| `frontend/js/mis-prestamos-ui.js` | 180 | Plantillas: filas de pedidos, estados, contadores y búsqueda del catálogo |
| `frontend/js/mis-prestamos-render.js` | 136 | Dibuja las métricas, el aviso de la cuenta, el catálogo y la lista |
| `frontend/js/mis-prestamos-dialogo.js` | 156 | El diálogo "Pedir un libro": validaciones, envío y cierre |

**Además toqué 4 archivos existentes (cambios chicos):**

- `inicio-usuario.html`, `catalogo.html` y `configuracion.html`: agregué el ítem de menú **Mis préstamos**.
- `sw.js`: sumé la página y los archivos nuevos al App Shell y subí la versión de la caché (`CACHE_NAME`) para que los celulares bajen la versión nueva.

---

## Por qué separé el JavaScript en cuatro archivos

Porque el resto del proyecto tiene módulos cortos, cada uno con una idea (por ejemplo `libros.js`, `libros-ui.js`, `libros-dialogos.js`). Yo hice lo mismo:

- **`mis-prestamos.js`** → "el director de orquesta": pide los datos y conecta los eventos.
- **`mis-prestamos-ui.js`** → "el diseñador": convierte datos en HTML (no toca el DOM).
- **`mis-prestamos-render.js`** → "el pintor": pone ese HTML en la página.
- **`mis-prestamos-dialogo.js`** → "la ventanita para pedir", con sus validaciones.

Ventaja para defender: si hay que cambiar algo visual, se toca un solo archivo; si hay que cambiar una regla de la pantalla, se toca otro.

---

## Las reglas de negocio (esto es lo que hay que saber de memoria)

**1. Stock reservable**

```text
stock_reservable = ejemplares disponibles − ejemplares ya reservados en pedidos pendientes
```

- Si hay 2 copias y una está reservada, el alumno ve **1 libre** y el campo cantidad se limita a 1.
- El servidor **vuelve a controlar** ese stock al guardar: si no alcanza, responde **409** y el pedido no se crea. Nunca se confía en lo que mandó el navegador.

**2. Condición de la cuenta**

Se calcula en el servidor según las sanciones y los préstamos vencidos:

| Condición | Qué significa | Puede pedir |
|---|---|---|
| `habilitado` | Todo en orden | **Sí** |
| `atraso` | Tiene un préstamo vencido | No |
| `suspendido` | Tiene una sanción activa | No |

Si la cuenta no está habilitada, la pantalla **igual muestra el catálogo**, pero los botones quedan deshabilitados con el texto "No habilitado" y aparece un banner explicando por qué. El servidor también lo bloquea por su cuenta (doble control).

**3. Validaciones en dos capas**

| Se valida en el navegador | Se valida en el servidor |
|---|---|
| Cantidad entera y mayor a 0 | Cantidad entera y mayor a 0 |
| No más que el stock reservable | Stock libre real, dentro de una transacción |
| La fecha no puede ser anterior a hoy | Formato `AAAA-MM-DD`, fecha existente y no pasada (con la fecha **del servidor**) |
| El libro elegido viene de la lista | El libro existe y está activo |
| — | La cuenta está `habilitado` |

**4. Estados que no se pueden saltear**

El servidor solo acepta estos cambios: `pendiente → prestado | cancelado`, `prestado → devuelto | vencido`, `vencido → devuelto`. Cualquier otro salto responde **409**. Así un pedido no puede pasar de "pendiente" a "devuelto" sin haberse entregado.

**5. Todo queda registrado**

Cada cambio se anota en `pedido_historial` con el estado anterior, el nuevo, quién lo hizo y cuándo. Si preguntan "¿cómo sabés quién confirmó?", la respuesta es esa tabla.

---

## Detalles de la pantalla (para mostrar)

| Elemento | Detalle |
|---|---|
| **Métricas** | Cuatro tarjetas: libros en tu poder, próxima devolución, préstamos vencidos y reservas para retirar |
| **Aviso de la cuenta** | Un cartel arriba con lo más urgente: suspensión, préstamo vencido o que vence pronto |
| **Catálogo** | Buscador por título o autor (sin distinguir tildes ni mayúsculas), filtro por categoría y "solo con stock" |
| **Pedidos** | Se ordenan solos: primero lo pendiente, después lo que tenés en tu poder (por vencimiento) y al final el historial |
| **Cada pedido** | Muestra los días que faltan (o de atraso), una barra que avanza, las fechas y el estado **con texto y color** (no solo color) |
| **Diálogo de pedido** | Cantidad máxima según stock, fecha sugerida a 7 días, aviso en vivo si te pasás y aclaración de que queda **pendiente** |
| **Docentes** | No ven "Pedir un libro": solo consultan sus préstamos, con un mensaje que lo explica |
| **Accesibilidad** | `aria-live` en las listas, `aria-pressed` en los filtros, `dialog` nativo del navegador y botones deshabilitados de verdad |
| **Responsive** | Probado en 390 px (celular) y 800 px (tablet): el menú pasa arriba y las tarjetas se acomodan |
| **Modo claro/oscuro** | Usa las variables de color del proyecto: no hay colores fijos, así el tema funciona solo |

---

## Qué **no** hace mi módulo (y está bien)

- **No** aprueba préstamos: eso lo hace la biblioteca desde su panel.
- **No** permite cancelar un pedido desde el celular: la cancelación la hace el bibliotecario (no existe una ruta para que el alumno la haga, y no la inventé).
- **No** modifica libros, usuarios ni sanciones: eso son los módulos de los otros grupos.
- **No** cambia el backend ni la base de datos.
- **No** permite pedir sin internet: sin conexión solo se consulta lo último guardado.

---

## Cómo se integra con lo que ya existía (esto suma)

Para no duplicar código, reutilicé piezas del proyecto:

| Pieza existente | Cómo la usé |
|---|---|
| `js/api.js` | Todas las llamadas pasan por acá (token y errores incluidos) |
| `js/sesion.js` | Protege la página y espera el evento `sesion-verificada` antes de mostrar datos |
| `js/inicio-usuario-ui.js` | Las tarjetas de números y el texto de los plazos ("Vence en 3 días") |
| `js/cuenta-usuario.js` | El aviso de la cuenta y las sanciones |
| `js/libros-ui.js` | La tarjeta del libro y el estado del stock |
| `css/estilo-general.css`, `componentes.css`, `inicio-base.css`, `inicio-usuario.css`, `catalogo.css` | Menú, encabezado, paneles, botones, tablas y diálogo |

Resultado: la pantalla nueva se ve **igual** que el resto de la app porque usa los mismos componentes, no una copia de los estilos.
