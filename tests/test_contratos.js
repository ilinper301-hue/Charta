// Charta · fase 7 (R7) · contratos con Tabula y Fori.  Uso: node tests/test_contratos.js [--tabula=DIR] [--fori=DIR] [--exigir]
// 1) API pública `globalThis.Charta` (src/api.js): forma fijada.   2) Con el repositorio de Tabula: su lector de composiciones, sus
// enlaces y su iframe usan lo que Charta da y entienden lo que Charta envía.   3) Con el de Fori: la clave, los pasos y la
// validación de `charta:aFori`.   4) `firestore.rules` igual que el de Tabula.
// Los repositorios se buscan en --tabula/--fori, en CHARTA_TABULA/CHARTA_FORI, junto a este (../tabula, ../Fori) y en
// ../../ilinper301-hue/. Si no están, esas partes se omiten (con --exigir, falla). Se clonan con:
//   git clone --depth 1 https://github.com/ilinper301-hue/tabula ../tabula && git clone --depth 1 https://github.com/ilinper301-hue/Fori ../Fori
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { API, CONTRATO } from "../src/api.js";
import { limpiar } from "../src/ui/guardadas.js";
import { urlVolver, leerEntrada, b64url, MAX_ENLACE } from "../src/ui/tabula.js";
import { dejarParaTabula } from "../src/ui/miniatura_ficha.js";
import { URL_FORI, URL_TABULA } from "../src/rutas.js";
import { paqueteFori, CLAVE_FORI, cssPasos } from "../src/fori/diapositivas.js";
import { hayTipo } from "../src/nucleo/tipos.js";
import { opcionesDeComp } from "../src/ui/copia.js";
import { contador } from "./comun.js";

const AQUI = path.dirname(fileURLToPath(import.meta.url)), RAIZ = path.join(AQUI, "..");
const arg = (n) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split("=")[1];
const EXIGIR = process.argv.includes("--exigir");
const buscar = (nombre, ...cands) => cands.filter(Boolean).map((d) => path.resolve(d)).find((d) => fs.existsSync(path.join(d, nombre.sub)));
const TABULA = buscar({ sub: "js/charta.js" }, arg("tabula"), process.env.CHARTA_TABULA, path.join(RAIZ, "../tabula"), path.join(RAIZ, "../ilinper301-hue/tabula"), path.join(RAIZ, "../../ilinper301-hue/tabula"));
const FORI = buscar({ sub: "src/js/05f-charta.js" }, arg("fori"), process.env.CHARTA_FORI, path.join(RAIZ, "../Fori"), path.join(RAIZ, "../fori"), path.join(RAIZ, "../ilinper301-hue/fori"), path.join(RAIZ, "../../ilinper301-hue/fori"));

const c = contador(), prueba = c.prueba;
let omitidas = 0;
const omitir = (que) => { omitidas++; console.log(`  omitido: ${que} (no está el repositorio; clónalo junto a Charta o usa --tabula/--fori)`); if (EXIGIR) { console.error("FALLA: falta " + que); process.exitCode = 1; } };

// Composiciones como las guarda Charta (limpiar): varias formas, para que Tabula las lea todas.
const FRASES = ["Mi mamá me mima.", "Mamá me ama."];
const COMPS = [
  { nombre: "una actividad", comp: { actividades: [{ tipo: "sumar.h20", params: {} }], semilla: 12, titulo: "Sumas", variaciones: "iguales", bn: false } },
  { nombre: "dos páginas, B/N, letra grande", comp: { actividades: [{ tipo: "sumar.h20", params: {} }, { tipo: "restar.recta", params: {} }, { tipo: "rep.recta", params: {} }], paginas: [2, 1], semilla: 5, titulo: "Repaso", variaciones: "distintas", bn: true, grande: true } },
  { nombre: "Lengua con «Mis frases» (una vez) y Fredoka", comp: { actividades: [{ tipo: "escritura.frase", params: {} }, { tipo: "palabra.dibuja", params: {} }], misFrases: FRASES, semilla: 9, titulo: "Letra m", variaciones: "iguales", bn: false, fuente: "fredoka" } },
];

