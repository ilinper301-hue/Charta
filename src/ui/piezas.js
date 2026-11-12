// Charta · piezas comunes de interfaz (fase 3 de PLAN-DISENO): hoja inferior, menú «⋯», confirmar() (sustituye a
// confirm(), R8) y pestañas accesibles. Hojas, menús y avisos son capas (capas.js): Atrás de Android, Escape y tocar
// fuera las cierran; mientras están abiertas el resto de la página queda inerte (ni foco ni lector de pantalla), el
// tabulador da la vuelta dentro y, al cerrarlas, el foco vuelve a donde estaba.
import { abrirCapa } from "./capas.js";
import { el } from "./dom.js";

const ENFOCABLES = 'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
/** Controles a los que llega el tabulador dentro de `raiz` (visibles). */
export const enfocables = (raiz) => [...raiz.querySelectorAll(ENFOCABLES)].filter((x) => x.getClientRects().length);

let nId = 0;
const nuevoId = (p) => `${p}-${++nId}`;
const modales = [];

/**
 * Convierte `raiz` (ya en el body) en modal: lo demás, inerte; el tabulador, dentro; el scroll de la página, quieto.
 * Devuelve soltar(), que lo deshace y devuelve el foco a quien lo tenía. La usan las piezas de aquí y el selector.
 */
export function modal(raiz) {
  const antes = document.activeElement, inertes = [];
  for (const h of document.body.children) if (h !== raiz && !h.inert && h.tagName !== "SCRIPT") { h.inert = true; inertes.push(h); }
  modales.push(raiz);
  raiz.style.zIndex = String(30 + modales.length * 2);
  document.body.classList.add("con-capa");
  const tab = (e) => {
    if (e.key !== "Tab") return;
    const xs = enfocables(raiz), i = xs.indexOf(document.activeElement);
    if (!xs.length) { e.preventDefault(); return; }
    if (e.shiftKey && i <= 0) { e.preventDefault(); xs.at(-1).focus(); }
    else if (!e.shiftKey && (i === -1 || i === xs.length - 1)) { e.preventDefault(); xs[0].focus(); }
  };
  raiz.addEventListener("keydown", tab);
  return function soltar() {
    raiz.removeEventListener("keydown", tab);
    modales.splice(modales.indexOf(raiz), 1);
    for (const h of inertes) h.inert = false;
    if (!modales.length) document.body.classList.remove("con-capa");
    if (antes?.isConnected && !antes.closest("[hidden]")) try { antes.focus({ preventScroll: true }); } catch {}
  };
}

/**
 * Capa modal genérica: velo + caja. `cuerpo(caja, cerrar)` la rellena. Escape, Atrás y tocar el velo cierran.
 * → { caja, cerrar(despues?) }; `despues` se ejecuta cuando el historial ya ha vuelto (puede abrir otra capa).
 */
function capaModal({ clase, rol = "dialog", velo = "velo", cuerpo, alCerrar, enfocar }) {
  const caja = el("div", { className: clase, tabIndex: -1 });
  caja.setAttribute("role", rol); caja.setAttribute("aria-modal", "true");
  const fondo = el("div", { className: velo }, caja);
  let capa = null;
  const cerrar = (despues) => capa?.cerrar(despues);
  cuerpo(caja, cerrar);   // antes de modal(): lo que se mueva aquí desde la página no debe quedar inerte
  document.body.append(fondo);
  const soltar = modal(fondo);
  capa = abrirCapa(() => { fondo.remove(); soltar(); alCerrar?.(); });
  fondo.addEventListener("click", (e) => { if (e.target === fondo) cerrar(); });
  caja.addEventListener("keydown", (e) => { if (e.key === "Escape") { e.stopPropagation(); cerrar(); } });
  (enfocar?.(caja) || caja).focus({ preventScroll: true });
  return { caja, cerrar };
}

