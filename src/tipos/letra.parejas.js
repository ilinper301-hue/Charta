// letra.parejas · Mayúscula y minúscula (Lengua 1.º, lote 1; LENGUA_1.md §3, bloque 2). Solo página completa.
// Tarea «unir» (8 filas): datos { izq: mayúscula, derecha: minúscula de la caja de la derecha en esta fila }
//                          solucion { huecos: [], une: índice de la fila cuya caja de la derecha lleva la minúscula de izq }
// Tarea «escribir» (24 pares, 3 × 8): datos { mayus, minus, falta: "mayus" | "minus" }  solucion { huecos: [la letra que falta] }
// Reglas: letras distintas; nunca salen juntas «i» y «l» (la «I» mayúscula de Fredoka se confunde con la «l»).
// Opciones: tarea (unir / escribir la que falta). Letras: todas.
// Con letras elegidas (vistas.js) solo salen ellas; si hay menos de las que caben (8 / 24), la ficha lleva menos filas o parejas (mínimo 4 letras).
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, T, B } from "../render/papel.js";
import { letrasActivas, avisoVistas } from "../lengua/vistas.js";
import { unir } from "../lengua/dibujo.js";

const MIN_LETRAS = 4;
/** n letras distintas al azar del abecedario (con ñ; solo las elegidas si las hay) sin que salgan a la vez «i» y «l».
 *  Si no hay n utilizables, devuelve las que haya. */
export function letrasSueltas(azar, n) {
  const out = [];
  for (const l of azar.barajar(letrasActivas())) {
    if ((l === "i" && out.includes("l")) || (l === "l" && out.includes("i"))) continue;
    out.push(l); if (out.length === n) break;
  }
  return out;
}

export default registrar({
  id: "letra.parejas",
  version: 1,
  generar(params, azar) {
    const pocas = (ls) => { if (ls.length < MIN_LETRAS) throw new Error(`«letra.parejas» necesita al menos ${MIN_LETRAS} letras (sin «i» y «l» a la vez): con esas opciones solo hay ${ls.length}.` + avisoVistas()); return ls; };
    if (params.tarea === "escribe") {
      return {
        enunciado: "Escribe la letra que falta en cada pareja:\nla mayúscula o la minúscula.",
        ejercicios: pocas(letrasSueltas(azar, 24)).map((l, i) => {
          const falta = azar.real() < 0.5 ? "mayus" : "minus";
          return { datos: { mayus: l.toUpperCase(), minus: l, falta }, solucion: { huecos: [falta === "mayus" ? l.toUpperCase() : l] } };
        }),
      };
    }
    const ls = pocas(letrasSueltas(azar, 8));
    let der = azar.barajar(ls);
    while (der.every((l, i) => l === ls[i])) der = azar.barajar(ls);
    return {
      enunciado: "Une cada letra mayúscula con su minúscula.",
      ejercicios: ls.map((l, i) => ({ datos: { izq: l.toUpperCase(), derecha: der[i] }, solucion: { huecos: [], une: der.indexOf(l) } })),
    };
  },
  dibujar(p, act) {
    const es = act.ejercicios;
    if (es[0].datos.izq === undefined) {
      const { cel, cw, ch } = p.celdas(TOP, 3, 8, 10, 8);
      es.forEach((e, i) => p.ejercicio(e.id, () => {
        const [x, y] = cel[i], { mayus, minus, falta } = e.datos, bw = 46, bh = 44, sol = e.solucion.huecos[0];
        p.marco(x, y, cw, ch, i);
        p.linea(x + 18, y, cw - 22, ch, falta === "mayus" ? [B(bw, bh, sol), T(minus, 32)] : [T(mayus, 32), B(bw, bh, sol)], 18);
      }));
      return;
    }
    const h = TOP - M;
    unir(p, M, TOP - h, W - 2 * M, h, es.map((e) => e.datos.izq), es.map((e) => e.datos.derecha), es.map((e) => e.solucion.une), { fs: 32, ids: es.map((e) => e.id) });
  },
});
