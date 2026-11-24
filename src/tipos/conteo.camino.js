// conteo.camino · El camino de números (port de _c_camino() y flecha() del motor).
// datos:    { desde, L, huecos: [k…] }   camino en serpiente de L casillas (6 por fila) con los números desde, desde+1, …;
//           huecos = posiciones vacías 1..L−1 (ordenadas; la de salida nunca está vacía)
// solucion: { huecos: [desde + k de cada hueco, en orden] }
// Opciones: huecos (3–20; por defecto máx(3, L/3)); como mucho L − 2. L = mín(36, R). Solo tamaño completa. Con L ≤ 12 (dos filas) salen NCAM = 3 caminos, cada uno con su salida y sus huecos (un ejercicio por camino); si no, uno.
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, INK } from "../render/papel.js";

const COLS = 6, CW = 58, CH = 52;
export const NCAM = 3;   // caminos por ficha cuando L ≤ 12

function flecha(p, x1, y1, x2, y2, hd = 4.5) {
  p.line(x1, y1, x2, y2, { lw: 1.5 });
  const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
  p.path([["M", x2, y2], ["L", x2 - ux * hd * 1.6 - uy * hd, y2 - uy * hd * 1.6 + ux * hd],
          ["L", x2 - ux * hd * 1.6 + uy * hd, y2 - uy * hd * 1.6 - ux * hd], ["Z"]], { fill: INK, stroke: null });
}

export default registrar({
  id: "conteo.camino",
  version: 3,
  generar(params, azar) {
    const R = params.rango ?? 10, L = Math.min(36, R), desde = azar.entero(1, R - L + 1);
    const h = Math.min(L - 2, params.huecos ?? Math.max(3, Math.floor(L / 3)));
    const n = L <= 12 ? NCAM : 1;
    const uno = (i) => {
      const d = i === 0 ? desde : azar.entero(1, R - L + 1);
      const huecos = azar.muestra(Array.from({ length: L - 1 }, (_, j) => j + 1), h).sort((a, b) => a - b);
      return { datos: { desde: d, L, huecos }, solucion: { huecos: huecos.map((k) => d + k) } };
    };
    return {
      enunciado: n > 1 ? "Sigue las flechas y escribe los números que faltan en cada camino." : "Sigue las flechas y escribe los números que faltan.",
      ejercicios: Array.from({ length: n }, (_, i) => uno(i)),
    };
  },
  dibujar(p, act) {
    const nc = act.ejercicios.length, slot = (TOP - M) / nc, L0 = act.ejercicios[0].datos.L, rows = Math.ceil(L0 / COLS);
    const px = (W - 2 * M - CW) / (COLS - 1), py = rows > 1 ? Math.min(118, (slot - CH - 40) / (rows - 1)) : 0;
    act.ejercicios.forEach((e, t) => {
    const { desde: s, L, huecos } = e.datos, top = TOP - t * slot;
    const pos = (k) => { const r = Math.floor(k / COLS); let c = k % COLS; if (r % 2) c = COLS - 1 - c; return [M + c * px, top - 26 - r * py - CH]; };
    p.ejercicio(e.id, () => {
      for (let k = 0; k < L - 1; k++) {
        const [x1, y1] = pos(k), [x2, y2] = pos(k + 1);
        if (y1 === y2) {
          const d = x2 > x1 ? 1 : -1, a = x1 + (d > 0 ? CW + 3 : -3), b = x2 + (d > 0 ? -3 : CW + 3);
          flecha(p, a, y1 + CH / 2, b, y2 + CH / 2);
        } else flecha(p, x1 + CW / 2, y1 - 3, x2 + CW / 2, y2 + CH + 3);
      }
      let q = 0;
      for (let k = 0; k < L; k++) {
        const [x, y] = pos(k), vac = huecos.includes(k);
        p.caja(x, y, CW, CH, vac ? null : s + k, 20, vac ? e.solucion.huecos[q++] : null);
      }
      let [x, y] = pos(0); p.text(x + CW / 2, y + CH + 6, "SALIDA", 11, { f: "PM", anchor: "middle", gris: 0.3 });
      [x, y] = pos(L - 1); p.text(x + CW / 2, y - 12, "META", 11, { f: "PM", anchor: "middle", gris: 0.3 });
    });
    });
  },
});
