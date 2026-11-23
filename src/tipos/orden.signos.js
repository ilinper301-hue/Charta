// orden.signos · Los signos < > = (port de _o_signos(), _pares() y _grupo() del motor).
// datos:    { a, b }
// solucion: { huecos: ["<" | ">" | "="] }
// Opciones: modo null (con 3 parejas iguales) | "sin" (sin iguales); cerca (si_no): números de la misma decena (desde rango 20).
// Cantidad (opción de la ficha): «Más grandes» = 15 parejas en completa y 6 en media (3 y 1 iguales, un quinto); «Más ejercicios» = las filas de 3 que caben con tarjetas ≥ 86 pt (21 y 9). Rejilla elástica (p.rejilla).
import { registrar } from "../nucleo/tipos.js";
import { TOP, B, cuantosRejilla } from "../render/papel.js";

const MIN_ALTO = 86;   // alto mínimo de tarjeta con «Más ejercicios»

/** _grupo(k): k números distintos de 1..R (con «cerca», de una misma decena si R ≥ 20). */
export function grupo(k, R, azar, cerca) {
  let lo = 1, hi = R;
  if (cerca && R >= 20) {
    const ds = []; for (let d = 0; d <= Math.floor(R / 10); d++) if (Math.min(R, d * 10 + 9) - Math.max(1, d * 10) + 1 >= k) ds.push(d);
    const d = azar.elegir(ds); lo = Math.max(1, d * 10); hi = Math.min(R, d * 10 + 9);
  }
  const l = []; for (let v = lo; v <= hi; v++) l.push(v);
  return azar.muestra(l, k);
}

/** _pares(): cnt parejas sin repetir, `iguales` de ellas con a = b. */
export function pares(cnt, R, azar, cerca, iguales = 0) {
  const eq = new Set(iguales ? azar.muestra([...Array(cnt).keys()], iguales) : []), out = [], vistos = new Set();
  for (let i = 0; i < cnt; i++) {
    let p;
    for (let k = 0; k < 300; k++) {
      if (eq.has(i)) { const a = azar.entero(1, R); p = [a, a]; } else p = grupo(2, R, azar, cerca);
      if (!vistos.has(p.join())) break;
    }
    vistos.add(p.join()); out.push(p);
  }
  return out;
}

export default registrar({
  id: "orden.signos",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const R = params.rango ?? 10, cnt = cuantosRejilla(ctx, 3, MIN_ALTO, [15, 6]), iguales = params.modo === "sin" ? 0 : Math.round(cnt / 5);
    return {
      enunciado: "Escribe <, > o = en el cuadro gris.",
      ejercicios: pares(cnt, R, azar, !!params.cerca, iguales).map(([a, b]) => ({
        datos: { a, b }, solucion: { huecos: [a < b ? "<" : a > b ? ">" : "="] },
      })),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.rejilla(TOP, 3, Math.ceil(act.ejercicios.length / 3));
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { a, b } = e.datos;
      p.marco(x, y, cw, ch, i);
      const cuatro = Math.max(a, b) > 999, w0 = cuatro ? 56 : 46, g0 = cuatro ? 6 : 8;   // 3.º: cuatro cifras
      const k = Math.max(1, Math.min(1.4, (ch - 26) * 0.5 / 46, (cw - 8) / (2 * w0 + 40 + 2 * g0))), w = w0 * k, g = g0 * k, bh = 46 * k, fs = (cuatro ? 17 : 22) * k, tw = 2 * w + 40 * k + 2 * g;   // las cajas crecen con la tarjeta
      const bx = x + (cw - tw) / 2, by = y + (ch - 26 - bh) / 2;
      p.caja(bx, by, w, bh, a, fs);
      p.caja(bx + w + g, by, 40 * k, bh, null, 22 * k, e.solucion.huecos[0]);
      p.caja(bx + w + 40 * k + 2 * g, by, w, bh, b, fs);
    }));
  },
});
