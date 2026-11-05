// Charta · paso 2.2 · las 16 representaciones del número como SVG.
// Port fiel de motor/generador_fichas.py (líneas 1-475). Unidades = puntos PDF (1 unidad = 1 pt).
// Sin azar: todo depende de (n, i). Sin dependencias.
//
// Convención interna: se dibuja con el mismo sistema que ReportLab (y hacia ARRIBA, origen en el
// centro (cx, cy) = (0, 0) de la representación); al emitir se invierte y. Al final la caja [0,w]×[0,h]
// es simétrica respecto del centro y se traslada a su centro.

export const REPS = ["dedos", "dado", "domino", "marco", "palotes", "objetos", "regletas", "descomp",
  "letras", "recta", "bloques", "cuadricula", "monedas", "abaco", "du", "atados"];

/** Rango [mín, máx] de cada representación (columnas MIN, MAX de CAT). */
export const RANGOS = {
  dedos: [1, 10], dado: [1, 12], domino: [1, 12], marco: [1, 40], palotes: [1, 30], objetos: [1, 30],
  regletas: [1, 30], descomp: [2, 100], letras: [1, 100], recta: [1, 100], bloques: [1, 99],
  cuadricula: [1, 100], monedas: [1, 69], abaco: [1, 99], du: [1, 99], atados: [1, 69],
};
/** Representaciones con versión vacía "V(f)" y/o plantilla propia (columna TPL de CAT). */
export const VACIAS = ["dado", "domino", "marco", "recta", "cuadricula"];
export const PLANTILLAS = ["dado", "domino", "marco", "descomp", "letras", "recta", "cuadricula", "abaco", "du"];

const INK = "#1f1f1f", GRIS_CELDA = "#9e9e9e", GRIS_REJILLA = "#737373", BLANCO = "#ffffff";
const FUENTE = "Andika, Poppins, sans-serif";

// Anchuras de Andika (milésimas de em) para ajustar y centrar textos como ReportLab stringWidth.
const AB = {" ":269,"+":586,"0":605,"1":605,"2":605,"3":605,"4":605,"5":605,"6":605,"7":605,"8":605,"9":605,"a":613,"b":593,"c":499,"d":618,"e":542,"f":391,"g":579,"h":603,"i":312,"j":327,"k":556,"l":312,"m":859,"n":608,"o":566,"p":603,"q":591,"r":486,"s":505,"t":432,"u":608,"v":539,"w":767,"x":579,"y":537,"z":518,"á":613,"é":542,"í":315,"ó":566,"ú":608,"ñ":608,"=":586,"<":586,">":586,":":347,"−":586,"-":437,".":347,",":325,"¿":532,"?":532,"¡":381,"!":381,"A":725,"B":676,"C":676,"D":725,"E":592,"F":586,"G":719,"H":740,"I":510,"J":503,"K":698,"L":552,"M":906,"N":754,"O":732,"P":623,"Q":754,"R":674,"S":607,"T":618,"U":728,"V":715,"W":1042,"X":667,"Y":666,"Z":610,"Á":725,"É":592,"Í":510,"Ó":732,"Ú":728,"Ñ":754,"(":420,")":420,"/":527,"·":366,"€":605,"ü":608};
const AR = {" ":269,"+":586,"0":586,"1":586,"2":586,"3":586,"4":586,"5":586,"6":586,"7":586,"8":586,"9":586,"a":562,"b":564,"c":498,"d":581,"e":535,"f":366,"g":549,"h":574,"i":276,"j":291,"k":505,"l":276,"m":823,"n":579,"o":557,"p":571,"q":552,"r":435,"s":471,"t":408,"u":579,"v":522,"w":757,"x":530,"y":518,"z":508,"á":562,"é":535,"í":276,"ó":557,"ú":579,"ñ":579,"=":586,"<":586,">":586,":":312,"−":586,"-":420,".":312,",":317,"¿":513,"?":513,"¡":373,"!":373,"A":681,"B":627,"C":662,"D":701,"E":566,"F":562,"G":693,"H":720,"I":476,"J":471,"K":640,"L":527,"M":876,"N":732,"O":713,"P":583,"Q":720,"R":637,"S":574,"T":618,"U":703,"V":667,"W":1016,"X":647,"Y":645,"Z":601,"Á":681,"É":566,"Í":476,"Ó":713,"Ú":703,"Ñ":732,"(":388,")":388,"/":488,"·":332,"€":586,"ü":579};
/** Anchura de t en pt con Andika (como stringWidth de ReportLab). */
export function ancho(t, negrita, fs) {
  const T = negrita ? AB : AR;
  let s = 0;
  for (const ch of t) s += T[ch] ?? 560;
  return s * fs / 1000;
}

