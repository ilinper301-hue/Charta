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
    assert.ok([1, 2, 3].includes(x.dificultad), `${x.id}: dificultad`);
    assert.ok(Number.isInteger(x.minutos) && x.minutos >= 5 && x.minutos <= 30, `${x.id}: minutos`);
    assert.ok(Array.isArray(x.etiquetas) && x.etiquetas.length >= 2 && x.etiquetas.every((t) => t === t.trim().toLowerCase()), `${x.id}: etiquetas`);
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

// Fase 6 · metadatos propios de la ficha (dificultad = la mayor, minutos = suma, etiquetas sin repetir)
import { metadatosDe } from "../src/nucleo/ficha.js";
{
  const uno = metadatosDe(["sumar.h10"]), dos = metadatosDe(["sumar.h10", "sumar.vertical"]);
  assert.deepEqual(uno, { dificultad: 1, minutos: 10, etiquetas: ["sumar", "hasta 10", "cálculo"] });
  assert.equal(dos.dificultad, 3);
  assert.equal(dos.minutos, 5 + 8);
  assert.equal(new Set(dos.etiquetas).size, dos.etiquetas.length);
  const f = generar({ actividades: [{ tipo: "sumar.h10" }], metadatos: uno }, 1);
  assert.deepEqual(f.metadatos, uno);
  console.log("test_ui: metadatos OK");
}

// Fase 6 · letra grande y lectura fácil: se dibujan todos los modelos, la cabecera crece y los enunciados caben.
import { hoja, estiloLectura } from "../src/render/hoja.js";
{
  let n = 0;
  for (const m of CATALOGO.modelos) {
    const f = generar({ actividades: [{ tipo: m.id }], presentacion: { lecturaFacil: true } }, 5);
    const el = estiloLectura(f); assert.equal(el.grande, false); assert.equal(el.facil, true); assert.equal(el.fuente.id, "andika");
    const normal = hoja(f.paginas[0], { titulo: f.titulo });
    for (const est of [{ grande: true }, { facil: true }]) {
      const g = hoja(f.paginas[0], { titulo: f.titulo, ...est });
      assert.ok(g.startsWith("<svg") && !/NaN|undefined/.test(g), `${m.id}: hoja grande`);
      assert.notEqual(g, normal, `${m.id}: la letra grande cambia la hoja`);
    }
    n++;
  }
  const f = generar({ actividades: [{ tipo: "sumar.h20" }, { tipo: "restar.r20" }], presentacion: { letraGrande: true } }, 2);
  assert.ok(hoja(f.paginas[0], { titulo: f.titulo, ...estiloLectura(f) }).includes("font-size"));
  console.log(`test_ui: letra grande y lectura fácil OK (${n} modelos)`);
}

// Letra de las fichas: Andika, Fredoka y las subidas por la maestra
import { fuentePorId, fuenteDe, registrarFuenteUsuario, quitarFuenteUsuario, nombreFuente, todasLasFuentes } from "../src/render/fuentes.js";
import { validarArchivo, cssFuente, MAX_BYTES, MAX_FUENTES } from "../src/ui/fuentes.js";
import { crearGuardadas as crearG, limpiar as limp } from "../src/ui/guardadas.js";
{
  // nombres y validación de archivos
  assert.equal(nombreFuente("Mi_Letra-Bonita (1).ttf"), "Mi Letra-Bonita 1");
  assert.equal(nombreFuente("###.ttf"), "Mi letra");
  assert.equal(validarArchivo({ name: "a.ttf", size: 1000 }).formato, "truetype");
  assert.equal(validarArchivo({ name: "a.woff2", size: 1000 }).mime, "font/woff2");
  assert.equal(validarArchivo({ name: "a.pdf", size: 1000 }).ok, false);
  assert.equal(validarArchivo({ name: "a.ttf", size: MAX_BYTES + 1 }).ok, false);
  assert.equal(validarArchivo({ name: "a.ttf", size: 0 }).ok, false);
  const llenas = Array.from({ length: MAX_FUENTES }, (_, i) => "L" + i);
  assert.equal(validarArchivo({ name: "nueva.ttf", size: 10 }, llenas).ok, false);
  assert.equal(validarArchivo({ name: "L1.ttf", size: 10 }, llenas).ok, true, "reemplazar una existente sí se puede");
  assert.ok(cssFuente({ nombre: "X", formato: "woff", mime: "font/woff", b64: "AAAA" }).includes('font-family:"X"'));

  // Fredoka y letra de usuario en las fichas: todos los modelos se dibujan y la ficha solo guarda el id
  assert.equal(fuentePorId("fredoka").nombre, "Fredoka");
  assert.equal(fuentePorId("usuario:No existe").id, "andika", "letra desconocida → Andika");
  const f1 = fuentePorId("fredoka"), a1 = fuentePorId("andika");
  assert.ok(f1.ancho("Hola", false, 20) > 0 && Math.abs(f1.ancho("Hola", true, 20) / f1.ancho("Hola", false, 20) - 1) < 0.1);   // la negrita de Fredoka casi no cambia el ancho
  assert.notEqual(f1.ancho("Lengua", false, 20), a1.ancho("Lengua", false, 20));
  registrarFuenteUsuario("Mi letra");
  assert.equal(fuentePorId("usuario:Mi letra").usuario, true);
  let n = 0;
  for (const m of CATALOGO.modelos) {
    const por = (fuente) => generar({ actividades: [{ tipo: m.id }], presentacion: fuente ? { fuente } : {} }, 3);
    const fr = por("fredoka"), us = por("usuario:Mi letra"), base = por();
    assert.equal(base.presentacion.fuente, undefined);
    assert.equal(fr.presentacion.fuente, "fredoka"); assert.equal(fuenteDe(fr).id, "fredoka");
    const sFr = hojas(fr)[0].svg, sUs = hojas(us)[0].svg, sBase = hojas(base)[0].svg;
    assert.ok(sFr.includes("Fredoka") && !sFr.includes("Andika, Poppins"), `${m.id}: Fredoka en el SVG`);
    assert.ok(sUs.includes("&quot;Mi letra&quot;") && !/NaN|undefined/.test(sUs), `${m.id}: letra subida`);
    assert.ok(sBase.includes("Andika, Poppins") && !sBase.includes("Fredoka"), `${m.id}: Andika por defecto`);
    n++;
  }
  quitarFuenteUsuario("Mi letra");
  assert.equal(todasLasFuentes().some((f) => f.usuario), false);

  // favoritas: la letra se guarda como nombre; las guardadas antes (sin campos nuevos) se siguen reconociendo
  assert.equal(limp({ actividades: [], fuente: "andika" }).fuente, undefined);
  assert.equal(limp({ actividades: [], fuente: "fredoka" }).fuente, "fredoka");
  const mem = new Map(), alm = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
  mem.set("charta:favoritos", JSON.stringify([{ actividades: [{ tipo: "sumar.h20", params: {} }], semilla: 4, titulo: "", variaciones: "iguales", bn: false, nombre: "x", fecha: "2026-11-01" }]));
  assert.equal(crearG(alm).esFavorito({ actividades: [{ tipo: "sumar.h20", params: {} }], semilla: 4, titulo: "", variaciones: "iguales", bn: false, grande: false, facil: false, fuente: "andika" }), true);
  console.log(`test_ui: letras (Andika, Fredoka, subida) OK en ${n} modelos`);
}
