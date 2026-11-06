// Charta · ayudantes de los tipos escritura.* (Lengua 1.º, lote 4; LENGUA_1.md §3, bloque 8). Sin DOM.
// Todo se escribe en pauta Lamela (src/lengua/pauta.js) con letras de trazo (src/lengua/trazos.js).
// Medidas: la pauta se mide en milímetros REALES (Papel.mm). El nº de renglones de cada bloque se decide en `generar` con una tabla conservadora
// (filasDe) para que los datos no dependan de la escala del panel; `dibujar` solo recorta renglones LIBRES si, con letra grande y un enunciado largo,
// el panel quedase más pequeño de lo previsto (los renglones guiados siempre se dibujan).
import { ZONA } from "../render/papel.js";
import { cabenRenglones, PAUTA_POR_DEFECTO } from "../lengua/pauta.js";
import { escribirTrazos, anchoTrazos, trazoACurvas, VERDE_INICIO } from "../lengua/trazos.js";

/** Alto (mm) de pauta que se usa para planificar, con margen: completa ≈ 229 mm reales y media ≈ 98 mm con un enunciado de una línea. */
export const CAP_MM = { completa: 210, media: 92 };
/** Ancho útil (mm) de un renglón al planificar (antes de los márgenes). */
export const ANCHO_MM = { completa: 158, media: 138 };
/** Alto (mm) de la etiqueta de un bloque de «escribe una frase». */
export const ETIQUETA_MM = 9;

/** Tamaño de pauta (mm) de la actividad: 5 por defecto. */
export const mmDe = (params) => params?.pauta ?? PAUTA_POR_DEFECTO;
/** Renglones que caben (con margen) en una actividad. 5 mm: 14 (completa) y 6 (media). */
export const filasDe = (tamano, mm) => Math.floor(CAP_MM[tamano] / (3 * mm) + 1e-9);
/** Ancho útil de un renglón en cuerpos (unidades de la pauta). */
export const anchoDe = (tamano, mm) => (ANCHO_MM[tamano] - 3) / mm;
/** Un texto cabe en una sola línea (con margen a los lados). */
export const cabeEnLinea = (texto, tamano, mm) => anchoTrazos(texto) <= anchoDe(tamano, mm) - 1.2;

/** Reparte los renglones libres que sobran entre los bloques (los que sobran del reparto, a los primeros). */
export function repartirLibres(total, guiadas) {
  const B = guiadas.length, libre = total - guiadas.reduce((a, b) => a + b, 0);
  if (libre < B) throw new Error(`escritura: ${total} renglones no bastan para ${B} bloques.`);
  return guiadas.map((g, i) => Math.floor(libre / B) + (i < libre % B ? 1 : 0));
}

// ---------------------------------------------------------------- dibujo
/** Medidas del dibujo de una actividad: pauta (mm), cuerpo c, márgenes laterales y renglones que caben de verdad en el panel. */
export function contexto(p, act) {
  const mm = mmDe(act.params), c = p.mm(mm), alto = ZONA.alto * p.parte;
  return { mm, c, paso: 3 * c, alto, x0: ZONA.x + p.mm(1.5), x1: ZONA.x + ZONA.w - p.mm(1.5), yTop: ZONA.yArriba, caben: cabenRenglones(p, alto, mm) };
}

/** Recorta renglones libres (de los últimos bloques hacia atrás) si el total no cabe en `caben`. */
export function recortar(libres, guiadas, caben) {
  const l = libres.slice();
  let exceso = l.reduce((a, b) => a + b, 0) + guiadas.reduce((a, b) => a + b, 0) - caben;
  for (let i = l.length - 1; i >= 0 && exceso > 0; i--) { const q = Math.min(l[i], exceso); l[i] -= q; exceso -= q; }
  return l;
}

/** Texto con letras de trazo: el modelo lleva punto verde de inicio (y flechas si el cuerpo es grande); el repaso (gris / punteado) también lleva el punto. */
export function escribir(p, texto, x, base, c, estilo = "modelo") {
  return escribirTrazos(p, texto, x, base, c, estilo === "modelo" ? { estilo } : { estilo, punto: true });
}