const f2 = (x) => { const v = Math.round(x * 100) / 100; return String(Object.is(v, -0) ? 0 : v); };
export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---------------------------------------------------------------- lienzo (equivale al canvas c)
class Lienzo {
  constructor() {
    this.o = []; this.m = [1, 0, 0, 1, 0, 0];
    this.x0 = Infinity; this.y0 = Infinity; this.x1 = -Infinity; this.y1 = -Infinity;
  }
  _pt(x, y, pad) {
    const [a, b, c, d, e, f] = this.m;
    const X = a * x + c * y + e, Y = b * x + d * y + f;
    const p = pad * Math.sqrt(Math.abs(a * d - b * c));
    this.x0 = Math.min(this.x0, X - p); this.x1 = Math.max(this.x1, X + p);
    this.y0 = Math.min(this.y0, Y - p); this.y1 = Math.max(this.y1, Y + p);
  }
  _caja(x, y, w, h, pad) { this._pt(x, y, pad); this._pt(x + w, y, pad); this._pt(x, y + h, pad); this._pt(x + w, y + h, pad); }
  _est(lw, fill, stroke) {
    return `fill="${fill || "none"}"` + (stroke ? ` stroke="${INK}" stroke-width="${f2(lw)}"` : "");
  }
  _cls(cls) { return cls ? ` class="${cls}"` : ""; }
  /** translate + scale + rotate (grados, antihorario como ReportLab) alrededor de un bloque */
  grupo(tx, ty, k, rot, fn) {
    const [a, b, c, d, e, f] = this.m, m0 = this.m;
    // T(tx,ty)·R(rot)·S(k) en y-arriba; SVG (y-abajo) lleva translate(tx,-ty) rotate(-rot) scale(k)
    const r = rot * Math.PI / 180, co = Math.cos(r) * k, si = Math.sin(r) * k;
    const A = a * co + c * si, B = b * co + d * si, C = -a * si + c * co, D = -b * si + d * co;
    this.m = [A, B, C, D, a * tx + c * ty + e, b * tx + d * ty + f];
    this.o.push(`<g transform="translate(${f2(tx)} ${f2(-ty)})${rot ? ` rotate(${f2(-rot)})` : ""}${k !== 1 ? ` scale(${f2(k)})` : ""}">`);
    fn();
    this.o.push("</g>");
    this.m = m0;
  }
  abrir(cls) { this.o.push(`<g${this._cls(cls)}>`); }
  cerrar() { this.o.push("</g>"); }
  line(x1, y1, x2, y2, lw, cls) {
    this._pt(x1, y1, lw / 2); this._pt(x2, y2, lw / 2);
    this.o.push(`<line${this._cls(cls)} x1="${f2(x1)}" y1="${f2(-y1)}" x2="${f2(x2)}" y2="${f2(-y2)}" stroke="${INK}" stroke-width="${f2(lw)}"/>`);
  }
  rect(x, y, w, h, o = {}) { this.rrect(x, y, w, h, 0, o); }
  rrect(x, y, w, h, r, { lw = 1, fill = null, stroke = true, cls } = {}) {
    this._caja(x, y, w, h, stroke ? lw / 2 : 0);
    this.o.push(`<rect${this._cls(cls)} x="${f2(x)}" y="${f2(-(y + h))}" width="${f2(w)}" height="${f2(h)}"` +
      (r ? ` rx="${f2(r)}"` : "") + ` ${this._est(lw, fill, stroke)}/>`);
  }
  circle(x, y, r, { lw = 1, fill = null, stroke = true, cls } = {}) {
    this._caja(x - r, y - r, 2 * r, 2 * r, stroke ? lw / 2 : 0);
    this.o.push(`<circle${this._cls(cls)} cx="${f2(x)}" cy="${f2(-y)}" r="${f2(r)}" ${this._est(lw, fill, stroke)}/>`);
  }
  poly(pts, { lw = 1, fill = null, stroke = true, cls } = {}) {
    for (const [x, y] of pts) this._pt(x, y, stroke ? lw / 2 : 0);
    this.o.push(`<polygon${this._cls(cls)} points="${pts.map(([x, y]) => `${f2(x)},${f2(-y)}`).join(" ")}" ${this._est(lw, fill, stroke)}/>`);
  }
  /** texto relleno INK; ancla: "middle" (drawCentredString), "start" (drawString), "end" (drawRightString) */
  text(x, y, t, fs, { negrita = false, anchor = "middle", cls } = {}) {
    const w = ancho(t, negrita, fs);
    const xa = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
    this._caja(xa, y - 0.22 * fs, w, 1.07 * fs, 0);
    this.o.push(`<text${this._cls(cls)} x="${f2(x)}" y="${f2(-y)}" text-anchor="${anchor}" font-family="${FUENTE}" font-size="${f2(fs)}"` +
      (negrita ? ` font-weight="bold"` : "") + ` fill="${INK}">${esc(t)}</text>`);
  }
  resultado() {
    const hx = Math.max(Math.abs(this.x0), Math.abs(this.x1)), hy = Math.max(Math.abs(this.y0), Math.abs(this.y1));
    const w = Math.ceil(2 * hx * 100) / 100, h = Math.ceil(2 * hy * 100) / 100;
    return { w, h, svg: `<g transform="translate(${f2(w / 2)} ${f2(h / 2)})" stroke-linecap="round" stroke-linejoin="round">${this.o.join("")}</g>` };
  }
}

