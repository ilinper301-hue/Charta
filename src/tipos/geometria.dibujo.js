// Charta · ayudantes de dibujo y azar compartidos por los tipos «geometria.*» (port de _fig, _cuerpo, _chips, _tres y _ciclo del motor).
import { INK, COLOR_SOLUCION, color } from "../render/papel.js";

export const FIGS = ["circulo", "cuadrado", "rectangulo", "triangulo"];
export const NOMF = { circulo: "círculo", cuadrado: "cuadrado", rectangulo: "rectángulo", triangulo: "triángulo" };
export const CUERPOS = ["esfera", "cubo", "cilindro", "cono", "piramide"];
export const NOMC = { esfera: "esfera", cubo: "cubo", cilindro: "cilindro", cono: "cono", piramide: "pirámide" };
export const RUEDAN = ["esfera", "cilindro", "cono"];

const f2 = (x) => { const v = Math.round(x * 100) / 100; return String(Object.is(v, -0) ? 0 : v); };

/** _tres(): la correcta y 2 más del pool, barajadas. */
export function tres(pool, ok, azar) { return azar.barajar([ok, ...azar.muestra(pool.filter((q) => q !== ok), 2)]); }

/** _ciclo(): n elementos recorriendo la lista barajada una y otra vez, y vuelta a barajar. */
export function ciclo(lst, n, azar) {
  let out = [];
  while (out.length < n) out = out.concat(azar.barajar(lst));
  return azar.barajar(out.slice(0, n));
}

/** Elipse de ReportLab (esquinas x1,y1,x2,y2). */
export function elipse(p, x1, y1, x2, y2, lw = 1.8) {
  p.o.push(`<ellipse cx="${f2((x1 + x2) / 2)}" cy="${p.Y((y1 + y2) / 2)}" rx="${f2(Math.abs(x2 - x1) / 2)}" ry="${f2(Math.abs(y2 - y1) / 2)}" fill="none" stroke="${color(INK)}" stroke-width="${f2(lw)}"/>`);
}

/** arc() de ReportLab: arco de la elipse inscrita en (x1,y1,x2,y2), desde `ini` grados, `ext` grados en sentido antihorario. */
export function arco(p, x1, y1, x2, y2, ini, ext, { lw = 1.8, dash = null } = {}) {
  const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2, rx = Math.abs(x2 - x1) / 2, ry = Math.abs(y2 - y1) / 2, N = 36;
  let d = "";
  for (let k = 0; k <= N; k++) {
    const a = (ini + ext * k / N) * Math.PI / 180;
    d += (k ? "L" : "M") + f2(cx + rx * Math.cos(a)) + " " + p.Y(cy + ry * Math.sin(a));
  }
  p.o.push(`<path d="${d}" fill="none" stroke="${color(INK)}" stroke-width="${f2(lw)}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`);
}

/** Línea discontinua (setDash(a, b)). */
export function lineaDash(p, x1, y1, x2, y2, { lw = 1.1, dash = "2 2", gris = INK } = {}) {
  const g = Math.round(gris * 255).toString(16).padStart(2, "0");
  p.o.push(`<line x1="${f2(x1)}" y1="${p.Y(y1)}" x2="${f2(x2)}" y2="${p.Y(y2)}" stroke="#${g}${g}${g}" stroke-width="${f2(lw)}" stroke-dasharray="${dash}"/>`);
}

/** Polilínea abierta o cerrada. pts: [[x, y]…]. */
export function poli(p, pts, { cerrar = false, lw = 1.9, stroke = INK } = {}) {
  p.path([["M", ...pts[0]], ...pts.slice(1).map((q) => ["L", ...q]), ...(cerrar ? [["Z"]] : [])], { lw, stroke });
}

