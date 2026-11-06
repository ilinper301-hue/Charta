// Charta · invariantes de la familia «escritura» (Lengua 1.º, bloque 8; ver tests/invariantes.js).
// Todo lo que escribe el alumno (modelos, palabras, frases, comienzos) tiene letra de trazo y cabe en una línea de la pauta; el nº de renglones de cada ficha
// cabe en el panel (tabla conservadora filasDe) y llena la página; no hay repeticiones; se respetan las opciones; la lista del dictado va solo en `solucion`
// (y no sale en el SVG del papel, sí en el de la solución); la corrección de los demás tipos está vacía.
import assert from "node:assert/strict";
import { unicos, cuantos } from "./_ayuda.js";
import { enCaso, palabraValida, PALABRAS } from "./_lengua.js";
import { analiza } from "./frase.js";
import { llevaLetra, sinTildes } from "../../src/lengua/reglas.js";
import { hayTrazo, trazoACurvas } from "../../src/lengua/trazos.js";
import { frasePorId } from "../../src/tipos/_frase.js";
import { FAMILIAS_TRAZO, filasDe, cabeEnLinea, CAP_MM, ETIQUETA_MM } from "../../src/tipos/_escritura.js";
import { renglonesDictado } from "../../src/tipos/escritura.dictado.js";
import { TEMAS } from "../../src/tipos/escritura.libre.js";
import { textoLetra } from "../../src/tipos/escritura.letra.js";
import { render } from "../../src/render/actividad.js";

const mmDe = (a) => a.params.pauta ?? 5;
const sinCorreccion = (es) => es.forEach((e) => assert.deepEqual(e.solucion.huecos, [], "este tipo no tiene corrección"));
const trazable = (t, q = "texto") => assert.ok([...t].every(hayTrazo), `${q}: «${t}» tiene un carácter sin letra de trazo`);
const palabrasDe = (f) => f.toLowerCase().replace(/\.$/, "").split(" ");
/** Renglones totales de los bloques: caben en el panel (filasDe) y llenan la página. */
function renglonesOk(a, tam, guiadas, libres) {
  const total = a.ejercicios.reduce((t, e, i) => t + guiadas(e, i) + e.datos.libres, 0), N = filasDe(tam, mmDe(a));
  a.ejercicios.forEach((e) => assert.ok(Number.isInteger(e.datos.libres) && e.datos.libres >= 1, "no queda ningún renglón libre"));
  assert.ok(total <= N, `${total} renglones no caben (máximo ${N})`);
  assert.equal(total, N, "la página no se llena");
}
/** Puntos (muestreados) de un trazo, para comprobar que no se sale de la pauta. */
function muestras(cmds) {
  const pts = []; let q = null;
  for (const [k, ...v] of cmds) {
    if (k === "C") for (let t = 0.1; t <= 1.0001; t += 0.1) {
      const u = 1 - t, b = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t], P = [q, [v[0], v[1]], [v[2], v[3]], [v[4], v[5]]];
      pts.push([0, 1].map((i) => b.reduce((s, bb, j) => s + bb * P[j][i], 0)));
    }
    q = [v.at(-2), v.at(-1)]; pts.push(q);
  }
  return pts;
}
let patronesVistos = false;
function comprobarPatrones() {
  if (patronesVistos) return; patronesVistos = true;
  for (const [f, { variantes }] of Object.entries(FAMILIAS_TRAZO)) {
    assert.ok(variantes.length >= 4, `${f}: menos de 4 variantes`);
    for (const [id, , patron] of variantes) {
      assert.ok(patron.paso > 0.5 && patron.paso < 4, `${f}.${id}: paso raro`);
      const trazos = patron.hacer(0, 4);
      assert.ok(trazos.length >= 1, `${f}.${id}: sin trazos`);
      for (const tr of trazos) for (const [, y] of muestras(trazoACurvas(tr).cmds)) assert.ok(y >= -0.8 - 1e-6 && y <= 1.8 + 1e-6, `${f}.${id}: se sale de la pauta (y = ${y})`);
      // las celdas siguen donde acabó la anterior: hacer(0, 4) = hacer(0, 2) + hacer(2, 4) en el mismo punto
      const x1 = Math.max(...trazos.flatMap((tr) => muestras(trazoACurvas(tr).cmds).map((q) => q[0])));
      assert.ok(x1 >= 3 * patron.paso * 0.7 && x1 <= 4 * patron.paso + 1, `${f}.${id}: 4 celdas miden ${x1}`);
    }
  }
}

