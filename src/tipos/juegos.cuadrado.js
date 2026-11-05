// juegos.cuadrado · Cuadrados mágicos 3 × 3 (port de _j_cuadrado() del motor).
// datos:    { S, m: [[v…]×3]×3 (cuadrado completo), vac: [[fila, columna]…] (casillas vacías, por filas) }
//           S = suma mágica = 15 + 3k; m = cuadrado base (2,7,6/9,5,1/4,3,8) girado/reflejado y sumado k (k ≤ min(rango − 9, 4)).
// solucion: { huecos: [m[r][q] de cada casilla vacía, por filas] }
// Completa: 6 cuadrados (2 columnas × 3 filas); media: 2 (una fila). Opción n = casillas vacías (3–5, defecto 4).
// Las casillas vacías siempre se pueden deducir de las líneas (fila/columna/diagonal con una sola incógnita, en cadena).
import { registrar } from "../nucleo/tipos.js";
import { TOP, M } from "../render/papel.js";

const BASE = [[2, 7, 6], [9, 5, 1], [4, 3, 8]];
const CELDAS = [0, 1, 2].flatMap((r) => [0, 1, 2].map((q) => [r, q]));
export const LINEAS = [
  ...[0, 1, 2].map((r) => [0, 1, 2].map((q) => [r, q])),
  ...[0, 1, 2].map((q) => [0, 1, 2].map((r) => [r, q])),
  [0, 1, 2].map((i) => [i, i]), [0, 1, 2].map((i) => [i, 2 - i]),
];

/** _sim(): k % 4 giros de 90° y, si k ≥ 4, reflejo. */
function sim(m, k) {
  for (let i = 0; i < k % 4; i++) m = m[0].map((_, j) => m.map((r) => r[j]).reverse());
  return k >= 4 ? m.map((r) => r.slice().reverse()) : m;
}

/** _mag_resoluble(): con las casillas conocidas se pueden deducir todas (líneas con una sola incógnita). */
export function resoluble(conocidas) {
  const k = new Set(conocidas.map((p) => p.join())); let ch = true;
  while (ch) {
    ch = false;
    for (const ln of LINEAS) {
      const u = ln.filter((p) => !k.has(p.join()));
      if (u.length === 1) { k.add(u[0].join()); ch = true; }
    }
  }
  return k.size === 9;
}

export default registrar({
  id: "juegos.cuadrado",
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 10;
    if (R < 10) throw new Error("Los cuadrados mágicos necesitan un rango máximo de al menos 10.");
    const h = Math.max(3, Math.min(5, params.n || 4)), cnt = tamano === "media" ? 2 : 6;
    const combos = [];
    for (let s = 0; s < 8; s++) for (let k = 0; k <= Math.min(R - 9, 4); k++) combos.push([s, k]);
    const ejercicios = azar.muestra(combos, cnt).map(([s, k]) => {
      const m = sim(BASE, s).map((r) => r.map((v) => v + k));
      let vac;
      for (let t = 0; t < 500; t++) {
        vac = azar.muestra(CELDAS, h);
        if (resoluble(CELDAS.filter((c) => !vac.some((d) => d[0] === c[0] && d[1] === c[1])))) break;
      }
      vac = CELDAS.filter((c) => vac.some((d) => d[0] === c[0] && d[1] === c[1]));
      return { datos: { S: 15 + 3 * k, m, vac }, solucion: { huecos: vac.map(([r, q]) => m[r][q]) } };
    });
    return { enunciado: "Completa el cuadrado: filas, columnas y diagonales suman lo mismo.", ejercicios };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 2, 3);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { S, m, vac } = e.datos;
      p.marco(x, y, cw, ch, i);
      p.text(x + cw / 2, y + ch - 30, `Suma mágica: ${S}`, 14, { f: "PB", anchor: "middle" });
      const bs = 44, g = 6, gx = x + (cw - (3 * bs + 2 * g)) / 2;
      for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) {
        const k = vac.findIndex((d) => d[0] === r && d[1] === q);
        p.caja(gx + q * (bs + g), y + 14 + (2 - r) * (bs + g), bs, bs, k >= 0 ? null : m[r][q], 20, k >= 0 ? e.solucion.huecos[k] : null);
      }
    }));
  },
});
