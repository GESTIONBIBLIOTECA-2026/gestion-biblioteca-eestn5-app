/* ==========================================================================
   MÓDULO: cuenta-usuario.js - Estado de la cuenta del alumno / docente
   - Saludo y credencial digital
   - Aviso más importante: suspensión, préstamos vencidos o vencimiento cercano
   - Plantilla de las sanciones
   Lo usa inicio-usuario.js
   ========================================================================== */

import { escapar, fechaCorta } from "./ui.js";
import { textoPlazo, plural } from "./inicio-usuario-ui.js";

const $ = (selector) => document.querySelector(selector);

// Condición de la cuenta → [texto, clase CSS]  (texto + color: nunca solo color)
const CONDICIONES = {
    habilitado: ["Habilitado", "en-curso"],
    atraso: ["Con atraso", "atrasado"],
    suspendido: ["Suspendido", "atrasado"],
    baja: ["De baja", "devuelto"]
};


/* --- Saludo + credencial digital --- */
export function mostrarCredencial(usuario) {
    const [texto, clase] = CONDICIONES[usuario.condicion];
    const rolTexto = usuario.rol === "docente" ? "Docente" : `Alumno · ${usuario.curso ?? "Sin curso"}`;
    const datos = [["Correo", usuario.correo], ["Teléfono", usuario.telefono],
        ["Dirección", usuario.direccion], ["Socio desde", fechaCorta(usuario.fecha_alta)]];

    $("#nombreSaludo").textContent = usuario.nombre_completo.split(" ")[0];
    $("#textoBienvenida").textContent = `${rolTexto} · este es el resumen de tu cuenta.`;
    $("#tituloCredencial").textContent = usuario.nombre_completo;
    $("#credencialDetalle").textContent = rolTexto;
    $("#credencialDni").textContent = Number(usuario.dni).toLocaleString("es-AR");
    $("#credencialDatos").innerHTML = datos.map(([etiqueta, valor]) => `<div><dt>${etiqueta}</dt><dd>${escapar(valor)}</dd></div>`).join("");
    $("#estadoCuenta").textContent = texto;
    $("#estadoCuenta").className = `estado-cuenta estado ${clase}`;
}


/* --- Aviso más importante de la cuenta → [tipo, ícono, texto] o null --- */
function elegirAviso({ usuario, vencidos, proximo, sanciones }) {
    if (usuario.condicion === "suspendido") {
        const motivo = sanciones.find((s) => s.en_vigor)?.motivo;
        return ["peligro", "ban", `Tu cuenta está suspendida y no podés pedir libros.${motivo ? ` Motivo: ${motivo}.` : ""} Acercate a la biblioteca para regularizarla.`];
    }
    if (vencidos.length) {
        return ["peligro", "alert-triangle", `Tenés ${plural(vencidos.length, "préstamo")} vencido${vencidos.length === 1 ? "" : "s"}. Devolvé los libros en la biblioteca para poder volver a pedir.`];
    }
    if (proximo && proximo.dias_restantes <= 2) {
        return ["aviso", "bell-ring", `«${proximo.titulo}»: ${textoPlazo(proximo).toLowerCase()}. Acordate de devolverlo a tiempo.`];
    }
    return null;
}

export function mostrarAvisoCuenta(datos) {
    const aviso = elegirAviso(datos);
    const caja = $("#avisoCuenta");
    caja.hidden = !aviso;
    if (!aviso) return;

    const [tipo, icono, texto] = aviso;
    caja.className = `aviso-cuenta ${tipo}`;
    caja.innerHTML = `<i data-lucide="${icono}"></i><p></p>`;
    caja.querySelector("p").textContent = texto;   // lleva títulos de libros: va con textContent
}


/* --- Una sanción (en vigor o levantada) --- */
export const crearSancionHTML = (s) => `
    <li class="prestamo ${s.en_vigor ? "atrasado" : ""}">
        <div class="prestamo-plazo"><i data-lucide="${s.en_vigor ? "ban" : "check"}"></i></div>
        <div class="prestamo-info">
            <strong>${escapar(s.motivo || (s.tipo === "atraso" ? "Atraso en una devolución" : "Sanción manual"))}</strong>
            <span>Desde el ${fechaCorta(s.fecha_inicio)}${s.fecha_fin ? ` hasta el ${fechaCorta(s.fecha_fin)}` : ""}</span>
        </div>
        <em class="estado ${s.en_vigor ? "atrasado" : "devuelto"}">${s.en_vigor ? "En vigor" : "Levantada"}</em>
    </li>`;
