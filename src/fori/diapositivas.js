// Charta · paso 5.3 · ficha → diapositivas para Fori (proyección ejercicio a ejercicio, solución paso a paso).
// Sin DOM: las cajas de cada ejercicio (getBBox) las da quien llama (`cajas`), para poder probarlo en Node.
//
// Contrato con Fori (fori/src/js/05f-charta.js), por localStorage del mismo origen:
//   CLAVE_FORI → { v: 1, app: "charta", titulo, diapositivas: [{ etq, svg, n }] }
//   svg: imagen 1600×900 con la solución dibujada; cada paso de la solución lleva class="cs pK" (K = 0…n−1)
//   y el <style> contiene el marcador /*PASOS*/, que Fori sustituye por cssPasos(k, n) para mostrar k pasos.
import { render } from "../render/actividad.js";
import { esc } from "../rep/index.js";
import { COLOR_SOLUCION } from "../render/papel.js";
import { fuenteDe } from "../render/fuentes.js";
import { AZUL } from "../render/hoja.js";
import { paginasVariante } from "../nucleo/lector.js";

export const CLAVE_FORI = "charta:aFori";
// Fase 7 (R9): cada diapositiva lleva sus letras (≈ 33 KB con Andika, ≈ 78 KB con Fredoka) y la clave es de localStorage (≈ 5 MB
// de caracteres compartidos con las demás apps). Hasta este tamaño (caracteres del JSON) va la ficha entera; si se pasa, una sola
// diapositiva por actividad (sin las de cada ejercicio); si aun así se pasa, se avisa. Fori acepta hasta 2 millones por diapositiva.
export const MAX_PAQUETE = 2500000;
export const ANCHO = 1600;
export const ALTO = 900;
// Colores que solo aparecen en modo solución: rojo de las respuestas y rosas de colorear (colorea, simetría, barras).
const COLORES_SOL = [COLOR_SOLUCION, "#F2B8B5", "#EF9A9A"].map((c) => c.toLowerCase());
const HOJAS = new Set(["line", "rect", "circle", "ellipse", "path", "polyline", "polygon", "text", "use", "image"]);
const r2 = (x) => String(Math.round(x * 100) / 100);

/** CSS que deja ver los k primeros pasos de n (k ≥ n: toda la solución). Igual que en Fori. */
export function cssPasos(k, n) {
  if (k >= n) return "";
  return ".cs{visibility:hidden}" + (k > 0 ? Array.from({ length: k }, (_, i) => ".p" + i).join(",") + "{visibility:visible}" : "");
}

/**
 * Marca los pasos de la solución en el SVG de una zona (render(…, "solucion")).
 * Paso = racha de elementos rojos seguidos (p. ej. arco + punta de flecha del salto en la recta).
 * ej: id del ejercicio cuyos pasos se numeran (null = todos). Los rojos de otros ejercicios llevan solo "cs".
 */
export function marcarPasos(svg, ej = null) {
  let n = 0, enRacha = false;
  const pila = [];                     // por cada <g> abierto: id de ejercicio o null
  const dentro = () => ej === null || pila.includes(ej);
  const out = svg.replace(/<(\/?)([a-zA-Z]+)([^>]*?)(\/?)>/g, (tag, cierre, nombre, attrs, auto) => {
    if (nombre === "g") {
      if (cierre) pila.pop();
      else if (!auto) { const m = / data-ej="([^"]*)"/.exec(attrs); pila.push(m && / class="ej"/.test(attrs) ? m[1] : null); }
      return tag;
    }
    if (cierre || !HOJAS.has(nombre)) return tag;
    const low = attrs.toLowerCase();
    if (!COLORES_SOL.some((c) => low.includes(c))) { enRacha = false; return tag; }
    let clase = "cs";
    if (dentro()) { if (!enRacha) n++; clase += " p" + (n - 1); }
    enRacha = true;
    return `<${nombre} class="${clase}"${attrs}${auto}>`;
  });
  return { svg: out, n };
}

/** Enunciado en líneas que caben en `max` px (Andika), con su tamaño de letra. */
function lineasEnunciado(texto, max, fuente) {
  const lineas = texto.split("\n");
  let fs = 40;
  while (fs > 22 && lineas.some((t) => fuente.ancho(t, false, fs) > max)) fs -= 2;
  return { lineas, fs };
}

