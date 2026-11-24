// Charta · invariantes de la familia «fraccion» (3.º, lote 5; ver tests/invariantes.js). Comprobación independiente de src/tipos/_fraccion.js.
import assert from "node:assert/strict";
import { ent, unicos, cuantos } from "./_ayuda.js";

const NUM = ["", "un", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once"];
const DEN = { 2: "medio", 3: "tercio", 4: "cuarto", 5: "quinto", 6: "sexto", 7: "séptimo", 8: "octavo", 9: "noveno", 10: "décimo", 11: "onceavo", 12: "doceavo" };
const letras = (k, n) => `${NUM[k]} ${DEN[n]}${k > 1 ? "s" : ""}`;
const maxDen = (p) => p.den ?? 12;
const propia = (k, n, p) => { ent(n, 2, maxDen(p), "denominador"); ent(k, 1, n - 1, `numerador de ?/${n}`); };
const FIG = ["circulo", "rect", "tira"];
const figuras = (es, p) => {
  for (const e of es) assert.ok(p.figura ? e.datos.fig === p.figura : FIG.includes(e.datos.fig), `figura ${e.datos.fig}`);
  if (!p.figura) assert.equal(new Set(es.map((e) => e.datos.fig)).size, 3, "la mezcla no usa las tres figuras");
};
const turnos = (es, f, p) => {   // denominadores por turnos: ninguno sale más de una vez por vuelta
  const c = {}; for (const e of es) c[f(e)] = (c[f(e)] ?? 0) + 1;
  assert.ok(Math.max(...Object.values(c)) <= Math.ceil(es.length / (maxDen(p) - 1)), "un denominador se repite demasiado");
};

export default {
  "fraccion.lee"(act, tam) {
    const es = act.ejercicios, p = act.params, lee = p.modo === "lee", media = tam === "media";
    cuantos(es, lee ? (media ? 4 : 8) : media ? 6 : 12);
    unicos(es, (e) => e.datos.k + "/" + e.datos.n, "fracción repetida");
    figuras(es, p); turnos(es, (e) => e.datos.n, p);
    for (const { datos: { fig, n, k, llenas }, solucion: { huecos } } of es) {
      propia(k, n, p);
      assert.equal(llenas.length, k, "partes coloreadas ≠ numerador"); unicos(llenas.map((v) => ({ v })), (o) => o.v, "parte repetida");
      for (const v of llenas) ent(v, 0, n - 1, "parte");
      if (fig !== "rect") assert.deepEqual(llenas, Array.from({ length: k }, (_, i) => i), "círculo y tira: partes seguidas");
      assert.deepEqual(huecos, lee ? [k, n, letras(k, n)] : [k, n]);
    }
  },
  "fraccion.colorea"(act, tam) {
    const es = act.ejercicios, p = act.params;
    cuantos(es, tam === "media" ? 6 : 12);
    unicos(es, (e) => e.datos.k + "/" + e.datos.n, "fracción repetida");
    figuras(es, p); turnos(es, (e) => e.datos.n, p);
    for (const { datos: { n, k }, solucion } of es) { propia(k, n, p); assert.deepEqual(solucion, { huecos: [], colorea: k }); }
  },
  "fraccion.letras"(act, tam) {
    const es = act.ejercicios, p = act.params, media = tam === "media";
    assert.ok(es.length >= (media ? 6 : 12), "pocos ejercicios");
    assert.equal(es.length % 2, 0, "filas completas");
    unicos(es, (e) => e.datos.k + "/" + e.datos.n, "fracción repetida");
    for (const { datos: { k, n, sentido }, solucion: { huecos } } of es) {
      propia(k, n, p);
      assert.equal(sentido, p.modo ?? sentido);
      assert.deepEqual(huecos, sentido === "leer" ? [letras(k, n)] : [k, n]);
    }
    if (!p.modo) assert.equal(es.filter((e) => e.datos.sentido === "leer").length, es.length / 2, "los dos sentidos: mitad y mitad");
  },
  "fraccion.compara"(act, tam) {
    const es = act.ejercicios, p = act.params, dibujo = p.dibujo ?? true, media = tam === "media", modo = p.modo ?? null;
    cuantos(es, dibujo ? (media ? 4 : 8) : media ? 6 : 12);
    unicos(es, (e) => [e.datos.a + "", e.datos.b + ""].sort().join("|"), "pareja repetida");
    for (const { datos: { a, b, igual, dibujo: d }, solucion: { huecos } } of es) {
      propia(a[0], a[1], p); propia(b[0], b[1], p);
      assert.equal(d, dibujo);
      assert.equal(igual, modo === "numerador" ? "num" : modo === "mezcla" ? igual : "den");
      if (igual === "den") { assert.equal(a[1], b[1], "mismo denominador"); assert.notEqual(a[0], b[0]); }
      else { assert.equal(a[0], b[0], "mismo numerador"); assert.notEqual(a[1], b[1]); }
      const va = a[0] * b[1], vb = b[0] * a[1];   // a/b comparado sin decimales
      assert.notEqual(va, vb, "fracciones iguales");
      assert.deepEqual(huecos, [va > vb ? ">" : "<"]);
    }
    if (modo === "mezcla") assert.equal(es.filter((e) => e.datos.igual === "den").length, es.length / 2, "mezcla: mitad y mitad");
  },
  "fraccion.de"(act, tam) {
    const es = act.ejercicios, p = act.params, ayuda = p.ayuda ?? true, varias = p.tipo === "varias", media = tam === "media";
    assert.ok(es.length >= (ayuda ? (media ? 3 : 6) : media ? 6 : 12), "pocos ejercicios");
    unicos(es, (e) => `${e.datos.k}/${e.datos.n} de ${e.datos.N}`, "repetido");
    for (const { datos: { k, n, N, ayuda: a }, solucion: { huecos } } of es) {
      assert.equal(a, ayuda);
      ent(n, 2, ayuda ? 6 : 10, "denominador"); ent(k, 1, n - 1, "numerador");
      assert.ok(varias ? k > 1 : k === 1, varias ? "unitaria en «no unitarias»" : "no unitaria");
      assert.equal(N % n, 0, `${N} no se reparte en ${n} grupos`); ent(N / n, 2, ayuda ? 5 : 10, "cada grupo");
      assert.deepEqual(huecos, [(N / n) * k]);
    }
  },
  "fraccion.recta"(act, tam) {
    const es = act.ejercicios, p = act.params, marca = p.modo === "marca";
    cuantos(es, tam === "media" ? 3 : 6);
    turnos(es, (e) => e.datos.n, { den: (p.den ?? 12) - (marca ? 0 : 1) });
    for (const { datos: { n, puntos }, solucion } of es) {
      ent(n, marca ? 2 : 3, maxDen(p), "denominador");
      assert.equal(puntos.length, marca ? 1 : 2);
      for (const k of puntos) ent(k, 1, n - 1, "punto");
      if (marca) assert.deepEqual(solucion, { huecos: [], marca: puntos[0] });
      else { assert.ok(puntos[0] < puntos[1], "dos puntos distintos, ordenados"); if (n > 3) assert.ok(puntos[1] - puntos[0] >= 2, "puntos vecinos"); assert.deepEqual(solucion.huecos, [puntos[0], n, puntos[1], n]); }
    }
  },
};
