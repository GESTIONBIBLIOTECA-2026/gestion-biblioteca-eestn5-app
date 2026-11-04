/* ==========================================================================
   constants.js - Reglas puras del negocio (no tienen secretos)
   Si cambia una regla se toca SOLO este archivo.
   ========================================================================== */

// Roles que pueden ingresar al sistema
export const ROLES = ["alumno", "docente", "administrador"];
export const ROLES_APP = ["alumno", "docente", "administrador"];
export const ESTADOS = ["habilitado", "suspendido", "baja"];
export const FILTROS = ["todos", "alumnos", "docentes", "administradores", "morosos", "suspendidos", "bajas"];
export const USUARIOS_POR_PAGINA = 10;
