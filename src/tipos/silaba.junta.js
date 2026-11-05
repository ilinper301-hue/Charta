// silaba.junta · Junta las sílabas (Lengua 1.º, lote 1; LENGUA_1.md §3, bloque 3).
// Tarea «escribir» (10 filas; media 5): datos { silabas: [2–3 sílabas, en el caso elegido], palabra }  solucion { huecos: [palabra] }
// Tarea «une» (8 filas; media 4; solo palabras de 2 sílabas): datos { izq: primera sílaba, derecha: segunda sílaba de la caja de la derecha de esta fila }
//                                                        solucion { huecos: [], une: índice de la fila cuya caja de la derecha lleva la segunda sílaba }
// Reglas: palabra del léxico con el silabeo de reglas.js. Al unir, ninguna primera sílaba forma otra palabra del léxico con la segunda de otra fila
//         y no se repiten primeras ni segundas sílabas (una sola unión posible por fila).
// Opciones: tarea · sílabas (2 / 3 / 2 y 3) · tipo de sílabas · caso. Sin palabras repetidas.
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, T, B } from "../render/papel.js";
import { unir } from "../lengua/dibujo.js";
import { LEXICO } from "../lengua/lexico.js";
import { silabas } from "../lengua/reglas.js";
import { alCaso, trozosCaso, cuantas, elegirPalabras, candidatas } from "./_lengua.js";

const PALABRAS = new Set(LEXICO.map((e) => e.p));

export default registrar({
  id: "silaba.junta",
  version: 1,
  generar(params, azar, { tamano }) {
    const une = params.tarea === "une", largo = params.largo ?? 2;
    if (une && largo !== 2) throw new Error("«silaba.junta» necesita palabras de 2 sílabas para unir (con 3 sílabas, escribe la palabra).");
    const largos = largo === "variadas" ? [2, 3] : [largo];
    if (!une) {
      const n = cuantas(tamano, 10);
      return {
        enunciado: "Junta las sílabas y escribe la palabra.",
        ejercicios: elegirPalabras(azar, n, params, largos, { extra: { maxLetras: 9 }, id: "silaba.junta" }).map(({ p }) => {
          const ss = trozosCaso(silabas(p), params.caso);
          return { datos: { silabas: ss, palabra: alCaso(p, params.caso) }, solucion: { huecos: [alCaso(p, params.caso)] } };
        }),
      };
    }
    const n = cuantas(tamano, 8), usadas = { a: new Set(), b: new Set() }, elegidas = [];
    for (const e of azar.barajar(candidatas(params, { nSilabas: 2, maxLetras: 9 }))) {
      const [a, b] = silabas(e.p);
      if (a.length < 2 || b.length < 2) continue;      // sin sílabas de una sola letra («o», «a»): se leen mal sueltas
      if (usadas.a.has(a) || usadas.b.has(b) || a === b) continue;
      if (elegidas.some(([c, d]) => PALABRAS.has(a + d) || PALABRAS.has(c + b))) continue;
      elegidas.push([a, b]); usadas.a.add(a); usadas.b.add(b);
      if (elegidas.length === n) break;
    }
    if (elegidas.length < n) throw new Error(`«silaba.junta» necesita más palabras para unir: con esas opciones solo hay ${elegidas.length} y hacen falta ${n}.`);
    let der = azar.barajar(elegidas.map(([, b]) => b));
    while (der.every((b, i) => b === elegidas[i][1])) der = azar.barajar(der);
    const izq = (s) => alCaso(s, params.caso), der2 = (s) => (params.caso === "mayus" ? s.toUpperCase() : s);
    return {
      enunciado: "Une las sílabas de las dos columnas\npara formar palabras.",
      ejercicios: elegidas.map(([a, b], i) => ({
        datos: { izq: izq(a), derecha: der2(der[i]) },
        solucion: { huecos: [], une: der.indexOf(b) },
      })),
    };
  },
  dibujar(p, act) {
    const es = act.ejercicios;
    if (es[0].datos.izq !== undefined) {
      const h = (TOP - M) * p.parte;
      unir(p, M, TOP - h, W - 2 * M, h, es.map((e) => e.datos.izq), es.map((e) => e.datos.derecha), es.map((e) => e.solucion.une), { fs: 28, ids: es.map((e) => e.id) });
      return;
    }
    const { cel, cw, ch } = p.celdas(TOP, 1, 10, 10, 8);
    es.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], ss = e.datos.silabas, fs = 26;
      p.marco(x, y, cw, ch, i);
      const items = [];
      ss.forEach((s, k) => { if (k) items.push(T("+", 22)); items.push(T(s, fs)); });
      items.push(T("=", 24), B(210, 40, e.solucion.huecos[0]));
      p.linea(x + 30, y, cw - 40, ch, items, 12);
    }));
  },
});