const icoCerrar = () => Object.assign(el("span", { className: "ico" }),
  { innerHTML: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>' });

/**
 * Hoja inferior (en tablet, ventana centrada). `contenido`: un nodo; si ya estaba en la página, vuelve a su sitio
 * (oculto) al cerrar. → { caja, cuerpo, cerrar(despues?) }
 */
export function abrirHoja({ titulo, contenido, alCerrar, clase = "" }) {
  const sitio = contenido?.parentNode ? { padre: contenido.parentNode, sig: contenido.nextSibling, oculto: contenido.hidden } : null;
  let cuerpo = null;
  const r = capaModal({
    clase: "hoja-inf" + (clase ? " " + clase : ""),   // clase "pantalla": a pantalla completa (vista previa, fase 4)
    cuerpo(caja, cerrar) {
      const h = el("h2", { id: nuevoId("hoja"), textContent: titulo });
      const x = el("button", { className: "fantasma icono", title: "Cerrar", onclick: () => cerrar() }, icoCerrar());
      x.setAttribute("aria-label", "Cerrar");
      caja.setAttribute("aria-labelledby", h.id);
      cuerpo = el("div", { className: "hoja-inf-cuerpo" });
      if (contenido) { contenido.hidden = false; cuerpo.append(contenido); }
      caja.append(el("div", { className: "hoja-inf-cab" }, h, x), cuerpo);
    },
    alCerrar() {
      if (sitio && contenido) { contenido.hidden = sitio.oculto; sitio.padre.insertBefore(contenido, sitio.sig); }
      alCerrar?.();
    },
  });
  return { ...r, cuerpo };
}

/**
 * Menú «⋯» junto a `ancla`. items: [{ texto, icono? (svg), accion(), peligro?, desactivado? } | "-" (separador)].
 * Flechas, Inicio y Fin mueven el foco; la acción se ejecuta cuando el menú ya está cerrado.
 */
export function abrirMenu(ancla, items) {
  ancla.setAttribute("aria-expanded", "true");
  const botones = [];
  const { caja } = capaModal({
    clase: "menu", rol: "menu", velo: "velo transparente",
    alCerrar: () => ancla.setAttribute("aria-expanded", "false"),
    cuerpo(caja, cerrar) {
      if (ancla.id) caja.setAttribute("aria-labelledby", ancla.id);
      for (const it of items) {
        if (it === "-") { caja.append(el("div", { className: "menu-sep", role: "separator" })); continue; }
        const b = el("button", { className: "menu-item" + (it.peligro ? " peligro" : ""), tabIndex: -1, disabled: !!it.desactivado });
        b.setAttribute("role", "menuitem");
        if (it.icono) b.append(Object.assign(el("span", { className: "ico" }), { innerHTML: it.icono }));
        b.append(el("span", { textContent: it.texto }));
        b.onclick = () => cerrar(it.accion);
        botones.push(b); caja.append(b);
      }
      caja.addEventListener("keydown", (e) => {
        const xs = botones.filter((b) => !b.disabled), i = xs.indexOf(document.activeElement);
        const ir = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: xs.length - 1 }[e.key];
        if (ir !== undefined) { e.preventDefault(); xs[(ir + xs.length) % xs.length]?.focus(); }
        else if (e.key === "Tab") { e.preventDefault(); cerrar(); }
      });
    },
    enfocar: () => botones.find((b) => !b.disabled),
  });
  // Debajo del ancla, alineado a su borde derecho; si no cabe, encima.
  const a = ancla.getBoundingClientRect(), m = caja.getBoundingClientRect(), w = innerWidth, h = innerHeight;
  caja.style.left = Math.max(8, Math.min(a.right - m.width, w - m.width - 8)) + "px";
  caja.style.top = (a.bottom + 4 + m.height > h - 8 && a.top - 4 - m.height > 8 ? a.top - 4 - m.height : Math.min(a.bottom + 4, h - m.height - 8)) + "px";
}

/**
 * Aviso breve abajo, encima de la barra (fase 4: sustituye a los textos de estado de «Más acciones»). Con error dura más y
 * se anuncia como alerta. avisar("") lo quita.
 */
let tostada = null, relojTostada = null;
export function avisar(texto, { error = false, duracion } = {}) {
  clearTimeout(relojTostada);
  if (!tostada) {
    tostada = el("div", { className: "tostada", hidden: true });
    document.body.append(tostada);
  }
  if (!texto) { tostada.hidden = true; return; }
  const x = el("button", { className: "fantasma icono", title: "Cerrar aviso", onclick: () => avisar("") }, icoCerrar());
  x.setAttribute("aria-label", "Cerrar aviso");
  tostada.setAttribute("role", error ? "alert" : "status");
  tostada.classList.toggle("error", error);
  tostada.replaceChildren(el("span", { textContent: texto }), x);
  tostada.hidden = false; tostada.inert = false;
  relojTostada = setTimeout(() => { tostada.hidden = true; }, duracion ?? (error ? 9000 : 3500));
}

/** Pregunta con dos botones (sustituye a confirm()). → Promise<boolean>; Escape, Atrás o tocar fuera = no. */
export function confirmar({ titulo, texto = "", si = "Aceptar", no = "Cancelar", peligro = false }) {
  return new Promise((resolver) => {
    let respuesta = false;
    capaModal({
      clase: "confirmar", rol: "alertdialog",
      alCerrar: () => resolver(respuesta),
      cuerpo(caja, cerrar) {
        const h = el("h2", { id: nuevoId("conf"), textContent: titulo }), p = el("p", { id: nuevoId("conf"), textContent: texto });
        caja.setAttribute("aria-labelledby", h.id);
        if (texto) caja.setAttribute("aria-describedby", p.id);
        const bNo = el("button", { className: "fantasma", textContent: no, onclick: () => cerrar() });
        const bSi = el("button", { className: peligro ? "peligro" : "primario", textContent: si, onclick: () => { respuesta = true; cerrar(); } });
        caja.append(h, ...(texto ? [p] : []), el("div", { className: "botones" }, bNo, bSi));
      },
      enfocar: (caja) => caja.querySelector(".fantasma"),   // lo seguro primero
    });
  });
}

/**
 * Pestañas con su rol (tablist/tab/tabpanel) y flechas para moverse. `panel`: el elemento que cambian.
 * Las pestañas siguen siendo botones con su onclick; marcarPestana() pone la activa.
 */
export function prepararPestanas(lista, panel) {
  lista.setAttribute("role", "tablist");
  if (!panel.id) panel.id = nuevoId("panel");
  panel.setAttribute("role", "tabpanel");
  for (const b of lista.querySelectorAll("button")) { b.setAttribute("role", "tab"); b.setAttribute("aria-controls", panel.id); if (!b.id) b.id = nuevoId("pest"); }
  lista.addEventListener("keydown", (e) => {
    const xs = [...lista.querySelectorAll("button")].filter((b) => !b.hidden), i = xs.indexOf(document.activeElement);
    const ir = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: xs.length - 1 }[e.key];
    if (ir === undefined || i < 0) return;
    e.preventDefault();
    const b = xs[(ir + xs.length) % xs.length]; b.focus(); b.click();
  });
}
export function marcarPestana(lista, activa) {
  for (const b of lista.querySelectorAll("button")) {
    const si = b === activa;
    b.classList.toggle("activa", si); b.setAttribute("aria-selected", String(si)); b.tabIndex = si ? 0 : -1;
    if (si) document.getElementById(b.getAttribute("aria-controls"))?.setAttribute("aria-labelledby", b.id);
  }
}

