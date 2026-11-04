# 🚀 Guía de Despliegue en Vercel para la PWA — Dylan Andrada (Admin)

> **Proyecto:** Sistema de Gestión de Biblioteca (E.E.S.T. N° 5 - 2026)  
> **Responsable:** Dylan Andrada (`@DylanXeneizee12`) — Org Admin & Líder General  
> **Plataforma Nube:** [Vercel.com](https://vercel.com)  

---

## 🎯 ¿Por qué desplegamos la PWA en Vercel?

1. **HTTPS Obligatorio para Instalabilidad PWA:** Los teléfonos (Android e iOS) exigen que una Progressive Web App esté servida sobre una conexión segura cifrada (HTTPS). De lo contrario, el navegador bloquea la instalación. Vercel nos otorga un dominio HTTPS gratuito de forma automática.
2. **Despliegue Automático (CI/CD):** Cada vez que apruebes y fusiones un Pull Request a la rama `main`, Vercel detectará el cambio y actualizará la app en vivo en 15 segundos sin intervención manual.

---

## 📋 Paso a Paso para la Configuración Inicial (Solo 1 vez)

### Paso 1: Crear cuenta en Vercel con GitHub
1. Ingresar a **[https://vercel.com](https://vercel.com)**.
2. Hacer clic en **"Sign Up"** (Registrarse).
3. Seleccionar la opción **"Continue with GitHub"** e iniciar sesión con tu usuario de GitHub (`@DylanXeneizee12`).

### Paso 2: Importar el Repositorio de la Organización
1. En el panel principal de Vercel (Dashboard), hacer clic en el botón **"Add New..."** (arriba a la derecha) $\rightarrow$ seleccionar **"Project"**.
2. En la lista de repositorios, asegurarte de buscar dentro de la organización **`GESTIONBIBLIOTECA-2026`**.
3. Ubicar el repositorio **`gestion-biblioteca-eestn5-2026`** y hacer clic en **"Import"**.

### Paso 3: Lanzar el Despliegue (Deploy)
1. En la pantalla de configuración del proyecto (*Configure Project*), dejar los valores predeterminados (Framework Preset: *Other / Static HTML*).
2. Hacer clic en el botón azul **"Deploy"**.
3. Esperar 15 o 20 segundos a que finalice la compilación y verás la pantalla de felicitaciones con confeti 🎉.

---

## 🌐 Obtener la URL Oficial de la App

Una vez completado el despliegue, Vercel te entregará una URL HTTPS única como:

👉 **`https://gestion-biblioteca-eestn5-2026.vercel.app`**

### ¿Qué hacés con esta URL?
* Compartirla con el profesor y con tus compañeros de clase.
* Abrirla desde cualquier teléfono celular para presionar **"Instalar / Agregar a la pantalla de inicio"** y probar la PWA instalada como una app nativa.

---

## 🔄 ¿Cómo se actualiza la app a partir de ahora?

¡No tenés que volver a entrar a Vercel! Cada vez que aceptes un Pull Request de la rama `develop` hacia `main`, Vercel actualizará la versión pública automáticamente en la nube.

---

📌 *Guía de Despliegue PWA Vercel — E.E.S.T. N° 5 (2026)*
