# 📚 Guía Didáctica: Cómo Integramos y Certificamos el Sistema de Gestión de Biblioteca

> **Materia:** Desarrollo de Software para Plataformas Móviles (7° 5ta)  
> **Institución:** Escuela de Educación Secundaria Técnica N° 5  
> **Profesor:** Axel Castellano Gutiérrez  
> **Proyecto Integrador:** Sistema de Gestión de Biblioteca EEST N°5  
> **Estado:** 100% Integrado, Validado con Suite E2E y Desplegado en Producción.

---

## 🎯 1. La Gran Lección: El Software es un Sistema, no Islas Separadas

Durante las últimas semanas de clase, cada subgrupo trabajó en su propia parte:
* El **Grupo 5** armó la PWA móvil y la gestión de usuarios.
* El **Grupo 6** armó el catálogo y las portadas de los libros.
* El **Grupo 4** armó los pedidos, préstamos y devoluciones.

Cuando trabajamos en silos (cada uno por su cuenta sin mirar al compañero), ocurre el error clásico de la industria: **alguien borra el código del otro porque cree que "molesta" o porque piensa que la aplicación es únicamente lo que él está programando**. 

En esta etapa logramos el objetivo formativo más importante de 7° año: **demostrar que la aplicación móvil del alumno y la plataforma web del bibliotecario conviven sobre la misma base de datos y la misma API REST.**

---

## 🔄 2. El Circuito Completo: El Viaje de un Libro (End-to-End)

Para entender cómo funciona el sistema completo, sigamos el recorrido de un préstamo de punta a punta:

```text
 📱 ALUMNO (Celular PWA)                 ⚙️ SERVIDOR Y BASE DE DATOS              💻 BIBLIOTECARIO (PC Mostrador)
────────────────────────                ─────────────────────────                ───────────────────────────────
1. Entra al Catálogo y ve               
   «Cosmos» con 2 libres.
2. Toca "Reservar" y elige          ──►  POST /api/mis-pedidos
   fecha de devolución estimada.         • Valida que el alumno no tenga mora.
                                         • Crea el Pedido #42 en estado 'pendiente'.
                                         • Reserva 1 unidad física.
                                                                           ──►   3. En pedidos.html ve la reserva
                                                                                    del alumno en tiempo real.
                                                                                 4. Entrega el libro físico y toca
                                                                                    "Confirmar Entrega".
                                    ◄──  PATCH /api/prestamos/42/estado
                                         • Pasa el estado a 'prestado'.
                                         • Descuenta -1 unidad del stock libre.
                                         • Registra la fecha de retiro exacta.
5. Abre inicio-usuario.html y ve:   
   • Su Credencial con QR / Barcode.
   • El libro en "Mis Pedidos".
   • Una barra regresiva con los
     días restantes para devolverlo.
                                                                           ──►   6. Días después, el alumno acerca
                                                                                    el ejemplar al mostrador.
                                                                                 7. El bibliotecario busca por DNI
                                                                                    y toca "Registrar Devolución".
                                    ◄──  PATCH /api/prestamos/42/estado
                                         • Pasa el estado a 'devuelto'.
                                         • Reintegra +1 unidad al stock libre.
                                         • Si se pasó de la fecha, registra mora.
8. El historial del alumno se       
   actualiza a "Devuelto".
```

---

## 👥 3. Qué Aportó Cada Grupo al Resultado Final

Cada subgrupo fue indispensable para que el sistema funcione. Nadie sobra en un equipo de software:

### 🟢 Grupo 5 (Barufaldi, Andrada, Peña, Palacios, Gioia)
* **La PWA Nativa:** Service Worker (`sw.js` v5) con soporte offline y manifiesto para instalar la app en la pantalla del celular sin pasar por Google Play Store.
* **Seguridad y Sesión:** Autenticación con JSON Web Tokens (JWT) diferenciando el rol `alumno/docente` del rol `administrador`.
* **Credencial Digital Escolar:** Carnet del alumno con generación dinámica de código QR y código de barras Code 128 (100% offline para lectores ópticos de biblioteca).
* **Métricas en Vivo:** El panel administrativo (`panel.html`) conectado a `GET /api/dashboard` mostrando libros totales, préstamos en curso y cantidad de alumnos morosos.

