// Charta · invariantes de la familia «letra» (Lengua 1.º, bloque 2; ver tests/invariantes.js).
import assert from "node:assert/strict";
import { unicos, cuantos } from "./_ayuda.js";
import { enCaso, palabraValida, otrasQueEncajan, PALABRAS, unidadesDe } from "./_lengua.js";
import { silabas, ABECEDARIO, sinTildes } from "../../src/lengua/reglas.js";
import { CONFUSAS } from "../../src/tipos/letra.busca.js";

const sinHuecos = (e) => assert.deepEqual(e.solucion.huecos, [], "rodear: sin huecos escritos");
const GRUPO_BDPQ = new Set("bdpq"), VOC = new Set("aeiou");

export default {
  "letra.busca"(act, tam) {
    const es = act.ejercicios, p = act.params, mayus = p.caso === "mayus";
    cuantos(es, tam === "media" ? 5 : 10);
    unicos(es, (e) => e.datos.fila.join(""), "filas repetidas");
    const letra = es[0].datos.letra.toLowerCase();
    if (p.letra) assert.equal(letra, p.letra);
    assert.ok(ABECEDARIO.includes(letra), "letra fuera del abecedario");
    assert.ok(act.enunciado.includes(es[0].datos.letra), "la letra pedida no sale en el enunciado");
    for (const e of es) {
      sinHuecos(e);
      const { fila } = e.datos;
      assert.equal(e.datos.letra, mayus ? letra.toUpperCase() : letra);
      assert.equal(fila.length, 10);
      assert.equal(sinTildes(fila.join("")), fila.join(""));
      for (const c of fila) assert.ok(ABECEDARIO.includes(c.toLowerCase()) && c === (mayus ? c.toUpperCase() : c.toLowerCase()), `letra «${c}» mal escrita`);
      const donde = fila.flatMap((c, i) => (c === e.datos.letra ? [i] : []));
      assert.deepEqual(e.solucion.rodea, donde, "rodea ≠ posiciones de la letra pedida");
      assert.ok(donde.length >= 3 && donde.length <= 4, `veces: ${donde.length}`);
      if (p.distractoras === "confusas") for (const c of fila) if (c !== e.datos.letra) {
        const l = c.toLowerCase();
        assert.ok(CONFUSAS[letra].includes(l), `«${l}» no se confunde con «${letra}»`);
        if (GRUPO_BDPQ.has(letra)) assert.ok(GRUPO_BDPQ.has(l) || CONFUSAS[letra].includes(l));
      }
    }
    if (p.distractoras === "confusas") for (const [a, b] of ["bd", "bp", "bq", "dp", "dq", "pq", "mn", "un"]) assert.ok(CONFUSAS[a].includes(b) && CONFUSAS[b].includes(a), `${a}-${b} deben confundirse`);
  },

  "letra.enpalabras"(act, tam) {
    const es = act.ejercicios, p = act.params, cuenta = p.tarea !== "rodea";
    cuantos(es, tam === "media" ? 6 : 12);
    unicos(es, (e) => e.datos.palabra.toLowerCase(), "palabras repetidas");
    const letra = es[0].datos.letra.toLowerCase();
    if (p.letra) assert.equal(letra, p.letra);
    assert.ok(act.enunciado.includes(es[0].datos.letra));
    for (const e of es) {
      const m = enCaso(e.datos.palabra, p.caso, "palabra");
      palabraValida(m, p, { maxLetras: 9 });
      assert.equal(e.datos.letra.toLowerCase(), letra); assert.equal(e.datos.cuenta, cuenta);
      const us = unidadesDe(m), donde = us.flatMap((u, k) => (sinTildes(u) === letra ? [k] : []));
      for (const u of us) if (u.length > 1) assert.ok(!u.includes(letra), `«${m}»: la «${letra}» está dentro de «${u}»`);
      assert.deepEqual(e.solucion.rodea, donde);
      assert.ok(donde.length >= 1 && donde.length <= 4);
      assert.deepEqual(e.solucion.huecos, cuenta ? [donde.length] : []);
    }
  },

  "letra.falta"(act, tam) {
    const es = act.ejercicios, p = act.params, ayuda = p.ayuda !== "sin";
    cuantos(es, tam === "media" ? 8 : 16);
    unicos(es, (e) => e.datos.palabra.toLowerCase(), "palabras repetidas");
    for (const e of es) {
      const { palabra, pos, opciones } = e.datos, m = enCaso(palabra, p.caso, "palabra");
      palabraValida(m, p, { maxLetras: 8 });
      assert.ok(pos >= 0 && pos < m.length);
      if (p.hueco === "primera") assert.equal(pos, 0);
      assert.deepEqual(e.solucion.huecos, [palabra[pos]], "la solución no es la letra de la palabra");
      assert.ok(/[a-zñ]/.test(m[pos]) && m[pos] !== "y", "hueco en una letra con tilde, ü o y");
      let i = 0; for (const u of unidadesDe(m)) { if (pos >= i && pos < i + u.length) assert.equal(u.length, 1, `el hueco cae dentro de «${u}»`); i += u.length; }
      assert.deepEqual(otrasQueEncajan(m, [pos]), [], `«${m}» no es la única palabra que encaja con el hueco`);
      if (!ayuda) { assert.equal(opciones, null); continue; }
      assert.equal(opciones.length, 3); assert.equal(new Set(opciones).size, 3);
      assert.ok(opciones.includes(palabra[pos]), "falta la correcta entre las opciones");
      const mal = (c) => { assert.equal(c, p.caso === "mayus" || (p.caso === "inicial" && pos === 0) ? c.toUpperCase() : c.toLowerCase()); };
      opciones.forEach(mal);
      for (const c of opciones.map((x) => x.toLowerCase())) {
        assert.equal(VOC.has(c), VOC.has(m[pos]), "ayuda de otra clase (vocal/consonante)");
        if (c !== m[pos]) assert.ok(!PALABRAS.has(m.slice(0, pos) + c + m.slice(pos + 1)), `«${c}» forma otra palabra`);
      }
    }
  },

  "letra.vocales"(act, tam) {
    const es = act.ejercicios, p = act.params, modo = p.faltan || "todas";
    cuantos(es, tam === "media" ? 8 : 16);
    unicos(es, (e) => e.datos.palabra.toLowerCase(), "palabras repetidas");
    for (const e of es) {
      const { palabra, huecos } = e.datos, m = enCaso(palabra, p.caso, "palabra");
      palabraValida(m, p, { maxLetras: 8 });
      assert.ok(!m.includes("ü"));
      const vocales = [...m].flatMap((c, i) => ("aeiouáéíóú".includes(c) && !(c === "u" && "qg".includes(m[i - 1] ?? "-") && "eéií".includes(m[i + 1] ?? "-")) ? [i] : []));
      assert.ok(huecos.length >= 1 && huecos.every((h, k) => vocales.includes(h) && (k === 0 || h > huecos[k - 1])), "huecos que no son vocales o desordenados");
      if (modo === "todas") assert.deepEqual(huecos, vocales);
      if (modo === "una") assert.equal(huecos.length, 1);
      if (modo === "azar") assert.ok(huecos.length < vocales.length, "al azar: debe quedar alguna vocal");
      assert.deepEqual(e.solucion.huecos, huecos.map((h) => palabra[h]));
      assert.deepEqual(otrasQueEncajan(m, huecos), [], `«${m}» no es la única palabra que encaja`);
    }
  },

  "letra.parejas"(act) {
    const es = act.ejercicios, escribe = act.params.tarea === "escribe";
    const prohibida = (ls) => assert.ok(!(ls.includes("i") && ls.includes("l")), "i y l juntas (I ≈ l)");
    if (escribe) {
      cuantos(es, 24);
      const ls = es.map((e) => e.datos.minus); unicos(es, (e) => e.datos.minus); prohibida(ls);
      for (const e of es) {
        const { mayus, minus, falta } = e.datos;
        assert.ok(ABECEDARIO.includes(minus) && mayus === minus.toUpperCase() && ["mayus", "minus"].includes(falta));
        assert.deepEqual(e.solucion.huecos, [falta === "mayus" ? mayus : minus]);
      }
      assert.ok(es.some((e) => e.datos.falta === "mayus") && es.some((e) => e.datos.falta === "minus"), "faltan los dos tipos de hueco");
    } else {
      cuantos(es, 8);
      const izq = es.map((e) => e.datos.izq.toLowerCase()), der = es.map((e) => e.datos.derecha);
      unicos(es, (e) => e.datos.izq); prohibida(izq);
      assert.deepEqual([...izq].sort(), [...der].sort(), "las columnas no tienen las mismas letras");
      assert.ok(der.some((l, i) => l !== izq[i]), "pares sin mezclar");
      for (const e of es) {
        assert.ok(ABECEDARIO.includes(e.datos.izq.toLowerCase()) && e.datos.izq === e.datos.izq.toUpperCase() && e.datos.derecha === e.datos.derecha.toLowerCase());
        sinHuecos(e); assert.equal(der[e.solucion.une], e.datos.izq.toLowerCase(), "une apunta a otra letra");
      }
    }
  },

  "letra.abecedario"(act, tam) {
    const es = act.ejercicios, p = act.params, modo = p.modo || "ambos", mayus = p.caso === "mayus";
    cuantos(es, tam === "media" ? 9 : 18);
    unicos(es, (e) => e.datos.letra);
    const patron = { ambos: "hnh", anterior: "hn", posterior: "nh" }[modo], L = ABECEDARIO.length;
    assert.equal(L, 27); assert.equal(ABECEDARIO[14], "ñ");
    for (const e of es) {
      const l = e.datos.letra.toLowerCase(), i = ABECEDARIO.indexOf(l);
      assert.ok(i >= 0 && e.datos.letra === (mayus ? l.toUpperCase() : l)); assert.equal(e.datos.patron, patron);
      const esperado = [...patron].flatMap((t, j) => (t === "h" ? [j < patron.indexOf("n") ? i - 1 : i + 1] : []));
      for (const k of esperado) assert.ok(k >= 0 && k < L, "no hay letra antes de la a / después de la z");
      assert.deepEqual(e.solucion.huecos.map((c) => c.toLowerCase()), esperado.map((k) => ABECEDARIO[k]));
      for (const c of e.solucion.huecos) assert.equal(c, mayus ? c.toUpperCase() : c.toLowerCase());
    }
  },
};
