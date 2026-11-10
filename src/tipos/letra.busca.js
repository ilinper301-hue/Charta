// letra.busca · Rodea la letra (Lengua 1.º, lote 1; LENGUA_1.md §3, bloque 2).
// datos:    { letra: "m", fila: [10 letras, en minúscula o MAYÚSCULA] }
// solucion: { huecos: [], rodea: [posiciones de la letra pedida en la fila] }   (el alumno rodea; en la solución, rodeadas en rojo)
// Opciones: letra (al azar o una concreta) · distractoras (al azar / las que se confunden) · caso (minúscula / MAYÚSCULA).
// Con letras elegidas (vistas.js): la letra al azar y las distractoras salen solo de ellas («confusas» = las que se confunden y están elegidas;
// si ninguna lo está, cualquiera de las elegidas). Una letra concreta de las opciones se respeta aunque no esté elegida.
// Completa: 10 filas de 10 letras (3 o 4 veces la pedida cada una); media: 5. Filas distintas.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { letrasActivas, permitida, avisoVistas } from "../lengua/vistas.js";
import { rodear } from "../lengua/dibujo.js";
import { ajusta } from "./_lengua.js";

/** Letras que se parecen a cada una (para las distractoras «que se confunden»): b-d-p-q, m-n, u-n y otras parejas de letra escolar. */
export const CONFUSAS = {
  a: "oecd", b: "dpqh", c: "eoas", d: "bpqg", e: "caos", f: "tlrk", g: "qpyj", h: "nbmk", i: "ljtu", j: "igyt", k: "hxvf", l: "itfh", m: "nwuh",
  n: "mhurñ", ñ: "nmhr", o: "aecu", p: "bdqg", q: "gpbd", r: "nvfñ", s: "zcxe", t: "flik", u: "nvmo", v: "uywr", w: "vumn", x: "kzvs", y: "vgjq", z: "sxct",
};
export const NFILA = 10;

export default registrar({
  id: "letra.busca",
  version: 1,
  generar(params, azar, { tamano }) {
    const n = tamano === "media" ? 5 : 10, mayus = params.caso === "mayus", fmt = (c) => (mayus ? c.toUpperCase() : c);
    const letra = params.letra || azar.elegir(letrasActivas());
    let otras = (params.distractoras === "confusas" ? [...CONFUSAS[letra]] : letrasActivas()).filter((l) => l !== letra && permitida(l));
    if (!otras.length) otras = letrasActivas().filter((l) => l !== letra);   // ninguna confusa elegida: cualquiera de las elegidas
    if (!otras.length) throw new Error("«letra.busca» necesita al menos dos letras distintas para rodear una entre otras." + avisoVistas());
    const filas = new Set();
    while (filas.size < n) {
      const veces = azar.entero(3, 4), cola = Array.from({ length: NFILA - veces }, () => azar.elegir(otras));
      const pos = azar.muestra([...Array(NFILA).keys()], veces).sort((a, b) => a - b);
      filas.add(JSON.stringify({ pos, fila: Array.from({ length: NFILA }, (_, i) => (pos.includes(i) ? letra : cola.pop())) }));
    }
    return {
      enunciado: `Rodea todas las letras «${fmt(letra)}».`,
      ejercicios: [...filas].map((j) => {
        const { pos, fila } = JSON.parse(j);
        return { datos: { letra: fmt(letra), fila: fila.map(fmt) }, solucion: { huecos: [], rodea: pos } };
      }),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 1, 10, 10, 8);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], w = cw - 56;
      p.marco(x, y, cw, ch, i);
      const fila = e.datos.fila, gap = 4;
      const fs = ajusta(p, (q) => fila.reduce((t, l) => t + p.ancho(l, "PB", q) + q * 0.9, 0) + gap * (fila.length - 1), w, 26);
      rodear(p, x + 44, y, w, ch, fila, e.solucion.rodea, { fs, gap });
    }));
  },
});
