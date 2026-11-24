// Charta · invariantes de la familia «dividir» (3.º, lote 4; ver tests/invariantes.js). Aritmética comprobada de forma independiente.
import assert from "node:assert/strict";
import { ent, unicos, cuantos } from "./_ayuda.js";

const X = "×", D = "÷";
/** Divisores / factores de la opción `tablas` (None = del 2 al 10 · "2a5" · "6a9"). */
const divs = (v) => (v == null ? [2, 3, 4, 5, 6, 7, 8, 9, 10] : v === "2a5" ? [2, 3, 4, 5] : [6, 7, 8, 9]);

export default {
  "dividir.tabla"(act, tam) {
    const es = act.ejercicios, modo = act.params.modo ?? null, T = divs(act.params.tablas), media = tam === "media";
    cuantos(es, modo === "porque" ? (media ? 6 : 12) : media ? 8 : 16);
    unicos(es, (e) => e.datos.d + "," + e.datos.c, "división repetida");
    const porD = {}; for (const e of es) porD[e.datos.d] = (porD[e.datos.d] ?? 0) + 1;
    assert.ok(Math.max(...Object.values(porD)) <= Math.ceil(es.length / T.length), "un divisor se repite demasiado");
    for (const { datos: { d, c, modo: m }, solucion: { huecos } } of es) {
      assert.ok(T.includes(d), `divisor ${d} fuera de las tablas`);
      ent(c, 2, 10, "cociente"); assert.ok(d !== 1 && c !== 1, "÷1 o cociente 1");
      const n = d * c;
      assert.equal(n % d, 0, "división no exacta"); assert.equal(n / d, c);
      assert.equal(m, modo);
      if (modo === "porque") assert.deepEqual(huecos, [c, c], "porque: cociente y el mismo número en cociente × divisor = dividendo");
      else if (modo === "hueco") assert.deepEqual(huecos, [d], "hueco: el divisor que falta");
      else assert.deepEqual(huecos, [c], "el cociente");
      if (modo === "porque") assert.equal(huecos[0] * d, n, "cociente × divisor = dividendo");
      if (modo === "hueco") assert.equal(n / huecos[0], c, "dividendo ÷ hueco = cociente");
    }
  },
  "dividir.familia"(act, tam) {
    const es = act.ejercicios, libre = act.params.modo === "libre", T = divs(act.params.tablas), media = tam === "media";
    cuantos(es, libre ? (media ? 2 : 4) : media ? 4 : 6);
    unicos(es, (e) => [e.datos.a, e.datos.b].sort((u, v) => u - v).join(","), "familia repetida");
    for (const { datos: { a, b, c, f }, solucion: { huecos } } of es) {
      ent(a, 2, 10, "a"); ent(b, 2, 10, "b"); assert.ok(a < b, "a < b (a ≠ b: cuatro operaciones distintas)");
      assert.ok(T.includes(a) || T.includes(b), `ningún factor de las tablas: ${a}, ${b}`);
      assert.equal(c, a * b);
      if (libre) {
        assert.equal(f, undefined);
        assert.deepEqual(huecos, [a, b, c, b, a, c, c, a, b, c, b, a], "a × b = c, b × a = c, c ÷ a = b, c ÷ b = a");
        continue;
      }
      // «Completa»: cuatro filas [u, op, v, w] con UN hueco (null); el hueco, rellenado con la solución, da una operación cierta, y ese valor es el único posible
      assert.equal(f.length, 4); assert.equal(huecos.length, 4);
      assert.deepEqual(f.map((r) => r[1]), [X, X, D, D], "operaciones: ×, ×, ÷, ÷");
      f.forEach((fila, i) => {
        assert.equal(fila.filter((v) => v === null).length, 1, `fila ${i + 1}: un solo hueco`);
        const pos = fila.indexOf(null), cierta = (x) => { const [u, op, v, w] = fila.map((q, k) => (k === pos ? x : q)); return op === X ? u * v === w : u / v === w; };
        assert.ok(pos === 0 || pos === 2 || pos === 3, "el hueco no es el signo");
        assert.ok(cierta(huecos[i]), `fila ${i + 1}: la solución no cumple la operación`);
        const validos = []; for (let x = 0; x <= 100; x++) if (cierta(x)) validos.push(x);
        assert.deepEqual(validos, [huecos[i]], `fila ${i + 1}: la solución no es única`);
        const nums = fila.filter((v, k) => k !== 1 && v !== null).concat(huecos[i]).sort((u, v) => u - v);
        assert.deepEqual(nums, [a, b, c].sort((u, v) => u - v), `fila ${i + 1}: no usa los tres números de la familia`);
      });
    }
  },
  "dividir.vertical"(act, tam) {
    const es = act.ejercicios, n = act.params.cifras === 3 ? 3 : 2, nivel = act.params.nivel || "exacta", prueba = !!act.params.prueba;
    cuantos(es, tam === "media" ? 6 : 12);
    unicos(es, (e) => e.datos.D + "," + e.datos.d, "división repetida");
    for (const { datos: { D, d }, solucion: { huecos } } of es) {
      ent(D, 10 ** (n - 1), 10 ** n - 1, "dividendo"); ent(d, 2, 9, "divisor");
      const c = Math.floor(D / d), r = D - c * d;
      assert.ok(c >= 2 && !String(c).includes("0"), `cociente ${c}: menor que 2 o con un 0`);
      if (nivel === "exacta") assert.equal(r, 0, `${D} ÷ ${d} no es exacta`);
      if (nivel === "resto") assert.ok(r > 0, `${D} ÷ ${d} sin resto`);
      assert.equal(c * d + r, D);
      assert.deepEqual(huecos, prueba ? [c, r, c, d, r, D] : [c, r]);
    }
    if (nivel === "mezcla") assert.equal(es.filter((e) => e.datos.D % e.datos.d > 0).length, es.length / 2, "mezcla: no hay mitad y mitad");
  },
};
