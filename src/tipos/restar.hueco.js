// restar.hueco · Restas con hueco (port de _r_hueco() del motor).
// datos:    { a, b, c, hueco: "a"|"b" }    (a − b = c; hueco "a": «☐ − b = c»; hueco "b": «a − ☐ = c»)
// solucion: { huecos: [a] } o { huecos: [b] }, según hueco
// Opción nivel como restar.r20 / restar.r100 (hasta 10 no hay llevadas). Pares de min(rango, 99).
// «Más grandes»: 24 en completa (8 filas × 3) y 12 en media; «Más ejercicios»: 33 y 15 (rejilla elástica).
import { registrar } from "../nucleo/tipos.js";
import { T, B, MENOS } from "../render/papel.js";
import { parejasResta } from "./restar.r10.js";
import { pintarEl } from "./_elastica.js";

export default registrar({
  id: "restar.hueco",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const ps = parejasResta(ctx, ((R) => (R > 100 ? R : Math.min(R, 99)))(params.rango ?? 10), params.nivel, azar);
    return {
      enunciado: "Escribe el número que falta.",
      ejercicios: ps.map(([a, b]) => {
        const hueco = azar.real() < 0.5 ? "a" : "b";
        return { datos: { a, b, c: a - b, hueco }, solucion: { huecos: [hueco === "a" ? a : b] } };
      }),
    };
  },
  dibujar(p, act) {
    const es = act.ejercicios;
    pintarEl(p, 3, es.map(({ datos: { a, b, c, hueco }, solucion }) => hueco === "a"
      ? [B(44, 38, solucion.huecos[0]), T(`${MENOS} ${b} = ${c}`)]
      : [T(`${a} ${MENOS}`), B(44, 38, solucion.huecos[0]), T(`= ${c}`)]), es.map((e) => e.id), 8);
  },
});
