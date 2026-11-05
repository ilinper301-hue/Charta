// Charta · lienzo de página para dibujar actividades (paso 2.3).
// Mismas coordenadas que el motor de referencia: puntos PDF, A4, origen abajo a la izquierda, y hacia ARRIBA.
// Así cada tipo se porta casi línea a línea desde motor/generador_fichas.py. Al emitir SVG se invierte y (H − y).
// Port de stroke(), caja(), cuadrito(), _marco(), _celdas(), _linea(), T(), B() y _n() del motor.
import { rep as repSVG, plantilla as tplSVG, esc } from "../rep/index.js";
import { FUENTE_POR_DEFECTO, ANDIKA_CSS } from "./fuentes.js";

export const W = 595.2756;
export const H = 841.8898;
export const M = 28;
/** `top` de las familias del motor: fn(H − M − 76, …). La familia rep usa H − M − 90 (TOP_REP). */
export const TOP = H - M - 76;
export const TOP_REP = H - M - 90;
/** Zona de página que el panel encaja: M..W−M × M..H−M−76 (alto × parte en media página). */
export const ZONA = { x: M, w: W - 2 * M, yArriba: H - M - 76, alto: H - 2 * M - 76 };
export const INK = 0.12;
export const COLOR_SOLUCION = "#C62828";
export const FUENTE = ANDIKA_CSS;
export const MENOS = "−";

const f2 = (x) => { const v = Math.round(x * 100) / 100; return String(Object.is(v, -0) ? 0 : v); };
/** Gris de ReportLab (0 negro … 1 blanco) o color "#rrggbb" → color SVG. */
export function color(g) {
  if (g === null || g === undefined) return "none";
  if (typeof g === "string") return g;
  const h = Math.round(g * 255).toString(16).padStart(2, "0");
  return `#${h}${h}${h}`;
}
const negrita = (f) => f === "PB";

/** Elemento de _linea(): texto o caja vacía (como T() y B() del motor). */
export const T = (s, fs = 19, f = "PB") => ({ t: "t", s: String(s), f, fs });
export const B = (w = 44, h = 38, sol = null) => ({ t: "b", w, h, sol });

export class Papel {
  /** modo: "papel" (huecos vacíos) o "solucion" (huecos con la respuesta en rojo). parte: 1 o 0.5. */
  constructor({ modo = "papel", parte = 1, fuente = FUENTE_POR_DEFECTO } = {}) {
    this.o = []; this.modo = modo; this.parte = parte; this.fuente = fuente;
  }
  get solucion() { return this.modo === "solucion"; }
  Y(y) { return f2(H - y); }

  // ---------------------------------------------------------------- primitivas
  abrir(attrs = "") { this.o.push(`<g${attrs ? " " + attrs : ""}>`); }
  cerrar() { this.o.push("</g>"); }
  /** Agrupa lo que dibuja fn como un ejercicio (Fori lo mostrará de uno en uno). */
  ejercicio(id, fn) { this.abrir(`class="ej" data-ej="${esc(id)}"`); fn(); this.cerrar(); }

  line(x1, y1, x2, y2, { lw = 1.6, gris = INK } = {}) {
    this.o.push(`<line x1="${f2(x1)}" y1="${this.Y(y1)}" x2="${f2(x2)}" y2="${this.Y(y2)}" stroke="${color(gris)}" stroke-width="${f2(lw)}"/>`);
  }
  _est(lw, fill, stroke) {
    return `fill="${color(fill)}"` + (stroke === null ? "" : ` stroke="${color(stroke)}" stroke-width="${f2(lw)}"`);
  }
  rrect(x, y, w, h, r, { lw = 1.5, fill = null, stroke = INK } = {}) {
    this.o.push(`<rect x="${f2(x)}" y="${this.Y(y + h)}" width="${f2(w)}" height="${f2(h)}"${r ? ` rx="${f2(r)}"` : ""} ${this._est(lw, fill, stroke)}/>`);
  }
  circle(x, y, r, { lw = 1.5, fill = null, stroke = INK } = {}) {
    this.o.push(`<circle cx="${f2(x)}" cy="${this.Y(y)}" r="${f2(r)}" ${this._est(lw, fill, stroke)}/>`);
  }
  /** cmds: [["M", x, y], ["L", x, y], ["C", x1, y1, x2, y2, x, y], ["Z"]] en coordenadas y-arriba. */
  path(cmds, { lw = 1.5, fill = null, stroke = INK } = {}) {
    const d = cmds.map(([k, ...v]) => k + v.map((n, i) => (i % 2 ? this.Y(n) : f2(n))).join(" ")).join("");
    this.o.push(`<path d="${d}" ${this._est(lw, fill, stroke)}/>`);
  }
  /** anchor: "start" (drawString), "middle" (drawCentredString), "end" (drawRightString). */
  text(x, y, t, fs, { f = "PB", anchor = "start", gris = INK } = {}) {
    this.o.push(`<text x="${f2(x)}" y="${this.Y(y)}"${anchor !== "start" ? ` text-anchor="${anchor}"` : ""} font-family="${this.fuente.css.replaceAll('"', "&quot;")}" font-size="${f2(fs)}"` +
      (negrita(f) ? ` font-weight="bold"` : "") + ` fill="${color(gris)}">${esc(t)}</text>`);
  }
  ancho(t, f, fs) { return this.fuente.ancho(String(t), negrita(f), fs); }
  /** Representación del número centrada en (cx, cy), como CAT[k][READ](cx, cy, n, i) del motor. */
  rep(nombre, n, cx, cy, { i = 0, vacio = false, rango, escala = 1 } = {}) { this._svg(repSVG(nombre, n, { i, vacio, rango }), cx, cy, escala); }
  plantilla(nombre, n, cx, cy, { i = 0, rango, escala = 1 } = {}) {
    const r = tplSVG(nombre, n, { i, rango }); if (r) this._svg(r, cx, cy, escala);
  }
  _svg({ w, h, svg }, cx, cy, k) {
    if (this.fuente.css !== FUENTE) svg = svg.replaceAll(`font-family="${FUENTE}"`, `font-family="${this.fuente.css.replaceAll('"', "&quot;")}"`);   // las representaciones también usan la letra elegida
    this.o.push(`<g transform="translate(${f2(cx)} ${this.Y(cy)})${k !== 1 ? ` scale(${f2(k)})` : ""} translate(${f2(-w / 2)} ${f2(-h / 2)})">${svg}</g>`);
  }

