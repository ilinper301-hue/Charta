// Charta · invariantes de la familia «orden» (ver tests/invariantes.js).
import assert from "node:assert/strict";
import { ent, unicos, cuantos } from "./_ayuda.js";

const rango = (act) => act.params.rango ?? 10;
/** Una decena: todos los números dentro de la misma decena (a partir del rango 20). */
const decena = (vs) => Math.floor(Math.min(...vs) / 10) === Math.floor(Math.max(...vs) / 10);
const ordena = (desc) => (act, tam) => {
  const R = rango(act), n = Math.max(3, Math.min(5, act.params.n || 4));
  cuantos(act.ejercicios, tam === "media" ? 3 : 6);
  for (const { datos: { valores, desc: d }, solucion } of act.ejercicios) {
    assert.equal(d, desc);
    assert.equal(valores.length, n, "números por grupo");
    valores.forEach((v) => ent(v, 1, R, "número"));
    unicos(valores, (v) => v, "números repetidos");
    assert.deepEqual(solucion.huecos, valores.slice().sort((a, b) => desc ? b - a : a - b));
    assert.notDeepEqual(valores, solucion.huecos, "ya venía ordenado");
    if (act.params.cerca && R >= 20) assert.ok(decena(valores), "cerca: no son de la misma decena");
  }
};

// Redondeo escrito a mano, sin importar de orden.redondea.js: se mira la cifra que se pierde.
const redond = (n, u) => { const r = n % u; return n - r + (r >= u / 2 ? u : 0); };

