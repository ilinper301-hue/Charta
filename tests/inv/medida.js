// Charta · invariantes de la familia «medida» (ver tests/invariantes.js).
import assert from "node:assert/strict";
import { ent, unicos, cuantos } from "./_ayuda.js";

const MIN = { punto: [0], media: [30], cuarto: [15, 45], todas: [0, 15, 30, 45] };
const horas = (act, tam) => {
  const es = act.ejercicios, ms = MIN[act.params.modo] || [0, 30];
  cuantos(es, tam === "media" ? 6 : 12);
  unicos(es, (e) => e.datos.h + ":" + e.datos.m, "horas repetidas");
  for (const { datos: { h, m } } of es) { ent(h, 1, 12, "h"); assert.ok(ms.includes(m), "minutos del modo"); }
  const n = ms.map((mm) => es.filter((e) => e.datos.m === mm).length);
  assert.ok(Math.max(...n) - Math.min(...n) <= 1, "grupos de minutos a partes iguales");
  const por = (mm) => es.filter((e) => e.datos.m === mm).map((e) => e.datos.h);
  for (const mm of ms) { const hs = por(mm); assert.equal(new Set(hs).size, hs.length, "horas repetidas en un grupo"); }
};
const permutacion = (v, n) => assert.deepEqual([...v].sort((a, b) => a - b), Array.from({ length: n }, (_, i) => i), "no es una permutación");

export default {
  "medida.reloj"(act, tam) {
    horas(act, tam);
    for (const { datos: { h, m }, solucion } of act.ejercicios) assert.deepEqual(solucion.huecos, [h, String(m).padStart(2, "0")]);
  },

  "medida.reloj2"(act, tam) {
    horas(act, tam);
    for (const { solucion } of act.ejercicios) assert.deepEqual(solucion.huecos, []);
  },

  "medida.dinero"(act, tam) {
    const R = act.params.rango ?? 20, cent = act.params.modo === "centimos", cap = cent ? Math.min(R, 99) : R > 100 ? R : Math.min(R, 50);
    cuantos(act.ejercicios, tam === "media" ? 4 : 8);
    unicos(act.ejercicios, (e) => e.solucion.huecos[0], "totales repetidos");
    const permitidos = cent ? ["m1", "m2", "m5", "m10", "m20", "m50"] : ["m1", "m2", ...(R > 100 ? [5, 10, 20, 50, 100] : [5, 10, 20]).filter((v) => v <= cap).map((v) => "b" + v)];
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
    const R = act.params.rango ?? 20, dos = R > 20, cap = dos ? R : Math.min(R, 20), cambio = act.params.modo === "cambio", tope = dos ? 60 : 12;
    cuantos(act.ejercicios, tam === "media" ? 4 : 10);
    for (const { datos: d, solucion } of act.ejercicios) {
      if (cambio) {
        assert.ok((dos ? [20, 50, 100] : [5, 10, 20]).includes(d.pago) && d.pago <= cap, "billete");
        ent(d.precio, 1, d.pago - 1, "precio");
        assert.deepEqual(solucion.huecos, [d.pago - d.precio]); ent(d.pago - d.precio, 1, cap - 1, "vuelta");
      } else {
        assert.notEqual(d.a[0], d.b[0], "productos distintos");
        ent(d.a[1], 1, tope, "pa"); ent(d.b[1], 1, tope, "pb");
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
    const es = act.ejercicios, modo = act.params.modo;
    if (modo === "equivalencias") {
      cuantos(es, tam === "media" ? 6 : 12);
      unicos(es, (e) => e.datos.a.join(" ") + e.datos.b, "equivalencias repetidas");
      const MIN = { minuto: 1, hora: 60, día: 1440, semana: 10080, mes: 1, año: 12 }, uno = (u) => u.replace(/(es|s)$/, "").replace("dia", "día");
      for (const { datos: { tipo, a, b }, solucion: { huecos: [n] } } of es) {
        assert.equal(tipo, "equiv");
        const ua = uno(a[1]) === "mese" ? "mes" : uno(a[1]), ub = uno(b) === "mese" ? "mes" : uno(b), na = a[0] === "media" ? 0.5 : a[0];
        assert.ok(ua in MIN && ub in MIN, `unidades ${ua} ${ub}`);
        assert.equal(na * MIN[ua], n * MIN[ub], `${a.join(" ")} = ${n} ${b}`);
        assert.equal(b.endsWith("s") , n !== 1, "plural de la unidad");
      }
      if (tam !== "media") for (const u of ["hora", "día", "semana", "año"]) assert.ok(es.some((e) => e.datos.a.join(" ") === "1 " + u), `falta 1 ${u}`);
      return;
    }
    if (modo === "horas") {
      cuantos(es, tam === "media" ? 4 : 8);
      unicos(es, (e) => e.datos.h * 100 + e.datos.m, "horas de partida repetidas");
      assert.equal(es.filter((e) => e.datos.dentro).length, es.length / 2, "mitad «dentro de»");
      for (const { datos: { h, m, k, dentro }, solucion } of es) {
        ent(h, 1, 12, "h"); assert.ok(m === 0 || m === 30); ent(k, 1, 3, "k");
        const h2 = dentro ? h + k : h - k; ent(h2, 1, 12, "sin pasar de las 12");
        assert.deepEqual(solucion.huecos, [h2, m ? "30" : "00"]);
      }
      return;
    }
    if (modo === "meses") {
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
