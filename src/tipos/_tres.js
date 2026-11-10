// Charta · sumas y restas con números de tres cifras (Matemáticas de 2.º, rango > 100; MATES_2.md, lote 1).
// Llevada = en CUALQUIER columna (unidades, decenas). Con rango ≤ 100 no se usa: las fichas de 1.º no cambian.
// Grupos (rotan): decenas y centenas redondas (250 + 30) · 3 cifras ± 1 cifra · 3 ± 2 cifras · 3 ± 3 cifras.
// nivel: "sin" (ninguna llevada) · "con" (al menos una) · "mezcla" (mitad y mitad, alternas).
// Lote 2 (en vertical, con rango ≥ 200): además "u" (llevada solo en las unidades), "d" (solo en las decenas), "ud" (en las dos);
// sumas con tres sumandos; decenas y centenas redondas; y el dibujo común de las columnas C, D, U (vertical3).

import { TOP, MENOS, T, B, COLOR_SOLUCION } from "../render/papel.js";

const cifras = (n) => [n % 10, Math.floor(n / 10) % 10, Math.floor(n / 100) % 10];
/** ¿a + b lleva en alguna columna? */
export function llevaSuma3(a, b) { const x = cifras(a), y = cifras(b); return x[0] + y[0] >= 10 || x[1] + y[1] + (x[0] + y[0] >= 10 ? 1 : 0) >= 10; };
/** ¿a − b necesita «pedir» en alguna columna? */
export function llevaResta3(a, b) { const x = cifras(a), y = cifras(b); return y[0] > x[0] || y[1] + (y[0] > x[0] ? 1 : 0) > x[1]; };

const SUMA = [
  (R, z) => { const a = 10 * z.entero(10, Math.floor((R - 10) / 10)); return [a, 10 * z.entero(1, Math.max(1, Math.floor((R - a) / 10)))]; },
  (R, z) => [z.entero(101, R - 1), z.entero(1, 9)],
  (R, z) => [z.entero(100, R - 10), z.entero(10, 99)],
  (R, z) => (R < 200 ? null : (() => { const a = z.entero(100, R - 100); return [a, z.entero(100, Math.max(100, R - a))]; })()),
];
const RESTA = [
  (R, z) => { const a = 10 * z.entero(11, Math.floor(R / 10)); return [a, 10 * z.entero(1, a / 10 - 1)]; },
  (R, z) => [z.entero(101, R), z.entero(1, 9)],
  (R, z) => [z.entero(110, R), z.entero(10, 99)],
  (R, z) => (R < 201 ? null : (() => { const a = z.entero(201, R); return [a, z.entero(100, a - 1)]; })()),
];

function sortear(G, ok, R, nivel, cnt, azar) {
  nivel = nivel || "sin";
  const vistos = new Set(), out = [];
  for (let i = 0; out.length < cnt && i < cnt * 4; i++) {
    const con = nivel === "con" || (nivel === "mezcla" && out.length % 2 === 1);
    let p = null;
    for (let g = 0; g < G.length && !p; g++) {
      const gen = G[(out.length + g) % G.length];
      for (let k = 0; k < 300; k++) {
        const q = gen(R, azar);
        if (!q) break;
        if (ok(q, R) && q[1] >= 1 && !vistos.has(q.join()) && con === (G === SUMA ? llevaSuma3 : llevaResta3)(...q)) { p = q; break; }
      }
    }
    if (!p) break;
    vistos.add(p.join()); out.push(p);
  }
  return azar.barajar(out);
}

/** cnt sumas [a, b] (a ≥ 100, a + b ≤ R) sin repetir. */
export function paresSuma3(R, nivel, cnt, azar) { return sortear(SUMA, ([a, b], R) => a + b <= R, R, nivel, cnt, azar); }
/** cnt restas [a, b] (100 ≤ a ≤ R, 1 ≤ b < a) sin repetir. */
export function paresResta3(R, nivel, cnt, azar) { return sortear(RESTA, ([a, b], R) => a <= R && b < a, R, nivel, cnt, azar); }

// ---------------------------------------------------------------- Lote 2 · sumas y restas en vertical (columnas C, D, U)
/** Llevadas de una suma de varios números: [unidades → decenas, decenas → centenas] (con tres sumandos pueden ser 2). */
export function llevadasSuma(xs) {
  const cu = Math.floor(xs.reduce((t, v) => t + (v % 10), 0) / 10);
  const cd = Math.floor((xs.reduce((t, v) => t + (Math.floor(v / 10) % 10), 0) + cu) / 10);
  return [cu, cd];
}
/** Restas «pidiendo»: [en las unidades, en las decenas] (b2 > a2; b1 + 1 > a1 si se pidió en las unidades). */
export function llevadasResta(a, b) {
  const pu = b % 10 > a % 10;
  return [pu, (Math.floor(b / 10) % 10) + (pu ? 1 : 0) > Math.floor(a / 10) % 10];
}
/** ¿[en U, en D] cumple el nivel? sin = ninguna · con = alguna · u = solo U · d = solo D · ud = las dos. */
const cumple = (nivel, [u, d]) => (nivel === "sin" ? !u && !d : nivel === "con" ? u || d : nivel === "u" ? u && !d : nivel === "d" ? !u && d : u && d);

