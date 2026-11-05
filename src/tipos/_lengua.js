// Charta · ayudantes comunes de los tipos de Lengua (lote 1: letra.* y silaba.*; LENGUA_1.md).
// Sin DOM. Elegir palabras del léxico con las opciones comunes (tipo de sílabas, largo, letra), aplicar mayúsculas,
// comprobar que un hueco tiene una sola solución en el léxico y dibujar palabras letra a letra (rodear, rayas).
import { LEXICO } from "../lengua/lexico.js";
import { buscar } from "../lengua/palabras.js";
import { sinTildes } from "../lengua/reglas.js";
import { COLOR_SOLUCION } from "../render/papel.js";

/** Categorías que se leen en 1.º en estos modelos: nombres, adjetivos y verbos (no las palabras gramaticales). */
export const CATS = ["n", "a", "v"];
export const VOCALES = [..."aeiou"];
export const cap = (t) => (t ? t[0].toUpperCase() + t.slice(1) : t);

/** Aplica «Letra»: minúscula (null) · "inicial" (primera mayúscula) · "mayus" (TODO MAYÚSCULAS). */
export const alCaso = (t, caso) => (caso === "mayus" ? t.toUpperCase() : caso === "inicial" ? cap(t) : t);
/** Lo mismo con una lista de trozos (sílabas): «inicial» solo mayúscula en el primero. */
export const trozosCaso = (ts, caso) => ts.map((s, i) => (caso === "mayus" ? s.toUpperCase() : caso === "inicial" && i === 0 ? cap(s) : s));

/** Palabras del léxico para las opciones: tipo de sílabas (por defecto directas) y filtros extra. Con «Mayúscula inicial» no entran
 *  las que empiezan por «i» (la «I» mayúscula de Fredoka se confunde con la «l»). */
const memoCandidatas = new Map();
export function candidatas(params, extra = {}) {
  const clave = JSON.stringify([params.tipo || "directas", params.caso === "inicial", extra]);
  if (!memoCandidatas.has(clave)) {
    const ps = buscar({ cat: CATS, tipo: params.tipo || "directas", ...extra });
    memoCandidatas.set(clave, params.caso === "inicial" ? ps.filter((e) => !/^[iíì]/.test(e.p)) : ps);
  }
  return memoCandidatas.get(clave);   // no modificar: se comparte entre llamadas
}

/**
 * Elige n palabras distintas siguiendo la secuencia de largos (p. ej. [2, 3] = una de 2 sílabas, otra de 3…, o [1, 2, 3, 4] a partes iguales).
 * ok(entrada, azar) → algo verdadero si la palabra sirve (puede devolver sus datos, p. ej. el hueco elegido) o falso para descartarla.
 * Devuelve [{ e, r, p }] barajadas; si no hay bastantes, error con «necesita».
 */
export function elegirPalabras(azar, n, params, largos, { extra = {}, ok = null, id = "este modelo" } = {}) {
  const bolsas = {};
  for (const l of new Set(largos)) bolsas[l] = azar.barajar(candidatas(params, { ...extra, nSilabas: l }));
  const out = []; let i = 0;
  while (out.length < n) {
    let tomada = false;
    for (let k = 0; k < largos.length && !tomada; k++) {
      const b = bolsas[largos[(i + k) % largos.length]];
      while (b.length) {
        const e = b.pop(), r = ok ? ok(e, azar) : true;
        if (r) { out.push({ e, r, p: e.p }); tomada = true; i += k + 1; break; }
      }
    }
    if (!tomada) throw new Error(`«${id}» necesita más palabras: con esas opciones solo hay ${out.length} y hacen falta ${n}. Prueba con otro tipo de sílabas o con palabras de otro largo.`);
  }
  return azar.barajar(out);
}

/** Largos para «Sílabas de cada palabra» con la opción `largo`: un número, o variadas (la secuencia que se dé). */
export const largosDe = (params, variadas) => (Number.isInteger(params.largo) ? [params.largo] : variadas);

