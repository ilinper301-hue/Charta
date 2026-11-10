// Charta · invariantes de la familia «juegos» (ver tests/invariantes.js).
import assert from "node:assert/strict";
import { ent, unicos, cuantos, tope, llevaS3, llevaR3 } from "./_ayuda.js";

const suma = (a) => a.reduce((s, x) => s + x, 0);
const lleva = (op, a, b, R) => R > 100 ? (op === "+" ? llevaS3(a, b) : llevaR3(a, b)) : op === "+"
  ? (R <= 20 ? a < 10 && b < 10 && a + b > 10 : (a % 10) + (b % 10) >= 10)
  : (R <= 20 ? a > 10 && a - b < 10 : (a % 10) < (b % 10));

const LINEAS = [
  ...[0, 1, 2].map((r) => [0, 1, 2].map((q) => [r, q])), ...[0, 1, 2].map((q) => [0, 1, 2].map((r) => [r, q])),
  [0, 1, 2].map((i) => [i, i]), [0, 1, 2].map((i) => [i, 2 - i]),
];

export default {
  "juegos.cuadrado"(act, tam) {
    const R = act.params.rango ?? 10, h = Math.max(3, Math.min(5, act.params.n || 4));
    cuantos(act.ejercicios, tam === "media" ? 2 : 6);
    unicos(act.ejercicios, (e) => JSON.stringify(e.datos.m), "cuadrados repetidos");
    for (const { datos: { S, m, vac }, solucion } of act.ejercicios) {
      for (const ln of LINEAS) assert.equal(suma(ln.map(([r, q]) => m[r][q])), S, "línea que no suma la suma mágica");
      const k = (S - 15) / 3; ent(k, 0, Math.min(R - 9, 4), "k");
      assert.deepEqual(m.flat().slice().sort((x, y) => x - y), Array.from({ length: 9 }, (_, i) => i + 1 + k), "números del cuadrado");
      m.flat().forEach((v) => ent(v, 1, R, "casilla"));
      assert.equal(vac.length, h, "casillas vacías"); unicos(vac, (d) => d.join());
      assert.deepEqual(vac, vac.slice().sort((x, y) => x[0] - y[0] || x[1] - y[1]), "vacías por filas");
      assert.deepEqual(solucion.huecos, vac.map(([r, q]) => m[r][q]));
      // las vacías se deducen: líneas con una sola incógnita, en cadena
      const conoc = new Set([0, 1, 2].flatMap((r) => [0, 1, 2].map((q) => [r, q].join())).filter((c) => !vac.some((d) => d.join() === c)));
      for (let ch = true; ch;) { ch = false; for (const ln of LINEAS) { const u = ln.filter((c) => !conoc.has(c.join())); if (u.length === 1) { conoc.add(u[0].join()); ch = true; } } }
      assert.equal(conoc.size, 9, "casillas vacías no deducibles");
    }
  },

  "juegos.laberinto"(act) {
    const R = act.params.rango ?? 10, p = act.params.n || 1, lo = p === 1 ? 1 : 0, L = Math.min(13, Math.floor((R - lo) / p) + 1);
    cuantos(act.ejercicios, 2);
    for (const { datos: { paso, valores, camino, rejilla }, solucion } of act.ejercicios) {
      assert.equal(paso, p); assert.equal(valores.length, L, "longitud de la serie"); assert.ok(L >= 8);
      valores.forEach((v, j) => { ent(v, lo, R, "serie"); if (j) assert.equal(v - valores[j - 1], p, "salto"); });
      assert.equal(camino.length, L); unicos(camino, (c) => c.join(), "camino que se cruza");
      camino.forEach(([r, q], j) => {
        ent(r, 0, 4, "fila"); ent(q, 0, 4, "columna");
        if (j) assert.equal(Math.abs(r - camino[j - 1][0]) + Math.abs(q - camino[j - 1][1]), 1, "pasos no contiguos");
        assert.equal(rejilla[r][q], valores[j], "serie fuera del camino");
      });
      rejilla.forEach((fila, r) => fila.forEach((v, q) => {
        ent(v, 0, R, "casilla");
        if (!camino.some((c) => c[0] === r && c[1] === q)) assert.ok(!valores.includes(v), `${v} de la serie fuera del camino`);
      }));
      assert.deepEqual(solucion.huecos, []);
    }
  },

  "juegos.une"(act) {
    const R = act.params.rango ?? 10, modo = act.params.modo || "mezcla", nivel = act.params.nivel || "sin", es = act.ejercicios;
    cuantos(es, 8);
    assert.deepEqual(es.map((e) => e.datos.derecha).sort((x, y) => x - y), es.map((e) => e.datos.r).sort((x, y) => x - y), "resultados de la derecha");
    es.forEach(({ datos: { a, b, op, r, derecha }, solucion }, i) => {
      assert.ok(op === "+" || op === "-");
      assert.equal(r, op === "+" ? a + b : a - b); ent(a, 1, tope(R), "a"); ent(b, 1, tope(R), "b"); ent(r, 1, tope(R), "resultado");
      assert.equal(es[solucion.une].datos.derecha, r, "línea que une");
      if (modo === "suma") assert.equal(op, "+"); if (modo === "resta") assert.equal(op, "-");
      if (R > 10 && nivel === "sin") assert.ok(!lleva(op, a, b, R), `sin: ${a} ${op} ${b} lleva`);
      if (R > 10 && nivel === "con") assert.ok(lleva(op, a, b, R), `con: ${a} ${op} ${b} no lleva`);
      assert.deepEqual(solucion.huecos, []);
    });
    unicos(es, (e) => e.datos.r, "resultados repetidos");
    if (modo === "mezcla") assert.equal(es.filter((e) => e.datos.op === "+").length, 4, "mitad sumas, mitad restas");
  },

  "juegos.cadena"(act, tam) {
    const R = act.params.rango ?? 10, cap = tope(R), maxm = R <= 10 ? 5 : R <= 20 ? 9 : R <= 100 ? 10 : 100;
    cuantos(act.ejercicios, tam === "media" ? 3 : 7);
    for (const { datos: { vals, ops }, solucion } of act.ejercicios) {
      assert.equal(vals.length, 5); assert.equal(ops.length, 4);
      vals.forEach((v) => ent(v, 0, cap, "valor"));
      ops.forEach((m, j) => { assert.ok(m !== 0 && Math.abs(m) <= maxm, `salto ${m}`); assert.equal(vals[j + 1], vals[j] + m, "cadena"); });
      assert.deepEqual(solucion.huecos, vals.slice(1));
    }
  },

  "juegos.oculto"(act, tam) {
    const R = act.params.rango ?? 10;
    cuantos(act.ejercicios, tam === "media" ? 4 : 8);
    unicos(act.ejercicios, (e) => e.datos.t, "números repetidos");
    for (const { datos: { t, pistas }, solucion } of act.ejercicios) {
      ent(t, 2, R - 1, "t"); assert.ok(pistas.length >= 2 && pistas.length <= 4, "nº de pistas");
      let C = Array.from({ length: R }, (_, i) => i + 1);
      for (const s of pistas) {
        let m, f;
        if ((m = /^Soy mayor que (\d+)\.$/.exec(s))) f = (v) => v > +m[1];
        else if ((m = /^Soy menor que (\d+)\.$/.exec(s))) f = (v) => v < +m[1];
        else if (s === "Soy par.") f = (v) => v % 2 === 0;
        else if (s === "Soy impar.") f = (v) => v % 2 === 1;
        else if ((m = /^Tengo (\d+) decenas?\.$/.exec(s))) f = (v) => Math.floor(v / 10) === +m[1];
        else if ((m = /^Tengo (\d+) unidad(es)?\.$/.exec(s))) f = (v) => v % 10 === +m[1];
        else if ((m = /^Vengo después del (\d+)\.$/.exec(s))) f = (v) => v === +m[1] + 1;
        else if ((m = /^Vengo antes del (\d+)\.$/.exec(s))) f = (v) => v === +m[1] - 1;
        else assert.fail("pista desconocida: " + s);
        assert.ok(f(t), `«${s}» no se cumple con ${t}`); C = C.filter(f);
      }
      assert.deepEqual(C, [t], "las pistas no dejan un único número");
      assert.deepEqual(solucion.huecos, [t]);
    }
  },

  "juegos.colorea"(act) {
    const R = act.params.rango ?? 10, cap = Math.min(R, 99), resta = act.params.modo === "resta", nivel = act.params.nivel || "sin", n = act.params.n;
    const SH = { corazon: 0, casa: 0, arbol: 0, diamante: 0 }, [e] = act.ejercicios;
    cuantos(act.ejercicios, 1);
    const { forma, resta: rs, tgt, celdas } = e.datos;
    assert.equal(rs, resta); if (n) assert.equal(forma, Object.keys(SH)[n - 1], "dibujo elegido");
    assert.equal(celdas.length / 6, { corazon: 5, casa: 6, arbol: 6, diamante: 6 }[forma]);
    assert.equal(celdas.filter((c) => c.x).length, { corazon: 22, casa: 26, arbol: 20, diamante: 24 }[forma], "casillas del dibujo");
    if (resta) ent(tgt, 2, Math.max(3, Math.floor(cap / 2)), "resultado"); else ent(tgt, Math.max(6, Math.floor(cap / 3)), cap, "resultado");
    for (const { a, b, r, x } of celdas) {
      assert.equal(r, resta ? a - b : a + b); ent(a, 1, cap, "a"); ent(b, 1, cap, "b"); ent(r, 2, cap, "resultado");
      assert.equal(x, r === tgt, "solo las casillas del dibujo dan el resultado");
      if (R > 20 && nivel !== "mezcla") {
        const op = resta ? "-" : "+", quiere = nivel === "con";
        // solo se exige cuando existe alguna operación posible con ese resultado (como en el motor)
        const posible = resta
          ? Array.from({ length: cap - r }, (_, i) => i + 1).some((b2) => lleva(op, r + b2, b2, R) === quiere)
          : Array.from({ length: r - 1 }, (_, i) => i + 1).some((a2) => lleva(op, a2, r - a2, R) === quiere);
        if (posible) assert.equal(lleva(op, a, b, R), quiere, `${a} ${op} ${b}: llevada inesperada`);
      }
    }
    assert.deepEqual(e.solucion.colorear, celdas.flatMap((c, i) => (c.x ? [i] : [])));
    assert.deepEqual(e.solucion.huecos, []);
  },
};