/** Iconos de 20 px para menús y cabecera. */
export const ICONOS = {
  mas: '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
  atras: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
  ajustes: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
  nueva: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M12 12v6M9 15h6"/></svg>',
  grupos: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>',
  subir: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  bajar: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>',
  quitar: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>',
  variante: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4"/></svg>',
  estrella: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/></svg>',
  estrellaLlena: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/></svg>',
  nube: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 18a5 5 0 0 1-.6-10A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z"/><path d="M12 11v5M9.5 13.5 12 11l2.5 2.5"/></svg>',
  imprimir: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7"/></svg>',
  ver: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>',
  ant: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
  sig: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
  /* Iconos de las apps (los mismos que tenían los botones de «Más acciones»). */
  tabula: '<svg viewBox="0 0 512 512" width="20" height="20" aria-hidden="true"><rect width="512" height="512" rx="110" fill="#2B4257"/><rect x="96" y="118" width="320" height="98" rx="49" fill="#FAF9F5"/><path d="M200 214H311V338A55.5 55.5 0 0 1 200 338Z" fill="#9CC0DE"/><path d="M200 216C232 201 262 189 290 191C311 193 328 203 343 216H322Q311 216 311 227V270C299 246 262 226 200 221Z" fill="#5F86A8"/></svg>',
  fori: '<svg viewBox="80 110 360 300" width="22" height="18" aria-hidden="true"><rect x="92" y="132" width="284" height="50" rx="25" fill="#27C1B0"/><rect x="376" y="132" width="50" height="196" rx="25" fill="#FFC845"/><rect x="140" y="324" width="286" height="50" rx="25" fill="#F4664A"/><rect x="92" y="182" width="50" height="192" rx="25" fill="#7444E0"/><path d="M172 274C196 226 214 214 226 214C238 214 226 254 244 254C258 254 276 238 292 228" fill="none" stroke="#FFFFFF" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/><g transform="rotate(39 360 306)"><rect x="296" y="284" width="136" height="44" rx="22" fill="#FFFFFF" stroke="#13214A" stroke-width="14" paint-order="stroke"/></g></svg>',
  pizarra: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
};
