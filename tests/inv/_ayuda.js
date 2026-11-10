// Charta · ayudantes para las invariantes (tests/invariantes.js y tests/inv/<familia>.js).
import assert from "node:assert/strict";
import { RANGOS, maximo, nombreNumero } from "../../src/rep/index.js";

export const ent = (v, lo, hi, q) => assert.ok(Number.isInteger(v) && v >= lo && v <= hi, `${q} = ${v} fuera de ${lo}..${hi}`);
export const unicos = (es, f, q = "repetidos") => assert.equal(new Set(es.map(f)).size, es.length, q);
export const cuantos = (es, n) => assert.equal(es.length, n, `ejercicios: ${es.length} ≠ ${n}`);
/** Nivel «mezcla»: exactamente la mitad con llevada. */
export const mitad = (es, lleva) => assert.equal(es.filter(lleva).length, es.length / 2, "mezcla: no hay mitad y mitad");

export function rep(nombre) {
  const [lo] = RANGOS[nombre];
  return (act, tam) => {
    const R = act.params.rango ?? 10, hi = maximo(nombre, R), lect = !!act.params.lectura, comp = tam === "completa";
    const leer = act.ejercicios.filter((e) => e.datos.accion === "leer"), dib = act.ejercicios.filter((e) => e.datos.accion === "dibujar");
    assert.equal(leer.length, comp ? (lect ? 12 : 9) : (lect ? 6 : 3), "nº de leer");
    assert.equal(dib.length, lect ? 0 : 3, "nº de dibujar");
    assert.deepEqual(act.ejercicios, [...leer, ...dib], "primero leer, después dibujar");
    for (const e of act.ejercicios) {
      assert.equal(e.datos.rep, nombre);
      ent(e.datos.n, lo, hi, "n");
      assert.ok(e.datos.n <= R, "n > rango");
      assert.equal(e.datos.centenas, R > 100 ? true : undefined, "centenas solo con rango > 100");
      if (nombre === "letras") { const t = nombreNumero(e.datos.n); assert.ok(typeof t === "string" && t && !/\d|undefined/.test(t), `nombreNumero(${e.datos.n}) = ${t}`); }
      assert.deepEqual(e.solucion.huecos, e.datos.accion === "leer" ? [e.datos.n] : []);
    }
  };
}

// 2.º (rango > 100, tres cifras): hasta R (no 99) y llevada en CUALQUIER columna. Comprobación independiente de
// src/tipos/_tres.js: hay llevada si la suma de las cifras no se conserva.
export const tope = (R) => (R > 100 ? R : Math.min(R, 99));
const sc = (n) => String(n).split("").reduce((s, c) => s + +c, 0);
export const llevaS3 = (a, b) => sc(a) + sc(b) !== sc(a + b);
export const llevaR3 = (a, b) => sc(a - b) + sc(b) !== sc(a);
/** Niveles en tres cifras: sin = ninguna, con = todas, mezcla = mitad. pares: [[a, b], …]. */
export function niveles3(pares, nivel, lleva, q = "") {
  const n = pares.filter(([a, b]) => lleva(a, b)).length;
  if ((nivel || "sin") === "sin") assert.equal(n, 0, `sin: hay llevadas ${q}`);
  if (nivel === "con") assert.equal(n, pares.length, `con: falta llevada ${q}`);
  if (nivel === "mezcla") assert.equal(n, pares.length / 2, `mezcla: no hay mitad y mitad ${q}`);
}

// Lote 2 · sumas y restas en vertical (columnas C, D, U), niveles «u», «d», «ud». Comprobación independiente de _tres.js:
// llevadas columna a columna con las cifras, como se hace a mano.
const cif = (n) => [n % 10, Math.floor(n / 10) % 10, Math.floor(n / 100) % 10];
/** Suma de xs: [llevada de U a D, llevada de D a C] (cantidades). */
export function colsSuma(xs) {
  let c = 0; const out = [];
  for (const k of [0, 1]) { const s = xs.reduce((t, v) => t + cif(v)[k], c); c = (s - (s % 10)) / 10; out.push(c); }
  return out;
}
/** a − b: [¿se pide en U?, ¿se pide en D?]. */
export function colsResta(a, b) {
  const x = cif(a), y = cif(b), pu = y[0] > x[0];
  return [pu, y[1] + (pu ? 1 : 0) > x[1]];
}
/** Nivel en vertical: llevs = [[¿U?, ¿D?], …] por ejercicio (booleanos). sin · con · mezcla · u · d · ud. */
export function nivelesV(llevs, nivel, q = "") {
  nivel = nivel || "sin";
  const alguna = ([u, d]) => u || d;
  const todos = (f, m) => assert.ok(llevs.every(f), `${nivel}: ${m} ${q}`);
  if (nivel === "sin") todos((l) => !alguna(l), "hay llevadas");
  if (nivel === "con") todos(alguna, "falta llevada");
  if (nivel === "mezcla") assert.equal(llevs.filter(alguna).length, llevs.length / 2, `mezcla: no hay mitad y mitad ${q}`);
  if (nivel === "u") todos(([u, d]) => u && !d, "debe llevar solo en U");
  if (nivel === "d") todos(([u, d]) => !u && d, "debe llevar solo en D");
  if (nivel === "ud") todos(([u, d]) => u && d, "debe llevar en U y en D");
}
/** Las tres cifras (C, D, U) de t ≤ 999. */
export const cdu = (t) => [Math.floor(t / 100), Math.floor(t / 10) % 10, t % 10];
