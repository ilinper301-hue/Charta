// silaba.separa · Separa en sílabas (Lengua 1.º, lote 1; LENGUA_1.md §3, bloque 3).
// datos:    { palabra (en el caso elegido), modo: "casillas" | "rayas", n: nº de sílabas }
// solucion: casillas → { huecos: [las sílabas, una por casilla] }
//           rayas    → { huecos: [], rayas: [nº de letras tras las que va cada raya, de izquierda a derecha] }  (el alumno traza las rayas; en la solución, en rojo)
// Reglas: palabra del léxico; las sílabas son las de reglas.js (silabas); sin repetir palabras. Palabras de hasta 10 letras.
// Opciones: cómo se separa (en casillas / con rayas) · sílabas (variadas, 2, 3 o 4) · tipo de sílabas · caso. Cantidad: 2 columnas; en casillas, palabra arriba y casillas debajo; «Más grandes» 20 palabras (media: 10), «Más ejercicios» las que caben con tarjetas ≥ 50 pt.
import { registrar } from "../nucleo/tipos.js";
import { TOP, cuantosRejilla } from "../render/papel.js";
import { silabas } from "../lengua/reglas.js";
import { casillas } from "../lengua/dibujo.js";
import { alCaso, trozosCaso, cuantas, elegirPalabras, largosDe, palabraLetras, ajusta, conTope, dosFilas } from "./_lengua.js";

const MIN_ALTO = 50;   // alto mínimo de tarjeta con «Más ejercicios»

export default registrar({
  id: "silaba.separa",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const n = cuantosRejilla(ctx, 2, MIN_ALTO, [20, 10]), modo = params.modo === "rayas" ? "rayas" : "casillas";
    const ps = conTope(n, cuantas(ctx.tamano, 10), (k) => elegirPalabras(azar, k, params, largosDe(params, [2, 3, 2, 3, 4]), { extra: { maxLetras: 10 }, id: "silaba.separa" }));
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
    const { cel, cw, ch } = p.rejilla(TOP, 2, Math.ceil(act.ejercicios.length / 2));
    const x0 = 32, w = cw - x0 - 10;
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { palabra, modo, n } = e.datos;
      p.marco(x, y, cw, ch, i);
      if (modo === "rayas") {
        palabraLetras(p, x + x0, y, w, ch, palabra, { fs: Math.min(32, ch * 0.5), gap: 0.4, rayas: e.solucion.rayas });
        return;
      }
      const { arriba, abajo } = dosFilas(y, ch), fs = ajusta(p, (q) => p.ancho(palabra, "PB", q), w, Math.min(28, arriba.h * 0.8), 10);
      p.text(x + x0, arriba.y + arriba.h / 2 - fs * 0.35, palabra, fs, { f: "PB" });
      const g = 6, qw = Math.min(56, (w - (n - 1) * g) / n);
      casillas(p, x + x0, abajo.y, w, abajo.h, n, { sol: e.solucion.huecos, ancho: qw, alto: abajo.h, gap: g, fs: Math.min(18, abajo.h * 0.6) });
    }));
  },
});
