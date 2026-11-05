// fono.silabas · Cuenta las sílabas (Lengua 1.º, lote 2; LENGUA_1.md §3, bloque 1). Versión escrita, sin dibujos.
// datos:    { palabra (en el caso elegido), n: nº de sílabas, respuesta: "colorea" | "numero" }
// solucion: colorea → { huecos: [], colorea: n }   (el alumno colorea n de las 4 casillas, una por palmada; en la solución, en rojo)
//           numero  → { huecos: [n] }
// Reglas: palabra del léxico; n = silabas() de reglas.js (1–4); siempre 4 casillas (no delatan el número); sin repetir palabras. Palabras de hasta 10 letras.
// Opciones: respuesta (colorear / escribir el número) · sílabas (variadas, 1, 2, 3 o 4) · tipo de sílabas · caso. Completa: 10 palabras; media: 5.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { silabas } from "../lengua/reglas.js";
import { casillas } from "../lengua/dibujo.js";
import { alCaso, cuantas, elegirPalabras, largosDe, ajusta } from "./_lengua.js";

export default registrar({
  id: "fono.silabas",
  version: 1,
  generar(params, azar, { tamano }) {
    const n = cuantas(tamano, 10), respuesta = params.respuesta === "numero" ? "numero" : "colorea";
    const ps = elegirPalabras(azar, n, params, largosDe(params, [2, 3, 2, 4, 3, 1]), { extra: { maxLetras: 10 }, id: "fono.silabas" });
    return {
      enunciado: respuesta === "numero" ? "Da una palmada por cada sílaba\ny escribe cuántas sílabas tiene la palabra." : "Da una palmada por cada sílaba\ny colorea una casilla por cada palmada.",
      ejercicios: ps.map(({ p }) => {
        const k = silabas(p).length, palabra = alCaso(p, params.caso);
        return { datos: { palabra, n: k, respuesta }, solucion: respuesta === "numero" ? { huecos: [k] } : { huecos: [], colorea: k } };
      }),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 1, 10, 10, 8);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { palabra, n, respuesta } = e.datos;
      p.marco(x, y, cw, ch, i);
      const fs = ajusta(p, (q) => p.ancho(palabra, "PB", q), cw * 0.42 - 10, 30);
      p.text(x + 40, y + ch / 2 - fs * 0.35, palabra, fs, { f: "PB" });
      if (respuesta === "numero") {
        p.caja(x + cw * 0.62, y + (ch - 42) / 2, 56, 42, null, 24, n);
        p.text(x + cw * 0.62 + 66, y + ch / 2 - 4, "sílabas", 12, { f: "PM", gris: 0.35 });
      } else casillas(p, x + cw * 0.46, y, cw * 0.52, ch, 4, { rellenar: n, ancho: 46, alto: 38, gap: 8 });
    }));
  },
});
