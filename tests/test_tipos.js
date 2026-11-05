// Charta · pruebas comunes de todos los tipos (paso 2.3).  Uso: node tests/test_tipos.js [--full] [--solo <prefijo>]
// Para cada tipo registrado, cada combinación de opciones, completa y media y varias semillas:
// generar() cumple el esquema, render() da SVG limpio, un grupo "ej" por ejercicio y,
// en modo solución, una respuesta en rojo por cada hueco de solucion.huecos.
import assert from "node:assert/strict";
import { generar, modelo } from "../src/nucleo/ficha.js";
import { erroresFicha } from "../src/nucleo/lector.js";
import { listaTipos } from "../src/tipos/index.js";
import { render, svgZona } from "../src/render/actividad.js";
import { COLOR_SOLUCION } from "../src/render/papel.js";

const FULL = process.argv.includes("--full");
const SOLO = (() => { const i = process.argv.indexOf("--solo"); return i > 0 ? process.argv[i + 1] : ""; })();   // --solo conteo. (prefijo)
const SEMILLAS = FULL ? 40 : 6;
let n = 0, fichas = 0;
const prueba = (nombre, f) => { try { f(); n++; } catch (e) { console.error("FALLA:", nombre, "\n", e.stack || e.message); process.exitCode = 1; } };

function xmlBienFormado(s) {
  const pila = [], re = /<(\/?)([A-Za-z][\w:-]*)((?:\s+[\w:-]+="[^"<]*")*)\s*(\/?)>/g;
  let pos = 0, m;
  while ((m = re.exec(s))) {
    const texto = s.slice(pos, m.index);
    assert.ok(!/[<>]/.test(texto), "texto con < o > sin escapar: " + texto.slice(0, 60));
    assert.ok(!/&(?!(amp|lt|gt|quot|apos);)/.test(texto), "& sin escapar");
    pos = re.lastIndex;
    if (m[1]) assert.equal(pila.pop(), m[2], "cierre inesperado " + m[2]);
    else if (!m[4]) pila.push(m[2]);
  }
  assert.deepEqual(pila, [], "etiquetas sin cerrar");
}

import { combinaciones } from "./comun.js";
export { combinaciones };

function comprobar(id, params, tam, s) {
  const acts = tam === "media" ? [{ tipo: id, params }, { tipo: id, params }] : [{ tipo: id, params }];
  let f;
  try { f = generar({ actividades: acts }, s); }
  catch (e) { if (/necesita|solo en|no admite/.test(e.message)) return; throw e; }   // combinación no válida (como el motor)
  fichas++;
  assert.deepEqual(erroresFicha(f), []);
  assert.deepEqual(f, generar({ actividades: acts }, s), "determinista");
  assert.deepEqual(JSON.parse(JSON.stringify(f)), f, "la ficha no sobrevive a JSON (−0, undefined, NaN…)");
  for (const a of f.paginas[0].actividades) {
    assert.ok(a.ejercicios.length > 0, "sin ejercicios");
    assert.ok(typeof a.enunciado === "string" && a.enunciado.length > 5, "enunciado");
    for (const e of a.ejercicios) assert.ok(Array.isArray(e.solucion?.huecos), `${e.id}: solucion.huecos`);
    for (const modo of ["papel", "solucion"]) {
      const z = render(a, modo);
      assert.ok(!/NaN|undefined|Infinity|null/.test(z.svg), `${modo}: NaN/undefined/null en el SVG`);
      xmlBienFormado(svgZona(z));
      const grupos = (z.svg.match(/class="ej"/g) || []).length;
      assert.equal(grupos, a.ejercicios.length, `${modo}: grupos ej ≠ ejercicios`);
      const rojos = (z.svg.match(new RegExp(`fill="${COLOR_SOLUCION}"`, "g")) || []).length;
      const huecos = a.ejercicios.reduce((t, e) => t + e.solucion.huecos.length, 0);
      assert.equal(rojos, modo === "solucion" ? huecos : 0, `${modo}: respuestas en rojo ≠ huecos`);
    }
  }
}

for (const id of listaTipos().filter((x) => x.startsWith(SOLO))) {
  prueba(id, () => {
    const m = modelo(id);
    for (const params of combinaciones(id)) for (const tam of m.tamanos) for (let s = 1; s <= SEMILLAS; s++) {
      try { comprobar(id, params, tam, s); }
      catch (e) { e.message = `${id} ${JSON.stringify(params)} ${tam} semilla ${s}: ${e.message}`; throw e; }
    }
  });
}

console.log(`test_tipos: ${n} tipos OK (${listaTipos().filter((x) => x.startsWith(SOLO)).join(", ")}) · ${fichas} fichas`);
