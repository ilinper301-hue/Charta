// sumar.comp10 · Completa hasta 10 (port de _s_comp10() del motor).
// datos:    { a, hueco: "medio" | "inicio" }   («a + □ = 10» o «□ + a = 10»)
// solucion: { huecos: [10 − a] }
// Completa: 18 (los 9 valores de a × 2 formas, 6 filas × 3); media: 9 (sin repetidos).
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B } from "../render/papel.js";

export default registrar({
  id: "sumar.comp10",
  version: 1,
  generar(params, azar, { tamano }) {
    const todos = [];
    for (let a = 1; a < 10; a++) for (const hueco of ["medio", "inicio"]) todos.push({ a, hueco });
    return {
      enunciado: "Escribe el número que falta para llegar a 10.",
      ejercicios: azar.barajar(todos).slice(0, tamano === "media" ? 9 : 18).map((d) => ({ datos: d, solucion: { huecos: [10 - d.a] } })),
    };
  },
  dibujar(p, act) {
    const es = act.ejercicios;
    p.pintar(TOP, 3, 6, es.map((e) => {
      const { a, hueco } = e.datos, s = e.solucion.huecos[0];
      return hueco === "medio" ? [T(`${a} +`), B(44, 38, s), T("= 10")] : [B(44, 38, s), T(`+ ${a} = 10`)];
    }), es.map((e) => e.id));
  },
});
