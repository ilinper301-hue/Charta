// Charta · problemas de 2.º (bloque 8, lote 5): de dos operaciones y de compras. Ver _problemas.js (1.º).
// problemas.dospasos · datos:    { texto, sit, a, b, c, op1, op2, obj }      (r1 = a op1 b; r2 = r1 op2 c)
//                      solucion: { huecos: [a, op1, b, r1, r1, op2, c, r2, r2] }
// problemas.dinero    · datos:    { texto, sit, a, b, op, obj: "€" }         (mismo dibujo que los de 1.º)
//                      solucion: { huecos: [a, op, b, resultado, resultado] }
// Todas las cantidades valen ≥ 2 y ningún resultado (ni el intermedio) pasa del rango.
import { TOP, T, B, MENOS, INK, COLOR_SOLUCION } from "../render/papel.js";
import { NOMBRES, OBJETOS, partir } from "./_problemas.js";
import { llevaSuma3, llevaResta3 } from "./_tres.js";

const cuantos = (g) => (g === "f" ? "Cuántas" : "Cuántos");
const losLas = (g) => (g === "f" ? "Las" : "Los");
const opera = (op, x, y) => (op === "+" ? x + y : x - y);
const lleva = (op, x, y) => (op === "+" ? llevaSuma3(x, y) : llevaResta3(x, y));

// ---------------------------------------------------------------- problemas.dospasos
/** Situaciones de dos pasos: [op1, op2, plantillas(N, M, P, a, b, c, o, g)]. */
export const SITUACIONES_2 = {
  dar_quitar: ["+", MENOS, ({ N, a, b, c, o, g }) => [
    `${N} tiene ${a} ${o}. Le regalan ${b} y después pierde ${c}. ¿${cuantos(g)} ${o} tiene ahora?`,
    `En el cesto hay ${a} ${o}. Se ponen ${b} más y luego se sacan ${c}. ¿${cuantos(g)} ${o} quedan en el cesto?`]],
  quitar_dar: [MENOS, "+", ({ N, M, a, b, c, o, g }) => [
    `${N} tiene ${a} ${o}. Regala ${b} a ${M} y después compra ${c}. ¿${cuantos(g)} ${o} tiene ahora?`,
    `En la caja hay ${a} ${o}. Se sacan ${b} y luego se meten ${c}. ¿${cuantos(g)} ${o} hay ahora en la caja?`]],
  juntar_quitar: ["+", MENOS, ({ N, M, a, b, c, o, g }) => [
    `${N} tiene ${a} ${o} y ${M} tiene ${b}. ${losLas(g)} juntan y regalan ${c}. ¿${cuantos(g)} ${o} les quedan?`]],
  dar_dar: ["+", "+", ({ N, M, P, a, b, c, o, g }) => [
    `${N} tiene ${a} ${o}. Por la mañana le dan ${b} y por la tarde, ${c}. ¿${cuantos(g)} ${o} tiene ahora?`,
    `${N} tiene ${a} ${o}, ${M} tiene ${b} y ${P} tiene ${c}. ¿${cuantos(g)} ${o} tienen entre los tres?`]],
  quitar_quitar: [MENOS, MENOS, ({ N, M, P, a, b, c, o, g }) => [
    `${N} tiene ${a} ${o}. Regala ${b} a ${M} y ${c} a ${P}. ¿${cuantos(g)} ${o} le quedan?`,
    `En la caja hay ${a} ${o}. Por la mañana se sacan ${b} y por la tarde, ${c}. ¿${cuantos(g)} ${o} quedan en la caja?`]],
};
/** Situaciones de cada valor de la opción `operaciones` (null = variadas). */
export const SITS_2 = {
  suma: ["dar_dar"], resta: ["quitar_quitar"], mixtas: ["dar_quitar", "quitar_dar", "juntar_quitar"],
};
SITS_2.todas = [...SITS_2.mixtas, ...SITS_2.suma, ...SITS_2.resta];

/** Tres cantidades para (op1, op2) con resultado intermedio y final en 2..R; `quiere` = true (alguna llevada), false (ninguna) o null. */
function tresCantidades(op1, op2, R, quiere, az) {
  for (let k = 0; k < 4000; k++) {
    const a = az.entero(2, R), b = az.entero(2, R), c = az.entero(2, R);
    if (a === b || b === c || a === c) continue;
    const r1 = opera(op1, a, b), r2 = opera(op2, r1, c);
    if (r1 < 2 || r1 > R || r2 < 2 || r2 > R) continue;
    const l = lleva(op1, a, b) || lleva(op2, r1, c);
    if (quiere !== null && l !== quiere) continue;
    return { a, b, c, r1, r2 };
  }
  throw new Error("No hay problemas de dos operaciones con estas opciones: prueba con números más grandes.");
}