const VSUMA2 = [
  (R, z) => { const a = z.entero(100, R - 1); return [a, z.entero(1, Math.min(9, R - a))]; },
  (R, z) => [z.entero(100, R - 10), z.entero(10, 99)],
  (R, z) => (R < 200 ? null : (() => { const a = z.entero(100, R - 100); return [a, z.entero(100, Math.max(100, R - a))]; })()),
];
const VSUMA3 = [
  (R, z) => [z.entero(100, R - 20), z.entero(10, 99), z.entero(10, 99)],
  (R, z) => [z.entero(100, R - 11), z.entero(10, 99), z.entero(1, 9)],
  (R, z) => (R < 400 ? null : (() => { const a = z.entero(100, R - 110), b = z.entero(100, Math.max(100, R - a - 10)); return [a, b, z.entero(1, 99)]; })()),
];
const VRESTA = [
  (R, z) => [z.entero(101, R), z.entero(1, 9)],
  (R, z) => [z.entero(110, R), z.entero(10, 99)],
  (R, z) => (R < 201 ? null : (() => { const a = z.entero(201, R); return [a, z.entero(100, a - 1)]; })()),
];

function sortearV(G, ok, nivelDe, R, nivel, cnt, azar) {
  nivel = nivel || "sin";
  const vistos = new Set(), out = [];
  for (let i = 0; out.length < cnt && i < cnt * 4; i++) {
    const quiero = nivel === "mezcla" ? (out.length % 2 === 1 ? "con" : "sin") : nivel;
    let p = null;
    for (let g = 0; g < G.length && !p; g++) {
      const gen = G[(out.length + g) % G.length];
      for (let k = 0; k < 300; k++) {
        const q = gen(R, azar);
        if (!q) break;
        q.sort((x, y) => y - x);
        if (ok(q, R) && !vistos.has(q.join()) && cumple(quiero, nivelDe(q))) { p = q; break; }
      }
    }
    if (!p) break;
    vistos.add(p.join()); out.push(p);
  }
  if (out.length < cnt) throw new Error("Esta ficha necesita un rango máximo mayor.");
  return azar.barajar(out);
}
/** cnt sumas en vertical de 2 o 3 sumandos [mayor, …] (el primero de 3 cifras, suma ≤ R), sin repetir, del nivel dado. */
export function sumasVert(R, nivel, sumandos, cnt, azar) {
  return sortearV(sumandos === 3 ? VSUMA3 : VSUMA2, (q, R) => q.reduce((t, v) => t + v, 0) <= R, (q) => llevadasSuma(q).map((c) => c > 0), R, nivel, cnt, azar);
}
/** cnt restas en vertical [a, b] (101 ≤ a ≤ R, 1 ≤ b < a), sin repetir, del nivel dado. */
export function restasVert(R, nivel, cnt, azar) {
  return sortearV(VRESTA, ([a, b], R) => a <= R && b < a, (q) => llevadasResta(...q), R, nivel, cnt, azar);
}

/**
 * Dibujo de las columnas C, D, U (sumar.vertical y restar.vertical con rango > 100; 3 × 4 tarjetas, media: 3 × 2).
 * datos {a, b[, c]}; solucion.huecos = [C, D, U] del resultado (+ [resultado] si la resta lleva prueba).
 * Suma: casillas pequeñas de llevada sobre D y C (decorativas: vacías en papel; en la solución, la llevada si la hay).
 * Resta: sin casilla de llevada (se «pide» tachando y escribiendo sobre el minuendo: queda aire sobre él); prueba opcional:
 * «☐ + b = a» debajo del resultado, con el resultado en el hueco.
 */
