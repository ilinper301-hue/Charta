// Charta · invariantes de la familia «multiplicar» (2.º, lote 6; ver tests/invariantes.js). Aritmética comprobada de forma independiente.
import assert from "node:assert/strict";
import { ent, unicos, cuantos } from "./_ayuda.js";

const X = "×";
/** Tablas de la opción `tablas` (None = 2, 5 y 10; "todas" = 2, 3, 4, 5 y 10; "n" = solo la n). */
const tablas = (v) => (v == null ? [2, 5, 10] : v === "todas" ? [2, 3, 4, 5, 10] : [Number(v)]);

export default {
  "multiplicar.grupos"(act, tam) {
    const es = act.ejercicios, mult = act.params.modo === "mult";
    cuantos(es, tam === "media" ? 3 : 6);
    unicos(es, (e) => e.datos.k + "," + e.datos.n, "(k, n) repetido");
    for (const { datos: { k, n }, solucion: { huecos } } of es) {
      ent(k, 2, 5, "grupos"); ent(n, 2, 5, "puntos por grupo");
      assert.deepEqual(huecos, mult ? [k, n, k * n] : [...Array(k).fill(n), k * n, k, n, k * n], "huecos en el orden de la tarjeta");
      assert.equal(huecos.length, mult ? 3 : k + 4);
    }
  },
  "multiplicar.filas"(act, tam) {
    const es = act.ejercicios, dos = act.params.modo === "dos";
    cuantos(es, tam === "media" ? 3 : 6);
    unicos(es, (e) => e.datos.r + "," + e.datos.c, "(r, c) repetido");
    assert.ok(es.filter((e) => e.datos.r === e.datos.c).length <= 1, "más de una matriz cuadrada");
    for (const { datos: { r, c }, solucion: { huecos } } of es) {
      ent(r, 2, 5, "filas"); ent(c, 2, 6, "columnas");
      assert.deepEqual(huecos, [r, c, r, c, r * c, ...(dos ? [c, r, r * c] : [])]);
    }
  },
  "multiplicar.tablas"(act, tam) {
    const es = act.ejercicios, modo = act.params.modo ?? null, T = tablas(act.params.tablas), media = tam === "media";
    if (modo === "orden") {
      const usadas = [...new Set(es.map((e) => e.datos.tabla))];
      assert.ok(usadas.length >= 1 && usadas.length <= 3 && usadas.every((t) => T.includes(t)), "tablas usadas");
      assert.equal(usadas.length, Math.min(3, T.length), "nº de tablas");
      assert.deepEqual([...usadas].sort((u, v) => u - v), usadas, "tablas en orden creciente");
      cuantos(es, usadas.length * (media ? 5 : 10));
      es.forEach((e, i) => {
        const { a, b, tabla } = e.datos, pos = i % (media ? 5 : 10);
        assert.equal(a, tabla); assert.equal(b, pos + 1, "de ×1 en adelante, seguidos");
        assert.equal(tabla, usadas[Math.floor(i / (media ? 5 : 10))], "por bloques");
        assert.deepEqual(e.solucion.huecos, [tabla * b]);
      });
      return;
    }
    const pool = new Set(); for (let a = 1; a <= 10; a++) for (let b = 1; b <= 10; b++) if (T.includes(a) || T.includes(b)) pool.add(a + "," + b);
    const filas = pool.size >= 24 ? 8 : 6;
    cuantos(es, (media ? filas / 2 : filas) * 3);
    unicos(es, (e) => e.datos.a + "," + e.datos.b, "operación repetida");
    for (const { datos: { a, b, falta }, solucion: { huecos } } of es) {
      ent(a, 1, 10, "a"); ent(b, 1, 10, "b");
      assert.ok(T.includes(a) || T.includes(b), `ningún factor de la tabla: ${a} ${X} ${b}`);
      if (modo === "hueco") { assert.ok(falta === 0 || falta === 1); assert.deepEqual(huecos, [falta === 0 ? a : b]); assert.equal(huecos.length, 1); }
      else { assert.equal(falta, null); assert.deepEqual(huecos, [a * b]); }
    }
  },
  "multiplicar.problemas"(act, tam) {
    const es = act.ejercicios, T = tablas(act.params.tablas);
    cuantos(es, tam === "media" ? 2 : 4);
    unicos(es, (e) => e.datos.a + "," + e.datos.b, "cantidades repetidas");
    unicos(es, (e) => e.datos.obj, "objeto repetido");
    unicos(es, (e) => e.datos.texto.replace(/\d+/g, "#").split(" ").slice(0, 3).join(" ") + e.datos.texto.length, "plantilla repetida");
    const palabra = (t, n) => new RegExp(`(^|[^\\d])${n}([^\\d]|$)`).test(t);
    for (const { datos: d, solucion } of es) {
      assert.equal(d.op, X);
      ent(d.a, 2, 10, "grupos"); ent(d.b, 2, 10, "en cada uno");
      assert.ok(T.includes(d.a) || T.includes(d.b), "ningún factor de la tabla");
      ent(d.a * d.b, 4, 100, "resultado");
      assert.deepEqual(solucion.huecos, [d.a, X, d.b, d.a * d.b, d.a * d.b]);
      assert.ok(palabra(d.texto, d.a) && palabra(d.texto, d.b), "el enunciado debe nombrar las dos cantidades: " + d.texto);
      assert.ok(d.texto.includes(d.obj) && /^[A-ZÁÉÍÓÚ¿]/.test(d.texto) && d.texto.endsWith("?"), "texto: " + d.texto);
      assert.ok(!/undefined|NaN|\s{2}/.test(d.texto), "texto: " + d.texto);
      // concordancia: «Cuántas» solo con objetos femeninos (plural en -as, o -es de «flores»), «Cuántos» con masculinos
      const fem = /Cuántas/.test(d.texto), masc = /Cuántos/.test(d.texto);
      assert.ok(fem !== masc, "una sola forma de «cuántos»: " + d.texto);
      if (fem) assert.ok(/(as|ores)$/.test(d.obj), `«cuántas» con ${d.obj}`); else assert.ok(!/(as)$/.test(d.obj) && d.obj !== "flores", `«cuántos» con ${d.obj}`);
    }
  },
  "multiplicar.reparto"(act, tam) {
    const es = act.ejercicios, media = tam === "media";
    if (act.params.modo === "mitad") {
      cuantos(es, media ? 3 : 6);
      unicos(es, (e) => e.datos.kind + e.datos.n, "repetidos");
      const ms = es.filter((e) => e.datos.kind === "mitad"), ts = es.filter((e) => e.datos.kind === "tercio");
      assert.equal(ms.length, media ? 2 : 3); assert.equal(ts.length, media ? 1 : 3);
      for (const { datos: { kind, n }, solucion: { huecos } } of es) {
        if (kind === "mitad") { ent(n, 2, 20, "n"); assert.equal(n % 2, 0, "mitad de un par"); assert.equal(huecos[0] * 2, n); }
        else { ent(n, 3, 18, "n"); assert.equal(n % 3, 0, "tercio de un múltiplo de 3"); assert.equal(huecos[0] * 3, n); }
        assert.equal(huecos.length, 1);
      }
      return;
    }
    cuantos(es, media ? 2 : 4);
    unicos(es, (e) => e.datos.k + "," + e.datos.q, "(k, q) repetido");
    unicos(es, (e) => e.datos.obj, "objeto repetido");
    for (const { datos: { texto, k, q, obj }, solucion: { huecos } } of es) {
      ent(k, 2, 5, "niños"); ent(q, 2, 6, "a cada uno"); ent(k * q, 4, 30, "total");
      assert.deepEqual(huecos, [q]);
      assert.ok(texto.includes(`Reparte ${k * q} ${obj} entre ${k} `) && texto.endsWith("a cada uno?") && !/[÷:]/.test(texto), "texto: " + texto);
    }
  },
};
