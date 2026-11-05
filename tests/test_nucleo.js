// Charta · pruebas del núcleo (paso 2.1).  Uso: node tests/test_nucleo.js
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { mulberry32, mezclar, crearAzar } from "../src/nucleo/azar.js";
import { CATALOGO, POR_ID } from "../src/nucleo/catalogo.js";
import { generar, validar, porDefecto, capitalizar, tituloPagina, coloresPagina } from "../src/nucleo/ficha.js";
import { erroresFicha, paginasVariante, letraVariante } from "../src/nucleo/lector.js";
import { listaTipos, tipo } from "../src/tipos/index.js";

let n = 0;
const prueba = (nombre, f) => { try { f(); n++; } catch (e) { console.error("FALLA:", nombre, "\n", e.message); process.exitCode = 1; } };
const raiz = new URL("..", import.meta.url).pathname;

prueba("mulberry32 determinista y en [0,1)", () => {
  const a = mulberry32(42), b = mulberry32(42), xs = Array.from({ length: 1000 }, a);
  assert.deepEqual(xs, Array.from({ length: 1000 }, b));
  assert.ok(xs.every((x) => x >= 0 && x < 1));
  assert.notEqual(mulberry32(1)(), mulberry32(2)());
  assert.equal(mulberry32(1)(), 0.6270739405881613);   // valor fijo: si cambia, cambian todas las fichas
});

prueba("mezclar y azar", () => {
  assert.equal(mezclar(1, 2), mezclar(1, 2));
  assert.notEqual(mezclar(1, 2), mezclar(2, 1));
  const z = crearAzar(7);
  for (let i = 0; i < 2000; i++) { const v = z.entero(3, 5); assert.ok(v >= 3 && v <= 5 && Number.isInteger(v)); }
  const l = [1, 2, 3, 4, 5, 6]; assert.deepEqual(z.barajar(l).sort(), l);
  assert.equal(new Set(z.muestra(l, 4)).size, 4);
});

prueba("catálogo generado desde modelos.py", () => {
  assert.equal(CATALOGO.modelos.length, 94);
  for (const m of CATALOGO.modelos) {
    assert.ok(["amarillo", "rosa", "azul", "verde"].includes(m.color), m.id);
    assert.ok(m.titulo, m.id);
  }
  // los 8 tipos de 2.3 existen en el catálogo
  for (const id of ["rep.dado", "rep.marco", "conteo.serie1", "orden.signos", "sumar.h20", "sumar.vertical", "restar.recta", "medida.reloj"])
    assert.ok(POR_ID[id], id);
});

prueba("validar (igual que modelos.validar)", () => {
  assert.deepEqual(porDefecto("sumar.h20"), { nivel: null, rango: 20 });
  assert.deepEqual(validar("sumar.h20", { nivel: "con" }), { nivel: "con", rango: 20 });
  assert.throws(() => validar("sumar.h20", { nivel: "x" }), /no válido/);
  assert.throws(() => validar("sumar.h20", { rango: 10 }), /rango/);
  assert.throws(() => validar("sumar.h20", { foo: 1 }), /desconocida/);
  assert.throws(() => validar("conteo.camino", {}, "media"), /tamaño/);
  assert.throws(() => validar("nada.nada"), /desconocido/);
});

prueba("títulos y colores como el motor", () => {
  assert.equal(capitalizar("SUMAS HASTA 20"), "Sumas hasta 20");
  assert.equal(capitalizar("¿QUÉ NÚMERO ES?"), "¿Qué número es?");
  const p = { nivel: null, rango: 20 };
  assert.equal(tituloPagina([{ tipo: "sumar.h20", params: p }, { tipo: "restar.recta", params: { rango: 20 } }]),
    "Sumas hasta 20 y " + capitalizar(POR_ID["restar.recta"].titulo)[0].toLowerCase() + capitalizar(POR_ID["restar.recta"].titulo).slice(1));
  assert.deepEqual(coloresPagina([{ tipo: "sumar.h20" }, { tipo: "sumar.h20" }]), ["azul", "verde"]);
  assert.deepEqual(coloresPagina([{ tipo: "sumar.h20", color: "rosa" }, { tipo: "sumar.h20", color: "rosa" }]), ["rosa", "rosa"]);
});

prueba("registro de tipos", () => {
  assert.ok(listaTipos().includes("sumar.h20"));
  for (const id of listaTipos()) assert.ok(POR_ID[id], `tipo sin modelo en el catálogo: ${id}`);
  assert.equal(tipo("nada"), null);
});

