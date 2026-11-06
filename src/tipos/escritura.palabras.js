// escritura.palabras · Copia palabras (Lengua 1.º, lote 4; LENGUA_1.md §3, bloque 8).
// datos:    { palabra: "mesa", libres: 1 }   (palabra ya en el caso pedido; cada ejercicio es un bloque: 1 renglón de modelo (negro, punto verde de inicio),
//           1 de repaso (gris, la palabra repetida a lo ancho) y `libres` renglones en blanco para copiarla)
// solucion: { huecos: [] }   no hay corrección
// Reglas: palabras del léxico (nombres, adjetivos y verbos) con las opciones comunes (tipo de sílabas, letra, caso), distintas, de 1 a 3 sílabas, solo con
//         letras que existen en trazos (hayTrazo) y que caben en una línea de la pauta (cabeEnLinea). Completa 4, media 2. Con «Mayúscula inicial» no entran las que
//         empiezan por «i». La opción «letra» = todas las palabras llevan esa letra (la «letra trabajada»; la «sílaba trabajada» llegará con el orden del método).
// Opciones: con la letra (todas / a–z) · tipo de sílabas · letra (minúscula / mayúscula inicial / MAYÚSCULAS) · pauta (5, 4, 3,5 mm).
import { registrar } from "../nucleo/tipos.js";
import { cuantas, elegirPalabras, alCaso } from "./_lengua.js";
import { hayTrazo } from "../lengua/trazos.js";
import { contexto, recortar, repartirLibres, filasDe, mmDe, escribir, repetir, cabeEnLinea } from "./_escritura.js";
import { renglones } from "../lengua/pauta.js";

export default registrar({
  id: "escritura.palabras",
  version: 1,
  generar(params, azar, { tamano }) {
    const n = cuantas(tamano, 4), mm = mmDe(params);
    const extra = params.letra ? { conLetra: params.letra } : {};
    const ok = (e) => { const t = alCaso(e.p, params.caso); return [...t].every(hayTrazo) && cabeEnLinea(t, tamano, mm); };
    const ps = elegirPalabras(azar, n, params, [2, 3, 1, 2, 3], { extra, ok, id: "escritura.palabras" });
    const libres = repartirLibres(filasDe(tamano, mm), Array(n).fill(2));
    return {
      enunciado: params.letra ? `Copia las palabras con la letra «${params.letra}».\nMira el modelo y repasa antes de escribir.` : "Copia las palabras.\nMira el modelo y repasa antes de escribir.",
      ejercicios: ps.map((x, i) => ({ datos: { palabra: alCaso(x.p, params.caso), libres: libres[i] }, solucion: { huecos: [] } })),
    };
  },
  dibujar(p, act) {
    const ctx = contexto(p, act), { c, paso, x0, x1 } = ctx, es = act.ejercicios;
    const libres = recortar(es.map((e) => e.datos.libres), es.map(() => 2), ctx.caben);
    let y = ctx.yTop;
    es.forEach((e, i) => p.ejercicio(e.id, () => {
      const n = 2 + libres[i], { bases } = renglones(p, x0, x1, y, n, { mm: ctx.mm });
      escribir(p, e.datos.palabra, x0 + 0.6 * c, bases[0], c, "modelo");
      repetir(p, e.datos.palabra, x0 + 0.6 * c, x1, bases[1], c, "repaso", { sep: 1.6 });
      y -= n * paso;
    }));
  },
});
