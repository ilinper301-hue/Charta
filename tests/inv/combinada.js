// Charta · invariantes de la familia «combinada» y de «suma» (ver tests/invariantes.js).
import assert from "node:assert/strict";
import { RANGOS } from "../../src/rep/index.js";
import { ent, unicos, cuantos } from "./_ayuda.js";

const COMB_30 = ["dedos", "marco", "descomp", "dado", "palotes", "recta", "regletas", "letras", "objetos", "marco", "domino", "domino"];
const COMB_100 = ["bloques", "cuadricula", "monedas", "letras", "descomp", "recta", "palotes", "regletas", "abaco", "du", "cuadricula", "atados"];
const RES_30 = ["marco", "palotes", "recta", "regletas", "objetos", "domino"];
const POOL_30 = ["dedos", "dado", "marco", "objetos", "domino", "regletas", "palotes", "letras", "recta"];
const RES_100 = ["abaco", "bloques", "cuadricula", "monedas", "du", "recta"];
const POOL_100 = ["bloques", "monedas", "cuadricula", "letras", "recta", "atados", "regletas", "du", "abaco", "palotes"];

export default {
  "combinada.combinada"(act, tam) {
    const R = act.params.rango ?? 20, claves = R <= 30 ? COMB_30 : COMB_100, es = act.ejercicios;
    cuantos(es, tam === "media" ? 6 : 12);
    es.forEach(({ datos: { rep, n }, solucion }, i) => {
      assert.equal(rep, claves[i], "representación de la casilla");
      const [lo, max] = RANGOS[rep]; ent(n, lo, Math.min(max, R), `n (${rep})`);
      assert.deepEqual(solucion.huecos, [n]);
    });
    es.forEach((a, i) => es.slice(i + 1).forEach((b, k) => {
      const j = i + 1 + k;
      if (Math.abs(Math.floor(i / 3) - Math.floor(j / 3)) <= 1 && Math.abs(i % 3 - j % 3) <= 1)
        assert.notEqual(a.datos.n, b.datos.n, `casillas vecinas ${i + 1} y ${j + 1} con el mismo número`);
    }));
    if (tam === "completa") {
      const cnt = new Map(); for (const e of es) cnt.set(e.datos.n, (cnt.get(e.datos.n) || 0) + 1);
      assert.ok([...cnt.values()].filter((v) => v >= 2).length >= 3, "menos de 3 números repetidos");
      assert.ok(cnt.size >= 7, "menos de 7 números distintos");
    }
  },

  "suma.suma"(act, tam) {
    const R = act.params.rango ?? 20, [res, pool] = R <= 30 ? [RES_30, POOL_30] : [RES_100, POOL_100], es = act.ejercicios;
    cuantos(es, tam === "media" ? 3 : 6);
    unicos(es, (e) => e.datos.total, "totales repetidos");
    unicos(es, (e) => e.datos.repRes, "representación del resultado repetida");
    for (const { datos: { repA, a, repB, b, repRes, total }, solucion } of es) {
      assert.ok(res.includes(repRes), `resultado con ${repRes}`);
      assert.ok(pool.includes(repA) && pool.includes(repB), "representación fuera de la lista");
      assert.ok(repA !== repRes && repB !== repRes && repA !== repB, "representaciones repetidas en la fila");
      ent(a, RANGOS[repA][0], RANGOS[repA][1], `a (${repA})`); ent(b, RANGOS[repB][0], RANGOS[repB][1], `b (${repB})`);
      assert.equal(a + b, total);
      ent(total, 4, Math.min(R, RANGOS[repRes][1]), `total (${repRes})`);
      assert.deepEqual(solucion.huecos, [a, b, total]);
    }
    if (tam === "completa") assert.deepEqual([...es.map((e) => e.datos.repRes)].sort(), [...res].sort(), "una fila por representación");
  },
};
