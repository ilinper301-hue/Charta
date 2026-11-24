// estadistica.pictograma · El pictograma (port de _e_pictograma() del motor). Solo página completa.
// datos:    { dos, kinds: ["c"|"s"|"q"|"t" × 4, orden de las filas], v: [votos × 4],
//             preguntas: [{ tp: "b" (número) | "c" (elegir figura), txt }] }
//           dos = true: cada dibujo vale 2 votos (v son pares).
// solucion: { huecos: [respuestas numéricas de las preguntas «b», en orden], elegir: [figura elegida en cada pregunta «c»] }
//           3.º (lote 7; solo si se piden, para no cambiar 1.º/2.º): `moda: true` (la pregunta «¿Qué figura tiene más votos?» pasa a «¿Cuál es la moda?»: la figura
//           con más votos, única porque los votos son distintos) y `w` = votos de la clase B (datos.v = clase A; `grupos: 2`): dos pictogramas apilados y
//           `preguntas` con `op` (opciones de las de elegir): ¿en qué clase hay más?, ¿cuántos más?, y la moda de cada clase (con moda) o el total de cada clase.
//           En dos clases, cada serie tiene votos distintos y los de A y B difieren columna a columna.
// Exporta los ayudantes comunes de la familia: NOMS, datos4, figura, chips (y, para 3.º: CLASES, TXT_MODA, datosDos, preguntasDos, bloquePreguntas).
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

export const CLASES = ["Clase A", "Clase B"];
export const TXT_MODA = "¿Cuál es la moda? (la figura que más se repite)";

/** 3.º: dos series de 4 valores entre lo y hi (clases A y B); en cada una, todos distintos (la moda es única) y distintos de la otra serie columna a columna. */
export function datosDos(azar, lo, hi) {
  const rango = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
  for (let i = 0; i < 500; i++) {
    const A = azar.muestra(rango, 4), B = azar.muestra(rango, 4);
    if (A.every((x, j) => x !== B[j])) return [A, B];
  }
  const A = azar.muestra(rango, 4);
  return [A, [A[1], A[2], A[3], A[0]]];
}

/** 3.º: las preguntas de dos clases. `t` = {mas(nom), cuantos(nom, x, y), total(clase)} con los textos de cada tipo. Devuelve { preguntas: [{tp, txt, op?}], huecos, elegir } (huecos: las numéricas, elegir: las de rodear, en orden). */
export function preguntasDos(azar, kinds, A, B, t, moda) {
  const nom = (j) => NOMS[kinds[j]], gana = (j) => (A[j] > B[j] ? 0 : 1);
  const i = azar.entero(0, 3), j = azar.elegir([0, 1, 2, 3].filter((x) => x !== i)), [x, y] = gana(j) === 0 ? [0, 1] : [1, 0];
  const qs = [
    { tp: "c", txt: t.mas(nom(i)), op: CLASES, ans: CLASES[gana(i)] },
    { tp: "b", txt: t.cuantos(nom(j), "clase " + CLASES[x].slice(-1), CLASES[y].slice(-1)), ans: Math.abs(A[j] - B[j]) },
  ];
  [A, B].forEach((S, k) => {
    if (moda) qs.push({ tp: "c", txt: `¿Cuál es la moda de la clase ${CLASES[k].slice(-1)}?`, op: kinds.map((q) => NOMS[q]), ans: nom(S.indexOf(Math.max(...S))) });
    else qs.push({ tp: "b", txt: t.total("clase " + CLASES[k].slice(-1)), ans: S.reduce((s, q) => s + q, 0) });
  });
  return { preguntas: qs.map(({ tp, txt, op }) => ({ tp, txt, ...(op && { op }) })), huecos: qs.filter((q) => q.tp === "b").map((q) => q.ans), elegir: qs.filter((q) => q.tp === "c").map((q) => q.ans) };
}

/** 3.º: tarjetas de preguntas apiladas entre y0 (abajo) e y1 (arriba): las numéricas con su casilla, las de elegir con su fila de opciones (`op`). `hu0`: nº de huecos ya usados antes. */
export function bloquePreguntas(p, preguntas, sol, y0, y1, hu0 = 0, gap = 8) {
  const n = preguntas.length, rh = Math.min(84, (y1 - y0 - (n - 1) * gap) / n);
  let ib = hu0, ic = 0;
  preguntas.forEach((q, j) => {
    const y = y1 - (j + 1) * rh - j * gap;
    p.marco(M, y, W - 2 * M, rh);
    if (q.tp === "b") p.linea(M, y, W - 2 * M, rh, [T(q.txt, 13, "PM"), B(50, 34, sol.huecos[ib++])], 12);
    else {
      p.text(W / 2, y + rh - 26, q.txt, 13, { f: "PM", anchor: "middle" });
      chips(p, W / 2, y + Math.min(12, (rh - 26) / 2), q.op, 11, sol.elegir[ic++]);
    }
  });
}

