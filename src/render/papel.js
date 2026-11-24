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
/** Puntos por milímetro (1 pt = 1/72 in). */
export const MM = 72 / 25.4;
/** Panel de la página (x, yAbajo, w, h) y separación entre dos medias: los usa hoja.js. */
export const PANEL = { x: 22, y: 18, w: W - 44, h: H - 84 - 18, gap: 8 };
/** Escala con que el panel encaja la zona (como panel() de hoja.js). extra = alto de las líneas de enunciado de más. */
/** Cantidad de ejercicios de la ficha (opción «Cantidad»): "grandes" (la de siempre, tarjetas que llenan el panel) o "mas" (las filas que caben). */
export const CANTIDADES = ["grandes", "mas"];
/** Alto de la zona de una rejilla que empieza en `top` (hasta el pie de la zona: la mitad en media página). */
export const altoRejilla = (parte = 1, top = TOP) => top - (ZONA.yArriba - ZONA.alto * parte);
/** Rejilla elástica, sin Papel (para que generar() sepa cuántos caben): filas de alto ≥ minAlto que caben. */
export function filasRejilla(parte, minAlto, top = TOP, GY = 10) {
  return Math.max(1, Math.floor((altoRejilla(parte, top) + GY) / (minAlto + GY)));
}
/** Ejercicios de una rejilla: «Más grandes» = `fijo` = [completa, media] (los de siempre); «Más ejercicios» = cols × filas que caben con tarjetas ≥ minAlto. */
export function cuantosRejilla({ tamano, cantidad } = {}, cols, minAlto, fijo) {
  const parte = tamano === "media" ? 0.5 : 1;
  return cantidad === "mas" ? cols * filasRejilla(parte, minAlto) : fijo[parte < 1 ? 1 : 0];
}