// ---------------------------------------------------------------- utilidades
const PIPS = {
  0: [], 1: [[.5, .5]], 2: [[.27, .73], [.73, .27]], 3: [[.27, .73], [.5, .5], [.73, .27]],
  4: [[.27, .73], [.73, .73], [.27, .27], [.73, .27]],
  5: [[.27, .73], [.73, .73], [.5, .5], [.27, .27], [.73, .27]],
  6: [[.3, .76], [.3, .5], [.3, .24], [.7, .76], [.7, .5], [.7, .24]],
};
const pips = (c, n, x, y, s, r) => { for (const [px, py] of PIPS[n]) c.circle(x + px * s, y + py * s, r, { fill: INK, stroke: false, cls: "punto" }); };
const div = (a, b) => [Math.floor(a / b), ((a % b) + b) % b];

// ---------------------------------------------------------------- DEDOS
function mano(c, cx, cy, up, k = 0.8) {
  c.grupo(cx, cy, k, 0, () => {
    const lw = 1.6, fw = 11, gap = 3, palmW = 4 * fw + 3 * gap + 10, palmH = 30;
    const px = -palmW / 2, py = -34, heights = [30, 37, 33, 26];
    if (up.has(0)) c.grupo(px + 4, py + 9, 1, 32, () => c.rrect(-5.5, -3, 11, 30, 5.5, { lw, cls: "dedo" }));
    for (let j = 0; j < 4; j++) {
      const fx = px + 5 + j * (fw + gap), h = up.has(j + 1) ? heights[j] : 7;
      c.rrect(fx, py + palmH - 6, fw, h + 6, fw / 2, { lw, cls: up.has(j + 1) ? "dedo" : "dedo-bajo" });
    }
    c.rrect(px, py, palmW, palmH, 10, { lw, fill: BLANCO, cls: "palma" });
    if (!up.has(0)) c.grupo(px + palmW * 0.42, py + 11, 1, 8, () => c.rrect(-18, -5.5, 36, 11, 5.5, { lw, cls: "pulgar" }));
  });
}
function r_dedos(c, n) {
  const up = (k) => { const s = new Set(); if (k === 5) for (let j = 0; j < 5; j++) s.add(j); else for (let j = 1; j <= k; j++) s.add(j); return s; };
  if (n <= 5) mano(c, 0, 0, up(n), 1.12);
  else { mano(c, -41, 0, up(5), 0.86); mano(c, 43, 0, up(n - 5), 0.86); }
}