export default registrar({
  id: "estadistica.pictograma",
  version: 1,
  generar(params, azar) {
    const dos = params.modo === "dos", mx = Math.min(params.rango ?? 10, 10), moda = params.moda === true, grupos = params.grupos === "dos";
    if (mx < 10) throw new Error("Este modelo necesita un rango máximo de al menos 10.");
    const kinds = azar.barajar([..."csqt"]);
    if (grupos) {   // 3.º: dos clases
      const [A, B] = datosDos(azar, 1, dos ? mx >> 1 : mx).map((S) => (dos ? S.map((x) => 2 * x) : S));
      const r = preguntasDos(azar, kinds, A, B, { mas: (n) => `¿En qué clase hay más votos de ${n}?`, cuantos: (n, x, y) => `¿Cuántos votos más de ${n} hay en la ${x} que en la ${y}?`,
        total: (c) => `¿Cuántos votos hay en total en la ${c}?` }, moda);
      return {
        enunciado: dos ? "Mira los pictogramas (cada punto vale 2 votos) y contesta." : "Mira los dos pictogramas y contesta las preguntas.",
        ejercicios: [{ datos: { dos, kinds, v: A, w: B, grupos: 2, preguntas: r.preguntas }, solucion: { huecos: r.huecos, elegir: r.elegir } }],
      };
    }
    const v = dos ? datos4(azar, mx >> 1).map((x) => 2 * x) : datos4(azar, mx);
    const [i, o] = azar.muestra([0, 1, 2, 3], 2), [a, b] = v[i] > v[o] ? [i, o] : [o, i];
    const nom = (j) => NOMS[kinds[j]];
    const qs = [
      { tp: "b", txt: `¿Cuántos votos tienen los ${nom(i)}?`, ans: v[i] },
      { tp: "b", txt: `¿Cuántos votos tienen los ${nom(o)}?`, ans: v[o] },
      { tp: "c", txt: moda ? TXT_MODA : "¿Qué figura tiene más votos?", ans: nom(v.indexOf(Math.max(...v))) },
      { tp: "c", txt: "¿Qué figura tiene menos votos?", ans: nom(v.indexOf(Math.min(...v))) },
      { tp: "b", txt: `¿Cuántos votos más tienen los ${nom(a)} que los ${nom(b)}?`, ans: v[a] - v[b] },
    ];
    if (v.reduce((s, x) => s + x, 0) <= Math.max(mx, 20)) qs.push({ tp: "b", txt: "¿Cuántos votos hay en total?", ans: v.reduce((s, x) => s + x, 0) });
    return {
      enunciado: dos ? "Mira el pictograma (cada punto vale 2 votos) y contesta." : "Mira el pictograma y contesta las preguntas.",
      ejercicios: [{
        datos: { dos, kinds, v, ...(moda && { moda }), preguntas: qs.map(({ tp, txt }) => ({ tp, txt })) },
        solucion: { huecos: qs.filter((q) => q.tp === "b").map((q) => q.ans), elegir: qs.filter((q) => q.tp === "c").map((q) => q.ans) },
      }],
    };
  },
  dibujar(p, act) {
    const e = act.ejercicios[0], { dos, kinds, v, w, preguntas } = e.datos, top = TOP;
    p.ejercicio(e.id, () => {
      if (w) {   // 3.º: dos clases, un pictograma sobre otro
        const bh = 134;
        [v, w].forEach((vals, g) => {
          const y0 = top - (g + 1) * bh - g * 10, rh = (bh - 34) / 4;
          p.marco(M, y0, W - 2 * M, bh);
          p.text(M + 14, y0 + bh - 22, CLASES[g], 13, { f: "PB" });
          if (dos) { p.circle(W - M - 122, y0 + bh - 18, 7, { fill: INK, stroke: null }); p.text(W - M - 110, y0 + bh - 24, "= 2 votos", 10.5, { f: "PM" }); }
          kinds.forEach((k, j) => {
            const y = y0 + bh - 34 - (j + 0.5) * rh;
            p.text(M + 18, y - 4, cap(NOMS[k]), 12, { f: "PM" });
            p.line(M + 112, y - rh / 2, W - M - 14, y - rh / 2, { lw: 0.8, gris: 0.75 });
            for (let q = 0; q < (dos ? vals[j] / 2 : vals[j]); q++) {
              if (dos) p.circle(M + 132 + q * 38, y, 9, { fill: INK, stroke: null });
              else figura(p, k, M + 132 + q * 38, y, 9);
            }
          });
        });
        bloquePreguntas(p, preguntas, e.solucion, M, top - 2 * bh - 20);
        return;
      }
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
