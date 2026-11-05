// Charta · invariantes de la familia «frase» (Lengua 1.º, bloque 5; ver tests/invariantes.js).
// Una frase es válida si: tiene 3 a 5 palabras; todas están en el léxico (nombres y adjetivos tal cual o en plural/femenino; verbos por su infinitivo;
// artículos y «mucho», «muy», «en», «a»); el artículo concuerda con el nombre y el verbo con el sujeto; el adjetivo concuerda; no empieza por «I»;
// y es una frase del banco de _frase.js (la cosa hace lo que se dice).
import assert from "node:assert/strict";
import { unicos, cuantos } from "./_ayuda.js";
import { unidadesDe } from "./_lengua.js";
import { LEXICO } from "../../src/lengua/lexico.js";
import { articulo, plural, tonica } from "../../src/lengua/reglas.js";
import { VERBOS, BANCO, INERTES, NO_COMIBLE, todasFrases, frasePorId } from "../../src/tipos/_frase.js";

const ENT = new Map(LEXICO.map((e) => [e.p, e]));
const NOMBRE = new Map();            // forma (singular o plural) → { e, num }
for (const e of LEXICO) if (e.c === "n") { NOMBRE.set(e.p, { e, num: "s" }); if (!NOMBRE.has(plural(e.p))) NOMBRE.set(plural(e.p), { e, num: "p" }); }
const ADJ = new Map();               // forma → [{ e, g, num }]
for (const e of LEXICO) if (e.c === "a") for (const g of ["m", "f"]) for (const num of ["s", "p"]) {
  let f = e.p; if (g === "f" && /o$/.test(f)) f = f.slice(0, -1) + "a";
  if (num === "p") f = plural(f);
  if (!ADJ.has(f)) ADJ.set(f, []); ADJ.get(f).push({ e, g, num });
}
const ARTICULOS = new Map();         // forma → { g, num, indef }
for (const g of ["m", "f"]) for (const num of ["s", "p"]) for (const indef of [false, true]) ARTICULOS.set(articulo(g, { plural: num === "p", indefinido: indef }), { g, num, indef });
const SUELTAS = new Set(["mucho", "muy", "en", "a"]);
for (const w of SUELTAS) assert.ok(ENT.has(w) || w === "mucho", `«${w}» no está en el léxico`);

