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
  // Matemáticas 2.º · lote 2 (tres cifras)
  { nombre: "2.º sumas en vertical", semilla: 8, opciones: { actividades: [{ tipo: "sumar.vertical", params: { rango: 999, nivel: "ud", sumandos: 3 } }] } },
  { nombre: "2.º restas con prueba", semilla: 8, opciones: { actividades: [{ tipo: "restar.vertical", params: { rango: 999, nivel: "con", prueba: true } }] } },
  { nombre: "2.º descomposición y canjes", semilla: 8, opciones: { actividades: [{ tipo: "valor.descdu", params: { rango: 999, modo: "suma" } }, { tipo: "valor.canje", params: { rango: 500 } }] } },
  { nombre: "2.º recta de 10 en 10 y de 100 en 100", semilla: 8, opciones: { actividades: [{ tipo: "sumar.recta", params: { rango: 999 } }, { tipo: "restar.recta", params: { rango: 999, salto: 100 } }] } },
  { nombre: "2.º encadenadas", semilla: 8, opciones: { actividades: [{ tipo: "sumar.encadenadas", params: { rango: 999, sumandos: 4 } }, { tipo: "restar.encadenadas", params: { rango: 999, salto: 100 } }] } },
  { nombre: "2.º dobles y mitades", semilla: 8, opciones: { actividades: [{ tipo: "sumar.dobles", params: { rango: 100, operacion: "mezcla" } }] } },
  { nombre: "2.º agrupa en centenas", semilla: 8, opciones: { actividades: [{ tipo: "valor.agrupa", params: { rango: 300 } }] } },
  { nombre: "2.º decenas y cifra", semilla: 8, opciones: { actividades: [{ tipo: "sumar.decenas", params: { rango: 999 } }, { tipo: "valor.cifra", params: { rango: 999 } }] } },
  // Matemáticas 2.º · lote 3 (medida)
  { nombre: "2.º reloj con cuartos", semilla: 8, opciones: { actividades: [{ tipo: "medida.reloj", curso: 2, params: { modo: "todas" } }, { tipo: "medida.reloj2", curso: 2, params: { modo: "cuarto" } }] } },
  { nombre: "2.º medidas del tiempo", semilla: 8, opciones: { actividades: [{ tipo: "medida.tiempo", curso: 2, params: { modo: "equivalencias" } }, { tipo: "medida.tiempo", curso: 2, params: { modo: "horas" } }] } },
  { nombre: "2.º dinero y compras", semilla: 8, opciones: { actividades: [{ tipo: "medida.dinero", params: { rango: 300 } }, { tipo: "medida.precios", params: { rango: 100, modo: "cambio" } }] } },
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
