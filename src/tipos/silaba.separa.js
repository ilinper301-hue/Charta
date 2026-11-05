// silaba.separa · Separa en sílabas (Lengua 1.º, lote 1; LENGUA_1.md §3, bloque 3).
// datos:    { palabra (en el caso elegido), modo: "casillas" | "rayas", n: nº de sílabas }
// solucion: casillas → { huecos: [las sílabas, una por casilla] }
//           rayas    → { huecos: [], rayas: [nº de letras tras las que va cada raya, de izquierda a derecha] }  (el alumno traza las rayas; en la solución, en rojo)
// Reglas: palabra del léxico; las sílabas son las de reglas.js (silabas); sin repetir palabras. Palabras de hasta 10 letras.
// Opciones: cómo se separa (en casillas / con rayas) · sílabas (variadas, 2, 3 o 4) · tipo de sílabas · caso. Completa: 10 palabras; media: 5.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { silabas } from "../lengua/reglas.js";
import { casillas } from "../lengua/dibujo.js";
import { alCaso, trozosCaso, cuantas, elegirPalabras, largosDe, palabraLetras, ajusta } from "./_lengua.js";

export default registrar({
  id: "silaba.separa",
  version: 1,
  generar(params, azar, { tamano }) {
    const n = cuantas(tamano, 10), modo = params.modo === "rayas" ? "rayas" : "casillas";
    const ps = elegirPalabras(azar, n, params, largosDe(params, [2, 3, 2, 3, 4]), { extra: { maxLetras: 10 }, id: "silaba.separa" });
    return {
      enunciado: modo === "rayas" ? "Separa cada palabra en sílabas:\ntraza una raya entre ellas." : "Separa cada palabra en sílabas:\nescribe una en cada casilla.",
      ejercicios: ps.map(({ p }) => {
        const ss = silabas(p), palabra = alCaso(p, params.caso);
        if (modo === "casillas") return { datos: { palabra, modo, n: ss.length }, solucion: { huecos: trozosCaso(ss, params.caso) } };
        const rayas = ss.slice(0, -1).map((_, k) => ss.slice(0, k + 1).join("").length);
        return { datos: { palabra, modo, n: ss.length }, solucion: { huecos: [], rayas } };
      }),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 1, 10, 10, 8);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { palabra, modo, n } = e.datos;
      p.marco(x, y, cw, ch, i);
      if (modo === "rayas") {
        palabraLetras(p, x + 40, y, cw - 56, ch, palabra, { fs: 32, gap: 0.4, rayas: e.solucion.rayas });
        return;
      }
      const w1 = cw * 0.42, fs = ajusta(p, (q) => p.ancho(palabra, "PB", q), w1 - 10, 28);
      p.text(x + 36, y + ch / 2 - fs * 0.35, palabra, fs, { f: "PB" });
      casillas(p, x + cw * 0.46, y, cw * 0.52, ch, n, { sol: e.solucion.huecos, ancho: 56, alto: 38, gap: 8, fs: 18 });
    }));
  },
});
