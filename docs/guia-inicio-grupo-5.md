# 🚀 Guía de Inicio y Flujo Funcional — GRUPO 5
## Módulo: Gestión de Usuarios, Historial Activo y Panel Administrador

> **Integrantes:** Franco Barufaldi *(Lead DB)*, Dylan Andrada *(Líder General)*, Francisco Peña, Marcos Palacios, Thiago Gioia.  
> **Proyecto:** Sistema de Gestión de Biblioteca (E.E.S.T. N° 5 - 2026)  
> **Repositorio:** [gestion-biblioteca-eestn5-2026](https://github.com/GESTIONBIBLIOTECA-2026/gestion-biblioteca-eestn5-2026)  
> **Documento Oficial de Origen:** PDF Requerimientos Grupo B (Punto 1: Grupo 5)  
> **Rama de Trabajo:** `g5` | **Ramas Individuales:** `g5-barufaldi`, `g5-andrada`, `g5-pena`, `g5-palacios`, `g5-gioia`

---

## 📋 1. Mapeo de Responsabilidades Oficiales (según PDF)

De acuerdo a la especificación oficial del proyecto, tu grupo debe cubrir las siguientes responsabilidades:

1. **Gestión de Usuarios:** Alta, modificación y baja de usuarios.
2. **Búsqueda Avanzada:** Filtros combinados por Nombre Completo, DNI y Curso.
3. **Atributos Obligatorios del Usuario:**
   * Nombre Completo
   * DNI
   * Curso
   * Correo Electrónico
   * Teléfono
   * Dirección
4. **Historial Activo:** Registrar entregas, devoluciones y atrasos.
5. **Panel Administrador:** Interfaz dedicada para gestión bibliotecaria.

---

## 📱 2. Flujo del Usuario en la App Móvil PWA (Experiencia en el Celular)

### 🔑 Paso A: Registro e Inicio de Sesión
1. **Acceso:** El alumno o docente abre la PWA en su celular e ingresa con su DNI y clave (o se registra por primera vez completando sus 6 atributos obligatorios: *Nombre completo, DNI, Curso, Correo, Teléfono y Dirección*).
2. **Validación:** El sistema verifica las credenciales y le otorga acceso.

### 💳 Paso B: Credencial Digital y Estado
1. **Credencial del Alumno:** Una vez logueado, ve su perfil digital con sus 6 datos visibles (Nombre, DNI, Curso, Correo, Teléfono y Dirección).
2. **Indicador de Habilitación:** Muestra si el alumno está 🟢 **Habilitado** o 🔴 **Suspendido por Atraso**.

### 📜 Paso C: Historial Activo
1. **Ver Historial:** El usuario consulta su **Historial Activo** personal donde ve el registro de todas sus entregas realizadas, devoluciones completadas y atrasos acumulados.

---

## 💻 3. Flujo en la Plataforma Web (Panel Administrador / Escritorio)

Esta interfaz la utiliza el bibliotecario en la computadora de la escuela:

1. **Búsqueda Avanzada:** Un buscador para filtrar alumnos por **Nombre Completo**, **DNI** o **Curso**.
2. **Alta, Modificación y Baja:** Permite registrar nuevos usuarios, editar sus 6 atributos o dar de baja cuentas inactivas.
3. **Control de Atrasos y Entregas:** Permite marcar manualmente a un usuario como suspendido si registra atrasos sin resolver.

---

## 🎯 Resumen de Pantallas a Maquetar

* **En la App Móvil (PWA Celular):**
  - `login.html`: Registro e ingreso del usuario con sus 6 atributos.
  - `perfil.html`: Credencial digital del alumno e **Historial Activo** (entregas, devoluciones y atrasos).
* **En la Plataforma Web (Escritorio):**
  - `admin-usuarios.html`: Panel Admin con alta, modificación, baja y búsqueda avanzada por Nombre, DNI o Curso.

---

📌 *Guía de Flujo Funcional Grupo 5 — E.E.S.T. N° 5 (2026)*
