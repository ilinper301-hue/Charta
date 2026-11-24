// sumar.decenas · Sumas de decenas completas (port de _s_decenas() del motor).
// datos:    { a, b, forma }   (a, b múltiplos de 10 menores que el rango; a + b ≤ rango.
//                              forma 0: «a + b = □»; 1: «a + □ = t»; 2: «□ + b = t»; en modo bloques solo «a + b = □», forma 0)
// solucion: { huecos: [a + b] | [b] | [a] }
// Opción modo: null (rejillas de 3 columnas, 3 formas) | "bloques" (varillas de decena; 2 columnas × 5 filas).
// Sin bloques — «Más grandes»: completa min(24, 3·pares) (filas de 3; la rejilla es la de 8 filas) y media la mitad de filas; «Más ejercicios»: 33 y 15 (tarjetas ≥ 54 pt, rejilla elástica; con tope en las distintas que dé el rango).
// Con bloques (varillas) la opción «Cantidad» no cambia nada: 2 columnas × 5 filas de tarjetas con dibujo.
// 3.º (rango > 1000): cuatro clases (400 + 500, 3000 + 2000, 3000 + 400 y 3400 + 200); con rango 1000 salen las de 2.º.
// Con bloques — completa: n pares (par, ≤ 10); media: hasta 4.
// 2.º (rango > 100, sin bloques; ver _tres.js): mismos datos y solucion, con a y b múltiplos de 10, a + b ≤ rango ≤ 999.
//   Tres clases a partes iguales (8 de 24; en media, 12 mezclados): decenas (40 + 30, sumas de 100 o más incluidas),
//   centenas (300 + 400) y centenas con decenas (250 + 30, b < 100). Tres formas de hueco, como en 1.º; letra de 15 y hueco de 52 para que quepan 3 cifras.
//   Con «bloques» y rango > 100 se limita a decenas hasta 100 (varillas de decena; no se dibujan placas de cien): sale igual que con rango 100.
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B } from "../render/papel.js";
import { MIN_OP, cuantos, pintarEl } from "./_elastica.js";
import { decenasSuma3 } from "./_tres.js";

function varilla(p, x, y) {
  p.rrect(x, y, 9, 34, 0, { lw: 1.3 });
  for (let j = 1; j < 10; j++) p.line(x, y + j * 3.4, x + 9, y + j * 3.4, { lw: 0.5 });
}

export default registrar({
  id: "sumar.decenas",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const { tamano } = ctx, media = tamano === "media";
    if ((params.rango ?? 30) > 100 && params.modo !== "bloques") {
      const fijo = [24, 12], n = cuantos(ctx, 3, MIN_OP, fijo), todas = decenasSuma3(params.rango, azar, Math.max(24, n));   // repartir() da hasta n distintas
      const es = todas.slice(0, ctx.cantidad === "mas" ? Math.max(fijo[media ? 1 : 0], Math.floor(Math.min(n, todas.length) / 3) * 3) : n);
      return {
        enunciado: params.rango > 1000 ? "Suma las centenas y los millares y escribe el resultado." : "Suma las decenas y las centenas y escribe el resultado.",
        ejercicios: es.map(([a, b, forma]) => ({ datos: { a, b, forma }, solucion: { huecos: [forma === 0 ? a + b : forma === 1 ? b : a] } })),
      };
    }
    const cap = Math.min(params.rango ?? 30, 100), pool = [];
    for (let a = 10; a < cap; a += 10) for (let b = 10; b < cap; b += 10) if (a + b <= cap) pool.push([a, b]);
    if (params.modo === "bloques") {
      const m = Math.min(10, pool.length), n = Math.max(2, m - (m % 2));
      const ps = azar.muestra(pool, n).slice(0, media ? 4 : n);
      return {
        enunciado: "Suma las decenas y escribe el resultado.",
        ejercicios: ps.map(([a, b]) => ({ datos: { a, b, forma: 0 }, solucion: { huecos: [a + b] } })),
      };
    }
    const todos = [];
    for (const [a, b] of pool) for (let f = 0; f < 3; f++) todos.push([a, b, f]);
    const base = Math.min(24, pool.length * 3);
    if (ctx.cantidad === "mas") {   // todas las filas que caben (nunca menos que antes ni más de las distintas que hay)
      const n = cuantos(ctx, 3, MIN_OP, [base, Math.max(1, Math.floor(Math.floor(base / 3) * 0.5)) * 3], todos.length);
      return { enunciado: "Suma las decenas y escribe el resultado.", ejercicios: azar.muestra(todos, n).map(([a, b, forma]) => ({ datos: { a, b, forma }, solucion: { huecos: [forma === 0 ? a + b : forma === 1 ? b : a] } })) };
    }
    const es = azar.muestra(todos, base), filas = Math.floor(es.length / 3);
    const mostrar = media ? Math.max(1, Math.floor(filas * 0.5)) * 3 : es.length;
    return {
      enunciado: "Suma las decenas y escribe el resultado.",
      ejercicios: es.slice(0, mostrar).map(([a, b, forma]) => ({ datos: { a, b, forma }, solucion: { huecos: [forma === 0 ? a + b : forma === 1 ? b : a] } })),
    };
  },
  dibujar(p, act) {
    const es = act.ejercicios;
    if (act.params.modo === "bloques") {
      const { cel, cw, ch } = p.celdas(TOP, 2, 5, 10, 10);
      es.forEach((e, i) => p.ejercicio(e.id, () => {
        const [x, y] = cel[i], { a, b } = e.datos, na = a / 10, nb = b / 10;
        p.marco(x, y, cw, ch, i);
        const tot = (na + nb) * 12 + 30, xx = x + (cw - tot) / 2, yy = y + ch * 0.45;
        for (let j = 0; j < na; j++) varilla(p, xx + j * 12, yy);
        p.text(xx + na * 12 + 12, yy + 10, "+", 20, { anchor: "middle" });
        for (let j = 0; j < nb; j++) varilla(p, xx + na * 12 + 30 + j * 12, yy);
        p.linea(x, y + 8, cw, 46, [T(`${a} + ${b} =`, 19), B(50, 38, e.solucion.huecos[0])], 8);
      }));
      return;
    }
    // rejilla elástica de 3 columnas (la de 8 filas de siempre si hay pocas)
    const tres = (act.params.rango ?? 30) > 100, cuatro = (act.params.rango ?? 30) > 1000, f = cuatro ? 14 : tres ? 15 : 19, w = cuatro ? 58 : tres ? 52 : 44;   // 2.º: tres cifras
    pintarEl(p, 3, es.map((e) => {
      const { a, b, forma } = e.datos, t = a + b, s = e.solucion.huecos[0];
      return forma === 0 ? [T(`${a} + ${b} =`, f), B(w, 38, s)] : forma === 1 ? [T(`${a} +`, f), B(w, 38, s), T(`= ${t}`, f)] : [B(w, 38, s), T(`+ ${b} = ${t}`, f)];
    }), es.map((e) => e.id), 8, 8, tres ? 6 : 8);
  },
});