  // ---------------------------------------------------------------- piezas del motor
  /** stroke(w) + roundRect(r=10, fill=0) con _tarjetas(): tarjeta blanca de borde gris claro. */
  tarjeta(x, y, w, h, lw = 1.5) {
    this.rrect(x, y, w, h, 9, lw < 1.7 ? { lw: 0.8, fill: 1, stroke: 0.8 } : { lw, fill: 1, stroke: INK });
  }
  /** _marco(): tarjeta con número de ejercicio (idx + 1) y etiqueta opcional. */
  marco(x, y, w, h, idx = null, lab = "") {
    this.tarjeta(x, y, w, h);
    if (idx !== null) this.text(x + 14, y + h - 22, String(idx + 1), 11, { f: "PB", gris: 0.3 });
    if (lab) this.text(x + (idx !== null ? 34 : 14), y + h - 21, lab, 8.5, { f: "PM", gris: 0.3 });
  }
  /** caja(): con valor, tarjeta blanca con el número; sin valor, hueco gris (y la solución en modo solución). */
  caja(x, y, w, h, val = null, fs = 22, sol = null) {
    if (val === null) {
      this.rrect(x, y, w, h, 7, { lw: 1.5, fill: 0.9, stroke: INK });
      if (this.solucion && sol !== null && sol !== undefined) this.solucionEn(x + w / 2, y + h / 2, sol, Math.min(fs, h * 0.6));
    } else {
      this.rrect(x, y, w, h, 7, { lw: 1.5, fill: 1, stroke: INK });
      this.text(x + w / 2, y + h / 2 - fs * 0.35, String(val), fs, { f: "PB", anchor: "middle" });
    }
  }
  /** Respuesta centrada en (cx, cy) en el color de la solución. */
  solucionEn(cx, cy, sol, fs = 20) {
    this.text(cx, cy - fs * 0.35, String(sol), fs, { f: "PB", anchor: "middle", gris: COLOR_SOLUCION });
  }
  /** cuadrito() de las representaciones: hueco gris arriba a la derecha de la celda. */
  cuadrito(x, y, cw, ch, q = 30, sol = null) { this.caja(x + cw - 9 - q, y + ch - 9 - q, q, q, null, 18, sol); }
  /** _n(filas): todas las filas o la mitad en media página. */
  n(filas) { return this.parte >= 1 ? filas : Math.max(1, Math.floor(filas * this.parte)); }
  /** _celdas(): rejilla de cols × rows (solo las filas de _n) → {cel: [[x, y]…], cw, ch}. */
  celdas(top, cols, rows, GX = 10, GY = 10) {
    const cw = (W - 2 * M - (cols - 1) * GX) / cols, ch = (top - M - (rows - 1) * GY) / rows, cel = [];
    for (let r = 0; r < this.n(rows); r++) for (let k = 0; k < cols; k++) cel.push([M + k * (cw + GX), top - (r + 1) * ch - r * GY]);
    return { cel, cw, ch };
  }
  /** _linea(): fila centrada de textos T() y huecos B() (B(w, h, sol) muestra sol en modo solución). */
  linea(x, y, w, h, items, gap = 8) {
    const ws = items.map((it) => (it.t === "t" ? this.ancho(it.s, it.f, it.fs) : it.w));
    let cx = x + (w - ws.reduce((a, b) => a + b, 0) - gap * (items.length - 1)) / 2;
    items.forEach((it, k) => {
      if (it.t === "t") this.text(cx, y + h / 2 - it.fs * 0.33, it.s, it.fs, { f: it.f });
      else this.caja(cx, y + (h - it.h) / 2, it.w, it.h, null, 20, it.sol);
      cx += ws[k] + gap;
    });
  }
  /** _pintar(): rejilla de operaciones; filas = [items de linea()…] (ya recortadas a _n(rows)·cols). */
  pintar(top, cols, rows, filas, ids) {
    const GX = 10, GY = 8;
    const cw = (W - 2 * M - (cols - 1) * GX) / cols, ch = (top - M - (rows - 1) * GY) / rows;
    filas.slice(0, this.n(rows) * cols).forEach((items, i) => this.ejercicio(ids[i], () => {
      const r = Math.floor(i / cols), k = i % cols;
      const x = M + k * (cw + GX), y = top - (r + 1) * ch - r * GY;
      this.marco(x, y, cw, ch); this.linea(x, y, cw, ch, items, 8);
    }));
  }

  /** SVG de la zona de contenido (la que el panel encaja), en coordenadas de página. */
  resultado() {
    const h = ZONA.alto * this.parte, y = H - ZONA.yArriba;
    return { x: ZONA.x, y, w: ZONA.w, h, svg: `<g stroke-linecap="round" stroke-linejoin="round">${this.o.join("")}</g>` };
  }
}
