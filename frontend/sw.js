/* ==========================================================================
   sw.js - Service Worker de la PWA (clase 07)
   Corre en un hilo aparte (sin DOM) y hace de "aduana": cada petición pasa
   por acá y se decide si sale de la caché o de internet.
   Va en la raíz de frontend/ para controlar TODAS las páginas.

   ⚠️ Si cambiás un HTML, CSS o JS, subí la versión de CACHE_NAME (v1 → v2)
   para que los celulares descarguen los archivos nuevos.
   ========================================================================== */

const CACHE_NAME = "biblioteca-app-v5";   // App Shell (HTML, CSS, JS, íconos)
const CACHE_API = "biblioteca-api-v1";    // últimas respuestas GET de la API

// App Shell: lo mínimo para dibujar la app sin internet.
// Ojo: si un archivo da 404, la instalación entera se cancela.
const RECURSOS_APP_SHELL = [
    "./",
    "index.html",
    "inicio-usuario.html",
    "catalogo.html",
    "configuracion.html",
    "usuarios.html",
    "manifest.json",
    "assets/icons/icon-192x192.png",
    "assets/icons/icon-512x512.png",
    "css/estilo-general.css",
    "css/componentes.css",
    "css/login.css",
    "css/inicio-base.css",
    "css/inicio-usuario.css",
    "css/catalogo.css",
    "css/configuracion.css",
    "css/nav-inferior.css",
    "css/usuarios.css",
    "js/config.js",
    "js/api.js",
    "js/storage.js",
    "js/tema.js",
    "js/ui.js",
    "js/sesion.js",
    "js/pwa.js",
    "js/login.js",
    "js/inicio-usuario.js",
    "js/inicio-usuario-ui.js",
    "js/cuenta-usuario.js",
    "js/catalogo.js",
    "js/configuracion.js",
    "js/usuarios.js",
    "js/usuarios-ui.js",
    "js/usuarios-dialogos.js",
    "js/usuarios-estado.js"
];


// 📦 1. INSTALACIÓN: guardar el App Shell en la caché
self.addEventListener("install", (evento) => {
    evento.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(RECURSOS_APP_SHELL))
            .then(() => self.skipWaiting())   // no espera a que se cierre la pestaña
    );
});


// 🧹 2. ACTIVACIÓN: borrar las cachés de versiones viejas
self.addEventListener("activate", (evento) => {
    evento.waitUntil(
        caches.keys()
            .then((nombres) => Promise.all(
                nombres
                    .filter((nombre) => nombre !== CACHE_NAME && nombre !== CACHE_API)
                    .map((nombre) => caches.delete(nombre))
            ))
            .then(() => self.clients.claim())   // toma el control de las pestañas abiertas
    );
});


// 🛃 3. INTERCEPCIÓN: elegir la estrategia según la petición
self.addEventListener("fetch", (evento) => {
    const { request } = evento;

    // C) Network Only: login, guardar perfil y cambiar contraseña (POST / PUT).
    //    Nunca se cachean: si no hay internet, tienen que fallar.
    if (request.method !== "GET") return;

    // B) Network First: datos de la API (mi cuenta, catálogo, perfil)
    if (request.url.includes("/api/")) {
        evento.respondWith(
            fetch(request)
                .then((respuestaDeRed) => {
                    // Solo se guardan las respuestas OK (un 401 o un 500 no)
                    if (respuestaDeRed.ok) {
                        const copia = respuestaDeRed.clone();
                        caches.open(CACHE_API).then((cache) => cache.put(request, copia));
                    }
                    return respuestaDeRed;
                })
                .catch(() => caches.match(request))   // sin internet: la última copia guardada
        );
        return;
    }

    // A) Cache First: archivos del App Shell (HTML, CSS, JS, íconos)
    evento.respondWith(
        caches.match(request).then((respuestaEnCache) => respuestaEnCache || fetch(request))
    );
});
