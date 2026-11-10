// Charta · invariantes de la familia «lectura» (Lengua 1.º, bloque 7; ver tests/invariantes.js).
// Todo lo que se lee sale del léxico de 1.º (nombres y adjetivos con género y número, verbos en infinitivo o 3.ª persona) más palabras gramaticales (artículos, «en», «por», «qué»…).
// Una frase es válida si todas sus palabras se reconocen, el artículo concuerda con el nombre, el adjetivo con el nombre anterior y el verbo con el sujeto, y no empieza por «I».
import assert from "node:assert/strict";
import { frasePorId } from "../../src/tipos/_frase.js";
import { unicos, cuantos } from "./_ayuda.js";
import { enCaso, PALABRAS } from "./_lengua.js";
import { analiza as analizaFrase } from "./frase.js";
import { LEXICO } from "../../src/lengua/lexico.js";
import { plural, sinTildes, cabeTipo, silabas, tonica } from "../../src/lengua/reglas.js";
import { SECUENCIAS, ADIVINANZAS, TEMAS_SEC, PINTURAS, FORMAS, COLORES_INSTR, MASCOTAS, PRENDAS, COLORES, LUGARES } from "../../src/tipos/_lectura.js";
import { PALABRAS_FLUIDEZ, FRASES_FLUIDEZ } from "../../src/tipos/lectura.fluidez.js";

const N = (tam, c) => (tam === "media" ? c / 2 : c);
const unidades = (m) => m.match(/ch|ll|rr|qu|gu(?=[eéií])|./g);

// ---------------------------------------------------------------- reconocer palabras
/** Palabras gramaticales que no están (todas) en el léxico: artículos, preposiciones, pronombres, interrogativos. */
const FUNCION = new Set("el la los las un una unos unas y o de del al a en con sin por para se su sus lo le les me te no sí qué cómo dónde cuándo que cuando donde si muy mucho mucha muchos muchas ya después antes hoy siempre también todo toda todos todas más menos hacia ella él".split(" "));
/** Tercera persona que el léxico trae mal (tools/lexico.py guarda «dorme», «juga», «cerra»): la forma correcta del verbo. */
const IRREGULAR_V3 = { duerme: "dormir", juega: "jugar", cierra: "cerrar" };
const FORMAS_LEX = new Map();                   // forma sin tildes → [{ cat, g, num, lema }]
const meter = (f, x) => { const k = sinTildes(f); if (!FORMAS_LEX.has(k)) FORMAS_LEX.set(k, []); FORMAS_LEX.get(k).push(x); };
for (const e of LEXICO) {
  if (e.c === "n") { meter(e.p, { cat: "n", g: e.g, num: "s", lema: e.p }); meter(plural(e.p), { cat: "n", g: e.g, num: "p", lema: e.p }); }
  else if (e.c === "a") for (const g of ["m", "f"]) for (const num of ["s", "p"]) { let f = e.p; if (g === "f" && /o$/.test(f)) f = f.slice(0, -1) + "a"; if (num === "p") f = plural(f); meter(f, { cat: "a", g, num, lema: e.p }); }
  else if (e.c === "v") { meter(e.p, { cat: "vi", lema: e.p }); if (e.v3) { meter(e.v3, { cat: "v", num: "s", lema: e.p }); meter(e.v3 + "n", { cat: "v", num: "p", lema: e.p }); } }
  else meter(e.p, { cat: "o", lema: e.p });
}
for (const [f, l] of Object.entries(IRREGULAR_V3)) { assert.ok(PALABRAS.has(l), l); meter(f, { cat: "v", num: "s", lema: l }); meter(f.replace(/e$/, "en"), { cat: "v", num: "p", lema: l }); }
meter("son", { cat: "v", num: "p", lema: "ser" }); meter("están", { cat: "v", num: "p", lema: "estar" });
const ARTICULOS = { el: ["m", "s", false], la: ["f", "s", false], los: ["m", "p", false], las: ["f", "p", false], un: ["m", "s", true], una: ["f", "s", true], unos: ["m", "p", true], unas: ["f", "p", true] };
export const reconoce = (w) => FUNCION.has(w) || FORMAS_LEX.has(sinTildes(w));
const palabrasDe = (t) => t.toLowerCase().match(/[a-záéíóúüñ]+/g) || [];
const formas = (w) => FORMAS_LEX.get(sinTildes(w)) || [];

