// fono.posicion · ¿Dónde está el sonido? (Lengua 1.º, lote 2; LENGUA_1.md §3, bloque 1). Versión escrita.
// datos:    { palabra (en el caso elegido), letra: "o" (minúscula, o MAYÚSCULA con el caso «mayus») }
// solucion: { huecos: [], marca: 0 | 1 | 2 }   0 = principio, 1 = en medio, 2 = al final (la casilla se colorea en rojo en la solución)
// Reglas: palabra del léxico; la letra pedida sale UNA sola vez en la palabra (sin tilde: «a» y «á» son la misma), es una letra suelta
//         (no forma parte de ch, ll, rr, qu, gu) y no es h, k, w, x, y, q; posiciones repartidas a partes iguales (principio / en medio / al final);
//         palabras de 3 a 9 letras, sin repetir. Opciones: sílabas (variadas, 2, 3 o 4) · tipo de sílabas · caso. Cantidad: 2 columnas (letra y palabra arriba, los tres botones debajo); «Más grandes» 20 palabras (media: 10), «Más ejercicios» las que caben con tarjetas ≥ 50 pt.
import { registrar } from "../nucleo/tipos.js";
import { TOP, INK, COLOR_SOLUCION, cuantosRejilla } from "../render/papel.js";
import { sinTildes } from "../lengua/reglas.js";
import { alCaso, cuantas, largosDe, unidades, ajusta, conTope, dosFilas } from "./_lengua.js";
import { elegirIdx, repartir } from "./_fono.js";

const MIN_ALTO = 50;   // alto mínimo de tarjeta con «Más ejercicios»
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
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const ps = conTope(cuantosRejilla(ctx, 2, MIN_ALTO, [20, 10]), cuantas(ctx.tamano, 10), (n) => {
      const objetivos = repartir(azar, n, [0, 1, 2]);
      const intento = (e, i, az) => { const ls = letrasPara(e.p, objetivos[i]); return ls.length ? { letra: az.elegir(ls), marca: objetivos[i] } : null; };
      return elegirIdx(azar, n, params, largosDe(params, [2, 3, 2, 3, 4]), intento, { extra: { minLetras: 3, maxLetras: 9 }, id: "fono.posicion" });
    });
    return {
      enunciado: "Lee la palabra y marca con una cruz\ndónde está la letra del cuadro.",
      ejercicios: ps.map(({ p, r }) => ({
        datos: { palabra: alCaso(p, params.caso), letra: params.caso === "mayus" ? r.letra.toUpperCase() : r.letra },
        solucion: { huecos: [], marca: r.marca },
      })),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.rejilla(TOP, 2, Math.ceil(act.ejercicios.length / 2));
    const x0 = 32, w = cw - x0 - 10, gap = 5, bw = (w - 2 * gap) / 3;
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { palabra, letra } = e.datos, { arriba, abajo } = dosFilas(y, ch, 0.38);
      p.marco(x, y, cw, ch, i);
      // arriba: la letra del cuadro y la palabra; abajo: los tres botones
      const q = Math.min(34, arriba.h), lf = q * 0.62;
      p.rrect(x + x0, arriba.y + (arriba.h - q) / 2, q, q, 8, { lw: 1.5, fill: 0.9, stroke: INK });
      p.text(x + x0 + q / 2, arriba.y + arriba.h / 2 - lf * 0.35, letra, lf, { f: "PB", anchor: "middle" });
      const wp = w - q - 14, fs = ajusta(p, (f) => p.ancho(palabra, "PB", f), wp, Math.min(26, arriba.h * 0.8), 10);
      p.text(x + x0 + q + 14 + wp / 2, arriba.y + arriba.h / 2 - fs * 0.35, palabra, fs, { f: "PB", anchor: "middle" });
      const lb = Math.min(11, abajo.h * 0.5);
      ETIQUETAS.forEach((t, k) => {
        const bx = x + x0 + k * (bw + gap), marca = p.solucion && e.solucion.marca === k;
        p.rrect(bx, abajo.y, bw, abajo.h, 7, { lw: marca ? 2.2 : 1.5, fill: marca ? "#F6C9C9" : 1, stroke: marca ? COLOR_SOLUCION : INK });
        p.text(bx + bw / 2, abajo.y + abajo.h / 2 - lb * 0.35, t, lb, { f: "PM", anchor: "middle", gris: 0.25 });
      });
    }));
  },
});
