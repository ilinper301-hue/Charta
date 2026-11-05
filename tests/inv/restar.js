// Charta · invariantes de la familia «restar» (ver tests/invariantes.js). restar.recta está en tests/invariantes.js.
import assert from "node:assert/strict";
import { ent, unicos, cuantos, mitad } from "./_ayuda.js";

/** ¿La resta a − b lleva (necesita "pedir")? Misma definición que _pares_resta() del motor. */
const lleva = (R) => (R <= 20 ? (a, b) => a > 10 && a - b < 10 : (a, b) => b % 10 > a % 10);
/** ¿La suma a + b lleva? (_pares_suma del motor.) */
const llevaSuma = (R) => (R <= 20 ? (a, b) => a < 10 && b < 10 && a + b > 10 : (a, b) => (a % 10) + (b % 10) >= 10);

/** Niveles sin/con/mezcla de las restas a − b (hasta 10 no hay opción). f(e) → [a, b]. */
function niveles(es, R, nivel, f, cnt, mezclaExacta = false) {
  if (R <= 10) return;
  const l = lleva(R), n = es.filter((e) => l(...f(e))).length;
  if (nivel === "sin") assert.equal(n, 0, "sin: hay restas con llevada");
  if (nivel === "con") assert.equal(n, es.length, "con: hay restas sin llevada");
  if (nivel === "mezcla") {
    if (R <= 20) mitad(es, (e) => l(...f(e)));
    else assert.equal(n, cnt / 4, "mezcla: una de cada cuatro con llevada");
  }
}

function horiz(Rfijo) {
  return (act, tam) => {
    const es = act.ejercicios, R = Rfijo ?? act.params.rango, cap = Math.min(R, 99), nivel = act.params.nivel || "sin";
    cuantos(es, tam === "media" ? 12 : 24);
    for (const { datos: { a, b }, solucion } of es) {
      ent(a, 2, cap, "a"); ent(b, 1, a - 1, "b");
      assert.deepEqual(solucion.huecos, [a - b]);
    }
    niveles(es, R, nivel, (e) => [e.datos.a, e.datos.b], es.length);
  };
}

