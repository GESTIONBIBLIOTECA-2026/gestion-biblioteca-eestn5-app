# 📖 Guía Oficial de Flujo de Trabajo Git y Gobernanza — Grupo B

> **Proyecto:** Sistema de Gestión de Biblioteca (E.E.S.T. N° 5 - 2026)  
> **Organización:** [GESTIONBIBLIOTECA-2026](https://github.com/GESTIONBIBLIOTECA-2026)  
> **Propósito:** Definir los pasos exactos para desarrollar, enviar Pull Requests y revisar código según cada rol.

---

## 🗺️ Mapa Visual de la Arquitectura de Ramas

```text
main  (Producción / Entregable Estable)
 └── develop  (Integración Continua del Aula)
      │
      ├── g4  (Rama Grupo 4 - Pedidos)
      │    ├── g4-latorre
      │    ├── g4-masalis
      │    ├── g4-mierez
      │    ├── g4-gauto
      │    └── g4-grajales
      │
      ├── g5  (Rama Grupo 5 - Usuarios y DB)
      │    ├── g5-barufaldi
      │    ├── g5-andrada
      │    ├── g5-pena
      │    ├── g5-palacios
      │    └── g5-gioia
      │
      └── g6  (Rama Grupo 6 - Inventario)
           ├── g6-trujillo
           ├── g6-pizzorno
           ├── g6-vazquez
           ├── g6-smidt
           └── g6-garraza
```

---

## 💻 1. Guía para Desarrolladores (Ramas Individuales `gX-apellido`)

Esta sección aplica a **todos los alumnos** para el desarrollo de tareas individuales.

> [!IMPORTANT]
> **Pusheo directo bloqueado:** Nadie puede pushear directamente a `main`, `develop`, `g4`, `g5` ni `g6`. Todo cambio debe enviarse mediante una Pull Request (PR).

### Paso 1: Posicionarte en tu rama individual
Al iniciar la clase o tu jornada de trabajo, abre la terminal en tu proyecto:

```bash
# Ejemplo para un alumno del Grupo 5 (ej. Barufaldi)
git checkout g5-barufaldi
git pull origin g5-barufaldi
```

### Paso 2: Guardar avances (Commits)
Trabaja en los archivos correspondientes a tu módulo. Realiza commits frecuentes con mensajes descriptivos:

```bash
# 1. Preparar archivos modificados
git add .

# 2. Hacer el commit con mensaje descriptivo
git commit -m "feat(usuarios): agregar formulario de alta con validación de DNI"
```

### Paso 3: Subir tu rama a GitHub
Sube tus cambios locales a tu rama remota en GitHub:

```bash
git push origin g5-barufaldi
```

### Paso 4: Abrir Pull Request (PR) hacia tu rama de subgrupo
1. Ingresa al repositorio en GitHub: [gestion-biblioteca-eestn5-2026](https://github.com/GESTIONBIBLIOTECA-2026/gestion-biblioteca-eestn5-2026).
2. Haz clic en la pestaña **"Pull requests"**.
3. Haz clic en el botón verde **"New pull request"**.
4. Selecciona las ramas de origen y destino:
   * **base:** `g5` *(o `g4` / `g6` según tu grupo — ¡NUNCA a `main` ni `develop` directamente!)*
   * **compare:** `g5-barufaldi` *(tu rama individual)*
5. Haz clic en el botón **"Create pull request"**.
6. En la pantalla final de envío:
   * Escribe un **Título** claro y una **Descripción** de lo que realizaste.
   * En el panel derecho (**Reviewers**), selecciona al **Líder de tu Subgrupo**.
   * Haz clic en el botón verde **"Create pull request"** para confirmarla.


---

## 🔍 2. Guía para Líderes de Subgrupo (Ramas de Grupo `g4`, `g5`, `g6`)

Esta sección aplica a los **Líderes elegidos en los Grupos 4, 5 y 6**.

### Responsabilidad Principal:
Revisar las Pull Requests que envían los integrantes de tu subgrupo a la rama `gX`, validar que el código funcione y aprobar la integración.

### Paso 1: Revisar una Pull Request entrante
1. En GitHub, ve a la pestaña **"Pull requests"**.
2. Abre la PR enviada por tu compañero de grupo.
3. Ve a la pestaña **"Files changed"** (Archivos modificados).
4. **Lista de Verificación de Revisión:**
   - [ ] ¿El código cumple la función solicitada?
   - [ ] ¿Modifica únicamente los archivos de su módulo sin borrar código ajeno?
   - [ ] ¿El mensaje de commit y la descripción son claros?

### Paso 2: Aprobar o Solicitar Cambios
* **Si falta algo o hay errores:** Escribe un comentario constructivo en la línea de código afectada y haz clic en **"Request changes"**.
* **Si todo está correcto:** Haz clic en **"Review changes"** $\rightarrow$ selecciona **"Approve"** $\rightarrow$ **"Submit review"**.

### Paso 3: Realizar el Merge
Una vez aprobada la PR:
1. Haz clic en **"Merge pull request"**.
2. Haz clic en **"Confirm merge"**.

### Paso 4: Abrir PR del Subgrupo hacia `develop`
Al finalizar un Sprint o cuando el módulo de tu grupo tenga una versión funcional completa:
1. Ve a **"Pull requests"** $\rightarrow$ **"New pull request"**.
2. Configura:
   * **base:** `develop`
   * **compare:** `g5` *(la rama de tu subgrupo)*
3. Asigna como reviewer a **Dylan Andrada** y al **Profesor**.

---

## 👑 3. Guía para Dylan Andrada (Admin del Repositorio y Líder General)

Esta sección aplica a **Dylan Andrada** como Administrador General de la Organización y Líder del proyecto integrador.

### Responsabilidades Clave:
1. **Gobernanza de `develop` y `main`:** Asegurar que solo ingresen a `develop` las ramas de subgrupo (`g4`, `g5`, `g6`) previamente revisadas.
2. **Revisión de Integración:** Verificar que las 3 ramas de subgrupo no generen conflictos al unirse en `develop`.

### Paso 1: Integración en `develop`
1. Al recibir una PR de un líder de grupo (ej. `g5` $\rightarrow$ `develop`):
2. Revisa que el módulo esté probado.
3. Aprueba el PR y realiza el **Merge**.

### Paso 2: Publicación a `main` (Cierre de Sprint / Entregables)
Cuando los 3 módulos integrados en `develop` funcionen correctamente:
1. Abre una Pull Request desde `develop` hacia `main`:
   * **base:** `main`
   * **compare:** `develop`
2. Solicita la revisión final al **Profesor**.
3. Realiza el **Merge** para consolidar la versión estable del proyecto.

### ⚠️ Resolución de Conflictos de Merge en GitHub
Si GitHub indica **"Can't automatically merge"**:
1. Haz clic en **"Resolve conflicts"** dentro del panel de la PR en GitHub.
2. Identifica las marcas de conflicto (`<<<<<<<`, `=======`, `>>>>>>>`).
3. Coordina con los líderes de los grupos involucrados para conservar el código correcto.
4. Marca el conflicto como resuelto (**"Mark as resolved"**) y completa el Merge.

---

📌 *Guía de Gobernanza Git — E.E.S.T. N° 5 (2026)*
