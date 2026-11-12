// Charta · enlaces con Tabula (paso 5.2) y Fori (paso 5.3) en la interfaz (fase 2 de PLAN-DISENO, antes en app.js).
// Tabula: grupos leídos de su almacén (mismo origen, solo lectura) y vuelta con la ficha por URL. Fori: diapositivas (variante A)
// por localStorage del mismo origen; Fori las convierte en páginas. Las rutas fijas están en src/rutas.js.
// crearEnlaces(ctx) → { entrada, enviarTabula(), proyectar() }
import { hoja, estiloLectura } from "../render/hoja.js";
import { paginasVariante } from "../nucleo/lector.js";
import { hayTipo } from "../nucleo/tipos.js";
import { leerEntrada, leerTabula, gruposDeTabula, urlVolver, MAX_ENLACE } from "./tabula.js";
import { miniaturaDeSvg, dejarParaTabula } from "./miniatura_ficha.js";
import { paqueteFori, CLAVE_FORI } from "../fori/diapositivas.js";
import { fuentePorId } from "../render/fuentes.js";
import { URL_FORI } from "../rutas.js";
import { $ } from "./dom.js";

// Paso 5.3 · Fori: caja de cada ejercicio (getBBox en un SVG oculto) y fuentes incrustadas para las diapositivas.
function cajasEjercicios(zona) {
  const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  s.setAttribute("style", "position:absolute;left:-10000px;top:0;width:10px;height:10px;visibility:hidden");
  s.innerHTML = zona.svg; document.body.append(s);
  const out = {};
  for (const g of s.querySelectorAll("g.ej")) { const b = g.getBBox(); out[g.getAttribute("data-ej")] = { x: b.x, y: b.y, w: b.width, h: b.height }; }
  s.remove();
  return out;
}
/** @font-face incrustados (data:) de las letras que usa la ficha: Andika siempre y, si es otra, la elegida. */
const cssFuentes = (usadas = ["Andika"]) => [...document.styleSheets].flatMap((h) => { try { return [...h.cssRules]; } catch { return []; } })
  .filter((r) => r instanceof CSSFontFaceRule && /data:/.test(r.cssText) && usadas.includes(r.style.getPropertyValue("font-family").replace(/["']/g, "").trim())).map((r) => r.cssText).join("");

export function crearEnlaces(ctx) {
  const entrada = leerEntrada(location.search, hayTipo);
  let grupos = [];
  $("grupoTabula").onchange = () => {
    const g = grupos.find((x) => x.id === $("grupoTabula").value);
    if (g) { $("alumnos").value = g.alumnos.join("\n"); ctx.previa.pintar(); }
  };
  leerTabula().then((t) => {
    grupos = t ? gruposDeTabula(t.groups, t.students) : [];
    $("filaTabula").hidden = !grupos.length;
    for (const g of grupos) $("grupoTabula").add(new Option(`${g.nombre} (${g.alumnos.length})`, g.id));
    if (entrada.grupo && grupos.some((g) => g.id === entrada.grupo)) { $("grupoTabula").value = entrada.grupo; $("grupoTabula").onchange(); }
    else if (ctx.grupoBorrador && grupos.some((g) => g.id === ctx.grupoBorrador)) $("grupoTabula").value = ctx.grupoBorrador;   // sin tocar los nombres del borrador
  }).catch(() => {});
  async function enviarTabula() {
    const ficha = ctx.previa.ficha, N = ctx.nubeV;
    if (!ficha) return;
    N.avisoNube("");
    let id = null;
    // Con sesión, se guarda en la nube y Tabula la referencia por id (también la verá Fori); sin sesión, va la composición.
    // Si la nube falla, se envía igual (con la composición): Tabula no depende de la nube.
    if (N.nube.estado().estado === "dentro") try { if (!ctx.enNube) await N.leerNube(); id = (await N.nube.guardar(ficha, ctx.comp.composicion())).id || null; } catch (e) { console.warn("Nube:", e.message); id = null; }
    // Miniatura de la hoja 1 SIN nombre (Tabula la recoge de localStorage; si falla, el documento sale sin imagen).
    let m = null;
    try { m = await miniaturaDeSvg(hoja(paginasVariante(ficha, 0)[0], { titulo: ficha.titulo, bn: $("bn").checked, uid: "mt", ...estiloLectura(ficha) })); } catch {}
    const md = ficha.metadatos || {}, comp = ctx.comp.composicion();
    const datos = { id, titulo: ficha.titulo, tipos: ctx.comp.editores.map((e) => e.id), comp,
      variantes: ficha.variantes, minutos: md.minutos, dificultad: md.dificultad, etiquetas: md.etiquetas,
      grupo: $("grupoTabula").value || entrada.grupo, sesion: entrada.sesion, tarea: entrada.tarea };
    let url = urlVolver(datos);
    // Fase 1 (R4): un enlace muy largo puede fallar; entonces la composición va por localStorage, como la miniatura.
    if (url.length > MAX_ENLACE && dejarParaTabula(ficha.titulo, m, localStorage, comp)) url = urlVolver({ ...datos, comp: null, compLocal: true });
    else dejarParaTabula(ficha.titulo, m);
    location.href = url;
  }
  async function proyectar() {
    const ficha = ctx.previa.ficha;
    if (!ficha) return;
    ctx.nubeV.avisoNube("");
    try {
      await document.fonts.ready;
      const p = paqueteFori(ficha, { cajas: cajasEjercicios, fuentes: cssFuentes(["Andika", fuentePorId(ficha.presentacion?.fuente).nombre]) });
      try { localStorage.setItem(CLAVE_FORI, JSON.stringify(p)); }
      catch { try { localStorage.removeItem(CLAVE_FORI); } catch {} throw new Error("no cabe en la memoria del navegador (la comparten todas tus apps). Proyecta menos páginas cada vez."); }
      location.href = URL_FORI + "?charta=1";
    } catch (e) { ctx.nubeV.avisoNube(e.message.startsWith("La ficha es") ? e.message : "No se ha podido preparar la ficha para Fori: " + e.message, true); }
  }
  return { entrada, enviarTabula, proyectar };
}
