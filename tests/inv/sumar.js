// Charta · invariantes de la familia «sumar» (ver tests/invariantes.js).
// (sumar.h20 y sumar.vertical siguen en tests/invariantes.js.)
import assert from "node:assert/strict";
import { ent, unicos, cuantos, mitad } from "./_ayuda.js";

/** Con rango 30 y niveles sin/mezcla los grupos son tan pequeños que el motor repite sumas (no hay forma de evitarlo). */
const pocas = () => false;   // sin repetidos en ningún rango (pares() ya no repite si hay sumas libres)
const lleva = ({ datos: { a, b } }) => (a % 10) + (b % 10) >= 10;
/** Sumas horizontales por rango y nivel (reglas de _pares_suma del motor). */
function horiz(R, tam, act, hastaCap) {
  const es = act.ejercicios, nivel = act.params.nivel || "sin", cap = hastaCap ?? Math.min(R, 99);
  cuantos(es, tam === "media" ? 12 : 24);
  if (!pocas(act)) unicos(es, (e) => e.datos.a + "+" + e.datos.b);
  for (const { datos: { a, b, op }, solucion } of es) {
    assert.equal(op, "+"); ent(a, 1, cap - 1, "a"); ent(b, 1, cap - 1, "b"); ent(a + b, 2, cap, "a + b");
    assert.deepEqual(solucion.huecos, [a + b]);
  }
  if (R > 20) {
    const dec = (v) => v % 10 === 0;
    if (nivel === "sin") assert.ok(!es.some(lleva), "sin: hay llevadas");
    if (nivel === "con") assert.ok(es.every((e) => lleva(e) && !dec(e.datos.a) && !dec(e.datos.b)), "con: falta llevada");
    if (nivel === "mezcla") assert.ok(es.some(lleva) && es.some((e) => !lleva(e)), "mezcla: faltan ambos tipos");
  }
}