prueba("generar: esquema, reproducible y aritmética", () => {
  for (const nivel of [null, "con", "mezcla"]) for (let s = 1; s <= 30; s++) {
    const op = { actividades: [{ tipo: "sumar.h20", params: { nivel } }] };
    const f = generar(op, s);
    assert.deepEqual(erroresFicha(f), []);
    assert.deepEqual(f, generar(op, s), "misma semilla, misma ficha");
    const a = f.paginas[0].actividades[0];
    assert.equal(a.tamano, "completa"); assert.equal(a.ejercicios.length, 24); assert.equal(a.color, "azul");
    assert.equal(new Set(a.ejercicios.map((e) => `${e.datos.a}+${e.datos.b}`)).size, 24, "sin repetidos");
    for (const e of a.ejercicios) {
      const { a: x, b: y } = e.datos, r = e.solucion.huecos[0];
      assert.equal(r, x + y); assert.ok(x >= 1 && y >= 1 && r <= 20);
      const lleva = x < 10 && y < 10 && r > 10;
      if (nivel === null) assert.ok(!lleva, `sin llevadas: ${x}+${y}`);
      if (nivel === "con") assert.ok(lleva, `con llevadas: ${x}+${y}`);
    }
  }
  assert.notDeepEqual(generar({ actividades: [{ tipo: "sumar.h20" }] }, 1), generar({ actividades: [{ tipo: "sumar.h20" }] }, 2));
});

prueba("generar: dos actividades, variantes y errores", () => {
  const f = generar({ actividades: [{ tipo: "sumar.h20" }, { tipo: "sumar.h20", params: { nivel: "con" } }], variantes: 3 }, 5);
  assert.deepEqual(erroresFicha(f), []);
  const [a1, a2] = f.paginas[0].actividades;
  assert.equal(a1.tamano, "media"); assert.equal(a1.ejercicios.length, 12);
  assert.deepEqual([a1.n, a2.n, a1.color, a2.color], [1, 2, "azul", "verde"]);
  assert.equal(a2.ejercicios[0].id, "a2e1");
  assert.equal(f.titulo, "Sumas hasta 20");
  assert.equal(f.variantesDatos.length, 2);
  assert.notDeepEqual(paginasVariante(f, 0), paginasVariante(f, 1));
  assert.equal(letraVariante(2), "C");
  assert.ok(!("id" in f) && !("creada" in f) && !("autor" in f), "determinista: sin id ni fecha");
  assert.throws(() => generar({ actividades: [] }), /1 o 2/);
  assert.throws(() => generar({ actividades: [{ tipo: "conteo.camino" }, { tipo: "sumar.h20" }] }), /página completa/);
  assert.throws(() => generar({ actividades: [{ tipo: "rep.dedos" }] }), /aún no está disponible/);
});

prueba("lector detecta fichas mal formadas", () => {
  const f = generar({ actividades: [{ tipo: "sumar.h20" }] }, 1);
  assert.ok(erroresFicha({ ...f, schemaVersion: 9 }).length);
  assert.ok(erroresFicha({ ...f, alumnos: ["Ana"] }).length);
  assert.ok(erroresFicha({ ...f, variantes: 2 }).length);
  assert.ok(erroresFicha(null).length);
});

prueba("build.py: dist/index.html autocontenido y el paquete funciona", () => {
  const js = execFileSync("python3", [raiz + "tools/build.py", "--js"], { encoding: "utf-8" });
  const ctx = {}; vm.createContext(ctx); vm.runInContext(js, ctx);
  const f = ctx.Charta.generar({ actividades: [{ tipo: "sumar.h20", params: { nivel: "mezcla" } }] }, 3);
  assert.deepEqual(JSON.parse(JSON.stringify(f)), generar({ actividades: [{ tipo: "sumar.h20", params: { nivel: "mezcla" } }] }, 3));
  assert.deepEqual([...ctx.Charta.erroresFicha(f)], []);
  execFileSync("python3", [raiz + "tools/build.py"]);
  const html = readFileSync(raiz + "dist/index.html", "utf-8");
  assert.ok(!/src="app\.js"|href="estilos\.css"|^\s*import\s/m.test(html), "quedan referencias externas o import");
  assert.match(html, /<style>/); assert.match(html, /__req\("app\.js"\)/);
});

console.log(process.exitCode ? "Pruebas con errores." : `OK: ${n} pruebas.`);
