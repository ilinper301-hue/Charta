// sumar.encadenadas · Sumas de tres números (port de _s_enc() del motor).
// datos:    { x, y, z }   (x + y + z = t, con t entre max(5, cap/2) y cap; cap = 10 si rango ≤ 10, si no 20)
// solucion: { huecos: [x + y + z] }
// 2.º (rango ≥ 100): datos { x, y, z[, w] } — x, una decena (o centena, salto 100) hasta el rango; los demás, saltos de
//   10–90 (o 100–900); suma ≤ rango. Opción sumandos: 3 | 4 (w). Sin repetidos.
// «Más grandes»: 16 en completa (8 filas × 2) y 8 en media; «Más ejercicios»: 22 y 10 (tarjetas ≥ 54 pt, rejilla elástica). Tríos distintos.
import { registrar } from "../nucleo/tipos.js";
import { T, B } from "../render/papel.js";
import { MIN_OP, cuantos, pintarEl } from "./_elastica.js";

export const FIJO = [16, 8];

/** 2.º: primer número = múltiplo de u (10 o 100) hasta el rango; los demás, de 1u a 9u; resultado entre u y el rango. */
export function encadenadas2(params, azar, cnt, resta) {
  const R = params.rango, u = params.salto === 1000 ? 1000 : params.salto === 100 ? 100 : 10, k = resta ? 3 : (params.sumandos ?? 3), tope = Math.floor(R / u);
  const vistos = new Set(), ejercicios = [];
  for (let n = 0; n < 5000 && ejercicios.length < cnt; n++) {
    const sal = Array.from({ length: k - 1 }, () => azar.entero(1, 9)), s = sal.reduce((x, y) => x + y, 0);
    if (s + 1 > tope) continue;
    const pri = resta ? azar.entero(s + 1, tope) : azar.entero(1, tope - s), ns = [pri, ...sal].map((v) => v * u);
    if (vistos.has(ns.join())) continue;
    vistos.add(ns.join());
    const res = resta ? ns[0] - ns[1] - ns[2] : ns.reduce((x, y) => x + y, 0);
    ejercicios.push({ datos: resta ? { a: ns[0], b: ns[1], c: ns[2] } : Object.fromEntries(ns.map((v, i) => ["xyzw"[i], v])), solucion: { huecos: [res] } });
  }
  return ejercicios;
}

export default registrar({
  id: "sumar.encadenadas",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const cap = (params.rango ?? 10) <= 10 ? 10 : 20, cnt = cuantos(ctx, 2, MIN_OP, FIJO), vistos = new Set(), ejercicios = [];
    if ((params.rango ?? 10) >= 100) return { enunciado: "Suma los números y escribe el resultado.", ejercicios: encadenadas2(params, azar, cnt, false) };
    while (ejercicios.length < cnt) {
      let tr, t;
      for (let k = 0; k < 300; k++) {
        t = azar.entero(Math.max(5, Math.floor(cap / 2)), cap);
        const p = azar.muestra(Array.from({ length: t - 1 }, (_, i) => i + 1), 2).sort((u, v) => u - v);
        tr = [p[0], p[1] - p[0], t - p[1]];
        if (!vistos.has(tr.join())) break;
      }
      vistos.add(tr.join());
      ejercicios.push({ datos: { x: tr[0], y: tr[1], z: tr[2] }, solucion: { huecos: [t] } });
    }
    return { enunciado: "Suma los tres números y escribe el resultado.", ejercicios };
  },
  dibujar(p, act) {
    const es = act.ejercicios;
    const fs = es.some((e) => e.datos.w !== undefined) ? 16 : 18, bw = es.some((e) => e.solucion.huecos[0] >= 100) ? 54 : 44;
    pintarEl(p, 2, es.map((e) => [T(["x", "y", "z", "w"].filter((c) => e.datos[c] !== undefined).map((c) => e.datos[c]).join(" + ") + " =", fs),
      B(bw, 36, e.solucion.huecos[0])]), es.map((e) => e.id), 8);
  },
});
