// medida.equivale · Cambia de unidad (3.º, lote 6, bloque 10; solo curso 3, sin rango).
// datos:    { a: [cantidad (texto), unidad], b: unidad, mag: "longitud" | "masa" | "capacidad" }   («3 km = ▢ m», «2000 g = ▢ kg», «½ l = ▢ ml»)
// solucion: { huecos: [n] }
// Equivalencias: 1 km = 1000 m · 1 m = 100 cm · 1 cm = 10 mm · 1 kg = 1000 g · 1 l = 1000 ml; también ½, ¼ y ¾ de kg y de l (500, 250 y 750).
// Opciones: magnitud (None = longitud, masa y capacidad por turnos · "longitud" · "masa" · "capacidad") · modo (None = los dos sentidos · "mayor" = de la unidad grande a la pequeña · "menor" = al revés).
// Sin repetir ejercicio. Rejilla elástica de 2 columnas con «Cantidad»: «Más grandes» = 12 y 6; «Más ejercicios» = las filas que caben (tarjetas ≥ 54 pt) sin pasar del banco.
import { registrar } from "../nucleo/tipos.js";
import { T, B } from "../render/papel.js";
import { cuantos, pintarEl, MIN_OP } from "./_elastica.js";

/** [unidad grande, unidad pequeña, cuántas pequeñas caben en una grande, múltiplos (de la grande) que se piden, fracciones] por par. */
export const PARES = {
  longitud: [["km", "m", 1000, [1, 2, 3, 4, 5, 6, 8, 9], false], ["m", "cm", 100, [1, 2, 3, 4, 5, 6, 7, 8, 9], false], ["cm", "mm", 10, [1, 2, 3, 4, 5, 6, 7, 8, 9], false]],
  masa: [["kg", "g", 1000, [1, 2, 3, 4, 5, 6, 8, 9], true]],
  capacidad: [["l", "ml", 1000, [1, 2, 3, 4, 5, 6, 8, 9], true]],
};
const FRAC = [["½", 1 / 2], ["¼", 1 / 4], ["¾", 3 / 4]];
const ORDEN = ["longitud", "masa", "capacidad"];

/** Todos los ejercicios de una magnitud: {a: [texto, unidad], b, sol, sentido, mag}. */
export function banco(mag) {
  const out = [];
  for (const [g, c, f, ks, frac] of PARES[mag]) {
    for (const k of ks) {
      out.push({ a: [String(k), g], b: c, sol: k * f, sentido: "mayor", mag });
      out.push({ a: [String(k * f), c], b: g, sol: k, sentido: "menor", mag });
    }
    if (frac) for (const [t, v] of FRAC) out.push({ a: [t, g], b: c, sol: v * f, sentido: "mayor", mag });
  }
  return out;
}

export default registrar({
  id: "medida.equivale",
  version: 1,
  cantidad: true,
  generar(params, azar, ctx) {
    const mags = params.magnitud ? [params.magnitud] : ORDEN, modo = params.modo ?? null;
    const colas = mags.map((m) => azar.barajar(banco(m).filter((e) => !modo || e.sentido === modo)));
    const total = colas.reduce((t, c) => t + c.length, 0);
    const cnt = Math.min(cuantos(ctx, 2, MIN_OP, [12, 6], total), Math.floor(total / 2) * 2);   // filas de 2 completas
    const sel = [];
    for (let i = 0; sel.length < cnt; i++) {   // una magnitud por turno; si a una no le quedan, la siguiente
      const cola = colas[i % colas.length];
      if (cola.length) sel.push(cola.shift());
      else if (!colas.some((c) => c.length)) break;
    }
    const ejercicios = azar.barajar(sel).map((e) => ({ datos: { a: e.a, b: e.b, mag: e.mag }, solucion: { huecos: [e.sol] } }));
    return { enunciado: "Escribe el número que falta.", ejercicios };
  },
  dibujar(p, act) {
    const es = act.ejercicios;
    const items = (e) => {
      const { a: [n, u], b } = e.datos, h = e.solucion.huecos[0];
      return [T(`${n} ${u} =`, 19), B(Math.max(60, 14 * String(h).length + 22), 38, h), T(b, 19)];
    };
    pintarEl(p, 2, es.map(items), es.map((e) => e.id), es.length / 2, 8, 14);
  },
});
