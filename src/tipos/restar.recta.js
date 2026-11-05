// restar.recta · Resta en la recta numérica, saltando hacia atrás (port de _r_recta() del motor).
// datos:    { a, b, N }   (N = 10, 20 o 30: longitud de la recta; 2 ≤ b ≤ min(9, N − 2), b < a ≤ N)
// solucion: { huecos: [a − b] }
// Ficha: solo el punto de partida; el salto aparece en soluciones.
// Completa: 6 restas (una por fila); media: 3.
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, T, B, MENOS, INK, COLOR_SOLUCION } from "../render/papel.js";

/** Salto en la recta de xa a xb. En la ficha solo el punto de partida (el salto lo dibuja el alumno:
 *  dibujado daría la respuesta, decisión de Iván 5-11-2026); en soluciones, el salto en rojo (solo trazo). */
export function salto(p, xa, xb, y0, etiqueta) {
  p.circle(xa, y0, 3, { fill: INK, stroke: null });
  if (!p.solucion) return;
  p.path([["M", xa, y0 + 3], ["C", xa, y0 + 30, xb, y0 + 30, xb, y0 + 7]], { lw: 1.8, stroke: COLOR_SOLUCION });
  p.path([["M", xb - 4, y0 + 10], ["L", xb, y0 + 3], ["L", xb + 4, y0 + 10]], { lw: 1.8, stroke: COLOR_SOLUCION });
  p.text((xa + xb) / 2, y0 + 26, etiqueta, 9, { f: "PM", anchor: "middle" });
}

export default registrar({
  id: "restar.recta",
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 10, N = R <= 10 ? 10 : R <= 20 ? 20 : 30;
    const ejercicios = [];
    for (let i = 0; i < (tamano === "media" ? 3 : 6); i++) {
      const b = azar.entero(2, Math.min(9, N - 2)), a = azar.entero(b + 1, N);
      ejercicios.push({ datos: { a, b, N }, solucion: { huecos: [a - b] } });
    }
    return { enunciado: "Salta hacia atrás en la recta y escribe el resultado.", ejercicios };
  },
  dibujar(p, act) {
    const rows = 6, GY = 10, rh = (TOP - M - (rows - 1) * GY) / rows, L = W - 2 * M - 60;
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const { a, b, N } = e.datos, step = L / N, y = TOP - (i + 1) * rh - i * GY;
      p.marco(M, y, W - 2 * M, rh);
      p.linea(M, y + rh - 44, W - 2 * M, 36, [T(`${a} ${MENOS} ${b} =`, 19), B(54, 34, e.solucion.huecos[0])], 10);
      const x0 = M + 30, y0 = y + 28;
      p.line(x0 - 8, y0, x0 + L + 8, y0, { lw: 1.4 });
      for (let k = 0; k <= N; k++) {
        p.line(x0 + k * step, y0 - 4, x0 + k * step, y0 + 4, { lw: 1.2 });
        p.text(x0 + k * step, y0 - 14, String(k), 7.5, { f: "PM", anchor: "middle" });
      }
      salto(p, x0 + a * step, x0 + (a - b) * step, y0, `${MENOS}${b}`);
    }));
  },
});
