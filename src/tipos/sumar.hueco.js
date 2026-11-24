// sumar.hueco · Sumas con hueco (port de _s_hueco() del motor).
// datos:    { a, b, falta: "a" | "b" }   (falta "a": «□ + b = t»; falta "b": «a + □ = t»)
// solucion: { huecos: [a] | [b] }
// Opción nivel (R > 10): null/"sin", "con", "mezcla". Rango máx. 99 efectivo.
// «Más grandes»: 24 en completa (8 filas × 3) y 12 en media; «Más ejercicios»: 33 y 15 (rejilla elástica).
import { registrar } from "../nucleo/tipos.js";
import { T, B } from "../render/papel.js";
import { parejas } from "./sumar.h100.js";
import { pintarEl } from "./_elastica.js";

export default registrar({
  id: "sumar.hueco",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const ps = parejas(ctx, ((R) => (R > 100 ? R : Math.min(R, 99)))(params.rango ?? 10), params.nivel, azar);
    return {
      enunciado: "Escribe el número que falta.",
      ejercicios: ps.map(([a, b]) => {
        const falta = azar.entero(0, 1) === 0 ? "a" : "b";
        return { datos: { a, b, falta }, solucion: { huecos: [falta === "a" ? a : b] } };
      }),
    };
  },
  dibujar(p, act) {
    const es = act.ejercicios;
    pintarEl(p, 3, es.map((e) => {
      const { a, b, falta } = e.datos, t = a + b, s = e.solucion.huecos[0];
      return falta === "a" ? [B(44, 38, s), T(`+ ${b} = ${t}`)] : [T(`${a} +`), B(44, 38, s), T(`= ${t}`)];
    }), es.map((e) => e.id), 8);
  },
});