/** Comprueba una frase (cadena): palabras del léxico, artículo + nombre, adjetivo + nombre, verbo con el sujeto, sin «I» inicial. */
export function analizaTexto(t, q = t) {
  const ws = palabrasDe(t);
  assert.ok(ws.length > 0, `«${q}»: vacía`);
  assert.ok(!/^[iíì]/i.test(t.replace(/^[¿¡]/, "")), `«${q}» empieza por i`);
  for (const w of ws) assert.ok(reconoce(w), `«${q}»: «${w}» no está en el léxico`);
  let ultimo = null;                                         // el último nombre visto: con él concuerda el adjetivo siguiente
  ws.forEach((w, k) => {
    const art = ARTICULOS[w];
    if (art) {
      const sig = formas(ws[k + 1] ?? "").filter((f) => f.cat === "n");
      assert.ok(sig.length, `«${q}»: tras «${w}» no hay un nombre (${ws[k + 1]})`);
      const ok = sig.filter((f) => f.g === art[0] && f.num === art[1]);
      assert.ok(ok.length, `«${q}»: «${w}» no concuerda con «${ws[k + 1]}»`);
      assert.ok(!(art[0] === "f" && art[1] === "s" && /^h?[aá]/.test(ws[k + 1]) && tonica(ws[k + 1]) === 0), `«${q}»: femenino con a/ha tónica (el agua)`);
      ultimo = ok[0];
      return;
    }
    const fs = formas(w);
    if (fs.length && fs.every((f) => f.cat === "n") && !ARTICULOS[ws[k - 1]]) ultimo = fs[0];      // nombre sin artículo («queso», «las orejas»)
    if (fs.length && !FUNCION.has(w) && ws[k - 1] !== "de" && fs.every((f) => f.cat === "a") && ultimo) assert.ok(fs.some((f) => f.num === ultimo.num && f.g === ultimo.g), `«${q}»: el adjetivo «${w}» no concuerda con «${ultimo.lema}»`);
  });
  // sujeto + verbo al principio: «El gato come…», «Por la tarde, el gato corre…», «El huevo se rompe»
  let k = 0;
  if (ws[0] === "por" && ws[1] === "la" && ws.length > 3) k = 3;
  const art = ARTICULOS[ws[k]];
  if (art && !art[2] && ws[k + 1] && !/^(y|e)$/.test(ws[k + 2] ?? "")) {
    let v = k + 2; if (ws[v] === "se") v++;
    const f = formas(ws[v] ?? "");
    if (f.some((x) => x.cat === "v") && !f.some((x) => x.cat === "n" || x.cat === "a")) assert.ok(f.some((x) => x.cat === "v" && x.num === art[1]), `«${q}»: el verbo «${ws[v]}» no concuerda en número con el sujeto «${ws[k]} ${ws[k + 1]}»`);
  }
  return ws;
}

/** Caso de una frase: MAYÚSCULAS, o como se escribe (primera letra mayúscula y el resto en minúscula). */
function ck(t, mayus, q, { inicial = true } = {}) {
  if (mayus) assert.equal(t, t.toUpperCase(), `${q}: «${t}» no está en MAYÚSCULAS`);
  else assert.equal(t, (inicial ? t[0].toUpperCase() : t[0]) + t.slice(1).toLowerCase(), `${q}: «${t}» no está en minúscula`);
}
const sinPunto = (t) => t.replace(/[.¿?]/g, "").trim();
const enTextoComo = (texto, opcion) => { const t = " " + palabrasDe(texto.join(" ")).join(" ") + " ", o = " " + palabrasDe(opcion).join(" ") + " "; return t.includes(o); };
/** Variantes en masculino y femenino de una palabra (negro ≈ negra). */
const variantes = (w) => [w, /a$/.test(w) ? w.slice(0, -1) + "o" : /o$/.test(w) ? w.slice(0, -1) + "a" : w];
/** Palabras distintas entre dos frases (quitando el principio y el final que coinciden). */
function diferencias(a, b) {
  let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++;
  let j = 0; while (j < a.length - i && j < b.length - i && a[a.length - 1 - j] === b[b.length - 1 - j]) j++;
  return Math.max(a.length - i - j, b.length - i - j);
}

