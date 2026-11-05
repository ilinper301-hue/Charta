// Charta · invariantes de la familia «problemas» (ver tests/invariantes.js).
import assert from "node:assert/strict";
import { ent, unicos, cuantos } from "./_ayuda.js";

const MENOS = "−";
const lleva = (op, a, b) => (op === "+" ? (a % 10) + (b % 10) >= 10 : a % 10 < b % 10);
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
      assert.ok(sit ? d.sit === sit : sits.includes(d.sit), `situación ${d.sit}`);
      if (nivel === "sin") assert.ok(!lleva(d.op, d.a, d.b), `sin: ${d.a} ${d.op} ${d.b} lleva`);
      if (nivel === "con") assert.ok(lleva(d.op, d.a, d.b), `con: ${d.a} ${d.op} ${d.b} no lleva`);
    });
    if (nivel === "mezcla") assert.equal(es.filter((e) => lleva(e.datos.op, e.datos.a, e.datos.b)).length, es.length / 2, "mezcla: mitad y mitad");
  };
}

export default {
  "problemas.suma": problemas("suma"),
  "problemas.resta": problemas("resta"),
  "problemas.mixtos": problemas("mixtos"),
};
