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
      assert.ok(sit ? d.sit === sit : sits.includes(d.sit), `situación ${d.sit}`);
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

export default {
  "problemas.barras": barras,
  "problemas.suma": problemas("suma"),
  "problemas.resta": problemas("resta"),
  "problemas.mixtos": problemas("mixtos"),
};
