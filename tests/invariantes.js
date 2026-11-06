// Charta · invariantes aritméticas de cada tipo (paso 2.5; reglas de tests/test_motor.py y CONTEXT.md).
// INVARIANTES[id](actividad, tamano) lanza un error si algún ejercicio no cumple las reglas.
// Tipos nuevos: su regla va en tests/inv/<familia>.js (export default { "<id>"(act, tam) {…} }), con los ayudantes
// de tests/inv/_ayuda.js (ent, unicos, cuantos, mitad, rep). Todo tipo registrado DEBE tener aquí su invariante (test_invariantes.js lo exige): al portar uno nuevo, añadirla.
import assert from "node:assert/strict";
import { ent, unicos, cuantos, mitad, rep } from "./inv/_ayuda.js";
import inv_rep from "./inv/rep.js";
import inv_combinada from "./inv/combinada.js";
import inv_conteo from "./inv/conteo.js";
import inv_orden from "./inv/orden.js";
import inv_valor from "./inv/valor.js";
import inv_sumar from "./inv/sumar.js";
import inv_restar from "./inv/restar.js";
import inv_juegos from "./inv/juegos.js";
import inv_problemas from "./inv/problemas.js";
import inv_trucos from "./inv/trucos.js";
import inv_geometria from "./inv/geometria.js";
import inv_medida from "./inv/medida.js";
import inv_estadistica from "./inv/estadistica.js";
import inv_letra from "./inv/letra.js";
import inv_silaba from "./inv/silaba.js";
import inv_fono from "./inv/fono.js";
import inv_orto from "./inv/orto.js";
import inv_palabra from "./inv/palabra.js";
import inv_frase from "./inv/frase.js";
import inv_lectura from "./inv/lectura.js";
import inv_escritura from "./inv/escritura.js";