/** Una diapositiva: cabecera (número + enunciado [+ etiqueta]) y la caja `c` de la zona encajada debajo. */
function diapositiva(act, zona, c, ej, etiqueta, fuentes, fuente) {
  const FUENTE = fuente.css.replaceAll('"', "&quot;");
  const { svg, n } = marcarPasos(zona.svg, ej);
  const { lineas, fs } = lineasEnunciado(act.enunciado, etiqueta ? 1150 : 1440, fuente);
  const alto = 34 + lineas.length * fs * 1.25;
  const top = Math.max(110, alto + 28), pad = 10;
  const bx = c.x - pad, by = c.y - pad, bw = c.w + 2 * pad, bh = c.h + 2 * pad;
  const aw = ANCHO - 80, ah = ALTO - top - 24;
  const s = Math.min(aw / bw, ah / bh, 6);
  const tx = 40 + (aw - bw * s) / 2, ty = top + (ah - bh * s) / 2;
  const ocultar = ej === null ? "" : `g.ej:not([data-ej="${esc(ej)}"]){display:none}`;
  const cab = [
    `<circle cx="66" cy="62" r="32" fill="${AZUL}"/>`,
    `<text x="66" y="75" text-anchor="middle" font-family="${FUENTE}" font-size="36" font-weight="bold" fill="#fff">${act.n}</text>`,
    ...lineas.map((t, j) => `<text x="120" y="${r2(74 + j * fs * 1.25)}" font-family="${FUENTE}" font-size="${fs}" fill="#1f1f1f">${esc(t)}</text>`),
    etiqueta ? `<text x="${ANCHO - 40}" y="74" text-anchor="end" font-family="${FUENTE}" font-size="28" fill="#6b6b6b">${esc(etiqueta)}</text>` : "",
  ].join("");
  return {
    n,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ANCHO} ${ALTO}" width="${ANCHO}" height="${ALTO}">` +
      `<style>${fuentes || ""}${ocultar}/*PASOS*/</style><rect width="${ANCHO}" height="${ALTO}" fill="#fff"/>${cab}` +
      `<clipPath id="recorte"><rect x="${r2(bx)}" y="${r2(by)}" width="${r2(bw)}" height="${r2(bh)}"/></clipPath>` +
      `<g transform="translate(${r2(tx)} ${r2(ty)}) scale(${r2(s)}) translate(${r2(-bx)} ${r2(-by)})" clip-path="url(#recorte)">${svg}</g></svg>`,
  };
}

/**
 * Diapositivas de una variante: por cada actividad, una con la actividad entera y, si tiene varios
 * ejercicios, una por ejercicio (recortada a su caja; `porEjercicio: false` las omite). cajas(zona) → { idEjercicio: {x, y, w, h} }
 * (coordenadas de la zona).
 */
export function diapositivas(ficha, { cajas, fuentes = "", variante = 0, porEjercicio = true } = {}) {
  if (typeof cajas !== "function") throw new Error("Faltan las cajas de los ejercicios.");
  const out = [], fuente = fuenteDe(ficha);
  for (const pag of paginasVariante(ficha, variante)) for (const act of pag.actividades) {
    const zona = render(act, "solucion", fuente), cs = cajas(zona);
    const ids = act.ejercicios.map((e) => e.id).filter((id) => cs[id] && cs[id].w > 0 && cs[id].h > 0);
    out.push({ etq: `Actividad ${act.n}`, ...diapositiva(act, zona, { x: zona.x, y: zona.y, w: zona.w, h: zona.h }, null, "", fuentes, fuente) });
    if (porEjercicio && ids.length > 1) ids.forEach((id, i) => {
      const etq = `Ejercicio ${i + 1} de ${ids.length}`;
      out.push({ etq: `Actividad ${act.n} · ${etq}`, ...diapositiva(act, zona, cs[id], id, etq, fuentes, fuente) });
    });
  }
  return out;
}

/**
 * Paquete para Fori (sin nombres de alumnos: la ficha no los lleva). Si pasa de `max` caracteres, `compacto: true` (una diapositiva
 * por actividad); si sigue pasando, lanza un Error legible. Fori ignora los campos que no conoce.
 */
export function paqueteFori(ficha, opciones = {}) {
  const { max = MAX_PAQUETE, ...o } = opciones;
  let p = { v: 1, app: "charta", titulo: ficha.titulo, diapositivas: diapositivas(ficha, o) };
  let tam = JSON.stringify(p).length;
  if (tam > max) {
    p = { ...p, compacto: true, diapositivas: diapositivas(ficha, { ...o, porEjercicio: false }) };
    tam = JSON.stringify(p).length;
    if (tam > max) throw new Error(`La ficha es demasiado grande para proyectarla (${(tam / 1e6).toFixed(1)} MB; el máximo es ${(max / 1e6).toFixed(1)} MB). Proyecta menos páginas cada vez.`);
  }
  return p;
}