// ---------------------------------------------------------------- DADO
function die(c, cx, cy, n, s, vacio) {
  c.abrir("dado");
  c.rrect(cx - s / 2, cy - s / 2, s, s, s * 0.16, { lw: 1.8, cls: "cara" });
  if (!vacio) pips(c, n, cx - s / 2, cy - s / 2, s, s * 0.085);
  c.cerrar();
}
function r_dado(c, n, i, vacio) {
  if (n <= 6) die(c, 0, 0, n, 62, vacio);
  else {
    let a = Math.floor((n + 1) / 2), b = n - a;
    if ((i + n) % 2) [a, b] = [b, a];
    die(c, -34, 0, a, 54, vacio); die(c, 34, 0, b, 54, vacio);
  }
}

// ---------------------------------------------------------------- DOMINÓ
function splitDom(n, i) {
  const lo = Math.max(0, n - 6), hi = Math.min(6, n);
  let a = lo + ((i * 5 + n) % (hi - lo + 1)), b = n - a;
  if ((i + n) % 2) [a, b] = [b, a];
  return [a, b];
}
function r_domino(c, n, i, vacio) {
  const [a, b] = splitDom(n, i), w = 124, h = 62, x = -w / 2, y = -h / 2;
  c.rrect(x, y, w, h, 9, { lw: 1.8, cls: "ficha" });
  c.line(0, y + 6, 0, y + h - 6, 1.4, "division");
  if (!vacio) { pips(c, a, x + 1, y + 1, h - 2, 4.6); pips(c, b, 0 + 1, y + 1, h - 2, 4.6); }
}

// ---------------------------------------------------------------- MARCO DE DIEZ
function frame(c, x, y, cs, fillN, r) {
  const lw = 1.5, w = 5 * cs, h = 2 * cs;
  c.abrir("marco");
  c.rect(x, y, w, h, { lw });
  for (let j = 1; j < 5; j++) c.line(x + j * cs, y, x + j * cs, y + h, lw);
  c.line(x, y + cs, x + w, y + cs, lw);
  for (let k = 0; k < fillN; k++) {
    const [row, col] = div(k, 5);
    c.circle(x + col * cs + cs / 2, y + h - row * cs - cs / 2, r, { fill: INK, stroke: false, cls: "celda-llena" });
  }
  c.cerrar();
}
function r_marco(c, n, i, vacio) {
  const m = Math.max(1, Math.floor((n + 9) / 10)), cs = { 1: 24, 2: 18, 3: 14, 4: 14 }[m] ?? 14;
  const w = 5 * cs, h = 2 * cs, r = cs * 0.33;
  const f = (k) => vacio ? 0 : Math.min(10, Math.max(0, n - 10 * k));
  if (m === 1) frame(c, -w / 2, -h / 2, cs, f(0), r);
  else if (m === 2) {
    const gap = 9, top = (2 * h + gap) / 2;
    frame(c, -w / 2, top - h, cs, f(0), r);
    frame(c, -w / 2, top - 2 * h - gap, cs, f(1), r);
  } else {
    const gap = 8, wt = 2 * w + gap, top = (2 * h + gap) / 2;
    frame(c, -wt / 2, top - h, cs, f(0), r);
    frame(c, -wt / 2 + w + gap, top - h, cs, f(1), r);
    if (m === 3) frame(c, -w / 2, top - 2 * h - gap, cs, f(2), r);
    else {
      frame(c, -wt / 2, top - 2 * h - gap, cs, f(2), r);
      frame(c, -wt / 2 + w + gap, top - 2 * h - gap, cs, f(3), r);
    }
  }
}

// ---------------------------------------------------------------- PALOTES
function r_palotes(c, n) {
  const lw = 2.2, groups = Array(Math.floor(n / 5)).fill(5);
  if (n % 5) groups.push(n % 5);
  let rows, hh, sp, gap;
  if (groups.length <= 3) { rows = [groups]; hh = 42; sp = 10; gap = 16; }
  else { rows = [groups.slice(0, 3), groups.slice(3)]; hh = 28; sp = 9; gap = 14; }
  const nr = rows.length;
  rows.forEach((row, ri) => {
    const widths = row.map((g) => (Math.min(g, 4) - 1) * sp);
    const total = widths.reduce((a, b) => a + b, 0) + gap * (row.length - 1);
    let x = -total / 2;
    const yc = (nr - 1) * (hh + 10) / 2 - ri * (hh + 10);
    row.forEach((g, gi) => {
      const wd = widths[gi];
      for (let j = 0; j < Math.min(g, 4); j++) c.line(x + j * sp, yc - hh / 2, x + j * sp, yc + hh / 2, lw, "palote");
      if (g === 5) c.line(x - 5, yc - hh / 2 + 6, x + wd + 5, yc + hh / 2 - 6, lw, "tachado");
      x += wd + gap;
    });
  });
}