// ---------------------------------------------------------------- bancos (se comprueban una vez)
let bancos = false;
function comprobarBancos() {
  if (bancos) return; bancos = true;
  // secuencias
  assert.ok(SECUENCIAS.length >= 30, "menos de 30 secuencias");
  unicos(SECUENCIAS, (s) => s.frases.join("|"), "secuencias repetidas");
  unicos(SECUENCIAS, (s) => s.id, "ids repetidos");
  const porClase = {};
  for (const s of SECUENCIAS) {
    assert.ok(TEMAS_SEC.includes(s.tema), `tema ${s.tema}`);
    assert.ok(s.frases.length === 3 || s.frases.length === 4, `#${s.id}: ${s.frases.length} frases`);
    unicos(s.frases, (f) => f, `#${s.id}: frases repetidas`);
    porClase[s.tema + s.frases.length] = (porClase[s.tema + s.frases.length] || 0) + 1;
    for (const f of s.frases) {
      assert.match(f, /^[A-ZÁÉÍÓÚÑ][^.]*\.$/, `#${s.id}: «${f}» no es «Mayúscula… punto.»`);
      analizaTexto(f, `secuencia #${s.id}: ${f}`);
    }
  }
  for (const t of TEMAS_SEC) for (const l of [3, 4]) assert.ok((porClase[t + l] || 0) >= 4, `faltan secuencias de ${t} con ${l} frases (${porClase[t + l] || 0}): las opciones «${t}» y «${l} frases» no darían para una ficha`);
  // adivinanzas
  assert.ok(ADIVINANZAS.length >= 30, "menos de 30 adivinanzas");
  unicos(ADIVINANZAS, (a) => a.respuesta, "respuestas repetidas en el banco");
  unicos(ADIVINANZAS, (a) => a.texto, "adivinanzas repetidas");
  for (const a of ADIVINANZAS) {
    assert.ok(PALABRAS.has(a.respuesta), `«${a.respuesta}» no está en el léxico`);
    assert.ok([...a.respuesta].length <= 9, `«${a.respuesta}» pasa de 9 letras`);
    assert.ok(!/^[iíì]/i.test(a.respuesta));
    const frases = a.texto.split(/(?<=\.) /);
    assert.ok(frases.length >= 2 && frases.length <= 3 || frases.length === 1, `${a.respuesta}: nº de frases`);
    frases.forEach((f) => { assert.match(f, /^[A-ZÁÉÍÓÚÑ][^.]*\.$/, `${a.respuesta}: «${f}»`); analizaTexto(f, `adivinanza «${a.respuesta}»: ${f}`); });
    const ws = palabrasDe(a.texto), r = sinTildes(a.respuesta);
    assert.ok(!ws.some((w) => sinTildes(w) === r || sinTildes(w) === sinTildes(plural(a.respuesta))), `«${a.respuesta}»: la adivinanza dice la respuesta`);
    assert.ok(a.texto.length <= 100, `«${a.respuesta}»: adivinanza larga (${a.texto.length})`);
  }
}

