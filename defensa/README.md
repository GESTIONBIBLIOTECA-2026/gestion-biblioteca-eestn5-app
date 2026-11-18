# Defensa del proyecto — Biblioteca Invaluable

Esta carpeta es solo para estudiar y defender. **No es parte de la app**: no toca el código, no se carga en el navegador y no la usa el Service Worker. Si un día querés entregar el proyecto sin estos apuntes, podés borrar la carpeta entera y no se rompe nada.

---

## Qué leer y en qué orden

| # | Archivo | Para qué sirve | Tiempo |
|---|---|---|---|
| 1 | [01-la-app-en-simple.md](01-la-app-en-simple.md) | Qué hace la app, para quién es y qué pantallas tiene | 5 min |
| 2 | [02-como-funciona-por-dentro.md](02-como-funciona-por-dentro.md) | Arquitectura, login, base de datos y PWA | 8 min |
| 3 | [03-mi-modulo-prestamos.md](03-mi-modulo-prestamos.md) | **Tu parte** (Grupo 4): pedir un libro y seguir los préstamos | 8 min |
| 4 | [04-demo-y-preguntas.md](04-demo-y-preguntas.md) | Guion para mostrarla en vivo + preguntas con respuestas | 5 min |
| 5 | [05-chuleta.md](05-chuleta.md) | Resumen de una hoja para imprimir o tener en el celular | 2 min |

---

## Si te dan 3 minutos, decí esto

1. **Qué es:** una aplicación web (PWA) para la biblioteca de la escuela, donde el alumno pide libros desde el celular y el bibliotecario los entrega desde una computadora.
2. **Cómo está armada:** frontend en HTML, CSS y JavaScript puro (sin frameworks) + backend en Node.js/Express con arquitectura MVC + base de datos MySQL.
3. **Cómo entra la gente:** login con DNI y contraseña; el servidor devuelve un token (JWT) que viaja en cada pedido. Hay tres roles: alumno, docente y administrador.
4. **Qué hace tu módulo:** el alumno busca un libro, elige cantidad y fecha, y el pedido queda **pendiente**; el bibliotecario lo confirma desde el panel y **ahí recién** se le asigna el ejemplar. Se controla el stock para que dos personas no se lleven el mismo libro.
5. **Qué se ve:** se instala como app, funciona sin internet para consultar (gracias al Service Worker) y el diseño se adapta a celular, tablet y computadora.

---

## Cuentas para la demo

En la base de prueba, los usuarios que empiezan con **9901** usan la clave **`prueba123`**.

| Rol | DNI | Clave | Quién es | Para mostrar |
|---|---|---|---|---|
| Alumno | `99010001` | `prueba123` | Valentina Acosta (habilitada) | Pedir un libro y ver sus préstamos |
| Docente | `99010031` | `prueba123` | Mariana Suárez | Que no puede pedir: solo consulta |
| Alumno sancionado | `99010026` | `prueba123` | Máximo Torres (suspendido) | Cómo se bloquea el pedido |
| Administrador | `30111222` | `gaby12345678` | Gabriela | Confirmar la entrega del pedido |

> Si en tu base el administrador tiene otra clave, cambiala acá antes de la defensa. Lo importante es tener **dos sesiones a mano**: una de alumno (celular o ventana normal) y una de administrador (otra ventana o modo incógnito).

---

## Lo que hay que poder mostrar sí o sí

1. Login de alumno → se ve la credencial digital y sus préstamos.
2. Catálogo → buscar, filtrar y ver la disponibilidad.
3. **Pedir un libro** → el pedido queda "Para retirar" (pendiente).
4. Panel del bibliotecario → el pedido aparece en pendientes → **confirmar entrega** → el alumno lo ve "En préstamo".
5. Devolución → el libro vuelve al stock.

Ese circuito es el corazón del proyecto: si mostrás eso con seguridad, la defensa está ganada.