export default {
  "sumar.h10"(act, tam) { horiz(10, tam, act, 10); },

  "sumar.h100"(act, tam) { horiz(act.params.rango ?? 30, tam, act); },

  "sumar.dibujos"(act, tam) {
    const cap = (act.params.rango ?? 10) <= 10 ? 10 : 20;
    cuantos(act.ejercicios, tam === "media" ? 4 : 8);
    act.ejercicios.forEach(({ datos: { a, b, kind, ga, gb }, solucion }, i) => {
      ent(a, 1, cap - 1, "a"); ent(b, 1, cap - 1, "b"); ent(a + b, 3, cap, "a + b");
      assert.equal(kind, "csqt"[i % 4]);
      assert.equal(ga.length, a, "dibujos del grupo a"); assert.equal(gb.length, b, "dibujos del grupo b");
      for (const g of [ga, gb]) unicos(g, (q) => q[0] + "," + q[1], "dibujos en la misma casilla");
      assert.deepEqual(solucion.huecos, [a + b]);
    });
  },

  "sumar.recta"(act, tam) {
    const R = act.params.rango ?? 10, N = R <= 10 ? 10 : R <= 20 ? 20 : 30;
    cuantos(act.ejercicios, tam === "media" ? 3 : 6);
    for (const { datos: { a, b, N: n }, solucion } of act.ejercicios) {
      assert.equal(n, N, "longitud de la recta");
      ent(b, 2, Math.min(9, N - 2), "b"); ent(a, 1, N - b, "a"); ent(a + b, 3, N, "a + b");
      assert.deepEqual(solucion.huecos, [a + b]);
    }
  },

  "sumar.dobles"(act, tam) {
    const R = act.params.rango ?? 10, cap = Math.max(2, Math.min(10, Math.floor(R / 2)));
    cuantos(act.ejercicios, tam === "media" ? 6 : 12);
    for (const { datos: { n, forma }, solucion } of act.ejercicios) {
      ent(n, 1, cap, "n"); assert.ok(forma === 0 || forma === 1);
      assert.deepEqual(solucion.huecos, [2 * n]); ent(2 * n, 2, R, "doble");
    }
    if (cap * 2 >= (tam === "media" ? 6 : 12)) unicos(act.ejercicios, (e) => e.datos.n + "/" + e.datos.forma);
  },

  "sumar.comp10"(act, tam) {
    cuantos(act.ejercicios, tam === "media" ? 9 : 18);
    unicos(act.ejercicios, (e) => e.datos.a + e.datos.hueco);
    for (const { datos: { a, hueco }, solucion } of act.ejercicios) {
      ent(a, 1, 9, "a"); assert.ok(hueco === "medio" || hueco === "inicio");
      assert.deepEqual(solucion.huecos, [10 - a]); ent(a + solucion.huecos[0], 10, 10, "a + hueco");
    }
  },

  "sumar.comp20"(act, tam) {
    const cap = Math.min(act.params.rango ?? 20, 100);
    cuantos(act.ejercicios, tam === "media" ? 9 : 18);
    unicos(act.ejercicios, (e) => e.datos.a + e.datos.hueco);
    for (const { datos: { a, t, hueco }, solucion } of act.ejercicios) {
      ent(a, 11, cap - 1, "a"); assert.notEqual(a % 10, 0, "a no es decena"); assert.ok(hueco === "medio" || hueco === "inicio");
      assert.equal(t, (Math.floor(a / 10) + 1) * 10, "decena siguiente"); ent(t, 20, cap + 9, "t");
      assert.deepEqual(solucion.huecos, [t - a]); ent(t - a, 1, 9, "falta");
    }
  },

  "sumar.hueco"(act, tam) {
    const R = Math.min(act.params.rango ?? 10, 99), nivel = act.params.nivel || "sin";
    cuantos(act.ejercicios, tam === "media" ? 12 : 24);
    if (!pocas(act)) unicos(act.ejercicios, (e) => e.datos.a + "+" + e.datos.b);
    for (const { datos: { a, b, falta }, solucion } of act.ejercicios) {
      ent(a, 1, R - 1, "a"); ent(b, 1, R - 1, "b"); ent(a + b, 2, R, "a + b");
      assert.ok(falta === "a" || falta === "b");
      assert.deepEqual(solucion.huecos, [falta === "a" ? a : b]);
    }
    if (R > 20 && nivel === "sin") assert.ok(!act.ejercicios.some(lleva), "sin: hay llevadas");
    if (R > 20 && nivel === "con") assert.ok(act.ejercicios.every(lleva), "con: falta llevada");
    if (R > 20 && nivel === "mezcla") assert.ok(act.ejercicios.some(lleva) && act.ejercicios.some((e) => !lleva(e)), "mezcla");
    if (R > 10 && R <= 20) {
      const ll = ({ datos: { a, b } }) => a < 10 && b < 10 && a + b > 10;
      if (nivel === "sin") assert.ok(!act.ejercicios.some(ll)); if (nivel === "con") assert.ok(act.ejercicios.every(ll));
      if (nivel === "mezcla") mitad(act.ejercicios, ll);
    }
  },

  "sumar.decenas"(act, tam) {
    const cap = Math.min(act.params.rango ?? 30, 100), bloques = act.params.modo === "bloques", es = act.ejercicios;
    let npares = 0; for (let a = 10; a < cap; a += 10) for (let b = 10; b < cap; b += 10) if (a + b <= cap) npares++;
    if (bloques) {
      const m = Math.min(10, npares), n = Math.max(2, m - (m % 2));
      cuantos(es, tam === "media" ? Math.min(n, 4) : n);
      unicos(es, (e) => e.datos.a + "+" + e.datos.b);
    } else {
      const total = Math.min(24, npares * 3), filas = total / 3;
      cuantos(es, tam === "media" ? Math.max(1, Math.floor(filas * 0.5)) * 3 : total);
      unicos(es, (e) => `${e.datos.a}+${e.datos.b}/${e.datos.forma}`);
    }
    for (const { datos: { a, b, forma }, solucion } of es) {
      assert.ok(a % 10 === 0 && b % 10 === 0, "decenas completas"); ent(a, 10, cap - 10, "a"); ent(b, 10, cap - 10, "b"); ent(a + b, 20, cap, "a + b");
      if (bloques) assert.equal(forma, 0);
      assert.deepEqual(solucion.huecos, [forma === 0 ? a + b : forma === 1 ? b : a]);
    }
  },

  "sumar.encadenadas"(act, tam) {
    const cap = (act.params.rango ?? 10) <= 10 ? 10 : 20;
    cuantos(act.ejercicios, tam === "media" ? 8 : 16);
    unicos(act.ejercicios, (e) => [e.datos.x, e.datos.y, e.datos.z].join());
    for (const { datos: { x, y, z }, solucion } of act.ejercicios) {
      ent(x, 1, cap, "x"); ent(y, 1, cap, "y"); ent(z, 1, cap, "z"); ent(x + y + z, Math.max(5, Math.floor(cap / 2)), cap, "suma");
      assert.deepEqual(solucion.huecos, [x + y + z]);
    }
  },

  "sumar.piramide"(act, tam) {
    const R = act.params.rango ?? 10, cap = R <= 20 ? R : Math.min(R, 99), h = Math.max(1, Math.min(4, act.params.huecos ?? 3));
    cuantos(act.ejercicios, tam === "media" ? 2 : 6);
    for (const { datos: { v, vac }, solucion } of act.ejercicios) {
      assert.equal(v.length, 6);
      v.slice(0, 3).forEach((q) => ent(q, 1, cap, "base"));
      assert.equal(v[3], v[0] + v[1]); assert.equal(v[4], v[1] + v[2]); assert.equal(v[5], v[3] + v[4]);
      ent(v[5], 3, cap, "cima");
      assert.equal(vac.length, h, "nº de huecos"); assert.deepEqual(vac, [...vac].sort((a, b) => a - b)); assert.equal(new Set(vac).size, h);
      vac.forEach((j) => ent(j, 0, 5, "índice"));
      assert.deepEqual(solucion.huecos, vac.map((j) => v[j]));
    }
  },

  "sumar.tabla"(act, tam) {
    const R = act.params.rango ?? 10;
    cuantos(act.ejercicios, 1);
    const { datos: { filas, columnas, vac }, solucion } = act.ejercicios[0], total = filas.length * columnas.length;
    unicos(filas, (v) => v); unicos(columnas, (v) => v);
    if (R <= 10) { assert.deepEqual(filas, [1, 2, 3, 4, 5]); assert.deepEqual(columnas, [1, 2, 3, 4, 5]); }
    else if (R <= 20) { cuantos(filas, 6); cuantos(columnas, 6); [...filas, ...columnas].forEach((v) => ent(v, 1, 10, "cabecera")); }
    else {
      cuantos(columnas, 6); columnas.forEach((v) => ent(v, 1, 9, "columna"));
      filas.forEach((v) => { assert.equal(v % 10, 0); ent(v, 10, Math.min(R, 99) - 9, "fila"); });
      ent(Math.max(...filas) + Math.max(...columnas), 11, Math.min(R, 99), "suma máxima");
    }
    const nh = act.params.huecos == null ? null : Math.min(act.params.huecos, total);
    if (nh !== null) assert.equal(vac.length, nh, "nº de huecos"); else ent(vac.length, 1, total, "huecos");
    unicos(vac, (q) => q); vac.forEach((q) => ent(q, 0, total - 1, "casilla"));
    assert.deepEqual(solucion.huecos, vac.map((q) => filas[Math.floor(q / columnas.length)] + columnas[q % columnas.length]));
  },
};
