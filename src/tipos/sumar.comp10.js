// sumar.comp10 · Completa hasta 10 (port de _s_comp10() del motor).
// datos:    { a, hueco: "medio" | "inicio" }   («a + □ = 10» o «□ + a = 10»)
// solucion: { huecos: [10 − a] }
// «Más grandes»: 18 en completa (los 9 valores de a × 2 formas, 6 filas × 3) y 9 en media (sin repetidos); «Más ejercicios»: 18 y 15 (no hay más de 18 distintos).
import { registrar } from "../nucleo/tipos.js";
import { T, B } from "../render/papel.js";
import { MIN_OP, cuantos, pintarEl } from "./_elastica.js";

export default registrar({
  id: "sumar.comp10",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const todos = [];
    for (let a = 1; a < 10; a++) for (const hueco of ["medio", "inicio"]) todos.push({ a, hueco });
    return {
      enunciado: "Escribe el número que falta para llegar a 10.",
      ejercicios: azar.barajar(todos).slice(0, cuantos(ctx, 3, MIN_OP, [18, 9], todos.length)).map((d) => ({ datos: d, solucion: { huecos: [10 - d.a] } })),
    };
  },
  dibujar(p, act) {
    const es = act.ejercicios;
    pintarEl(p, 3, es.map((e) => {
      const { a, hueco } = e.datos, s = e.solucion.huecos[0];
      return hueco === "medio" ? [T(`${a} +`), B(44, 38, s), T("= 10")] : [B(44, 38, s), T(`+ ${a} = 10`)];
    }), es.map((e) => e.id), 6);
  },
});