/** Comprueba una frase (palabras en minúscula) y devuelve { suj: { lema, g, num }, verbo }. */
export function analiza(palabras) {
  const q = palabras.join(" ");
  assert.ok(palabras.length >= 3 && palabras.length <= 5, `«${q}»: ${palabras.length} palabras (3 a 5)`);
  assert.ok(!/^[iíì]/.test(palabras[0]), `«${q}» empieza por i`);
  // sujeto: artículo definido + nombre
  const a0 = ARTICULOS.get(palabras[0]);
  assert.ok(a0 && !a0.indef, `«${q}»: no empieza por el, la, los, las`);
  const n1 = NOMBRE.get(palabras[1]);
  assert.ok(n1, `«${q}»: «${palabras[1]}» no es un nombre del léxico`);
  assert.equal(n1.e.g, a0.g, `«${q}»: el artículo «${palabras[0]}» no concuerda en género con «${palabras[1]}»`);
  assert.equal(n1.num, a0.num, `«${q}»: el artículo «${palabras[0]}» no concuerda en número con «${palabras[1]}»`);
  assert.ok(!(n1.e.g === "f" && /^h?[aá]/.test(n1.e.p) && tonica(n1.e.p) === 0), `«${q}»: femenino con a/ha tónica (el agua)`);
  // verbo
  const v = palabras[2], pl = a0.num === "p";
  let forma = v;
  if (v === "es" || v === "son") { forma = "es"; assert.equal(v === "son", pl, `«${q}»: «${v}» no concuerda con el sujeto`); }
  else if (v === "está" || v === "están") { forma = "está"; assert.equal(v === "están", pl, `«${q}»: «${v}» no concuerda con el sujeto`); }
  else { assert.equal(v.endsWith("n"), pl, `«${q}»: el verbo «${v}» no concuerda en número con el sujeto`); forma = pl ? v.slice(0, -1) : v; }
  const lema = forma === "es" ? "ser" : forma === "está" ? "estar" : VERBOS[forma];
  assert.ok(lema, `«${q}»: «${v}» no es un verbo del banco`);
  assert.ok(ENT.has(lema) && ENT.get(lema).c === "v", `«${q}»: el verbo «${lema}» no está en el léxico`);
  // el resto
  const resto = palabras.slice(3);
  resto.forEach((w, k) => {
    if (SUELTAS.has(w)) return;
    const art = ARTICULOS.get(w);
    if (art) { const sig = NOMBRE.get(resto[k + 1]); assert.ok(sig, `«${q}»: tras «${w}» no hay un nombre`); assert.equal(sig.e.g, art.g, `«${q}»: «${w}» no concuerda con «${resto[k + 1]}»`); assert.equal(sig.num, art.num, `«${q}»: «${w}» no concuerda en número con «${resto[k + 1]}»`); return; }
    if (k > 0 && ARTICULOS.has(resto[k - 1])) return;          // el nombre del complemento (ya comprobado)
    if (forma === "es" || forma === "está") {
      const as = ADJ.get(w); assert.ok(as, `«${q}»: «${w}» no es un adjetivo del léxico`);
      assert.ok(as.some((x) => x.g === n1.e.g && x.num === a0.num), `«${q}»: el adjetivo «${w}» no concuerda con el sujeto`);
      return;
    }
    assert.ok(NOMBRE.has(w) || ENT.has(w), `«${q}»: «${w}» no está en el léxico`);   // complemento sin artículo: «pan», «zanahorias», «casa»
  });
  return { suj: { lema: n1.e.p, g: n1.e.g, num: a0.num }, verbo: lema, forma };
}
const sinPunto = (t) => t.replace(/\.$/, "");
const palabrasDe = (t) => sinPunto(t).toLowerCase().split(" ");
const BANCO_IDS = () => new Set(todasFrases().map((f) => f.id));
const largosOk = (es, p, tam, palabrasDe_, minimo = 0) => {
  const ns = es.map(palabrasDe_);
  if (Number.isInteger(p.palabras)) ns.forEach((n) => assert.equal(n, p.palabras, "nº de palabras ≠ el pedido"));
  else ns.forEach((n) => assert.ok(n >= 3 && n <= 5));
  if (!p.palabras && ns.length >= 3) assert.equal(new Set(ns).size, minimo === 4 ? 2 : 3, "variadas: faltan largos");
  if (minimo) ns.forEach((n) => assert.ok(n >= minimo, `frase de ${n} palabras: hacen falta ${minimo} o más`));
};
const enCaso = (t, caso, q) => assert.equal(t, caso === "mayus" ? t.toUpperCase() : t, `${q}: no está en MAYÚSCULAS`);
const sinRepetirSujeto = (frases) => {
  // se admite repetir sujeto solo si no queda otro (comprobación suave: nunca más de la mitad de las frases con el mismo sujeto)
  const c = {}; for (const f of frases) c[f.suj.lema] = (c[f.suj.lema] || 0) + 1;
  assert.ok(Math.max(...Object.values(c)) <= Math.ceil(frases.length / 2), "demasiadas frases con el mismo sujeto");
};

// El banco entero (se comprueba una vez): todas las frases son válidas y no hay inertes dentro.
let bancoComprobado = false;
function comprobarBanco() {
  if (bancoComprobado) return; bancoComprobado = true;
  for (const f of todasFrases()) { analiza(f.palabras); assert.ok(!f.palabras.some((w) => INERTES.some((i) => w === i || w === plural(i))), `«${f.id}»: lleva un objeto inerte`); }
  for (const s of BANCO) assert.ok(NOMBRE.has(s.s), `«${s.s}» no está en el léxico`);
}

