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

// Paso 4.3 · alumnos pegados y nº de variantes
import { leerAlumnos, numVariantes } from "../src/ui/alumnos.js";
import { generar } from "../src/nucleo/ficha.js";
import { hojas } from "../src/render/hoja.js";
assert.deepEqual(leerAlumnos("Ana\n\n  Luis  \n"), ["Ana", "Luis"]);
assert.deepEqual(leerAlumnos("Ana, Luis; Eva"), ["Ana", "Luis", "Eva"]);
assert.deepEqual(leerAlumnos("1. Ana García\n2) Luis\n- Eva\n• Iker"), ["Ana García", "Luis", "Eva", "Iker"]);
assert.deepEqual(leerAlumnos("1\tGarcía Pérez\tAna\n2\tRuiz\tLuis"), ["García Pérez Ana", "Ruiz Luis"]);
assert.deepEqual(leerAlumnos("María José\nJosé Mª"), ["María José", "José Mª"]);
assert.deepEqual(leerAlumnos("García Pérez, Ana\nRuiz Gil, Luis María"), ["Ana García Pérez", "Luis María Ruiz Gil"]);
assert.deepEqual(leerAlumnos("1. Ruiz, Luis\n2. Gil, Eva"), ["Luis Ruiz", "Eva Gil"]);
assert.equal(numVariantes("iguales", 20), 1);
assert.equal(numVariantes("2", 20), 2);
assert.equal(numVariantes("3", 2), 2);
assert.equal(numVariantes("distintas", 25), 25);
assert.equal(numVariantes("distintas", 40), 30);
const f = generar({ actividades: [{ tipo: "sumar.h20" }], variantes: 2 }, 5);
const hs = hojas(f, { copias: 4 });
assert.deepEqual(hs.map((h) => [h.nombre, h.variante]), [["", 0], ["", 1], ["", 0], ["", 1]]);
assert.notEqual(hs[0].svg, hs[1].svg); assert.equal(hs[0].svg.replace(/h\d+p/g, ""), hs[2].svg.replace(/h\d+p/g, ""));
assert.equal(hojas(f, { nombres: ["Ana", "Luis", "Eva"] }).length, 3);
console.log("test_ui: alumnos y variantes OK");

// Paso 4.4 · recientes y favoritos
import { crearGuardadas, MAX_RECIENTES } from "../src/ui/guardadas.js";
const mem = () => { const d = {}; return { getItem: (k) => d[k] ?? null, setItem: (k, v) => { d[k] = v; }, d }; };
const al = mem(), g = crearGuardadas(al);
const c1 = { actividades: [{ tipo: "sumar.h20", params: { nivel: "con" } }], semilla: 3, titulo: "", variaciones: "2", bn: false, nombres: ["Ana"] };
g.anotarReciente(c1, "Sumas"); g.anotarReciente({ ...c1, semilla: 9 }, "Sumas");
assert.equal(g.recientes().length, 1); assert.equal(g.recientes()[0].semilla, 9);
assert.ok(!JSON.stringify(al.d).includes("Ana"), "nunca se guardan nombres");
for (let i = 0; i < 12; i++) g.anotarReciente({ ...c1, titulo: "t" + i }, "x");
assert.equal(g.recientes().length, MAX_RECIENTES); assert.equal(g.recientes()[0].titulo, "t11");
assert.equal(g.alternarFavorito(c1, "Sumas"), true); assert.ok(g.esFavorito(c1)); assert.ok(!g.esFavorito({ ...c1, semilla: 4 }));
assert.equal(g.alternarFavorito(c1, "Sumas"), false); assert.equal(g.favoritos().length, 0);
al.setItem("charta:favoritos", "{roto"); assert.deepEqual(g.favoritos(), []);
console.log("test_ui: recientes y favoritos OK");