export default {
  "orden.redondea"(act, tam) {
    const R = act.params.rango, es = act.ejercicios, us = act.params.a ? [act.params.a] : ["decena", "centena", "millar"], U = { decena: 10, centena: 100, millar: 1000 };
    cuantos(es, tam === "media" ? 6 : 15); unicos(es, (e) => e.datos.n, "números repetidos");
    for (const { datos: { n, u }, solucion } of es) {
      assert.ok(us.includes(u), "unidad no pedida"); ent(n, 1000, R, "n"); assert.notEqual(n % U[u], 0, "ya está redondeado");
      assert.deepEqual(solucion.huecos, [redond(n, U[u])]); ent(solucion.huecos[0], 1000, 9999, "redondeado");
    }
    for (const u of us) {   // reparto: igual de cada unidad (±1) y, dentro de cada una, igual de subir que de bajar (±1)
      const e = es.filter((x) => x.datos.u === u), sube = e.filter((x) => x.datos.n % U[u] >= U[u] / 2).length;
      assert.ok(Math.abs(e.length - es.length / us.length) < 1, `reparto de ${u}`); assert.ok(Math.abs(sube - (e.length - sube)) <= 1, `subir y bajar en ${u}`);
    }
  },
  "orden.estima"(act, tam) {
    const R = act.params.rango, es = act.ejercicios, u = act.params.a === "centena" ? 100 : 1000, op = act.params.op;
    cuantos(es, tam === "media" ? 6 : 12); unicos(es, (e) => e.datos.a + "," + e.datos.b, "parejas repetidas");
    for (const { datos: { a, b, op: o, u: nu, ra, rb }, solucion } of es) {
      assert.equal(nu, u === 100 ? "centena" : "millar"); ent(a, 1000, R, "a"); ent(b, 1000, R, "b");
      assert.notEqual(a % u, 0); assert.notEqual(b % u, 0); assert.equal(ra, redond(a, u)); assert.equal(rb, redond(b, u)); ent(ra, 1000, 9999, "ra"); ent(rb, 1000, 9999, "rb");
      if (o === "+") { assert.ok(a + b <= R, "suma fuera del rango"); assert.deepEqual(solucion.huecos, [ra, rb, ra + rb]); ent(ra + rb, 2000, 9999, "resultado"); }
      else { assert.equal(o, "-"); assert.ok(a > b && ra > rb, "resta"); assert.deepEqual(solucion.huecos, [ra, rb, ra - rb]); }
      assert.ok(op === "suma" ? o === "+" : op === "resta" ? o === "-" : true, "operación no pedida");
    }
    if (!op) assert.equal(es.filter((e) => e.datos.op === "-").length, es.length / 2, "mitad sumas y mitad restas");
  },
  "orden.mayor"(act, tam) {
    const R = rango(act), modo = act.params.modo || "mezcla", es = act.ejercicios, cnt = tam === "media" ? 6 : 15;
    cuantos(es, cnt);
    unicos(es, ({ datos: { a, b } }) => a + "," + b, "parejas repetidas");
    for (const { datos: { a, b, pide }, solucion } of es) {
      ent(a, 1, R, "a"); ent(b, 1, R, "b"); assert.notEqual(a, b, "pareja con iguales");
      assert.deepEqual(solucion.huecos, []);
      assert.equal(solucion.rodea, pide === "mayor" ? Math.max(a, b) : Math.min(a, b));
      if (act.params.cerca && R >= 20) assert.ok(decena([a, b]), "cerca: no son de la misma decena");
    }
    const may = es.filter((e) => e.datos.pide === "mayor").length;
    assert.equal(may, modo === "mayor" ? cnt : modo === "menor" ? 0 : Math.ceil(cnt / 2), "nº de «mayor»");
  },
  "orden.grupo"(act, tam) {
    const R = rango(act), n = Math.max(3, Math.min(5, act.params.n || 4));
    cuantos(act.ejercicios, tam === "media" ? 4 : 10);
    for (const { datos: { valores }, solucion } of act.ejercicios) {
      assert.equal(valores.length, n, "números por grupo");
      valores.forEach((v) => ent(v, 1, R, "número"));
      unicos(valores, (v) => v, "números repetidos");
      assert.deepEqual(solucion.huecos, [Math.max(...valores), Math.min(...valores)]);
      if (act.params.cerca && R >= 20) assert.ok(decena(valores), "cerca: no son de la misma decena");
    }
  },
  "orden.ordena1": ordena(false),
  "orden.ordena2": ordena(true),
  "orden.entre"(act, tam) {
    const R = rango(act), es = act.ejercicios, dmax = Math.max(4, Math.floor(R / 5));
    cuantos(es, tam === "media" ? 6 : 15);
    unicos(es, ({ datos: { a, b } }) => Math.min(a, b) + "," + Math.abs(a - b), "parejas repetidas");
    for (const { datos: { a, b }, solucion } of es) {
      ent(a, 1, R, "a"); ent(b, 1, R, "b"); ent(Math.abs(a - b), 2, dmax, "distancia");
      const lo = Math.min(a, b), hi = Math.max(a, b);
      assert.deepEqual(solucion.entre, [lo + 1, hi - 1]);
      ent(solucion.huecos[0], lo + 1, hi - 1, "número entre");
    }
  },
  "orden.ordinales"(act, tam) {
    const modo = act.params.modo || "mezcla", es = act.ejercicios;
    cuantos(es, tam === "media" ? 3 : 6);
    es.forEach(({ datos: { tarea, k, m, fig }, solucion }, i) => {
      ent(m, 7, 10, "dibujos"); ent(k, 1, m, "lugar pedido"); assert.equal(fig, i % 3, "figura de la fila");
      assert.equal(tarea, modo === "colorea" || (modo === "mezcla" && i % 2 === 0) ? "colorea" : "lugar");
      assert.deepEqual(solucion.huecos, tarea === "lugar" ? [k] : []);
    });
  },
  "orden.cantidad"(act, tam) {
    const R = rango(act), mx = Math.min(R, 12), modo = act.params.modo || "mezcla", es = act.ejercicios, cnt = tam === "media" ? 4 : 8;
    cuantos(es, cnt);
    assert.equal(es.filter((e) => e.datos.a === e.datos.b).length, tam === "media" ? 1 : 2, "nº de grupos iguales");
    assert.equal(es.filter((e) => e.datos.pide === "más").length, modo === "mayor" ? cnt : modo === "menor" ? 0 : cnt / 2, "nº de «más»");
    es.forEach(({ datos: { a, b, pide, forma, pos }, solucion }, i) => {
      ent(a, 1, mx, "a"); ent(b, 1, mx, "b"); assert.equal(forma, "csqt"[i % 4]);
      assert.deepEqual(pos.map((g) => g.length), [a, b], "un dibujo por unidad");
      for (const g of pos) unicos(g, ([f, c]) => f + "," + c, "dibujos en la misma casilla");
      assert.deepEqual(solucion.huecos, []);
      assert.equal(solucion.rodea, a === b ? "ambos" : (pide === "más") === (a > b) ? "a" : "b");
    });
  },
};