/** Cantidad de ejercicios: la de la página completa o su mitad en media página. */
export const cuantas = (tamano, completa) => (tamano === "media" ? completa / 2 : completa);

// ---------------------------------------------------------------- huecos con solución única
const porLargo = new Map();
function delLargo(n) {
  if (!porLargo.has(n)) porLargo.set(n, LEXICO.filter((e) => e.p.length === n).map((e) => ({ p: e.p, s: sinTildes(e.p) })));
  return porLargo.get(n);
}
/** ¿Es la palabra la única del léxico que encaja con esas letras ocultas (posiciones `ocultas` libres, el resto igual)? */
export function patronUnico(palabra, ocultas) {
  const s = sinTildes(palabra), libres = new Set(ocultas);
  return !delLargo(palabra.length).some((o) => o.p !== palabra && [...o.s].every((c, i) => libres.has(i) || c === s[i]));
}

/** Unidades de la palabra para dibujarla y ocultar letras: «ch», «ll», «rr», «qu» y «gu» (ante e, i) van juntas. */
export const unidades = (p) => p.match(/ch|ll|rr|qu|gu(?=[eéií])|./gi) || [];

// ---------------------------------------------------------------- dibujo
/** Tamaño de letra que hace caber el ancho total (suma de anchos + huecos) en w: baja desde fs hasta min. */
export function ajusta(p, anchoCon, w, fs, min = 14) {
  let f = fs;
  while (f > min && anchoCon(f) > w) f -= 1;
  return f;
}

/** Palabra dibujada por unidades (letras) con un hueco entre ellas; las de `rodear` se rodean en rojo en la solución;
 *  `rayas` = posiciones (nº de letras) tras las que va una raya roja en la solución. Centrada en la caja (x, y, w, h). */
export function palabraLetras(p, x, y, w, h, texto, { fs = 28, gap = 0.12, rodear = null, rayas = null } = {}) {
  const us = unidades(texto);
  const f = ajusta(p, (q) => us.reduce((t, u) => t + p.ancho(u, "PB", q), 0) + q * gap * (us.length - 1), w, fs);
  const gg = f * gap, ws = us.map((u) => p.ancho(u, "PB", f));
  let cx = x + (w - ws.reduce((a, b) => a + b, 0) - gg * (us.length - 1)) / 2, pos = 0;
  const ok = new Set(rodear ?? []), cortes = new Set(rayas ?? []);
  us.forEach((u, k) => {
    p.text(cx, y + h / 2 - f * 0.35, u, f, { f: "PB" });
    if (p.solucion && ok.has(k)) p.rrect(cx - f * 0.12, y + h / 2 - f * 0.62, ws[k] + f * 0.24, f * 1.24, Math.min(ws[k] / 2 + f * 0.12, f * 0.62), { lw: 2.2, stroke: COLOR_SOLUCION });
    pos += u.length;
    if (p.solucion && cortes.has(pos) && k < us.length - 1) p.line(cx + ws[k] + gg / 2, y + h / 2 - f * 0.75, cx + ws[k] + gg / 2, y + h / 2 + f * 0.75, { lw: 2.4, gris: COLOR_SOLUCION });
    cx += ws[k] + gg;
  });
  return f;
}

/** Fila de «píldoras» (sílabas sueltas) desde x; devuelve el x donde acaban. */
export function pildoras(p, x, y, h, textos, fs = 22, gap = 10) {
  const bh = fs * 1.7, by = y + (h - bh) / 2; let cx = x;
  textos.forEach((t) => {
    const w = p.ancho(t, "PB", fs) + fs * 0.9;
    p.rrect(cx, by, w, bh, bh / 2, { lw: 0.8, fill: 1, stroke: 0.55 });
    p.text(cx + w / 2, y + h / 2 - fs * 0.35, t, fs, { f: "PB", anchor: "middle" });
    cx += w + gap;
  });
  return cx - gap;
}
export const anchoPildoras = (p, textos, fs = 22, gap = 10) => textos.reduce((t, s) => t + p.ancho(s, "PB", fs) + fs * 0.9, 0) + gap * (textos.length - 1);