// ---------- 1 · API pública ----------
prueba("API: forma fijada (contrato 1)", () => {
  assert.equal(CONTRATO, 1); assert.equal(API.contrato, 1);
  for (const k of ["generar", "hojas", "modelo", "erroresFicha", "listaTipos"]) assert.equal(typeof API[k], "function", k);
  assert.ok(Array.isArray(API.CATALOGO.modelos) && API.CATALOGO.modelos.length >= 100);
  assert.ok(API.listaTipos().every((id) => typeof id === "string") && API.listaTipos().includes("sumar.h20"));
  assert.equal(API.modelo("sumar.h20").id, "sumar.h20");
});
prueba("API: generar(opciones, semilla) → ficha del esquema; hojas(ficha, opciones) → [{svg, nombre, variante, pagina, total}]", () => {
  const f = API.generar({ actividades: [{ tipo: "sumar.h20" }] }, 5);
  assert.deepEqual(API.erroresFicha(f), []);
  assert.equal(f.schemaVersion, 1); assert.equal(f.app, "charta"); assert.equal(f.semilla, 5); assert.ok(Array.isArray(f.paginas));
  assert.equal(JSON.stringify(API.generar({ actividades: [{ tipo: "sumar.h20" }] }, 5)), JSON.stringify(f), "mismas opciones + semilla = misma ficha");
  const hs = API.hojas(f, { copias: 1, bn: true });
  assert.equal(hs.length, f.paginas.length);
  for (const h of hs) { assert.match(h.svg, /^<svg[\s>]/); for (const k of ["nombre", "variante", "pagina", "total"]) assert.ok(k in h, k); }
  assert.equal(API.hojas(f).length, 1, "sin opciones: una copia");
  assert.equal(API.hojas(f, { nombres: ["Ana", "Luis"] }).length, 2, "una hoja por alumno");
  assert.ok(!JSON.stringify(f).includes("Ana"), "la ficha no lleva nombres");
});
prueba("API: la ficha de 2 variantes se lee entera (variantesDatos)", () => {
  const f = API.generar({ actividades: [{ tipo: "sumar.h20" }], variantes: 2 }, 5);
  assert.deepEqual(API.erroresFicha(f), []); assert.equal(f.variantesDatos.length, 1);
});

// ---------- 2 · Tabula ----------
console.log(TABULA ? `Tabula: ${TABULA}` : "Tabula: no encontrada");
if (!TABULA) omitir("tabula"); else {
  const T = (f) => import(pathToFileURL(path.join(TABULA, "js", f)).href);
  const [{ chartaOpciones }, TC, HOJ] = [await T("combine-model.js"), await T("charta.js"), fs.readFileSync(path.join(TABULA, "js/charta-hojas.js"), "utf8")];
  for (const { nombre, comp } of COMPS) {
    prueba(`Tabula lee y dibuja: ${nombre}`, () => {
      const l = limpiar(comp);   // el formato que Charta envía (sin nombres)
      const o = chartaOpciones(l);
      assert.ok(o, "Tabula entiende la composición");
      assert.deepEqual(opcionesDeComp(l, hayTipo), o, "Charta (subir favoritas) lee la composición igual que Tabula");
      const ficha = API.generar(o.opciones, o.semilla);
      assert.deepEqual(API.erroresFicha(ficha), []);
      const hs = API.hojas(ficha, { copias: 1, bn: o.bn });
      assert.equal(hs.length, (l.paginas || [1]).length);
      assert.ok(hs.every((h) => /^<svg/.test(h.svg)));
      if (l.fuente) assert.equal(ficha.presentacion.fuente, l.fuente, "la letra llega a la ficha");
    });
    prueba(`Tabula recibe el enlace de Charta: ${nombre}`, () => {
      const url = urlVolver({ titulo: comp.titulo, tipos: comp.actividades.map((a) => a.tipo), comp: limpiar(comp), variantes: 2, minutos: 20, dificultad: 2, etiquetas: ["suma"], grupo: "g1", sesion: "s1" });
      assert.ok(url.startsWith(URL_TABULA + "?charta="));
      const p = TC.leerEntradaCharta(url.slice(url.indexOf("?")));
      assert.ok(p, "leerEntradaCharta acepta el enlace");
      const d = TC.documentoDeCharta(p);
      assert.equal(d.tipo, "charta"); assert.equal(d.groupId, "g1"); assert.deepEqual(d.charta.comp, limpiar(comp));
      assert.ok(chartaOpciones(d.charta.comp), "y la composición del documento se dibuja");
    });
  }
  prueba("Tabula recibe el enlace largo: compLocal + charta:aTabula", () => {
    const comp = limpiar(COMPS[2].comp), almacen = new Map(), ls = { setItem: (k, v) => almacen.set(k, v), getItem: (k) => almacen.get(k) ?? null, removeItem: (k) => almacen.delete(k) };
    assert.equal(TC.CLAVE_MINIATURA, "charta:aTabula");
    assert.ok(dejarParaTabula("Letra m", "data:image/jpeg;base64,AAAA", ls, comp));
    const p = TC.leerEntradaCharta("?" + urlVolver({ titulo: "Letra m", tipos: [], compLocal: true }).split("?")[1]);
    assert.ok(p && p.compLocal === true && p.comp == null, "payload compLocal");
    assert.deepEqual(TC.compDeCharta(almacen.get(TC.CLAVE_MINIATURA), "Letra m"), comp, "Tabula recoge la composición");
    assert.equal(TC.compDeCharta(almacen.get(TC.CLAVE_MINIATURA), "Otro título"), null, "comprueba el título");
    assert.ok(MAX_ENLACE <= 8000);
  });
  prueba("Charta recibe los enlaces de Tabula (crear y abrir)", () => {
    const crear = leerEntrada(TC.urlCrearFicha({ groupId: "g1", sesionId: "s1", tareaId: "t1" }).split("?")[1].replace(/^/, "?"), hayTipo);
    assert.deepEqual([crear.desdeTabula, crear.grupo, crear.sesion, crear.tarea], [true, "g1", "s1", "t1"]);
    const comp = limpiar(COMPS[1].comp);
    const abrir = leerEntrada("?" + TC.urlAbrirFicha({ charta: { comp }, groupId: "g2" }).split("?")[1], hayTipo);
    assert.equal(abrir.grupo, "g2"); assert.deepEqual(abrir.comp?.actividades.map((a) => a.tipo), comp.actividades.map((a) => a.tipo));
    assert.equal(b64url("é"), TC.b64urlCodificar("é"), "mismo base64url");
    assert.match(TC.urlAbrirFicha({ charta: { id: "f_1" } }), /\?ficha=f_1&desde=tabula$/);
  });
  prueba("Tabula y Charta apuntan a las mismas rutas", () => {
    assert.equal(TC.CHARTA_URL, "../Charta/"); assert.equal(URL_TABULA, "/tabula/");
    assert.match(HOJ, /\$\{CHARTA_URL\}dist\/index\.html/, "el iframe abre Charta/dist/index.html");
  });
  prueba("Tabula solo usa de `Charta` lo que el contrato da", () => {
    const usado = new Set([...HOJ.matchAll(/\b(?:api|Charta|contentWindow\.Charta)\.(\w+)/g)].map((m) => m[1]));
    assert.ok(usado.size >= 2, "debería usar generar y hojas");
    for (const k of usado) assert.ok(k in API, `Tabula usa Charta.${k}, que ya no existe`);
  });
  prueba("firestore.rules: igual que el de Tabula (salvo comentarios y espacios)", () => {
    const norma = (f) => fs.readFileSync(f, "utf8").replace(/\/\/.*$/gm, "").replace(/\s+/g, " ").trim();
    assert.equal(norma(path.join(RAIZ, "firestore.rules")), norma(path.join(TABULA, "firestore.rules")));
  });
}