/** Copias del texto repetidas a lo ancho de x a x1 (separadas `sep` cuerpos). Devuelve cuántas caben. */
export function repetir(p, texto, x, x1, base, c, estilo, { sep = 1.2, max = 99 } = {}) {
  const w = anchoTrazos(texto), paso = w + sep;
  const n = Math.max(1, Math.min(max, Math.floor(((x1 - x) / c + sep) / paso + 1e-9)));
  for (let k = 0; k < n; k++) escribir(p, texto, x + k * paso * c, base, c, estilo);
  return n;
}

// ---------------------------------------------------------------- trazos de grafomotricidad (escritura.trazos)
// Un patrón = { paso, hacer(i0, i1) → [{ d: [segmento…], sinPunto? }] }: las celdas i0…i1−1, en unidades de la pauta (base 0, cuerpo 1, asta 1,8, rabo −0,8).
// «sueltas»: cada unidad es un trazo (con su punto de inicio). «continuo»: una sola línea que sigue (el punto solo al empezar).
const M_ = (x, y) => ["M", x, y], L_ = (x, y) => ["L", x, y], ar = (cx, cy, rx, ry, a0, a1) => ["A", cx, cy, rx, ry, a0, a1];
const sueltas = (paso, unidad) => ({ paso, hacer: (i0, i1) => Array.from({ length: Math.max(0, i1 - i0) }, (_, k) => ({ d: unidad((i0 + k) * paso) })) });
const continuo = (paso, ini, celda) => ({
  paso, hacer: (i0, i1) => {
    if (i1 <= i0) return [];
    const d = ini ? [ini(i0 * paso)] : [];
    for (let i = i0; i < i1; i++) d.push(...celda(i * paso));
    return [{ d, sinPunto: i0 > 0 }];
  },
});
/** Bucles (trocoide): b = avance, a = ancho del lazo, yc/ry = centro y alto, sg = +1 lazos arriba / −1 lazos abajo. Empieza en el extremo opuesto al lazo. */
function bucles(b, a, yc, ry, sg) {
  const paso = 2 * Math.PI * b, K = 28;
  return {
    paso, hacer: (i0, i1) => {
      if (i1 <= i0) return [];
      const d = [];
      for (let k = 0; k <= (i1 - i0) * K; k++) {
        const th = Math.PI + 2 * Math.PI * i0 + (2 * Math.PI * k) / K;
        d.push([k ? "L" : "M", i0 * paso + b * (th - Math.PI - 2 * Math.PI * i0) - a * Math.sin(th), yc + sg * ry * Math.cos(th)]);
      }
      return [{ d, sinPunto: i0 > 0 }];
    },
  };
}
const onda = (rx, ry, cy) => continuo(4 * rx, null, (x) => [ar(x + rx, cy, rx, ry, 180, 0), ar(x + 3 * rx, cy, rx, ry, 180, 360)]);
const puentes = (rx, ry) => continuo(2 * rx, null, (x) => [ar(x + rx, 0, rx, ry, 180, 0)]);
const picos = (dx, alto) => continuo(2 * dx, (x) => M_(x, 0), (x) => [L_(x + dx, alto), L_(x + 2 * dx, 0)]);

