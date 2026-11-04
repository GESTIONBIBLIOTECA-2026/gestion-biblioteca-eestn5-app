# 🚀 Guía de Inicio y Flujo Funcional — GRUPO 6
## Módulo: Gestión de Inventario y Catálogo de Libros

> **Integrantes:** Joaquín Trujillo, Melian Pizzorno, Leandro Vázquez, Enrique Smidt, Lautaro Garraza.  
> **Proyecto:** Sistema de Gestión de Biblioteca (E.E.S.T. N° 5 - 2026)  
> **Repositorio:** [gestion-biblioteca-eestn5-2026](https://github.com/GESTIONBIBLIOTECA-2026/gestion-biblioteca-eestn5-2026)  
> **Documento Oficial de Origen:** PDF Requerimientos Grupo B (Punto 2: Grupo 6)  
> **Rama de Trabajo:** `g6` | **Ramas Individuales:** `g6-trujillo`, `g6-pizzorno`, `g6-vazquez`, `g6-smidt`, `g6-garraza`

---

## 📋 1. Mapeo de Responsabilidades Oficiales (según PDF)

De acuerdo a la especificación oficial del proyecto, tu grupo debe cubrir las siguientes responsabilidades:

1. **Gestión del Catálogo:** Registro de libros nuevos, modificación y baja de libros.
2. **Buscador de Libros:** Filtros combinados por Categoría, Título, Autor y Disponibilidad.
3. **Manejo de Cantidades:** Actualización constante del stock de ejemplares.
4. **Indicar Estado de los Libros:** Badge visual de estado (Disponible / Prestado).

---

## 📱 2. Flujo del Usuario en la App Móvil PWA (Experiencia en el Celular)

### 📚 Paso A: Exploración del Catálogo y Estado
1. **Catálogo Principal:** El alumno abre la PWA y ve el catálogo completo de libros en tarjetas visuales.
2. **Indicador de Estado:** Cada libro muestra su estado claro:
   * 🟢 **Disponible:** Hay stock físico guardado en la biblioteca.
   * 🔴 **Prestado:** Todos los ejemplares están actualmente prestados a otros alumnos.

### 🔍 Paso B: Buscador con Filtros Combinados
1. **Filtros Combinados:** El buscador permite filtrar simultáneamente por **Categoría**, **Título**, **Autor** y **Disponibilidad**.
   - Ejemplo: Buscar libros de la categoría *"Técnica"* escritos por *"Sears"* que estén actualmente *"Disponibles"*.

### 📖 Paso C: Ver Ficha y Consultar Stock
1. **Ficha del Libro:** Al tocar una tarjeta, el alumno ve la información ampliada del libro y la cantidad de stock restante.
2. **Reserva:** Si el estado es 🟢 **Disponible**, habilita el botón para enviar la reserva al Grupo 4.

---

## 💻 3. Flujo en la Plataforma Web (Gestión de Inventario / Escritorio)

Esta interfaz la utiliza el bibliotecario en la computadora de la biblioteca:

1. **Registro de Libros Nuevos:** Formulario para ingresar títulos nuevos al catálogo.
2. **Modificación y Baja:** Permite editar datos de libros existentes o dar de baja ejemplares fuera de circulación.
3. **Manejo de Cantidades / Stock:** Permite aumentar o actualizar la cantidad total de ejemplares cuando ingresan nuevas unidades a la escuela.

---

## 🎯 Resumen de Pantallas a Maquetar

* **En la App Móvil (PWA Celular):**
  - `index.html`: Catálogo móvil con buscador con **filtros combinados** (Categoría, Título, Autor, Disponibilidad) e indicador verde 🟢 **Disponible** / rojo 🔴 **Prestado**.
  - `detalle-libro.html`: Ficha ampliada con el manejo de cantidades de stock visibles.
* **En la Plataforma Web (Escritorio):**
  - `admin-catalogo.html`: Registro de libros nuevos, modificación, baja y actualización de stock.

---

📌 *Guía de Flujo Funcional Grupo 6 — E.E.S.T. N° 5 (2026)*
