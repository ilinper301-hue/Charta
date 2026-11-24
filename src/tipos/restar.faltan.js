// restar.faltan · ¿Cuánto falta? (port de _r_faltan() del motor).
// datos:    { a, t }     (a < t = siguiente decena, o 10; t ≤ min(rango, 100); a no es decena si rango > 10)
// solucion: { huecos: [t − a] }
// «Más grandes»: 16 en completa (8 filas × 2) y 8 en media; «Más ejercicios»: 22 y 10 (rejilla elástica; con tope en los números distintos: hasta 10 solo hay 9). Sin repetidos mientras haya números distintos (como el motor).
import { registrar } from "../nucleo/tipos.js";
import { T, B } from "../render/papel.js";
import { MIN_OP, cuantos, pintarEl } from "./_elastica.js";

export default registrar({
  id: "restar.faltan",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const R = params.rango ?? 10, cap = Math.min(R, 100), cand = [];
    for (let a = 1; a <= cap - 1; a++) {
      const t = R <= 10 ? 10 : R <= 20 ? (a < 10 ? 10 : 20) : (Math.floor(a / 10) + 1) * 10;
      if (a % 10 === 0 && R > 10) continue;
      if (t <= cap) cand.push([a, t]);
    }
    const cnt = cuantos(ctx, 2, MIN_OP, [16, 8], cand.length), vistos = new Set(), out = [];
    while (out.length < cnt) {
      const lib = cand.filter(([a]) => !vistos.has(a)), e = azar.elegir(lib.length ? lib : cand);
      vistos.add(e[0]); out.push(e);
    }
    return {
      enunciado: "Escribe cuánto falta para llegar al número.",
      ejercicios: out.map(([a, t]) => ({ datos: { a, t }, solucion: { huecos: [t - a] } })),
    };
  },
  dibujar(p, act) {
    const es = act.ejercicios;
    pintarEl(p, 2, es.map((e) => [T(`De ${e.datos.a} a ${e.datos.t} faltan`, 16), B(44, 38, e.solucion.huecos[0])]), es.map((e) => e.id), 8);
  },
});