export default {
  "frase.ordena"(act, tam) {
    comprobarBanco();
    const es = act.ejercicios, p = act.params, mayus = p.caso === "mayus", marca = p.marca !== "sin" && !mayus, V = BANCO_IDS();
    cuantos(es, tam === "media" ? 4 : 8);
    unicos(es, (e) => e.solucion.huecos[0], "frases repetidas");
    largosOk(es, p, tam, (e) => palabrasDe(e.solucion.huecos[0]).length);
    sinRepetirSujeto(es.map((e) => analiza(palabrasDe(e.solucion.huecos[0]))));
    for (const e of es) {
      const sol = e.solucion.huecos[0], ws = palabrasDe(sol), { palabras: ts } = e.datos;
      assert.deepEqual(e.solucion.huecos.length, 1);
      assert.match(sol, mayus ? /^[A-ZÁÉÍÓÚÜÑ ]+\.$/ : /^[A-ZÁÉÍÓÚÑ][a-záéíóúüñ ]+\.$/, "la solución no es «Mayúscula… punto.»");
      analiza(ws); assert.ok(V.has(ws.join(" ")), `«${sol}» no es una frase del banco`);
      assert.equal(ts.length, ws.length); assert.equal(e.datos.marca, marca);
      assert.deepEqual(ts.map((w) => w.toLowerCase()).sort(), [...ws].sort(), "las palabras no son las de la frase");
      assert.notDeepEqual(ts.map((w) => w.toLowerCase()), ws, "las palabras ya están en orden");
      if (marca) { const caps = ts.filter((w) => w !== w.toLowerCase()); assert.deepEqual(caps, [ws[0][0].toUpperCase() + ws[0].slice(1)], "la primera palabra debe ser la única con mayúscula"); }
      else if (mayus) ts.forEach((w) => enCaso(w, "mayus", "palabra"));
      else ts.forEach((w) => assert.equal(w, w.toLowerCase(), "palabra con mayúscula sin marca"));
      // solución única: ningún otro orden de las palabras es otra frase del banco
      const perm = (l) => (l.length <= 1 ? [l] : l.flatMap((x, i) => perm([...l.slice(0, i), ...l.slice(i + 1)]).map((r) => [x, ...r])));
      for (const o of perm(ws)) { const t = o.join(" "); if (t !== ws.join(" ") && (!marca || o[0] === ws[0])) assert.ok(!V.has(t), `«${sol}»: «${t}» también es una frase`); }
    }
  },

  "frase.separa"(act, tam) {
    comprobarBanco();
    const es = act.ejercicios, p = act.params, rayas = p.tarea !== "escribe", V = BANCO_IDS();
    cuantos(es, tam === "media" ? (rayas ? 5 : 4) : rayas ? 10 : 8);
    unicos(es, (e) => e.datos.junta.toLowerCase(), "frases repetidas");
    const unidas = new Map(); for (const f of todasFrases()) unidas.set(f.palabras.join(""), (unidas.get(f.palabras.join("")) || 0) + 1);
    const frases = es.map((e) => {
      const { junta, modo, n } = e.datos; assert.equal(modo, rayas ? "rayas" : "escribe"); enCaso(junta, p.caso, "junta");
      assert.ok(!/ /.test(junta), "la frase junta lleva espacios");
      let ws;
      if (rayas) {
        const rs = e.solucion.rayas; assert.deepEqual(e.solucion.huecos, []);
        assert.equal(rs.length, n - 1); rs.forEach((r, k) => { assert.ok(r > 0 && r < junta.length); if (k) assert.ok(r > rs[k - 1]); });
        ws = [...rs, junta.length].map((r, k) => junta.slice(k ? rs[k - 1] : 0, r).toLowerCase());
        // ninguna raya parte «ll», «rr», «ch», «qu», «gu»
        const finales = new Set(); let pos = 0; for (const u of unidadesDe(junta.toLowerCase())) { pos += u.length; finales.add(pos); }
        rs.forEach((r) => assert.ok(finales.has(r), `«${junta}»: la raya en ${r} parte una letra doble`));
      } else {
        assert.equal(e.solucion.huecos.length, 1); const sol = e.solucion.huecos[0]; enCaso(sol, p.caso, "solución");
        ws = sol.toLowerCase().split(" "); assert.equal(ws.join("").toLowerCase(), junta.toLowerCase()); assert.equal(ws.length, n);
      }
      const f = analiza(ws); assert.ok(V.has(ws.join(" ")), `«${ws.join(" ")}» no es una frase del banco`);
      assert.equal(unidas.get(ws.join("")), 1, `«${junta}» se puede separar de otra manera`);
      return f;
    });
    largosOk(es, p, tam, (e) => e.datos.n); sinRepetirSujeto(frases);
  },

  "frase.completa"(act, tam) {
    comprobarBanco();
    const es = act.ejercicios, p = act.params, falta = p.falta || "sujeto", sin = p.ayuda === "sin", V = BANCO_IDS(), ACCION = ["comer", "beber", "leer"];
    cuantos(es, tam === "media" ? 4 : 8);
    const completas = [];
    for (const e of es) {
      const { antes, despues, opciones, falta: fe } = e.datos, resp = e.solucion.huecos[0];
      assert.equal(e.solucion.huecos.length, 1);
      if (falta === "mezcla") assert.ok(["sujeto", "objeto"].includes(fe)); else assert.equal(fe, falta);
      enCaso(antes, p.caso, "antes"); enCaso(despues, p.caso, "después"); enCaso(resp, p.caso, "solución");
      assert.match(despues, /\.$/); assert.ok(antes.length > 0);
      const hacer = (palabra) => (antes + " " + palabra + " " + despues).replace(/ \.$/, ".").toLowerCase();
      const ws = palabrasDe(hacer(resp));
      const f = analiza(ws); assert.ok(V.has(ws.join(" ")), `«${ws.join(" ")}» no es una frase del banco`);
      const hecho = todasFrases().find((x) => x.id === ws.join(" "));
      assert.ok(["i", "im", "ob", "od", "lug"].includes(hecho.tipo), "la frase no es de acción");
      if (fe === "sujeto") { assert.equal(antes.split(" ").length, 1); assert.equal(resp.toLowerCase(), ws[1]); }
      else { assert.ok(ACCION.includes(f.verbo), `objeto: el verbo «${f.verbo}» no admite distractoras`); assert.equal(resp.toLowerCase(), ws[ws.length - 1]); }
      completas.push(hecho);
      if (sin) { assert.equal(opciones, null); continue; }
      assert.equal(opciones.length, 3); assert.equal(new Set(opciones).size, 3); assert.ok(opciones.includes(resp), "falta la correcta entre las opciones");
      opciones.forEach((o) => enCaso(o, p.caso, "opción"));
      for (const o of opciones.filter((x) => x !== resp)) {
        const m = o.toLowerCase(), pal = hacer(o).split(" ");
        const n = NOMBRE.get(m); assert.ok(n && INERTES.includes(n.e.p), `distractora «${m}»: no es un objeto inerte`);
        assert.ok(!V.has(palabrasDe(hacer(o)).join(" ")), `«${hacer(o)}» también es una frase válida`);
        analiza(palabrasDe(hacer(o)));          // concuerda igual que la correcta: la gramática no delata la respuesta
        assert.equal(n.num, NOMBRE.get(resp.toLowerCase()).num, "distractora de otro número");
        if (fe === "sujeto" || /\b(un|una|unos|unas|el|la|los|las)$/.test(antes.toLowerCase())) assert.equal(n.e.g, NOMBRE.get(resp.toLowerCase()).e.g, "distractora de otro género");
      }
    }
    unicos(es, (e) => e.datos.antes + "|" + e.solucion.huecos[0] + "|" + e.datos.despues, "frases repetidas");
    largosOk(es, p, tam, (e) => (e.datos.antes + " _ " + e.datos.despues.replace(/\.$/, "")).trim().split(/\s+/).length, falta === "objeto" ? 4 : 0);
    if (falta === "mezcla") { assert.equal(es.filter((e) => e.datos.falta === "objeto").length, es.length / 2); es.filter((e) => e.datos.falta === "objeto").forEach((e) => assert.ok((e.datos.antes + " _ " + e.datos.despues).split(/\s+/).length >= 4, "objeto en frase de 3 palabras")); }
    sinRepetirSujeto(completas.map((f) => f));
  },

  "frase.verdad"(act, tam) {
    comprobarBanco();
    const es = act.ejercicios, p = act.params, V = BANCO_IDS(), mayus = p.caso === "mayus";
    cuantos(es, tam === "media" ? 6 : 12);
    unicos(es, (e) => e.datos.frase, "frases repetidas");
    assert.equal(es.filter((e) => e.solucion.rodea === 0).length, es.length / 2, "no hay mitad Sí y mitad No");
    const orden = es.map((e) => e.solucion.rodea).join(""); assert.ok(!/^0+1+$|^1+0+$/.test(orden), "no están mezcladas");
    for (const e of es) {
      const { frase } = e.datos, r = e.solucion.rodea; assert.deepEqual(e.solucion.huecos, []); assert.ok(r === 0 || r === 1);
      assert.match(frase, mayus ? /^[A-ZÁÉÍÓÚÜÑ ]+\.$/ : /^[A-ZÁÉÍÓÚÑ][a-záéíóúüñ ]+\.$/); enCaso(frase, p.caso, "frase");
      const ws = palabrasDe(frase), f = analiza(ws), id = ws.join(" ");
      if (r === 0) {
        assert.ok(V.has(id), `«${frase}» es Sí pero no está en el banco de lo que es verdad`);
        assert.ok(todasFrases().find((x) => x.id === id).universal, `«${frase}»: un hecho no universal no puede ser un Sí`);
      } else {
        assert.ok(!V.has(id), `«${frase}» es No pero está en el banco de lo que es verdad`);
        // el sujeto no hace nunca eso: ni el verbo ni el adjetivo ni el complemento salen en su ficha del banco
        const s = BANCO.find((x) => x.s === f.suj.lema);
        if (s) {
          const dichos = new Set([...s.i, ...s.ob.map((o) => o[0]), ...s.od.map((o) => o[0]), ...s.lug.map((o) => o[0])]);
          if (["come", "bebe"].includes(f.forma) && ws.length === 5) assert.ok(NO_COMIBLE.includes(NOMBRE.get(ws[4]).e.p), `«${frase}»: lo que se come no es un objeto inerte`);
          else if (f.forma !== "es" && f.forma !== "está") assert.ok(!dichos.has(f.forma), `«${frase}» es falso pero ${f.suj.lema} sí hace «${f.forma}»`);
          else for (const a of [...s.ser, ...s.serP, ...s.est]) assert.ok(!ws.some((w) => ADJ.get(w)?.some((x) => x.e.p === a)), `«${frase}»: ${f.suj.lema} sí puede ser «${a}»`);
        }
      }
    }
    sinRepetirSujeto(es.map((e) => analiza(palabrasDe(e.datos.frase))));
  },

  "frase.puntua"(act, tam) {
    comprobarBanco();
    const es = act.ejercicios, p = act.params, falta = p.falta || "ambos", escribe = p.tarea === "escribe", V = BANCO_IDS();
    cuantos(es, tam === "media" ? 4 : 8);
    unicos(es, (e) => e.datos.frase.toLowerCase().replace(/\.$/, ""), "frases repetidas");
    largosOk(es, p, tam, (e) => e.datos.frase.split(" ").length);
    const fs = [];
    for (const e of es) {
      const { frase, falta: fe, modo } = e.datos, s = e.solucion; assert.equal(fe, falta); assert.equal(modo, escribe ? "escribe" : "rodea");
      const buena = escribe ? s.huecos[0] : (falta === "punto" ? frase + "." : frase[0].toUpperCase() + frase.slice(1).replace(/\.?$/, "."));
      assert.match(buena, /^[A-ZÁÉÍÓÚÑ][a-záéíóúüñ ]+\.$/, "la frase bien escrita no es «Mayúscula… punto.»");
      assert.ok(!/^I/.test(buena));
      const ws = palabrasDe(buena); fs.push(analiza(ws)); assert.ok(V.has(ws.join(" ")), `«${buena}» no es una frase del banco`);
      // lo que falta es solo lo que se dijo
      const tienePunto = frase.endsWith("."), tieneMayus = frase[0] === frase[0].toUpperCase();
      assert.equal(tienePunto, falta === "mayus", "punto presente/ausente mal"); assert.equal(tieneMayus, falta === "punto", "mayúscula presente/ausente mal");
      assert.ok(!/[A-ZÁÉÍÓÚÑ]/.test(frase.slice(1)), "mayúsculas de más");
      if (escribe) { assert.equal(s.huecos.length, 1); assert.deepEqual(s.rodea, undefined); }
      else { assert.deepEqual(s.huecos, falta === "mayus" ? [] : ["."]); assert.deepEqual(s.rodea, falta === "punto" ? [] : [0]); }
    }
    sinRepetirSujeto(fs);
  },
};
