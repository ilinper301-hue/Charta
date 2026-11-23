// conteo.falta · El número que falta (port de _c_falta() del motor).
// datos:    { a, huecos: [j…] }   fila de 5 números consecutivos a, a+1, …, a+4; huecos = posiciones vacías (ordenadas)
// solucion: { huecos: [a + j de cada hueco, de izquierda a derecha] }
// Opciones: huecos (1–3, por defecto 1). a: 1..máx(1, R − 4), sin repetir si el rango da para tantas filas.
// Cantidad: «Más grandes» = 16 filas (8 × 2) en completa y 8 en media; «Más ejercicios» = las filas de 2 que caben con tarjetas ≥ 60 pt (20 y 10). Rejilla elástica (p.rejilla).
import { registrar } from "../nucleo/tipos.js";
import { TOP, cuantosRejilla } from "../render/papel.js";
import { elegirHuecos } from "./conteo.series.js";
import { unicosEn } from "./conteo.anterior.js";

const L = 5, MIN_ALTO = 60;   // alto mínimo de tarjeta con «Más ejercicios»

export default registrar({
  id: "conteo.falta",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const R = params.rango ?? 10, h = Math.max(1, Math.min(3, params.huecos ?? 1));
    const cnt = cuantosRejilla(ctx, 2, MIN_ALTO, [16, 8]), as = unicosEn(1, Math.max(1, R - L + 1), Math.max(16, cnt), azar).slice(0, cnt);
    return {
      enunciado: "Escribe en cada cuadro gris el número que falta.",
      ejercicios: as.map((a) => {
        const huecos = elegirHuecos(L, h, azar);
        return { datos: { a, huecos }, solucion: { huecos: huecos.map((j) => a + j) } };
      }),
    };
  },
  dibujar(p, act) {
    const tres = act.params?.rango > 100, { cel, cw, ch } = p.rejilla(TOP, 2, Math.ceil(act.ejercicios.length / 2)), bw0 = tres ? 48 : 40, bh0 = 44, g0 = tres ? 4 : 7, fs0 = tres ? 20 : 22;   // 2.º: 3 cifras
    const s = Math.max(1, Math.min(1.4, (ch - 12) / bh0, (cw - 10) / (L * bw0 + (L - 1) * g0))), bw = bw0 * s, bh = bh0 * s, g = g0 * s, fs = fs0 * s;   // las cajas crecen con la tarjeta
    act.ejercicios.forEach((e, idx) => p.ejercicio(e.id, () => {
      const [x, y] = cel[idx], { a, huecos } = e.datos;
      p.marco(x, y, cw, ch);
      const bx = x + (cw - (L * bw + (L - 1) * g)) / 2;
      for (let j = 0; j < L; j++) {
        const k = huecos.indexOf(j);
        p.caja(bx + j * (bw + g), y + (ch - bh) / 2, bw, bh, k >= 0 ? null : a + j, fs, k >= 0 ? e.solucion.huecos[k] : null);
      }
    }));
  },
});
