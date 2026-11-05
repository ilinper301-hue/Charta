// conteo.anterior · Anterior y posterior (port de _c_anterior() y _uniq() del motor).
// datos:    { n, patron }   patron = "hnh" (anterior y posterior), "hn" (solo anterior) o "nh" (solo posterior):
//           "n" = el número, "h" = hueco; las casillas van de izquierda a derecha.
// solucion: { huecos: [n − 1 y/o n + 1, de izquierda a derecha] }
// Opciones: modo null (ambos) | "anterior" | "posterior". Números: 1..R−1 (ambos), 1..R (anterior), 0..R−1 (posterior).
// Completa: 15 números (5 filas × 3), sin repetir si el rango da para tantos; media: 6 (2 filas).
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";

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
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 10, modo = params.modo || "ambos";
    const [lo, hi] = { ambos: [1, R - 1], anterior: [1, R], posterior: [0, R - 1] }[modo];
    const patron = { ambos: "hnh", anterior: "hn", posterior: "nh" }[modo];
    const nums = unicosEn(lo, hi, 15, azar).slice(0, tamano === "media" ? 6 : 15);
    return {
      enunciado: TEXTO[modo],
      ejercicios: nums.map((n) => ({
        datos: { n, patron },
        solucion: { huecos: [...patron].flatMap((t, j) => (t === "h" ? [j < patron.indexOf("n") ? n - 1 : n + 1] : [])) },
      })),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 3, 5, 10, 10), bw = 40, bh = 46, g = 7;
    act.ejercicios.forEach((e, idx) => p.ejercicio(e.id, () => {
      const [x, y] = cel[idx], { n, patron } = e.datos;
      p.marco(x, y, cw, ch, idx);
      const bx = x + (cw - (patron.length * bw + (patron.length - 1) * g)) / 2;
      let k = 0;
      [...patron].forEach((t, j) => p.caja(bx + j * (bw + g), y + (ch - 14 - bh) / 2, bw, bh, t === "n" ? n : null, 22, t === "n" ? null : e.solucion.huecos[k++]));
    }));
  },
});