### 🔵 Grupo 6 (Trujillo, Garraza, Pizzorno, Smidt, Vázquez)
* **Catálogo Visual:** Tarjetas interactivas con portadas de libros (`portada_url`) y fallback elegante al ícono si el enlace no carga.
* **Buscador Reactivo:** Filtrado en vivo por título, autor o categoría sin necesidad de recargar la página.
* **Módulo Administrativo ABM:** Pantalla de gestión (`libros.html`) para que el bibliotecario dé de alta nuevos títulos, actualice ejemplares físicos y gestione bajas por rotura o extravío.

### 🟠 Grupo 4 (Grajales, Latorre, Mierez, Masalis, Gauto)
* **Mesa de Entrada:** Pantalla de mostrador (`pedidos.html`) con buscador instantáneo por DNI para despachar reservas.
* **Control de Stock y Atomicidad:** Lógica SQL que asegura que nunca se preste un libro si no quedan ejemplares disponibles en el estante.
* **Detección Automática de Morosidad:** Rutina que revisa si la fecha límite venció (`fecha_devolucion_estimada < CURRENT_DATE`) para suspender transitoriamente las nuevas reservas hasta que el alumno devuelva el ejemplar.

---

## 🛠️ 4. Los Errores que Descubrimos Gracias a las Pruebas (Y cómo los solucionamos)

Antes de dar el proyecto por terminado, corrimos una **suite de pruebas automatizadas**. Miren por qué los desarrolladores profesionales NUNCA confían en que *"en teoría funciona"*:

### 🚨 Caso Real 1: El error SQL que nadie vio a simple vista
* **El código que estaba escrito:** En `dashboard.models.js`, para contar los libros activos decía:  
  `SELECT COUNT(*) FROM libros WHERE estado = 'activo'`
* **Por qué fallaba:** La tabla `libros` **no tiene ninguna columna llamada `estado`**. Su columna real es `activo` (un booleano `TRUE` o `FALSE`).
* **La consecuencia:** En el celular parecía andar todo bien, pero el panel del bibliotecario explotaba con un Error 500 al querer leer las estadísticas.
* **La solución:** Lo corregimos a `WHERE activo = TRUE`.

### 🚨 Caso Real 2: La importancia de las transacciones (ACID)
* **El problema:** ¿Qué pasa si dos alumnos tocan "Reservar" exactamente al mismo milisegundo cuando queda solo 1 ejemplar de un libro?
* **La solución:** Usamos **bloqueo pesimista (`FOR UPDATE`)** y **transacciones (`START TRANSACTION` / `COMMIT`)**. La base de datos congela la fila del libro durante 5 milisegundos, atiende al primer alumno, descuenta el ejemplar y al segundo le avisa educadamente: *"Stock insuficiente. El ejemplar acaba de ser reservado"*.

---

## 🧪 5. Cómo Pueden Probar Todo Esto Ustedes Mismos en el Aula

En la Clase 13, cada equipo puede correr la verificación en vivo desde su consola:

### Paso 1: Levantar el servidor
Abrir una terminal en la carpeta `backend`:
```bash
npm start
```

### Paso 2: Ejecutar la prueba automatizada
En otra terminal, dentro de la misma carpeta `backend`, ejecutar:
```bash
node scripts/probar-circuito-completo.js
```

Verán en pantalla cómo la computadora simula el circuito completo: loguea a Valentina Acosta (DNI `99010001`), pide el libro *Cosmos*, cambia de usuario a la bibliotecaria Gabriela (DNI `99010033`), entrega el libro, descuenta el stock, procesa la devolución y verifica el tablero de métricas.

---

## 🏁 Conclusión: El Valor del Trabajo Bien Hecho

Un técnico en programación no es alguien que "tira código" hasta que la pantalla se ve linda. **Un técnico en programación es quien entiende la arquitectura, respeta las interfaces de sus compañeros, protege la consistencia de los datos y asegura que el sistema funcione en el mundo real.**

¡Felicitaciones a los tres subgrupos por haber construido un sistema profesional de nivel técnico superior!
