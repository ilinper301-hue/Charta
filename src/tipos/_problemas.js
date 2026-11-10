// Charta · núcleo común de los problemas de 1.º (bloque 8): plantillas con nombres y objetos, y dibujo.
// Cada problema = un enunciado en prosa + «Operación:» (a ? b = resultado) + «Respuesta:» (número y objeto).
// datos:    { texto, sit, a, b, op: "+" | "−", obj }          (obj = nombre plural del objeto)
// solucion: { huecos: [a, op, b, resultado, resultado] }      (orden de las cajas de izquierda a derecha y de arriba abajo)
// Todas las cantidades que aparecen y el resultado valen ≥ 2: así el plural del objeto es siempre correcto.
// Completa: 4 problemas; media: 2 (la mitad de filas, como el resto de tipos).
import { TOP, T, B, MENOS, INK, COLOR_SOLUCION } from "../render/papel.js";
import { llevaSuma3, llevaResta3 } from "./_tres.js";

export const NOMBRES = ["Ana", "Luis", "Marta", "Pablo", "Lucía", "Hugo", "Sara", "Daniel", "Carla", "Mario", "Paula", "Diego",
  "Elena", "Leo", "Irene", "Nico", "Julia", "Pedro", "Alba", "Sofía", "Martín", "Laura", "Hugo", "Noa"].filter((n, i, l) => l.indexOf(n) === i);
/** [plural, género]: f = femenino, m = masculino (para «cuántas» / «cuántos»). */
export const OBJETOS = [["manzanas", "f"], ["peras", "f"], ["galletas", "f"], ["pegatinas", "f"], ["canicas", "f"], ["flores", "f"], ["pelotas", "f"],
  ["cartas", "f"], ["fresas", "f"], ["cromos", "m"], ["lápices", "m"], ["globos", "m"], ["libros", "m"], ["caramelos", "m"], ["coches", "m"],
  ["bombones", "m"], ["plátanos", "m"], ["huevos", "m"], ["botones", "m"], ["juguetes", "m"]];

const cuantos = (g) => (g === "f" ? "Cuántas" : "Cuántos");
const cuantosMin = (g) => (g === "f" ? "cuántas" : "cuántos");
const VERBOS_ANADIR = ["compra", "encuentra", "recibe", "consigue"];
const VERBOS_QUITAR = (b) => [`Regala ${b}.`, `Pierde ${b}.`, `Da ${b} a un amigo.`];

/** Situaciones: cada una da { texto, op, a, b } a partir de (N, M, a, b, o, g) con el mayor primero cuando resta. */
export const SITUACIONES = {
  suma: {
    juntar: ({ N, M, a, b, o, g }, az) => az.elegir([
      `${N} tiene ${a} ${o} y ${M} tiene ${b}. ¿${cuantos(g)} ${o} tienen entre ${N} y ${M}?`,
      `En una caja hay ${a} ${o} y en otra hay ${b}. ¿${cuantos(g)} ${o} hay en total?`,
    ]),
    anadir: ({ N, a, b, o, g }, az) => az.elegir([
      `${N} tiene ${a} ${o}. Luego ${az.elegir(VERBOS_ANADIR)} ${b} más. ¿${cuantos(g)} ${o} tiene ahora?`,
      `En el cesto hay ${a} ${o}. Se ponen ${b} más. ¿${cuantos(g)} ${o} hay ahora en el cesto?`,
    ]),
  },
  resta: {
    quitar: ({ N, a, b, o, g }, az) => az.elegir([
      `${N} tiene ${a} ${o}. ${az.elegir(VERBOS_QUITAR(b))} ¿${cuantos(g)} ${o} le quedan?`,
      `En la caja hay ${a} ${o}. Se sacan ${b}. ¿${cuantos(g)} ${o} quedan en la caja?`,
    ]),
    comparar: ({ N, M, a, b, o, g }, az) => az.elegir([
      `${N} tiene ${a} ${o} y ${M} tiene ${b}. ¿${cuantos(g)} ${o} más tiene ${N} que ${M}?`,
      `${N} tiene ${a} ${o} y ${M} tiene ${b}. ¿${cuantos(g)} ${o} menos tiene ${M} que ${N}?`,
    ]),
    faltar: ({ N, a, b, o, g }) =>
      `${N} necesita ${a} ${o} para completar su colección. Ya tiene ${b}. ¿${cuantos(g)} ${o} le faltan?`,
  },
};
const SITS = { suma: ["juntar", "anadir"], resta: ["quitar", "comparar", "faltar"] };
const OPERACION = { suma: "+", resta: MENOS };

