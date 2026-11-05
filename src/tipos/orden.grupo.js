// orden.grupo · El mayor y el menor de cada grupo (port de _o_grupo() del motor).
// datos:    { valores: [n números distintos] }       (n = opción «n», 3–5, por defecto 4)
// solucion: { huecos: [mayor, menor] }
// Opciones: n (3–5); cerca (si_no): números de la misma decena (desde rango 20).
// Completa: 10 grupos (5 filas × 2); media: 4.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { grupo } from "./orden.signos.js";

export default registrar({
  id: "orden.grupo",
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 10, n = Math.max(3, Math.min(5, params.n || 4)), cnt = tamano === "media" ? 4 : 10;
    const ejercicios = [];
    for (let i = 0; i < cnt; i++) {
      const valores = grupo(n, R, azar, !!params.cerca);
      ejercicios.push({ datos: { valores }, solucion: { huecos: [Math.max(...valores), Math.min(...valores)] } });
    }
    return { enunciado: "Escribe el número mayor y el número menor de cada grupo.", ejercicios };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 2, 5);
    const bw = 40, bh = 38, g = 6;
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], gr = e.datos.valores, n = gr.length;
      p.marco(x, y, cw, ch, i);
      const bx = x + (cw - (n * bw + (n - 1) * g)) / 2;
      gr.forEach((v, j) => p.caja(bx + j * (bw + g), y + ch - 30 - bh, bw, bh, v, 18));
      const x0 = x + (cw - 212) / 2;
      ["Mayor", "Menor"].forEach((lab, j) => {
        p.text(x0 + j * 120, y + 26, lab, 10.5, { f: "PM" });
        p.caja(x0 + j * 120 + 50, y + 14, 42, 34, null, 22, e.solucion.huecos[j]);
      });
    }));
  },
});
