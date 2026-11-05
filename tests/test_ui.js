// Charta · pruebas de la navegación del catálogo (paso 4.1).  Uso: node tests/test_ui.js
import assert from "node:assert/strict";
import { CATALOGO } from "../src/nucleo/catalogo.js";
import { listaTipos } from "../src/tipos/index.js";
import { cursos, materias, bloques, modelos, miniatura } from "../src/ui/navegacion.js";

const cs = cursos();
assert.ok(cs.length >= 1 && cs[0].nombre);
let total = 0;
for (const c of cs) for (const m of materias(c.id)) for (const b of bloques(c.id, m.id)) {
  const ms = modelos(c.id, m.id, b.id);
  assert.equal(ms.length, b.n, `nº de modelos del bloque ${b.id}`);
  assert.ok(b.nombre && !b.nombre.startsWith("Bloque "), `bloque ${b.id} sin nombre`);
  for (const x of ms) {
    assert.ok(x.nombre && x.descripcion, `${x.id}: falta nombre o descripción`);
    const svg = miniatura(x.id);
    assert.ok(svg.startsWith("<svg") && svg.length > 200 && !/NaN|undefined/.test(svg), `${x.id}: miniatura`);
  }
  total += ms.length;
}
assert.equal(total, listaTipos().length, "todos los tipos aparecen en el selector");
// En media página, los de solo página completa salen marcados.
const solo = CATALOGO.modelos.filter((m) => !m.tamanos.includes("media"));
for (const m of solo) assert.equal(modelos(m.curso, m.materia, m.bloque, "media").find((x) => x.id === m.id).cabe, false);
console.log(`test_ui: ${total} modelos navegables con miniatura · ${solo.length} solo página completa`);
