// orden.signos · Los signos < > = (port de _o_signos(), _pares() y _grupo() del motor).
// datos:    { a, b }
// solucion: { huecos: ["<" | ">" | "="] }
// Opciones: modo null (con 3 parejas iguales) | "sin" (sin iguales); cerca (si_no): números de la misma decena (desde rango 20).
// Completa: 15 parejas (5 filas × 3); media: 6 (con 1 igual: se conserva la proporción 3 de 15).
import { registrar } from "../nucleo/tipos.js";
import { TOP, B } from "../render/papel.js";

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
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 10, cnt = tamano === "media" ? 6 : 15, iguales = params.modo === "sin" ? 0 : Math.round(cnt / 5);
    return {
      enunciado: "Escribe <, > o = en el cuadro gris.",
      ejercicios: pares(cnt, R, azar, !!params.cerca, iguales).map(([a, b]) => ({
        datos: { a, b }, solucion: { huecos: [a < b ? "<" : a > b ? ">" : "="] },
      })),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 3, 5);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { a, b } = e.datos;
      p.marco(x, y, cw, ch, i);
      const g = 8, bx = x + (cw - 132 - 2 * g) / 2, by = y + (ch - 46 - 10) / 2;
      p.caja(bx, by, 46, 46, a, 22);
      p.caja(bx + 46 + g, by, 40, 46, null, 22, e.solucion.huecos[0]);
      p.caja(bx + 86 + 2 * g, by, 46, 46, b, 22);
    }));
  },
});
