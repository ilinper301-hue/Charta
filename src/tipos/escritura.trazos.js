// escritura.trazos · Trazos (Lengua 1.º, lote 4; LENGUA_1.md §3, bloque 8): grafomotricidad en la pauta Lamela.
// datos:    { familia: "lineas" | "ondas" | "bucles" | "puentes" | "arcos" | "zigzag" | "circulos", variante: "horizontales"…, nombre: "Líneas horizontales", libres: 1 }
//           (cada ejercicio es un bloque de renglones: 1.º el trazo en negro con punto verde de inicio las dos primeras veces y en gris el resto para repasar,
//            2.º el mismo trazo punteado, y `libres` renglones en blanco para seguir)
// solucion: { huecos: [] }   no hay corrección
// Reglas: completa 4 bloques, media 2; sin repetir (familia, variante). Con «Variados», cada bloque es de una familia distinta; con una familia,
//         cada bloque es una variante distinta de ella. Renglones: 2 guiados + libres por bloque, repartidos para llenar la página (filasDe).
// Opciones: tipo de trazo (variados / líneas / ondas / bucles / puentes / arcos / zigzag / círculos) · tamaño de pauta (5, 4, 3,5 mm).
import { registrar } from "../nucleo/tipos.js";
import { cuantas } from "./_lengua.js";
import { FAMILIAS_TRAZO, patronTrazo, pintarTrazos, celdasQueCaben, contexto, recortar, repartirLibres, filasDe, mmDe } from "./_escritura.js";
import { renglones } from "../lengua/pauta.js";

const IDS = Object.keys(FAMILIAS_TRAZO);

export default registrar({
  id: "escritura.trazos",
  version: 1,
  generar(params, azar, { tamano }) {
    const n = cuantas(tamano, 4), mm = mmDe(params);
    const elegidos = params.trazo
      ? azar.muestra(FAMILIAS_TRAZO[params.trazo].variantes, n).map((v) => [params.trazo, v])
      : azar.muestra(IDS, n).map((f) => [f, azar.elegir(FAMILIAS_TRAZO[f].variantes)]);
    const libres = repartirLibres(filasDe(tamano, mm), Array(n).fill(2));
    return {
      enunciado: "Repasa los trazos con el lápiz\ny sigue tú en los renglones libres.",
      ejercicios: elegidos.map(([f, v], i) => ({ datos: { familia: f, variante: v[0], nombre: v[1], libres: libres[i] }, solucion: { huecos: [] } })),
    };
  },
  dibujar(p, act) {
    const ctx = contexto(p, act), { c, paso, x0, x1 } = ctx, es = act.ejercicios;
    const libres = recortar(es.map((e) => e.datos.libres), es.map(() => 2), ctx.caben);
    let y = ctx.yTop;
    es.forEach((e, i) => p.ejercicio(e.id, () => {
      const n = 2 + libres[i], { bases } = renglones(p, x0, x1, y, n, { mm: ctx.mm });
      const patron = patronTrazo(e.datos.familia, e.datos.variante), q = celdasQueCaben(patron, (x1 - x0 - 1.2 * c) / c), xi = x0 + 0.6 * c;
      const k = Math.min(2, q - 1);
      pintarTrazos(p, patron.hacer(0, k), xi, bases[0], c, "modelo");
      pintarTrazos(p, patron.hacer(k, q), xi, bases[0], c, "repaso");
      pintarTrazos(p, patron.hacer(0, q), xi, bases[1], c, "punteado");
      y -= n * paso;
    }));
  },
});
