// frase.verdad · ¿Sí o no? (Lengua 1.º, lote 3; LENGUA_1.md §3, bloque 5).
// datos:    { frase: "El pez nada." (en el caso elegido) }
// solucion: { huecos: [], rodea: 0 | 1 }    0 = «Sí» (la frase es verdad), 1 = «No» (es falsa); rodeado en rojo en la solución
// Reglas: la base de _frase.js (hechosVerdad). Sí: lo que hace de verdad cada animal, persona o cosa (los mismos hechos que usan las demás frases);
//         No: algo imposible sin discusión (La vaca vuela, La mesa corre, El gato lee un libro, La nieve es negra, El gato come una silla).
//         Mitad Sí y mitad No, mezcladas; frases de 3 a 5 palabras con concordancia; sin repetir frase ni (mientras haya) sujeto.
// Opciones: letra (minúscula / MAYÚSCULAS). Completa: 12 frases; media: 6.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { rodear } from "../lengua/dibujo.js";
import { cuantas, ajusta } from "./_lengua.js";
import { elegirVerdades, textoFrase, frAlCaso } from "./_frase.js";

export default registrar({
  id: "frase.verdad",
  version: 1,
  generar(params, azar, { tamano }) {
    const n = cuantas(tamano, 12), mayus = params.caso === "mayus";
    return {
      enunciado: mayus ? "LEE LA FRASE. SI ES VERDAD, RODEA SÍ.\nSI NO LO ES, RODEA NO." : "Lee la frase. Si es verdad, rodea Sí.\nSi no lo es, rodea No.",
      ejercicios: elegirVerdades(azar, n).map((h) => ({ datos: { frase: frAlCaso(textoFrase(h.palabras), params.caso) }, solucion: { huecos: [], rodea: h.verdad ? 0 : 1 } })),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 1, 12, 10, 8), mayus = act.params.caso === "mayus", ops = mayus ? ["SÍ", "NO"] : ["Sí", "No"];
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { frase } = e.datos;
      p.marco(x, y, cw, ch, i);
      const fs = ajusta(p, (q) => p.ancho(frase, "PB", q), cw - 250, 22);
      p.text(x + 40, y + ch / 2 - fs * 0.35, frase, fs, { f: "PB" });
      rodear(p, x + cw - 190, y, 170, ch, ops, e.solucion.rodea, { fs: 20, gap: 22 });
    }));
  },
});
