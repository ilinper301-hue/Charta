// fono.larga · La palabra más larga (Lengua 1.º, lote 2; LENGUA_1.md §3, bloque 1). Versión escrita.
// datos:    { palabras: [3 palabras, en el caso elegido], cual: "mas" | "menos" }
// solucion: { huecos: [], rodea: índice (0–2) de la palabra con más (o menos) sílabas }   (rodeada en rojo en la solución)
// Reglas: palabras del léxico; las 3 tienen un número de sílabas distinto (silabas() de reglas.js), así que la respuesta es única;
//         la correcta no va siempre en el mismo sitio; sin palabras repetidas. Palabras de hasta 9 letras.
//         «mezcla» = la mitad pide la que tiene más y la otra mitad la que tiene menos (cada grupo lo dice en su tarjeta).
// Opciones: rodear la que tiene (más / menos / mezcla) · tipo de sílabas · caso. Completa: 10 grupos; media: 5.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { silabas } from "../lengua/reglas.js";
import { rodear } from "../lengua/dibujo.js";
import { alCaso, candidatas, cuantas, ajusta } from "./_lengua.js";
import { repartir } from "./_fono.js";

const TRIPLES = [[1, 2, 3], [2, 3, 4], [1, 2, 4], [1, 3, 4], [2, 3, 4], [1, 2, 3]];

export default registrar({
  id: "fono.larga",
  version: 1,
  generar(params, azar, { tamano }) {
    const n = cuantas(tamano, 10), cuales = params.cual === "menos" ? Array(n).fill("menos") : params.cual === "mezcla" ? repartir(azar, n, ["mas", "menos"]) : Array(n).fill("mas");
    const bolsas = {};
    for (const l of [1, 2, 3, 4]) bolsas[l] = azar.barajar(candidatas(params, { nSilabas: l, maxLetras: 9 }));
    const ejercicios = [];
    for (let i = 0; i < n; i++) {
      const posibles = TRIPLES.filter((t) => t.every((l) => bolsas[l].length));
      if (!posibles.length) throw new Error(`«fono.larga» necesita más palabras: con esas opciones solo hay ${i} grupos y hacen falta ${n}. Prueba con otro tipo de sílabas.`);
      const ws = azar.barajar(azar.elegir(posibles).map((l) => bolsas[l].pop().p)), cuenta = ws.map((w) => silabas(w).length);
      const objetivo = cuales[i] === "mas" ? Math.max(...cuenta) : Math.min(...cuenta);
      ejercicios.push({ datos: { palabras: ws.map((w) => alCaso(w, params.caso)), cual: cuales[i] }, solucion: { huecos: [], rodea: cuenta.indexOf(objetivo) } });
    }
    return {
      enunciado: params.cual === "mezcla" ? "Lee lo que pide cada recuadro\ny rodea la palabra." : params.cual === "menos" ? "Rodea la palabra que tiene MENOS sílabas." : "Rodea la palabra que tiene MÁS sílabas.",
      ejercicios,
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 1, 10, 10, 8), mezcla = act.params.cual === "mezcla";
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], ps = e.datos.palabras, gap = 22;
      p.marco(x, y, cw, ch, i);
      if (mezcla) p.text(x + 34, y + ch - 19, e.datos.cual === "mas" ? "Rodea la que tiene MÁS sílabas" : "Rodea la que tiene MENOS sílabas", 10, { f: "PB", gris: 0.3 });
      const fs = ajusta(p, (q) => ps.reduce((t, w) => t + p.ancho(w, "PB", q) + q * 0.9, 0) + gap * 2, cw - 40, mezcla ? 20 : 26);
      rodear(p, x + 10, y - (mezcla ? 10 : 0), cw - 20, ch, ps, e.solucion.rodea, { fs, gap });
    }));
  },
});
