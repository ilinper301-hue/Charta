// Charta · fase 7 (R5) · copia de seguridad: exportar, leer y cargar favoritas, recientes y ajustes.  Uso: node tests/test_copia.js
import assert from "node:assert/strict";
import { crearGuardadas, limpiar, MAX_FAVORITOS, MAX_RECIENTES } from "../src/ui/guardadas.js";
import { crearBorrador } from "../src/ui/borrador.js";
import { crearCopia, leerCopia, aplicarCopia, opcionesDeComp, nombreArchivo, AJUSTES, MAX_COPIA } from "../src/ui/copia.js";
import { hayTipo } from "../src/nucleo/tipos.js";
import { generar } from "../src/nucleo/ficha.js";
import { erroresFicha } from "../src/nucleo/lector.js";
import "../src/tipos/index.js";
import { contador } from "./comun.js";

const c = contador(), prueba = c.prueba;
const almacen = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), claves: () => [...m.keys()] }; };
const comp = (tipo, semilla, extra = {}) => ({ actividades: [{ tipo, params: {} }], semilla, titulo: "", variaciones: "iguales", bn: false, ...extra });
const AHORA = new Date("2026-11-12T10:00:00Z");

function datos() {
  const a = almacen(), g = crearGuardadas(a);
  g.alternarFavorito(comp("sumar.h20", 1), "Sumas");
  g.alternarFavorito(comp("restar.recta", 2, { paginas: undefined }), "Restas en la recta");
  g.anotarReciente(comp("rep.recta", 3, { bn: true }), "Recta");
  a.setItem("charta:tema", "oscuro"); a.setItem("charta:bnDefecto", "1"); a.setItem("charta:fuente", "fredoka");
  a.setItem("charta:letras", "aeiomps"); a.setItem("charta:misFrases", "Mi mamá me mima.\nMamá me ama.");
  // cosas que NO deben salir
  a.setItem("charta:nube", "1"); a.setItem("charta:aFori", "{\"v\":1}"); a.setItem("charta:usos", "{}");
  crearBorrador(a).guardar(comp("sumar.h20", 9), { alumnos: "Ana Pérez\nLuis Gómez", copias: 2 });
  return { a, g };
}