export function escalaPanel(parte = 1, extra = 0) {
  const h = parte < 1 ? (PANEL.h - PANEL.gap) / 2 : PANEL.h;
  return Math.min((PANEL.w - 31) / ZONA.w, (h - 46 - extra) / (ZONA.alto * parte));
}

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
  /** escala: la del panel donde irá (para medidas reales en mm; por defecto, la de un enunciado de una línea). */
  constructor({ modo = "papel", parte = 1, fuente = FUENTE_POR_DEFECTO, escala } = {}) {
    this.o = []; this.modo = modo; this.parte = parte; this.fuente = fuente; this.escala = escala || escalaPanel(parte);
  }
  /** v milímetros reales en el papel impreso → unidades de la zona (compensa la escala del panel). */
  mm(v) { return v * MM / this.escala; }
  get solucion() { return this.modo === "solucion"; }
  Y(y) { return f2(H - y); }

  // ---------------------------------------------------------------- primitivas
  abrir(attrs = "") { this.o.push(`<g${attrs ? " " + attrs : ""}>`); }
  cerrar() { this.o.push("</g>"); }
  /** Agrupa lo que dibuja fn como un ejercicio (Fori lo mostrará de uno en uno). */
  ejercicio(id, fn) { this.abrir(`class="ej" data-ej="${esc(id)}"`); fn(); this.cerrar(); }

  line(x1, y1, x2, y2, { lw = 1.6, gris = INK, dash = null } = {}) {
    this.o.push(`<line x1="${f2(x1)}" y1="${this.Y(y1)}" x2="${f2(x2)}" y2="${this.Y(y2)}" stroke="${color(gris)}" stroke-width="${f2(lw)}"${dash ? ` stroke-dasharray="${dash.map(f2).join(" ")}"` : ""}/>`);
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
  path(cmds, { lw = 1.5, fill = null, stroke = INK, dash = null } = {}) {
    const d = cmds.map(([k, ...v]) => k + v.map((n, i) => (i % 2 ? this.Y(n) : f2(n))).join(" ")).join("");
    this.o.push(`<path d="${d}" ${this._est(lw, fill, stroke)}${dash ? ` stroke-dasharray="${dash.map(f2).join(" ")}"` : ""}/>`);
  }
  /** anchor: "start" (drawString), "middle" (drawCentredString), "end" (drawRightString). */
  text(x, y, t, fs, { f = "PB", anchor = "start", gris = INK } = {}) {
    this.o.push(`<text x="${f2(x)}" y="${this.Y(y)}"${anchor !== "start" ? ` text-anchor="${anchor}"` : ""} font-family="${this.fuente.css.replaceAll('"', "&quot;")}" font-size="${f2(fs)}"` +
      (negrita(f) ? ` font-weight="bold"` : "") + ` fill="${color(gris)}">${esc(t)}</text>`);
  }
  ancho(t, f, fs) { return this.fuente.ancho(String(t), negrita(f), fs); }
  /** Rótulo de tarjeta a tamaño fijo (≥ 9 pt impresos): si no cabe en `wmax`, lo parte por palabras en varias líneas hacia abajo (interlineado `lh`·fs). Devuelve las líneas. */
  rotulo(x, y, t, fs, wmax, { f = "PM", anchor = "start", gris = 0.3, lh = 1.15 } = {}) {
    const lineas = []; let cur = "";
    for (const w of String(t).split(" ")) {
      const c = cur ? cur + " " + w : w;
      if (cur && this.ancho(c, f, fs) > wmax) { lineas.push(cur); cur = w; } else cur = c;
    }
    lineas.push(cur);
    lineas.forEach((l, k) => this.text(x, y - k * lh * fs, l, fs, { f, anchor, gris }));
    return lineas;
  }
  /** Representación del número centrada en (cx, cy), como CAT[k][READ](cx, cy, n, i) del motor. */
  rep(nombre, n, cx, cy, { i = 0, vacio = false, rango, escala = 1, centenas = false, millares = false } = {}) { this._svg(repSVG(nombre, n, { i, vacio, rango, centenas, millares }), cx, cy, escala); }
  plantilla(nombre, n, cx, cy, { i = 0, rango, escala = 1, centenas = false, millares = false } = {}) {
    const r = tplSVG(nombre, n, { i, rango, centenas, millares }); if (r) this._svg(r, cx, cy, escala);
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
    if (lab) this.rotulo(x + (idx !== null ? 34 : 14), y + h - 21, lab, 11, w - (idx !== null ? 34 : 14) - 12);   // ≥ 9 pt impresos; si no cabe, en dos líneas
  }
  /** caja(): con valor, tarjeta blanca con el número; sin valor, hueco gris (y la solución en modo solución). */
  caja(x, y, w, h, val = null, fs = 22, sol = null) {
    if (val === null) {
      this.rrect(x, y, w, h, 7, { lw: 1.5, fill: 0.9, stroke: INK });
      if (this.solucion && sol !== null && sol !== undefined) {
        const f0 = Math.min(fs, h * 0.6), tw = this.ancho(String(sol), "PB", f0);
        this.solucionEn(x + w / 2, y + h / 2, sol, tw > w - 6 ? f0 * (w - 6) / tw : f0);
      }
    } else {
      this.rrect(x, y, w, h, 7, { lw: 1.5, fill: 1, stroke: INK });
      const tw = this.ancho(String(val), "PB", fs), f2 = tw > w - 6 ? fs * (w - 6) / tw : fs;   // cuatro cifras en una caja de tres: la letra se reduce
      this.text(x + w / 2, y + h / 2 - f2 * 0.35, String(val), f2, { f: "PB", anchor: "middle" });
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
  /** Rejilla elástica: `filas` × cols que llenan la zona desde `top` (la mitad en media página); el alto de las tarjetas sale del sitio, no de filas fijas. */
  rejilla(top, cols, filas, GX = 10, GY = 10) {
    const cw = (W - 2 * M - (cols - 1) * GX) / cols, ch = (altoRejilla(this.parte, top) - (filas - 1) * GY) / filas, cel = [];
    for (let r = 0; r < filas; r++) for (let k = 0; k < cols; k++) cel.push([M + k * (cw + GX), top - (r + 1) * ch - r * GY]);
    return { cel, cw, ch };
  }
  /** _linea(): fila centrada de textos T() y huecos B() (B(w, h, sol) muestra sol en modo solución). */
  linea(x, y, w, h, items, gap = 8, ajustar = true) {
    const ws = items.map((it) => (it.t === "t" ? this.ancho(it.s, it.f, it.fs) : it.w));
    const total = ws.reduce((a, b) => a + b, 0) + gap * (items.length - 1);
    // Si no cabe en la tarjeta (4 cifras en 3.º), todo se reduce a la proporción justa (letra, cajas y huecos); si cabe, igual que siempre.
    const k0 = ajustar && total > w - 10 ? (w - 10) / total : 1;
    let cx = x + (w - total * k0) / 2;
    items.forEach((it, k) => {
      if (it.t === "t") this.text(cx, y + h / 2 - it.fs * k0 * 0.33, it.s, it.fs * k0, { f: it.f });
      else this.caja(cx, y + (h - it.h * k0) / 2, it.w * k0, it.h * k0, null, 20, it.sol);
      cx += (ws[k] + gap) * k0;
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
