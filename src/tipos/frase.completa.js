// frase.completa · Completa la frase (Lengua 1.º, lote 3; LENGUA_1.md §3, bloque 5).
// datos:    { antes: "El", despues: "ladra.", opciones: [3 palabras barajadas] | null (sin ayuda), falta: "sujeto" | "objeto" }
//           (la frase es «antes ___ despues»; todo en el caso elegido)
// solucion: { huecos: ["perro"] }    la palabra que falta (en el caso elegido)
// Reglas: frases de _frase.js con persona o animal que hace algo (no las de «es»/«está»), sin repetir. «sujeto»: falta el nombre de después del artículo.
//         «objeto»: falta el nombre del final, solo en las frases con come, bebe o lee. Con ayuda, las dos distractoras son objetos de la casa
//         (mesa, silla, lápiz…) del mismo género y número que la correcta: ni un perro ni un cuaderno son otra respuesta válida, así que solo encaja una
//         (un objeto no ladra ni come; nadie come una mesa ni lee una puerta). Sin ayuda hay varias respuestas posibles: la solución es una de ellas.
// Con «el nombre del final» las frases son de 4 o 5 palabras (en las de 3 no hay complemento); con «mezcla», esas llevan las más largas.
// Opciones: qué falta (el nombre del principio / el del final / mezcla) · ayuda (tres palabras / sin ayuda) · palabras de cada frase (variadas / 3 / 4 / 5) ·
//           letra (minúscula / MAYÚSCULAS). Completa: 8 frases; media: 4.
import { registrar } from "../nucleo/tipos.js";
import { TOP, B, T } from "../render/papel.js";
import { cuantas, ajusta, pildoras, anchoPildoras } from "./_lengua.js";
import { elegirFrases, largosFrase, distractoras, frAlCaso } from "./_frase.js";
import { plural } from "../lengua/reglas.js";

const ACCION = new Set(["i", "im", "ob", "od", "lug"]);

export default registrar({
  id: "frase.completa",
  version: 1,
  generar(params, azar, { tamano }) {
    const n = cuantas(tamano, 8), falta = params.falta || "sujeto", sin = params.ayuda === "sin";
    // qué se oculta en cada ejercicio
    const tipos = falta === "sujeto" ? Array(n).fill("sujeto") : falta === "objeto" ? Array(n).fill("objeto") : azar.barajar(Array.from({ length: n }, (_, i) => (i % 2 ? "objeto" : "sujeto")));
    let largos = falta === "objeto" && !Number.isInteger(params.palabras) ? azar.barajar(Array.from({ length: n }, (_, i) => 4 + (i % 2))) : largosFrase(azar, n, params.palabras);
    if (falta === "mezcla" && !Number.isInteger(params.palabras)) {   // el nombre del final no cabe en las frases de 3 palabras: las largas, para esos
      const desc = [...largos].sort((a, b) => b - a), nuevo = [], objs = tipos.flatMap((t, i) => (t === "objeto" ? [i] : [])), sujs = tipos.flatMap((t, i) => (t === "objeto" ? [] : [i]));
      azar.barajar(objs).forEach((i, k) => { nuevo[i] = desc[k]; }); sujs.forEach((i, k) => { nuevo[i] = desc[objs.length + k]; });
      largos = nuevo;
    }
    const ya = new Set(), sujetos = new Set(), hechos = [];
    // primero las de «objeto» (más difíciles de encontrar), luego las de «sujeto»
    const orden = tipos.map((t, i) => i).sort((a, b) => (tipos[a] === "objeto" ? -1 : 0) - (tipos[b] === "objeto" ? -1 : 0));
    for (const i of orden) {
      const [f] = elegirFrases(azar, [largos[i]], { filtro: (x) => ACCION.has(x.tipo) && (tipos[i] === "sujeto" || !!x.obj) && !ya.has(x.id), id: "frase.completa", ya, sujetos });
      hechos[i] = f;
    }
    return {
      enunciado: sin ? "Escribe una palabra que complete la frase." : "Elige la palabra que completa la frase\ny escríbela en el cuadro gris.",
      ejercicios: hechos.map((f, i) => {
        const obj = tipos[i] === "objeto", pos = obj ? f.obj.i : 1, lema = obj ? f.obj.lema : f.suj.lema, num = obj ? f.obj.num : f.suj.num;
        const resp = num === "p" ? plural(lema) : lema, g = obj ? (f.obj.art ? f.obj.g : null) : f.suj.g;
        const ws = f.palabras.map((w, k) => (k === 0 ? w[0].toUpperCase() + w.slice(1) : w));
        const antes = ws.slice(0, pos).join(" "), despues = ws.slice(pos + 1).join(" ") + ".";
        const opciones = sin ? null : azar.barajar([resp, ...distractoras(azar, g, num, [lema])]);
        return { datos: { antes: frAlCaso(antes, params.caso), despues: frAlCaso(despues, params.caso), opciones: opciones && opciones.map((o) => frAlCaso(o, params.caso)), falta: tipos[i] }, solucion: { huecos: [frAlCaso(resp, params.caso)] } };
      }),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 1, 8, 10, 8);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { antes, despues, opciones } = e.datos, sol = e.solucion.huecos[0];
      p.marco(x, y, cw, ch, i);
      const bw = Math.max(110, ...(opciones || [sol]).map((o) => p.ancho(o, "PB", 22) + 30));
      const fs = ajusta(p, (q) => p.ancho(antes, "PB", q) + p.ancho(despues, "PB", q) + bw + 16, cw - 70, 24);
      const alto = opciones ? ch * 0.52 : ch;
      p.linea(x + 20, y + (opciones ? ch - alto : 0), cw - 40, alto, [T(antes, fs), B(bw, 36, sol), T(despues, fs)], despues === "." ? 4 : 8);
      if (opciones) {
        const f2 = 20, tot = anchoPildoras(p, opciones, f2, 14);
        pildoras(p, x + (cw - tot) / 2, y + 6, ch * 0.4, opciones, f2, 14);
      }
    }));
  },
});
