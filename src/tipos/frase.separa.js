// frase.separa · Separa las palabras (Lengua 1.º, lote 3; LENGUA_1.md §3, bloque 5).
// datos:    { junta: "elgatocome" (en el caso elegido), modo: "rayas" | "escribe", n: nº de palabras }
// solucion: rayas   → { huecos: [], rayas: [nº de letras tras las que va cada raya, de izquierda a derecha] }   (el alumno traza las rayas; en la solución, en rojo)
//           escribe → { huecos: ["el gato come"] }   la frase con las palabras separadas, sin mayúscula ni punto (en el caso elegido)
// Reglas: frases de _frase.js (3 a 5 palabras, todas del léxico), sin repetir. Con rayas, ningún corte cae dentro de «ll», «rr», «ch», «qu» o «gu»
//         (se evitan frases como «el libro»: «ellibro» juntaría la «ll»). La solución sale de las palabras de la frase.
// Opciones: tarea (trazar rayas / reescribir) · palabras de cada frase (variadas / 3 / 4 / 5) · letra (minúscula / MAYÚSCULAS).
// Completa: rayas 10 frases, reescribir 8; media: la mitad.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { cuantas, palabraLetras, ajusta } from "./_lengua.js";
import { elegirFrases, largosFrase, cortesLimpios, frAlCaso } from "./_frase.js";

export default registrar({
  id: "frase.separa",
  version: 1,
  generar(params, azar, { tamano }) {
    const rayas = params.tarea !== "escribe", n = cuantas(tamano, rayas ? 10 : 8);
    const frases = elegirFrases(azar, largosFrase(azar, n, params.palabras), { filtro: rayas ? (f) => cortesLimpios(f.palabras) : null, id: "frase.separa" });
    return {
      enunciado: rayas ? "Traza una raya entre las palabras\nde cada frase." : "Escribe cada frase separando bien\nlas palabras.",
      ejercicios: frases.map((f) => {
        const junta = frAlCaso(f.palabras.join(""), params.caso), datos = { junta, modo: rayas ? "rayas" : "escribe", n: f.n };
        if (!rayas) return { datos, solucion: { huecos: [frAlCaso(f.palabras.join(" "), params.caso)] } };
        let c = 0;
        return { datos, solucion: { huecos: [], rayas: f.palabras.slice(0, -1).map((w) => (c += w.length)) } };
      }),
    };
  },
  dibujar(p, act) {
    const rayas = act.params.tarea !== "escribe", { cel, cw, ch } = p.celdas(TOP, 1, rayas ? 10 : 8, 10, 8);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { junta } = e.datos;
      p.marco(x, y, cw, ch, i);
      if (rayas) { palabraLetras(p, x + 40, y, cw - 56, ch, junta, { fs: 30, gap: 0.4, rayas: e.solucion.rayas }); return; }
      const fs = ajusta(p, (q) => p.ancho(junta, "PB", q), cw - 70, 24);
      p.text(x + cw / 2, y + ch * 0.74 - fs * 0.35, junta, fs, { f: "PB", anchor: "middle" });
      p.caja(x + 34, y + 9, cw - 52, 34, null, 20, e.solucion.huecos[0]);
    }));
  },
});
