// Charta · invariantes de la familia «conteo» (ver tests/invariantes.js).
// («conteo.serie1» tiene su regla en tests/invariantes.js.)
import assert from "node:assert/strict";
import { ent, unicos, cuantos } from "./_ayuda.js";

/** Series de `pasos(R)` en `pasos(R)`: longitud, paso, alternancia sube/baja, huecos y solución. */
function serie(pasos) {
  return (act, tam) => {
    const R = act.params.rango ?? 10, h = act.params.huecos ?? 3;
    cuantos(act.ejercicios, tam === "media" ? 4 : 8);
    act.ejercicios.forEach(({ datos: { paso, valores, huecos, sube }, solucion }, i) => {
      assert.ok(pasos(R).includes(paso), `paso ${paso} no permitido con rango ${R}`);
      const L = Math.min(6, Math.floor(R / paso) + 1);
      assert.equal(sube, i % 2 === 0, "alterna sube/baja");
      assert.equal(valores.length, L, "longitud de la serie");
      valores.forEach((v, j) => {
        ent(v, paso === 1 ? 1 : 0, R, "valor");
        if (j) assert.equal(v - valores[j - 1], sube ? paso : -paso, "paso de la serie");
      });
      if (paso >= 5) assert.equal(valores[0] % paso, 0, "múltiplo del paso");
      assert.equal(huecos.length, Math.max(0, Math.min(h, L - 2)), "nº de huecos");
      assert.deepEqual(huecos, [...new Set(huecos)].sort((x, y) => x - y), "huecos ordenados y distintos");
      huecos.forEach((j) => ent(j, 0, L - 1, "posición del hueco"));
      assert.deepEqual(solucion.huecos, huecos.map((j) => valores[j]));
    });
  };
}

export default {
  "conteo.serie2": serie(() => [2]),
  "conteo.serie5": serie(() => [5]),
  "conteo.serie10": serie(() => [10]),
  "conteo.series": serie((R) => (R >= 20 ? [1, 2, 5, 10] : [1, 2, 5])),

  "conteo.cuenta"(act, tam) {
    const R = Math.min(act.params.rango ?? 10, 30);
    cuantos(act.ejercicios, tam === "media" ? 6 : 12);
    act.ejercicios.forEach(({ datos: { n, forma, cols, filas, pos }, solucion }, i) => {
      ent(n, 1, R, "n"); assert.equal(forma, "csqt"[i % 4], "forma de la casilla");
      assert.ok(cols >= 1 && cols * filas >= n && (filas - 1) * cols < n, "rejilla de dibujos");
      assert.equal(pos.length, n, "nº de dibujos = n");
      unicos(pos, (q) => q[0] + "," + q[1], "dibujos en la misma posición");
      for (const [r, c, ux, uy] of pos) { ent(r, 0, filas - 1, "fila"); ent(c, 0, cols - 1, "columna"); assert.ok(Math.abs(ux) <= 1 && Math.abs(uy) <= 1, "desplazamiento"); }
      assert.deepEqual(solucion.huecos, [n]);
    });
  },

  "conteo.anterior"(act, tam) {
    const R = act.params.rango ?? 10, modo = act.params.modo || "ambos", cnt = tam === "media" ? 6 : 15;
    const [lo, hi] = { ambos: [1, R - 1], anterior: [1, R], posterior: [0, R - 1] }[modo];
    cuantos(act.ejercicios, cnt);
    if (hi - lo + 1 >= cnt) unicos(act.ejercicios, (e) => e.datos.n, "números repetidos");
    for (const { datos: { n, patron }, solucion } of act.ejercicios) {
      assert.equal(patron, { ambos: "hnh", anterior: "hn", posterior: "nh" }[modo]);
      ent(n, lo, hi, "n");
      assert.deepEqual(solucion.huecos, modo === "ambos" ? [n - 1, n + 1] : modo === "anterior" ? [n - 1] : [n + 1]);
      for (const v of solucion.huecos) ent(v, 0, R, "anterior/posterior");
    }
  },

  "conteo.falta"(act, tam) {
    const R = act.params.rango ?? 10, h = Math.max(1, Math.min(3, act.params.huecos ?? 1)), cnt = tam === "media" ? 8 : 16;
    cuantos(act.ejercicios, cnt);
    if (Math.max(1, R - 4) >= cnt) unicos(act.ejercicios, (e) => e.datos.a, "filas repetidas");
    for (const { datos: { a, huecos }, solucion } of act.ejercicios) {
      ent(a, 1, Math.max(1, R - 4), "a"); ent(a + 4, 1, Math.max(5, R), "último");
      assert.equal(huecos.length, h, "nº de huecos");
      assert.deepEqual(huecos, [...new Set(huecos)].sort((x, y) => x - y), "huecos ordenados y distintos");
      huecos.forEach((j) => ent(j, 0, 4, "posición del hueco"));
      assert.deepEqual(solucion.huecos, huecos.map((j) => a + j));
    }
  },

  "conteo.tabla"(act, tam) {
    const R = Math.min(act.params.rango ?? 10, 100), h = Math.min(30, act.params.huecos ?? Math.max(3, Math.floor(R / 5)));
    assert.equal(tam, "completa"); cuantos(act.ejercicios, 1);
    const { datos: { R: r, huecos }, solucion } = act.ejercicios[0];
    assert.equal(r, R, "tamaño de la tabla");
    assert.equal(huecos.length, Math.min(h, R - 1), "nº de huecos");
    assert.deepEqual(huecos, [...new Set(huecos)].sort((x, y) => x - y), "huecos ordenados y distintos");
    huecos.forEach((n) => ent(n, 1, R, "número que falta"));
    assert.deepEqual(solucion.huecos, huecos);
  },

  "conteo.camino"(act, tam) {
    const R = act.params.rango ?? 10, L = Math.min(36, R), h = Math.min(L - 2, act.params.huecos ?? Math.max(3, Math.floor(L / 3)));
    assert.equal(tam, "completa"); cuantos(act.ejercicios, 1);
    const { datos: { desde, L: l, huecos }, solucion } = act.ejercicios[0];
    assert.equal(l, L, "longitud del camino"); ent(desde, 1, R - L + 1, "primer número"); ent(desde + L - 1, L, R, "último número");
    assert.equal(huecos.length, h, "nº de huecos");
    assert.deepEqual(huecos, [...new Set(huecos)].sort((x, y) => x - y), "huecos ordenados y distintos");
    huecos.forEach((k) => ent(k, 1, L - 1, "posición del hueco (la salida nunca va vacía)"));
    assert.deepEqual(solucion.huecos, huecos.map((k) => desde + k));
  },
};
