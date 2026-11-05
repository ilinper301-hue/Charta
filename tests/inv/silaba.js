// Charta · invariantes de la familia «silaba» (Lengua 1.º, bloque 3; ver tests/invariantes.js).
import assert from "node:assert/strict";
import { unicos, cuantos } from "./_ayuda.js";
import { enCaso, palabraValida, otrasQueEncajan, permutaciones, PALABRAS } from "./_lengua.js";
import { silabas, tipoSilaba, sinTildes } from "../../src/lengua/reglas.js";

const TIPO_FILA = { directas: "directa", inversas: "inversa", trabadas: "trabada", mixtas: "mixta" };
// Posición de la vocal de cada sílaba (a e i o u) según el tipo, para comprobar el orden de las filas «ordenadas».
const VOCAL_DE = { directas: (s) => s.at(-1), inversas: (s) => s[0], trabadas: (s) => s.at(-1), mixtas: (s) => s.at(-2) };

export default {
  "silaba.tabla"(act) {
    const es = act.ejercicios, p = act.params, tipo = p.tipo || "directas", mayus = p.caso === "mayus";
    cuantos(es, 12);
    const todas = es.flatMap((e) => e.datos.silabas);
    for (const e of es) {
      assert.deepEqual(e.solucion.huecos, [], "lectura en voz alta: sin respuesta escrita");
      assert.equal(e.datos.silabas.length, 5);
      for (const s of e.datos.silabas) {
        const m = enCaso(s, mayus ? "mayus" : null, "sílaba");
        assert.equal(tipoSilaba(m), TIPO_FILA[tipo], `«${m}» no es una sílaba ${tipo}`);
        assert.deepEqual(silabas(m), [m], `«${m}» debe ser una sola sílaba`);
        if (p.letra) assert.ok(tipo === "inversas" ? m.endsWith(p.letra) : m.startsWith(p.letra), `«${m}» no lleva la letra ${p.letra}`);
      }
    }
    if (!p.letra) {
      unicos(es, (e) => e.datos.silabas.join(" "), "filas repetidas");
      assert.equal(new Set(todas).size, 60, "sílabas repetidas en la tabla");
      if (p.orden !== "mezcladas") for (const e of es) {
        const ms = e.datos.silabas.map((s) => s.toLowerCase());
        assert.deepEqual(ms.map(VOCAL_DE[tipo]), [..."aeiou"], "fila ordenada: vocales a e i o u");
      }
    } else if (p.orden === "mezcladas") {
      // cada fila usa las mismas sílabas (de una o varias filas de la letra), en otro orden
      for (const e of es) assert.equal(new Set(e.datos.silabas).size, 5, "fila con sílabas repetidas");
    }
  },

  "silaba.junta"(act, tam) {
    const es = act.ejercicios, p = act.params, une = p.tarea === "une", largo = p.largo ?? 2;
    if (une) {
      assert.equal(largo, 2); cuantos(es, tam === "media" ? 4 : 8);
      const izq = es.map((e) => e.datos.izq.toLowerCase()), der = es.map((e) => e.datos.derecha.toLowerCase());
      for (const s of [...izq, ...der]) assert.ok(s.length >= 2, `sílaba de una letra «${s}»`);
      unicos(es, (e) => e.datos.izq.toLowerCase(), "primeras sílabas repetidas"); assert.equal(new Set(der).size, der.length, "segundas sílabas repetidas");
      for (const [i, e] of es.entries()) {
        assert.deepEqual(e.solucion.huecos, []);
        if (p.caso === "mayus") assert.equal(e.datos.izq, e.datos.izq.toUpperCase()); else assert.equal(e.datos.derecha, e.datos.derecha.toLowerCase());
        const w = izq[i] + der[e.solucion.une];
        palabraValida(w, p, { maxLetras: 9 }); assert.deepEqual(silabas(w), [izq[i], der[e.solucion.une]], "silabeo ≠ las dos sílabas");
        for (let j = 0; j < der.length; j++) if (j !== e.solucion.une) assert.ok(!PALABRAS.has(izq[i] + der[j]), `«${izq[i] + der[j]}» también es palabra: unión ambigua`);
      }
      assert.notDeepEqual(es.map((e) => e.solucion.une), es.map((_, i) => i), "columnas sin mezclar");
    } else {
      cuantos(es, tam === "media" ? 5 : 10);
      unicos(es, (e) => e.datos.palabra.toLowerCase(), "palabras repetidas");
      for (const e of es) {
        const m = enCaso(e.datos.palabra, p.caso, "palabra");
        palabraValida(m, p, { maxLetras: 9, largos: largo === "variadas" ? [2, 3] : [largo] });
        assert.deepEqual(e.datos.silabas.map((s) => s.toLowerCase()), silabas(m), "sílabas ≠ silabeo");
        assert.equal(e.datos.silabas.join(""), e.datos.palabra);
        assert.deepEqual(e.solucion.huecos, [e.datos.palabra]);
      }
    }
  },

  "silaba.separa"(act, tam) {
    const es = act.ejercicios, p = act.params, rayas = p.modo === "rayas";
    cuantos(es, tam === "media" ? 5 : 10);
    unicos(es, (e) => e.datos.palabra.toLowerCase(), "palabras repetidas");
    for (const e of es) {
      const m = enCaso(e.datos.palabra, p.caso, "palabra"), ss = silabas(m);
      palabraValida(m, p, { maxLetras: 10, largos: [2, 3, 4] });
      assert.equal(e.datos.modo, rayas ? "rayas" : "casillas"); assert.equal(e.datos.n, ss.length);
      if (rayas) {
        assert.deepEqual(e.solucion.huecos, []);
        assert.deepEqual(e.solucion.rayas, ss.slice(0, -1).map((_, k) => ss.slice(0, k + 1).join("").length));
      } else {
        assert.equal(e.solucion.huecos.length, ss.length);
        assert.deepEqual(e.solucion.huecos.map((s) => s.toLowerCase()), ss);
        assert.equal(e.solucion.huecos.join(""), e.datos.palabra);
      }
    }
  },

  "silaba.ordena"(act, tam) {
    const es = act.ejercicios, p = act.params;
    cuantos(es, tam === "media" ? 5 : 10);
    unicos(es, (e) => e.datos.palabra.toLowerCase(), "palabras repetidas");
    for (const e of es) {
      const m = enCaso(e.datos.palabra, p.caso, "palabra"), ss = silabas(m);
      palabraValida(m, p, { maxLetras: 10, largos: [2, 3, 4] });
      const vistas = e.datos.silabas.map((s) => s.toLowerCase());
      assert.deepEqual([...vistas].sort(), [...ss].sort(), "las sílabas mostradas no son las de la palabra");
      assert.notEqual(vistas.join(""), m, "sílabas ya ordenadas");
      assert.ok(new Set(ss).size >= 2);
      for (const q of permutaciones(ss)) if (q.join("") !== m) assert.ok(!PALABRAS.has(q.join("")), `«${q.join("")}» también es palabra: solución no única`);
      assert.deepEqual(e.solucion.huecos, [e.datos.palabra]);
      if (p.caso === "mayus") for (const s of e.datos.silabas) assert.equal(s, s.toUpperCase());
      if (p.caso === "inicial") assert.equal(e.datos.silabas.filter((s) => s !== s.toLowerCase()).join(), e.datos.silabas.find((s) => s.toLowerCase() === ss[0])[0].toUpperCase() + ss[0].slice(1), "la sílaba inicial lleva mayúscula");
    }
  },

  "silaba.falta"(act, tam) {
    const es = act.ejercicios, p = act.params, ayuda = p.ayuda !== "sin";
    cuantos(es, tam === "media" ? 5 : 10);
    unicos(es, (e) => e.datos.palabra.toLowerCase(), "palabras repetidas");
    for (const e of es) {
      const { palabra, pos, largo, opciones } = e.datos, m = enCaso(palabra, p.caso, "palabra"), ss = silabas(m);
      palabraValida(m, p, { maxLetras: 9, largos: [2, 3, 4] });
      let k = -1, ini = 0; ss.forEach((s, i) => { if (ini === pos) k = i; ini += s.length; });
      assert.ok(k >= 0, "pos no es el comienzo de una sílaba"); assert.equal(largo, ss[k].length);
      if (p.hueco === "primera") assert.equal(k, 0);
      if (p.hueco === "ultima") assert.equal(k, ss.length - 1);
      assert.deepEqual(e.solucion.huecos, [palabra.slice(pos, pos + largo)]);
      const pre = m.slice(0, pos), post = m.slice(pos + largo);
      assert.deepEqual(otrasQueEncajan(m, [...Array(largo).keys()].map((i) => pos + i)).filter((o) => silabas(o).length === ss.length && sinTildes(o).startsWith(sinTildes(pre)) && sinTildes(o).endsWith(sinTildes(post)) && silabas(o).map(sinTildes).every((s, i) => i === k || s === sinTildes(ss[i]))), [], "no es la única palabra con esas otras sílabas");
      if (!ayuda) { assert.equal(opciones, null); continue; }
      assert.equal(opciones.length, 3); assert.equal(new Set(opciones.map(sinTildes).map((s) => s.toLowerCase())).size, 3, "sílabas de ayuda iguales");
      assert.ok(opciones.includes(palabra.slice(pos, pos + largo)));
      const rara = /[kwxyü]/, til = (s) => /[áéíóú]/.test(s);
      for (const o of opciones.map((s) => s.toLowerCase())) {
        assert.equal(til(o), til(ss[k]), "la tilde delata la sílaba buena");
        if (o !== ss[k]) assert.ok(!rara.test(o) || rara.test(ss[k]), `«${o}»: sílaba rara de ayuda`);
        assert.equal(tipoSilaba(o), tipoSilaba(ss[k]), "ayuda de otro tipo de sílaba");
        if (o !== ss[k]) assert.ok(!PALABRAS.has(pre + o + post), `«${pre + o + post}» es otra palabra`);
      }
      const may = p.caso === "mayus" || (p.caso === "inicial" && k === 0);
      for (const o of opciones) assert.equal(o, p.caso === "mayus" ? o.toUpperCase() : may ? o[0].toUpperCase() + o.slice(1) : o.toLowerCase());
    }
  },
};
