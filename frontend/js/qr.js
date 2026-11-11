/* ==========================================================================
   MÓDULO: qr.js - Generador de identificadores visuales (QR y Código de Barras)
   Permite acreditar la identidad del alumno/docente en el mostrador físico.
   Funciona online (QR de alta definición) y offline (SVG Code-128 PWA).
   ========================================================================== */

const CODE128_PATTERNS = [
    "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
    "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
    "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
    "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
    "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
    "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
    "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
    "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
    "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
    "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
    "114131", "311141", "411131", "211412", "211214", "211232", "2331112"
];

/**
 * Genera un código de barras SVG estándar Code 128 (100% offline).
 */
export function generarBarcodeSVG(texto, alto = 40) {
    const seguro = String(texto).replace(/[^A-Za-z0-9 -]/g, "");
    let check = 104; // Start B
    const indices = [104];

    for (let i = 0; i < seguro.length; i++) {
        const code = seguro.charCodeAt(i) - 32;
        indices.push(code);
        check += code * (i + 1);
    }
    indices.push(check % 103);
    indices.push(106); // Stop Code 128

    let barras = "";
    for (const idx of indices) {
        barras += CODE128_PATTERNS[idx];
    }

    let rectangulos = "";
    let posX = 4;
    let esBarra = true;

    for (let i = 0; i < barras.length; i++) {
        const ancho = Number(barras[i]);
        if (esBarra) {
            rectangulos += `<rect x="${posX}" y="2" width="${ancho}" height="${alto}" fill="currentColor" />`;
        }
        posX += ancho;
        esBarra = !esBarra;
    }

    const totalAncho = posX + 4;
    return `
        <svg viewBox="0 0 ${totalAncho} ${alto + 4}" class="barcode-svg" aria-label="Código de barras ${seguro}">
            ${rectangulos}
        </svg>
    `;
}

/**
 * Renderiza el bloque visual de credencial:
 * Imagen QR optimizada con fallback offline automático y código de barras auxiliar.
 */
export function crearCredencialIdentificadorHTML({ dni, id }) {
    const payloadQR = `BIBLIOTECA-EEST5:ID=${id}:DNI=${dni}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=110x110&margin=2&format=svg&data=${encodeURIComponent(payloadQR)}`;
    const barcodeSVG = generarBarcodeSVG(`DNI ${dni}`, 32);

    return `
        <div class="credencial-qr-wrapper">
            <div class="credencial-qr-marco">
                <img src="${qrUrl}" 
                     alt="Código QR DNI ${dni}" 
                     class="credencial-qr-img" 
                     loading="lazy" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <div class="credencial-qr-offline" style="display: none;">
                    <i data-lucide="qr-code"></i>
                    <span>Offline</span>
                </div>
            </div>
            <div class="credencial-barcode-box">
                ${barcodeSVG}
                <small class="credencial-barcode-label">SOCIO #${id} · DNI ${dni}</small>
            </div>
        </div>
    `;
}

