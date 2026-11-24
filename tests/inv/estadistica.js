// Charta · invariantes de la familia «estadistica» (ver tests/invariantes.js).
import assert from "node:assert/strict";
import { ent, unicos, cuantos } from "./_ayuda.js";
import { RELLENOS, RESPUESTAS, suceso, respuesta } from "../../src/tipos/estadistica.probable.js";

const NOMS = { c: "círculos", s: "estrellas", q: "cuadrados", t: "triángulos" };
const DE = Object.fromEntries(Object.entries(NOMS).map(([k, n]) => [n, k]));
const mismas = (kinds) => assert.deepEqual(kinds.slice().sort(), ["c", "q", "s", "t"], "figuras");
const max = (v) => Math.max(...v);
const MODA = "¿Cuál es la moda? (la figura que más se repite)";
const unica = (v) => assert.equal(v.filter((x) => x === max(v)).length, 1, "la moda no es única");

/** 3.º (lote 7): dos clases. Las preguntas se corrigen a partir de los datos. `v` = clase A, `w` = clase B. Devuelve las respuestas numéricas y las de elegir, en orden. */
function dosClases({ kinds, v, w, preguntas }, { moda, minimo, maximo, paso = 1 }) {
  mismas(kinds); assert.equal(v.length, 4); assert.equal(w.length, 4);
  for (const S of [v, w]) { unicos(S, (x) => x, "valores repetidos en una clase"); S.forEach((x) => ent(x / paso, minimo, maximo, "valor")); unica(S); }
  v.forEach((x, j) => assert.notEqual(x, w[j], "A y B iguales en una figura"));
  assert.equal(preguntas.length, 4);
  const clase = { A: v, B: w }, val = (n, c) => clase[c][kinds.indexOf(DE[n])], nums = [], eleg = [];
  preguntas.forEach(({ tp, txt, op }) => {
    let m;
    if (tp === "c") {
      if ((m = /^¿En qué clase hay más (?:votos de )?(\S+)\?$/.exec(txt))) { assert.deepEqual(op, ["Clase A", "Clase B"]); eleg.push(val(m[1], "A") > val(m[1], "B") ? "Clase A" : "Clase B"); }
      else if ((m = /^¿Cuál es la moda de la clase ([AB])\?$/.exec(txt))) { assert.ok(moda, "pregunta de moda sin pedirla"); assert.deepEqual(op.slice().sort(), Object.values(NOMS).sort()); eleg.push(NOMS[kinds[clase[m[1]].indexOf(max(clase[m[1]]))]]); }
      else assert.fail("pregunta de elegir desconocida: " + txt);
    } else if ((m = /^¿Cuántos (?:votos más de )?(\S+) (?:más )?hay en la clase ([AB]) que en la ([AB])\?$/.exec(txt))) {
      const d = val(m[1], m[2]) - val(m[1], m[3]); assert.ok(d > 0, "«más que»: primero la clase mayor"); assert.notEqual(m[2], m[3]); nums.push(d);
    } else if ((m = /^¿Cuánt(?:os|as) (?:votos|figuras) hay en total en la clase ([AB])\?$/.exec(txt))) { assert.ok(!moda, "total con moda"); nums.push(clase[m[1]].reduce((a, b) => a + b, 0)); }
    else assert.fail("pregunta desconocida: " + txt);
  });
  assert.equal(preguntas[0].tp, "c"); assert.equal(preguntas[1].tp, "b");
  assert.equal(preguntas.filter((q) => q.tp === "c").length, moda ? 3 : 1);
  return { nums, eleg };
}

