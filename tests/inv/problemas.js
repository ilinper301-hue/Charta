// Charta · invariantes de la familia «problemas» (ver tests/invariantes.js).
import assert from "node:assert/strict";
import { ent, unicos, cuantos, llevaS3, llevaR3 } from "./_ayuda.js";

const MENOS = "−";
const lleva = (op, a, b, R = 0) => (R > 100 ? (op === "+" ? llevaS3(a, b) : llevaR3(a, b)) : op === "+" ? (a % 10) + (b % 10) >= 10 : a % 10 < b % 10);
const palabra = (t, n) => new RegExp(`(^|[^\\d])${n}([^\\d]|$)`).test(t);

function problemas(clase) {
  return (act, tam) => {
    const es = act.ejercicios, R = act.params.rango ?? 20, nivel = act.params.nivel || "sin", sit = act.params.situacion;
    cuantos(es, tam === "media" ? 2 : 4);
    unicos(es, (e) => e.datos.op + e.datos.a + "," + e.datos.b, "cantidades repetidas");
    unicos(es, (e) => e.datos.obj, "objeto repetido");
    es.forEach(({ datos: d, solucion }, i) => {
      const esSuma = clase === "suma" || (clase === "mixtos" && i % 2 === 0);
      assert.equal(d.op, esSuma ? "+" : MENOS, "operación");
      ent(d.a, 2, R, "a"); ent(d.b, 2, R, "b");
      const res = esSuma ? d.a + d.b : d.a - d.b;
      ent(res, 2, R, "resultado");                                  // nada negativo ni por encima del rango; plural siempre correcto
      assert.deepEqual(solucion.huecos, [d.a, d.op, d.b, res, res]);
      assert.ok(palabra(d.texto, d.a) && palabra(d.texto, d.b), "el enunciado debe nombrar las dos cantidades: " + d.texto);
      assert.ok(d.texto.includes(d.obj) && /^[A-ZÁÉÍÓÚ¿]/.test(d.texto) && d.texto.endsWith("?"), "texto: " + d.texto);
      assert.ok(!/undefined|NaN|\s{2}/.test(d.texto), "texto: " + d.texto);
      const sits = { suma: ["juntar", "anadir"], resta: ["quitar", "comparar", "faltar"] }[esSuma ? "suma" : "resta"];
      const nuevas = { suma: ["inicio"], resta: ["igualar", "inicio"] }[esSuma ? "suma" : "resta"];   // 2.º (lote 5)
      assert.ok(sit === "todas" ? [...sits, ...nuevas].includes(d.sit) : sit ? d.sit === sit : sits.includes(d.sit), `situación ${d.sit}`);
      if (d.sit === "inicio") { const pos = (n) => d.texto.search(new RegExp(`(^|[^\\d])${n}([^\\d]|$)`)); assert.ok(/al principio\?$/.test(d.texto) && pos(d.b) <= pos(d.a), "inicio: " + d.texto); }
      if (nivel === "sin") assert.ok(!lleva(d.op, d.a, d.b, R), `sin: ${d.a} ${d.op} ${d.b} lleva`);
      if (nivel === "con") assert.ok(lleva(d.op, d.a, d.b, R), `con: ${d.a} ${d.op} ${d.b} no lleva`);
    });
    if (nivel === "mezcla") assert.equal(es.filter((e) => lleva(e.datos.op, e.datos.a, e.datos.b, R)).length, es.length / 2, "mezcla: mitad y mitad");
  };
}

/** problemas.barras: las mismas reglas que suma / resta / mixtos según `operacion`, y los nombres de la comparación. */
function barras(act, tam) {
  const clase = act.params.operacion === "suma" ? "suma" : act.params.operacion === "resta" ? "resta" : "mixtos";
  problemas(clase)(act, tam);
  for (const { datos: d } of act.ejercicios) {
    assert.equal(d.nombres.length, 2); assert.notEqual(d.nombres[0], d.nombres[1]);
    if (d.sit === "comparar") assert.ok(d.a > d.b && d.texto.includes(d.nombres[0]) && d.texto.includes(d.nombres[1]), "comparar: nombres");
  }
}

// ---------------------------------------------------------------- 2.º (lote 5)
const SITS_2 = { suma: ["dar_dar"], resta: ["quitar_quitar"], mixtas: ["dar_quitar", "quitar_dar", "juntar_quitar"] };
const OPS_2 = { dar_dar: ["+", "+"], quitar_quitar: [MENOS, MENOS], dar_quitar: ["+", MENOS], quitar_dar: [MENOS, "+"], juntar_quitar: ["+", MENOS] };
const opera = (op, x, y) => (op === "+" ? x + y : x - y);
const lleva3 = (op, x, y) => (op === "+" ? llevaS3(x, y) : llevaR3(x, y));

