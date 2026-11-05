// restar.quita · Resta con dibujos: tachar y contar los que quedan (port de _r_quita() y _quita() del motor).
// datos:    { a, b, tipo: "c"|"s"|"q"|"t", lugares: [[fila, col, jx, jy, tachado]…] }
//           a dibujos (4 ≤ a ≤ cap; cap = 10 si rango ≤ 10, si no 20) y b tachados (1 ≤ b < a);
//           lugares = un hueco de la cuadrícula por dibujo (jx, jy en −1..1: desvío × 8 % del paso), tachado = 1 en b de ellos.
// solucion: { huecos: [a − b] }
// Completa: 8 tarjetas (4 filas × 2); media: 4. El dibujo cambia por tarjeta: círculo, estrella, cuadrado, triángulo.
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, T, B } from "../render/papel.js";

const GEO = () => {
  const cw = (W - 2 * M - 10) / 2, ch = (TOP - M - 3 * 10) / 4;
  return { cw, ch, aw: cw - 28, ah: ch - 80 };
};
const rejilla = (n, aw, ah) => { const cols = Math.max(1, Math.ceil(Math.sqrt(n * aw / ah))); return { cols, rows: Math.ceil(n / cols) }; };

/** Dibuja una forma 'c' círculo, 's' estrella, 'q' cuadrado, otra: triángulo (shape() del motor). */
function forma(p, k, x, y, r) {
  const o = { lw: 1.5 };
  if (k === "c") p.circle(x, y, r, o);
  else if (k === "s") {
    const R = r * 1.2, cmds = [];
    for (let j = 0; j < 10; j++) {
      const ang = Math.PI / 2 + j * Math.PI / 5, rr = j % 2 === 0 ? R : R * 0.42;
      cmds.push([j ? "L" : "M", x + rr * Math.cos(ang), y + rr * Math.sin(ang)]);
    }
    p.path([...cmds, ["Z"]], o);
  } else if (k === "q") p.rrect(x - r * 0.9, y - r * 0.9, r * 1.8, r * 1.8, 0, o);
  else p.path([["M", x, y + r * 1.05], ["L", x - r * 1.05, y - r * 0.8], ["L", x + r * 1.05, y - r * 0.8], ["Z"]], o);
}

export default registrar({
  id: "restar.quita",
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 10, cap = R <= 10 ? 10 : 20, { aw, ah } = GEO();
    const ejercicios = [];
    for (let i = 0; i < (tamano === "media" ? 4 : 8); i++) {
      const a = azar.entero(4, cap), b = azar.entero(1, a - 1), { cols, rows } = rejilla(a, aw, ah);
      const slots = azar.barajar([...Array(cols * rows).keys()]).slice(0, a).map((s) => [Math.floor(s / cols), s % cols]);
      const tach = new Set(azar.muestra([...Array(a).keys()], b));
      const lugares = slots.map(([ri, ci], j) => [ri, ci, azar.real() * 2 - 1, azar.real() * 2 - 1, tach.has(j) ? 1 : 0]);
      ejercicios.push({ datos: { a, b, tipo: "csqt"[i % 4], lugares }, solucion: { huecos: [a - b] } });
    }
    return { enunciado: "Quita los dibujos tachados y escribe cuántos quedan.", ejercicios };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 2, 4), { aw, ah } = GEO();
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { a, tipo, lugares } = e.datos, ax = x + 14, ay = y + 56;
      p.marco(x, y, cw, ch, i);
      const { cols, rows } = rejilla(a, aw, ah), sp = Math.min(aw / cols, ah / rows), r = Math.min(11, sp * 0.3), jit = sp * 0.08;
      for (const [ri, ci, jx, jy, t] of lugares) {
        const px = ax + aw / 2 + (ci - (cols - 1) / 2) * sp + jx * jit, py = ay + ah / 2 + ((rows - 1) / 2 - ri) * sp + jy * jit;
        forma(p, tipo, px, py, r);
        if (t) {
          const d = r * 1.3;
          p.line(px - d, py - d, px + d, py + d, { lw: 1.9 }); p.line(px - d, py + d, px + d, py - d, { lw: 1.9 });
        }
      }
      p.linea(x, y + 8, cw, 44, [T("Quedan =", 14, "PM"), B(52, 38, e.solucion.huecos[0])], 8);
    }));
  },
});
