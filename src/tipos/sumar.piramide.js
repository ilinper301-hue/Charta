// sumar.piramide · Pirámides de sumas (port de _s_piramide() y _resoluble() del motor).
// datos:    { v: [b0, b1, b2, m0, m1, cima], vac: [índices vacíos, ascendentes] }
//           (v[3] = b0 + b1, v[4] = b1 + b2, v[5] = v[3] + v[4]; posiciones 0-2 base, 3-4 medio, 5 cima)
// solucion: { huecos: [v[j] para j en vac] }   (en orden de posición)
// Opción huecos (1-4, por defecto 3): casillas vacías. El motor busca una pirámide resoluble (con 4 vacías no hay; queda la última).
// «Más grandes»: 6 pirámides en completa (2 × 3) y 2 en media; «Más ejercicios»: 8 y 4 (tarjetas ≥ 156 pt: la pirámide mide 140; sin bases repetidas). Rejilla elástica; con «Más grandes» la pirámide crece hasta ×1,3 si cabe.
import { registrar } from "../nucleo/tipos.js";
import { TOP, cuantosRejilla } from "../render/papel.js";

const MIN_ALTO = 156;   // la pirámide mide 140 pt de alto

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
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const mas = ctx.cantidad === "mas", vistas = new Set();
    const R = params.rango ?? 10, cap = R <= 20 || R > 100 ? R : Math.min(R, 99), mx = Math.max(2, R > 20 ? Math.floor(cap / 4) : Math.floor(cap / 3));
    const h = Math.max(1, Math.min(4, params.huecos ?? 3)), ejercicios = [];
    for (let i = 0, cnt = cuantosRejilla(ctx, 2, MIN_ALTO, [6, 2]); i < cnt; i++) {
      let b = [1, 1, 1];
      for (let k = 0; k < 300; k++) {
        b = [azar.entero(1, mx), azar.entero(1, mx), azar.entero(1, mx)];
        if (b[0] + 2 * b[1] + b[2] <= cap && !(mas && vistas.has(b.join()))) break;   // «Más ejercicios»: sin bases repetidas
      }
      vistas.add(b.join());
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
    const { cel, cw, ch } = p.rejilla(TOP, 2, Math.max(Math.ceil(act.ejercicios.length / 2), p.n(3)));   // la de 3 filas de siempre si hay pocas
    const k = Math.max(1, Math.min(1.3, (ch - 16) / 140, (cw - 20) / (3 * 46 + 12))), bw = 46 * k, bh = 40 * k, g = 6 * k, fs = 18 * k;   // la pirámide crece con la tarjeta
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { v, vac } = e.datos, cx = x + cw / 2, base = y + (ch - 140 * k) / 2;
      p.marco(x, y, cw, ch, i);
      const pos = [0, 1, 2].map((j) => [cx + (j - 1) * (bw + g), base]).concat([0, 1].map((j) => [cx + (j - 0.5) * (bw + g), base + 50 * k]), [[cx, base + 100 * k]]);
      pos.forEach(([px, py], j) => p.caja(px - bw / 2, py, bw, bh, vac.includes(j) ? null : v[j], fs, vac.includes(j) ? v[j] : null));
    }));
  },
});
