// fono.silabas · Cuenta las sílabas (Lengua 1.º, lote 2; LENGUA_1.md §3, bloque 1). Versión escrita, sin dibujos.
// datos:    { palabra (en el caso elegido), n: nº de sílabas, respuesta: "colorea" | "numero" }
// solucion: colorea → { huecos: [], colorea: n }   (el alumno colorea n de las 4 casillas, una por palmada; en la solución, en rojo)
//           numero  → { huecos: [n] }
// Reglas: palabra del léxico; n = silabas() de reglas.js (1–4); siempre 4 casillas (no delatan el número); sin repetir palabras. Palabras de hasta 10 letras.
// Opciones: respuesta (colorear / escribir el número) · sílabas (variadas, 1, 2, 3 o 4) · tipo de sílabas · caso. Cantidad: 2 columnas; «Más grandes» 20 palabras (media: 10), «Más ejercicios» las que caben con tarjetas ≥ 40 pt.
import { registrar } from "../nucleo/tipos.js";
import { TOP, cuantosRejilla } from "../render/papel.js";
import { silabas } from "../lengua/reglas.js";
import { casillas } from "../lengua/dibujo.js";
import { alCaso, cuantas, elegirPalabras, largosDe, ajusta, conTope } from "./_lengua.js";

const MIN_ALTO = 40;   // alto mínimo de tarjeta con «Más ejercicios»

export default registrar({
  id: "fono.silabas",
  version: 3,
  cantidad: true,
  generar(params, azar, ctx) {
    const n = cuantosRejilla(ctx, 2, MIN_ALTO, [20, 10]), respuesta = params.respuesta === "numero" ? "numero" : "colorea";
    const ps = conTope(n, cuantas(ctx.tamano, 10), (k) => elegirPalabras(azar, k, params, largosDe(params, [2, 3, 2, 4, 3, 1]), { extra: { maxLetras: 10 }, id: "fono.silabas" }));
    return {
      enunciado: respuesta === "numero" ? "Da una palmada por cada sílaba\ny escribe cuántas sílabas tiene la palabra." : "Da una palmada por cada sílaba\ny colorea una casilla por cada palmada.",
      ejercicios: ps.map(({ p }) => {
        const k = silabas(p).length, palabra = alCaso(p, params.caso);
        return { datos: { palabra, n: k, respuesta }, solucion: respuesta === "numero" ? { huecos: [k] } : { huecos: [], colorea: k } };
      }),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.rejilla(TOP, 2, Math.ceil(act.ejercicios.length / 2));
    const x0 = 32, x1 = 10, qa = Math.min(30, ch * 0.55);   // casillas de colorear: alto
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { palabra, n, respuesta } = e.datos;
      p.marco(x, y, cw, ch, i);
      const num = respuesta === "numero", rw = num ? 44 + 5 + p.ancho("sílabas", "PM", 11) : 4 * 24 + 3 * 4;   // ancho de lo que va a la derecha
      const aw = cw - x0 - x1 - rw - 10, fs = ajusta(p, (q) => p.ancho(palabra, "PB", q), aw, Math.min(28, ch * 0.46), 10);
      p.text(x + x0, y + ch / 2 - fs * 0.35, palabra, fs, { f: "PB" });
      const rx = x + cw - x1 - rw;
      if (num) {
        const bh = Math.min(36, ch * 0.7);
        p.caja(rx, y + (ch - bh) / 2, 44, bh, null, 22, n);
        p.text(rx + 49, y + ch / 2 - 10 * 0.35, "sílabas", 11, { f: "PM", gris: 0.35 });
      } else casillas(p, rx, y, rw, ch, 4, { rellenar: n, ancho: 24, alto: qa, gap: 4 });
    }));
  },
});
