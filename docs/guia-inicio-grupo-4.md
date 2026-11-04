# 🚀 Guía de Inicio y Flujo Funcional — GRUPO 4
## Módulo: Gestión de Pedidos, Reservas y Coordinación

> **Integrantes:** Tiziano Latorre, Ivan Masalis, Leonel Mierez, Alex Gauto, Mateo Grajales.  
> **Proyecto:** Sistema de Gestión de Biblioteca (E.E.S.T. N° 5 - 2026)  
> **Repositorio:** [gestion-biblioteca-eestn5-2026](https://github.com/GESTIONBIBLIOTECA-2026/gestion-biblioteca-eestn5-2026)  
> **Documento Oficial de Origen:** PDF Requerimientos Grupo B (Punto 3: Grupo 4)  
> **Rama de Trabajo:** `g4` | **Ramas Individuales:** `g4-latorre`, `g4-masalis`, `g4-mierez`, `g4-gauto`, `g4-grajales`

---

## 📋 1. Mapeo de Responsabilidades Oficiales (según PDF)

De acuerdo a la especificación oficial del proyecto, tu grupo debe cubrir las siguientes responsabilidades:

1. **Creación de Pedidos:** Registrar solicitud especificando Usuario, Libro, Cantidad, Fecha de Pedido y Fecha de Devolución.
2. **Validación de Reglas de Negocio:**
   - Verificar disponibilidad de stock (vía Grupo 6).
   - Verificar estado del usuario (vía Grupo 5).
3. **Control del Estado del Pedido:** Manejo y actualización de estados del pedido.
4. **Consultar Historial de Pedidos:** Vista e historial completo de préstamos.

---

## 📱 2. Flujo del Usuario en la App Móvil PWA (Experiencia en el Celular)

### 📌 Paso A: Creación del Pedido desde el Celular
1. **Registro de Solicitud:** El alumno selecciona un libro y presiona **"Reservar"**.
2. **Campos Específicos del Pedido:** La orden registra obligatoriamente:
   * **Usuario:** Alumno solicitante.
   * **Libro:** Libro seleccionado.
   * **Cantidad:** Cantidad de ejemplares solicitados.
   * **Fecha de Pedido:** Día y hora de la solicitud.
   * **Fecha de Devolución:** Día estipulado para la devolución.
3. **Validación de Reglas de Negocio:**
   - **Regla 1 (Stock):** La app le consulta al Grupo 6 si hay stock disponible.
   - **Regla 2 (Usuario):** La app le consulta al Grupo 5 si el alumno está habilitado (sin suspensiones).
4. **Confirmación:** Si ambas reglas se cumplen, el pedido se guarda en estado **🟡 Pendiente**.

### 📋 Paso B: Consultar Historial de Pedidos
1. **Historial:** El alumno puede ingresar a su vista de historial donde puede **consultar el historial de sus pedidos** pasados y activos.

---

## 💻 3. Flujo en la Plataforma Web (Mesa de Entrada / Mostrador)

Esta interfaz la utiliza el bibliotecario en la computadora del mostrador:

1. **Control del Estado del Pedido:** El bibliotecario visualiza la lista de solicitudes y cambia sus estados según ocurra la transacción:
   - **Pendiente $\rightarrow$ Prestado:** Al entregar físicamente el libro en el mostrador.
   - **Prestado $\rightarrow$ Devuelto:** Al recibir el libro de regreso.
   - **Prestado $\rightarrow$ Vencido:** Si pasó la fecha de devolución sin reingreso.
2. **Consultar Historial General:** Vista completa del historial de pedidos de toda la institución.

---

## 🎯 Resumen de Pantallas a Maquetar

* **En la App Móvil (PWA Celular):**
  - `crear-pedido.html`: Formulario de solicitud (Usuario, Libro, Cantidad, Fecha Pedido y Fecha Devolución) con validación automática de stock (G6) y usuario (G5).
  - `historial-pedidos.html`: Pantalla para **consultar el historial de pedidos** del alumno.
* **En la Plataforma Web (Escritorio):**
  - `mesa-entrada.html`: Panel para el **control del estado del pedido** (Prestado, Devuelto, Vencido) y consulta del historial general.

---

📌 *Guía de Flujo Funcional Grupo 4 — E.E.S.T. N° 5 (2026)*
