// juegos.cadena · Cadenas de números (port de _j_cadena() del motor).
// datos:    { vals: [v₀, …, v₄] (5 números; v₀ viene escrito), ops: [m₁, …, m₄] (m > 0 suma, m < 0 resta; vⱼ = vⱼ₋₁ + mⱼ) }
// solucion: { huecos: [v₁, v₂, v₃, v₄] }
// Todos los valores están entre 0 y min(rango, 99); |m| ≤ 5 (rango 10) o 9 (y 10 si rango > 20). Completa: 7 cadenas; media: 3.
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, MENOS, INK } from "../render/papel.js";

export default registrar({
  id: "juegos.cadena",
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 10, cap = Math.min(R, 99);
    const mags = Array.from({ length: R <= 10 ? 5 : 9 }, (_, i) => i + 1); if (R > 20) mags.push(10);
    const ejercicios = [];
    for (let i = 0; i < (tamano === "media" ? 3 : 7); i++) {
      let v = azar.entero(Math.max(1, Math.floor(cap / 5)), cap - Math.floor(cap / 5)); const vals = [v], ops = [];
      for (let t = 0; t < 4; t++) {
        const op = [...mags.filter((m) => v + m <= cap), ...mags.filter((m) => v - m >= 0).map((m) => -m)];
        const m = azar.elegir(op); v += m; vals.push(v); ops.push(m);
      }
      ejercicios.push({ datos: { vals, ops }, solucion: { huecos: vals.slice(1) } });
    }
    return { enunciado: "Sigue las operaciones y escribe el número de cada cuadro.", ejercicios };
  },
  dibujar(p, act) {
    const rows = 7, GY = 8, rh = (TOP - M - (rows - 1) * GY) / rows, bw = 48, bh = 42, g = 64, x0 = M + (W - 2 * M - (5 * bw + 4 * g)) / 2;
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const { vals, ops } = e.datos, y = TOP - (i + 1) * rh - i * GY, by = y + (rh - bh) / 2;
      p.marco(M, y, W - 2 * M, rh);
      for (let j = 0; j < 5; j++) {
        p.caja(x0 + j * (bw + g), by, bw, bh, j === 0 ? vals[0] : null, 20, j === 0 ? null : e.solucion.huecos[j - 1]);
        if (j < 4) {
          const xa = x0 + j * (bw + g) + bw + 5, xb = x0 + (j + 1) * (bw + g) - 5, ym = by + bh / 2, hd = 4.5;
          p.line(xa, ym, xb, ym, { lw: 1.6 });
          p.path([["M", xb, ym], ["L", xb - hd * 1.6, ym + hd], ["L", xb - hd * 1.6, ym - hd], ["Z"]], { fill: INK, stroke: null });
          p.text((xa + xb) / 2, ym + 8, (ops[j] > 0 ? "+" : MENOS) + Math.abs(ops[j]), 14, { f: "PB", anchor: "middle" });
        }
      }
    }));
  },
});
