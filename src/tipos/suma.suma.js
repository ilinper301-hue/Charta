// suma.suma · Suma y dibuja (port de filas_suma() y ficha_suma() del motor).
// datos:    { repA, a, repB, b, repRes, total }   a + b = total; cada cantidad se ve con su representación;
//           el resultado hay que dibujarlo con `repRes` (plantilla, si la tiene)
// solucion: { huecos: [a, b, total] }   a y b en los cuadritos grises; total, en la línea «Resultado:»
// Completa: 6 filas (una por representación del resultado); media: 3. Totales distintos, de 4 a mín(rango, máx. de repRes).
import { registrar } from "../nucleo/tipos.js";
import { M, W, H } from "../render/papel.js";
import { RANGOS } from "../rep/index.js";
import { NOMBRES } from "./combinada.combinada.js";

export const SUMA_30 = [["marco", "palotes", "recta", "regletas", "objetos", "domino"],
  ["dedos", "dado", "marco", "objetos", "domino", "regletas", "palotes", "letras", "recta"]];
export const SUMA_100 = [["abaco", "bloques", "cuadricula", "monedas", "du", "recta"],
  ["bloques", "monedas", "cuadricula", "letras", "recta", "atados", "regletas", "du", "abaco", "palotes"]];
const N = 6;   // filas de la ficha: una por representación de resultado

export default registrar({
  id: "suma.suma",
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 20, [res, pool] = R <= 30 ? SUMA_30 : SUMA_100, usadas = new Set(), filas = [];
    for (const rk of azar.barajar(res)) {
      const S = Math.min(R, RANGOS[rk][1]);
      for (let k = 0; k < 5000; k++) {
        const [ak, bk] = azar.muestra(pool.filter((q) => q !== rk), 2), T = azar.entero(Math.max(4, Math.floor(S / 3)), S);
        const lo = Math.max(RANGOS[ak][0], T - RANGOS[bk][1]), hi = Math.min(RANGOS[ak][1], T - RANGOS[bk][0]);
        if (lo > hi || usadas.has(T)) continue;
        const a = azar.entero(lo, hi);
        usadas.add(T); filas.push({ repA: ak, a, repB: bk, b: T - a, repRes: rk, total: T }); break;
      }
    }
    if (filas.length < N) throw new Error("Esta ficha necesita un rango máximo mayor.");
    return {
      enunciado: "Suma las dos cantidades, escribe el resultado y dibújalo como se indica.",
      ejercicios: filas.slice(0, tamano === "media" ? N / 2 : N).map((d) => ({ datos: d, solucion: { huecos: [d.a, d.b, d.total] } })),
    };
  },
  dibujar(p, act) {
    const R = act.params?.rango ?? 20, top = H - M - 72, GY = 10, SYM = 28, bw = (W - 2 * M - 2 * SYM) / 3, bh = (top - M - (N - 1) * GY) / N;
    act.ejercicios.forEach((e, r) => p.ejercicio(e.id, () => {
      const d = e.datos, y = top - (r + 1) * bh - r * GY, xs = [M, M + bw + SYM, M + 2 * (bw + SYM)];
      [[d.repA, d.a], [d.repB, d.b]].forEach(([rep, n], j) => {
        const x = xs[j];
        p.tarjeta(x, y, bw, bh);
        p.text(x + 12, y + bh - 17, NOMBRES[rep].toUpperCase(), 8.5, { f: "PM", gris: 0.3 });
        p.cuadrito(x, y, bw, bh, 28, e.solucion.huecos[j]);
        p.rep(rep, n, x + bw / 2, y + 8 + (bh - 8 - 36) / 2, { i: r * 2 + j, rango: R, escala: 0.82 });
      });
      const x = xs[2];
      p.tarjeta(x, y, bw, bh, 1.9);
      const t = "DIBUJA CON: " + NOMBRES[d.repRes].toUpperCase();
      let fs = 8.5; while (p.ancho(t, "PM", fs) > bw - 24) fs -= 0.1;
      p.text(x + bw / 2, y + bh - 17, t, fs, { f: "PM", anchor: "middle", gris: 0.3 });
      p.plantilla(d.repRes, d.total, x + bw / 2, y + 28 + (bh - 52) / 2, { i: r, rango: R, escala: 0.8 });
      p.text(x + 14, y + 11, "Resultado:", 9.5, { f: "PM" });
      const tw = p.ancho("Resultado:", "PM", 9.5);
      p.line(x + 14 + tw + 8, y + 11, x + bw - 14, y + 11, { lw: 1.2 });
      if (p.solucion) p.solucionEn((x + 14 + tw + 8 + x + bw - 14) / 2, y + 11 + 16 * 0.35 + 3, e.solucion.huecos[2], 16);
      p.text(xs[0] + bw + SYM / 2, y + bh / 2 - 9, "+", 26, { f: "PB", anchor: "middle" });
      p.text(xs[1] + bw + SYM / 2, y + bh / 2 - 9, "=", 26, { f: "PB", anchor: "middle" });
    }));
  },
});
