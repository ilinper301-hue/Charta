// conteo.series · Series mixtas (port de _c_series(…, [1, 2, 5, 10] / [1, 2, 5]) del motor).
// También exporta generarSerie() y dibujarSerie(), que usan conteo.serie2, conteo.serie5 y conteo.serie10.
// datos:    { paso, valores: [v…], huecos: [j…], sube }   (valores de izquierda a derecha; huecos = posiciones vacías;
//           sube = true si la serie crece hacia la derecha; el paso de cada serie va en `paso`)
// solucion: { huecos: [valores de los huecos, de izquierda a derecha] }
// Opciones: huecos (1–4, por defecto 3). Rango ≥ 20: pasos 1, 2, 5 y 10; si no, 1, 2 y 5.
// Cantidad: «Más grandes» = 8 series en completa y 4 en media; «Más ejercicios» = las filas que caben con tarjetas ≥ 60 pt (10 y 5). Cada serie tiene hasta 6 números. Rejilla elástica (p.rejilla).
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, INK, cuantosRejilla } from "../render/papel.js";

/** _huecos(n, h): h posiciones al azar de n (máx. n − 2). */
export function elegirHuecos(n, h, azar) {
  return azar.muestra([...Array(n).keys()], Math.max(0, Math.min(h, n - 2))).sort((a, b) => a - b);
}

/** Cuerpo de _c_series(top, R, rnd, huecos, pasos). */
export const MIN_ALTO_SERIE = 60;   // alto mínimo de la fila con «Más ejercicios»
export function generarSerie(pasos, params, azar, ctx, enunciado = "Completa cada serie escribiendo los números que faltan en los cuadros grises.") {
  const R = params.rango ?? 10, h = params.huecos ?? 3, filas = cuantosRejilla(ctx, 1, MIN_ALTO_SERIE, [8, 4]), usadas = new Set(), ejercicios = [];
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

/** Dibujo de _c_series(): una fila por serie, que llena la zona (rejilla elástica de una columna). */
export function dibujarSerie(p, act) {
  const { cel, cw: tw, ch: rh } = p.rejilla(TOP, 1, act.ejercicios.length, 10, 8), k = Math.max(1, Math.min(1.15, (rh - 14) / 46)), bw = 52 * k, bh = 46 * k, g = 8 * k, lw = 124;   // las cajas crecen con la fila
  act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
    const { paso, valores, huecos, sube } = e.datos, L = valores.length;
    const y = cel[i][1];
    p.tarjeta(M, y, W - 2 * M, rh);
    p.text(M + 16, y + rh / 2 + 2, `de ${paso} en ${paso}`, 12.5, { f: "PB" });
    p.text(M + 34, y + rh / 2 - 14, sube ? "sube" : "baja", 9.5, { f: "PM", gris: 0.3 });
    const ty = y + rh / 2 - 10.5;
    p.path(sube ? [["M", M + 16, ty - 4], ["L", M + 28, ty - 4], ["L", M + 22, ty + 4], ["Z"]]
                : [["M", M + 16, ty + 4], ["L", M + 28, ty + 4], ["L", M + 22, ty - 4], ["Z"]], { fill: INK, stroke: null });
    const bx = M + lw + (W - 2 * M - lw - (L * bw + (L - 1) * g)) / 2;
    valores.forEach((v, j) => {
      const k2 = huecos.indexOf(j);
      p.caja(bx + j * (bw + g), y + (rh - bh) / 2, bw, bh, k2 >= 0 ? null : v, 22 * k, k2 >= 0 ? e.solucion.huecos[k2] : null);
    });
  }));
}

export default registrar({
  id: "conteo.series",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    return generarSerie((params.rango ?? 10) >= 20 ? [1, 2, 5, 10] : [1, 2, 5], params, azar, ctx,
      "Fíjate en el salto de cada serie y escribe los números que faltan.");
  },
  dibujar: dibujarSerie,
});