// ---------------------------------------------------------------- OBJETOS
function star(c, x, y, r, lw) {
  const pts = [];
  for (let j = 0; j < 10; j++) {
    const ang = Math.PI / 2 + j * Math.PI / 5, rr = j % 2 === 0 ? r : r * 0.42;
    pts.push([x + rr * Math.cos(ang), y + rr * Math.sin(ang)]);
  }
  c.poly(pts, { lw, cls: "objeto" });
}
function shape(c, kind, x, y, r, lw) {
  if (kind === "c") c.circle(x, y, r, { lw, cls: "objeto" });
  else if (kind === "s") star(c, x, y, r * 1.2, lw);
  else if (kind === "q") c.rect(x - r * 0.9, y - r * 0.9, r * 1.8, r * 1.8, { lw, cls: "objeto" });
  else c.poly([[x, y + r * 1.05], [x - r * 1.05, y - r * 0.8], [x + r * 1.05, y - r * 0.8]], { lw, cls: "objeto" });
}
function r_objetos(c, n, i) {
  const kind = "csqt"[i % 4];
  let cols = n <= 10 ? 5 : (n <= 18 ? 6 : 8);
  const rows = Math.ceil(n / cols);
  cols = Math.ceil(n / rows);
  const sp = Math.min(28, 150 / cols, 76 / rows), r = sp * 0.36, lw = sp > 14 ? 1.5 : 1.2;
  let k = 0;
  for (let ri = 0; ri < rows; ri++) {
    const cnt = Math.min(cols, n - k);
    for (let j = 0; j < cnt; j++) shape(c, kind, (j - (cnt - 1) / 2) * sp, ((rows - 1) / 2 - ri) * sp, r, lw);
    k += cnt;
  }
}

// ---------------------------------------------------------------- REGLETAS
function r_regletas(c, n) {
  const bars = n <= 10 ? [n] : Array(Math.floor(n / 10)).fill(10).concat(n % 10 ? [n % 10] : []);
  const u = n <= 10 ? 14 : 13, hh = 16, gap = 5, tot = bars.length * hh + (bars.length - 1) * gap;
  let y = tot / 2;
  for (const p of bars) {
    const x0 = n <= 10 ? -p * u / 2 : -5 * u;
    c.abrir("regleta");
    c.rect(x0, y - hh, p * u, hh, { lw: 1.8 });
    for (let j = 1; j < p; j++) c.line(x0 + j * u, y - hh, x0 + j * u, y, 0.7);
    c.cerrar();
    y -= hh + gap;
  }
}

// ---------------------------------------------------------------- DESCOMPOSICIÓN
function descompTxt(n, i) {
  if (n <= 10) { const a = (i * 3 + n) % (n - 1) + 1; return `${a} + ${n - a}`; }
  if (n % 10 === 0) return n === 20 ? "10 + 10" : `${n - 10} + 10`;
  return `${Math.floor(n / 10) * 10} + ${n % 10}`;
}
function r_descomp(c, n, i) {
  const t = descompTxt(n, i);
  let fs = 40;
  while (ancho(t, true, fs) > 140) fs -= 1;
  c.text(0, -fs * 0.33, t, fs, { negrita: true, cls: "descomp" });
}
function t_descomp(c) {
  c.text(0, -8, "+", 26, { negrita: true });
  c.line(-66, -12, -22, -12, 1.4);
  c.line(22, -12, 66, -12, 1.4);
}

// ---------------------------------------------------------------- LETRAS
const U = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez",
  "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho",
  "diecinueve", "veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro",
  "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve"];