/** problemas.dospasos: dos operaciones encadenadas, todo en 2..R, el enunciado nombra las tres cantidades. */
function dospasos(act, tam) {
  const es = act.ejercicios, R = act.params.rango ?? 100, nivel = act.params.nivel || "sin", ops = act.params.operaciones;
  cuantos(es, act.params.barra ? (tam === "media" ? 1 : 3) : tam === "media" ? 2 : 4);
  unicos(es, (e) => `${e.datos.a},${e.datos.b},${e.datos.c}`, "cantidades repetidas");
  unicos(es, (e) => e.datos.obj, "objeto repetido");
  const llevan = es.map(({ datos: d, solucion }) => {
    assert.deepEqual([d.op1, d.op2], OPS_2[d.sit], "operaciones de " + d.sit);
    assert.ok((ops ? SITS_2[ops] : Object.values(SITS_2).flat()).includes(d.sit), "situación " + d.sit);
    for (const [v, q] of [[d.a, "a"], [d.b, "b"], [d.c, "c"]]) { ent(v, 2, R, q); assert.ok(palabra(d.texto, v), `falta ${q} en: ${d.texto}`); }
    assert.ok(d.a !== d.b && d.b !== d.c && d.a !== d.c, "cantidades distintas");
    const r1 = opera(d.op1, d.a, d.b), r2 = opera(d.op2, r1, d.c);
    ent(r1, 2, R, "intermedio"); ent(r2, 2, R, "resultado");
    assert.deepEqual(solucion.huecos, [d.a, d.op1, d.b, r1, r1, d.op2, d.c, r2, r2]);
    assert.ok(d.texto.includes(d.obj) && /^[A-ZÁÉÍÓÚ¿]/.test(d.texto) && d.texto.endsWith("?") && !/undefined|NaN|\s{2}/.test(d.texto), "texto: " + d.texto);
    return lleva3(d.op1, d.a, d.b) || lleva3(d.op2, r1, d.c);
  });
  if (nivel === "sin") assert.ok(llevan.every((x) => !x), "sin llevadas");
  if (nivel === "con") assert.ok(llevan.every((x) => x), "con llevadas");
  if (nivel === "mezcla") assert.deepEqual(llevan, llevan.map((_, i) => i % 2 === 0), "mezcla: alterna con y sin");
}

/** problemas.dinero: precios en euros enteros, resultado en 2..R, situación y operación coherentes. */
function dinero(act, tam) {
  const es = act.ejercicios, R = act.params.rango ?? 100, sit = act.params.situacion;
  cuantos(es, tam === "media" ? 2 : 4);
  unicos(es, (e) => e.datos.op + e.datos.a + "," + e.datos.b, "cantidades repetidas");
  for (const { datos: d, solucion } of es) {
    assert.ok(sit ? d.sit === sit : ["pagar", "vuelta", "queda", "falta"].includes(d.sit), "situación " + d.sit);
    assert.equal(d.op, d.sit === "pagar" ? "+" : MENOS, "operación");
    assert.equal(d.obj, "€");
    ent(d.a, 2, R, "a"); ent(d.b, 2, R, "b");
    const res = opera(d.op, d.a, d.b);
    ent(res, 2, R, "resultado");
    assert.deepEqual(solucion.huecos, [d.a, d.op, d.b, res, res]);
    assert.ok(palabra(d.texto, d.a) && palabra(d.texto, d.b) && d.texto.includes(`${d.a} €`) && d.texto.includes(`${d.b} €`), "texto: " + d.texto);
    if (d.sit === "vuelta") assert.ok([5, 10, 20, 50, 100, 200, 500].includes(d.a) && d.texto.includes(`billete de ${d.a} €`), "billete: " + d.texto);
    assert.ok(/^[A-ZÁÉÍÓÚ¿]/.test(d.texto) && d.texto.endsWith("?") && !/undefined|NaN|\s{2}/.test(d.texto), "texto: " + d.texto);
  }
}

export default {
  "problemas.dospasos": dospasos,
  "problemas.dinero": dinero,
  "problemas.barras": barras,
  "problemas.suma": problemas("suma"),
  "problemas.resta": problemas("resta"),
  "problemas.mixtos": problemas("mixtos"),
};
