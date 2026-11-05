// Charta · invariantes de la familia «valor» (ver tests/invariantes.js).
import assert from "node:assert/strict";
import { ent, unicos, cuantos } from "./_ayuda.js";

const cap = (act) => Math.min(act.params.rango, 99);
/** Números según el nivel: «completas» = todo decenas completas; si no, 2 completas y el resto con unidades. */
function nivelDU(act, ns) {
  if (act.params.nivel === "completas") ns.forEach((n) => assert.equal(n % 10, 0, "decena no completa"));
  else assert.equal(ns.filter((n) => n % 10 === 0).length, 2, "nº de decenas completas");
}

export default {
  "valor.agrupa"(act, tam) {
    const es = act.ejercicios, C = Math.min(act.params.rango ?? 20, 49);
    cuantos(es, tam === "media" ? 2 : 6);
    unicos(es, (e) => e.datos.n, "números repetidos");
    assert.equal(es.filter((e) => e.datos.n % 10 === 0).length, 1, "una única decena completa");
    es.forEach(({ datos: { n, jit, forma }, solucion }, i) => {
      ent(n, 10, C, "n"); assert.equal(forma, "csqt"[i % 4]);
      assert.equal(jit.length, n, "un desvío por dibujo");
      assert.deepEqual(solucion.huecos, [Math.floor(n / 10), n % 10]);
    });
  },
  "valor.canje"(act, tam) {
    const es = act.ejercicios, C = cap(act);
    cuantos(es, tam === "media" ? 4 : 8);
    nivelDU(act, es.map((e) => e.datos.n));
    es.forEach(({ datos: { n }, solucion }) => { ent(n, 10, C, "n"); assert.deepEqual(solucion.huecos, [Math.floor(n / 10), n % 10]); });
    if (act.params.nivel !== "completas") unicos(es, (e) => e.datos.n, "números repetidos");
  },
  "valor.descdu"(act, tam) {
    const es = act.ejercicios, C = cap(act), suma = act.params.modo === "suma";
    cuantos(es, tam === "media" ? 6 : 15);
    es.forEach(({ datos: { n, suma: s }, solucion }) => {
      ent(n, 10, C, "n"); assert.equal(s, suma);
      assert.deepEqual(solucion.huecos, suma ? [Math.floor(n / 10) * 10, n % 10] : [Math.floor(n / 10), n % 10]);
      assert.equal(solucion.huecos[0] * (suma ? 1 : 10) + solucion.huecos[1], n);
    });
    if (act.params.nivel === "completas") es.forEach((e) => assert.equal(e.datos.n % 10, 0, "decena no completa"));
    else { assert.equal(es.filter((e) => e.datos.n % 10 === 0).length, 2, "nº de decenas completas"); unicos(es, (e) => e.datos.n, "números repetidos"); }
  },
  "valor.dunum"(act, tam) {
    const es = act.ejercicios, C = cap(act), cnt = tam === "media" ? 6 : 12;
    cuantos(es, cnt);
    nivelDU(act, es.map((e) => e.datos.n));
    assert.equal(es.filter((e) => e.datos.orden === "a").length, cnt / 2, "mitad y mitad");
    es.forEach(({ datos: { n, orden }, solucion }) => { ent(n, 10, C, "n"); assert.ok(orden === "a" || orden === "b"); assert.deepEqual(solucion.huecos, [n]); });
    if (act.params.nivel !== "completas") unicos(es, (e) => e.datos.n, "números repetidos");
  },
  "valor.pares"(act, tam) {
    const R = act.params.rango ?? 10, es = act.ejercicios;
    if (act.params.modo === "clasifica") {
      assert.equal(tam, "completa"); cuantos(es, 1);
      const { numeros, pares, impares } = es[0].datos, E = numeros.filter((v) => v % 2 === 0), O = numeros.filter((v) => v % 2);
      numeros.forEach((v) => ent(v, 1, R, "n")); unicos(numeros, (v) => v, "números repetidos");
      assert.equal(pares, Math.min(6, Math.floor(R / 2))); assert.equal(impares, Math.min(6, Math.ceil(R / 2)));
      assert.deepEqual([E.length, O.length], [pares, impares]);
      assert.deepEqual(es[0].solucion.huecos, [...E.sort((a, b) => a - b), ...O.sort((a, b) => a - b)]);
      return;
    }
    cuantos(es, tam === "media" ? 6 : 12);
    es.forEach(({ datos: { n }, solucion }) => { ent(n, 1, Math.min(R, 20), "n"); assert.deepEqual(solucion.huecos, []); assert.equal(solucion.rodea, n % 2 ? "impar" : "par"); });
    assert.equal(es.filter((e) => e.datos.n % 2 === 0).length, es.length / 2, "mitad pares y mitad impares");
  },
  "valor.cifra"(act, tam) {
    const es = act.ejercicios, C = cap(act);
    cuantos(es, tam === "media" ? 4 : 8);
    unicos(es, (e) => e.datos.n, "números repetidos");
    es.forEach(({ datos: { n }, solucion }) => {
      ent(n, 12, C, "n"); assert.ok(n % 10 !== 0 && Math.floor(n / 10) !== n % 10, "cifras iguales o unidades 0");
      assert.deepEqual(solucion.huecos, [Math.floor(n / 10) * 10, n % 10]);
    });
  },
};
