// restar.hueco · Restas con hueco (port de _r_hueco() del motor).
// datos:    { a, b, c, hueco: "a"|"b" }    (a − b = c; hueco "a": «☐ − b = c»; hueco "b": «a − ☐ = c»)
// solucion: { huecos: [a] } o { huecos: [b] }, según hueco
// Opción nivel como restar.r20 / restar.r100 (hasta 10 no hay llevadas). Pares de min(rango, 99).
// Completa: 24 (8 filas × 3); media: 12.
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B, MENOS } from "../render/papel.js";
import { paresResta } from "./restar.r10.js";

export default registrar({
  id: "restar.hueco",
  version: 1,
  generar(params, azar, { tamano }) {
    const ps = paresResta(Math.min(params.rango ?? 10, 99), params.nivel, tamano === "media" ? 12 : 24, azar);
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
    p.pintar(TOP, 3, 8, es.map(({ datos: { a, b, c, hueco }, solucion }) => hueco === "a"
      ? [B(44, 38, solucion.huecos[0]), T(`${MENOS} ${b} = ${c}`)]
      : [T(`${a} ${MENOS}`), B(44, 38, solucion.huecos[0]), T(`= ${c}`)]), es.map((e) => e.id));
  },
});
