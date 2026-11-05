// Charta · fichas doradas (paso 2.5): opciones + semilla → JSON y SVG esperados.
// Uso: node tests/test_doradas.js               (compara con tests/doradas.json)
//      node tests/test_doradas.js --actualizar  (reescribe doradas.json: SOLO si el cambio es intencionado)
// Si falla, una ficha ya guardada (Tabula/Fori) o una «Otra variante» saldría distinta:
// o es un error, o hay que subir la «version» del tipo y actualizar las doradas.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { generar } from "../src/nucleo/ficha.js";
import { listaTipos } from "../src/tipos/index.js";
import { hojas } from "../src/render/hoja.js";
import { contador } from "./comun.js";

const RUTA = new URL("./doradas.json", import.meta.url).pathname;
const ACTUALIZAR = process.argv.includes("--actualizar");
const hash = (s) => createHash("sha256").update(s).digest("hex").slice(0, 16);

/** Casos fijos: uno por tipo (opciones por defecto) + combinaciones, variantes, nombres y B/N. */
const CASOS = [
  ...listaTipos().sort().map((id) => ({ nombre: id, opciones: { actividades: [{ tipo: id }] }, semilla: 1 })),
  { nombre: "dos actividades", semilla: 7, opciones: { actividades: [{ tipo: "sumar.h20", params: { nivel: "con" } }, { tipo: "restar.recta", params: { rango: 20 } }] } },
  { nombre: "mismo color corregido", semilla: 3, opciones: { actividades: [{ tipo: "orden.signos", color: "rosa" }, { tipo: "conteo.serie1", color: "rosa" }] } },
  { nombre: "variantes y título", semilla: 42, opciones: { titulo: "Repaso del lunes", variantes: 3, actividades: [{ tipo: "sumar.vertical", params: { nivel: "mezcla", rango: 100 } }, { tipo: "medida.reloj", params: { modo: "media" } }] } },
  { nombre: "nombres y B/N", semilla: 5, nombres: ["Ana", "Luis", "Marta"], bn: true, opciones: { variantes: 2, actividades: [{ tipo: "rep.dado", params: { lectura: true } }, { tipo: "rep.marco", params: { rango: 20 } }] } },
];

function calcular(c) {
  const ficha = generar(c.opciones, c.semilla);
  const svg = (modo) => hojas(ficha, { nombres: c.nombres || [], bn: !!c.bn, modo }).map((h) => hash(h.svg));
  return { ficha, svgPapel: svg("papel"), svgSolucion: svg("solucion") };
}

const actual = Object.fromEntries(CASOS.map((c) => [c.nombre, calcular(c)]));

if (ACTUALIZAR || !existsSync(RUTA)) {
  writeFileSync(RUTA, JSON.stringify(actual, null, 1) + "\n");
  console.log(`test_doradas: ${CASOS.length} fichas doradas escritas en tests/doradas.json`);
} else {
  const guardadas = JSON.parse(readFileSync(RUTA, "utf8"));
  const t = contador();
  for (const c of CASOS) t.prueba(c.nombre, () => {
    const g = guardadas[c.nombre], a = actual[c.nombre];
    assert.ok(g, "no hay dorada: ejecuta con --actualizar");
    assert.deepEqual(a.ficha, g.ficha, "el JSON de la ficha ha cambiado");
    assert.deepEqual(a.svgPapel, g.svgPapel, "el dibujo (papel) ha cambiado");
    assert.deepEqual(a.svgSolucion, g.svgSolucion, "el dibujo (solución) ha cambiado");
  });
  const sobran = Object.keys(guardadas).filter((k) => !actual[k]);
  if (sobran.length) { console.error("Doradas sin caso:", sobran.join(", ")); process.exitCode = 1; }
  console.log(`test_doradas: ${t.n}/${CASOS.length} fichas iguales a las doradas`);
}