/** Cantidades según rango y nivel de llevadas (sumar: a + b ≤ R; restar: a ≤ R, a − b ≥ 2). Todas ≥ 2. */
function cantidades(op, R, nivel, az) {
  const lleva = R > 100 ? (op === "suma" ? llevaSuma3 : llevaResta3)   // 2.º: llevada en cualquier columna
    : op === "suma" ? (a, b) => (a % 10) + (b % 10) >= 10 : (a, b) => a % 10 < b % 10;
  const par = [], ok = (a, b) => !(op === "suma" ? a + b > R || a + b < 4 : a - b < 2);
  if (R > 100) {   // 2.º: muestra de 4.000 parejas (recorrerlas todas, hasta 999 × 999, es lento)
    const vistos = new Set();
    for (let k = 0; k < 4000; k++) { const a = az.entero(2, R), b = az.entero(2, R); if (ok(a, b) && !vistos.has(a * 1000 + b)) { vistos.add(a * 1000 + b); par.push([a, b]); } }
  } else for (let a = 2; a <= R; a++) for (let b = 2; b <= R; b++) if (ok(a, b)) par.push([a, b]);
  const con = par.filter(([a, b]) => lleva(a, b)), sin = par.filter(([a, b]) => !lleva(a, b));
  const lista = { sin, con, mezcla: par }[nivel || "sin"];
  if (!lista.length || (nivel === "mezcla" && (!con.length || !sin.length)) || (nivel === "con" && !con.length))
    throw new Error(`Con llevadas necesita números hasta 20 o más.`);
  return { lista, con, sin };
}

/** Genera `n` problemas del tipo "suma" | "resta" | "mixtos". */
export function generarProblemas(clase, params, az, n) {
  const R = params.rango || 20, nivel = params.nivel || "sin";
  const clases = clase === "mixtos" ? ["suma", "resta"] : [clase];
  const pools = Object.fromEntries(clases.map((c) => [c, cantidades(c, R, nivel, az)]));
  const sitsPermitidas = (c) => (params.situacion ? [params.situacion] : SITS[c]);
  const nombres = az.barajar(NOMBRES), objetos = az.barajar(OBJETOS);
  const vistos = new Set(), out = [];
  for (let i = 0; i < n; i++) {
    const c = clases[i % clases.length];          // mixtos: alterna suma y resta
    const { lista, con, sin } = pools[c];
    // mezcla: alterna con y sin llevada
    const origen = nivel === "mezcla" ? (i % 2 === 0 ? con : sin) : lista;
    let a, b, sit;
    for (let k = 0; k < 60; k++) {
      [a, b] = az.elegir(origen.length ? origen : lista);
      sit = az.elegir(sitsPermitidas(c));
      if (!vistos.has(`${c}${a},${b}`)) break;
    }
    vistos.add(`${c}${a},${b}`);
    const N = nombres[(2 * i) % nombres.length], M = nombres[(2 * i + 1) % nombres.length];
    const [obj, g] = objetos[i % objetos.length];
    const res = c === "suma" ? a + b : a - b;
    const texto = SITUACIONES[c][sit]({ N, M, a, b, o: obj, g }, az);
    out.push({ texto, sit, a, b, op: OPERACION[c], obj, g, res, nombres: [N, M] });
  }
  return out;
}

/** Parte el texto en líneas que quepan en `ancho` con la letra `fs`. */
export function partir(p, texto, ancho, fs) {
  const lineas = []; let actual = "";
  for (const pal of texto.split(" ")) {
    const prueba = actual ? actual + " " + pal : pal;
    if (actual && p.ancho(prueba, "PR", fs) > ancho) { lineas.push(actual); actual = pal; } else actual = prueba;
  }
  if (actual) lineas.push(actual);
  return lineas;
}

