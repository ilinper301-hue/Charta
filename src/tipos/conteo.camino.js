// conteo.camino · El camino de números (port de _c_camino() y flecha() del motor).
// datos:    { desde, L, huecos: [k…] }   camino en serpiente de L casillas (6 por fila) con los números desde, desde+1, …;
//           huecos = posiciones vacías 1..L−1 (ordenadas; la de salida nunca está vacía)
// solucion: { huecos: [desde + k de cada hueco, en orden] }
// Opciones: huecos (3–20; por defecto máx(3, L/3)); como mucho L − 2. L = mín(36, R). Una sola ficha (solo tamaño completa).
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, INK } from "../render/papel.js";

const COLS = 6, CW = 58, CH = 52;

function flecha(p, x1, y1, x2, y2, hd = 4.5) {
  p.line(x1, y1, x2, y2, { lw: 1.5 });
  const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
  p.path([["M", x2, y2], ["L", x2 - ux * hd * 1.6 - uy * hd, y2 - uy * hd * 1.6 + ux * hd],
          ["L", x2 - ux * hd * 1.6 + uy * hd, y2 - uy * hd * 1.6 - ux * hd], ["Z"]], { fill: INK, stroke: null });
}

export default registrar({
  id: "conteo.camino",
  version: 1,
  generar(params, azar) {
    const R = params.rango ?? 10, L = Math.min(36, R), desde = azar.entero(1, R - L + 1);
    const h = Math.min(L - 2, params.huecos ?? Math.max(3, Math.floor(L / 3)));
    const huecos = azar.muestra(Array.from({ length: L - 1 }, (_, i) => i + 1), h).sort((a, b) => a - b);
    return {
      enunciado: "Sigue las flechas y escribe los números que faltan.",
      ejercicios: [{ datos: { desde, L, huecos }, solucion: { huecos: huecos.map((k) => desde + k) } }],
    };
  },
  dibujar(p, act) {
    const e = act.ejercicios[0], { desde: s, L, huecos } = e.datos, rows = Math.ceil(L / COLS);
    const px = (W - 2 * M - CW) / (COLS - 1), py = rows > 1 ? Math.min(118, (TOP - M - CH - 40) / (rows - 1)) : 0;
    const pos = (k) => { const r = Math.floor(k / COLS); let c = k % COLS; if (r % 2) c = COLS - 1 - c; return [M + c * px, TOP - 26 - r * py - CH]; };
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
      let [x, y] = pos(0); p.text(x + CW / 2, y + CH + 6, "SALIDA", 8.5, { f: "PM", anchor: "middle", gris: 0.3 });
      [x, y] = pos(L - 1); p.text(x + CW / 2, y - 12, "META", 8.5, { f: "PM", anchor: "middle", gris: 0.3 });
    });
  },
});
