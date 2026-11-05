// estadistica.recuento · Cuenta y anota (port de _e_recuento() del motor). Solo página completa.
// datos:    { v: [nº de círculos, estrellas, cuadrados y triángulos, en ese orden; cada uno 2..mx],
//             items: [[figura, jx, jy]…] (todas las figuras mezcladas; jx, jy = desvío en fracción de la casilla) }
// solucion: { huecos: [v₀, v₁, v₂, v₃], elegir: [figura más abundante] }
// mx = min(rango, 9) hasta 20; 12 con rango 30.
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, T, B, INK } from "../render/papel.js";
import { NOMS, datos4, figura, chips, cap } from "./estadistica.pictograma.js";

const KINDS = [..."csqt"];

export default registrar({
  id: "estadistica.recuento",
  version: 1,
  generar(params, azar) {
    const R = params.rango ?? 10;
    if (R < 10) throw new Error("Este modelo necesita un rango máximo de al menos 10.");
    const mx = R <= 20 ? Math.min(R, 9) : 12;
    const v = datos4(azar, mx).map((x) => Math.max(2, x));
    const items = azar.barajar(KINDS.flatMap((k, j) => Array(v[j]).fill(k)))
      .map((k) => [k, Math.round((azar.real() * 0.4 - 0.2) * 1000) / 1000, Math.round((azar.real() * 0.3 - 0.15) * 1000) / 1000]);
    return {
      enunciado: "Haz palotes para contar cada figura y escribe el número.",
      ejercicios: [{ datos: { v, items }, solucion: { huecos: v.slice(), elegir: [NOMS[KINDS[v.indexOf(Math.max(...v))]]] } }],
    };
  },
  dibujar(p, act) {
    const e = act.ejercicios[0], { v, items } = e.datos, top = TOP;
    p.ejercicio(e.id, () => {
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
      p.text(W / 2, M + 38, "¿De qué figura hay más?", 13, { f: "PM", anchor: "middle" });
      chips(p, W / 2, M + 8, KINDS.map((k) => NOMS[k]), 11, e.solucion.elegir[0]);
    });
  },
});
