// geometria.lados · Lados y vértices (2.º, lote 4): polígonos dibujados; el alumno cuenta lados y vértices.
// datos:    { forma: "triangulo"|"cuadrado"|"rectangulo"|"pentagono"|"hexagono", pts: [[x, y]…] (vértices en unidades −1…1, y hacia arriba) }
// solucion: { huecos: [lados, vértices] }  (los dos iguales: el polígono tiene tantos lados como vértices)
// Sin opciones. Completa: 8 polígonos (2 × 4), recorriendo las 5 clases; media: 4. Cada vértice lleva un punto para contarlos.
// Cantidad (rejilla elástica de 2 columnas): «Más grandes» = 8 y 4 (tarjetas que llenan el panel); «Más ejercicios» = las filas que caben con tarjetas ≥ 124 pt (10 y 4; el polígono se reduce con la tarjeta, nunca los cuadros ni la letra).
import { registrar } from "../nucleo/tipos.js";
import { TOP, INK, cuantosRejilla } from "../render/papel.js";
import { poli, ciclo } from "./geometria.dibujo.js";

export const FORMAS = ["triangulo", "cuadrado", "rectangulo", "pentagono", "hexagono"];
export const LADOS = { triangulo: 3, cuadrado: 4, rectangulo: 4, pentagono: 5, hexagono: 6 };
export const NOMBRES = { triangulo: "triángulo", cuadrado: "cuadrado", rectangulo: "rectángulo", pentagono: "pentágono", hexagono: "hexágono" };
const TRIANGULOS = [[[-.8, -.6], [.8, -.6], [0, .8]], [[-.8, -.6], [.8, -.6], [-.8, .8]], [[-.9, -.5], [.7, -.5], [.3, .8]], [[-.7, .6], [.8, .6], [0, -.8]]];
const r3 = (v) => Math.round(v * 1000) / 1000;

/** Vértices de la forma (en orden), ya girados cuando la forma lo permite. */
function vertices(forma, azar) {
  if (forma === "triangulo") return azar.elegir(TRIANGULOS);
  if (forma === "cuadrado") return [[-.7, -.7], [.7, -.7], [.7, .7], [-.7, .7]];
  if (forma === "rectangulo") { const [w, h] = azar.elegir([[.9, .55], [.55, .9]]); return [[-w, -h], [w, -h], [w, h], [-w, h]]; }
  const n = LADOS[forma], giro = azar.entero(0, 359) * Math.PI / 180;
  return Array.from({ length: n }, (_, k) => [r3(.85 * Math.cos(giro + 2 * Math.PI * k / n)), r3(.85 * Math.sin(giro + 2 * Math.PI * k / n))]);
}

export default registrar({
  id: "geometria.lados",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const cnt = cuantosRejilla(ctx, 2, 124, [8, 4]);
    return {
      enunciado: "Cuenta los lados y los vértices (los puntos) de cada figura.",
      ejercicios: ciclo(FORMAS, cnt, azar).map((forma) => ({ datos: { forma, pts: vertices(forma, azar) }, solucion: { huecos: [LADOS[forma], LADOS[forma]] } })),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.rejilla(TOP, 2, Math.ceil(act.ejercicios.length / 2));
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], s = Math.min(cw * 0.2, ch * 0.34), cx = x + cw * 0.3, cy = y + ch * 0.46;
      p.marco(x, y, cw, ch, i);
      const pts = e.datos.pts.map(([a, b]) => [cx + a * s, cy + b * s]);
      poli(p, pts, { cerrar: true, lw: 2 });
      for (const [a, b] of pts) p.circle(a, b, 3, { lw: 1, fill: INK });
      const bx = x + cw - 126;
      [["lados", 0], ["vértices", 1]].forEach(([t, k]) => {
        const by = y + ch * 0.56 - k * 52;
        p.text(bx, by + 12, t, 12.5, { f: "PM" });
        p.caja(bx + 70, by, 44, 38, null, 22, e.solucion.huecos[k]);
      });
    }));
  },
});
