// multiplicar.vertical · Multiplicaciones en vertical por una cifra (3.º, lote 3, bloque 13; solo curso 3, sin rango).
// datos:    { a, b }   (a de 2 o 3 cifras, sin cero final; b de 2 a 9)
// solucion: { huecos: [cifras del producto] }   (de izquierda a derecha; solo las columnas que tiene el producto: las llevadas no son huecos)
// Opciones: cifras (None = a de 2 cifras · 3 = de 3 cifras) · nivel (None/"sin" = sin llevadas, "con" = con llevada, "mezcla" = alternadas).
// Sin llevadas: cada cifra de a por b es menor que 10. Con llevada: al menos una llevada escrita sobre una cifra de a
// (la última, la que sale por la izquierda, ya es una cifra del producto). Sin repetir la operación (y, mientras se pueda, el número a); ningún b más de unas pocas veces.
// Dibujo: columnas D, U (2 cifras: C, D, U en el producto) o C, D, U (3 cifras: UM, C, D, U); casillas pequeñas de llevada sobre
// las cifras de a (vacías en papel; en la solución, la llevada en rojo). Completa: 12 (4 filas × 3); media: 6.
import { registrar } from "../nucleo/tipos.js";
import { TOP, COLOR_SOLUCION } from "../render/papel.js";
import { POR } from "./_multiplicar.js";

const cifras = (n) => String(n).split("").map(Number);
/** Llevadas de a × b (b de una cifra): el elemento q es lo que sale de la columna q (0 = unidades) hacia la siguiente. */
export function llevadas(a, b) {
  let c = 0;
  return cifras(a).reverse().map((d) => (c = Math.floor((d * b + c) / 10)));
}
const sinLleva = (a, b) => cifras(a).every((d) => d * b < 10);
const conLleva = (a, b) => llevadas(a, b).slice(0, -1).some((c) => c > 0);   // la última no se escribe

/** Todas las parejas (a, b) de n cifras del nivel dado. */
function candidatos(n, con) {
  const out = [], lo = n === 2 ? 11 : 102, hi = n === 2 ? 99 : 999;
  for (let a = lo; a <= hi; a++) if (a % 10) for (let b = 2; b <= 9; b++) if (con ? conLleva(a, b) : sinLleva(a, b)) out.push([a, b]);
  return out;
}

export default registrar({
  id: "multiplicar.vertical",
  version: 1,
  generar(params, azar, { tamano }) {
    const n = params.cifras === 3 ? 3 : 2, nivel = params.nivel || "sin", cnt = tamano === "media" ? 6 : 12;
    const bancos = { false: candidatos(n, false), true: candidatos(n, true) };
    const ps = [], vistos = new Set(), usadas = new Set(), porB = {};
    const cap = (pool) => Math.ceil(cnt / new Set(pool.map((q) => q[1])).size) + 1;   // ningún b se repite demasiado
    for (let i = 0; i < cnt; i++) {
      const con = nivel === "con" || (nivel === "mezcla" && i % 2 === 1), pool = bancos[con], tope = cap(pool);
      const libres = pool.filter((q) => !vistos.has(q.join()) && (porB[q[1]] ?? 0) < tope);
      const nuevas = libres.filter(([a]) => !usadas.has(a));   // mejor un a que no haya salido; si no queda, otro b con el mismo a
      const lib = nuevas.length ? nuevas : libres.length ? libres : pool.filter((q) => !vistos.has(q.join()));
      if (!lib.length) throw new Error("No hay multiplicaciones distintas para esta ficha.");
      const q = azar.elegir(lib); vistos.add(q.join()); usadas.add(q[0]); porB[q[1]] = (porB[q[1]] ?? 0) + 1; ps.push(q);
    }
    return {
      enunciado: "Multiplica de derecha a izquierda y escribe las llevadas.",
      ejercicios: azar.barajar(ps).map(([a, b]) => ({ datos: { a, b }, solucion: { huecos: cifras(a * b) } })),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 3, 4);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { a, b } = e.datos, n = String(a).length, cols = n + 1, cx = x + cw / 2;
      const ETQ = cols === 4 ? ["UM", "C", "D", "U"] : ["C", "D", "U"];
      const sep = cols === 4 ? 30 : 36, xs = Array.from({ length: cols }, (_, k) => cx + (k - (cols - 1) / 2) * sep), fs = 24;
      const r0 = ch - 64, rl = r0 - 30, yl = rl - 8, nd = e.solucion.huecos.length;
      p.marco(x, y, cw, ch, i);
      ETQ.forEach((l, k) => p.text(xs[k], y + ch - 16, l, 11, { f: "PM", anchor: "middle", gris: 0.3 }));
      cifras(a).forEach((d, k) => p.text(xs[cols - n + k], y + r0, String(d), fs, { anchor: "middle" }));
      p.text(xs[cols - 1], y + rl, String(b), fs, { anchor: "middle" });
      p.text(xs[0] - (cols === 4 ? 28 : 34), y + rl, POR, fs, { anchor: "middle" });
      p.line(xs[0] - 26, y + yl, xs[cols - 1] + 26, y + yl, { lw: 1.6 });
      const ll = llevadas(a, b);
      for (let q = 0; q < n - 1; q++) {   // sobre D (llevada de U), sobre C (llevada de D)
        const k = cols - 2 - q;
        p.rrect(xs[k] - 11, y + ch - 42, 22, 16, 4, { lw: 0.9, fill: 1, stroke: 0.55 });
        // «#c62828» = COLOR_SOLUCION en minúsculas: es la llevada, no un hueco (test_tipos cuenta los fill="#C62828" de los huecos)
        if (p.solucion && ll[q] > 0) p.text(xs[k], y + ch - 38, String(ll[q]), 12, { anchor: "middle", gris: COLOR_SOLUCION.toLowerCase() });
      }
      e.solucion.huecos.forEach((s, j) => { const k = cols - nd + j; p.caja(xs[k] - (cols === 4 ? 13 : 15), y + 12, cols === 4 ? 26 : 30, 40, null, 22, s); });
    }));
  },
});