/** _fig(): figura plana de tamaño s centrada en (cx, cy); var cambia el rectángulo y el triángulo. */
export function fig(p, kind, cx, cy, s, v = 0) {
  if (kind === "circulo") p.circle(cx, cy, s * 0.5, { lw: 1.9 });
  else if (kind === "cuadrado") p.rrect(cx - s * 0.45, cy - s * 0.45, s * 0.9, s * 0.9, 0, { lw: 1.9 });
  else if (kind === "rectangulo") {
    const [w, h] = v % 2 === 0 ? [s * 1.3, s * 0.7] : [s * 0.7, s * 1.3];
    p.rrect(cx - w / 2, cy - h / 2, w, h, 0, { lw: 1.9 });
  } else {
    const pts = [[[-.55, -.45], [.55, -.45], [0, .5]], [[-.55, -.45], [.55, -.45], [-.55, .5]],
      [[-.55, .45], [.55, .45], [0, -.5]], [[-.5, -.45], [.6, -.45], [.2, .5]]][v % 4];
    poli(p, pts.map(([a, b]) => [cx + a * s, cy + b * s]), { cerrar: true, lw: 1.9 });
  }
}

/** _cuerpo(): cuerpo geométrico de tamaño s centrado en (cx, cy). */
export function cuerpo(p, kind, cx, cy, s) {
  const r = s / 2, L = 1.8, ln = (a, b, c, d, lw = L) => p.line(a, b, c, d, { lw });
  if (kind === "esfera") {
    p.circle(cx, cy, r, { lw: L });
    arco(p, cx - r, cy - r * 0.3, cx + r, cy + r * 0.3, 180, 180, { lw: 1.1 });
    arco(p, cx - r, cy - r * 0.3, cx + r, cy + r * 0.3, 0, 180, { lw: 1.1, dash: "2 2" });
  } else if (kind === "cubo") {
    const a = s * 0.7, d = s * 0.28, x0 = cx - (a + d) / 2, y0 = cy - (a + d) / 2;
    p.rrect(x0, y0, a, a, 0, { lw: L });
    poli(p, [[x0, y0 + a], [x0 + d, y0 + a + d], [x0 + a + d, y0 + a + d], [x0 + a, y0 + a]], { lw: L });
    ln(x0 + a, y0, x0 + a + d, y0 + d); ln(x0 + a + d, y0 + d, x0 + a + d, y0 + a + d);
  } else if (kind === "cilindro") {
    const w = s * 0.75, h = s * 0.8, e = w * 0.2, x0 = cx - w / 2, y0 = cy - h / 2;
    elipse(p, x0, y0 + h - e, x0 + w, y0 + h + e, L);
    arco(p, x0, y0 - e, x0 + w, y0 + e, 180, 180, { lw: L });
    ln(x0, y0, x0, y0 + h); ln(x0 + w, y0, x0 + w, y0 + h);
  } else if (kind === "cono") {
    const w = s * 0.8, h = s * 0.9, e = w * 0.2, x0 = cx - w / 2, y0 = cy - h / 2;
    arco(p, x0, y0 - e, x0 + w, y0 + e, 180, 180, { lw: L });
    arco(p, x0, y0 - e, x0 + w, y0 + e, 0, 180, { lw: 1.1, dash: "2 2" });
    ln(x0, y0, cx, y0 + h); ln(x0 + w, y0, cx, y0 + h);
  } else {
    const a = s * 0.75, d = s * 0.3, x0 = cx - (a + d) / 2, y0 = cy - s * 0.45, ap = [x0 + (a + d) / 2, y0 + s * 0.95];
    ln(x0, y0, x0 + a, y0); ln(x0 + a, y0, x0 + a + d, y0 + d);
    for (const q of [[x0, y0], [x0 + a, y0], [x0 + a + d, y0 + d]]) ln(q[0], q[1], ap[0], ap[1]);
    lineaDash(p, x0 + a + d, y0 + d, x0 + d, y0 + d); lineaDash(p, x0 + d, y0 + d, x0, y0); lineaDash(p, x0 + d, y0 + d, ap[0], ap[1]);
  }
}

