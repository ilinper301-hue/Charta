// Charta · invariantes de la familia «multiplicar» (2.º, lote 6; ver tests/invariantes.js). Aritmética comprobada de forma independiente.
import assert from "node:assert/strict";
import { ent, unicos, cuantos } from "./_ayuda.js";

const X = "×";
/** Tablas de la opción `tablas` (None = 2, 5 y 10; "todas" = 2, 3, 4, 5 y 10; "2a10" = del 2 al 10; "n" = solo la n). */
const tablas = (v) => (v == null ? [2, 5, 10] : v === "todas" ? [2, 3, 4, 5, 10] : v === "2a10" ? [2, 3, 4, 5, 6, 7, 8, 9, 10] : [Number(v)]);
const cifras = (n) => String(n).split("").map(Number);

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
  // ---- 3.º · lote 3
  "multiplicar.vertical"(act, tam) {
    const es = act.ejercicios, n = act.params.cifras === 3 ? 3 : 2, nivel = act.params.nivel || "sin", cnt = tam === "media" ? 6 : 12;
    cuantos(es, cnt);
    unicos(es, (e) => e.datos.a + "," + e.datos.b, "operación repetida");
    const lleva = (a, b) => { let c = 0; const l = cifras(a).reverse().map((d) => (c = Math.floor((d * b + c) / 10))); return l.slice(0, -1).some((v) => v > 0); };
    for (const { datos: { a, b }, solucion: { huecos } } of es) {
      ent(a, n === 2 ? 11 : 102, n === 2 ? 99 : 999, "a"); ent(b, 2, 9, "b");
      assert.notEqual(a % 10, 0, "a acaba en cero");
      assert.equal(String(a).length, n, "cifras de a");
      assert.deepEqual(huecos, cifras(a * b), "cifras del producto");
      assert.ok(huecos.length === n || huecos.length === n + 1, "columnas del producto");
      const con = cifras(a).some((d) => d * b >= 10);   // alguna cifra por b ≥ 10 ⇒ hay llevada (la de la última cifra sale en el producto)
      if (nivel === "sin") assert.ok(!con && !lleva(a, b), `con llevada en «sin»: ${a} ${X} ${b}`);
      if (nivel === "con") assert.ok(lleva(a, b), `sin llevada escrita en «con»: ${a} ${X} ${b}`);
    }
    if (nivel === "mezcla") assert.equal(es.filter((e) => lleva(e.datos.a, e.datos.b)).length, cnt / 2, "mezcla: mitad con llevada");
    const porB = {}; for (const e of es) porB[e.datos.b] = (porB[e.datos.b] ?? 0) + 1;
    assert.ok(Math.max(...Object.values(porB)) <= Math.ceil(cnt / Object.keys(porB).length) + 1 || Object.keys(porB).length < 3, "un b se repite demasiado");
  },
  "multiplicar.por10"(act, tam) {
    const es = act.ejercicios, modo = act.params.modo ?? null, por = act.params.por == null ? null : Number(act.params.por), media = tam === "media";
    assert.ok(es.length >= (media ? 8 : 16) && es.length % 2 === 0, `ejercicios: ${es.length}`);
    unicos(es, (e) => e.datos.a + "," + e.datos.f, "operación repetida");
    const fs = new Set();
    for (const { datos: { a, f, falta }, solucion: { huecos } } of es) {
      assert.ok([10, 100, 1000].includes(f), "factor"); fs.add(f);
      if (por) assert.equal(f, por, "factor distinto del pedido");
      ent(a, 2, f === 10 ? 999 : f === 100 ? 99 : 9, "a");
      assert.ok(a < 11 || a % 10 !== 0, "a acaba en cero");
      ent(a * f, 20, 9999, "resultado");
      assert.equal(huecos.length, 1);
      if (modo === "hueco") { assert.ok(falta === 0 || falta === 1); assert.deepEqual(huecos, [falta === 0 ? a : f]); }
      else { assert.equal(falta, null); assert.deepEqual(huecos, [a * f]); }
    }
    if (!por) assert.equal(fs.size, 3, "mezcla: los tres factores");
  },
  "multiplicar.dobletriple"(act, tam) {
    const es = act.ejercicios, modo = act.params.modo ?? null, media = tam === "media";
    const permitidas = modo === "todo" ? ["doble", "triple", "mitad", "tercio"] : modo === "mitad" ? ["mitad", "tercio"] : ["doble", "triple"];
    assert.ok(es.length >= (media ? 8 : 16) && es.length % 2 === 0, `ejercicios: ${es.length}`);
    unicos(es, (e) => e.datos.tarea + e.datos.n, "repetido");
    const veces = {}; for (const e of es) veces[e.datos.tarea] = (veces[e.datos.tarea] ?? 0) + 1;
    assert.deepEqual(Object.keys(veces).sort(), [...permitidas].sort(), "tareas");
    assert.ok(Math.max(...Object.values(veces)) - Math.min(...Object.values(veces)) <= 1, "tareas repartidas por turnos");
    for (const { datos: { tarea, n }, solucion: { huecos } } of es) {
      assert.ok(permitidas.includes(tarea));
      assert.equal(huecos.length, 1);
      if (tarea === "doble") { ent(n, 11, 4900, "n"); assert.equal(huecos[0], n * 2); }
      if (tarea === "triple") { ent(n, 11, 3300, "n"); assert.equal(huecos[0], n * 3); }
      if (tarea === "mitad") { ent(n, 12, 9800, "n"); assert.equal(n % 2, 0); assert.equal(huecos[0] * 2, n); }
      if (tarea === "tercio") { ent(n, 12, 9900, "n"); assert.equal(n % 3, 0); assert.equal(huecos[0] * 3, n); }
      ent(huecos[0], 4, 9999, "resultado");
    }
  },
};
