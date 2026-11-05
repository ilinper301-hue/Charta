// estadistica.pictograma · El pictograma (port de _e_pictograma() del motor). Solo página completa.
// datos:    { dos, kinds: ["c"|"s"|"q"|"t" × 4, orden de las filas], v: [votos × 4],
//             preguntas: [{ tp: "b" (número) | "c" (elegir figura), txt }] }
//           dos = true: cada dibujo vale 2 votos (v son pares).
// solucion: { huecos: [respuestas numéricas de las preguntas «b», en orden], elegir: [figura elegida en cada pregunta «c»] }
// Exporta los ayudantes comunes de la familia: NOMS, datos4, figura, chips.
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, T, B, INK, COLOR_SOLUCION } from "../render/papel.js";

export const NOMS = { c: "círculos", s: "estrellas", q: "cuadrados", t: "triángulos" };
export const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** _datos(): k valores distintos entre 1 y mx. */
export function datos4(azar, mx, k = 4) {
  for (let i = 0; i < 500; i++) {
    const v = Array.from({ length: k }, () => azar.entero(1, mx));
    if (new Set(v).size === k) return v;
  }
  return azar.muestra(Array.from({ length: mx }, (_, i) => i + 1), k);
}

/** shape() del motor: círculo, estrella, cuadrado o triángulo centrados en (x, y). */
export function figura(p, kind, x, y, r, { lw = 1.6, gris = INK } = {}) {
  const o = { lw, stroke: gris };
  if (kind === "c") p.circle(x, y, r, o);
  else if (kind === "s") {
    const R = r * 1.2, pts = [];
    for (let j = 0; j < 10; j++) {
      const ang = Math.PI / 2 + (j * Math.PI) / 5, rr = j % 2 === 0 ? R : R * 0.42;
      pts.push([x + rr * Math.cos(ang), y + rr * Math.sin(ang)]);
    }
    p.path([["M", ...pts[0]], ...pts.slice(1).map((q) => ["L", ...q]), ["Z"]], o);
  } else if (kind === "q") p.rrect(x - r * 0.9, y - r * 0.9, r * 1.8, r * 1.8, 0, o);
  else p.path([["M", x, y + r * 1.05], ["L", x - r * 1.05, y - r * 0.8], ["L", x + r * 1.05, y - r * 0.8], ["Z"]], o);
}

/** _chips(): fila de opciones para rodear; `marca` (en modo solución) rodea la correcta en rojo. */
export function chips(p, cx, y, opts, fs = 10.5, marca = null, h = 22, gap = 6) {
  const ws = opts.map((o) => p.ancho(o, "PM", fs) + 16);
  let x = cx - (ws.reduce((a, b) => a + b, 0) + gap * (opts.length - 1)) / 2;
  opts.forEach((o, k) => {
    const ok = p.solucion && marca === o;
    p.rrect(x, y, ws[k], h, 9, ok ? { lw: 2.4, fill: 1, stroke: COLOR_SOLUCION } : { lw: 0.8, fill: 1, stroke: 0.8 });
    p.text(x + ws[k] / 2, y + h / 2 - fs * 0.33, o, fs, { f: "PM", anchor: "middle" });
    x += ws[k] + gap;
  });
}

export default registrar({
  id: "estadistica.pictograma",
  version: 1,
  generar(params, azar) {
    const dos = params.modo === "dos", mx = Math.min(params.rango ?? 10, 10);
    if (mx < 10) throw new Error("Este modelo necesita un rango máximo de al menos 10.");
    const kinds = azar.barajar([..."csqt"]);
    const v = dos ? datos4(azar, mx >> 1).map((x) => 2 * x) : datos4(azar, mx);
    const [i, o] = azar.muestra([0, 1, 2, 3], 2), [a, b] = v[i] > v[o] ? [i, o] : [o, i];
    const nom = (j) => NOMS[kinds[j]];
    const qs = [
      { tp: "b", txt: `¿Cuántos votos tienen los ${nom(i)}?`, ans: v[i] },
      { tp: "b", txt: `¿Cuántos votos tienen los ${nom(o)}?`, ans: v[o] },
      { tp: "c", txt: "¿Qué figura tiene más votos?", ans: nom(v.indexOf(Math.max(...v))) },
      { tp: "c", txt: "¿Qué figura tiene menos votos?", ans: nom(v.indexOf(Math.min(...v))) },
      { tp: "b", txt: `¿Cuántos votos más tienen los ${nom(a)} que los ${nom(b)}?`, ans: v[a] - v[b] },
    ];
    if (v.reduce((s, x) => s + x, 0) <= Math.max(mx, 20)) qs.push({ tp: "b", txt: "¿Cuántos votos hay en total?", ans: v.reduce((s, x) => s + x, 0) });
    return {
      enunciado: dos ? "Mira el pictograma (cada punto vale 2 votos) y contesta." : "Mira el pictograma y contesta las preguntas.",
      ejercicios: [{
        datos: { dos, kinds, v, preguntas: qs.map(({ tp, txt }) => ({ tp, txt })) },
        solucion: { huecos: qs.filter((q) => q.tp === "b").map((q) => q.ans), elegir: qs.filter((q) => q.tp === "c").map((q) => q.ans) },
      }],
    };
  },
  dibujar(p, act) {
    const e = act.ejercicios[0], { dos, kinds, v, preguntas } = e.datos, top = TOP;
    p.ejercicio(e.id, () => {
      const ph = 250;
      p.marco(M, top - ph, W - 2 * M, ph);
      p.text(W / 2, top - 24, "Figuras favoritas de la clase", 13, { f: "PB", anchor: "middle" });
      if (dos) {
        p.text(W - M - 110, top - 24, "= 2 votos", 10, { f: "PM" });
        p.circle(W - M - 122, top - 20, 7, { fill: INK, stroke: null });
      }
      const rh = (ph - 44) / 4;
      kinds.forEach((k, j) => {
        const y = top - 40 - (j + 0.5) * rh;
        p.text(M + 18, y - 4, cap(NOMS[k]), 12, { f: "PM" });
        p.line(M + 112, y - rh / 2 + 2, W - M - 14, y - rh / 2 + 2, { lw: 0.8, gris: 0.75 });
        const ico = dos ? v[j] / 2 : v[j];
        for (let q = 0; q < ico; q++) {
          if (dos) p.circle(M + 132 + q * 38, y, 11, { fill: INK, stroke: null });
          else figura(p, k, M + 132 + q * 38, y, 11);
        }
      });
      const nombres = kinds.map((k) => NOMS[k]), t2 = top - ph - 10, rh2 = (t2 - M - (preguntas.length - 1) * 8) / preguntas.length;
      let ib = 0, ic = 0;
      preguntas.forEach((q, j) => {
        const y = t2 - (j + 1) * rh2 - j * 8;
        p.marco(M, y, W - 2 * M, rh2);
        if (q.tp === "b") p.linea(M, y, W - 2 * M, rh2, [T(q.txt, 13, "PM"), B(50, 36, e.solucion.huecos[ib++])], 12);
        else {
          p.text(W / 2, y + rh2 - 26, q.txt, 13, { f: "PM", anchor: "middle" });
          chips(p, W / 2, y + 10, nombres, 11, e.solucion.elegir[ic++]);
        }
      });
    });
  },
});
