# 📐 Delimitación de Alcance: Plataforma Web (Escritorio) vs. App Móvil (PWA)

> **Proyecto:** Sistema de Gestión de Biblioteca (E.E.S.T. N° 5 - 2026)  
> **Materia:** Desarrollo de Software para Plataformas Móviles (7° 5ta)  
> **Propósito:** Separar claramente las funcionalidades del sistema entre la interfaz de administración para bibliotecarios (Web de Escritorio) y la experiencia de los estudiantes/docentes (App Móvil PWA).

---

## 🏛️ Visión General de la Arquitectura de Interfaces

```text
               ┌───────────────────────────────────────────────────────────┐
               │              BASE DE DATOS Y BACKEND (MVC)                │
               │               MySQL + Node.js / Express API               │
               └─────────────────────────────┬─────────────────────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
   💻 PLATAFORMA WEB (ESCRITORIO)                      📱 APP MÓVIL PWA (CELULAR)
   Panel de Control Bibliotecario                     Experiencia del Estudiante/Docente
   • Gestión masiva de usuarios                       • Credencial digital y perfil
   • ABM de catálogo e inventario                     • Buscador de libros con stock
   • Mesa de entrada (entregas/devoluciones)          • Solicitud de reservas y notificaciones
```

---

## 🟢 GRUPO 5: Gestión de Usuarios y Administración

### 💻 Plataforma Web (Gestión Bibliotecaria / Escritorio)
* **ABM de Usuarios:** Alta, modificación y baja de alumnos, docentes y administradores.
* **Búsqueda Avanzada:** Filtrado por DNI, Nombre completo y Curso.
* **Carga de Atributos:** Edición completa de datos de contacto (DNI, teléfono, email, dirección, curso).
* **Panel Administrador de Sanciones:** Aplicación de suspensiones, bloqueos o registros de morosidad.

### 📱 App Móvil PWA (Experiencia del Estudiante / Celular)
* **Credencial Digital:** Vista del perfil personal del alumno con sus datos (Nombre, DNI, Curso) y código/QR identificador.
* **Estado de Habilitación:** Verificación visual de su estado (*Habilitado* / *Suspendido por mora*).
* **Mi Historial Activo:** Consulta personal de préstamos vigentes, fechas límites de devolución y atrasos acumulados.

---

## 🔵 GRUPO 6: Gestión de Inventario y Catálogo

### 💻 Plataforma Web (Gestión Bibliotecaria / Escritorio)
* **ABM del Catálogo:** Alta, modificación y baja de títulos de libros (ISBN, autor, editorial, categoría, año, portadas).
* **Control de Ejemplares y Stock:** Carga de nuevos ejemplares físicos ingresados por compra o donación.
* **Baja Administrativa:** Registro manual de libros extraviados, dañados o en proceso de restauración.

### 📱 App Móvil PWA (Experiencia del Estudiante / Celular)
* **Buscador Móvil:** Buscador rápido mobile-first con filtros combinados por Categoría, Título y Autor.
* **Estado de Disponibilidad en Tiempo Real:** Indicador claro en pantalla: **Disponible** (verde) / **Prestado** (rojo).
* **Ficha del Libro:** Información resumida del libro, sin exponer datos de costo o registro interno.

---

## 🟠 GRUPO 4: Gestión de Pedidos y Coordinación

### 💻 Plataforma Web (Mesa de Entrada / Mostrador)
* **Mesa de Entrada:** Registro físico de la entrega del libro al alumno cuando se presenta en el mostrador.
* **Recepcionar Devoluciones:** Registro del reingreso del ejemplar, liberación del stock y cálculo automático de mora.
* **Historial General de Préstamos:** Reportes administrativos de préstamos históricos y estadísticas de lectura.

### 📱 App Móvil PWA (Experiencia del Estudiante / Celular)
* **Reserva de Libros:** Solicitud de reserva de un libro disponible desde el celular especificando fecha estimada de retiro.
* **Seguimiento del Estado del Pedido:** Control de estados en tiempo real (*Pendiente de retiro*, *Listo para retirar*, *En préstamo*, *Devuelto*, *Vencido*).
* **Notificaciones PWA:** Alertas y recordatorios en el teléfono antes del vencimiento de la fecha de devolución.

---

📌 *Especificación de Alcance Web vs. Móvil — E.E.S.T. N° 5 (2026)*
