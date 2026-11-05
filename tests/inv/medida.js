// Charta · invariantes de la familia «medida» (ver tests/invariantes.js).
import assert from "node:assert/strict";
import { ent, unicos, cuantos } from "./_ayuda.js";

const horas = (act, tam, solo) => {
  const es = act.ejercicios, modo = act.params.modo;
  cuantos(es, tam === "media" ? 6 : 12);
  unicos(es, (e) => e.datos.h + ":" + e.datos.m, "horas repetidas");
  for (const { datos: { h, m } } of es) { ent(h, 1, 12, "h"); assert.ok(m === 0 || m === 30, "minutos"); }
  if (modo === "punto") assert.ok(es.every((e) => e.datos.m === 0), "punto: hay medias");
  if (modo === "media") assert.ok(es.every((e) => e.datos.m === 30), "media: hay en punto");
  if (!modo) assert.equal(es.filter((e) => e.datos.m === 0).length, es.length / 2, "mitad en punto y mitad y media");
  const por = (mm) => es.filter((e) => e.datos.m === mm).map((e) => e.datos.h);
  for (const hs of [por(0), por(30)]) assert.equal(new Set(hs).size, hs.length, "horas repetidas en un grupo");
};
const permutacion = (v, n) => assert.deepEqual([...v].sort((a, b) => a - b), Array.from({ length: n }, (_, i) => i), "no es una permutación");