const D = { 3: "treinta", 4: "cuarenta", 5: "cincuenta", 6: "sesenta", 7: "setenta", 8: "ochenta", 9: "noventa" };
export function nombreNumero(n) {
  if (n < 30) return U[n];
  if (n === 100) return "cien";
  const [d, u] = div(n, 10);
  return (D[d] ?? String(n)) + (u ? " y " + U[u] : "");
}
function r_letras(c, n) {
  const t = nombreNumero(n);
  let lineas = [t];
  if (t.length > 11 && t.includes(" y ")) { const p = t.split(" y "); lineas = [p[0], "y " + p[1]]; }
  let fs = 40;
  while (Math.max(...lineas.map((x) => ancho(x, true, fs))) > 138) fs -= 1;
  lineas.forEach((x, k) => c.text(0, -fs * 0.33 + (lineas.length - 1) * fs * 0.55 - k * fs * 1.1, x, fs, { negrita: true, cls: "letras" }));
}
function t_letras(c) { c.line(-66, -8, 66, -8, 1.4); }

// ---------------------------------------------------------------- RECTA
function r_recta(c, n, i, vacio, rango) {
  const lw = 1.6, maxn = rango > 30 ? 100 : 30, w = 144, step = w / maxn, x0 = -w / 2, y = -8;
  c.line(x0 - 6, y, x0 + w + 6, y, lw);
  for (const [sgn, xe] of [[-1, x0 - 6], [1, x0 + w + 6]])
    c.poly([[xe + sgn * 5, y], [xe, y + 3.5], [xe, y - 3.5]], { fill: INK, stroke: false });
  for (let k = 0; k <= maxn; k++) {
    let big, draw, lab;
    if (maxn === 30) { big = k % 5 === 0; draw = true; lab = big; }
    else { big = k % 10 === 0; draw = big; lab = k === 0 || k === 50 || k === 100; }
    if (draw) { const a = big ? 5.5 : 3; c.line(x0 + k * step, y - a, x0 + k * step, y + a, big ? 1.3 : 0.9, "marca"); }
    if (lab) c.text(x0 + k * step, y - 18, String(k), 8);
  }
  if (!vacio) {
    const mx = x0 + n * step;
    c.line(mx, y + 34, mx, y + 14, 2, "flecha");
    c.poly([[mx, y + 8], [mx - 6, y + 18], [mx + 6, y + 18]], { fill: INK, stroke: false, cls: "flecha" });
  }
}

// ---------------------------------------------------------------- BLOQUES BASE DIEZ
function _bloques(c, n) {
  const [d, u] = div(n, 10), bw = 11, ub = 6, bh = 10 * ub, gap = 5, cubo = 10, cg = 3, ucols = 3;
  const sep = d && u ? 24 : 0;
  const total = (d ? d * bw + (d - 1) * gap : 0) + sep + (u ? Math.min(u, ucols) * cubo + (Math.min(u, ucols) - 1) * cg : 0);
  let x = -total / 2;
  const y0 = -bh / 2;
  for (let q = 0; q < d; q++) {
    c.abrir("decena");
    c.rect(x, y0, bw, bh, { lw: 1.6 });
    for (let j = 1; j < 10; j++) c.line(x, y0 + j * ub, x + bw, y0 + j * ub, 0.6);
    c.cerrar();
    x += bw + gap;
  }
  if (d) x += sep - gap;
  for (let k = 0; k < u; k++) {
    const [r_, col] = div(k, ucols);
    c.rect(x + col * (cubo + cg), y0 + (cubo + cg) * r_, cubo, cubo, { lw: 1.6, cls: "unidad" });
  }
}
function r_bloques(c, n, i) {
  const [d, u] = div(n, 10);
  const total = (d ? d * 11 + (d - 1) * 5 : 0) + (d && u ? 24 : 0) + (u ? Math.min(u, 3) * 10 + (Math.min(u, 3) - 1) * 3 : 0);
  c.grupo(0, 0, Math.min(1.3, 150 / Math.max(total, 1)), 0, () => _bloques(c, n, i));
}

