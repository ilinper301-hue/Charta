// Charta · Lengua · letra escolar ligada «Escolar_G» (© Antonio Herrera Infantes & Anye1992), para las fichas de caligrafía.
// Los contornos están en escolar.js (GENERADO por tools/escolar.py). La x mide 1 cuerpo de la pauta (335 unidades); astas a 2 cuerpos y rabos a −1.
// Los glifos sobresalen de su avance a propósito (son los enlaces de la letra ligada): cada letra va en x += avance, sin espacio extra.
// No hay trazos con dirección, así que no hay punto verde de inicio ni flechas.
import { GLIFOS, UNIDADES } from "./escolar.js";

const cache = new Map();
/** Contorno de un glifo como comandos [["M", x, y], ["Q", cx, cy, x, y], …] en unidades de la fuente (y hacia arriba). */
function comandos(d) {
  let c = cache.get(d);
  if (!c) {
    c = (d.match(/[MLQCZ][^MLQCZ]*/g) || []).map((s) => [s[0], ...(s.slice(1).trim() ? s.slice(1).trim().split(" ").map(Number) : [])]);
    cache.set(d, c);
  }
  return c;
}
const glifo = (ch) => {
  const g = GLIFOS[ch];
  if (!g) throw new Error(`Falta la letra escolar «${ch}».`);
  return g;
};

/** ¿Hay letra escolar para este carácter? */
export const hayEscolar = (ch) => Object.hasOwn(GLIFOS, ch);

/** Ancho de un texto en cuerpos (suma de avances; la última letra puede sobresalir un poco más por su enlace). */
export function anchoEscolar(texto) {
  let w = 0;
  for (const ch of texto) w += glifo(ch)[0];
  return w / UNIDADES;
}

/**
 * Escribe `texto` con la letra escolar en (x, base), cuerpo c (unidades del papel). Devuelve la x final.
 * color: relleno del modelo (gris 0–1 o "#rrggbb"; por defecto oscuro). estilo: "modelo" (relleno oscuro) · "repaso" (relleno gris claro) · "punteado" (una línea de puntos por el centro del trazo).
 */
export function escribirEscolar(p, texto, x, base, c, { estilo = "modelo", color = 0.1 } = {}) {
  if (!["modelo", "repaso", "punteado"].includes(estilo)) throw new Error(`Estilo de letra escolar desconocido: ${estilo}`);
  const k = c / UNIDADES, cm = [];
  let u = 0;
  for (const ch of texto) {
    const [av, d, centro] = glifo(ch);
    for (const [t, ...v] of comandos(estilo === "punteado" ? centro : d)) cm.push([t, ...v.map((n, i) => (i % 2 ? base + n * k : x + (u + n) * k))]);
    u += av;
  }
  if (cm.length) {
    if (estilo === "modelo") p.path(cm, { fill: color, stroke: null });
    else if (estilo === "repaso") p.path(cm, { fill: "#c4c4c4", stroke: null });
    else p.path(cm, { lw: 0.09 * c, stroke: 0.45, fill: null, dash: [0.001 * c, 0.17 * c] });   // una sola línea de puntos por la línea central (como el punteado de trazo)
  }
  return x + (u * k);
}