/** Familias de trazos: id → { nombre, variantes: [[id, nombre, patrón]…] } (todas tienen al menos 4 variantes). */
export const FAMILIAS_TRAZO = {
  lineas: { nombre: "Líneas", variantes: [
    ["horizontales", "Líneas horizontales", sueltas(1.5, (x) => [M_(x, 0.5), L_(x + 1, 0.5)])],
    ["verticales", "Líneas verticales", sueltas(0.8, (x) => [M_(x + 0.1, 1), L_(x + 0.1, 0)])],
    ["altas", "Líneas verticales altas", sueltas(0.8, (x) => [M_(x + 0.1, 1.8), L_(x + 0.1, 0)])],
    ["derecha", "Líneas inclinadas /", sueltas(0.9, (x) => [M_(x + 0.6, 1), L_(x, 0)])],
    ["izquierda", "Líneas inclinadas \\", sueltas(0.9, (x) => [M_(x, 1), L_(x + 0.6, 0)])],
  ] },
  ondas: { nombre: "Ondas", variantes: [
    ["suave", "Onda suave", onda(0.4, 0.4, 0.5)],
    ["normal", "Onda", onda(0.45, 0.5, 0.5)],
    ["alta", "Onda alta", onda(0.45, 0.9, 0.9)],
    ["larga", "Onda larga", onda(0.8, 0.5, 0.5)],
  ] },
  bucles: { nombre: "Bucles", variantes: [
    ["arriba", "Bucles hacia arriba", bucles(0.2, 0.34, 0.5, 0.5, 1)],
    ["altos", "Bucles altos", bucles(0.22, 0.36, 0.9, 0.9, 1)],
    ["abajo", "Bucles hacia abajo", bucles(0.2, 0.34, 0.5, 0.5, -1)],
    ["largos", "Bucles largos hacia abajo", bucles(0.22, 0.36, 0.1, 0.9, -1)],
  ] },
  puentes: { nombre: "Puentes", variantes: [
    ["bajos", "Puentes bajos", puentes(0.45, 0.5)],
    ["pequenos", "Puentes pequeños", puentes(0.4, 0.8)],
    ["anchos", "Puentes anchos", puentes(0.7, 0.8)],
    ["altos", "Puentes altos", puentes(0.5, 1.8)],
  ] },
  arcos: { nombre: "Arcos", variantes: [
    ["cuenco", "Arcos hacia arriba", sueltas(1.2, (x) => [ar(x + 0.4, 1, 0.4, 1, 180, 360)])],
    ["cuencoLargo", "Arcos largos hacia arriba", sueltas(1.2, (x) => [ar(x + 0.4, 1, 0.4, 1.8, 180, 360)])],
    ["tejado", "Arcos hacia abajo", sueltas(1.2, (x) => [ar(x + 0.4, 0, 0.4, 1, 180, 0)])],
    ["tejadoAlto", "Arcos altos hacia abajo", sueltas(1.2, (x) => [ar(x + 0.4, 0, 0.4, 1.8, 180, 0)])],
  ] },
  zigzag: { nombre: "Zigzag", variantes: [
    ["picos", "Picos", picos(0.5, 1)],
    ["altos", "Picos altos", picos(0.5, 1.8)],
    ["anchos", "Picos anchos", picos(0.7, 1)],
    ["sierra", "Dientes de sierra", continuo(0.8, (x) => M_(x, 0), (x) => [L_(x + 0.8, 1), L_(x + 0.8, 0)])],
  ] },
  circulos: { nombre: "Círculos y óvalos", variantes: [
    ["circulos", "Círculos", sueltas(1.3, (x) => [ar(x + 0.45, 0.5, 0.45, 0.5, 90, 450)])],
    ["pequenos", "Círculos pequeños", sueltas(0.9, (x) => [ar(x + 0.3, 0.5, 0.3, 0.3, 90, 450)])],
    ["altos", "Óvalos altos", sueltas(1.2, (x) => [ar(x + 0.4, 0.9, 0.4, 0.9, 90, 450)])],
    ["anchos", "Óvalos anchos", sueltas(1.9, (x) => [ar(x + 0.7, 0.5, 0.7, 0.5, 90, 450)])],
  ] },
};
export const patronTrazo = (familia, variante) => FAMILIAS_TRAZO[familia].variantes.find((v) => v[0] === variante)[2];

/** Dibuja trazos de un patrón con el estilo del modelo («modelo» negro, «repaso» gris, «punteado»); punto verde al inicio de cada trazo. */
export function pintarTrazos(p, trazos, x, base, c, estilo) {
  for (const tr of trazos) {
    const { ini, cmds } = trazoACurvas(tr);
    const cm = cmds.map(([k, ...v]) => [k, ...v.map((n, q) => (q % 2 ? base + n * c : x + n * c))]);
    if (estilo === "modelo") p.path(cm, { lw: 0.11 * c, stroke: 0.1 });
    else if (estilo === "repaso") p.path(cm, { lw: 0.12 * c, stroke: "#c4c4c4" });
    else p.path(cm, { lw: 0.09 * c, stroke: 0.45, dash: [0.001 * c, 0.17 * c] });
    if (!tr.sinPunto) p.circle(x + ini[0] * c, base + ini[1] * c, (estilo === "modelo" ? 0.1 : 0.075) * c, { fill: VERDE_INICIO, stroke: null });
  }
}
/** Cuántas celdas del patrón caben en una línea de `ancho` cuerpos. */
export const celdasQueCaben = (patron, ancho) => Math.max(1, Math.floor((ancho - 1) / patron.paso));