// ---------------------------------------------------------------- CUADRÍCULA
function r_cuadricula(c, n, i, vacio) {
  const cs = 7.6, w = 10 * cs, x0 = -w / 2, y0 = -w / 2;
  if (!vacio) for (let k = 0; k < n; k++) {
    const [row, col] = div(k, 10);
    c.rect(x0 + col * cs, y0 + w - (row + 1) * cs, cs, cs, { fill: GRIS_CELDA, stroke: false, cls: "celda-llena" });
  }
  c.abrir("rejilla");
  for (let j = 0; j < 11; j++) {
    c.lineGris(x0 + j * cs, y0, x0 + j * cs, y0 + w);
    c.lineGris(x0, y0 + j * cs, x0 + w, y0 + j * cs);
  }
  c.cerrar();
  c.rect(x0, y0, w, w, { lw: 1.6, cls: "borde" });
}
// línea fina gris de la rejilla (setStrokeGray(0.45), lw 0.5)
Lienzo.prototype.lineGris = function (x1, y1, x2, y2) {
  this._pt(x1, y1, 0.25); this._pt(x2, y2, 0.25);
  this.o.push(`<line x1="${f2(x1)}" y1="${f2(-y1)}" x2="${f2(x2)}" y2="${f2(-y2)}" stroke="${GRIS_REJILLA}" stroke-width="0.5"/>`);
};

// ---------------------------------------------------------------- MONEDAS
function _monedas(c, n) {
  const [d, u] = div(n, 10), R = 12, r = 7.8, gt = 5, cols = 3, gap = 18, lw = 1.6;
  const wt = d ? d * 2 * R + (d - 1) * gt : 0, nuc = Math.min(u, cols), wu = u ? nuc * 2 * r + (nuc - 1) * 4 : 0;
  const total = wt + (d && u ? gap : 0) + wu;
  let x = -total / 2;
  for (let q = 0; q < d; q++) {
    c.abrir("moneda-10");
    c.circle(x + R, 0, R, { lw });
    c.text(x + R, -4, "10", 11, { negrita: true });
    c.cerrar();
    x += 2 * R + gt;
  }
  if (d) x += gap - gt;
  const rows = u ? Math.ceil(u / cols) : 0;
  for (let k = 0; k < u; k++) {
    const [rr, cc] = div(k, cols), px = x + r + cc * (2 * r + 4), py = (rows - 1) * (r + 2) - rr * (2 * r + 4);
    c.abrir("moneda-1");
    c.circle(px, py, r, { lw });
    c.text(px, py - 3, "1", 8.5, { negrita: true });
    c.cerrar();
  }
}
function r_monedas(c, n, i) {
  const [d, u] = div(n, 10);
  const total = (d ? d * 24 + (d - 1) * 5 : 0) + (d && u ? 18 : 0) + (u ? Math.min(u, 3) * 15.6 + (Math.min(u, 3) - 1) * 4 : 0);
  c.grupo(0, 0, Math.min(1.3, 150 / Math.max(total, 1)), 0, () => _monedas(c, n, i));
}

// ---------------------------------------------------------------- ÁBACO
function abaco(c, d, u, cuentas = true) {
  const fw = 116, fh = 100, x = -fw / 2, y = -fh / 2;
  c.abrir("abaco");
  c.rrect(x, y, fw, fh, 8, { lw: 1.8, cls: "marco-abaco" });
  for (const [xr, k, lab] of [[-28, d, "D"], [28, u, "U"]]) {
    c.abrir("varilla");
    c.line(xr, y + 14, xr, y + fh - 5, 1.6);
    if (cuentas) for (let j = 0; j < k; j++) c.circle(xr, y + 14 + 4.4 + j * 8.8, 4.4, { lw: 1.6, fill: INK, cls: "cuenta" });
    c.text(xr, y + 4, lab, 8.5);
    c.cerrar();
  }
  c.cerrar();
}
function r_abaco(c, n) { const [d, u] = div(n, 10); c.grupo(0, 0, 0.7, 0, () => abaco(c, d, u)); }
function t_abaco(c) { c.grupo(0, 0, 0.7, 0, () => abaco(c, 0, 0, false)); }

