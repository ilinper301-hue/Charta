// sumar.h100 · Sumas horizontales hasta 100 (port de _pares_suma(R, nivel) y _s_horiz() del motor).
// datos:    { a, b, op: "+" }
// solucion: { huecos: [a + b] }
// Opción nivel: null/"sin" (sin llevadas), "con" (con llevada), "mezcla" (mitad y mitad). Rango 30 o 100.
// Completa: 24 sumas (8 filas × 3); media: 12. Exporta paresSuma() para sumar.h10 y sumar.hueco.
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B } from "../render/papel.js";
import { pares } from "./sumar.h20.js";

/** _pares_suma(R, nivel, cnt): cnt pares [a, b] sin repetir, alternando los grupos del nivel. */
export function paresSuma(R, nivel, cnt, azar) {
  nivel = nivel || "sin";
  let grupos;
  if (R <= 10) {
    const g = []; for (let a = 1; a < 10; a++) for (let b = 1; b < 10; b++) if (a + b <= 10) g.push([a, b]);
    grupos = [g];
  } else if (R <= 20) {
    const sin = [], con = [];
    for (let a = 1; a < 20; a++) for (let b = 1; b < 20; b++) if (a + b <= 20 && !(a < 10 && b < 10 && a + b > 10)) sin.push([a, b]);
    for (let a = 2; a < 10; a++) for (let b = 2; b < 10; b++) if (a + b > 10) con.push([a, b]);
    grupos = { sin: [sin], con: [con], mezcla: [sin, con] }[nivel];
  } else {
    const cap = Math.min(R, 99), ten = []; for (let v = 10; v <= cap; v += 10) ten.push(v);
    const dd = [], du = [], uu = [], s = [], k = [];
    for (const a of ten) for (const b of ten) if (a + b <= cap) dd.push([a, b]);
    for (const a of ten) for (let b = 1; b < 10; b++) if (a + b <= cap) du.push([a, b]);
    for (const [a, b] of du.slice()) du.push([b, a]);
    for (let a = 11; a < cap; a++) if (a % 10) uu.push(a);
    for (const a of uu) for (let b = 1; b < 10; b++) if (a + b <= cap) (a % 10 + b < 10 ? s : k).push([a, b]);
    grupos = { sin: [dd, du, s], con: [k], mezcla: [dd, du, s, k] }[nivel];
  }
  return pares(grupos, cnt, azar);
}

/** Dibujo común de las sumas horizontales (_pintar 3 × 8). */
export function dibujarHoriz(p, act) {
  const es = act.ejercicios;
  p.pintar(TOP, 3, 8, es.map((e) => [T(`${e.datos.a} + ${e.datos.b} =`, 19), B(42, 38, e.solucion.huecos[0])]), es.map((e) => e.id));
}

export default registrar({
  id: "sumar.h100",
  version: 1,
  generar(params, azar, { tamano }) {
    const ps = paresSuma(params.rango ?? 30, params.nivel, tamano === "media" ? 12 : 24, azar);
    return {
      enunciado: "Calcula y escribe el resultado en el cuadro gris.",
      ejercicios: ps.map(([a, b]) => ({ datos: { a, b, op: "+" }, solucion: { huecos: [a + b] } })),
    };
  },
  dibujar: dibujarHoriz,
});