export default {
  "lectura.texto"(act, tam) {
    comprobarBancos();
    const es = act.ejercicios, p = act.params, nivel = p.nivel ?? 1, mayus = p.caso === "mayus";
    if (tam === "media") assert.equal(nivel, 1, "media página solo con el nivel 1");
    cuantos(es, tam === "media" ? 2 : { 1: 3, 2: 4, 3: 5 }[nivel]);
    const texto = es[0].datos.texto;
    es.forEach((e) => assert.deepEqual(e.datos.texto, texto, "el texto cambia entre ejercicios"));
    assert.equal(texto.length, { 1: 2, 2: 4, 3: 6 }[nivel], "nº de frases del texto");
    texto.forEach((f) => ck(f, mayus, "frase"));
    const bajo = texto.map((f) => f.toLowerCase());
    const normal = bajo.map((f) => f[0].toUpperCase() + f.slice(1));
    normal.forEach((f) => { assert.match(f, /^[A-ZÁÉÍÓÚÑ][^.]*\.$/); analizaTexto(f, f); });
    const palabrasTexto = new Set(bajo.flatMap((f) => palabrasDe(f)));
    // cada categoría una sola vez: dos animales, dos colores del mismo objeto, dos comidas… no salen
    const todo = bajo.join(" ");
    assert.ok(Object.keys(MASCOTAS).filter((m) => new RegExp(`\\b${m}\\b`).test(todo)).length <= 1, "animales distintos en el texto");
    assert.ok(COLORES.every((c) => bajo.every((f) => (f.match(new RegExp(`\\b(${variantes(c).join("|")})\\b`, "g")) || []).length <= 1)), "un color dicho dos veces en la misma frase");
    // preguntas
    const tipos = es.map((e) => e.datos.tipo);
    tipos.forEach((t) => assert.ok(["elegir", "sino", "completar"].includes(t)));
    if (["elegir", "sino", "completar"].includes(p.preguntas)) tipos.forEach((t) => assert.equal(t, p.preguntas));
    else if (es.length >= 3) assert.ok(new Set(tipos).size >= 2, "variadas: todas del mismo tipo");
    const claves = new Set();
    es.forEach((e, i) => {
      const { tipo, fuente } = e.datos, s = e.solucion;
      assert.ok(Number.isInteger(fuente) && fuente >= 0 && fuente < texto.length);
      if (tipo === "elegir") {
        const { pregunta, opciones } = e.datos; assert.deepEqual(s.huecos, []);
        assert.match(pregunta, mayus ? /^¿[A-ZÁÉÍÓÚÑ ]+\?$/ : /^¿[A-ZÁÉÍÓÚÑ][a-záéíóúüñ ]+\?$/, "la pregunta no es «¿…?»"); analizaTexto(pregunta, pregunta);
        ck(pregunta.replace(/^¿/, "").replace(/\?$/, ""), mayus, "pregunta");
        assert.equal(opciones.length, 3); assert.equal(new Set(opciones.map((o) => o.toLowerCase())).size, 3, "opciones repetidas");
        assert.ok(Number.isInteger(s.rodea) && s.rodea >= 0 && s.rodea < 3);
        opciones.forEach((o) => { ck(o, mayus, "opción", { inicial: false }); analizaTexto(o.toLowerCase(), o); });
        // la correcta sale en la frase de la que sale la respuesta; las otras no están en ningún sitio del texto (ni en masculino ni en femenino)
        assert.ok(enTextoComo([bajo[fuente]], opciones[s.rodea].toLowerCase()), `«${pregunta}»: la respuesta «${opciones[s.rodea]}» no está en la frase ${fuente}`);
        opciones.forEach((o, k) => {
          if (k === s.rodea) return;
          const ult = palabrasDe(o).pop();
          assert.ok(!variantes(ult).some((v) => palabrasTexto.has(v)), `«${pregunta}»: la opción «${o}» también sale en el texto`);
          assert.ok(!enTextoComo(bajo, o.toLowerCase()), `«${pregunta}»: la opción «${o}» sale en el texto`);
        });
        claves.add(pregunta.toLowerCase());
      } else if (tipo === "sino") {
        const { frase } = e.datos; assert.deepEqual(s.huecos, []); assert.ok(s.rodea === 0 || s.rodea === 1);
        ck(frase, mayus, "frase"); const fb = frase.toLowerCase();
        analizaTexto(fb, frase);
        if (s.rodea === 0) assert.ok(bajo.includes(fb), `«${frase}» es Sí pero no es una frase del texto`);
        else {
          assert.ok(!bajo.includes(fb), `«${frase}» es No pero está en el texto`);
          const pf = palabrasDe(fb), pt = palabrasDe(bajo[fuente]);
          const d = diferencias(pf, pt);
          assert.ok(d >= 1 && d <= 2, `«${frase}» se parece a la frase ${fuente} en ${d} diferencias (1 o 2)`);
          pf.filter((w, j) => w !== pt[j] && !["un", "una", "el", "la"].includes(w)).forEach((w) => assert.ok(!variantes(w).some((v) => palabrasTexto.has(v)), `«${frase}»: «${w}» (lo que cambia) sale en el texto`));
        }
        claves.add(fb);
      } else {
        const { antes, despues } = e.datos, resp = s.huecos[0]; assert.equal(s.huecos.length, 1); assert.equal(e.datos.pregunta, undefined);
        if (mayus) assert.equal(antes + resp + despues, (antes + resp + despues).toUpperCase());
        else { assert.equal(resp, resp.toLowerCase()); assert.equal(despues, despues.toLowerCase()); if (antes) assert.equal(antes[0], antes[0].toUpperCase()); else assert.equal(resp[0], resp[0].toUpperCase()); }
        const junta = `${antes} ${resp} ${despues}`.replace(/^ /, "").replace(/ ([,.])/g, "$1").toLowerCase();
        assert.equal(junta, bajo[fuente], "antes + palabra + después no es la frase del texto");
        assert.equal(palabrasDe(resp).length, 1); assert.match(despues, /[.]$/);
        assert.ok(!/^[iíì]/i.test(resp));
        claves.add(junta + "|" + resp);
      }
    });
    assert.equal(claves.size, es.length, "preguntas repetidas");
    // solo «sí o no»: mitad Sí y mitad No
    if (p.preguntas === "sino" && es.length >= 2) assert.ok(Math.abs(es.filter((e) => e.solucion.rodea === 0).length - es.length / 2) <= 0.5, "no hay mitad Sí y mitad No");
  },

  "lectura.ordena"(act, tam) {
    comprobarBanco_();
    const es = act.ejercicios, p = act.params, mayus = p.caso === "mayus";
    cuantos(es, N(tam, 4));
    unicos(es, (e) => e.datos.id, "secuencias repetidas");
    for (const e of es) {
      const { frases, tema, id } = e.datos, orig = SECUENCIAS.find((s) => s.id === id), hs = e.solucion.huecos;
      assert.ok(orig, "secuencia fuera del banco"); assert.equal(tema, orig.tema);
      if (p.tema) assert.equal(tema, p.tema); if (p.frases) assert.equal(frases.length, p.frases); else assert.ok(frases.length === 3 || frases.length === 4);
      assert.equal(frases.length, orig.frases.length); assert.equal(hs.length, frases.length);
      frases.forEach((f, j) => { if (mayus) assert.equal(f, f.toUpperCase()); assert.equal(f.toLowerCase(), orig.frases[hs[j] - 1].toLowerCase(), `el número ${hs[j]} no es el de «${f}»`); if (!mayus) assert.equal(f, orig.frases[hs[j] - 1]); });
      assert.deepEqual([...hs].sort(), orig.frases.map((_, i) => i + 1), "los números no son una permutación");
      assert.notDeepEqual(hs, orig.frases.map((_, i) => i + 1), "las frases ya están en orden");
    }
    if (!p.tema && es.length >= 3) assert.ok(new Set(es.map((e) => e.datos.tema)).size >= 2, "todos los temas son iguales");
  },

  "lectura.instrucciones"(act, tam) {
    comprobarBanco_();
    const es = act.ejercicios, p = act.params, mayus = p.caso === "mayus", modo = p.ordenes === "figura" ? "figura" : p.ordenes === "dos" ? "dos" : "tamano";
    const filas = modo === "dos" ? 5 : 6, colores = COLORES_INSTR(p.colores === "todos");
    cuantos(es, tam === "media" ? Math.floor(filas / 2) : filas);
    const vistas = new Set();
    for (const e of es) {
      const { texto, ordenes, figuras } = e.datos, s = e.solucion; assert.deepEqual(s.huecos, []);
      ck(texto, mayus, "orden");
      const t = texto[0] + texto.slice(1).toLowerCase();
      assert.match(t, /^Colorea (de [a-zñó]+ (el|la) [a-zéíóáú]+( [a-zñáéíóú]+)?)( y de [a-zñó]+ (el|la) [a-zéíóáú]+( [a-zñáéíóú]+)?)*\.$/i, "la orden no es «Colorea de … la …»");
      analizaTexto(t[0] + texto.slice(1).toLowerCase(), texto);
      assert.equal(ordenes.length, modo === "dos" ? 2 : 1); assert.equal(s.colorea.length, ordenes.length); assert.equal(s.colores.length, ordenes.length);
      // las palabras de la orden: color (en el léxico), figura (nombre del léxico con su artículo), tamaño (concordando)
      const partes = texto.toLowerCase().replace(/\.$/, "").split(" y ").map((x) => x.replace(/^colorea /, ""));
      assert.equal(partes.length, ordenes.length);
      ordenes.forEach((o, k) => {
        assert.ok(colores.includes(o.color), `color «${o.color}» fuera de los permitidos`); assert.ok(PALABRAS.has(o.color) && PINTURAS[o.color]);
        assert.ok(PINTURAS[o.color].c.toLowerCase() !== "#c62828", "el relleno es el rojo de las respuestas");
        assert.ok(FORMAS[o.forma]); assert.ok(PALABRAS.has(FORMAS[o.forma].n));
        assert.equal(o.tam === null, modo === "figura"); if (o.tam !== null) assert.ok(o.tam === "g" || o.tam === "p");
        const g = LEXICO.find((x) => x.p === FORMAS[o.forma].n).g, art = g === "f" ? "la" : "el", tamano = o.tam ? " " + (o.tam === "g" ? "grande" : g === "f" ? "pequeña" : "pequeño") : "";
        assert.equal(partes[k], `de ${o.color} ${art} ${FORMAS[o.forma].n}${tamano}`, "la orden no dice lo que hay en ordenes");
        // UNA sola figura cumple la orden
        const ok = figuras.map((f, i) => (f.forma === o.forma && (o.tam === null || f.tam === o.tam) ? i : -1)).filter((i) => i >= 0);
        assert.deepEqual(ok, [s.colorea[k]], "no hay una única figura que cumpla la orden");
        assert.equal(s.colores[k], o.color);
        const clave = `${o.forma}|${o.tam}|${o.color}`; assert.ok(!vistas.has(clave), "orden repetida en la ficha"); vistas.add(clave);
      });
      unicos(figuras, (f) => f.forma + f.tam, "figuras repetidas (forma y tamaño)");
      assert.equal(figuras.length, modo === "figura" ? 4 : 6); figuras.forEach((f) => { assert.ok(FORMAS[f.forma]); assert.ok(f.tam === "g" || f.tam === "p"); });
      if (modo === "figura") assert.equal(new Set(figuras.map((f) => f.forma)).size, 4, "faltan figuras");
      if (modo === "dos") { assert.notEqual(ordenes[0].forma + ordenes[0].tam, ordenes[1].forma + ordenes[1].tam, "las dos órdenes piden la misma figura"); assert.notEqual(ordenes[0].color, ordenes[1].color); }
    }
  },

  "lectura.adivinanza"(act, tam) {
    comprobarBanco_();
    const es = act.ejercicios, p = act.params, letras = p.ayuda === "letras", mayus = p.caso === "mayus";
    cuantos(es, N(tam, 4));
    unicos(es, (e) => e.datos.id, "adivinanzas repetidas");
    const resp = es.map((e) => ADIVINANZAS.find((a) => a.id === e.datos.id).respuesta);
    unicos(resp, (r) => r, "respuestas repetidas en la ficha");
    es.forEach((e, i) => {
      const { texto, n, ayuda, id } = e.datos, orig = ADIVINANZAS.find((a) => a.id === id), s = e.solucion;
      if (mayus) assert.equal(texto, texto.toUpperCase()); else assert.equal(texto, orig.texto); assert.equal(texto.toLowerCase(), orig.texto.toLowerCase());
      assert.equal(ayuda, letras ? "letras" : "sin");
      assert.ok(PALABRAS.has(orig.respuesta)); assert.ok([...orig.respuesta].length <= 9);
      if (letras) {
        assert.equal(s.huecos.length, n); assert.equal(n, unidades(orig.respuesta).length);
        assert.equal(s.huecos.join("").toLowerCase(), orig.respuesta); s.huecos.forEach((h) => assert.equal(h, mayus ? h.toUpperCase() : h.toLowerCase()));
      } else { assert.deepEqual(s.huecos.map((h) => h.toLowerCase()), [orig.respuesta]); assert.equal(s.huecos[0], mayus ? s.huecos[0].toUpperCase() : s.huecos[0]); }
      // ninguna adivinanza de la ficha dice la respuesta de otra
      resp.forEach((r, j) => { if (j !== i) assert.ok(!palabrasDe(orig.texto).includes(r), `«${orig.respuesta}» nombra la respuesta «${r}» de otra de la ficha`); });
    });
  },

  "lectura.fluidez"(act, tam) {
    comprobarBanco_();
    assert.equal(tam, "completa", "la lectura rápida solo es de página completa");
    const e = act.ejercicios[0], p = act.params, frases = p.contenido === "frases", mayus = p.caso === "mayus";
    cuantos(act.ejercicios, 1);
    const { items, contenido, total } = e.datos;
    assert.equal(contenido, frases ? "frases" : "palabras"); assert.deepEqual(e.solucion.huecos, [total]);
    unicos(items, (x) => x.toLowerCase(), "elementos repetidos");
    if (frases) {
      assert.equal(items.length, FRASES_FLUIDEZ);
      let t = 0; items.forEach((f) => {
        const ws = palabrasDe(f); t += ws.length;
        if (frasePorId(ws.join(" "))?.tipo === "lib") { assert.match(f, mayus ? /^[A-ZÁÉÍÓÚÜÑ ]+\.$/ : /^[A-ZÁÉÍÓÚÑ][A-Za-záéíóúüñÁÉÍÓÚÑ ]+\.$/); return; }   // frase libre (primeras letras, «Mis frases»)
        ck(f, mayus, "frase"); analizaFrase(ws); assert.match(f, mayus ? /^[A-ZÁÉÍÓÚÜÑ ]+\.$/ : /^[A-ZÁÉÍÓÚÑ][a-záéíóúüñ ]+\.$/);
      });
      assert.equal(t, total, "el total no cuenta las palabras de las frases");
    } else {
      assert.equal(items.length, PALABRAS_FLUIDEZ); assert.equal(total, items.length);
      items.forEach((w) => {
        const m = enCaso(w, p.caso || null, "palabra"); assert.ok(PALABRAS.has(m), `«${m}» no está en el léxico`);
        const c = LEXICO.find((x) => x.p === m).c; assert.ok(["n", "a", "v"].includes(c), `«${m}»: categoría ${c}`);
        assert.ok(cabeTipo(m, p.tipo || "directas"), `«${m}» no es de sílabas ${p.tipo || "directas"}`); assert.ok([...m].length <= 8);
        if (Number.isInteger(p.largo)) assert.equal(silabas(m).length, p.largo);
        if (p.caso === "inicial") assert.ok(!/^[iíì]/.test(m), "I mayúscula inicial");
      });
      if (!Number.isInteger(p.largo)) assert.ok(new Set(items.map((w) => silabas(w.toLowerCase()).length)).size >= 2, "variadas: todas del mismo largo");
    }
  },
};

function comprobarBanco_() { comprobarBancos(); }
