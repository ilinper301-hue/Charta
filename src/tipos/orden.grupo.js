// orden.grupo · El mayor y el menor de cada grupo (port de _o_grupo() del motor).
// datos:    { valores: [n números distintos] }       (n = opción «n», 3–5, por defecto 4)
// solucion: { huecos: [mayor, menor] }
// Opciones: n (3–5); cerca (si_no): números de la misma decena (desde rango 20).
// Cantidad (opción de la ficha): «Más grandes» = 10 grupos en completa y 4 en media; «Más ejercicios» = las filas de 2 que caben con tarjetas ≥ 108 pt (12 y 6). Rejilla elástica (p.rejilla).
import { registrar } from "../nucleo/tipos.js";
import { TOP, cuantosRejilla } from "../render/papel.js";
import { grupo } from "./orden.signos.js";

const MIN_ALTO = 108;   // alto mínimo de tarjeta con «Más ejercicios»

export default registrar({
  id: "orden.grupo",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const R = params.rango ?? 10, n = Math.max(3, Math.min(5, params.n || 4)), cnt = cuantosRejilla(ctx, 2, MIN_ALTO, [10, 4]);
    const ejercicios = [];
    for (let i = 0; i < cnt; i++) {
      const valores = grupo(n, R, azar, !!params.cerca);
      ejercicios.push({ datos: { valores }, solucion: { huecos: [Math.max(...valores), Math.min(...valores)] } });
    }
    return { enunciado: "Escribe el número mayor y el número menor de cada grupo.", ejercicios };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.rejilla(TOP, 2, Math.ceil(act.ejercicios.length / 2));
    // Sitio bajo la etiqueta (30 pt): fila de números arriba y de huecos abajo; crecen con la tarjeta, sin bajar de lo de siempre (38 y 34 pt, letra 18 y 22).
    const R = ch - 30, bh = Math.min(54, Math.max(34, R * 0.46)), ah = Math.min(46, Math.max(30, R * 0.4)), hueco = (R - bh - ah) / 3;
    const bw = Math.max(40, bh * 40 / 38), g = 6, fs = Math.max(18, bh * 0.47), fa = Math.max(22, ah * 0.64);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], gr = e.datos.valores, n = gr.length;
      p.marco(x, y, cw, ch, i);
      const bw1 = Math.min(bw, (cw - 16 - (n - 1) * g) / n), bx = x + (cw - (n * bw1 + (n - 1) * g)) / 2;
      gr.forEach((v, j) => p.caja(bx + j * (bw1 + g), y + ch - 30 - hueco - bh, bw1, bh, v, fs));
      const x0 = x + (cw - 212) / 2, ay = y + hueco;
      ["Mayor", "Menor"].forEach((lab, j) => {
        p.text(x0 + j * 120, ay + ah / 2 - 3, lab, 10.5, { f: "PM" });
        p.caja(x0 + j * 120 + 50, ay, 42, ah, null, fa, e.solucion.huecos[j]);
      });
    }));
  },
});