/** Cuántos problemas: 4/2 sin barra; con barra (dibujada o en blanco), 3/1. */
export const cuantosDosPasos = (params, tamano) => (params.barra ? (tamano === "media" ? 1 : 3) : tamano === "media" ? 2 : 4);

export function generarDosPasos(params, az, n) {
  const R = params.rango || 100, nivel = params.nivel || "sin", sits = SITS_2[params.operaciones || "todas"];
  const nombres = az.barajar(NOMBRES), objetos = az.barajar(OBJETOS), orden = az.barajar(sits), out = [], vistos = new Set();
  for (let i = 0; i < n; i++) {
    const sit = orden[i % orden.length], [op1, op2, plantillas] = SITUACIONES_2[sit];
    const quiere = nivel === "sin" ? false : nivel === "con" ? true : i % 2 === 0;
    let q;
    for (let k = 0; k < 50; k++) { q = tresCantidades(op1, op2, R, quiere, az); if (!vistos.has(`${q.a},${q.b},${q.c}`)) break; }
    vistos.add(`${q.a},${q.b},${q.c}`);
    const [N, M, P] = [0, 1, 2].map((j) => nombres[(3 * i + j) % nombres.length]), [o, g] = objetos[i % objetos.length];
    const texto = az.elegir(plantillas({ N, M, P, a: q.a, b: q.b, c: q.c, o, g }));
    out.push({
      datos: { texto, sit, a: q.a, b: q.b, c: q.c, op1, op2, obj: o },
      solucion: { huecos: [q.a, op1, q.b, q.r1, q.r1, op2, q.c, q.r2, q.r2] },
    });
  }
  return out;
}

// ---------------------------------------------------------------- barra de dos pasos (modelo de Singapur, como Barri)
const BW = 300, BH = 22, MIN = 30;
/** Anchos proporcionales a `vals` que suman `W`, ninguno menor que MIN (para que quepa la etiqueta). */
function reparto(vals, W) {
  const tot = vals.reduce((x, y) => x + y, 0);
  let bajo = vals.map(() => false), w = vals.map((v) => (v / tot) * W);
  for (let k = 0; k < 4; k++) {
    bajo = w.map((x, i) => bajo[i] || x < MIN);
    const libre = W - MIN * bajo.filter(Boolean).length, resto = vals.reduce((t, v, i) => t + (bajo[i] ? 0 : v), 0);
    w = vals.map((v, i) => (bajo[i] ? MIN : (v / resto) * libre));
  }
  return w;
}
/** Segmento: `val` número, null = «?» (incógnita), "" = sin etiqueta; `quita` = la parte que se quita (borde discontinuo, «−n»). */
function seg(p, x, y, w, val, tinta, fill, quita = false) {
  if (quita) p.path([["M", x, y], ["L", x + w, y], ["L", x + w, y + BH], ["L", x, y + BH], ["Z"]], { lw: 1.4, fill: 1, stroke: tinta, dash: [4, 3] });
  else p.rrect(x, y, w, BH, 3, { lw: 1.4, fill, stroke: tinta });
  if (val !== "") p.text(x + w / 2, y + BH / 2 - 4.5, val === null ? "?" : (quita ? MENOS : "") + val, 13.5, { f: "PB", anchor: "middle", gris: INK });
}
/** Fila de segmentos desde x0: [[valor, ancho, tachado]…]. */
function fila(p, x0, y, partes, tinta, GR) {
  let x = x0;
  partes.forEach(([v, w, t], k) => { seg(p, x, y, w, v, tinta, GR ? GR[k % 2] : null, t); x += w; });
}
/** Llave sobre (arriba = true) o bajo [x0, x1] con su etiqueta (número o «?»). */
function llave(p, x0, x1, y, arriba, val, tinta) {
  const d = arriba ? 6 : -6;
  p.path([["M", x0, y], ["L", x0, y + d], ["L", x1, y + d], ["L", x1, y]], { lw: 1.2, stroke: tinta });
  p.text((x0 + x1) / 2, arriba ? y + 10 : y - 17, val === null ? "?" : String(val), 13, { f: "PB", anchor: "middle", gris: INK });
}
/** Barra de dos pasos en la zona [y, y + 92] desde x0. Una fila (dar y dar, quitar y quitar) o dos (el segundo paso debajo). */
export function dibujarBarraDosPasos(p, d, x0, y, tinta) {
  const GR = tinta === COLOR_SOLUCION ? null : [0.93, 0.84], r1 = opera(d.op1, d.a, d.b), r2 = opera(d.op2, r1, d.c);
  const arriba = y + 52, abajo = y + 22, sola = y + 34;
  if (d.sit === "dar_dar") {
    const [wa, wb, wc] = reparto([d.a, d.b, d.c], BW);
    fila(p, x0, sola, [[d.a, wa], [d.b, wb], [d.c, wc]], tinta, GR);
    llave(p, x0, x0 + BW, sola + BH + 4, true, null, tinta);
  } else if (d.sit === "quitar_quitar") {
    const [w2, wb, wc] = reparto([r2, d.b, d.c], BW);
    fila(p, x0, sola, [[null, w2], [d.b, wb, true], [d.c, wc, true]], tinta, GR);
    llave(p, x0, x0 + BW, sola + BH + 4, true, d.a, tinta);
  } else if (d.sit === "quitar_dar") {               // arriba: a = (lo que queda) + b tachado; abajo: lo que queda + c = ?
    const T = Math.max(d.a, r1 + d.c), La = (d.a / T) * BW, Lb = (BW * (r1 + d.c)) / T;
    const [w1, wb] = reparto([r1, d.b], La), wc = Math.max(MIN, Lb - w1);
    fila(p, x0, arriba, [["", w1], [d.b, wb, true]], tinta, GR);
    llave(p, x0, x0 + w1 + wb, arriba + BH + 4, true, d.a, tinta);
    fila(p, x0, abajo, [["", w1], [d.c, wc]], tinta, GR);
    llave(p, x0, x0 + w1 + wc, abajo - 4, false, null, tinta);
  } else {                                           // dar_quitar, juntar_quitar: arriba a + b; abajo el mismo total = ? + c tachado
    const [wa, wb] = reparto([d.a, d.b], BW), [w2, wc] = reparto([r2, d.c], BW);
    fila(p, x0, arriba, [[d.a, wa], [d.b, wb]], tinta, GR);
    fila(p, x0, abajo, [[null, w2], [d.c, wc, true]], tinta, GR);
  }
}