/** Dibujo común: una tarjeta por problema (4 en completa, 2 en media). */
export function dibujarProblemas(p, act) {
  const es = act.ejercicios, filas = 4;
  const { cel, cw, ch } = p.celdas(TOP, 1, filas);
  es.slice(0, p.n(filas)).forEach((e, i) => p.ejercicio(e.id, () => {
    const [x, y] = cel[i], d = e.datos, h = e.solucion.huecos;
    p.marco(x, y, cw, ch, i);
    const fs = 14.5, lineas = partir(p, d.texto, cw - 84, fs);
    lineas.forEach((l, j) => p.text(x + 44, y + ch - 32 - j * 20, l, fs, { f: "PR" }));
    const hb = 38;
    // «Operación:  [a] [+] [b] = [resultado]»
    p.linea(x + 20, y + 56, cw - 40, hb + 4, [T("Operación:", 13, "PR"), B(46, hb, h[0]), B(36, hb, h[1]), B(46, hb, h[2]), T("=", 19), B(52, hb, h[3])], 10);
    // «Respuesta:  [resultado] manzanas»
    p.linea(x + 20, y + 8, cw - 40, hb + 4, [T("Respuesta:", 13, "PR"), B(52, hb, h[4]), T(d.obj, 13, "PR")], 10);
  }));
}

/** Fábrica de tipo: problemas.<clase>. */
export const enunciadoProblemas = "Lee, escribe la operación y contesta.";
export function ejerciciosProblemas(clase, params, az, tamano) {
  return generarProblemas(clase, params, az, tamano === "media" ? 2 : 4).map((d) => ({
    datos: { texto: d.texto, sit: d.sit, a: d.a, b: d.b, op: d.op, obj: d.obj },
    solucion: { huecos: [d.a, d.op, d.b, d.res, d.res] },
  }));
}

// ---------------------------------------------------------------- modelo de barras (problemas.barras)
const BARRA_W = 360, BARRA_H = 24;

/** Llave sobre [x0, x1] a la altura y (por encima del trazo). */
function llave(p, x0, x1, y, tinta) {
  p.path([["M", x0, y], ["L", x0, y + 6], ["L", x1, y + 6], ["L", x1, y]], { lw: 1.2, stroke: tinta });
}
/** Segmento con su etiqueta: `val` = número, o null si es la incógnita («?»: la respuesta en rojo va solo en los huecos). */
function segmento(p, x, y, w, h, val, res, tinta, relleno, hijos = null) {
  p.rrect(x, y, w, h, 3, { lw: 1.4, fill: relleno, stroke: tinta });
  p.text(x + w / 2, y + h / 2 - 5, val === null ? "?" : String(val), 15, { f: "PB", anchor: "middle", gris: INK });
}
/** Etiqueta del total (o «?») sobre la llave. */
function etiquetaLlave(p, cx, y, val, res, tinta) {
  p.text(cx, y, val === null ? "?" : String(val), 14, { f: "PB", anchor: "middle", gris: INK });
}

