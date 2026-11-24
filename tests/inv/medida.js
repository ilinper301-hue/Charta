// Charta · invariantes de la familia «medida» (ver tests/invariantes.js).
import assert from "node:assert/strict";
import { ent, unicos, cuantos } from "./_ayuda.js";
import { UNIDADES } from "../../src/tipos/medida.longitud.js";

import { banco } from "../../src/tipos/medida.equivale.js";
import { UNIDADES_3 } from "../../src/tipos/medida.unidad.js";

// 3.º · lote 6. Equivalencias escritas aquí a mano (independientes de PARES): unidad → [unidad menor, cuántas caben].
const FACTOR = { km: ["m", 1000], m: ["cm", 100], cm: ["mm", 10], kg: ["g", 1000], l: ["ml", 1000] };
const MAG = { km: "longitud", m: "longitud", cm: "longitud", mm: "longitud", kg: "masa", g: "masa", l: "capacidad", ml: "capacidad" };
const FRACCION = { "½": 0.5, "¼": 0.25, "¾": 0.75 };
const entre = (n, lo, hi, q) => assert.ok(n >= lo && n <= hi, `${q}: ${n} fuera de ${lo}..${hi}`);
const hm = (h, m) => h * 60 + m;

const MIN = { punto: [0], media: [30], cuarto: [15, 45], todas: [0, 15, 30, 45] };
const horas = (act, tam) => {
  const es = act.ejercicios, modo = act.params.modo, ms = MIN[modo] || [0, 30];
  cuantos(es, tam === "media" ? 6 : 12);
  if (modo === "cinco" || modo === "minuto") {   // 3.º (lote 6): minutos distintos en cada reloj
    unicos(es, (e) => e.datos.m, "minutos repetidos");
    for (const { datos: { h, m } } of es) {
      ent(h, 1, 12, "h"); ent(m, modo === "cinco" ? 0 : 1, 59, "m");
      assert.equal(m % 5 === 0, modo === "cinco", "minutos de 5 en 5 / de 1 en 1");
    }
    if (modo === "cinco" && es.length === 12) unicos(es, (e) => e.datos.h, "horas repetidas");
    return;
  }
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
    if (act.params.modo === "mixto") {   // 3.º (lote 6): euros y céntimos juntos
      const R = act.params.rango ?? 20, cap = Math.min(R, 10) * 100, VAL = { "€": [1, 2], c: [5, 10, 20, 50] };
      cuantos(act.ejercicios, tam === "media" ? 4 : 8);
      unicos(act.ejercicios, (e) => e.solucion.huecos[0], "totales repetidos");
      for (const { datos: { u, items }, solucion: { huecos } } of act.ejercicios) {
        assert.equal(u, "m"); ent(items.length, 3, 6, "nº de piezas");
        let tot = 0, e = 0, c = 0;
        items.forEach(([k, v, un], j) => {
          assert.equal(k, "m"); assert.ok(VAL[un]?.includes(v), `moneda ${v} ${un}`);
          const cent = un === "€" ? v * 100 : v; tot += cent; un === "€" ? e++ : c++;
          if (j) assert.ok(items[j - 1][2] === "€" ? (un === "€" ? items[j - 1][1] >= v : true) : (un === "c" && items[j - 1][1] >= v), "de mayor a menor");
        });
        assert.ok(e >= 1 && c >= 1, "euros y céntimos"); assert.ok(tot % 100 !== 0 && tot >= 150 && tot <= cap, `total ${tot}`);
        assert.deepEqual(huecos, [`${Math.floor(tot / 100)},${String(tot % 100).padStart(2, "0")}`]);
      }
      return;
    }
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
    if (act.params.centimos) {   // 3.º (lote 6): precios con céntimos (en céntimos, múltiplos de 5)
      const R = act.params.rango ?? 20, cap = Math.min(R, 20) * 100, cambio = act.params.modo === "cambio", fmt = (c) => `${Math.floor(c / 100)},${String(c % 100).padStart(2, "0")}`;
      cuantos(act.ejercicios, tam === "media" ? 4 : 10);
      unicos(act.ejercicios, (e) => e.solucion.huecos[0], "resultados repetidos");
      for (const { datos: d, solucion: { huecos } } of act.ejercicios) {
        assert.equal(d.c, true);
        if (cambio) {
          assert.ok([5, 10, 20].includes(d.pago) && d.pago * 100 <= cap, "billete");
          assert.ok(d.precio % 5 === 0 && d.precio % 100 !== 0 && d.precio < d.pago * 100 && d.precio >= 40, "precio");
          assert.deepEqual(huecos, [fmt(d.pago * 100 - d.precio)]);
        } else {
          assert.notEqual(d.a[0], d.b[0], "productos distintos");
          for (const pr of [d.a[1], d.b[1]]) assert.ok(pr % 5 === 0 && pr >= 40 && pr <= 1500, "precio");
          assert.ok(d.a[1] % 100 !== 0 || d.b[1] % 100 !== 0, "algún precio con céntimos");
          assert.ok(d.a[1] + d.b[1] <= cap, "total"); assert.deepEqual(huecos, [fmt(d.a[1] + d.b[1])]);
        }
      }
      return;
    }
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


  "medida.equivale"(act, tam) {
    const es = act.ejercicios, mag = act.params.magnitud ?? null, modo = act.params.modo ?? null;
    const hay = (mag ? [mag] : ["longitud", "masa", "capacidad"]).flatMap(banco).filter((e) => !modo || e.sentido === modo).length;   // sin repetir, no hay más que los del banco
    assert.ok(es.length >= Math.min(tam === "media" ? 6 : 12, Math.floor(hay / 2) * 2) && es.length % 2 === 0, `ejercicios: ${es.length}`);
    unicos(es, (e) => e.datos.a.join(" ") + ">" + e.datos.b, "ejercicio repetido");
    for (const { datos: { a: [n, u], b, mag: m }, solucion: { huecos } } of es) {
      assert.equal(huecos.length, 1); assert.equal(m, MAG[u]); assert.equal(MAG[b], m, "misma magnitud");
      if (mag) assert.equal(m, mag, "magnitud pedida");
      const v = FRACCION[n] ?? Number(n);
      const [menor, k] = FACTOR[u] ?? [null, null];
      if (menor === b) {   // grande → pequeña: n × k
        assert.equal(huecos[0], v * k, `${n} ${u} = ${huecos[0]} ${b}`);
        if (modo === "menor") assert.fail("sentido distinto del pedido");
      } else {             // pequeña → grande: n ÷ k
        const [m2, k2] = FACTOR[b]; assert.equal(m2, u, "unidades no encajan");
        assert.equal(huecos[0] * k2, v, `${n} ${u} = ${huecos[0]} ${b}`);
        assert.ok(Number.isInteger(huecos[0]), "solución entera");
        if (modo === "mayor") assert.fail("sentido distinto del pedido");
      }
      assert.ok(Number.isInteger(huecos[0]) && huecos[0] >= 1, "solución");
      if (n in FRACCION) { assert.ok(u === "kg" || u === "l", "fracciones solo de kg y l"); assert.ok([250, 500, 750].includes(huecos[0])); }
    }
    if (!mag && es.length >= 12) assert.equal(new Set(es.map((e) => e.datos.mag)).size, 3, "las tres magnitudes");
  },

  "medida.unidad"(act, tam) {
    const es = act.ejercicios, mag = act.params.magnitud ?? null;
    assert.ok(es.length >= (tam === "media" ? 6 : 12) && es.length % 2 === 0, `ejercicios: ${es.length}`);
    unicos(es, (e) => e.datos.objeto, "objeto repetido");
    const veces = {};
    for (const { datos: { objeto, unidades, mag: m }, solucion: { huecos, unidad } } of es) {
      assert.deepEqual(huecos, []); assert.ok(unidades.includes(unidad), "la unidad correcta está entre las opciones");
      assert.deepEqual(unidades, Object.keys(UNIDADES_3[m]));
      assert.ok(UNIDADES_3[m][unidad].includes(objeto), `${objeto} no mide en ${unidad}`);
      if (mag) assert.equal(m, mag);
      veces[unidad] = (veces[unidad] ?? 0) + 1;
    }
    const mags = mag ? [mag] : ["longitud", "masa", "capacidad"], us = mags.flatMap((m) => Object.keys(UNIDADES_3[m]));
    if (es.length >= us.length) assert.deepEqual(Object.keys(veces).sort(), us.slice().sort(), "todas las unidades salen");
    else for (const u of Object.keys(veces)) assert.ok(us.includes(u));
    assert.ok(Math.max(...Object.values(veces)) - Math.min(...Object.values(veces)) <= 1, "unidades repartidas por turnos");
  },

  "medida.duracion"(act, tam) {
    const es = act.ejercicios, paso = act.params.paso ?? 5, tarea = act.params.tarea ?? null;
    assert.ok(es.length >= (tam === "media" ? 4 : 8), `ejercicios: ${es.length}`);
    unicos(es, (e) => `${e.datos.h}:${e.datos.m}:${e.datos.d}`, "duración repetida");
    for (const [i, { datos: { h, m, d, tarea: t }, solucion: { huecos } }] of es.entries()) {
      ent(h, 1, 10, "h"); assert.ok(m % paso === 0 && m < 60, "minutos de inicio"); assert.ok(d % paso === 0, "duración"); entre(d, 15, 235, "duración");
      const fin = hm(h, m) + d; assert.ok(fin <= hm(11, 59), "sin pasar de las 11:59");
      assert.equal(t, tarea === "mezcla" ? (i % 2 ? "fin" : "dura") : (tarea ?? "dura"));
      if (t === "dura") assert.deepEqual(huecos, [Math.floor(d / 60), d % 60]);
      else assert.deepEqual(huecos, [Math.floor(fin / 60), String(fin % 60).padStart(2, "0")]);
    }
    assert.ok(es.filter((e) => e.datos.d % 60 !== 0).length >= es.length / 2, "al menos la mitad con minutos");
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
    if (act.params.modo === "regla") {
      cuantos(act.ejercicios, tam === "media" ? 3 : 6);
      unicos(act.ejercicios, (e) => e.datos.nombre, "objetos repetidos");
      unicos(act.ejercicios, (e) => e.datos.cm, "longitudes repetidas");
      for (const { datos: { cm }, solucion } of act.ejercicios) { ent(cm, 2, 10, "cm"); assert.deepEqual(solucion.huecos, [cm]); }
      return;
    }
    if (act.params.modo === "mcm") {
      const es = act.ejercicios, n = tam === "media" ? 6 : 12;
      cuantos(es, n);
      unicos(es, (e) => e.datos.objeto, "objetos repetidos");
      for (const { datos: { objeto }, solucion } of es) {
        assert.ok(UNIDADES[solucion.unidad]?.includes(objeto), `unidad de «${objeto}»`);
        assert.deepEqual(solucion.huecos, []);
      }
      const nm = es.filter((e) => e.solucion.unidad === "m").length;
      assert.ok(nm >= Math.floor(n * 0.4) && nm <= Math.ceil(n * 0.6), "m y cm equilibrados");
      return;
    }
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

  "medida.euros"(act, tam) {
    const R = act.params.rango ?? 200, den = R > 100 ? [100, 50, 20, 10, 5, 2, 1] : [50, 20, 10, 5, 2, 1], tope = R > 100 ? R : 99;
    cuantos(act.ejercicios, tam === "media" ? 3 : 6);
    unicos(act.ejercicios, (e) => e.datos.total, "pagos repetidos");
    for (const { datos: d, solucion } of act.ejercicios) {
      assert.deepEqual(d.den, den); ent(d.total, 11, tope, "total");
      assert.equal(solucion.huecos.length, den.length);
      assert.equal(solucion.huecos.reduce((s, n, j) => s + n * den[j], 0), d.total, "las piezas suman el pago");
      // mínimo de verdad: programación dinámica sobre las piezas disponibles
      const minimo = Array(d.total + 1).fill(Infinity); minimo[0] = 0;
      for (let t = 1; t <= d.total; t++) for (const v of den) if (v <= t) minimo[t] = Math.min(minimo[t], minimo[t - v] + 1);
      const n = solucion.huecos;
      assert.equal(n.reduce((s, v) => s + v, 0), minimo[d.total], "no es el menor número de piezas");
      assert.ok(n.reduce((s, v) => s + v, 0) >= 3 && n.filter((v) => v).length >= 2);
    }
  },

  "medida.masa"(act, tam) {
    cuantos(act.ejercicios, tam === "media" ? 4 : 8);
    unicos(act.ejercicios, (e) => [...e.datos.izq, ...e.datos.der].join(), "balanzas repetidas");
    let iguales = 0;
    for (const { datos: { izq, der }, solucion } of act.ejercicios) {
      for (const [k, m] of [izq, der]) { ent(k, 0, 3, "pesas de 1 kg"); ent(m, 0, 3, "pesas de ½ kg"); ent(k + m, 1, 4, "pesas por plato"); }
      const a = 2 * izq[0] + izq[1], b = 2 * der[0] + der[1];
      assert.deepEqual(solucion.huecos, [a < b ? "<" : a > b ? ">" : "="]);
      if (a === b) { iguales++; assert.notEqual(izq[0], der[0], "equilibrio con las mismas pesas"); }
    }
    assert.ok(iguales >= Math.floor(act.ejercicios.length / 3), "equilibradas");
  },
};
