// restar.faltan · ¿Cuánto falta? (port de _r_faltan() del motor).
// datos:    { a, t }     (a < t = siguiente decena, o 10; t ≤ min(rango, 100); a no es decena si rango > 10)
// solucion: { huecos: [t − a] }
// Completa: 16 (8 filas × 2); media: 8. Sin repetidos mientras haya números distintos (hasta 10 solo hay 9, como el motor).
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B } from "../render/papel.js";

export default registrar({
  id: "restar.faltan",
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 10, cap = Math.min(R, 100), cnt = tamano === "media" ? 8 : 16, cand = [];
    for (let a = 1; a <= cap - 1; a++) {
      const t = R <= 10 ? 10 : R <= 20 ? (a < 10 ? 10 : 20) : (Math.floor(a / 10) + 1) * 10;
      if (a % 10 === 0 && R > 10) continue;
      if (t <= cap) cand.push([a, t]);
    }
    const vistos = new Set(), out = [];
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
    p.pintar(TOP, 2, 8, es.map((e) => [T(`De ${e.datos.a} a ${e.datos.t} faltan`, 16), B(44, 38, e.solucion.huecos[0])]), es.map((e) => e.id));
  },
});
