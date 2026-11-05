// sumar.recta · Suma en la recta numérica, saltando hacia delante (port de _s_recta() del motor).
// datos:    { a, b, N }   (N = 10, 20 o 30: longitud de la recta; 2 ≤ b ≤ min(9, N − 2), 1 ≤ a ≤ N − b)
// solucion: { huecos: [a + b] }
// Completa: 6 sumas (una por fila); media: 3.
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, T, B, INK } from "../render/papel.js";

export default registrar({
  id: "sumar.recta",
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 10, N = R <= 10 ? 10 : R <= 20 ? 20 : 30, ejercicios = [];
    for (let i = 0; i < (tamano === "media" ? 3 : 6); i++) {
      const b = azar.entero(2, Math.min(9, N - 2)), a = azar.entero(1, N - b);
      ejercicios.push({ datos: { a, b, N }, solucion: { huecos: [a + b] } });
    }
    return { enunciado: "Sigue el salto en la recta y escribe el resultado.", ejercicios };
  },
  dibujar(p, act) {
    const rows = 6, GY = 10, rh = (TOP - M - (rows - 1) * GY) / rows, L = W - 2 * M - 60;
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const { a, b, N } = e.datos, step = L / N, y = TOP - (i + 1) * rh - i * GY;
      p.marco(M, y, W - 2 * M, rh);
      p.linea(M, y + rh - 44, W - 2 * M, 36, [T(`${a} + ${b} =`, 19), B(54, 34, e.solucion.huecos[0])], 10);
      const x0 = M + 30, y0 = y + 28;
      p.line(x0 - 8, y0, x0 + L + 8, y0, { lw: 1.4 });
      for (let k = 0; k <= N; k++) {
        p.line(x0 + k * step, y0 - 4, x0 + k * step, y0 + 4, { lw: 1.2 });
        p.text(x0 + k * step, y0 - 14, String(k), 7.5, { f: "PM", anchor: "middle" });
      }
      const xa = x0 + a * step, xb = x0 + (a + b) * step;
      p.path([["M", xa, y0 + 3], ["C", xa, y0 + 30, xb, y0 + 30, xb, y0 + 7]], { lw: 1.8 });
      p.path([["M", xb, y0 + 2], ["L", xb - 4, y0 + 9], ["L", xb + 4, y0 + 9], ["Z"]], { fill: INK, stroke: null });
      p.circle(xa, y0, 3, { fill: INK, stroke: null });
      p.text((xa + xb) / 2, y0 + 26, `+${b}`, 9, { f: "PM", anchor: "middle" });
    }));
  },
});