export default {
  "estadistica.pictograma"(act) {
    const dos = act.params.modo === "dos";
    cuantos(act.ejercicios, 1);
    if (act.params.grupos === "dos") {   // 3.º, lote 7: dos clases
      const [{ datos: d, solucion }] = act.ejercicios, { nums, eleg } = dosClases(d, { moda: act.params.moda === true, minimo: 1, maximo: dos ? 5 : 10, paso: dos ? 2 : 1 });
      assert.equal(d.dos, dos); assert.equal(d.grupos, 2); if (dos) [...d.v, ...d.w].forEach((x) => assert.equal(x % 2, 0, "con valor 2, votos pares"));
      assert.deepEqual(solucion.huecos, nums); assert.deepEqual(solucion.elegir, eleg); return;
    }
    const [{ datos: { dos: d, kinds, v, preguntas }, solucion }] = act.ejercicios;
    assert.equal(d, dos); mismas(kinds); unicos(v, (x) => x, "votos repetidos");
    v.forEach((x) => { ent(x, dos ? 2 : 1, 10, "votos"); if (dos) assert.equal(x % 2, 0, "con valor 2, votos pares"); });
    const total = v.reduce((s, x) => s + x, 0), val = (n) => v[kinds.indexOf(DE[n])];
    assert.equal(preguntas.length, total <= 20 ? 6 : 5, "nº de preguntas");
    const nums = [], eleg = [];
    for (const { tp, txt } of preguntas) {
      let m;
      if (tp === "c") eleg.push(txt === "¿Qué figura tiene más votos?" || txt === MODA ? NOMS[kinds[v.indexOf(max(v))]] : NOMS[kinds[v.indexOf(Math.min(...v))]]);
      else if ((m = /^¿Cuántos votos tienen los (\S+)\?$/.exec(txt))) nums.push(val(m[1]));
      else if ((m = /^¿Cuántos votos más tienen los (\S+) que los (\S+)\?$/.exec(txt))) { nums.push(val(m[1]) - val(m[2])); assert.ok(val(m[1]) > val(m[2])); }
      else if (txt === "¿Cuántos votos hay en total?") nums.push(total);
      else assert.fail("pregunta desconocida: " + txt);
    }
    assert.deepEqual(solucion.huecos, nums); assert.deepEqual(solucion.elegir, eleg);
    const moda = act.params.moda === true; assert.equal(act.ejercicios[0].datos.moda, moda ? true : undefined);
    assert.equal(preguntas.some((q) => q.txt === MODA), moda); assert.equal(preguntas.some((q) => q.txt === "¿Qué figura tiene más votos?"), !moda);
    if (moda) unica(v);
  },

  "estadistica.recuento"(act) {
    const R = act.params.rango ?? 10, mx = R <= 20 ? Math.min(R, 9) : 12;
    cuantos(act.ejercicios, 1);
    if (act.params.grupos === "dos") {   // 3.º, lote 7: dos clases (huecos: A₀, B₀, A₁, B₁… y luego las numéricas de las preguntas)
      const [{ datos: d, solucion }] = act.ejercicios, { nums, eleg } = dosClases({ ...d, kinds: ["c", "s", "q", "t"] }, { moda: act.params.moda === true, minimo: 2, maximo: Math.min(mx, 9) });
      assert.equal(d.grupos, 2);
      for (const [S, its] of [[d.v, d.items], [d.w, d.items2]]) {
        assert.equal(its.length, S.reduce((a, b) => a + b, 0), "figuras dibujadas"); "csqt".split("").forEach((k, j) => assert.equal(its.filter((i) => i[0] === k).length, S[j], `nº de ${NOMS[k]}`));
        assert.ok(its.length <= 30, "más de 30 figuras");
      }
      assert.deepEqual(solucion.huecos, [...d.v.flatMap((x, j) => [x, d.w[j]]), ...nums]); assert.deepEqual(solucion.elegir, eleg); return;
    }
    const [{ datos: { v, items }, solucion }] = act.ejercicios;
    assert.equal(v.length, 4); v.forEach((x) => ent(x, 2, mx, "cantidad"));
    assert.equal(items.length, v.reduce((s, x) => s + x, 0), "figuras dibujadas");
    "csqt".split("").forEach((k, j) => assert.equal(items.filter((i) => i[0] === k).length, v[j], `nº de ${NOMS[k]}`));
    items.forEach(([, jx, jy]) => { assert.ok(Math.abs(jx) <= 0.2 && Math.abs(jy) <= 0.15, "desvío"); });
    assert.equal(v.filter((x) => x === max(v)).length, 1, "figura más abundante no única");
    assert.deepEqual(solucion.huecos, v); assert.deepEqual(solucion.elegir, [NOMS["csqt"[v.indexOf(max(v))]]]);
    assert.equal(act.ejercicios[0].datos.moda, act.params.moda === true ? true : undefined);
  },

  "estadistica.barras"(act) {
    const lee = act.params.modo === "lee";
    cuantos(act.ejercicios, 1);
    const esc = act.params.escala ?? 1, mas = act.params.pregunta === "mas";
    if (act.params.grupos === "dos") {   // 3.º, lote 7: dos clases (siempre se lee el gráfico)
      const [{ datos: d, solucion }] = act.ejercicios, { nums, eleg } = dosClases(d, { moda: act.params.moda === true, minimo: 1, maximo: 10, paso: esc });
      assert.equal(d.grupos, 2); assert.equal(d.lee, true); assert.equal(d.esc, esc > 1 ? esc : undefined); assert.equal(d.mas, undefined);
      assert.deepEqual(solucion.huecos, nums); assert.deepEqual(solucion.elegir, eleg); return;
    }
    const [{ datos: { lee: l, kinds, v, par }, solucion }] = act.ejercicios;
    assert.equal(act.ejercicios[0].datos.moda, act.params.moda === true ? true : undefined);
    assert.equal(l, lee); mismas(kinds); unicos(v, (x) => x, "valores repetidos"); v.forEach((x) => { assert.equal(x % esc, 0, "múltiplo de la escala"); ent(x / esc, 1, 10, "valor"); });
    assert.equal(act.ejercicios[0].datos.esc, esc > 1 ? esc : undefined); assert.equal(act.ejercicios[0].datos.mas, mas ? true : undefined);
    assert.equal(par.length, 2); unicos(par, (x) => x); par.forEach((i) => ent(i, 0, 3, "columna"));
    if (mas) assert.ok(v[par[0]] > v[par[1]], "«más que»: primero el mayor");
    const tot = mas ? v[par[0]] - v[par[1]] : v[par[0]] + v[par[1]];
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

  "estadistica.probable"(act, tam) {
    const es = act.ejercicios; cuantos(es, tam === "media" ? 4 : 8);
    for (const { datos: d, solucion } of es) {
      assert.ok(["bolsa", "ruleta"].includes(d.aparato)); assert.deepEqual(d.opciones, RESPUESTAS); assert.deepEqual(solucion.huecos, []);
      d.fills.forEach((f) => assert.ok(RELLENOS.includes(f), "relleno desconocido"));
      assert.ok(d.obj.length >= 1 && d.obj.length <= 2 && new Set(d.obj).size === d.obj.length); d.obj.forEach((c) => assert.ok(RELLENOS.includes(c)));
      if (d.aparato === "bolsa") ent(d.fills.length, 4, 8, "bolas"); else assert.ok([4, 6, 8].includes(d.fills.length), "sectores");
      assert.equal(solucion.correcta, respuesta(d.fills, d.obj));
      const n = d.fills.filter((f) => d.obj.includes(f)).length;   // única y correcta, a partir de lo que se ve
      assert.equal(solucion.correcta, n === d.fills.length ? "seguro" : n === 0 ? "imposible" : "posible");
      assert.match(suceso(d.aparato, d.obj), d.aparato === "bolsa" ? /^Sacar una bola (blanca|negra|gris)( o (blanca|negra|gris))?$/ : /^Que la flecha pare en la zona (blanca|negra|gris)( o (blanca|negra|gris))?$/);
      if (d.obj.length === 2 && solucion.correcta === "seguro") assert.equal(new Set(d.fills).size, 2, "seguro con dos rellenos: salen los dos");
    }
    if (tam === "completa") { const c = RESPUESTAS.map((r) => es.filter((e) => e.solucion.correcta === r).length); assert.ok(Math.max(...c) - Math.min(...c) <= 2, `respuestas mal repartidas: ${c}`); }
    assert.ok(new Set(es.map((e) => e.datos.aparato)).size === 2 || es.length < 2, "bolsas y ruletas");
  },
};
