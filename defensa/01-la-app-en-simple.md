# 1. La app en simple

## En una frase

**Biblioteca Invaluable** es una aplicación web para manejar los préstamos de la biblioteca de la escuela: los alumnos piden libros desde el celular, el bibliotecario los entrega desde una computadora y el sistema controla qué libro tiene cada persona y cuándo tiene que devolverlo.

---

## El problema que resuelve

En una biblioteca escolar, si todo se anota en un cuaderno:

- nadie sabe con certeza **cuántos ejemplares quedan** de un libro;
- dos alumnos pueden pedir **el mismo ejemplar**;
- no hay forma rápida de saber **quién tiene algo vencido**;
- la credencial de papel se pierde.

La app resuelve eso: el stock se calcula solo, cada pedido queda registrado con fecha y estado, y el alumno tiene su credencial digital en el celular.

---

## Dos caras de la misma aplicación

| | App del alumno y del docente | Panel de administración |
|---|---|---|
| **Para quién** | Alumnos y docentes | Bibliotecario / administrador |
| **Desde dónde** | Celular (se instala como app) | Computadora |
| **Qué hace** | Ver su cuenta, buscar libros, pedir, ver préstamos y devoluciones | Cargar libros, gestionar usuarios, confirmar entregas y devoluciones |

Los dos usan **el mismo servidor y la misma base de datos**: lo que el alumno pide aparece en el panel del bibliotecario, y lo que el bibliotecario confirma aparece en el celular del alumno.

---

## Los tres roles

El sistema sabe quién sos por tu **DNI** y te deja hacer cosas distintas según el rol:

| Rol | Qué puede hacer | Qué NO puede hacer |
|---|---|---|
| **Alumno** | Ver su cuenta y sus préstamos, buscar en el catálogo y **pedir libros** | Entrar al panel, confirmar entregas, cargar libros |
| **Docente** | Igual que el alumno, pero **sin pedir** desde la app (sus préstamos se cargan en el mostrador) | Pedir desde el celular, entrar al panel |
| **Administrador** | Todo el panel: usuarios, libros, pedidos, préstamos, sanciones | Usar la app de alumnos (su login va al panel) |

> **Esto es importante para la defensa:** el rol no lo elige el navegador, lo decide el servidor con el token. Si alguien intenta entrar a una ruta que no le corresponde, el servidor responde **403** (prohibido).

---

## Las pantallas

### App de alumnos y docentes (celular)

| Archivo | Pantalla | Qué se hace |
|---|---|---|
| `index.html` | Inicio de sesión | Entrar con DNI y contraseña |
| `inicio-usuario.html` | Mi biblioteca | Credencial digital, resumen, devoluciones, historial y sanciones |
| `catalogo.html` | Catálogo | Buscar y filtrar libros, ver disponibilidad y reservar |
| `mis-prestamos.html` | **Mis préstamos** | **Pedir un libro y seguir cada pedido** (módulo del Grupo 4) |
| `configuracion.html` | Configuración | Mis datos, cambiar contraseña y modo claro/oscuro |

### Panel de administración (computadora)

| Archivo | Pantalla | Qué se hace |
|---|---|---|
| `panel.html` | Panel | Números generales de la biblioteca |
| `libros.html` | Libros | Alta, modificación, stock y baja del catálogo |
| `usuarios.html` | Usuarios | Alta de alumnos y docentes, sancionar, habilitar, dar de baja |
| `prestamos.html` | Préstamos | Ver préstamos y marcar devoluciones |
| `pedidos.html` | Pedidos | **Confirmar la entrega** de los pedidos pendientes (o cancelarlos) |

---

## ¿Por qué "PWA" y no una app de la tienda?

PWA significa *Progressive Web App*: una página web que se comporta como una app.

- Se **instala** desde el navegador (botón "Instalar app") y queda con su ícono, sin pasar por Play Store.
- **Funciona sin internet** para consultar: guarda una copia de las pantallas y de los últimos datos (Service Worker).
- Se **actualiza sola**: cuando hay una versión nueva, la baja en segundo plano.

Para la escuela es ideal: no hay que publicar en una tienda ni pedir permisos, y anda en cualquier celular con navegador.

---

## Cómo se armó el proyecto (3 grupos, una sola app)

La app está pensada como un rompecabezas de tres partes que comparten la misma base de datos:

| Grupo | Tema | Qué aportó |
|---|---|---|
| **Grupo 4** | **Préstamos y pedidos** | **Pedir un libro, estados del pedido, entregas y devoluciones, stock reservado (tu parte)** |
| Grupo 5 | Usuarios y sanciones | Login, roles, cursos, condición de la cuenta, sanciones por atraso |
| Grupo 6 | Catálogo | Libros, autores, categorías, ejemplares y disponibilidad |

El punto de unión es la **base de datos**: una tabla `pedidos` que relaciona un `usuario` con un `libro`. Por eso los tres módulos se ven integrados en la misma pantalla de inicio.

---

## Límites (para no prometer de más)

Si te preguntan "¿y esto hace…?", la respuesta honesta:

- **No** hay app nativa para Android/iOS: es una PWA que se instala desde el navegador.
- **No** hay pagos ni multas en dinero: las sanciones son bloqueos de la cuenta.
- **No** se renueva un préstamo desde el celular: la renovación se hace en el mostrador.
- **No** se pueden pedir libros sin conexión: para pedir hace falta internet (sin internet solo se consulta lo último guardado).

Reconocer los límites **suma** en una defensa: muestra que sabés lo que hiciste.
