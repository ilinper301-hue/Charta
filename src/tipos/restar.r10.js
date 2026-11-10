// restar.r10 · Restas hasta 10 (port de _r_horiz(…, 10) y _pares_resta() del motor).
// datos:    { a, b, op: "−" }     (2 ≤ a ≤ 10, 1 ≤ b < a)
// solucion: { huecos: [a − b] }
// Completa: 24 restas (8 filas × 3); media: 12. Sin opción de llevadas (hasta 10 no hay).
// Exporta paresResta() para los demás tipos de la familia (r20, r100, hueco).
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B, MENOS } from "../render/papel.js";
import { pares } from "./sumar.h20.js";
import { paresResta3 } from "./_tres.js";

/** Grupos de pares (a, b) de _pares_resta(R, nivel) del motor. */
export function gruposResta(R, nivel) {
  nivel = nivel || "sin";
  const r = (lo, hi, st = 1) => { const o = []; for (let v = lo; v <= hi; v += st) o.push(v); return o; };
  const prod = (as, bs, f) => as.flatMap((a) => bs.map((b) => [a, b])).filter(([a, b]) => f(a, b));
  if (R <= 10) return [prod(r(2, 10), r(1, 9), (a, b) => b < a)];
  if (R <= 20) {
    const sin = prod(r(2, 20), r(1, 19), (a, b) => b < a && (a <= 10 || a - b >= 10));
    const con = prod(r(11, 19), r(2, 9), (a, b) => b < a && a - b < 10);
    con.lleva = true;   // pares(): no rellenar con otro tipo de grupo
    return { sin: [sin], con: [con], mezcla: [sin, con] }[nivel];
  }
  const cap = Math.min(R, 99), ten = r(10, cap, 10), uu = r(11, cap).filter((a) => a % 10);
  const dd = prod(ten, ten, (a, b) => b < a);
  const du = prod(uu, r(1, 9), (a, b) => b <= a % 10 && b < a);
  const dudu = uu.flatMap((a) => r(11, a - 1).filter((b) => b % 10 <= a % 10).map((b) => [a, b]));
  const con = prod(r(11, cap), r(2, 9), (a, b) => a % 10 < b);
  con.lleva = true;   // pares(): no rellenar con otro tipo de grupo
  return { sin: [dd, du, dudu], con: [con], mezcla: [dd, du, dudu, con] }[nivel];
}
export const paresResta = (R, nivel, cnt, azar) => (R > 100 ? paresResta3(R, nivel, cnt, azar) : pares(gruposResta(R, nivel), cnt, azar));   // 2.º: tres cifras

/** Tipo de restas horizontales hasta R fijo (R = null: usa params.rango). */
export function restasHoriz(id, Rfijo, minimo, titulo) {
  return registrar({
    id,
    version: 1,
    generar(params, azar, { tamano }) {
      const R = Rfijo ?? params.rango ?? minimo;
      if (R < minimo) throw new Error(`${titulo} necesita un rango máximo de al menos ${minimo}.`);
      const ps = paresResta(R, params.nivel, tamano === "media" ? 12 : 24, azar);
      return {
        enunciado: "Calcula y escribe el resultado en el cuadro gris.",
        ejercicios: ps.map(([a, b]) => ({ datos: { a, b, op: MENOS }, solucion: { huecos: [a - b] } })),
      };
    },
    dibujar(p, act) {
      const es = act.ejercicios;
      p.pintar(TOP, 3, 8, es.map((e) => [T(`${e.datos.a} ${MENOS} ${e.datos.b} =`, 19), B(42, 38, e.solucion.huecos[0])]), es.map((e) => e.id));
    },
  });
}

export default restasHoriz("restar.r10", 10, 10, "Restas hasta 10");
