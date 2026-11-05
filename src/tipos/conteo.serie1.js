// conteo.serie1 · Series de 1 en 1 (port de _c_series(…, [1]) del motor).
// datos:    { paso: 1, valores: [v…], huecos: [j…], sube }   (valores en el orden en que se ven, de izquierda a derecha;
//           huecos = posiciones vacías; sube = true si la serie crece hacia la derecha)
// solucion: { huecos: [valores de los huecos, de izquierda a derecha] }
// Completa: 8 series; media: 4 (la mitad de filas). Cada serie tiene 6 números (opción «huecos»: 1–4 vacíos).
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, INK } from "../render/papel.js";

/** _huecos(n, h): h posiciones al azar de n (máx. n − 2). */
export function elegirHuecos(n, h, azar) {
  return azar.muestra([...Array(n).keys()], Math.max(0, Math.min(h, n - 2))).sort((a, b) => a - b);
}

export default registrar({
  id: "conteo.serie1",
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 10, h = params.huecos ?? 3, s = 1;
    const L = Math.min(6, Math.floor(R / s) + 1);
    if (L < 3) throw new Error(`Esta serie necesita un rango máximo mayor (paso ${s}, máx. ${R}).`);
    const filas = tamano === "media" ? 4 : 8, usadas = new Set(), ejercicios = [];
    for (let i = 0; i < filas; i++) {
      let cand = []; for (let a = 1; a <= R - (L - 1) * s; a++) cand.push(a);
      cand = cand.filter((a) => !usadas.has(a)).length ? cand.filter((a) => !usadas.has(a)) : cand;
      const a = azar.elegir(cand); usadas.add(a);
      let vals = Array.from({ length: L }, (_, j) => a + j * s);
      const sube = i % 2 === 0;
      if (!sube) vals.reverse();
      const huecos = elegirHuecos(L, Math.min(h, L - 2), azar);
      ejercicios.push({ datos: { paso: s, valores: vals, huecos, sube }, solucion: { huecos: huecos.map((j) => vals[j]) } });
    }
    return { enunciado: "Completa cada serie escribiendo los números que faltan en los cuadros grises.", ejercicios };
  },
  dibujar(p, act) {
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
  },
});
