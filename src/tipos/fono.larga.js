// fono.larga · La palabra más larga (Lengua 1.º, lote 2; LENGUA_1.md §3, bloque 1). Versión escrita.
// datos:    { palabras: [3 palabras, en el caso elegido], cual: "mas" | "menos" }
// solucion: { huecos: [], rodea: índice (0–2) de la palabra con más (o menos) sílabas }   (rodeada en rojo en la solución)
// Reglas: palabras del léxico; las 3 tienen un número de sílabas distinto (silabas() de reglas.js), así que la respuesta es única;
//         la correcta no va siempre en el mismo sitio; sin palabras repetidas. Palabras de hasta 9 letras (2.º: también con 5 sílabas).
//         «mezcla» = la mitad pide la que tiene más y la otra mitad la que tiene menos (cada grupo lo dice en su tarjeta).
// Opciones: rodear la que tiene (más / menos / mezcla) · tipo de sílabas · caso. Cantidad: 2 columnas; «Más grandes» 20 grupos (media: 10), «Más ejercicios» los que caben con tarjetas ≥ 44 pt. Las 3 palabras van en una fila de media tarjeta: la letra baja hasta que caben (palabras de 9 letras ≈ 11 pt).
import { registrar } from "../nucleo/tipos.js";
import { TOP, cuantosRejilla } from "../render/papel.js";
import { silabas } from "../lengua/reglas.js";
import { rodear } from "../lengua/dibujo.js";
import { avisoVistas } from "../lengua/vistas.js";
import { alCaso, candidatas, cuantas, ajusta, conTope, desde2, topeLetras } from "./_lengua.js";
import { repartir } from "./_fono.js";

const MIN_ALTO = 44;   // alto mínimo de tarjeta con «Más ejercicios»
const TRIPLES = [[1, 2, 3], [2, 3, 4], [1, 2, 4], [1, 3, 4], [2, 3, 4], [1, 2, 3]];
const TRIPLES_2 = [...TRIPLES, [3, 4, 5], [2, 3, 5], [2, 4, 5], [1, 3, 5]];   // 2.º: también con palabras de 5 sílabas

export default registrar({
  id: "fono.larga",
  version: 3,
  cantidad: true,
  generar(params, azar, ctx) {
    return conTope(cuantosRejilla(ctx, 2, MIN_ALTO, [20, 10]), cuantas(ctx.tamano, 10), (n) => grupos(params, azar, n));
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.rejilla(TOP, 2, Math.ceil(act.ejercicios.length / 2)), mezcla = act.params.cual === "mezcla";
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], ps = e.datos.palabras, gap = 8, rel = 0.3, lb = 11;   // ≥ 9 pt impresos
      p.marco(x, y, cw, ch, i);
      if (mezcla) p.text(x + 32, y + ch - 7 - lb, e.datos.cual === "mas" ? "Rodea la que tiene MÁS sílabas" : "Rodea la que tiene MENOS sílabas", lb, { f: "PB", gris: 0.3 });
      const w = cw - 32 - 8, fs = ajusta(p, (q) => ps.reduce((t, s) => t + p.ancho(s, "PB", q) + q * 2 * rel, 0) + gap * 2, w, Math.min(24, ch * (mezcla ? 0.3 : 0.4)), 10);
      rodear(p, x + 32, y - (mezcla ? lb * 0.6 : 0), w, ch, ps, e.solucion.rodea, { fs, gap, relleno: rel });
    }));
  },
});

/** n grupos de 3 palabras (con la regla de siempre). */
function grupos(params, azar, n) {
  const cuales = params.cual === "menos" ? Array(n).fill("menos") : params.cual === "mezcla" ? repartir(azar, n, ["mas", "menos"]) : Array(n).fill("mas");
  const bolsas = {};
  const largos = desde2() ? [1, 2, 3, 4, 5] : [1, 2, 3, 4], triples = desde2() ? TRIPLES_2 : TRIPLES;
  for (const l of largos) bolsas[l] = azar.barajar(candidatas(params, { nSilabas: l, maxLetras: topeLetras(9, 9) }));
  const ejercicios = [];
  for (let i = 0; i < n; i++) {
    const posibles = triples.filter((t) => t.every((l) => bolsas[l].length));
    if (!posibles.length) throw new Error(`«fono.larga» necesita más palabras: con esas opciones solo hay ${i} grupos y hacen falta ${n}. Prueba con otro tipo de sílabas.` + avisoVistas());
    let ws = azar.barajar(azar.elegir(posibles).map((l) => bolsas[l].pop().p));
    // 2.º: las tres palabras van en una fila de media tarjeta; con las de 5 sílabas (muy largas) y MAYÚSCULAS no cabrían a 9 pt si suman más de 22 letras:
    // se cambian por otras del mismo largo y, si no se puede, se pasa a un grupo de 1 a 4 sílabas
    for (let k = 0; desde2() && ws.reduce((t, w) => t + w.length, 0) > 22 && k < 40; k++) {
      const ls = ws.map((w) => silabas(w).length);
      if (!ls.every((l) => bolsas[l].length)) break;
      ws = azar.barajar(ls.map((l) => bolsas[l].pop().p));
    }
    if (desde2() && ws.reduce((t, w) => t + w.length, 0) > 22) {
      const cortos = TRIPLES.filter((t) => t.every((l) => bolsas[l].length));
      if (cortos.length) ws = azar.barajar(azar.elegir(cortos).map((l) => bolsas[l].pop().p));
    }
    const cuenta = ws.map((w) => silabas(w).length);
    const objetivo = cuales[i] === "mas" ? Math.max(...cuenta) : Math.min(...cuenta);
    ejercicios.push({ datos: { palabras: ws.map((w) => alCaso(w, params.caso)), cual: cuales[i] }, solucion: { huecos: [], rodea: cuenta.indexOf(objetivo) } });
  }
  return {
    enunciado: params.cual === "mezcla" ? "Lee lo que pide cada recuadro\ny rodea la palabra." : params.cual === "menos" ? "Rodea la palabra que tiene MENOS sílabas." : "Rodea la palabra que tiene MÁS sílabas.",
    ejercicios,
  };
}
