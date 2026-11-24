// estadistica.recuento · Cuenta y anota (port de _e_recuento() del motor). Solo página completa.
// datos:    { v: [nº de círculos, estrellas, cuadrados y triángulos, en ese orden; cada uno 2..mx],
//             items: [[figura, jx, jy]…] (todas las figuras mezcladas; jx, jy = desvío en fracción de la casilla) }
// solucion: { huecos: [v₀, v₁, v₂, v₃], elegir: [figura más abundante] }
// 3.º (lote 7; solo si se piden): `moda: true` (la pregunta final pasa a «¿Cuál es la moda?»: la figura más abundante, única porque los números son distintos) y
//   `w` = nº de figuras de la clase B, `items2` sus figuras (datos.v / items = clase A; `grupos: 2`): dos cuadros de figuras y una tabla con los palotes y el número de cada clase
//   (solucion.huecos: A₀, B₀, A₁, B₁… y luego las respuestas numéricas), y `preguntas` como en el pictograma (¿en qué clase hay más?, ¿cuántas más?, la moda o el total de cada clase).
// mx = min(rango, 9) hasta 20; 12 con rango 30.
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, T, B, INK } from "../render/papel.js";
import { NOMS, CLASES, TXT_MODA, datos4, figura, chips, cap, datosDos, preguntasDos, bloquePreguntas } from "./estadistica.pictograma.js";

const KINDS = [..."csqt"];

export default registrar({
  id: "estadistica.recuento",
  version: 1,
  generar(params, azar) {
    const R = params.rango ?? 10;
    if (R < 10) throw new Error("Este modelo necesita un rango máximo de al menos 10.");
    const mx = R <= 20 ? Math.min(R, 9) : 12, moda = params.moda === true;
    const dispersa = (v) => azar.barajar(KINDS.flatMap((k, j) => Array(v[j]).fill(k)))
      .map((k) => [k, Math.round((azar.real() * 0.4 - 0.2) * 1000) / 1000, Math.round((azar.real() * 0.3 - 0.15) * 1000) / 1000]);
    if (params.grupos === "dos") {   // 3.º: dos clases (de 2 a 9 figuras de cada clase; hasta 30 por clase)
      const [A, B] = datosDos(azar, 2, Math.min(mx, 9)), kinds = KINDS.slice();
      const r = preguntasDos(azar, kinds, A, B, { mas: (n) => `¿En qué clase hay más ${n}?`, cuantos: (n, x, y) => `¿Cuántos ${n} más hay en la ${x} que en la ${y}?`,
        total: (c) => `¿Cuántas figuras hay en total en la ${c}?` }, moda);
      const items = dispersa(A), items2 = dispersa(B);
      return {
        enunciado: "Haz palotes para contar las figuras de cada clase, escribe los números y contesta.",
        ejercicios: [{ datos: { v: A, w: B, grupos: 2, items, items2, preguntas: r.preguntas }, solucion: { huecos: [...A.flatMap((x, j) => [x, B[j]]), ...r.huecos], elegir: r.elegir } }],
      };
    }
    const v = datos4(azar, mx).map((x) => Math.max(2, x));
    const items = dispersa(v);
    return {
      enunciado: "Haz palotes para contar cada figura y escribe el número.",
      ejercicios: [{ datos: { v, items, ...(moda && { moda }) }, solucion: { huecos: v.slice(), elegir: [NOMS[KINDS[v.indexOf(Math.max(...v))]]] } }],
    };
  },
  dibujar(p, act) {
    const e = act.ejercicios[0], { v, w, items, items2, moda, preguntas } = e.datos, top = TOP;
    p.ejercicio(e.id, () => {
      if (w) {   // 3.º: dos clases
        const pw = (W - 2 * M - 10) / 2, ph = 200;
        [items, items2].forEach((its, g) => {
          const x0 = M + g * (pw + 10), cols = 6, rows = Math.ceil(its.length / cols), sx = (pw - 24) / cols, sy = (ph - 40) / Math.max(rows, 4);
          p.marco(x0, top - ph, pw, ph);
          p.text(x0 + 14, top - 22, CLASES[g], 13, { f: "PB" });
          its.forEach(([k, jx, jy], j) => figura(p, k, x0 + 12 + (j % cols + 0.5) * sx + jx * sx, top - 34 - (Math.floor(j / cols) + 0.5) * sy + jy * sy, Math.min(12, sy * 0.3)));
        });
        const t0 = top - ph - 12, rh = 40, nx = M + 112, gw = (W - 2 * M - 112) / 2;
        p.text(M + 12, t0 - 14, "Figura", 12, { f: "PB" });
        CLASES.forEach((c, g) => { p.text(nx + g * gw + 8, t0 - 14, c + ": recuento", 12, { f: "PB" }); p.text(nx + g * gw + gw - 62, t0 - 14, "Número", 12, { f: "PB" }); });
        KINDS.forEach((k, j) => {
          const y = t0 - 22 - (j + 1) * rh - j * 5;
          p.marco(M, y, W - 2 * M, rh);
          figura(p, k, M + 24, y + rh / 2, 10);
          p.text(M + 42, y + rh / 2 - 4, NOMS[k], 11, { f: "PM" });
          [0, 1].forEach((g) => {
            p.line(nx + g * gw, y + 6, nx + g * gw, y + rh - 6, { lw: 0.8, gris: 0.75 });
            p.caja(nx + g * gw + gw - 62, y + (rh - 32) / 2, 50, 32, null, 20, e.solucion.huecos[2 * j + g]);
          });
        });
        bloquePreguntas(p, preguntas, e.solucion, M, t0 - 22 - 4 * rh - 3 * 5 - 12, 8);
        return;
      }
      const ph = 330;
      p.marco(M, top - ph, W - 2 * M, ph);
      const cols = 8, rows = Math.ceil(items.length / cols), sx = (W - 2 * M - 40) / cols, sy = (ph - 30) / rows;
      items.forEach(([k, jx, jy], j) => {
        const r = Math.floor(j / cols), q = j % cols;
        figura(p, k, M + 20 + (q + 0.5) * sx + jx * sx, top - 15 - (r + 0.5) * sy + jy * sy, Math.min(13, sy * 0.28));
      });
      let t2 = top - ph - 12;
      const rh = (t2 - 22 - M - 74 - 3 * 6) / 4, hx = [M, M + 150, W - M - 110];
      ["Figura", "Recuento", "Número"].forEach((lab, k) => p.text(hx[k] + 12, t2 - 14, lab, 12, { f: "PB" }));
      t2 -= 22;
      KINDS.forEach((k, j) => {
        const y = t2 - (j + 1) * rh - j * 6;
        p.marco(M, y, W - 2 * M, rh);
        figura(p, k, M + 28, y + rh / 2, 11);
        p.text(M + 48, y + rh / 2 - 4, NOMS[k], 12, { f: "PM" });
        p.line(hx[1], y + 6, hx[1], y + rh - 6, { lw: 0.8, gris: 0.75 });
        p.line(hx[2], y + 6, hx[2], y + rh - 6, { lw: 0.8, gris: 0.75 });
        p.caja(hx[2] + 30, y + (rh - 36) / 2, 50, 36, null, 22, e.solucion.huecos[j]);
      });
      p.marco(M, M, W - 2 * M, 62);
      p.text(W / 2, M + 38, moda ? TXT_MODA : "¿De qué figura hay más?", 13, { f: "PM", anchor: "middle" });
      chips(p, W / 2, M + 8, KINDS.map((k) => NOMS[k]), 11, e.solucion.elegir[0]);
    });
  },
});