// ---------------------------------------------------------------- DECENAS Y UNIDADES
function r_du(c, n) {
  const [d, u] = div(n, 10);
  [[d, d !== 1 ? "decenas" : "decena"], [u, u !== 1 ? "unidades" : "unidad"]].forEach(([num, txt], k) => {
    const yy = 14 - k * 32, wn = ancho(String(num), true, 28), wt = ancho(txt, false, 18);
    const x = -(wn + 8 + wt) / 2;
    c.text(x, yy - 9, String(num), 28, { negrita: true, anchor: "start", cls: "du-numero" });
    c.text(x + wn + 8, yy - 7, txt, 18, { anchor: "start", cls: "du-texto" });
  });
}
function t_du(c) {
  ["decenas", "unidades"].forEach((txt, k) => {
    const yy = 14 - k * 32, wt = ancho(txt, false, 16), lw = 34, x = -(lw + 8 + wt) / 2;
    c.line(x, yy - 6, x + lw, yy - 6, 1.4);
    c.text(x + lw + 8, yy - 6, txt, 16, { anchor: "start" });
  });
}

// ---------------------------------------------------------------- PALITOS Y ATADOS
function _atados(c, n) {
  const [d, u] = div(n, 10), sh = 46, sp = 2.7, bw = 9 * sp, gap = 10, looseSp = 6;
  const looseW = u ? (u - 1) * looseSp : 0, sep = d && u ? 20 : 0;
  const total = (d ? d * bw + (d - 1) * gap : 0) + sep + looseW;
  let x = -total / 2;
  const y0 = -sh / 2;
  for (let q = 0; q < d; q++) {
    c.abrir("atado");
    for (let j = 0; j < 10; j++) c.line(x + j * sp, y0, x + j * sp, y0 + sh, 1.0, "palito");
    c.rect(x - 2, y0 + sh * 0.4, bw + 4, 8, { lw: 1.6, fill: BLANCO, cls: "goma" });
    c.cerrar();
    x += bw + gap;
  }
  if (d) x += sep - gap;
  for (let k = 0; k < u; k++) c.line(x + k * looseSp, y0, x + k * looseSp, y0 + sh, 1.6, "palito-suelto");
}
function r_atados(c, n, i) {
  const [d, u] = div(n, 10);
  const total = (d ? d * 24.3 + (d - 1) * 10 : 0) + (d && u ? 20 : 0) + (u ? (u - 1) * 6 : 0);
  c.grupo(0, 0, Math.min(1.3, 150 / Math.max(total, 1)), 0, () => _atados(c, n, i));
}

// ---------------------------------------------------------------- API
const DIBUJO = {
  dedos: (c, n) => r_dedos(c, n), dado: r_dado, domino: r_domino, marco: r_marco, palotes: (c, n) => r_palotes(c, n),
  objetos: r_objetos, regletas: (c, n) => r_regletas(c, n), descomp: r_descomp, letras: (c, n) => r_letras(c, n),
  recta: r_recta, bloques: r_bloques, cuadricula: r_cuadricula, monedas: r_monedas, abaco: (c, n) => r_abaco(c, n),
  du: (c, n) => r_du(c, n), atados: r_atados,
};
const TPL = { descomp: t_descomp, letras: t_letras, abaco: t_abaco, du: t_du };

function comprobar(nombre) { if (!DIBUJO[nombre]) throw new Error(`Representación desconocida: ${nombre}`); }

/**
 * Representación del número n. `i` desambigua variantes (descomposición, dominó, objetos…).
 * `vacio` solo afecta a dado, domino, marco, recta y cuadricula.
 * `rango` (solo recta): 30 o 100 (en el motor es RANGO = R de la ficha); por defecto 30 si n ≤ 30, si no 100.
 */
export function rep(nombre, n, { i = 0, vacio = false, rango } = {}) {
  comprobar(nombre);
  const c = new Lienzo();
  DIBUJO[nombre](c, n, i, vacio, rango ?? (n <= 30 ? 30 : 100));
  return c.resultado();
}

/** Columna TPL de CAT: plantilla vacía para que el alumno dibuje; null si no hay. */
export function plantilla(nombre, n, { i = 0, rango } = {}) {
  comprobar(nombre);
  if (VACIAS.includes(nombre)) return rep(nombre, n, { i, vacio: true, rango });
  if (!TPL[nombre]) return null;
  const c = new Lienzo();
  TPL[nombre](c, n, i);
  return c.resultado();
}

/** SVG autónomo con un margen (en pt) alrededor de la caja. */
export function svgCompleto({ w, h, svg }, margen = 2) {
  const W = f2(w + 2 * margen), H = f2(h + 2 * margen);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${f2(-margen)} ${f2(-margen)} ${W} ${H}" width="${W}" height="${H}">${svg}</svg>`;
}
