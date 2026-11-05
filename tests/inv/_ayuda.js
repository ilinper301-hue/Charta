// Charta · ayudantes para las invariantes (tests/invariantes.js y tests/inv/<familia>.js).
import assert from "node:assert/strict";
import { RANGOS } from "../../src/rep/index.js";

export const ent = (v, lo, hi, q) => assert.ok(Number.isInteger(v) && v >= lo && v <= hi, `${q} = ${v} fuera de ${lo}..${hi}`);
export const unicos = (es, f, q = "repetidos") => assert.equal(new Set(es.map(f)).size, es.length, q);
export const cuantos = (es, n) => assert.equal(es.length, n, `ejercicios: ${es.length} ≠ ${n}`);
/** Nivel «mezcla»: exactamente la mitad con llevada. */
export const mitad = (es, lleva) => assert.equal(es.filter(lleva).length, es.length / 2, "mezcla: no hay mitad y mitad");

export function rep(nombre) {
  const [lo, max] = RANGOS[nombre];
  return (act, tam) => {
    const R = act.params.rango ?? 10, hi = Math.min(R, max), lect = !!act.params.lectura, comp = tam === "completa";
    const leer = act.ejercicios.filter((e) => e.datos.accion === "leer"), dib = act.ejercicios.filter((e) => e.datos.accion === "dibujar");
    assert.equal(leer.length, comp ? (lect ? 12 : 9) : (lect ? 6 : 3), "nº de leer");
    assert.equal(dib.length, lect ? 0 : 3, "nº de dibujar");
    assert.deepEqual(act.ejercicios, [...leer, ...dib], "primero leer, después dibujar");
    for (const e of act.ejercicios) {
      assert.equal(e.datos.rep, nombre);
      ent(e.datos.n, lo, hi, "n");
      assert.deepEqual(e.solucion.huecos, e.datos.accion === "leer" ? [e.datos.n] : []);
    }
  };
}
