# 🗄️ Guía de Inicio de Base de Datos MySQL Cloud — Franco Barufaldi y Grupo 5

> **Proyecto:** Sistema de Gestión de Biblioteca (E.E.S.T. N° 5 - 2026)  
> **Responsable:** Franco Barufaldi (`@francobaru-hub`) — Lead DB & Backend  
> **Plataforma Nube:** [Aiven.io](https://aiven.io)  

---

## 🎯 Objetivo
Crear una instancia limpia y gratuita de **MySQL 8.0 en la Nube** en [Aiven.io](https://aiven.io) para centralizar la base de datos del proyecto, permitiendo la conexión tanto desde la **Plataforma Web (PHP)** como desde la **App Móvil PWA (Node.js)** y herramientas de administración como **HeidiSQL**.

---

## 📋 Paso a Paso para Crear la Base de Datos Limpia

### Paso 1: Registrarse en Aiven
1. Ingresar a la web oficial: **[https://aiven.io](https://aiven.io)**.
2. Hacer clic en **"Try for free"** o ingresar a la consola: **[https://console.aiven.io](https://console.aiven.io)**.
3. Registrarse con una cuenta de correo o cuenta de GitHub.

### Paso 2: Crear el Servicio de MySQL Limpio
1. En el panel principal, hacer clic en **"Create service"** (o **"Choose your service"**).
2. Seleccionar el motor de base de datos: **`MySQL`**.
3. En la selección de plan, asegurar que esté seleccionado el plan **`Free`** ($0 / Free forever).
4. En **Service name**, asignar un nombre descriptivo: `mysql-biblioteca-eest5`.
5. Hacer clic en el botón blanco **"Create service"**.
6. **Esperar 1 o 2 minutos** a que el estado cambie de azul (**`Building`**) a verde (**`Running`**).

---

## 🔑 Obtener las Credenciales de Conexión

Una vez que el servicio esté en estado **`Running`**, en la pantalla **Overview / Connection Information** encontrarás los siguientes datos:

| Campo | Valor / Ejemplo | Descripción |
| :--- | :--- | :--- |
| **Host (Servidor)** | `mysql-biblioteca-eest5-....aivencloud.com` | Dirección URL del servidor en la nube |
| **Port (Puerto)** | `27892` (o el puerto asignado) | Puerto de conexión MySQL |
| **User (Usuario)** | `avnadmin` | Usuario administrador |
| **Password (Contraseña)** | *(Hacer clic en `CLICK_TO_REVEAL_PASSWORD`)* | Clave de acceso |
| **Database Name** | `defaultdb` (o crear `biblioteca_db`) | Nombre de la base de datos limpia |

---

## 🛠️ Conexión Oficial desde VS Code (Extensión Database Client)

Todo el trabajo con la base de datos se realiza **100% dentro de Visual Studio Code** utilizando la extensión **Database Client** (de *cweijan*):

1. Abrir **Visual Studio Code**.
2. En la barra lateral izquierda, hacer clic en la pestaña de **Extensiones** (`Ctrl` + `Shift` + `X`), buscar **`Database Client`** e instalarla.
3. Hacer clic en el ícono del cilindro de base de datos en la barra lateral izquierda.
4. Hacer clic en **"Create Connection"** (o en el botón **`+`**).
5. Seleccionar el tipo de servidor: **`MySQL`**.
6. Completar los campos con los datos obtenidos en Aiven:
   * **Host / Server:** *(Copiar el Host de Aiven)*
   * **Port:** `27892` *(o el puerto asignado por Aiven)*
   * **Username:** `avnadmin`
   * **Password:** *(Copiar la contraseña mostrada en Aiven)*
   * **Database:** `defaultdb`
   * **SSL:** Habilitado / Activado (Modo `Require`)
7. Hacer clic en **"Test Connection"** y al confirmar la barra verde (**`Success! Connection Saved!`**), hacer clic en **"Save and Connect"**.
8. **¡Listo!** En la barra lateral izquierda verás la base de datos `defaultdb`. Hacer clic derecho $\rightarrow$ **`New Query`** para escribir y ejecutar sentencias SQL directamente en tu editor.

---

## 📌 Próximo Paso
Una vez establecida la conexión en **VS Code con Database Client** sobre la base limpia de Aiven, el equipo de Barufaldi estará listo para comenzar a ejecutar los scripts `CREATE TABLE` de las entidades del proyecto.

### Actualizar una base de datos existente

El esquema de `usuarios` incluye `anio_inscripcion`, que toma automáticamente el año actual al crear un usuario. Para agregar o actualizar este valor predeterminado en una base ya creada, ejecutá `npm run db:init` desde la carpeta `backend`. Los registros existentes no se modifican.

---

📌 *Guía Oficial de Base de Datos Nube — E.E.S.T. N° 5 (2026)*
