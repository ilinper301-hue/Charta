// Charta · invariantes de la familia «sumar» (ver tests/invariantes.js).
// (sumar.h20 y sumar.vertical siguen en tests/invariantes.js.)
import assert from "node:assert/strict";
import { ent, unicos, cuantos, mitad, tope, llevaS3, niveles3 } from "./_ayuda.js";

/** Con rango 30 y niveles sin/mezcla los grupos son tan pequeños que el motor repite sumas (no hay forma de evitarlo). */
const pocas = () => false;   // sin repetidos en ningún rango (pares() ya no repite si hay sumas libres)
const lleva = ({ datos: { a, b } }) => (a % 10) + (b % 10) >= 10;
/** Sumas horizontales por rango y nivel (reglas de _pares_suma del motor). */
function horiz(R, tam, act, hastaCap) {
  const es = act.ejercicios, nivel = act.params.nivel || "sin", cap = hastaCap ?? tope(R);
  cuantos(es, tam === "media" ? 12 : 24);
  if (!pocas(act)) unicos(es, (e) => e.datos.a + "+" + e.datos.b);
  for (const { datos: { a, b, op }, solucion } of es) {
    assert.equal(op, "+"); ent(a, 1, cap - 1, "a"); ent(b, 1, cap - 1, "b"); ent(a + b, 2, cap, "a + b");
    assert.deepEqual(solucion.huecos, [a + b]);
  }
  if (R > 100) niveles3(es.map((e) => [e.datos.a, e.datos.b]), nivel, llevaS3);
  else if (R > 20) {
    const dec = (v) => v % 10 === 0;
    if (nivel === "sin") assert.ok(!es.some(lleva), "sin: hay llevadas");
    if (nivel === "con") assert.ok(es.every((e) => lleva(e) && !dec(e.datos.a) && !dec(e.datos.b)), "con: falta llevada");
    if (nivel === "mezcla") assert.ok(es.some(lleva) && es.some((e) => !lleva(e)), "mezcla: faltan ambos tipos");
  }
}

export function recta2(act, tam, resta) {
  const R = act.params.rango, paso = act.params.salto === 100 ? 100 : 10;
  cuantos(act.ejercicios, tam === "media" ? 3 : 6);
  for (const { datos: { a, b, N, desde, paso: ps }, solucion } of act.ejercicios) {
    assert.equal(ps, paso, "paso"); assert.equal(N, paso === 10 ? 10 : Math.floor(R / 100), "nº de tramos");
    assert.equal(desde % 100, 0); assert.ok(desde >= 0 && desde + N * paso <= Math.max(R, 100), "recta fuera del rango");
    if (paso === 100) assert.equal(desde, 0);
    for (const v of [a, b]) assert.equal(v % paso, 0, "fuera de las marcas");
    ent(b / paso, 2, Math.min(9, N - 2), "salto");
    const r = resta ? a - b : a + b;
    assert.deepEqual(solucion.huecos, [r]); ent(r, desde + paso, desde + N * paso, "resultado"); ent(a, desde + paso, desde + N * paso, "a");
    assert.ok(r <= R, "resultado > rango");
  }
}