export function vertical3(p, act, resta) {
  const prueba = resta && !!act.params.prueba;
  const { cel, cw, ch } = p.celdas(TOP, 3, 4);
  act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
    const [x, y] = cel[i], nums = [e.datos.a, e.datos.b, e.datos.c].filter((v) => v !== undefined), n = nums.length, cx = x + cw / 2;
    const xs = [cx - 36, cx, cx + 36], fs = n === 3 ? 22 : 24;
    // alturas (desde la base de la tarjeta)
    const paso = n === 3 ? 26 : resta ? (prueba ? 28 : 32) : 30;
    const r0 = resta ? ch - (prueba ? 52 : 60) : ch - (n === 3 ? 62 : 64);
    const rl = r0 - (n - 1) * paso, yl = rl - (prueba ? 7 : 8);
    p.marco(x, y, cw, ch, i);
    ["C", "D", "U"].forEach((l, k) => p.text(xs[k], y + ch - (resta ? 18 : 16), l, 9, { f: "PM", anchor: "middle", gris: 0.3 }));
    nums.forEach((v, j) => {
      const yy = y + r0 - j * paso;
      if (v >= 100) p.text(xs[0], yy, String(Math.floor(v / 100)), fs, { anchor: "middle" });
      if (v >= 10) p.text(xs[1], yy, String(Math.floor(v / 10) % 10), fs, { anchor: "middle" });
      p.text(xs[2], yy, String(v % 10), fs, { anchor: "middle" });
    });
    p.text(xs[0] - 34, y + rl, resta ? MENOS : "+", fs, { anchor: "middle" });
    p.line(xs[0] - 26, y + yl, xs[2] + 26, y + yl, { lw: 1.6 });
    if (!resta) {
      const ll = llevadasSuma(nums);
      [1, 0].forEach((k, q) => {                   // sobre D: llevada de U · sobre C: llevada de D
        p.rrect(xs[k] - 11, y + ch - 42, 22, 16, 4, { lw: 0.9, fill: 1, stroke: 0.55 });
        // «#c62828» = COLOR_SOLUCION en minúsculas: es la llevada, no un hueco (test_tipos cuenta los fill="#C62828" de los huecos)
        if (p.solucion && ll[q] > 0) p.text(xs[k], y + ch - 38, String(ll[q]), 12, { anchor: "middle", gris: COLOR_SOLUCION.toLowerCase() });
      });
    }
    const hb = n === 3 ? 34 : 40, yb = prueba ? 46 : n === 3 ? 8 : resta ? 14 : 12, hh = prueba ? 32 : hb;
    e.solucion.huecos.slice(0, 3).forEach((s, k) => p.caja(xs[k] - 15, y + yb, 30, hh, null, 22, s));
    if (prueba) {
      p.line(x + 14, y + 41, x + cw - 14, y + 41, { lw: 0.6, gris: 0.7, dash: [3, 3] });
      p.linea(x, y + 8, cw, 28, [B(54, 28, e.solucion.huecos[3]), T(`+ ${e.datos.b} = ${e.datos.a}`, 15)], 6);
    }
  }));
}

// ---------------------------------------------------------------- Lote 2 · decenas y centenas redondas
/** n ejercicios [a, b, forma] repartidos entre las clases (cada una: lista de parejas [a, b]); distintos y mezclados. */
function repartir(clases, n, azar) {
  const tri = clases.map((c) => c.flatMap(([a, b]) => [0, 1, 2].map((f) => [a, b, f])));
  const q = Math.ceil(n / clases.length);
  let out = tri.flatMap((t) => azar.muestra(t, Math.min(q, t.length)));
  if (out.length < n) {
    const usados = new Set(out.map(String)), resto = tri.flat().filter((t) => !usados.has(String(t)));
    out = out.concat(azar.muestra(resto, n - out.length));
  }
  return azar.barajar(out).slice(0, n);
}
const pasos = (a, b, d = 10) => { const l = []; for (let v = a; v <= b; v += d) l.push(v); return l; };
/** Sumas de decenas y centenas (R > 100): 40 + 30 · 300 + 400 · 250 + 30, a + b ≤ R. Hasta 24 [a, b, forma]. */
export function decenasSuma3(R, azar) {
  const A = [], Bc = [], C = [];
  for (const a of pasos(10, 90)) for (const b of pasos(10, 90)) if (a + b <= R) A.push([a, b]);
  for (const a of pasos(100, R, 100)) for (const b of pasos(100, R, 100)) if (a + b <= R) Bc.push([a, b]);
  for (const a of pasos(100, R - 10)) for (const b of pasos(10, 90)) if (a + b <= R) C.push([a, b]);
  return repartir([A, Bc, C], 24, azar);
}
/** Restas de decenas y centenas (R > 100): 70 − 30 · 700 − 300 · 450 − 20. Hasta 24 [a, b, forma]. */
export function decenasResta3(R, azar) {
  const A = [], Bc = [], C = [];
  for (const a of pasos(20, 100)) for (const b of pasos(10, a - 10)) A.push([a, b]);
  for (const a of pasos(200, R, 100)) for (const b of pasos(100, a - 100, 100)) Bc.push([a, b]);
  for (const a of pasos(110, R)) for (const b of pasos(10, 90)) C.push([a, b]);
  return repartir([A, Bc, C], 24, azar);
}
