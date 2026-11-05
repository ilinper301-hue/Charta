// Charta · invariantes de la familia «estadistica» (ver tests/invariantes.js).
import assert from "node:assert/strict";
import { ent, unicos, cuantos } from "./_ayuda.js";

const NOMS = { c: "círculos", s: "estrellas", q: "cuadrados", t: "triángulos" };
const DE = Object.fromEntries(Object.entries(NOMS).map(([k, n]) => [n, k]));
const mismas = (kinds) => assert.deepEqual(kinds.slice().sort(), ["c", "q", "s", "t"], "figuras");
const max = (v) => Math.max(...v);

export default {
  "estadistica.pictograma"(act) {
    const dos = act.params.modo === "dos";
    cuantos(act.ejercicios, 1);
    const [{ datos: { dos: d, kinds, v, preguntas }, solucion }] = act.ejercicios;
    assert.equal(d, dos); mismas(kinds); unicos(v, (x) => x, "votos repetidos");
    v.forEach((x) => { ent(x, dos ? 2 : 1, 10, "votos"); if (dos) assert.equal(x % 2, 0, "con valor 2, votos pares"); });
    const total = v.reduce((s, x) => s + x, 0), val = (n) => v[kinds.indexOf(DE[n])];
    assert.equal(preguntas.length, total <= 20 ? 6 : 5, "nº de preguntas");
    const nums = [], eleg = [];
    for (const { tp, txt } of preguntas) {
      let m;
      if (tp === "c") eleg.push(txt === "¿Qué figura tiene más votos?" ? NOMS[kinds[v.indexOf(max(v))]] : NOMS[kinds[v.indexOf(Math.min(...v))]]);
      else if ((m = /^¿Cuántos votos tienen los (\S+)\?$/.exec(txt))) nums.push(val(m[1]));
      else if ((m = /^¿Cuántos votos más tienen los (\S+) que los (\S+)\?$/.exec(txt))) { nums.push(val(m[1]) - val(m[2])); assert.ok(val(m[1]) > val(m[2])); }
      else if (txt === "¿Cuántos votos hay en total?") nums.push(total);
      else assert.fail("pregunta desconocida: " + txt);
    }
    assert.deepEqual(solucion.huecos, nums); assert.deepEqual(solucion.elegir, eleg);
  },

  "estadistica.recuento"(act) {
    const R = act.params.rango ?? 10, mx = R <= 20 ? Math.min(R, 9) : 12;
    cuantos(act.ejercicios, 1);
    const [{ datos: { v, items }, solucion }] = act.ejercicios;
    assert.equal(v.length, 4); v.forEach((x) => ent(x, 2, mx, "cantidad"));
    assert.equal(items.length, v.reduce((s, x) => s + x, 0), "figuras dibujadas");
    "csqt".split("").forEach((k, j) => assert.equal(items.filter((i) => i[0] === k).length, v[j], `nº de ${NOMS[k]}`));
    items.forEach(([, jx, jy]) => { assert.ok(Math.abs(jx) <= 0.2 && Math.abs(jy) <= 0.15, "desvío"); });
    assert.equal(v.filter((x) => x === max(v)).length, 1, "figura más abundante no única");
    assert.deepEqual(solucion.huecos, v); assert.deepEqual(solucion.elegir, [NOMS["csqt"[v.indexOf(max(v))]]]);
  },

  "estadistica.barras"(act) {
    const lee = act.params.modo === "lee";
    cuantos(act.ejercicios, 1);
    const [{ datos: { lee: l, kinds, v, par }, solucion }] = act.ejercicios;
    assert.equal(l, lee); mismas(kinds); unicos(v, (x) => x, "valores repetidos"); v.forEach((x) => ent(x, 1, 10, "valor"));
    assert.equal(par.length, 2); unicos(par, (x) => x); par.forEach((i) => ent(i, 0, 3, "columna"));
    const tot = v[par[0]] + v[par[1]];
    assert.deepEqual(solucion.huecos, lee ? [...v, tot] : [tot]); assert.deepEqual(solucion.elegir, [NOMS[kinds[v.indexOf(max(v))]]]);
  },

  "estadistica.patrones"(act, tam) {
    const hueco = act.params.modo === "hueco", es = act.ejercicios;
    cuantos(es, tam === "media" ? 4 : 8);
    for (const { datos: { patron, seq, vac, n }, solucion } of es) {
      assert.ok(["AB", "AAB", "ABB", "ABC", "AABB"].includes(patron), "patrón");
      const L = hueco ? 10 : 11, vis = 2 * patron.length + (patron.length <= 3 ? 1 : 0);
      assert.equal(seq.length, L);
      const mp = {};
      seq.forEach((k, j) => { const l = patron[j % patron.length]; assert.equal((mp[l] ??= k), k, "el patrón no se repite"); });
      assert.equal(new Set(Object.values(mp)).size, Object.keys(mp).length, "letras distintas, figuras distintas");
      seq.forEach((k) => assert.ok("csqt".includes(k)));
      if (hueco) {
        assert.equal(n, L); assert.equal(vac.length, 3, "huecos");
        vac.forEach((j) => ent(j, patron.length + 1, L - 1, "posición del hueco"));
      } else {
        assert.equal(n, Math.min(L, vis + 3)); assert.deepEqual(vac, Array.from({ length: n - vis }, (_, i) => vis + i), "huecos al final");
        assert.equal(vac.length, 3);
      }
      assert.deepEqual(vac, [...new Set(vac)].sort((x, y) => x - y));
      assert.deepEqual(solucion.figuras, vac.map((j) => seq[j])); assert.deepEqual(solucion.huecos, []);
    }
  },
};
