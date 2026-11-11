// Charta · invariantes de la familia «geometria» (ver tests/invariantes.js).
import assert from "node:assert/strict";
import { cuantos, unicos } from "./_ayuda.js";

const FIGS = ["circulo", "cuadrado", "rectangulo", "triangulo"], NOMF = { circulo: "círculo", cuadrado: "cuadrado", rectangulo: "rectángulo", triangulo: "triángulo" };
const CUERPOS = ["esfera", "cubo", "cilindro", "cono", "piramide"], NOMC = { esfera: "esfera", cubo: "cubo", cilindro: "cilindro", cono: "cono", piramide: "pirámide" };

const sinHuecos = (e) => assert.deepEqual(e.solucion.huecos, [], "rodear/colorear: sin huecos escritos");
/** Opciones: 3 distintas que incluyen la correcta. */
const opciones = (e) => { assert.equal(e.datos.opciones.length, 3); assert.equal(new Set(e.datos.opciones).size, 3); assert.ok(e.datos.opciones.includes(e.solucion.correcta), "falta la correcta"); };
/** Cada clase aparece lo más repartida posible (ciclos completos de la lista). */
const repartido = (ks, lista) => {
  const c = lista.map((k) => ks.filter((x) => x === k).length), n = Math.floor(ks.length / lista.length);
  c.forEach((v) => assert.ok(v >= n && v <= n + 1, `clases mal repartidas: ${c}`));
};

export default {
  "geometria.figuras"(act, tam) {
    const es = act.ejercicios; cuantos(es, tam === "media" ? 6 : 12);
    for (const e of es) {
      assert.ok(FIGS.includes(e.datos.fig)); assert.ok([0, 1, 2, 3].includes(e.datos.var));
      sinHuecos(e); opciones(e); assert.equal(e.solucion.correcta, NOMF[e.datos.fig]);
    }
    if (tam === "completa") repartido(es.map((e) => e.datos.fig), FIGS);
  },
  "geometria.cuenta"(act, tam) {
    cuantos(act.ejercicios, 1);
    const { datos: { figuras }, solucion } = act.ejercicios[0];
    assert.equal(figuras.length, 30);
    const cnt = FIGS.map((k) => figuras.filter((f) => f.fig === k).length);
    assert.deepEqual(solucion.huecos, cnt);
    cnt.forEach((v) => assert.ok(v >= 4 && v <= 18, `cuenta ${v} fuera de 4..18`));
    assert.equal(cnt.reduce((a, b) => a + b), 30);
    for (const f of figuras) { assert.ok(Math.abs(f.dx) <= 7 && Math.abs(f.dy) <= 7); assert.ok(FIGS.includes(f.fig)); }
  },
  "geometria.cuerpos"(act, tam) {
    const es = act.ejercicios; cuantos(es, tam === "media" ? 6 : 12);
    for (const e of es) { assert.ok(CUERPOS.includes(e.datos.cuerpo)); sinHuecos(e); opciones(e); assert.equal(e.solucion.correcta, NOMC[e.datos.cuerpo]); }
    if (tam === "completa") repartido(es.map((e) => e.datos.cuerpo), CUERPOS);
  },
  "geometria.rueda"(act, tam) {
    const es = act.ejercicios; cuantos(es, tam === "media" ? 6 : 12);
    for (const e of es) {
      assert.ok(CUERPOS.includes(e.datos.cuerpo)); sinHuecos(e);
      assert.equal(e.solucion.correcta, ["esfera", "cilindro", "cono"].includes(e.datos.cuerpo) ? "rueda" : "no rueda");
    }
    if (tam === "completa") repartido(es.map((e) => e.datos.cuerpo), CUERPOS);
  },
  "geometria.lineas"(act, tam) {
    const es = act.ejercicios, cierre = act.params.modo === "cierre", tipos = cierre ? ["abierta", "cerrada"] : ["recta", "curva", "quebrada"];
    cuantos(es, tam === "media" ? 6 : 12);
    for (const e of es) {
      const d = e.datos; sinHuecos(e);
      assert.deepEqual(cierre ? d.tipos : [...d.tipos].sort(), cierre ? tipos : [...tipos].sort()); assert.equal(e.solucion.correcta, d.tipo); assert.ok(tipos.includes(d.tipo));
      if (d.tipo === "recta") assert.ok([0, 30, 45, 60, 90, 120, 150].includes(d.ang));
      if (d.tipo === "curva") assert.ok([0, 1].includes(d.v));
      if (d.tipo === "quebrada") assert.equal(d.ys.length, 5);
      if (d.tipo === "abierta" || d.tipo === "cerrada") assert.ok([0, 1, 2, 3].includes(d.v));
    }
    if (tam === "completa") repartido(es.map((e) => e.datos.tipo), tipos);
  },
  "geometria.posiciones"(act, tam) {
    const es = act.ejercicios, RELS = ["encima", "debajo", "a la izquierda", "a la derecha"];
    cuantos(es, tam === "media" ? 4 : 8);
    for (const e of es) {
      const { a, b, rel } = e.datos; sinHuecos(e);
      assert.ok(RELS.includes(rel)); assert.equal(e.solucion.correcta, rel);
      assert.ok(a !== b && ["círculo", "cuadrado"].includes(a) && ["círculo", "cuadrado"].includes(b), "un círculo y un cuadrado");
    }
    repartido(es.map((e) => e.datos.rel), RELS);
  },
  "geometria.simetria"(act, tam) {
    const es = act.ejercicios, hc = Math.max(3, Math.min(5, act.params.n ?? 4));
    cuantos(es, tam === "media" ? 4 : 8);
    for (const e of es) {
      sinHuecos(e); assert.equal(e.datos.hc, hc); assert.equal(e.datos.pat.length, 6);
      for (const f of e.datos.pat) assert.match(f, new RegExp(`^[X.]{${hc}}$`));
      assert.ok(e.datos.pat.join("").split("X").length - 1 >= 6, "menos de 6 cuadros pintados");
      assert.ok(e.datos.pat.filter((f) => f[hc - 1] === "X").length >= 2, "menos de 2 cuadros junto al eje");
    }
  },
  "geometria.copia"(act, tam) {
    const es = act.ejercicios; cuantos(es, 8);
    unicos(es, (e) => e.datos.forma, "dibujos repetidos");
    for (const e of es) {
      sinHuecos(e);
      for (const pl of e.datos.lin) { assert.ok(pl.length >= 2); for (const [x, y] of pl) assert.ok(Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x <= 5 && y >= 0 && y <= 5, "punto fuera de la rejilla 6×6"); }
    }
  },
};