export default {
  "medida.reloj"(act, tam) {
    horas(act, tam);
    for (const { datos: { h, m }, solucion } of act.ejercicios) assert.deepEqual(solucion.huecos, [h, m ? "30" : "00"]);
  },

  "medida.reloj2"(act, tam) {
    horas(act, tam);
    for (const { solucion } of act.ejercicios) assert.deepEqual(solucion.huecos, []);
  },

  "medida.dinero"(act, tam) {
    const R = act.params.rango ?? 20, cent = act.params.modo === "centimos", cap = cent ? Math.min(R, 99) : Math.min(R, 50);
    cuantos(act.ejercicios, tam === "media" ? 4 : 8);
    unicos(act.ejercicios, (e) => e.solucion.huecos[0], "totales repetidos");
    const permitidos = cent ? ["m1", "m2", "m5", "m10", "m20", "m50"] : ["m1", "m2", ...[5, 10, 20].filter((v) => v <= cap).map((v) => "b" + v)];
    for (const { datos: { u, items }, solucion } of act.ejercicios) {
      assert.equal(u, cent ? "c" : "€");
      ent(items.length, 2, 6, "nº de piezas");
      for (const [k, v] of items) assert.ok(permitidos.includes(k + v), `pieza ${k}${v} no permitida`);
      items.forEach(([, v], j) => { if (j) assert.ok(items[j - 1][1] >= v, "de mayor a menor"); });
      const tot = items.reduce((s, [, v]) => s + v, 0);
      assert.deepEqual(solucion.huecos, [tot]); ent(tot, 3, cap, "total");
    }
  },

  "medida.precios"(act, tam) {
    const R = act.params.rango ?? 20, cap = Math.min(R, 20), cambio = act.params.modo === "cambio";
    cuantos(act.ejercicios, tam === "media" ? 4 : 10);
    for (const { datos: d, solucion } of act.ejercicios) {
      if (cambio) {
        assert.ok([5, 10, 20].includes(d.pago) && d.pago <= cap, "billete");
        ent(d.precio, 1, d.pago - 1, "precio");
        assert.deepEqual(solucion.huecos, [d.pago - d.precio]); ent(d.pago - d.precio, 1, cap - 1, "vuelta");
      } else {
        assert.notEqual(d.a[0], d.b[0], "productos distintos");
        ent(d.a[1], 1, 12, "pa"); ent(d.b[1], 1, 12, "pb");
        assert.deepEqual(solucion.huecos, [d.a[1] + d.b[1]]); ent(d.a[1] + d.b[1], 2, cap, "total");
      }
    }
  },

  "medida.calendario"(act) {
    const es = act.ejercicios, n = act.params.n, d0 = es[0].datos;
    cuantos(es, 5);
    if (n) assert.equal(d0.mes, (n - 1) % 12, "mes pedido");
    assert.equal(d0.anio, d0.mes >= 8 ? 2026 : 2027);
    const f = new Date(Date.UTC(d0.anio, d0.mes, 1));
    assert.equal(d0.st, (f.getUTCDay() + 6) % 7, "primer día"); assert.equal(d0.nd, new Date(Date.UTC(d0.anio, d0.mes + 1, 0)).getUTCDate(), "días del mes");
    for (const e of es) assert.deepEqual([e.datos.mes, e.datos.anio, e.datos.st, e.datos.nd], [d0.mes, d0.anio, d0.st, d0.nd]);
    const num = (t) => Number(/del (\d+) es/.exec(t)[1]);
    const dias = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
    for (const { datos: { tipo, texto }, solucion } of es) {
      const [r] = solucion.huecos;
      if (tipo === "primero") { const k = dias.findIndex((x) => texto.includes("primer " + x)); assert.equal(r, 1 + ((k - d0.st + 7) % 7)); ent(r, 1, 7, "primero"); }
      if (tipo === "despues") { assert.equal(r, num(texto) + 1); ent(r, 4, d0.nd - 1, "después"); }
      if (tipo === "antes") { assert.equal(r, num(texto) - 1); ent(r, 2, d0.nd - 3, "antes"); }
      if (tipo === "semana") { assert.equal(r, num(texto) + 7); ent(r, 8, d0.nd, "semana"); }
      if (tipo === "cuantos") {
        const k = dias.findIndex((x) => texto.includes(x === "miércoles" ? "miércoles" : x.replace(/s?$/, "")));
        let c = 0; for (let d = 1; d <= d0.nd; d++) if ((d0.st + d - 1) % 7 === k) c++;
        assert.equal(r, c); ent(r, 4, 5, "cuántos");
      }
    }
    assert.deepEqual(es.map((e) => e.datos.tipo), ["primero", "despues", "antes", "cuantos", "semana"]);
  },

  "medida.tiempo"(act, tam) {
    const es = act.ejercicios;
    if (act.params.modo === "meses") {
      cuantos(es, tam === "media" ? 1 : 7);
      const o = es[0].datos;
      assert.equal(o.tipo, "orden"); permutacion(o.orden, 12);
      assert.deepEqual(es[0].solucion.huecos, o.orden.map((m) => m + 1));
      es.slice(1).forEach(({ datos: d, solucion }) => {
        assert.equal(d.tipo, "siguiente"); assert.equal(d.sig, (d.mes + 1) % 12);
        assert.equal(d.ops.length, 3); assert.equal(new Set(d.ops).size, 3, "opciones repetidas"); assert.ok(d.ops.includes(d.sig));
        assert.deepEqual(solucion.huecos, []);
      });
      unicos(es.slice(1), (e) => e.datos.mes, "meses repetidos");
    } else {
      cuantos(es, tam === "media" ? 3 : 6);
      for (const { datos: { orden }, solucion } of es) {
        permutacion(orden, 7);
        assert.ok(orden.some((d, k) => d !== k), "días ya ordenados");
        assert.deepEqual(solucion.huecos, orden.map((d) => d + 1));
      }
    }
  },

  "medida.longitud"(act, tam) {
    const compara = act.params.modo === "compara";
    cuantos(act.ejercicios, tam === "media" ? 3 : 6);
    unicos(act.ejercicios, (e) => e.datos.nombre, "objetos repetidos");
    for (const { datos: { barras }, solucion } of act.ejercicios) {
      assert.equal(barras.length, compara ? 2 : 1);
      for (const b of barras) ent(b, 2, 12, "cubitos");
      if (compara) { assert.notEqual(barras[0], barras[1], "barras iguales"); assert.deepEqual(solucion.huecos, []); }
      else assert.deepEqual(solucion.huecos, [barras[0]]);
    }
  },

  "medida.capacidad"(act, tam) {
    cuantos(act.ejercicios, tam === "media" ? 4 : 8);
    act.ejercicios.forEach(({ datos: { niv, asc }, solucion }, i) => {
      assert.equal(asc, i % 2 === 0, "alterna el orden");
      assert.equal(niv.length, 3); assert.equal(new Set(niv).size, 3, "niveles repetidos");
      for (const v of niv) ent(v, 1, 5, "nivel");
      const orden = [...niv].sort((a, b) => (asc ? a - b : b - a));
      assert.deepEqual(solucion.huecos, niv.map((v) => orden.indexOf(v) + 1));
      permutacion(solucion.huecos.map((v) => v - 1), 3);
    });
  },
};
