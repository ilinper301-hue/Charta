// silaba.ordena · Ordena las sílabas (Lengua 1.º, lote 1; LENGUA_1.md §3, bloque 3).
// datos:    { silabas: [sílabas desordenadas, en el caso elegido], palabra }     (el orden mostrado nunca es el de la palabra)
// solucion: { huecos: [palabra] }     con «Mayúscula inicial», la sílaba que va primera se ve ya con mayúscula.
// Reglas: palabra del léxico con el silabeo de reglas.js; ninguna otra ordenación de esas sílabas forma otra palabra del léxico
//         (solución única); la palabra tiene al menos 2 sílabas distintas. Palabras de hasta 10 letras, sin repetir.
// Opciones: sílabas (variadas, 2, 3 o 4) · tipo de sílabas · caso. Completa: 10 palabras; media: 5.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { silabas } from "../lengua/reglas.js";
import { LEXICO } from "../lengua/lexico.js";
import { alCaso, trozosCaso, cuantas, elegirPalabras, largosDe, pildoras, anchoPildoras, ajusta } from "./_lengua.js";

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
  version: 1,
  generar(params, azar, { tamano }) {
    const n = cuantas(tamano, 10);
    const ps = elegirPalabras(azar, n, params, largosDe(params, [2, 3, 2, 3, 4]), { extra: { maxLetras: 10 }, ok: (e) => ordenable(e.p), id: "silaba.ordena" });
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
    const { cel, cw, ch } = p.celdas(TOP, 1, 10, 10, 8);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], ss = e.datos.silabas, bw = 190, wp = cw - 36 - bw - 40;
      p.marco(x, y, cw, ch, i);
      const fs = ajusta(p, (q) => anchoPildoras(p, ss, q, 8), wp, 24, 14);
      pildoras(p, x + 36, y, ch, ss, fs, 8);
      p.text(x + cw - 14 - bw - 20, y + ch / 2 - 8, "→", 20, { f: "PB", anchor: "middle", gris: 0.4 });
      p.caja(x + cw - 14 - bw, y + (ch - 40) / 2, bw, 40, null, 20, e.solucion.huecos[0]);
    }));
  },
});