/** _chips(): fila centrada de opciones redondeadas para rodear. Con `correcta`, en la hoja de soluciones se rodea en rojo. */
export function chips(p, cx, y, opts, fs = 10.5, correcta = null, h = 22, gap = 6) {
  const ws = opts.map((o) => p.ancho(o, "PM", fs) + 16);
  let x = cx - (ws.reduce((a, b) => a + b, 0) + gap * (opts.length - 1)) / 2;
  opts.forEach((o, i) => {
    p.rrect(x, y, ws[i], h, 8, { lw: 1.2 });
    p.text(x + ws[i] / 2, y + h / 2 - fs * 0.33, o, fs, { f: "PM", anchor: "middle" });
    if (p.solucion && o === correcta) p.rrect(x - 2, y - 2, ws[i] + 4, h + 4, 10, { lw: 2.2, stroke: COLOR_SOLUCION });
    x += ws[i] + gap;
  });
}

// ---- 3.º (lote 7): cuerpos con sus aristas ocultas (discontinuas) y un punto en cada vértice, para contar caras, aristas y vértices.
const caja3 = (w, h, dx, dy) => ({
  v: [[0, 0], [w, 0], [w, h], [0, h], [dx, dy], [w + dx, dy], [w + dx, h + dy], [dx, h + dy]],
  e: [[0, 1], [1, 2], [2, 3], [3, 0], [5, 6], [6, 7], [1, 5], [2, 6], [3, 7], [4, 0, 1], [4, 5, 1], [4, 7, 1]],
});
/** Cuerpos de caras planas en perspectiva (unidades; y hacia arriba). e: [vértice, vértice, 1 si está oculta]. */
export const GEOM_CUERPOS = {
  cubo: caja3(0.62, 0.62, 0.28, 0.28),
  prisma_rect: caja3(0.85, 0.45, 0.3, 0.28),
  prisma_tri: {
    v: [[0, 0], [0.7, 0], [0.35, 0.75], [0.3, 0.26], [1, 0.26], [0.65, 1.01]],
    e: [[0, 1], [1, 2], [2, 0], [1, 4], [2, 5], [4, 5], [0, 3, 1], [3, 4, 1], [3, 5, 1]],
  },
  piramide_cuad: {
    v: [[0, 0], [0.75, 0], [1.05, 0.3], [0.3, 0.3], [0.525, 0.95]],
    e: [[0, 1], [1, 2], [0, 4], [1, 4], [2, 4], [2, 3, 1], [3, 0, 1], [3, 4, 1]],
  },
  piramide_tri: {
    v: [[0, 0.15], [0.5, 0], [0.9, 0.3], [0.42, 0.85]],
    e: [[0, 1], [1, 2], [3, 0], [3, 1], [3, 2], [0, 2, 1]],
  },
};

/** Dibuja un cuerpo de GEOM_CUERPOS dentro de la caja (cx, cy, aw, ah) a la mayor escala que quepa (hasta smax pt por unidad). */
export function cuerpoElementos(p, kind, cx, cy, aw, ah, smax = 80) {
  const g = GEOM_CUERPOS[kind], xs = g.v.map((q) => q[0]), ys = g.v.map((q) => q[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), s = Math.min(smax, aw / (x1 - x0), ah / (y1 - y0));
  const P = ([a, b]) => [cx + (a - (x0 + x1) / 2) * s, cy + (b - (y0 + y1) / 2) * s];
  for (const [i, j, oc] of g.e) {
    const [a, b] = P(g.v[i]), [c, d] = P(g.v[j]);
    if (oc) lineaDash(p, a, b, c, d, { lw: 1.4, dash: "3 2.5" }); else p.line(a, b, c, d, { lw: 2 });
  }
  for (const q of g.v) { const [a, b] = P(q); p.circle(a, b, 2.5, { lw: 0.6, fill: INK }); }
}