export default {
  "escritura.trazos"(act, tam) {
    comprobarPatrones();
    const es = act.ejercicios, t = act.params.trazo;
    cuantos(es, tam === "media" ? 2 : 4);
    unicos(es, (e) => e.datos.familia + "." + e.datos.variante, "trazos repetidos");
    if (t) assert.ok(es.every((e) => e.datos.familia === t), "no son todos de la familia pedida");
    else unicos(es, (e) => e.datos.familia, "con «variados» cada bloque es de una familia distinta");
    for (const { datos: d } of es) {
      const v = FAMILIAS_TRAZO[d.familia]?.variantes.find((x) => x[0] === d.variante);
      assert.ok(v, `trazo desconocido ${d.familia}.${d.variante}`); assert.equal(d.nombre, v[1]);
    }
    sinCorreccion(es); renglonesOk(act, tam, () => 2);
  },

  "escritura.letra"(act, tam) {
    const es = act.ejercicios, p = act.params, caso = p.caso || null, N = filasDe(tam, mmDe(act)), pedidas = p.filas ?? 2;
    const B = es.length;
    for (const { datos: d } of es) {
      assert.match(d.letra, /^[a-zñ]$/); assert.equal(d.texto, textoLetra(d.letra, caso)); trazable(d.texto, "modelo");
      assert.ok(["sueltas", "juntas"].includes(d.forma));
      assert.ok(d.repaso >= 0 && d.repaso <= pedidas, "más repaso del pedido");
    }
    if (p.letra === "palabra") {
      cuantos(es, tam === "media" ? 2 : 4);
      const pal = act.enunciado.match(/«(.+?)»/)[1];
      assert.ok(PALABRAS.has(pal), `«${pal}» no está en el léxico`);
      assert.deepEqual(es.map((e) => e.datos.letra), [...new Set([...sinTildes(pal)])].slice(0, B), "las letras no son las de la palabra");
      unicos(es, (e) => e.datos.letra, "letras repetidas");
    } else {
      cuantos(es, tam === "media" ? 1 : 2);
      if (p.letra) assert.ok(es.every((e) => e.datos.letra === p.letra), "no es la letra pedida");
      unicos(es, (e) => e.datos.forma, "bloques repetidos");
    }
    assert.ok(es.every((e) => e.datos.repaso === Math.min(pedidas, Math.floor(N / B) - 2)), "filas de repaso: ni las pedidas ni las que caben");
    if (p.letra !== "palabra") assert.ok(es.every((e) => e.datos.repaso === pedidas), "no se respetan las filas de repaso");
    sinCorreccion(es); renglonesOk(act, tam, (e) => 1 + e.datos.repaso);
    assert.ok(es.every((e) => e.datos.libres >= 1));
  },

  "escritura.palabras"(act, tam) {
    const es = act.ejercicios, p = act.params;
    cuantos(es, tam === "media" ? 2 : 4);
    unicos(es, (e) => e.datos.palabra, "palabras repetidas");
    for (const { datos: d } of es) {
      const m = enCaso(d.palabra, p.caso, "palabra");
      palabraValida(m, { ...p, largo: null }, { largos: [1, 2, 3] }); trazable(d.palabra, "palabra");
      if (p.letra) assert.ok(llevaLetra(m, p.letra), `«${m}» no lleva la «${p.letra}»`);
      assert.ok(cabeEnLinea(d.palabra, tam, mmDe(act)), `«${d.palabra}» no cabe en una línea`);
    }
    sinCorreccion(es); renglonesOk(act, tam, () => 2);
  },

  "escritura.frase"(act, tam) {
    const es = act.ejercicios, p = act.params;
    cuantos(es, tam === "media" ? 2 : 4);
    unicos(es, (e) => e.datos.frase, "frases repetidas");
    for (const { datos: d } of es) {
      assert.match(d.frase, /^[A-ZÁÉÍÓÚÑ][a-záéíóúüñ ]+\.$/, "no es «Mayúscula… punto.»"); trazable(d.frase, "frase");
      const ws = palabrasDe(d.frase); analiza(ws); assert.ok(frasePorId(ws.join(" ")), `«${d.frase}» no es una frase del banco`);
      if (Number.isInteger(p.palabras)) assert.equal(ws.length, p.palabras, "palabras de la frase"); else assert.ok(ws.length >= 3 && ws.length <= 5);
      assert.ok(cabeEnLinea(d.frase, tam, mmDe(act)), `«${d.frase}» no cabe en una línea`);
    }
    sinCorreccion(es); renglonesOk(act, tam, () => 2);
  },

  "escritura.dictado"(act, tam) {
    const es = act.ejercicios, p = act.params, frases = p.modo === "frases", lista = es.map((e) => e.solucion.huecos[0]);
    cuantos(es, renglonesDictado(p, tam));
    assert.ok(es.length >= 3 && es.length <= 10);
    assert.ok(filasDe(tam, mmDe(act)) >= es.length, "los renglones no caben");
    es.forEach((e, i) => {
      assert.deepEqual(e.datos, { numero: i + 1, modo: frases ? "frases" : "palabras" }, "los datos solo llevan el número de renglón");
      assert.equal(e.solucion.huecos.length, 1); assert.equal(typeof lista[i], "string");
    });
    unicos(lista, (t) => t, "dictado repetido"); trazable(lista.join(" "), "dictado");
    for (const t of lista) {
      if (frases) { assert.match(t, /^[A-ZÁÉÍÓÚÑ][a-záéíóúüñ ]+\.$/); const ws = palabrasDe(t); analiza(ws); assert.ok(frasePorId(ws.join(" ")), `«${t}» no es del banco`); if (p.letra) assert.ok(llevaLetra(ws.join(""), p.letra), `«${t}» no lleva la «${p.letra}»`); }
      else { palabraValida(t, { ...p, largo: null, caso: null }, { largos: [1, 2, 3, 4] }); if (p.letra) assert.ok(llevaLetra(t, p.letra), `«${t}» no lleva la «${p.letra}»`); }
    }
    // la lista no se imprime: ni en los datos, ni en el SVG del papel; sí en el de la solución (una vez cada una, en rojo)
    const papel = render(act, "papel").svg, sol = render(act, "solucion").svg, esc = (t) => t.replace(/&/g, "&amp;");
    for (const t of lista) {
      assert.ok(!papel.includes(`>${esc(t)}</text>`), `«${t}» se imprime en el papel`);
      assert.equal(sol.split(`>${esc(t)}</text>`).length - 1, 1, `«${t}» no sale una vez en la solución`);
    }
  },

  "escritura.libre"(act, tam) {
    const es = act.ejercicios, p = act.params, tema = p.inicio === "tema", n = tam === "media" ? 2 : 4;
    cuantos(es, n);
    unicos(es, (e) => e.datos.pregunta, "preguntas repetidas");
    const total = Math.floor((CAP_MM[tam] - n * ETIQUETA_MM) / (3 * mmDe(act)) + 1e-9);
    assert.equal(es.reduce((t, e) => t + e.datos.filas, 0), total, "los renglones no llenan la página");
    for (const { datos: d, solucion: s } of es) {
      assert.ok(Number.isInteger(d.filas) && d.filas >= 2, "menos de 2 renglones"); assert.deepEqual(s, { huecos: [] }); assert.equal(typeof d.ejemplo, "string");
      if (tema) { assert.equal(d.inicio, null); assert.ok(TEMAS.some(([t, q, e]) => d.pregunta === `${t}: ${q}` && d.ejemplo === e), "tema desconocido"); }
      else {
        assert.match(d.inicio, /^(El|La|Los|Las) [a-záéíóúüñ]+$/); trazable(d.inicio, "inicio");
        assert.ok(d.ejemplo.startsWith(d.inicio + " "), "el ejemplo no empieza por el comienzo"); const ws = palabrasDe(d.ejemplo); analiza(ws);
        assert.ok(frasePorId(ws.join(" ")), "el ejemplo no es una frase del banco");
        assert.match(d.pregunta, /^¿Qué hacen? (el|la|los|las) [a-záéíóúüñ]+\?$/); assert.equal(/^Los|^Las/.test(d.inicio), /hacen/.test(d.pregunta), "hace / hacen");
      }
    }
  },
};