/** Tarjeta: enunciado (hasta 3 líneas), «Operaciones: [a][+][b] = [r1]   [r1][−][c] = [r2]» y «Respuesta: [r2] objetos».
 *  Con barra (`params.barra`: "dibujada" o "blanco"): 3 por página, la barra entre el enunciado y las operaciones y la respuesta a su derecha. */
export function dibujarDosPasos(p, act) {
  const es = act.ejercicios, barra = act.params.barra, filas = barra ? 3 : 4;
  const { cel, cw, ch } = p.celdas(TOP, 1, filas);
  es.slice(0, p.n(filas)).forEach((e, i) => p.ejercicio(e.id, () => {
    const [x, y] = cel[i], d = e.datos, h = e.solucion.huecos;
    p.marco(x, y, cw, ch, i);
    const fs = 13.5, lineas = partir(p, d.texto, cw - 70, fs);
    if (lineas.length > 3) throw new Error(`Enunciado de más de 3 líneas: ${d.texto}`);
    lineas.forEach((l, j) => p.text(x + 36, y + ch - 30 - j * 17, l, fs, { f: "PR" }));
    const hb = 34, fl = 12.5, yo = barra ? y + 8 : y + 52;
    p.linea(x + 10, yo, cw - 20, hb + 4, [T("Operaciones:", fl, "PR"),
      B(42, hb, h[0]), B(26, hb, h[1]), B(42, hb, h[2]), T("=", 16), B(44, hb, h[3]), T("", 4),
      B(44, hb, h[4]), B(26, hb, h[5]), B(42, hb, h[6]), T("=", 16), B(44, hb, h[7])], 8);
    const resp = [T("Respuesta:", fl, "PR"), B(52, hb, h[8]), T(d.obj, fl, "PR")];
    if (!barra) return p.linea(x + 10, y + 8, cw - 20, hb + 4, resp, 8);
    const yb = y + 52, x0 = x + 24;                          // zona de la barra: yb … yb + 92
    if (barra !== "blanco") dibujarBarraDosPasos(p, d, x0, yb, INK);
    else if (!p.solucion) {
      p.rrect(x0 - 6, yb, BW + 12, 92, 6, { lw: 0.8, fill: 1, stroke: 0.7 });
      p.text(x0 + BW / 2, yb + 42, "Dibuja aquí la barra", 10.5, { f: "PR", anchor: "middle", gris: 0.65 });
    } else dibujarBarraDosPasos(p, d, x0, yb, COLOR_SOLUCION);
    p.linea(x0 + BW + 14, yb + 27, cw - BW - 48, hb + 4, resp, 8);
  }));
}

