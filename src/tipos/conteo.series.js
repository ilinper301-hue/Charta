// conteo.series · Series mixtas (port de _c_series(…, [1, 2, 5, 10] / [1, 2, 5]) del motor).
// También exporta generarSerie() y dibujarSerie(), que usan conteo.serie2, conteo.serie5 y conteo.serie10.
// datos:    { paso, valores: [v…], huecos: [j…], sube }   (valores de izquierda a derecha; huecos = posiciones vacías;
//           sube = true si la serie crece hacia la derecha; el paso de cada serie va en `paso`)
// solucion: { huecos: [valores de los huecos, de izquierda a derecha] }
// Opciones: huecos (1–4, por defecto 3). Rango ≥ 20: pasos 1, 2, 5 y 10; si no, 1, 2 y 5.
// Completa: 8 series; media: 4 (la mitad de filas). Cada serie tiene hasta 6 números.
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, INK } from "../render/papel.js";
import { elegirHuecos } from "./conteo.serie1.js";

/** Cuerpo de _c_series(top, R, rnd, huecos, pasos). */
export function generarSerie(pasos, params, azar, tamano, enunciado = "Completa cada serie escribiendo los números que faltan en los cuadros grises.") {
  const R = params.rango ?? 10, h = params.huecos ?? 3, filas = tamano === "media" ? 4 : 8, usadas = new Set(), ejercicios = [];
  for (let i = 0; i < filas; i++) {
    const s = pasos.length > 1 ? azar.elegir(pasos) : pasos[0];
    const L = Math.min(6, Math.floor(R / s) + 1);
    if (L < 3) throw new Error(`Esta serie necesita un rango máximo mayor (paso ${s}, máx. ${R}).`);
    const lo = s === 1 ? 1 : 0, todas = [];
    for (let a = lo; a <= R - (L - 1) * s; a++) todas.push(a);
    let cand = todas.filter((a) => s === 1 || (s === 2 && a % 2 === Math.floor(i / 2) % 2) || ((s === 5 || s === 10) && a % s === 0));
    if (!cand.length) cand = todas.filter((a) => s === 1 || s === 2 || a % s === 0);
    const libres = cand.filter((a) => !usadas.has(a + "," + s));
    if (libres.length) cand = libres;
    const a = azar.elegir(cand); usadas.add(a + "," + s);
    const vals = Array.from({ length: L }, (_, j) => a + j * s);
    const sube = i % 2 === 0;
    if (!sube) vals.reverse();
    const huecos = elegirHuecos(L, Math.min(h, L - 2), azar);
    ejercicios.push({ datos: { paso: s, valores: vals, huecos, sube }, solucion: { huecos: huecos.map((j) => vals[j]) } });
  }
  return { enunciado, ejercicios };
}

/** Dibujo de _c_series(): 8 filas (en media se dibujan las 4 primeras). */
export function dibujarSerie(p, act) {
  const nrows = 8, GY = 8, rh = (TOP - M - (nrows - 1) * GY) / nrows, bw = 52, bh = 46, g = 8, lw = 124;
  act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
    const { paso, valores, huecos, sube } = e.datos, L = valores.length;
    const y = TOP - (i + 1) * rh - i * GY;
    p.tarjeta(M, y, W - 2 * M, rh);
    p.text(M + 16, y + rh / 2 + 2, `de ${paso} en ${paso}`, 12.5, { f: "PB" });
    p.text(M + 34, y + rh / 2 - 14, sube ? "sube" : "baja", 9.5, { f: "PM", gris: 0.3 });
    const ty = y + rh / 2 - 10.5;
    p.path(sube ? [["M", M + 16, ty - 4], ["L", M + 28, ty - 4], ["L", M + 22, ty + 4], ["Z"]]
                : [["M", M + 16, ty + 4], ["L", M + 28, ty + 4], ["L", M + 22, ty - 4], ["Z"]], { fill: INK, stroke: null });
    const bx = M + lw + (W - 2 * M - lw - (L * bw + (L - 1) * g)) / 2;
    valores.forEach((v, j) => {
      const k = huecos.indexOf(j);
      p.caja(bx + j * (bw + g), y + (rh - bh) / 2, bw, bh, k >= 0 ? null : v, 22, k >= 0 ? e.solucion.huecos[k] : null);
    });
  }));
}

export default registrar({
  id: "conteo.series",
  version: 1,
  generar(params, azar, { tamano }) {
    return generarSerie((params.rango ?? 10) >= 20 ? [1, 2, 5, 10] : [1, 2, 5], params, azar, tamano,
      "Fíjate en el salto de cada serie y escribe los números que faltan.");
  },
  dibujar: dibujarSerie,
});