export default {
  "restar.quita"(act, tam) {
    const cap = (act.params.rango ?? 10) <= 10 ? 10 : 20;
    cuantos(act.ejercicios, tam === "media" ? 4 : 8);
    act.ejercicios.forEach(({ datos: { a, b, tipo, lugares }, solucion }, i) => {
      ent(a, 4, cap, "a"); ent(b, 1, a - 1, "b");
      assert.equal(tipo, "csqt"[i % 4]);
      assert.equal(lugares.length, a, "un lugar por dibujo");
      assert.equal(lugares.filter((l) => l[4] === 1).length, b, "tachados = b");
      unicos(lugares, (l) => l[0] + "," + l[1], "dos dibujos en el mismo lugar");
      assert.deepEqual(solucion.huecos, [a - b]); ent(a - b, 1, cap - 1, "quedan");
    });
  },

  "restar.r10": horiz(10),
  "restar.r20": horiz(20),
  "restar.r100": horiz(null),

  "restar.vertical"(act, tam) {
    const es = act.ejercicios, cap = Math.min(act.params.rango ?? 30, 99), nivel = act.params.nivel || "sin";
    cuantos(es, tam === "media" ? 6 : 12);
    unicos(es, (e) => e.datos.a + "-" + e.datos.b);
    for (const { datos: { a, b }, solucion } of es) {
      ent(a, 21, cap, "a"); ent(b, 1, a - 1, "b");
      assert.deepEqual(solucion.huecos, [Math.floor((a - b) / 10), (a - b) % 10]);
    }
    const l = ({ datos: { a, b } }) => b % 10 > a % 10;
    if (nivel === "sin") assert.ok(!es.some(l), "sin: hay llevadas");
    if (nivel === "con") assert.ok(es.every(l), "con: falta llevada");
    if (nivel === "mezcla") mitad(es, l);
  },

  "restar.mitades"(act, tam) {
    const es = act.ejercicios, cap = Math.min(act.params.rango ?? 10, 20);
    cuantos(es, tam === "media" ? 6 : 12);
    for (const { datos: { n, forma }, solucion } of es) {
      ent(n, 2, cap, "n"); assert.equal(n % 2, 0, "n par"); assert.ok(forma === 0 || forma === 1);
      assert.deepEqual(solucion.huecos, forma === 0 ? [n / 2] : [n / 2, n / 2]);
    }
    if (cap >= 12 || tam === "media") unicos(es, (e) => e.datos.n + "," + e.datos.forma);
  },

  "restar.faltan"(act, tam) {
    const es = act.ejercicios, R = act.params.rango ?? 10, cap = Math.min(R, 100);
    cuantos(es, tam === "media" ? 8 : 16);
    for (const { datos: { a, t }, solucion } of es) {
      ent(a, 1, cap - 1, "a"); ent(t, a + 1, cap, "t");
      assert.equal(t, R <= 10 ? 10 : R <= 20 ? (a < 10 ? 10 : 20) : (Math.floor(a / 10) + 1) * 10, "objetivo");
      if (R > 10) assert.notEqual(a % 10, 0, "a no es decena");
      assert.deepEqual(solucion.huecos, [t - a]);
    }
    if (R > 10) unicos(es, (e) => e.datos.a);                         // hasta 10 solo hay 9 números
    else if (tam === "media") unicos(es, (e) => e.datos.a);
  },

  "restar.hueco"(act, tam) {
    const es = act.ejercicios, R = Math.min(act.params.rango ?? 10, 99), nivel = act.params.nivel || "sin";
    cuantos(es, tam === "media" ? 12 : 24);
    for (const { datos: { a, b, c, hueco }, solucion } of es) {
      ent(a, 2, R, "a"); ent(b, 1, a - 1, "b"); assert.equal(c, a - b); ent(c, 1, R, "c");
      assert.deepEqual(solucion.huecos, [hueco === "a" ? a : b]);
    }
    niveles(es, R, nivel, (e) => [e.datos.a, e.datos.b], es.length);
  },

  "restar.decenas"(act, tam) {
    const es = act.ejercicios, cap = Math.min(act.params.rango ?? 30, 100), bloques = act.params.modo === "bloques";
    let np = 0; for (let a = 20; a <= cap; a += 10) for (let b = 10; b < a; b += 10) np++;
    if (bloques) {
      const m = Math.min(10, np), n = Math.max(2, m - (m % 2));
      cuantos(es, Math.min(n, tam === "media" ? 4 : 10));
      unicos(es, (e) => e.datos.a + "-" + e.datos.b);
    } else {
      const filas = Math.min(24, np * 3) / 3;
      cuantos(es, (tam === "media" ? Math.max(1, Math.floor(filas / 2)) : filas) * 3);
      unicos(es, (e) => [e.datos.a, e.datos.b, e.datos.forma].join());
    }
    for (const { datos: { a, b, forma }, solucion } of es) {
      assert.equal(a % 10, 0); assert.equal(b % 10, 0);
      ent(a, 20, cap, "a"); ent(b, 10, a - 10, "b");
      if (bloques) assert.equal(forma, 0);
      assert.deepEqual(solucion.huecos, [[a - b], [b], [a]][forma]);
    }
  },

  "restar.encadenadas"(act, tam) {
    const es = act.ejercicios, cap = (act.params.rango ?? 10) <= 10 ? 10 : 20;
    cuantos(es, tam === "media" ? 8 : 16);
    unicos(es, (e) => [e.datos.a, e.datos.b, e.datos.c].join());
    for (const { datos: { a, b, c }, solucion } of es) {
      ent(a, Math.max(6, cap / 2), cap, "a"); ent(b, 1, a - 2, "b"); ent(c, 1, a - b - 1, "c");
      assert.deepEqual(solucion.huecos, [a - b - c]); ent(a - b - c, 1, cap, "resultado");
    }
  },

  "restar.familia"(act, tam) {
    const es = act.ejercicios, R = Math.min(act.params.rango ?? 10, 99), nivel = act.params.nivel || "sin";
    cuantos(es, tam === "media" ? 4 : 8);
    unicos(es, (e) => e.datos.a + "+" + e.datos.b);
    for (const { datos: { a, b, t }, solucion } of es) {
      ent(a, 1, R, "a"); ent(b, 1, R, "b"); assert.notEqual(a, b); assert.equal(t, a + b); ent(t, 2, R, "suma");
      assert.deepEqual(solucion.huecos, [t - a, t - b]);
    }
    if (R > 10) {
      const l = llevaSuma(R), n = es.filter((e) => l(e.datos.a, e.datos.b)).length;
      if (nivel === "sin") assert.equal(n, 0, "sin: hay sumas con llevada");
      if (nivel === "con") assert.equal(n, es.length, "con: hay sumas sin llevada");
    }
  },
};
