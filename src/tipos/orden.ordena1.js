// orden.ordena1 · Ordena de menor a mayor (port de _o_ordena() del motor). Con `tipoOrdena` lo reutiliza orden.ordena2.
// datos:    { valores: [n números distintos, desordenados], desc: false }      (n = opción «n», 3–5, por defecto 4)
// solucion: { huecos: [valores ordenados de menor a mayor] }   (con desc = true, de mayor a menor)
// Opciones: n (3–5); cerca (si_no): números de la misma decena (desde rango 20).
// Completa: 6 filas; media: 3.
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W } from "../render/papel.js";
import { grupo } from "./orden.signos.js";

export function tipoOrdena(id, desc) {
  return registrar({
    id,
    version: 1,
    generar(params, azar, { tamano }) {
      const R = params.rango ?? 10, n = Math.max(3, Math.min(5, params.n || 4)), cnt = tamano === "media" ? 3 : 6;
      const ejercicios = [];
      for (let i = 0; i < cnt; i++) {
        let gr = grupo(n, R, azar, !!params.cerca);
        const meta = gr.slice().sort((a, b) => desc ? b - a : a - b);
        while (gr.join() === meta.join()) gr = azar.barajar(gr);
        ejercicios.push({ datos: { valores: gr, desc }, solucion: { huecos: meta } });
      }
      return { enunciado: `Escribe los números ordenados de ${desc ? "mayor a menor" : "menor a mayor"} en los cuadros grises.`, ejercicios };
    },
    dibujar(p, act) {
      const rows = 6, GY = 10, rh = (TOP - M - (rows - 1) * GY) / rows, bw = 44, bh = 36, g = 16, lw = 132;
      act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
        const gr = e.datos.valores, n = gr.length, y = TOP - (i + 1) * rh - i * GY;
        p.marco(M, y, W - 2 * M, rh);
        const bx = M + 16 + lw + (W - 2 * M - 32 - lw - (n * bw + (n - 1) * g)) / 2;
        p.text(M + 16, y + rh - 14 - bh / 2 - 3, "Números", 10, { f: "PM", gris: 0.3 });
        p.text(M + 16, y + 14 + bh / 2 - 3, desc ? "De mayor a menor" : "De menor a mayor", 10, { f: "PM", gris: 0.3 });
        for (let j = 0; j < n; j++) {
          p.caja(bx + j * (bw + g), y + rh - 14 - bh, bw, bh, gr[j], 18);
          p.caja(bx + j * (bw + g), y + 14, bw, bh, null, 18, e.solucion.huecos[j]);
          if (j < n - 1) p.text(bx + j * (bw + g) + bw + g / 2, y + 14 + bh / 2 - 6, desc ? ">" : "<", 17, { f: "PB", anchor: "middle" });
        }
      }));
    },
  });
}

export default tipoOrdena("orden.ordena1", false);
