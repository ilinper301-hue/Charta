// restar.decenas · Restas de decenas (port de _r_decenas() del motor).
// datos:    { a, b, forma }     (a, b decenas, 20 ≤ a ≤ min(rango, 100), 10 ≤ b < a)
//           forma 0: «a − b = ☐»; forma 1: «a − ☐ = t»; forma 2: «☐ − b = t» (t = a − b). Con bloques, siempre forma 0.
// solucion: { huecos: [a − b] } (forma 0) · [b] (forma 1) · [a] (forma 2)
// Opción modo: null (solo números) o "bloques" (varillas de 10; se tachan las b/10 últimas).
// Solo números: «Más grandes» = con 3 formas por pareja, min(24, 3·parejas) ejercicios en filas de 3 (media: la mitad de filas, como el motor); «Más ejercicios»: 33 y 15 (tarjetas ≥ 54 pt, rejilla elástica; con tope en las distintas que dé el rango).
// Con bloques (varillas) la opción «Cantidad» no cambia nada.
// Bloques: parejas distintas, máx. 10 pares (2×5 tarjetas); media: 4 tarjetas como máximo. Con rango 30 solo hay 3 parejas.
// 2.º (rango > 100, sin bloques; ver _tres.js): mismos datos y solucion, con a y b múltiplos de 10, 10 ≤ b < a ≤ rango ≤ 999.
//   Tres clases a partes iguales (8 de 24; en media, 12 mezclados): decenas (70 − 30), centenas (700 − 300) y
//   centenas con decenas (450 − 20, b < 100). Tres formas de hueco como en 1.º; letra de 15 y hueco de 52 para que quepan 3 cifras.
//   Con «bloques» y rango > 100 se limita a decenas hasta 100 (no se dibujan placas de cien): sale igual que con rango 100.
import { registrar } from "../nucleo/tipos.js";
import { TOP, MENOS, T, B } from "../render/papel.js";
import { MIN_OP, cuantos, pintarEl } from "./_elastica.js";
import { decenasResta3 } from "./_tres.js";

const filasMedia = (filas, tamano) => (tamano === "media" ? Math.max(1, Math.floor(filas * 0.5)) : filas);

export default registrar({
  id: "restar.decenas",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const { tamano } = ctx;
    const R = params.rango ?? 30;
    if (R < 30) throw new Error("Restas de decenas necesita un rango máximo de al menos 30.");
    if (R > 100 && params.modo !== "bloques") {
      const fijo = [24, 12], n = cuantos(ctx, 3, MIN_OP, fijo), todas = decenasResta3(R, azar, Math.max(24, n));   // repartir() da hasta n distintas
      return {
        enunciado: "Resta las decenas y las centenas y escribe el resultado.",
        ejercicios: todas.slice(0, ctx.cantidad === "mas" ? Math.max(fijo[tamano === "media" ? 1 : 0], Math.floor(Math.min(n, todas.length) / 3) * 3) : n).map(([a, b, forma]) => ({ datos: { a, b, forma }, solucion: { huecos: [[a - b], [b], [a]][forma] } })),
      };
    }
    const cap = Math.min(R, 100), pool = [];
    for (let a = 20; a <= cap; a += 10) for (let b = 10; b < a; b += 10) pool.push([a, b]);
    if (params.modo === "bloques") {
      const m = Math.min(10, pool.length), n = Math.max(2, m - (m % 2)), celdas = filasMedia(5, tamano) * 2;
      return {
        enunciado: "Resta las decenas y escribe el resultado.",
        ejercicios: azar.muestra(pool, n).slice(0, celdas).map(([a, b]) => ({ datos: { a, b, forma: 0 }, solucion: { huecos: [a - b] } })),
      };
    }
    const todos = pool.flatMap(([a, b]) => [0, 1, 2].map((f) => [a, b, f])), base = Math.min(24, pool.length * 3);
    if (ctx.cantidad === "mas") {   // todas las filas que caben (nunca menos que antes ni más de las distintas que hay)
      const m = cuantos(ctx, 3, MIN_OP, [base, filasMedia(base / 3, "media") * 3], todos.length);
      return { enunciado: "Resta las decenas y escribe el resultado.", ejercicios: azar.muestra(todos, m).map(([a, b, forma]) => ({ datos: { a, b, forma }, solucion: { huecos: [[a - b], [b], [a]][forma] } })) };
    }
    const ex = azar.muestra(todos, base);
    const filas = ex.length / 3, n = filasMedia(filas, tamano) * 3;
    return {
      enunciado: "Resta las decenas y escribe el resultado.",
      ejercicios: ex.slice(0, n).map(([a, b, forma]) => ({ datos: { a, b, forma }, solucion: { huecos: [[a - b], [b], [a]][forma] } })),
    };
  },
  dibujar(p, act) {
    const es = act.ejercicios;
    if (act.params.modo === "bloques") {
      const { cel, cw, ch } = p.celdas(TOP, 2, 5, 10, 10);
      es.forEach((e, i) => p.ejercicio(e.id, () => {
        const [x, y] = cel[i], { a, b } = e.datos, na = a / 10, nb = b / 10, xx = x + (cw - na * 12) / 2, yy = y + ch * 0.45;
        p.marco(x, y, cw, ch, i);
        for (let j = 0; j < na; j++) {
          p.rrect(xx + j * 12, yy, 9, 34, 0, { lw: 1.3 });
          for (let k = 1; k < 10; k++) p.line(xx + j * 12, yy + k * 3.4, xx + j * 12 + 9, yy + k * 3.4, { lw: 0.5 });
        }
        for (let j = na - nb; j < na; j++) {
          p.line(xx + j * 12 - 1, yy - 2, xx + j * 12 + 10, yy + 36, { lw: 1.9 });
          p.line(xx + j * 12 - 1, yy + 36, xx + j * 12 + 10, yy - 2, { lw: 1.9 });
        }
        p.linea(x, y + 8, cw, 46, [T(`${a} ${MENOS} ${b} =`, 19), B(50, 38, e.solucion.huecos[0])], 8);
      }));
      return;
    }
    // rejilla elástica de 3 columnas (la de 8 filas de siempre si hay pocas)
    const tres = (act.params.rango ?? 30) > 100, cuatro = (act.params.rango ?? 30) > 1000, f = cuatro ? 14 : tres ? 15 : 19, w = cuatro ? 58 : tres ? 52 : 44;   // 2.º: tres cifras
    pintarEl(p, 3, es.map((e) => {
      const { a, b, forma } = e.datos, s = e.solucion.huecos[0], t = a - b;
      return forma === 0 ? [T(`${a} ${MENOS} ${b} =`, f), B(w, 38, s)]
        : forma === 1 ? [T(`${a} ${MENOS}`, f), B(w, 38, s), T(`= ${t}`, f)] : [B(w, 38, s), T(`${MENOS} ${b} = ${t}`, f)];
    }), es.map((e) => e.id), 8, 8, tres ? 6 : 8);
  },
});
