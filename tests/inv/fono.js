// Charta · invariantes de la familia «fono» (Lengua 1.º, bloque 1; ver tests/invariantes.js).
import assert from "node:assert/strict";
import { unicos, cuantos } from "./_ayuda.js";
import { enCaso, palabraValida, otrasQueEncajan, PALABRAS } from "./_lengua.js";
import { silabas, sinTildes, rima, riman } from "../../src/lengua/reglas.js";

const VOC = [..."aeiou"], N = (tam, c) => (tam === "media" ? c / 2 : c);
const unidades = (m) => m.match(/ch|ll|rr|qu|gu(?=[eéií])|./g);

export default {
  "fono.silabas"(act, tam) {
    const es = act.ejercicios, p = act.params, num = p.respuesta === "numero";
    cuantos(es, N(tam, 10));
    unicos(es, (e) => e.datos.palabra.toLowerCase(), "palabras repetidas");
    for (const e of es) {
      const m = enCaso(e.datos.palabra, p.caso, "palabra"), n = silabas(m).length;
      palabraValida(m, p, { maxLetras: 10, largos: [1, 2, 3, 4] });
      assert.equal(e.datos.n, n); assert.equal(e.datos.respuesta, num ? "numero" : "colorea");
      assert.deepEqual(e.solucion, num ? { huecos: [n] } : { huecos: [], colorea: n });
    }
  },

  "fono.inicial"(act, tam) {
    const es = act.ejercicios, p = act.params, fin = p.posicion === "final", tl = p.letras;
    cuantos(es, N(tam, 10));
    unicos(es, (e) => e.datos.palabra.toLowerCase(), "palabras repetidas");
    for (const e of es) {
      const { palabra, pos, opciones } = e.datos, m = enCaso(palabra, p.caso, "palabra");
      palabraValida(m, p, { maxLetras: 8, largos: [1, 2, 3, 4] });
      assert.equal(e.datos.posicion, fin ? "final" : "principio"); assert.equal(pos, fin ? m.length - 1 : 0);
      assert.equal(unidades(m)[fin ? unidades(m).length - 1 : 0].length, 1, "la letra del hueco forma parte de un dígrafo");
      const real = m[pos]; assert.ok(/[a-z]/.test(real) && !"hkwxyq".includes(real), `letra «${real}» no admitida`);
      assert.deepEqual(otrasQueEncajan(m, [pos]), [], "otra palabra del léxico encaja en el hueco");
      assert.equal(opciones.length, 3); assert.equal(new Set(opciones.map((c) => c.toLowerCase())).size, 3, "letras repetidas");
      assert.deepEqual(e.solucion.huecos, []); assert.equal(opciones[e.solucion.rodea], palabra[pos], "la letra rodeada no es la que falta");
      const mayus = p.caso === "mayus" || (p.caso === "inicial" && pos === 0);
      for (const c of opciones) { assert.equal(c, mayus ? c.toUpperCase() : c.toLowerCase()); assert.equal(c.length, 1); }
      let buenas = 0;
      for (const c of opciones) {
        const w = m.slice(0, pos) + c.toLowerCase() + m.slice(pos + 1);
        if (PALABRAS.has(w)) buenas++;
        if (tl === "vocales") assert.ok(VOC.includes(c.toLowerCase())); if (tl === "consonantes") assert.ok(!VOC.includes(c.toLowerCase()));
      }
      assert.equal(buenas, 1, "más de una letra forma palabra del léxico");
      if (p.caso === "inicial") assert.ok(!(pos === 0 && opciones.includes("I")), "I mayúscula entre las opciones");
    }
  },

  "fono.posicion"(act, tam) {
    const es = act.ejercicios, p = act.params, n = N(tam, 10);
    cuantos(es, n);
    unicos(es, (e) => e.datos.palabra.toLowerCase(), "palabras repetidas");
    const cuenta = [0, 0, 0];
    for (const e of es) {
      const m = enCaso(e.datos.palabra, p.caso, "palabra"), l = e.datos.letra, s = sinTildes(m);
      palabraValida(m, p, { maxLetras: 9, largos: [2, 3, 4] });
      assert.ok(m.length >= 3);
      assert.equal(l, p.caso === "mayus" ? l.toUpperCase() : l.toLowerCase()); assert.equal(l.length, 1);
      const x = l.toLowerCase(); assert.ok(!"hkwxyq".includes(x), `letra «${x}»`);
      assert.equal([...s].filter((c) => c === x).length, 1, "la letra sale más de una vez");
      const i = s.indexOf(x), us = unidades(m); let k = 0, u1 = null;
      for (const u of us) { if (i >= k && i < k + u.length) u1 = u; k += u.length; }
      assert.equal(u1.length, 1, "la letra forma parte de un dígrafo");
      const marca = i === 0 ? 0 : i === m.length - 1 ? 2 : 1;
      assert.deepEqual(e.solucion, { huecos: [], marca }); cuenta[marca]++;
    }
    assert.ok(Math.max(...cuenta) - Math.min(...cuenta) <= 1, `posiciones sin repartir: ${cuenta}`);
  },

  "fono.rimas"(act, tam) {
    const es = act.ejercicios, p = act.params, np = p.parejas ?? 5, modo = p.rima === "vocal" ? "vocal" : "silaba";
    assert.equal(tam, "completa"); cuantos(es, np);
    const izq = es.map((e) => enCaso(e.datos.izq, p.caso, "palabra")), der = es.map((e) => enCaso(e.datos.derecha, p.caso, "palabra"));
    const todas = [...izq, ...der]; assert.equal(new Set(todas).size, todas.length, "palabras repetidas");
    for (const m of todas) { palabraValida(m, p, { maxLetras: 8, largos: [1, 2, 3] }); assert.ok(rima(m, modo).length >= 2, `rima corta en «${m}»`); }
    assert.equal(new Set(es.map((e) => e.solucion.une)).size, np, "dos líneas a la misma palabra");
    for (const [i, e] of es.entries()) {
      assert.deepEqual(e.solucion.huecos, []);
      for (let j = 0; j < np; j++) assert.equal(riman(izq[i], der[j], modo), j === e.solucion.une, `«${izq[i]}» – «${der[j]}»: ${j === e.solucion.une ? "no riman" : "riman sin ser la pareja"}`);
      for (let j = 0; j < np; j++) if (j !== i) assert.ok(!riman(izq[i], izq[j], modo) && !riman(izq[i], izq[j], modo === "vocal" ? "silaba" : "vocal"), "dos palabras de la misma columna riman");
      for (let j = 0; j < np; j++) if (j !== e.solucion.une) assert.ok(rima(izq[i], "silaba") !== rima(der[j], "silaba") && rima(izq[i], "vocal") !== rima(der[j], "vocal"), `«${izq[i]}» y «${der[j]}» riman de otro modo`);
    }
    assert.notDeepEqual(es.map((e) => e.solucion.une), es.map((_, i) => i), "columna derecha sin mezclar");
  },

  "fono.quita"(act, tam) {
    const es = act.ejercicios, p = act.params;
    cuantos(es, N(tam, 8));
    unicos(es, (e) => e.datos.silabas.join("").toLowerCase(), "palabras repetidas");
    let primeras = 0;
    for (const e of es) {
      const ss = e.datos.silabas, m = enCaso(ss.join(""), p.caso, "palabra"), real = silabas(m), k = e.datos.k;
      palabraValida(m, p, { maxLetras: 10, largos: [2, 3, 4] });
      assert.deepEqual(ss.map((s) => s.toLowerCase()), real, "sílabas ≠ silabeo");
      assert.ok(k === 0 || k === ss.length - 1);
      if (p.quitar === "ultima") assert.equal(k, ss.length - 1); else if (p.quitar !== "mezcla") assert.equal(k, 0);
      if (k === 0) primeras++;
      const queda = ss.filter((_, j) => j !== k).join("");
      assert.deepEqual(e.solucion.huecos, [queda]);
      assert.ok(real[k].length >= 2 && queda.length >= 2 && real[k] !== queda.toLowerCase());
    }
    if (p.quitar === "mezcla") assert.equal(primeras, es.length / 2, "mezcla: no hay mitad y mitad");
  },

  "fono.larga"(act, tam) {
    const es = act.ejercicios, p = act.params;
    cuantos(es, N(tam, 10));
    const todas = es.flatMap((e) => e.datos.palabras.map((w) => w.toLowerCase())); assert.equal(new Set(todas).size, todas.length, "palabras repetidas");
    const sitios = new Set();
    for (const e of es) {
      assert.equal(e.datos.palabras.length, 3);
      const ms = e.datos.palabras.map((w) => enCaso(w, p.caso, "palabra")), cs = ms.map((m) => silabas(m).length);
      ms.forEach((m) => palabraValida(m, p, { maxLetras: 9, largos: [1, 2, 3, 4] }));
      assert.equal(new Set(cs).size, 3, "dos palabras con las mismas sílabas");
      const cual = p.cual === "menos" ? "menos" : p.cual === "mezcla" ? e.datos.cual : "mas";
      assert.equal(e.datos.cual, cual); if (p.cual === "mezcla") assert.ok(cual === "mas" || cual === "menos");
      assert.deepEqual(e.solucion, { huecos: [], rodea: cs.indexOf(cual === "mas" ? Math.max(...cs) : Math.min(...cs)) });
      sitios.add(e.solucion.rodea);
    }
    if (tam === "completa") assert.ok(sitios.size > 1, "la correcta siempre en el mismo sitio");
    if (p.cual === "mezcla") assert.ok(Math.abs(es.filter((e) => e.datos.cual === "mas").length - es.length / 2) <= 0.5, "mezcla: no hay mitad y mitad");
  },
};
