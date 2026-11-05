// orden.cantidad · Más, menos o igual: comparar dos grupos de dibujos (port de _o_cantidad() y _dispersa() del motor).
// datos:    { a, b, pide: "más" | "menos", forma: "c" | "s" | "q" | "t", pos: [[[fila, col, jx, jy]…], […]] }
//           a, b = nº de dibujos de cada grupo (1..min(R, 12)); pos = posición de cada dibujo en la rejilla de su mitad
//           (fila, columna) y su desvío aleatorio (jx, jy en −1..1, × 10 % del paso). Las posiciones se fijan al generar.
// solucion: { huecos: [], rodea: "a" | "b" | "ambos" }   (se rodea, no se escribe; «ambos» si a = b)
// Opciones: modo null (mezclado) | "mayor" (siempre «más») | "menor" (siempre «menos»).
// Completa: 8 casillas (4 filas × 2); media: 4. Iguales: 2 de 8 (1 de 4).
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, INK } from "../render/papel.js";

const GX = 10, GY = 10, COLS = 2, ROWS = 4;
const CW = (W - 2 * M - (COLS - 1) * GX) / COLS, CH = (TOP - M - (ROWS - 1) * GY) / ROWS;
const AW = CW / 2 - 24, AH = CH - 56;

/** Rejilla de _dispersa(): columnas y filas para n dibujos en aw × ah. */
function rejilla(n, aw, ah) {
  const cols = Math.max(1, Math.ceil(Math.sqrt(n * aw / ah))), rows = Math.ceil(n / cols), sp = Math.min(aw / cols, ah / rows);
  return { cols, rows, sp };
}

/** shape() del motor: c círculo, s estrella, q cuadrado, t triángulo. Exportada para valor.agrupa. */
export function forma(p, kind, x, y, r) {
  if (kind === "c") p.circle(x, y, r);
  else if (kind === "s") {
    const R = r * 1.2, cm = [];
    for (let j = 0; j < 10; j++) {
      const ang = Math.PI / 2 + j * Math.PI / 5, rr = j % 2 === 0 ? R : R * 0.42;
      cm.push([j ? "L" : "M", x + rr * Math.cos(ang), y + rr * Math.sin(ang)]);
    }
    p.path([...cm, ["Z"]]);
  } else if (kind === "q") p.rrect(x - r * 0.9, y - r * 0.9, r * 1.8, r * 1.8, 0);
  else p.path([["M", x, y + r * 1.05], ["L", x - r * 1.05, y - r * 0.8], ["L", x + r * 1.05, y - r * 0.8], ["Z"]]);
}

const r2 = (v) => Math.round(v * 100) / 100 + 0;   // + 0: sin −0 (no sobrevive a JSON)
/** Posiciones al azar de n dibujos (como _dispersa(): casillas barajadas, las n primeras, con desvío). */
function dispersar(n, azar) {
  const { cols, rows } = rejilla(n, AW, AH);
  const slots = azar.barajar([...Array(cols * rows).keys()].map((i) => [Math.floor(i / cols), i % cols]));
  return slots.slice(0, n).map(([ri, ci]) => [ri, ci, r2(azar.real() * 2 - 1), r2(azar.real() * 2 - 1)]);
}

export default registrar({
  id: "orden.cantidad",
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 10, mx = Math.min(R, 12), modo = params.modo || "mezcla";
    const cnt = tamano === "media" ? 4 : 8, nIg = tamano === "media" ? 1 : 2;
    const eq = new Set(azar.muestra([...Array(cnt).keys()], nIg));
    let t = modo === "mayor" ? Array(cnt).fill("más") : modo === "menor" ? Array(cnt).fill("menos")
      : [...Array(cnt / 2).fill("más"), ...Array(cnt / 2).fill("menos")];
    if (modo === "mezcla") t = azar.barajar(t);
    const ejercicios = [];
    for (let i = 0; i < cnt; i++) {
      const a = azar.entero(1, mx);
      const b = eq.has(i) ? a : azar.elegir([...Array(mx).keys()].map((v) => v + 1).filter((v) => v !== a));
      const pos = [dispersar(a, azar), dispersar(b, azar)];
      const rodea = a === b ? "ambos" : (t[i] === "más") === (a > b) ? "a" : "b";
      ejercicios.push({ datos: { a, b, pide: t[i], forma: "csqt"[i % 4], pos }, solucion: { huecos: [], rodea } });
    }
    return { enunciado: "Compara los grupos. Si hay la misma cantidad, rodea los dos.", ejercicios };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, COLS, ROWS);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { a, b, pide, forma: kind, pos } = e.datos;
      p.marco(x, y, cw, ch, i, "RODEA EL GRUPO QUE TIENE " + pide.toUpperCase());
      p.line(x + cw / 2, y + 14, x + cw / 2, y + ch - 40, { lw: 1.2 });
      [a, b].forEach((v, j) => {
        const ax = x + 12 + j * cw / 2, ay = y + 14, aw = cw / 2 - 24, ah = ch - 56;
        const { cols, rows, sp } = rejilla(v, aw, ah), r = Math.min(11, sp * 0.3), jit = sp * 0.1;
        for (const [ri, ci, jx, jy] of pos[j])
          forma(p, kind, ax + aw / 2 + (ci - (cols - 1) / 2) * sp + jx * jit, ay + ah / 2 + ((rows - 1) / 2 - ri) * sp + jy * jit, r);
      });
    }));
  },
});
