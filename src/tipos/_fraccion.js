// Charta · núcleo común de «fraccion.*» (3.º, lote 5, bloque 15 «Fracciones»): nombres, denominadores, figuras partidas y la fracción apilada.
// Figuras: "circulo" (sectores desde arriba, en el sentido del reloj), "rect" (rectángulo en filas × columnas: 12 = 3 × 4; los primos, en columnas)
// y "tira" (barra de n partes). Las partes coloreadas van en gris (se ve en blanco y negro); en la solución de «Colorea», en rojo claro.
import { INK, COLOR_SOLUCION } from "../render/papel.js";

export const GRIS_PARTE = 0.72;                              // parte coloreada en el papel
export const ROJO_PARTE = "#ef9a9a";                         // parte coloreada en la solución (no es un hueco; Fori la reconoce como paso)
export const ROJO = COLOR_SOLUCION.toLowerCase();             // trazos y puntos rojos de la solución que no son huecos (test_tipos cuenta fill="#C62828")

const UNIDADES = ["", "un", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once"];
export const PARTES = {
  2: ["medio", "medios"], 3: ["tercio", "tercios"], 4: ["cuarto", "cuartos"], 5: ["quinto", "quintos"], 6: ["sexto", "sextos"],
  7: ["séptimo", "séptimos"], 8: ["octavo", "octavos"], 9: ["noveno", "novenos"], 10: ["décimo", "décimos"],
  11: ["onceavo", "onceavos"], 12: ["doceavo", "doceavos"],
};
/** 3/5 → «tres quintos»; 1/3 → «un tercio». */
export const enLetras = (a, b) => `${UNIDADES[a]} ${PARTES[b][a === 1 ? 0 : 1]}`;

/** Opción `den` → denominadores: None = del 2 al 12 · 6 · 10. */
export function denominadores(params) {
  const h = params?.den ?? 12;
  if (![6, 10, 12].includes(h)) throw new Error(`Denominador no permitido: ${h}`);
  return Array.from({ length: h - 1 }, (_, i) => i + 2);
}
export const FIGURAS = ["circulo", "rect", "tira"];
/** Opción `figura` → lista de figuras: None = mezcla. */
export function figurasDe(params) {
  const v = params?.figura ?? null;
  if (v === null) return FIGURAS;
  if (!FIGURAS.includes(v)) throw new Error(`Figura no permitida: ${v}`);
  return [v];
}
const FILAS_RECT = { 4: [2, 2], 6: [2, 3], 8: [2, 4], 9: [3, 3], 10: [2, 5], 12: [3, 4] };
/** Rectángulo de n partes → [filas, columnas]; los primos (y el 2) en una fila de columnas. */
export const rejillaRect = (n) => FILAS_RECT[n] ?? [1, n];

/** Partes coloreadas (índices): en el círculo y la tira, seguidas desde el principio; en el rectángulo de varias filas, sueltas al azar. */
export function partesColoreadas(azar, fig, n, k) {
  if (fig === "rect" && rejillaRect(n)[0] > 1) return azar.muestra(Array.from({ length: n }, (_, i) => i), k).sort((a, b) => a - b);
  return Array.from({ length: k }, (_, i) => i);
}

/** Fracciones propias distintas (k/n, 1 ≤ k < n) repartidas por turnos entre los denominadores: [[k, n]…]. `vale(k, n)` filtra. */
export function fraccionesPropias(azar, dens, cnt, vale = () => true) {
  const colas = new Map(azar.barajar(dens).map((n) => [n, azar.barajar(Array.from({ length: n - 1 }, (_, i) => i + 1).filter((k) => vale(k, n)))]));
  const orden = [...colas.keys()], out = [];
  for (let i = 0; out.length < cnt && orden.some((n) => colas.get(n).length); i++) {
    const n = orden[i % orden.length];
    if (colas.get(n).length) out.push([colas.get(n).pop(), n]);
  }
  if (out.length < cnt) throw new Error(`Esta ficha necesita más fracciones: elige un denominador mayor.`);
  return azar.barajar(out);
}

/** Tamaño (w, h) que ocupa la figura en una caja de aw × ah. */
export function medidaFigura(fig, n, aw, ah) {
  if (fig === "circulo") { const d = Math.min(aw, ah); return [d, d]; }
  if (fig === "tira") { const w = aw, h = Math.min(ah, Math.max(24, Math.min(40, w / n * 1.4))); return [w, h]; }
  const [f, c] = rejillaRect(n), asp = f === 1 ? 1.5 : c / f * 1.1;   // celdas casi cuadradas
  let w = aw, h = w / asp; if (h > ah) { h = ah; w = h * asp; }
  return [w, h];
}

/** Dibuja la figura de n partes centrada en (cx, cy) dentro de aw × ah. `llenas` = índices coloreados; `fill` = su color. */
export function dibujarFigura(p, fig, n, llenas, cx, cy, aw, ah, { fill = GRIS_PARTE, lw = 1.4 } = {}) {
  const [w, h] = medidaFigura(fig, n, aw, ah), on = new Set(llenas);
  if (fig === "circulo") {
    const r = w / 2, paso = (2 * Math.PI) / n;
    for (let i = 0; i < n; i++) {
      const a0 = Math.PI / 2 - i * paso, a1 = a0 - paso, seg = Math.max(4, Math.ceil(paso / 0.06)), cmds = [["M", cx, cy]];
      for (let s = 0; s <= seg; s++) { const a = a0 + (a1 - a0) * (s / seg); cmds.push(["L", cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
      cmds.push(["Z"]);
      p.path(cmds, { lw, fill: on.has(i) ? fill : 1, stroke: INK });
    }
    return [w, h];
  }
  const [f, c] = fig === "tira" ? [1, n] : rejillaRect(n), cw = w / c, chh = h / f, x0 = cx - w / 2, y0 = cy + h / 2;
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / c), k = i % c;
    p.rrect(x0 + k * cw, y0 - (r + 1) * chh, cw, chh, 0, { lw, fill: on.has(i) ? fill : 1, stroke: INK });
  }
  return [w, h];
}

/** Alto y ancho de una fracción apilada (número o hueco) con letra fs: { w, h }. */
export function medidaFraccion(p, num, den, fs, hueco = null) {
  if (hueco) return { w: hueco.w + 8, h: hueco.h * 2 + 10 };
  const w = Math.max(p.ancho(String(num), "PB", fs), p.ancho(String(den), "PB", fs)) + 8;
  return { w, h: fs * 2.1 };
}
/** Fracción apilada centrada en (cx, cy): numerador, raya y denominador. `hueco` = { w, h, sol: [num, den] } para dos casillas;
 *  `huecoNum`/`huecoDen` = solo una casilla (la otra cifra, escrita). */
export function fraccion(p, cx, cy, num, den, fs = 22, { hueco = null, gris = INK } = {}) {
  if (hueco) {
    const { w, h, sol } = hueco, bw = w + 8;
    p.line(cx - bw / 2, cy, cx + bw / 2, cy, { lw: 1.8, gris });
    p.caja(cx - w / 2, cy + 5, w, h, null, Math.min(fs, 22), sol[0]);
    p.caja(cx - w / 2, cy - 5 - h, w, h, null, Math.min(fs, 22), sol[1]);
    return bw;
  }
  const bw = Math.max(p.ancho(String(num), "PB", fs), p.ancho(String(den), "PB", fs)) + 8;
  p.line(cx - bw / 2, cy, cx + bw / 2, cy, { lw: 1.8, gris });
  p.text(cx, cy + fs * 0.28, String(num), fs, { anchor: "middle", gris });
  p.text(cx, cy - fs * 1.02, String(den), fs, { anchor: "middle", gris });
  return bw;
}
