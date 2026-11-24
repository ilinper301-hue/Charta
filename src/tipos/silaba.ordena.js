// silaba.ordena · Ordena las sílabas (Lengua 1.º, lote 1; LENGUA_1.md §3, bloque 3).
// datos:    { silabas: [sílabas desordenadas, en el caso elegido], palabra }     (el orden mostrado nunca es el de la palabra)
// solucion: { huecos: [palabra] }     con «Mayúscula inicial», la sílaba que va primera se ve ya con mayúscula.
// Reglas: palabra del léxico con el silabeo de reglas.js; ninguna otra ordenación de esas sílabas forma otra palabra del léxico
//         (solución única); la palabra tiene al menos 2 sílabas distintas. Palabras de hasta 10 letras, sin repetir.
// Opciones: sílabas (variadas, 2, 3 o 4) · tipo de sílabas · caso. Cantidad: 2 columnas; sílabas arriba y hueco para la palabra debajo; «Más grandes» 20 palabras (media: 10), «Más ejercicios» las que caben con tarjetas ≥ 50 pt.
import { registrar } from "../nucleo/tipos.js";
import { TOP, cuantosRejilla } from "../render/papel.js";
import { silabas } from "../lengua/reglas.js";
import { LEXICO } from "../lengua/lexico.js";
import { alCaso, trozosCaso, cuantas, elegirPalabras, largosDe, pildoras, anchoPildoras, ajusta, conTope, dosFilas } from "./_lengua.js";

const MIN_ALTO = 50;   // alto mínimo de tarjeta con «Más ejercicios»

const PALABRAS = new Set(LEXICO.map((e) => e.p));
/** Todas las ordenaciones de la lista. */
const permutaciones = (l) => (l.length <= 1 ? [l] : l.flatMap((x, i) => permutaciones([...l.slice(0, i), ...l.slice(i + 1)]).map((r) => [x, ...r])));

/** ¿Sirve la palabra? Sí si ninguna otra ordenación de sus sílabas es una palabra del léxico y hay al menos dos sílabas distintas. */
export function ordenable(p) {
  const ss = silabas(p);
  if (new Set(ss).size < 2) return false;
  return !permutaciones(ss).some((q) => q.join("") !== p && PALABRAS.has(q.join("")));
}

export default registrar({
  id: "silaba.ordena",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const n = cuantosRejilla(ctx, 2, MIN_ALTO, [20, 10]);
    const ps = conTope(n, cuantas(ctx.tamano, 10), (k) => elegirPalabras(azar, k, params, largosDe(params, [2, 3, 2, 3, 4]), { extra: { maxLetras: 10 }, ok: (e) => ordenable(e.p), id: "silaba.ordena" }));
    return {
      enunciado: "Ordena las sílabas y escribe la palabra.",
      ejercicios: ps.map(({ p }) => {
        const ss = silabas(p); let mez = azar.barajar(ss);
        while (mez.join("") === p) mez = azar.barajar(ss);
        const vista = trozosCaso(mez, params.caso === "inicial" ? null : params.caso);
        if (params.caso === "inicial") { const k = mez.indexOf(ss[0]); vista[k] = alCaso(vista[k], "inicial"); }   // la sílaba con mayúscula es la primera
        return { datos: { silabas: vista, palabra: alCaso(p, params.caso) }, solucion: { huecos: [alCaso(p, params.caso)] } };
      }),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.rejilla(TOP, 2, Math.ceil(act.ejercicios.length / 2)), x0 = 32, w = cw - x0 - 10;
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], ss = e.datos.silabas, { arriba, abajo } = dosFilas(y, ch);
      p.marco(x, y, cw, ch, i);
      const fs = ajusta(p, (q) => anchoPildoras(p, ss, q, 7), w, Math.min(22, arriba.h / 1.7), 9);
      pildoras(p, x + x0, arriba.y, arriba.h, ss, fs, 7);
      p.caja(x + x0, abajo.y, w, abajo.h, null, 20, e.solucion.huecos[0]);
    }));
  },
});