// ---------------------------------------------------------------- problemas.dinero
/** [con artículo, precio mínimo, precio máximo] en euros enteros. */
export const PRODUCTOS = [
  ["un cuaderno", 2, 9], ["un estuche", 5, 15], ["un libro", 8, 25], ["una pelota", 4, 15], ["un balón", 10, 30],
  ["una mochila", 15, 45], ["unas zapatillas", 25, 70], ["una camiseta", 6, 20], ["un puzle", 7, 25], ["una muñeca", 10, 35],
  ["un juego de mesa", 15, 40], ["una cometa", 5, 18], ["un patinete", 40, 120], ["una bicicleta", 90, 300],
  ["una tableta", 100, 400], ["unos patines", 30, 80], ["una lámpara", 12, 40], ["un reloj", 15, 60],
  ["una caja de pinturas", 3, 12], ["un peluche", 6, 25], ["una guitarra", 50, 200], ["una tienda de campaña", 60, 250],
];
export const BILLETES = [5, 10, 20, 50, 100, 200, 500];
const cuesta = (prod) => (/^un[oa]s /.test(prod) ? "cuestan" : "cuesta");
export const SITS_DINERO = ["pagar", "vuelta", "queda", "falta"];

/** Precio al azar de un producto dentro de [2, tope]; null si no cabe. */
const precio = ([, lo, hi], tope, az) => (Math.max(2, lo) > Math.min(hi, tope) ? null : az.entero(Math.max(2, lo), Math.min(hi, tope)));

function compra(sit, R, N, prods, az) {
  for (let k = 0; k < 400; k++) {
    const X = az.elegir(prods), Y = az.elegir(prods);
    if (sit === "pagar") {
      if (X === Y) continue;
      const a = precio(X, R - 2, az), b = a && precio(Y, R - a, az);
      if (!a || !b || a === b) continue;
      return { a, b, op: "+", res: a + b, texto: `${N} compra ${X[0]} por ${a} € y ${Y[0]} por ${b} €. ¿Cuánto paga en total?` };
    }
    const p = precio(X, R - 1, az);
    if (!p) continue;
    if (sit === "vuelta") {
      const bs = BILLETES.filter((v) => v > p && v <= R).slice(0, 2);
      if (!bs.length) continue;
      const v = az.elegir(bs);
      if (v - p < 2) continue;
      return { a: v, b: p, op: MENOS, res: v - p, texto: `${N} compra ${X[0]} que ${cuesta(X[0])} ${p} €. Paga con un billete de ${v} €. ¿Cuánto le devuelven?` };
    }
    const t = az.entero(2, R);
    if (sit === "queda" && t - p >= 2)
      return { a: t, b: p, op: MENOS, res: t - p, texto: `${N} tiene ${t} € y compra ${X[0]}, que ${cuesta(X[0])} ${p} €. ¿Cuánto dinero le queda?` };
    if (sit === "falta" && p - t >= 2)
      return { a: p, b: t, op: MENOS, res: p - t, texto: `${N} tiene ${t} € y quiere comprar ${X[0]}, que ${cuesta(X[0])} ${p} €. ¿Cuánto dinero le falta?` };
  }
  throw new Error("No hay problemas de compras con estas opciones.");
}

export function generarDinero(params, az, n) {
  const R = params.rango || 100, sits = params.situacion ? [params.situacion] : az.barajar(SITS_DINERO);
  const nombres = az.barajar(NOMBRES), out = [], vistos = new Set();
  for (let i = 0; i < n; i++) {
    const sit = sits[i % sits.length], N = nombres[i % nombres.length];
    let q;
    for (let k = 0; k < 50; k++) { q = compra(sit, R, N, PRODUCTOS, az); if (!vistos.has(`${q.op}${q.a},${q.b}`)) break; }
    vistos.add(`${q.op}${q.a},${q.b}`);
    out.push({ datos: { texto: q.texto, sit, a: q.a, b: q.b, op: q.op, obj: "€" }, solucion: { huecos: [q.a, q.op, q.b, q.res, q.res] } });
  }
  return out;
}
