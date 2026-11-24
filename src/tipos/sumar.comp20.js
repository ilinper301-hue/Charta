// sumar.comp20 · Completa hasta la decena siguiente (port de _s_comp20() del motor).
// datos:    { a, t, hueco: "medio" | "inicio" }   (a de dos cifras no múltiplo de 10; t = decena siguiente)
// solucion: { huecos: [t − a] }
// Rango 20, 30 o 100. «Más grandes»: 18 en completa (6 filas × 3) y 9 en media (sin repetidos); «Más ejercicios»: hasta 33 y 15 (con rango 20 solo hay 18 distintos).
import { registrar } from "../nucleo/tipos.js";
import { T, B } from "../render/papel.js";
import { MIN_OP, cuantos, pintarEl } from "./_elastica.js";

export default registrar({
  id: "sumar.comp20",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const cap = Math.min(params.rango ?? 20, 100), cs = [];
    for (let a = 11; a < cap; a++) if (a % 10) for (const hueco of ["medio", "inicio"]) cs.push({ a, hueco });
    const cnt = cuantos(ctx, 3, MIN_OP, [18, 9], cs.length);
    if (cs.length < cnt) throw new Error("Esta ficha necesita un rango máximo mayor.");
    return {
      enunciado: "Escribe el número que falta para llegar a la decena siguiente.",
      ejercicios: azar.muestra(cs, cnt).map(({ a, hueco }) => {
        const t = (Math.floor(a / 10) + 1) * 10;
        return { datos: { a, t, hueco }, solucion: { huecos: [t - a] } };
      }),
    };
  },
  dibujar(p, act) {
    const es = act.ejercicios;
    pintarEl(p, 3, es.map((e) => {
      const { a, t, hueco } = e.datos, s = e.solucion.huecos[0];
      return hueco === "medio" ? [T(`${a} +`), B(44, 38, s), T(`= ${t}`)] : [B(44, 38, s), T(`+ ${a} = ${t}`)];
    }), es.map((e) => e.id), 6);
  },
});
