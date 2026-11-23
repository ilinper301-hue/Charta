// conteo.anterior · Anterior y posterior (port de _c_anterior() y _uniq() del motor).
// datos:    { n, patron }   patron = "hnh" (anterior y posterior), "hn" (solo anterior) o "nh" (solo posterior):
//           "n" = el número, "h" = hueco; las casillas van de izquierda a derecha.
// solucion: { huecos: [n − 1 y/o n + 1, de izquierda a derecha] }
// Opciones: modo null (ambos) | "anterior" | "posterior". Números: 1..R−1 (ambos), 1..R (anterior), 0..R−1 (posterior).
// Cantidad: «Más grandes» = 15 números (5 filas × 3) en completa y 6 en media, sin repetir si el rango da para tantos; «Más ejercicios» = las filas de 3 que caben con tarjetas ≥ 86 pt (21 y 9). Rejilla elástica (p.rejilla).
import { registrar } from "../nucleo/tipos.js";
import { TOP, cuantosRejilla } from "../render/papel.js";

const MIN_ALTO = 86;   // alto mínimo de tarjeta con «Más ejercicios»

/** _uniq(lo, hi, k): k números distintos de lo..hi barajados; si no caben, se completa con repetidos al azar. */
export function unicosEn(lo, hi, k, azar) {
  const span = []; for (let v = lo; v <= hi; v++) span.push(v);
  const out = azar.barajar(span).slice(0, k);
  while (out.length < k) out.push(azar.entero(lo, hi));
  return out;
}

const TEXTO = {
  ambos: "Escribe el número anterior y el posterior de cada número.",
  anterior: "Escribe el número anterior de cada número.",
  posterior: "Escribe el número posterior de cada número.",
};

export default registrar({
  id: "conteo.anterior",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const R = params.rango ?? 10, modo = params.modo || "ambos";
    const [lo, hi] = { ambos: [1, R - 1], anterior: [1, R], posterior: [0, R - 1] }[modo];
    const patron = { ambos: "hnh", anterior: "hn", posterior: "nh" }[modo];
    const cnt = cuantosRejilla(ctx, 3, MIN_ALTO, [15, 6]), nums = unicosEn(lo, hi, Math.max(15, cnt), azar).slice(0, cnt);
    return {
      enunciado: TEXTO[modo],
      ejercicios: nums.map((n) => ({
        datos: { n, patron },
        solucion: { huecos: [...patron].flatMap((t, j) => (t === "h" ? [j < patron.indexOf("n") ? n - 1 : n + 1] : [])) },
      })),
    };
  },
  dibujar(p, act) {
    const tres = act.params?.rango > 100, { cel, cw, ch } = p.rejilla(TOP, 3, Math.ceil(act.ejercicios.length / 3)), bw0 = tres ? 50 : 40, bh0 = 46, g0 = tres ? 5 : 7, fs0 = tres ? 20 : 22;   // 2.º: 3 cifras
    act.ejercicios.forEach((e, idx) => p.ejercicio(e.id, () => {
      const [x, y] = cel[idx], { n, patron } = e.datos, L = patron.length;
      p.marco(x, y, cw, ch, idx);
      const s = Math.max(1, Math.min(1.4, (ch - 14) * 0.5 / bh0, (cw - 8) / (L * bw0 + (L - 1) * g0))), bw = bw0 * s, bh = bh0 * s, g = g0 * s, fs = fs0 * s;   // las cajas crecen con la tarjeta
      const bx = x + (cw - (L * bw + (L - 1) * g)) / 2;
      let k = 0;
      [...patron].forEach((t, j) => p.caja(bx + j * (bw + g), y + (ch - 14 - bh) / 2, bw, bh, t === "n" ? n : null, fs, t === "n" ? null : e.solucion.huecos[k++]));
    }));
  },
});
