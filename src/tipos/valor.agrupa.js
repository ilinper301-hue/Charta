// valor.agrupa · Agrupa en decenas (port de _v_agrupa() del motor).
// datos:    { n, forma: "c" | "s" | "q" | "t", jit: [[jx, jy]…] }   (n dibujos en filas de 10; jit = desvío de cada dibujo, en pt, −1.5..1.5)
// solucion: { huecos: [decenas, unidades] }   (rodear los grupos de 10 no tiene hueco)
// Rango mínimo 20 (error «necesita» si no). Números: 10..min(R, 49); 1 decena completa + el resto con unidades (11..).
// 2.º (rango 200–300, de 100 en 100): datos { n, centenas: true } — n/10 barras de diez en filas de 10 y las unidades
//   (cubos); el alumno rodea cada fila de 10 barras. solucion: { huecos: [centenas, decenas, unidades] }.
//   n de 100 a min(R, 299); una única centena exacta.
// Completa: 6 casillas (3 filas × 2); media: 2 (1 decena completa y 1 con unidades).
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { forma } from "./orden.cantidad.js";

/** 2.º: barras de diez (filas de 10) y cubos a la derecha; abajo, C, D y U con su rótulo encima. */
function celda2(p, e, i, x, y, cw, ch) {
  const { n } = e.datos, d = Math.floor(n / 10), u = n % 10, filas = Math.ceil(d / 10);
  p.marco(x, y, cw, ch, i);
  const ax = x + 22, aw = cw - 44 - 34, sx = aw / 10, bw = Math.min(9, sx * 0.5), y1 = y + 72, y2 = y + ch - 30;
  const fh = (y2 - y1) / 3, bh = Math.min(36, fh - 7), ub = bh / 10;
  for (let k = 0; k < d; k++) {
    const f = Math.floor(k / 10), c = k % 10, bx = ax + c * sx + (sx - bw) / 2, by = y2 - (f + 1) * fh + (fh - bh) / 2 - (3 - filas) * fh / 2;
    p.rrect(bx, by, bw, bh, 0, { lw: 1.1, fill: 1 });
    for (let j = 1; j < 10; j++) p.line(bx, by + j * ub, bx + bw, by + j * ub, { lw: 0.5 });
  }
  const cubo = 8, cx = x + cw - 22 - 3 * cubo - 4, cy = (y1 + y2) / 2 + 14;
  for (let k = 0; k < u; k++) p.rrect(cx + (k % 3) * (cubo + 2), cy - Math.floor(k / 3) * (cubo + 2), cubo, cubo, 0, { lw: 1.1, fill: 1 });
  const x0 = x + (cw - 200) / 2;
  ["centenas", "decenas", "unidades"].forEach((lab, j) => {
    const bx = x0 + j * 80;
    p.caja(bx, y + 12, 40, 34, null, 22, e.solucion.huecos[j]);
    p.text(bx + 20, y + 52, lab, 9.5, { f: "PM", anchor: "middle" });
  });
}

export default registrar({
  id: "valor.agrupa",
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 20, cap = Math.min(R, 49), cnt = tamano === "media" ? 2 : 6;
    if (R >= 100) {
      const c2 = Math.min(R, 299), exactas = [], otros = [];
      for (let v = 100; v <= c2; v++) (v % 100 ? otros : exactas).push(v);
      return {
        enunciado: "Rodea grupos de 10 decenas y escribe cuántas centenas, decenas y unidades hay.",
        ejercicios: azar.barajar([azar.elegir(exactas), ...azar.muestra(otros, cnt - 1)]).map((n) => ({
          datos: { n, centenas: true }, solucion: { huecos: [Math.floor(n / 100), Math.floor(n / 10) % 10, n % 10] },
        })),
      };
    }
    if (cap < 20) throw new Error("Agrupa en decenas necesita un rango máximo de al menos 20.");
    const mult = [], rest = [];
    for (let v = 10; v <= cap; v++) (v % 10 ? rest : mult).push(v);
    // rest incluye 11..cap sin múltiplos de 10
    const nums = azar.barajar([azar.elegir(mult), ...azar.muestra(rest, cnt - 1)]);
    const r2 = (v) => Math.round(v * 100) / 100 + 0;   // + 0: sin −0 (no sobrevive a JSON)
    return {
      enunciado: "Rodea grupos de 10 y escribe cuántas decenas y unidades hay.",
      ejercicios: nums.map((n, i) => ({
        datos: { n, forma: "csqt"[i % 4], jit: Array.from({ length: n }, () => [r2(azar.real() * 3 - 1.5), r2(azar.real() * 3 - 1.5)]) },
        solucion: { huecos: [Math.floor(n / 10), n % 10] },
      })),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 2, 3);
    if (act.ejercicios[0]?.datos.centenas) return act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => celda2(p, e, i, ...cel[i], cw, ch)));
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { n, forma: kind, jit } = e.datos;
      p.marco(x, y, cw, ch, i);
      const ax = x + 16, aw = cw - 32, rows = Math.ceil(n / 10);
      const sx = aw / 10, sy = Math.min(26, (ch - 92) / rows), r = Math.min(7, sx * 0.3);
      const ytop = y + ch - 38 - sy / 2 - ((ch - 92) - rows * sy) / 2;
      for (let k = 0; k < n; k++) {
        const rr = Math.floor(k / 10), cc = k % 10;
        forma(p, kind, ax + sx / 2 + cc * sx + jit[k][0], ytop - rr * sy + jit[k][1], r);
      }
      const x0 = x + (cw - 202) / 2;
      ["decenas", "unidades"].forEach((lab, j) => {
        const bx = x0 + j * 110;
        p.caja(bx, y + 12, 40, 34, null, 22, e.solucion.huecos[j]);
        p.text(bx + 46, y + 25, lab, 11, { f: "PM" });
      });
    }));
  },
});