export const INVARIANTES = {
  ...inv_rep, ...inv_combinada, ...inv_conteo, ...inv_orden, ...inv_valor, ...inv_sumar, ...inv_restar, ...inv_juegos, ...inv_problemas, ...inv_trucos, ...inv_geometria, ...inv_medida, ...inv_estadistica, ...inv_letra, ...inv_silaba, ...inv_fono, ...inv_orto, ...inv_palabra, ...inv_frase, ...inv_lectura, ...inv_escritura,
  "rep.dado": rep("dado"),
  "rep.marco": rep("marco"),

  "sumar.h20"(act, tam) {
    const es = act.ejercicios, nivel = act.params.nivel || "sin";
    const lleva = ({ datos: { a, b } }) => a < 10 && b < 10 && a + b > 10;      // definición del motor (_pares_suma)
    cuantos(es, tam === "media" ? 12 : 24);
    for (const { datos: { a, b, op }, solucion } of es) {
      assert.equal(op, "+"); ent(a, 1, 19, "a"); ent(b, 1, 19, "b"); ent(a + b, 2, 20, "a + b");
      assert.deepEqual(solucion.huecos, [a + b]);
    }
    if (nivel === "sin") assert.ok(!es.some(lleva), "sin: hay sumas con llevada");
    if (nivel === "con") assert.ok(es.every(lleva), "con: hay sumas sin llevada");
    if (nivel === "mezcla") mitad(es, lleva);
  },

  "sumar.vertical"(act, tam) {
    const es = act.ejercicios, nivel = act.params.nivel || "sin", cap = Math.min(act.params.rango ?? 30, 99);
    const lleva = ({ datos: { a, b } }) => (a % 10) + (b % 10) >= 10;
    cuantos(es, tam === "media" ? 6 : 12);
    unicos(es, (e) => e.datos.a + "+" + e.datos.b);
    for (const { datos: { a, b }, solucion } of es) {
      ent(a, 11, 98, "a"); ent(b, 1, 98, "b"); ent(a + b, 12, cap, "a + b");
      assert.deepEqual(solucion.huecos, [Math.floor((a + b) / 10), (a + b) % 10]);
    }
    if (nivel === "sin") assert.ok(!es.some(lleva), "sin: hay llevadas");
    if (nivel === "con") assert.ok(es.every(lleva), "con: falta llevada");
    if (nivel === "mezcla") mitad(es, lleva);
  },

  "restar.recta"(act, tam) {
    const R = act.params.rango ?? 10, N = R <= 10 ? 10 : R <= 20 ? 20 : 30;
    cuantos(act.ejercicios, tam === "media" ? 3 : 6);
    for (const { datos: { a, b, N: n }, solucion } of act.ejercicios) {
      assert.equal(n, N, "longitud de la recta");
      ent(b, 2, Math.min(9, N - 2), "b"); ent(a, b + 1, N, "a");
      assert.deepEqual(solucion.huecos, [a - b]); ent(a - b, 1, N, "a − b");
    }
  },

  "orden.signos"(act, tam) {
    const es = act.ejercicios, R = act.params.rango ?? 10, cnt = tam === "media" ? 6 : 15;
    cuantos(es, cnt);
    unicos(es, (e) => e.datos.a + "," + e.datos.b);
    for (const { datos: { a, b }, solucion } of es) {
      ent(a, 1, R, "a"); ent(b, 1, R, "b");
      assert.deepEqual(solucion.huecos, [a < b ? "<" : a > b ? ">" : "="]);
      if (act.params.cerca && R >= 20 && a !== b) assert.equal(Math.floor(a / 10), Math.floor(b / 10), `cerca: ${a} y ${b}`);
    }
    const iguales = es.filter((e) => e.datos.a === e.datos.b).length;
    assert.equal(iguales, act.params.modo === "sin" ? 0 : Math.round(cnt / 5), "nº de parejas iguales");
  },

  "conteo.serie1"(act, tam) {
    const R = act.params.rango ?? 10, h = act.params.huecos ?? 3, L = Math.min(6, R + 1);
    cuantos(act.ejercicios, tam === "media" ? 4 : 8);
    act.ejercicios.forEach(({ datos: { paso, valores, huecos, sube }, solucion }, i) => {
      assert.equal(paso, 1); assert.equal(sube, i % 2 === 0, "alterna sube/baja");
      assert.equal(valores.length, L, "longitud de la serie");
      valores.forEach((v, j) => { ent(v, 1, R, "valor"); if (j) assert.equal(v - valores[j - 1], sube ? 1 : -1, "paso de la serie"); });
      assert.equal(huecos.length, Math.max(0, Math.min(h, L - 2)), "nº de huecos");
      assert.deepEqual(huecos, [...new Set(huecos)].sort((x, y) => x - y), "huecos ordenados y distintos");
      huecos.forEach((j) => ent(j, 0, L - 1, "posición del hueco"));
      assert.deepEqual(solucion.huecos, huecos.map((j) => valores[j]));
    });
  },

  "medida.reloj"(act, tam) {
    const es = act.ejercicios, modo = act.params.modo || "mezcla";
    cuantos(es, tam === "media" ? 6 : 12);
    for (const { datos: { h, m }, solucion } of es) {
      ent(h, 1, 12, "hora"); assert.ok(m === 0 || m === 30, "minutos");
      assert.deepEqual(solucion.huecos, [h, m ? "30" : "00"]);
    }
    for (const m of [0, 30]) unicos(es.filter((e) => e.datos.m === m), (e) => e.datos.h, "horas repetidas en un grupo");
    const media = es.filter((e) => e.datos.m === 30).length;
    assert.equal(media, modo === "punto" ? 0 : modo === "media" ? es.length : es.length / 2, "en punto / y media");
  },
};

/** Reglas comunes a todos los tipos: ids únicos, huecos numéricos enteros y no negativos. */
export function comunes(act) {
  unicos(act.ejercicios, (e) => e.id, "ids de ejercicio repetidos");
  for (const e of act.ejercicios) for (const v of e.solucion.huecos)
    if (typeof v === "number") assert.ok(Number.isInteger(v) && v >= 0, `${e.id}: respuesta ${v} negativa o no entera`);
}
