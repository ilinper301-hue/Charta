// sumar.hueco · Sumas con hueco (port de _s_hueco() del motor).
// datos:    { a, b, falta: "a" | "b" }   (falta "a": «□ + b = t»; falta "b": «a + □ = t»)
// solucion: { huecos: [a] | [b] }
// Opción nivel (R > 10): null/"sin", "con", "mezcla". Rango máx. 99 efectivo.
// Completa: 24 (8 filas × 3); media: 12.
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B } from "../render/papel.js";
import { paresSuma } from "./sumar.h100.js";

export default registrar({
  id: "sumar.hueco",
  version: 1,
  generar(params, azar, { tamano }) {
    const ps = paresSuma(Math.min(params.rango ?? 10, 99), params.nivel, tamano === "media" ? 12 : 24, azar);
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
    p.pintar(TOP, 3, 8, es.map((e) => {
      const { a, b, falta } = e.datos, t = a + b, s = e.solucion.huecos[0];
      return falta === "a" ? [B(44, 38, s), T(`+ ${b} = ${t}`)] : [T(`${a} +`), B(44, 38, s), T(`= ${t}`)];
    }), es.map((e) => e.id));
  },
});