// ---------- 3 · Fori ----------
console.log(FORI ? `Fori: ${FORI}` : "Fori: no encontrada");
if (!FORI) omitir("Fori"); else {
  const src = fs.readFileSync(path.join(FORI, "src/js/05f-charta.js"), "utf8");
  const trozo = (re, que) => { const m = re.exec(src); assert.ok(m, `no encuentro ${que} en 05f-charta.js (¿ha cambiado Fori?)`); return m[1]; };
  const fn = (expr) => new Function(`return (${expr})`)();
  prueba("Fori: misma clave, misma ruta y mismo formato", () => {
    assert.equal(trozo(/CH_KEY='([^']+)'/, "CH_KEY"), CLAVE_FORI);
    assert.equal(trozo(/CH_URL='([^']+)'/, "CH_URL"), "../Charta/");
    assert.equal(URL_FORI, "/Fori/");
    assert.match(src, /d\.v===1&&d\.app==='charta'&&Array\.isArray\(d\.diapositivas\)/, "formato del paquete {v:1, app, diapositivas}");
    assert.match(src, /get\('charta'\)!=='1'/, "Charta abre Fori con ?charta=1");
  });
  prueba("Fori: cssPasos de Charta = chCss de Fori", () => {
    const chCss = fn(trozo(/const chCss=([\s\S]*?);\n/, "chCss"));
    for (const [k, n] of [[0, 1], [0, 3], [1, 3], [2, 3], [3, 3], [5, 3], [0, 0]]) assert.equal(cssPasos(k, n), chCss(k, n), `k=${k} n=${n}`);
  });
  prueba("Fori acepta todas las diapositivas de un paquete (chValid) y el marcador /*PASOS*/", () => {
    const chValid = fn(trozo(/const chValid=([\s\S]*?);\nconst chClean/, "chValid"));
    const cajas = (z) => Object.fromEntries([...z.svg.matchAll(/class="ej" data-ej="([^"]*)"/g)].map((m) => [m[1], { x: z.x, y: z.y, w: z.w, h: z.h }]));
    const LETRAS = `@font-face{font-family:"Andika";src:url(data:font/woff;base64,${"A".repeat(34000)})}`;
    const f = API.generar({ paginas: [{ actividades: [{ tipo: "sumar.h20" }, { tipo: "restar.recta" }] }] }, 3);
    const p = paqueteFori(f, { cajas, fuentes: LETRAS });
    assert.ok(p.diapositivas.length > 2);
    for (const d of p.diapositivas) assert.ok(chValid({ svg: d.svg, n: d.n, k: 0 }), `Fori rechaza «${d.etq}»`);
    assert.ok(Math.max(...p.diapositivas.map((d) => d.svg.length)) < 2e6, "cada diapositiva < 2 MB (límite de Fori)");
    const compacto = paqueteFori(f, { cajas, fuentes: LETRAS, max: JSON.stringify(p).length - 1 });
    for (const d of compacto.diapositivas) assert.ok(chValid({ svg: d.svg, n: d.n, k: 0 }), "también el modo compacto");
  });
}

console.log(`test_contratos: ${c.n} pruebas${omitidas ? `, ${omitidas} parte(s) omitida(s)` : ""} ${process.exitCode ? "CON ERRORES" : "OK"}`);
