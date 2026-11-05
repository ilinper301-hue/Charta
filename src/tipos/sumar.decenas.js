// sumar.decenas · Sumas de decenas completas (port de _s_decenas() del motor).
// datos:    { a, b, forma }   (a, b múltiplos de 10 menores que el rango; a + b ≤ rango.
//                              forma 0: «a + b = □»; 1: «a + □ = t»; 2: «□ + b = t»; en modo bloques solo «a + b = □», forma 0)
// solucion: { huecos: [a + b] | [b] | [a] }
// Opción modo: null (rejillas de 3 columnas, 3 formas) | "bloques" (varillas de decena; 2 columnas × 5 filas).
// Sin bloques — completa: min(24, 3·pares) (filas de 3; la rejilla es la de 8 filas); media: la mitad de filas.
// Con bloques — completa: n pares (par, ≤ 10); media: hasta 4.
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, T, B } from "../render/papel.js";

function varilla(p, x, y) {
  p.rrect(x, y, 9, 34, 0, { lw: 1.3 });
  for (let j = 1; j < 10; j++) p.line(x, y + j * 3.4, x + 9, y + j * 3.4, { lw: 0.5 });
}

export default registrar({
  id: "sumar.decenas",
  version: 1,
  generar(params, azar, { tamano }) {
    const cap = Math.min(params.rango ?? 30, 100), media = tamano === "media", pool = [];
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
    const es = azar.muestra(todos, Math.min(24, pool.length * 3)), filas = Math.floor(es.length / 3);
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
    // _pintar(top, 3, len(es)//3, es, 8): las celdas son siempre las de la rejilla de 8 filas (generar ya recorta la media)
    const GX = 10, GY = 8, cw = (W - 2 * M - 2 * GX) / 3, ch = (TOP - M - 7 * GY) / 8;
    es.forEach((e, i) => p.ejercicio(e.id, () => {
      const r = Math.floor(i / 3), k = i % 3, x = M + k * (cw + GX), y = TOP - (r + 1) * ch - r * GY;
      const { a, b, forma } = e.datos, t = a + b, s = e.solucion.huecos[0];
      p.marco(x, y, cw, ch);
      p.linea(x, y, cw, ch, forma === 0 ? [T(`${a} + ${b} =`), B(44, 38, s)] : forma === 1 ? [T(`${a} +`), B(44, 38, s), T(`= ${t}`)] : [B(44, 38, s), T(`+ ${b} = ${t}`)], 8);
    }));
  },
});