export function encadenadas2(act, tam, resta) {
  const R = act.params.rango, u = act.params.salto === 100 ? 100 : 10, k = resta ? 3 : (act.params.sumandos ?? 3), es = act.ejercicios;
  cuantos(es, tam === "media" ? 8 : 16);
  const ns = (d) => resta ? [d.a, d.b, d.c] : ["x", "y", "z", "w"].filter((c) => d[c] !== undefined).map((c) => d[c]);
  unicos(es, (e) => ns(e.datos).join());
  for (const { datos, solucion } of es) {
    const v = ns(datos);
    assert.equal(v.length, k, "nº de números"); v.forEach((x) => assert.equal(x % u, 0, "no es múltiplo del salto"));
    v.slice(1).forEach((x) => ent(x, u, 9 * u, "salto"));
    const r = resta ? v[0] - v[1] - v[2] : v.reduce((x, y) => x + y, 0);
    assert.deepEqual(solucion.huecos, [r]); ent(r, u, R, "resultado"); ent(v[0], u, R, "primer número");
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
    if ((act.params.rango ?? 10) >= 100) return recta2(act, tam, false);
    const R = act.params.rango ?? 10, N = R <= 10 ? 10 : R <= 20 ? 20 : 30;
    cuantos(act.ejercicios, tam === "media" ? 3 : 6);
    for (const { datos: { a, b, N: n }, solucion } of act.ejercicios) {
      assert.equal(n, N, "longitud de la recta");
      ent(b, 2, Math.min(9, N - 2), "b"); ent(a, 1, N - b, "a"); ent(a + b, 3, N, "a + b");
      assert.deepEqual(solucion.huecos, [a + b]);
    }
  },

  "sumar.dobles"(act, tam) {
    if ((act.params.rango ?? 10) >= 100) {   // 2.º: dobles y mitades hasta 100, sin llevada
      const op = act.params.operacion, es = act.ejercicios;
      cuantos(es, tam === "media" ? 6 : 12); unicos(es, (e) => e.datos.n + "," + e.datos.forma);
      for (const { datos: { n, forma }, solucion } of es) {
        ent(n, 10, 50, "n"); assert.ok(n % 10 <= 4, "doble con llevada");
        assert.ok(op === "mitades" ? forma === 2 : op === "mezcla" ? [0, 1, 2].includes(forma) : forma === 0 || forma === 1);
        assert.deepEqual(solucion.huecos, [forma === 2 ? n : 2 * n]);
      }
      if (op === "mezcla") assert.equal(es.filter((e) => e.datos.forma === 2).length, es.length / 2, "mitad de mitades");
      return;
    }
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
    const R = tope(act.params.rango ?? 10), nivel = act.params.nivel || "sin";
    cuantos(act.ejercicios, tam === "media" ? 12 : 24);
    if (R > 100) niveles3(act.ejercicios.map((e) => [e.datos.a, e.datos.b]), nivel, llevaS3);
    if (!pocas(act)) unicos(act.ejercicios, (e) => e.datos.a + "+" + e.datos.b);
    for (const { datos: { a, b, falta }, solucion } of act.ejercicios) {
      ent(a, 1, R - 1, "a"); ent(b, 1, R - 1, "b"); ent(a + b, 2, R, "a + b");
      assert.ok(falta === "a" || falta === "b");
      assert.deepEqual(solucion.huecos, [falta === "a" ? a : b]);
    }
    if (R > 20 && R <= 100 && nivel === "sin") assert.ok(!act.ejercicios.some(lleva), "sin: hay llevadas");
    if (R > 20 && R <= 100 && nivel === "con") assert.ok(act.ejercicios.every(lleva), "con: falta llevada");
    if (R > 20 && R <= 100 && nivel === "mezcla") assert.ok(act.ejercicios.some(lleva) && act.ejercicios.some((e) => !lleva(e)), "mezcla");
    if (R > 10 && R <= 20) {
      const ll = ({ datos: { a, b } }) => a < 10 && b < 10 && a + b > 10;
      if (nivel === "sin") assert.ok(!act.ejercicios.some(ll)); if (nivel === "con") assert.ok(act.ejercicios.every(ll));
      if (nivel === "mezcla") mitad(act.ejercicios, ll);
    }
  },

  "sumar.decenas"(act, tam) {
    const cap = Math.min(act.params.rango ?? 30, 100), bloques = act.params.modo === "bloques", es = act.ejercicios;
    if ((act.params.rango ?? 30) > 100 && !bloques) {      // 2.º: decenas (40 + 30), centenas (300 + 400), centenas con decenas (250 + 30)
      const R = act.params.rango, clase = (a, b) => (a <= 90 && b <= 90 ? "A" : a % 100 === 0 && b % 100 === 0 ? "B" : a >= 100 && b <= 90 ? "C" : "?");
      cuantos(es, tam === "media" ? 12 : 24);
      unicos(es, (e) => `${e.datos.a}+${e.datos.b}/${e.datos.forma}`);
      for (const { datos: { a, b, forma }, solucion } of es) {
        assert.equal(a % 10, 0); assert.equal(b % 10, 0); ent(a, 10, R - 10, "a"); ent(b, 10, R - 10, "b"); ent(a + b, 20, R, "a + b"); ent(forma, 0, 2, "forma");
        assert.notEqual(clase(a, b), "?", `clase de ${a} + ${b}`);
        assert.deepEqual(solucion.huecos, [forma === 0 ? a + b : forma === 1 ? b : a]);
      }
      if (tam === "completa" && R >= 300) for (const c of "ABC") assert.ok(es.filter((e) => clase(e.datos.a, e.datos.b) === c).length >= 6, `pocas de la clase ${c}`);
      return;
    }
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
    if ((act.params.rango ?? 10) >= 100) return encadenadas2(act, tam, false);
    const cap = (act.params.rango ?? 10) <= 10 ? 10 : 20;
    cuantos(act.ejercicios, tam === "media" ? 8 : 16);
    unicos(act.ejercicios, (e) => [e.datos.x, e.datos.y, e.datos.z].join());
    for (const { datos: { x, y, z }, solucion } of act.ejercicios) {
      ent(x, 1, cap, "x"); ent(y, 1, cap, "y"); ent(z, 1, cap, "z"); ent(x + y + z, Math.max(5, Math.floor(cap / 2)), cap, "suma");
      assert.deepEqual(solucion.huecos, [x + y + z]);
    }
  },

  "sumar.piramide"(act, tam) {
    const R = act.params.rango ?? 10, cap = R <= 20 ? R : tope(R), h = Math.max(1, Math.min(4, act.params.huecos ?? 3));
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
      filas.forEach((v) => { assert.equal(v % 10, 0); ent(v, 10, tope(R) - 9, "fila"); });
      ent(Math.max(...filas) + Math.max(...columnas), 11, tope(R), "suma máxima");
    }
    const nh = act.params.huecos == null ? null : Math.min(act.params.huecos, total);
    if (nh !== null) assert.equal(vac.length, nh, "nº de huecos"); else ent(vac.length, 1, total, "huecos");
    unicos(vac, (q) => q); vac.forEach((q) => ent(q, 0, total - 1, "casilla"));
    assert.deepEqual(solucion.huecos, vac.map((q) => filas[Math.floor(q / columnas.length)] + columnas[q % columnas.length]));
  },
};