prueba("crearCopia: favoritas, recientes y ajustes; nada de nombres, borrador ni claves de otras apps", () => {
  const { a, g } = datos(), copia = crearCopia(a, g, AHORA), t = JSON.stringify(copia);
  assert.equal(copia.v, 1); assert.equal(copia.app, "charta"); assert.equal(copia.tipo, "copia");
  assert.equal(copia.favoritos.length, 2); assert.equal(copia.recientes.length, 1);
  assert.deepEqual(Object.keys(copia.ajustes).sort(), ["charta:bnDefecto", "charta:fuente", "charta:letras", "charta:misFrases", "charta:tema"]);
  assert.ok(!/Ana|Luis|alumnos|borrador|aFori|usos|nube/.test(t), "sin nombres de alumnos, borrador ni otras claves");
  assert.equal(nombreArchivo(AHORA), "charta-copia-2026-11-12.json");
});
prueba("crearCopia: una favorita antigua con campos de más sale limpia (sin alumnos)", () => {
  const a = almacen(), g = crearGuardadas(a);
  a.setItem("charta:favoritos", JSON.stringify([{ ...limpiar(comp("sumar.h20", 4)), nombre: "Vieja", fecha: "2026-10-01", alumnos: "Ana, Luis", nombres: ["Ana"] }]));
  const t = JSON.stringify(crearCopia(a, g, AHORA));
  assert.ok(!/Ana|Luis|alumnos|nombres/.test(t));
});
prueba("ida y vuelta: copia → archivo → otro dispositivo vacío", () => {
  const { a, g } = datos(), texto = JSON.stringify(crearCopia(a, g, AHORA));
  const b = almacen(), gb = crearGuardadas(b), r = aplicarCopia(leerCopia(texto), b, gb, { hayTipo });
  assert.deepEqual([r.favoritos, r.recientes, r.descartadas, r.ajustes], [2, 1, 0, 5]);
  assert.deepEqual(gb.favoritos(), g.favoritos()); assert.deepEqual(gb.recientes(), g.recientes());
  assert.equal(b.getItem("charta:tema"), "oscuro"); assert.equal(b.getItem("charta:misFrases"), "Mi mamá me mima.\nMamá me ama.");
  assert.equal(b.getItem("charta:borrador"), null, "el borrador no viaja");
  assert.equal(gb.esFavorito(comp("sumar.h20", 1)), true, "se reconoce como favorita (misma semilla)");
});
prueba("cargar suma sin repetir, sin borrar y sin pisar los ajustes que ya hay", () => {
  const { a, g } = datos(), copia = leerCopia(JSON.stringify(crearCopia(a, g, AHORA)));
  const b = almacen(), gb = crearGuardadas(b);
  gb.alternarFavorito(comp("sumar.h20", 1), "Mi propia"); gb.alternarFavorito(comp("juegos.une", 7), "Otra mía"); b.setItem("charta:tema", "claro");
  const r = aplicarCopia(copia, b, gb, { hayTipo });
  assert.equal(r.favoritos, 1, "la de sumar.h20/1 ya estaba");
  assert.equal(gb.favoritos().length, 3); assert.equal(gb.favoritos()[0].nombre, "Otra mía", "las actuales van primero");
  assert.equal(b.getItem("charta:tema"), "claro", "el ajuste actual manda"); assert.equal(b.getItem("charta:fuente"), "fredoka", "los que faltan se rellenan");
  const r2 = aplicarCopia(copia, b, gb, { hayTipo });
  assert.deepEqual([r2.favoritos, r2.recientes], [0, 0], "cargarla dos veces no duplica");
});
prueba("reemplazar: parte de cero y pisa los ajustes", () => {
  const { a, g } = datos(), copia = leerCopia(JSON.stringify(crearCopia(a, g, AHORA)));
  const b = almacen(), gb = crearGuardadas(b);
  gb.alternarFavorito(comp("juegos.une", 7), "Otra mía"); b.setItem("charta:tema", "claro");
  aplicarCopia(copia, b, gb, { hayTipo, reemplazar: true });
  assert.equal(gb.favoritos().length, 2); assert.ok(!gb.favoritos().some((f) => f.nombre === "Otra mía")); assert.equal(b.getItem("charta:tema"), "oscuro");
});
prueba("máximos: no pasa de 30 favoritas ni 8 recientes", () => {
  const favoritos = Array.from({ length: 50 }, (_, i) => ({ ...limpiar(comp("sumar.h20", i + 1)), nombre: "F" + i }));
  const recientes = Array.from({ length: 20 }, (_, i) => ({ ...limpiar(comp("sumar.h20", 100 + i, { titulo: "T" + i })), nombre: "R" + i }));
  const b = almacen(), gb = crearGuardadas(b), r = aplicarCopia({ favoritos, recientes, ajustes: {} }, b, gb, { hayTipo });
  assert.equal(gb.favoritos().length, MAX_FAVORITOS); assert.equal(gb.recientes().length, MAX_RECIENTES);
  assert.equal(r.favoritos, MAX_FAVORITOS);
});
prueba("fichas rotas, de modelos que ya no existen o con nombres colados: se descartan o se limpian", () => {
  const buena = { ...limpiar(comp("sumar.h20", 1)), nombre: "x".repeat(300), fecha: "ayer", alumnos: "Ana", nombres: ["Luis"] };
  const copia = { favoritos: [buena, { actividades: [{ tipo: "no.existe" }] }, null, 7, "texto", { actividades: [] }, { actividades: [{ tipo: "sumar.h20" }, { tipo: "sumar.h20" }, { tipo: "sumar.h20" }] }], recientes: [], ajustes: {} };
  const b = almacen(), gb = crearGuardadas(b), r = aplicarCopia(copia, b, gb, { hayTipo });
  assert.equal(r.favoritos, 1); assert.equal(r.descartadas, 6);
  const f = gb.favoritos()[0];
  assert.equal(f.nombre.length, 100); assert.match(f.fecha, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(!/Ana|Luis|alumnos|nombres/.test(JSON.stringify(f)));
});
prueba("leerCopia: archivos que no son una copia o vienen de otra versión", () => {
  const e = (t, re) => assert.throws(() => leerCopia(t), re);
  e("esto no es json", /no se puede leer/); e("[]", /no es una copia/); e(JSON.stringify({ app: "tabula", tipo: "copia", v: 1 }), /no es una copia/);
  e(JSON.stringify({ app: "charta", tipo: "ficha", v: 1 }), /no es una copia/); e(JSON.stringify({ app: "charta", tipo: "copia", v: 2 }), /más nueva/);
  e("x".repeat(MAX_COPIA + 1), /demasiado grande/); e(null, /demasiado grande/);
  const vacia = leerCopia(JSON.stringify({ app: "charta", tipo: "copia", v: 1 }));
  assert.deepEqual([vacia.favoritos, vacia.recientes, vacia.ajustes], [[], [], {}]);
});
prueba("ajustes: solo los permitidos y con valores válidos", () => {
  const malos = { "charta:tema": "rojo", "charta:fuente": "../../x", "charta:bnDefecto": "si", "charta:letras": "aeiou123", "charta:letrasObligatorias": "a".repeat(40),
    "charta:misFrases": "x".repeat(7000), "charta:nube": "1", "charta:borrador": "{}", "charta:aFori": "{}", "__proto__": "x", "otra": "1" };
  assert.deepEqual(leerCopia(JSON.stringify({ app: "charta", tipo: "copia", v: 1, ajustes: malos })).ajustes, {});
  const buenos = { "charta:tema": "claro", "charta:fuente": "andika", "charta:bnDefecto": "0", "charta:letras": "aeiouñ", "charta:letrasObligatorias": "", "charta:misFrases": "Hola mamá." };
  assert.deepEqual(leerCopia(JSON.stringify({ app: "charta", tipo: "copia", v: 1, ajustes: buenos })).ajustes, buenos);
  assert.equal(Object.keys(AJUSTES).length, 6);
});
prueba("opcionesDeComp: cada favorita genera una ficha válida (subir a la nube)", () => {
  const frases = ["Mi mamá me mima.", "Mamá me ama."];
  for (const cp of [comp("sumar.h20", 5), comp("rep.recta", 6, { bn: true, grande: true }), { ...comp("escritura.frase", 8), misFrases: frases, fuente: "fredoka" },
    { actividades: [{ tipo: "sumar.h20", params: {} }, { tipo: "restar.recta", params: {} }, { tipo: "rep.recta", params: {} }], paginas: [2, 1], semilla: 3, titulo: "Repaso" }]) {
    const o = opcionesDeComp(limpiar(cp), hayTipo), f = generar(o.opciones, o.semilla);
    assert.deepEqual(erroresFicha(f), []); assert.equal(f.semilla, o.semilla);
    if (cp.titulo) assert.equal(f.titulo, cp.titulo);
    if (cp.fuente) assert.equal(f.presentacion.fuente, "fredoka");
  }
  assert.equal(opcionesDeComp({ actividades: [{ tipo: "no.existe" }] }, hayTipo), null); assert.equal(opcionesDeComp(null), null);
});

console.log(`test_copia: ${c.n} pruebas ${process.exitCode ? "CON ERRORES" : "OK"}`);
