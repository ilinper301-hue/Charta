// conteo.cuenta · Cuenta y escribe (port de _c_cuenta() del motor).
// datos:    { n, forma, cols, filas, pos }   forma: "c" círculo · "s" estrella · "q" cuadrado · "t" triángulo (según la casilla);
//           pos = n entradas [fila, columna, ux, uy]: casilla de la mini-rejilla (cols × filas) y desplazamiento aleatorio
//           (ux, uy ∈ [−1, 1], que se multiplica por la holgura del dibujo). El motor lo sortea al dibujar; aquí va en los datos.
// solucion: { huecos: [n] }   (cuadrito gris arriba a la derecha)
// Números: pick(1, mín(R, 30)) como en rep (repartidos por tercios). Cantidad: «Más grandes» = 12 casillas (4 filas × 3) en completa y 6 en media; «Más ejercicios» = las filas de 3 que caben con tarjetas ≥ 110 pt (15 y 9). Rejilla elástica (p.rejilla).
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, INK, cuantosRejilla, altoRejilla } from "../render/papel.js";
import { pick } from "./_rep.js";

const GX = 10, GY = 10, CW = (W - 2 * M - 2 * GX) / 3, MIN_ALTO = 110;   // alto mínimo de tarjeta con «Más ejercicios»
const r3 = (v) => Math.round(v * 1000) / 1000;

function estrella(p, x, y, r) {
  const pts = [];
  for (let j = 0; j < 10; j++) { const ang = Math.PI / 2 + j * Math.PI / 5, rr = j % 2 === 0 ? r : r * 0.42; pts.push([x + rr * Math.cos(ang), y + rr * Math.sin(ang)]); }
  p.path([["M", ...pts[0]], ...pts.slice(1).map((q) => ["L", ...q]), ["Z"]]);
}
function forma(p, kind, x, y, r) {
  if (kind === "c") p.circle(x, y, r);
  else if (kind === "s") estrella(p, x, y, r * 1.2);
  else if (kind === "q") p.rrect(x - r * 0.9, y - r * 0.9, r * 1.8, r * 1.8, 0);
  else p.path([["M", x, y + r * 1.05], ["L", x - r * 1.05, y - r * 0.8], ["L", x + r * 1.05, y - r * 0.8], ["Z"]]);
}

export default registrar({
  id: "conteo.cuenta",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const R = params.rango ?? 10, cnt = cuantosRejilla(ctx, 3, MIN_ALTO, [12, 6]), [nums] = pick(1, Math.min(R, 30), azar, Math.max(12, cnt), 0);
    const filasT = Math.ceil(cnt / 3), CH = (altoRejilla(ctx.tamano === "media" ? 0.5 : 1) - (filasT - 1) * GY) / filasT, aw = CW - 28, ah = CH - 60;   // el alto real de la tarjeta (rejilla elástica)
    return {
      enunciado: "Cuenta los dibujos de cada casilla y escribe el número en el cuadrito.",
      ejercicios: nums.slice(0, cnt).map((n, idx) => {
        const cols = Math.max(1, Math.ceil(Math.sqrt(n * aw / ah))), filas = Math.ceil(n / cols), huecos = [];
        for (let r = 0; r < filas; r++) for (let c = 0; c < cols; c++) huecos.push([r, c]);
        const pos = azar.barajar(huecos).slice(0, n).map(([r, c]) => [r, c, r3(azar.real() * 2 - 1), r3(azar.real() * 2 - 1)]);
        return { datos: { n, forma: "csqt"[idx % 4], cols, filas, pos }, solucion: { huecos: [n] } };
      }),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.rejilla(TOP, 3, Math.ceil(act.ejercicios.length / 3), GX, GY);
    act.ejercicios.forEach((e, idx) => p.ejercicio(e.id, () => {
      const [x, y] = cel[idx], { forma: kind, cols, filas, pos } = e.datos;
      p.marco(x, y, cw, ch, idx);
      p.cuadrito(x, y, cw, ch, 30, e.solucion.huecos[0]);
      const ax = x + 14, ay = y + 14, aw = cw - 28, ah = ch - 60;
      const sp = Math.min(aw / cols, ah / filas), r = Math.min(11 * Math.max(1, Math.min(1.3, ch / 134)), sp * 0.3), jit = sp * 0.1;
      for (const [ri, ci, ux, uy] of pos)
        forma(p, kind, ax + aw / 2 + (ci - (cols - 1) / 2) * sp + ux * jit, ay + ah / 2 + ((filas - 1) / 2 - ri) * sp + uy * jit, r);
    }));
  },
});