/** Barras del problema entre y (base) e y + ~48. `tinta`: INK (barras dadas) o COLOR_SOLUCION (trazo rojo: las dibuja el alumno). */
function dibujarBarra(p, d, res, x, w, y, tinta) {
  const x0 = d.sit === "comparar" ? x + 100 : x + (w - BARRA_W) / 2, h = BARRA_H, GR = [0.93, 0.84];
  const fill = (k) => (tinta === COLOR_SOLUCION ? null : GR[k]);
  const reparto = (u, v) => {                          // anchos proporcionales con un mínimo para que quepa la etiqueta
    const min = 36, tot = BARRA_W; let wu = Math.max(min, (tot * u) / (u + v)); wu = Math.min(wu, tot - min); return [wu, tot - wu];
  };
  if (d.sit === "juntar" || d.sit === "anadir") {
    const [wa, wb] = reparto(d.a, d.b), yb = y + 10;
    segmento(p, x0, yb, wa, h, d.a, res, tinta, fill(0)); segmento(p, x0 + wa, yb, wb, h, d.b, res, tinta, fill(1));
    llave(p, x0, x0 + BARRA_W, yb + h + 4, tinta); etiquetaLlave(p, x0 + BARRA_W / 2, yb + h + 14, null, res, tinta);
  } else if (d.sit === "quitar" || d.sit === "faltar") {
    const [wb, wr] = reparto(d.b, res), yb = y + 10;
    segmento(p, x0, yb, wb, h, d.b, res, tinta, fill(0)); segmento(p, x0 + wb, yb, wr, h, null, res, tinta, fill(1));
    llave(p, x0, x0 + BARRA_W, yb + h + 4, tinta); etiquetaLlave(p, x0 + BARRA_W / 2, yb + h + 14, d.a, res, tinta);
  } else {                                              // comparar: dos barras, la diferencia es la incógnita
    const h2 = 18, ya = y + 24, yb = y;
    const wb = BARRA_W * d.b / d.a, wr = BARRA_W - wb;
    const [n1, n2] = d.nombres;
    p.text(x0 - 8, ya + h2 / 2 - 4, n1, 11, { f: "PR", anchor: "end", gris: INK });
    p.text(x0 - 8, yb + h2 / 2 - 4, n2, 11, { f: "PR", anchor: "end", gris: INK });
    p.rrect(x0, ya, wb, h2, 3, { lw: 1.4, fill: fill(0), stroke: tinta });
    p.text(x0 + wb / 2, ya + h2 / 2 - 5, String(d.b), 14, { f: "PB", anchor: "middle", gris: INK });
    segmento(p, x0 + wb, ya, wr, h2, null, res, tinta, fill(1));
    p.rrect(x0, yb, wb, h2, 3, { lw: 1.4, fill: fill(0), stroke: tinta });
    p.text(x0 + wb / 2, yb + h2 / 2 - 5, String(d.b), 14, { f: "PB", anchor: "middle", gris: INK });
    llave(p, x0, x0 + BARRA_W, ya + h2 + 3, tinta); etiquetaLlave(p, x0 + BARRA_W / 2, ya + h2 + 13, d.a, res, tinta);
  }
}

/** Como dibujarProblemas, con la barra debajo del enunciado (4 por página, 2 en media; enunciado de 1–2 líneas). */
export function dibujarProblemasBarras(p, act) {
  const es = act.ejercicios, filas = 4, enBlanco = act.params.barra === "blanco";
  const { cel, cw, ch } = p.celdas(TOP, 1, filas);
  es.slice(0, p.n(filas)).forEach((e, i) => p.ejercicio(e.id, () => {
    const [x, y] = cel[i], d = e.datos, h = e.solucion.huecos;
    p.marco(x, y, cw, ch, i);
    const fs = 14, lineas = partir(p, d.texto, cw - 84, fs);
    if (lineas.length > 2) throw new Error(`Enunciado de más de 2 líneas: ${d.texto}`);
    lineas.forEach((l, j) => p.text(x + 44, y + ch - 30 - j * 18, l, fs, { f: "PR" }));
    const yb = y + 56;                                       // base de la zona de la barra (≈ 56 … 112 sobre la tarjeta)
    if (!enBlanco) dibujarBarra(p, d, h[3], x, cw, yb, INK);
    else if (!p.solucion) {
      p.rrect(x + 44, yb - 2, cw - 88, 52, 6, { lw: 0.8, fill: 1, stroke: 0.7 });
      p.text(x + cw / 2, yb + 20, "Dibuja aquí la barra", 10.5, { f: "PR", anchor: "middle", gris: 0.65 });
    } else dibujarBarra(p, d, h[3], x, cw, yb, COLOR_SOLUCION);
    const hb = 36, fl = 12;
    p.linea(x + 14, y + 6, cw - 28, hb + 4, [T("Operación:", fl, "PR"), B(40, hb, h[0]), B(30, hb, h[1]), B(40, hb, h[2]), T("=", 18), B(46, hb, h[3]),
      T("Respuesta:", fl, "PR"), B(46, hb, h[4]), T(d.obj, fl, "PR")], 7);
  }));
}
