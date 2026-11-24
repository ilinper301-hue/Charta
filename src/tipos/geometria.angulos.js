// geometria.angulos · Los ángulos (3.º, lote 7, bloque 9; solo curso 3, sin rango).
// datos:    { clase: "agudo"|"recto"|"obtuso", ang: grados (agudo 30–70, recto 90, obtuso 110–160; de 5 en 5), giro: dirección del primer lado en grados (0–355, de 5 en 5),
//             l1, l2: largo de cada lado (0.85–1 del máximo), opciones: ["agudo", "recto", "obtuso"] }
// solucion: { huecos: [], correcta: clase }   (se rodea la clase; en la solución, en rojo)
// Los tres tipos llevan el mismo arco pequeño y ninguna marca de ángulo recto: se comprueba con la escuadra, sin transportador.
// Ningún agudo pasa de 70° ni ningún obtuso baja de 110° (nada dudoso). La orientación se sortea sin que el ángulo se salga de la tarjeta.
// Rejilla elástica de 2 columnas con «Cantidad»: «Más grandes» = 12 y 6; «Más ejercicios» = las filas que caben con tarjetas ≥ 84 pt.
import { registrar } from "../nucleo/tipos.js";
import { TOP, cuantosRejilla } from "../render/papel.js";
import { arco, ciclo, chips } from "./geometria.dibujo.js";

export const CLASES_ANG = ["agudo", "recto", "obtuso"];
const MIN_ALTO = 84;
const R = Math.PI / 180;

/** Extremos de los lados para largos 1 (unidades) y la caja que ocupa (con el vértice en el origen). */
export function puntos(giro, ang, l1, l2) {
  const a = [l1 * Math.cos(giro * R), l1 * Math.sin(giro * R)], b = [l2 * Math.cos((giro + ang) * R), l2 * Math.sin((giro + ang) * R)];
  const xs = [0, a[0], b[0]], ys = [0, a[1], b[1]];
  return { a, b, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

export default registrar({
  id: "geometria.angulos",
  version: 1,
  cantidad: true,
  generar(params, azar, ctx) {
    const cnt = cuantosRejilla(ctx, 2, MIN_ALTO, [12, 6]);
    return {
      enunciado: "Mira cada ángulo y rodea si es recto, agudo u obtuso.\nPuedes comprobarlo con la escuadra.",
      ejercicios: ciclo(CLASES_ANG, cnt, azar).map((clase) => {
        const ang = clase === "recto" ? 90 : clase === "agudo" ? 5 * azar.entero(6, 14) : 5 * azar.entero(22, 32);
        const l1 = Math.round((0.85 + azar.real() * 0.15) * 100) / 100, l2 = Math.round((0.85 + azar.real() * 0.15) * 100) / 100;
        let giro = 5 * azar.entero(0, 71);
        for (let i = 0; i < 300; i++) {   // que quepa: nada más alto que 1.5 ni más ancho que 1.9 largos
          const q = puntos(giro, ang, l1, l2);
          if (q.y1 - q.y0 <= 1.5 && q.x1 - q.x0 <= 1.9) break;
          giro = 5 * azar.entero(0, 71);
        }
        return { datos: { clase, ang, giro, l1, l2, opciones: CLASES_ANG }, solucion: { huecos: [], correcta: clase } };
      }),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.rejilla(TOP, 2, Math.ceil(act.ejercicios.length / 2));
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { ang, giro, l1, l2, opciones } = e.datos;
      p.marco(x, y, cw, ch, i);
      const q = puntos(giro, ang, l1, l2), dw = cw - 60, dh = ch - 46;
      const s = Math.min(48, dw / Math.max(q.x1 - q.x0, 0.01), dh / Math.max(q.y1 - q.y0, 0.01));
      const vx = x + cw / 2 - ((q.x0 + q.x1) / 2) * s, vy = y + 36 + dh / 2 - ((q.y0 + q.y1) / 2) * s;
      p.line(vx, vy, vx + q.a[0] * s, vy + q.a[1] * s, { lw: 2.2 });
      p.line(vx, vy, vx + q.b[0] * s, vy + q.b[1] * s, { lw: 2.2 });
      const r = Math.max(8, 0.27 * Math.min(l1, l2) * s);
      arco(p, vx - r, vy - r, vx + r, vy + r, giro, ang, { lw: 1.3 });
      chips(p, x + cw / 2, y + 10, opciones, 11, e.solucion.correcta);
    }));
  },
});
