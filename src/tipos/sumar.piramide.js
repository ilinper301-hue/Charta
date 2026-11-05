// sumar.piramide · Pirámides de sumas (port de _s_piramide() y _resoluble() del motor).
// datos:    { v: [b0, b1, b2, m0, m1, cima], vac: [índices vacíos, ascendentes] }
//           (v[3] = b0 + b1, v[4] = b1 + b2, v[5] = v[3] + v[4]; posiciones 0-2 base, 3-4 medio, 5 cima)
// solucion: { huecos: [v[j] para j en vac] }   (en orden de posición)
// Opción huecos (1-4, por defecto 3): casillas vacías. El motor busca una pirámide resoluble (con 4 vacías no hay; queda la última).
// Completa: 6 pirámides (2 × 3); media: 2.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";

function resoluble(conocidos) {
  const k = new Set(conocidos);
  let cambio = true;
  while (cambio) {
    cambio = false;
    for (const rel of [[0, 1, 3], [1, 2, 4], [3, 4, 5]]) {
      const n = rel.filter((j) => k.has(j)).length;
      if (n === 2) { rel.forEach((j) => { if (!k.has(j)) { k.add(j); cambio = true; } }); }
    }
  }
  return k.size === 6;
}

export default registrar({
  id: "sumar.piramide",
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 10, cap = R <= 20 ? R : Math.min(R, 99), mx = Math.max(2, R > 20 ? Math.floor(cap / 4) : Math.floor(cap / 3));
    const h = Math.max(1, Math.min(4, params.huecos ?? 3)), ejercicios = [];
    for (let i = 0; i < (tamano === "media" ? 2 : 6); i++) {
      let b = [1, 1, 1];
      for (let k = 0; k < 300; k++) {
        b = [azar.entero(1, mx), azar.entero(1, mx), azar.entero(1, mx)];
        if (b[0] + 2 * b[1] + b[2] <= cap) break;
      }
      const v = [b[0], b[1], b[2], b[0] + b[1], b[1] + b[2], b[0] + 2 * b[1] + b[2]];
      let vac;
      for (let k = 0; k < 300; k++) {
        vac = azar.muestra([0, 1, 2, 3, 4, 5], h);
        if (resoluble([0, 1, 2, 3, 4, 5].filter((j) => !vac.includes(j)))) break;
      }
      vac = vac.slice().sort((u, w) => u - w);
      ejercicios.push({ datos: { v, vac }, solucion: { huecos: vac.map((j) => v[j]) } });
    }
    return { enunciado: "Cada casilla es la suma de las dos de abajo. Completa las que faltan.", ejercicios };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 2, 3), bw = 46, bh = 40, g = 6;
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { v, vac } = e.datos, cx = x + cw / 2, base = y + (ch - 140) / 2;
      p.marco(x, y, cw, ch, i);
      const pos = [0, 1, 2].map((j) => [cx + (j - 1) * (bw + g), base]).concat([0, 1].map((j) => [cx + (j - 0.5) * (bw + g), base + 50]), [[cx, base + 100]]);
      pos.forEach(([px, py], j) => p.caja(px - bw / 2, py, bw, bh, vac.includes(j) ? null : v[j], 18, vac.includes(j) ? v[j] : null));
    }));
  },
});
