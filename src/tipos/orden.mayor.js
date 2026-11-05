// orden.mayor · Mayor o menor: rodear el número mayor o el menor de cada pareja (port de _o_mayor() del motor).
// datos:    { a, b, pide: "mayor" | "menor" }
// solucion: { huecos: [], rodea: max(a, b) si pide "mayor", min(a, b) si pide "menor" }   (se rodea, no se escribe)
// Opciones: modo null (mezclado) | "mayor" | "menor"; cerca (si_no): números de la misma decena (desde rango 20).
// Completa: 15 parejas (5 filas × 3); media: 6. En «mezclado», mitad «mayor» y mitad «menor» (8+7 de 15; 3+3 de 6), en orden barajado.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { pares } from "./orden.signos.js";

const TXT = {
  mayor: "Rodea el número mayor de cada pareja.",
  menor: "Rodea el número menor de cada pareja.",
  mezcla: "Mira lo que pide cada casilla y rodea el número mayor o el menor.",
};

export default registrar({
  id: "orden.mayor",
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 10, cnt = tamano === "media" ? 6 : 15, modo = params.modo || "mezcla";
    const ps = pares(cnt, R, azar, !!params.cerca);
    let t = modo === "mayor" ? Array(cnt).fill("mayor") : modo === "menor" ? Array(cnt).fill("menor")
      : [...Array(Math.ceil(cnt / 2)).fill("mayor"), ...Array(Math.floor(cnt / 2)).fill("menor")];
    if (modo === "mezcla") t = azar.barajar(t);
    return {
      enunciado: TXT[modo],
      ejercicios: ps.map(([a, b], i) => ({
        datos: { a, b, pide: t[i] },
        solucion: { huecos: [], rodea: t[i] === "mayor" ? Math.max(a, b) : Math.min(a, b) },
      })),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 3, 5);
    const bw = 60, bh = 54, g = 16;
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { a, b, pide } = e.datos;
      p.marco(x, y, cw, ch, i, "RODEA EL " + pide.toUpperCase());
      const bx = x + (cw - 2 * bw - g) / 2;
      [a, b].forEach((v, j) => p.caja(bx + j * (bw + g), y + (ch - 26 - bh) / 2, bw, bh, v, 26));
    }));
  },
});
