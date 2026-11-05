// fono.posicion · ¿Dónde está el sonido? (Lengua 1.º, lote 2; LENGUA_1.md §3, bloque 1). Versión escrita.
// datos:    { palabra (en el caso elegido), letra: "o" (minúscula, o MAYÚSCULA con el caso «mayus») }
// solucion: { huecos: [], marca: 0 | 1 | 2 }   0 = principio, 1 = en medio, 2 = al final (la casilla se colorea en rojo en la solución)
// Reglas: palabra del léxico; la letra pedida sale UNA sola vez en la palabra (sin tilde: «a» y «á» son la misma), es una letra suelta
//         (no forma parte de ch, ll, rr, qu, gu) y no es h, k, w, x, y, q; posiciones repartidas a partes iguales (principio / en medio / al final);
//         palabras de 3 a 9 letras, sin repetir. Opciones: sílabas (variadas, 2, 3 o 4) · tipo de sílabas · caso. Completa: 10 palabras; media: 5.
import { registrar } from "../nucleo/tipos.js";
import { TOP, INK, COLOR_SOLUCION } from "../render/papel.js";
import { sinTildes } from "../lengua/reglas.js";
import { alCaso, cuantas, largosDe, unidades, ajusta } from "./_lengua.js";
import { elegirIdx, repartir } from "./_fono.js";

export const ETIQUETAS = ["principio", "en medio", "al final"];

/** Letras de la palabra que se pueden pedir para la posición t (0, 1, 2): sueltas, únicas en la palabra y sin h k w x y q. */
export function letrasPara(p, t) {
  const s = sinTildes(p), out = []; let i = 0;
  for (const u of unidades(p)) {
    const l = sinTildes(u);
    const buena = u.length === 1 && /[a-zñ]/.test(l) && !"hkwxyq".includes(l) && [...s].filter((c) => c === l).length === 1;
    const pos = i === 0 ? 0 : i === p.length - 1 ? 2 : 1;
    if (buena && pos === t) out.push(l);
    i += u.length;
  }
  return out;
}

export default registrar({
  id: "fono.posicion",
  version: 1,
  generar(params, azar, { tamano }) {
    const n = cuantas(tamano, 10), objetivos = repartir(azar, n, [0, 1, 2]);
    const intento = (e, i, az) => { const ls = letrasPara(e.p, objetivos[i]); return ls.length ? { letra: az.elegir(ls), marca: objetivos[i] } : null; };
    const ps = elegirIdx(azar, n, params, largosDe(params, [2, 3, 2, 3, 4]), intento, { extra: { minLetras: 3, maxLetras: 9 }, id: "fono.posicion" });
    return {
      enunciado: "Lee la palabra y marca con una cruz\ndónde está la letra del cuadro.",
      ejercicios: ps.map(({ p, r }) => ({
        datos: { palabra: alCaso(p, params.caso), letra: params.caso === "mayus" ? r.letra.toUpperCase() : r.letra },
        solucion: { huecos: [], marca: r.marca },
      })),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 1, 10, 10, 8);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { palabra, letra } = e.datos, bw = 80, bh = 38, gap = 6;
      p.marco(x, y, cw, ch, i);
      p.rrect(x + 36, y + (ch - 44) / 2, 44, 44, 9, { lw: 1.5, fill: 0.9, stroke: INK });
      p.text(x + 58, y + ch / 2 - 28 * 0.35, letra, 28, { f: "PB", anchor: "middle" });
      const wp = cw - 14 - 3 * bw - 2 * gap - 100 - 14, fs = ajusta(p, (q) => p.ancho(palabra, "PB", q), wp, 26);
      p.text(x + 100 + wp / 2, y + ch / 2 - fs * 0.35, palabra, fs, { f: "PB", anchor: "middle" });
      ETIQUETAS.forEach((t, k) => {
        const bx = x + cw - 14 - 3 * bw - 2 * gap + k * (bw + gap), by = y + (ch - bh) / 2, marca = p.solucion && e.solucion.marca === k;
        p.rrect(bx, by, bw, bh, 7, { lw: marca ? 2.2 : 1.5, fill: marca ? "#F6C9C9" : 1, stroke: marca ? COLOR_SOLUCION : INK });
        p.text(bx + bw / 2, by + bh / 2 - 4, t, 11.5, { f: "PM", anchor: "middle", gris: 0.25 });
      });
    }));
  },
});
