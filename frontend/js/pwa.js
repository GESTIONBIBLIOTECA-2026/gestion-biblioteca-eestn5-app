/* ==========================================================================
   MÓDULO: pwa.js - Progressive Web App (clase 07)
   1. Registra el Service Worker (sw.js)
   2. Botón "Instalar app" con el evento beforeinstallprompt
   Se incluye en todas las páginas: <script src="js/pwa.js"></script>
   ========================================================================== */

// 🎯 1. Nodos del DOM
const botonInstalar = document.querySelector("#btn-instalar-app");

// 🧠 2. Estado: el evento de instalación queda guardado hasta que el usuario hace clic
let eventoInstalacionDiferido = null;


// ⚙️ 3. Registro del Service Worker (si el navegador lo soporta)
if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
        try {
            const registro = await navigator.serviceWorker.register("sw.js");
            console.log("✅ Service Worker registrado en el scope:", registro.scope);
        } catch (error) {
            console.error("❌ Falló el registro del Service Worker:", error.message);
        }
    });
}


// 📲 4. Instalación personalizada

// El navegador avisa que la app se puede instalar → mostramos nuestro botón
window.addEventListener("beforeinstallprompt", (evento) => {
    evento.preventDefault();                 // sin el banner genérico del navegador
    eventoInstalacionDiferido = evento;
    if (botonInstalar) botonInstalar.hidden = false;
});

// Clic en "Instalar app" → diálogo nativo del celular o la PC
botonInstalar?.addEventListener("click", async () => {
    if (!eventoInstalacionDiferido) return;

    eventoInstalacionDiferido.prompt();
    const { outcome } = await eventoInstalacionDiferido.userChoice;   // "accepted" o "dismissed"
    console.log("Resultado de la instalación:", outcome);

    eventoInstalacionDiferido = null;
    botonInstalar.hidden = true;
});

// Ya quedó instalada
window.addEventListener("appinstalled", () => {
    console.log("🎉 ¡App instalada en el dispositivo!");
});