// Paso 5.2 · enlace con Tabula (mismo contrato que tabula/js/charta.js)
import { b64url, deB64url, leerEntrada, urlVolver, gruposDeTabula, leerTabula, composicionValida } from "../src/ui/tabula.js";
{
  const t = "Señora Muñoz: «sumas» ¿qué? 😀";
  assert.equal(deB64url(b64url(t)), t);
  assert.ok(!/[+/=]/.test(b64url(t + "??>>")));
  const comp = { actividades: [{ tipo: "sumar.h20", params: { rango: 20 } }], semilla: 7, titulo: "Sumas", variaciones: "iguales", bn: false };
  const e = leerEntrada(`?desde=tabula&grupo=g1&sesion=s1&comp=${b64url(JSON.stringify(comp))}`);
  assert.deepEqual([e.desdeTabula, e.grupo, e.sesion, e.tarea], [true, "g1", "s1", null]);
  assert.deepEqual(e.comp, comp);
  assert.equal(leerEntrada("?comp=%%%").comp, null);
  assert.equal(leerEntrada(`?comp=${b64url('{"actividades":[]}')}`).comp, null);
  assert.equal(composicionValida(comp, (id) => id !== "sumar.h20"), null, "tipo desconocido");
  const u = urlVolver({ id: "f1", titulo: "Sumas", tipos: ["sumar.h20"], comp, grupo: "g1", sesion: null });
  assert.ok(u.startsWith("/tabula/?charta="));
  const p = JSON.parse(deB64url(new URLSearchParams(u.split("?")[1]).get("charta")));
  assert.deepEqual(p, { v: 1, id: "f1", titulo: "Sumas", tipos: ["sumar.h20"], comp, grupo: "g1" });
  assert.ok(!("id" in JSON.parse(deB64url(urlVolver({ titulo: "x", comp }).split("=")[1]))));
  // Grupos: sin archivados, alumnado en su orden, «Nombre Apellidos»
  const gs = gruposDeTabula(
    [{ id: "b", nombre: "2º A", curso: 2 }, { id: "a", nombre: "1º A", curso: 1 }, { id: "z", nombre: "Viejo", archivado: true }],
    [{ id: 1, groupId: "a", nombre: "Luis", apellidos: "Pérez", orden: 2 }, { id: 2, groupId: "a", nombre: "Ana", apellidos: "Ruiz López", orden: 1 },
     { id: 3, groupId: "z", nombre: "X" }, { id: 4, groupId: "b", nombre: "Eva", apellidos: "" }]);
  assert.deepEqual(gs, [{ id: "a", nombre: "1º A", alumnos: ["Ana Ruiz López", "Luis Pérez"] }, { id: "b", nombre: "2º A", alumnos: ["Eva"] }]);
  assert.deepEqual(leerAlumnos(gs[0].alumnos.join("\n")), ["Ana Ruiz López", "Luis Pérez"], "los nombres pasan tal cual al cuadro de alumnos");
  // Lectura del almacén: IndexedDB (sin crear la base si no existe) y, si no, localStorage
  const ls = (o) => ({ getItem: (k) => o[k] ?? null });
  const r1 = await leerTabula(null, ls({ "tabula:v1:groups": '[{"id":"a"}]', "tabula:v1:students": "[]" }));
  assert.deepEqual(r1, { groups: [{ id: "a" }], students: [] });
  assert.equal(await leerTabula(null, ls({})), null);
  const falsa = (cols) => ({ open() {
    const req = {}; let abortada = false;
    setTimeout(() => {
      if (!cols) { req.transaction = { abort() { abortada = true; } }; req.onupgradeneeded(); if (abortada) return req.onerror(); }
      req.result = { close() {}, objectStoreNames: { contains: (n) => n === "cols" },
        transaction: () => ({ objectStore: () => ({ get(k) { const g = {}; setTimeout(() => { g.result = cols[k]; g.onsuccess(); }); return g; } }) }) };
      req.onsuccess();
    });
    return req; } });
  const r2 = await leerTabula(falsa({ groups: [{ id: "g" }], students: [{ id: 1, groupId: "g" }] }), ls({}));
  assert.deepEqual(r2, { groups: [{ id: "g" }], students: [{ id: 1, groupId: "g" }] });
  assert.equal(await leerTabula(falsa(null), ls({})), null, "sin base de Tabula: no se crea");
  console.log("test_ui: enlace con Tabula OK");
}
