// geometria.traslada · Traslada la figura (3.º, lote 7, bloque 9; solo curso 3, sin rango).
// datos:    { gc, gr: columnas y filas de la cuadrícula (12 × 10), celdas: [[c, r]…] (la figura, r hacia arriba), pasos: [[dir, n]…] (dir: "R" → · "L" ← · "U" ↑ · "D" ↓; n = 1…6) }
// solucion: { huecos: [], celdas: [[c, r]…] (la figura trasladada; en la hoja de soluciones, coloreada en rojo) }
// La figura son 3 a 6 cuadraditos conectados (caja de 3 × 3 como mucho). La indicación son una o dos flechas («→ 4, ↓ 2»: primero la horizontal y después la vertical).
// La figura trasladada cabe entera en la cuadrícula y no pisa a la original (el desplazamiento horizontal o el vertical es al menos el ancho o el alto de la figura).
// Rejilla elástica de 1 columna con «Cantidad»: «Más grandes» = 2 y 1 (cuadrícula de cuadraditos de ≈ 30 pt); «Más ejercicios» = las filas que caben con tarjetas ≥ 190 pt (3 y 1).
import { registrar } from "../nucleo/tipos.js";
import { TOP, W, M, INK, COLOR_SOLUCION, cuantosRejilla } from "../render/papel.js";
import { flecha, DIR } from "./geometria.itinerario.js";

export const GC = 12;
export const GR = 10;
const MIN_ALTO = 190;

/** Mueve las celdas n pasos. */
export const mover = (celdas, pasos) => {
  const dx = pasos.reduce((s, [d, n]) => s + DIR[d][0] * n, 0), dy = pasos.reduce((s, [d, n]) => s + DIR[d][1] * n, 0);
  return celdas.map(([c, r]) => [c + dx, r + dy]);
};

/** Figura conectada de k cuadraditos dentro de 3 × 3 (crece añadiendo vecinos). */
function figura(azar, k) {
  for (;;) {
    const set = new Map([["1,1", [1, 1]]]);
    for (let t = 0; set.size < k && t < 100; t++) {
      const [c, r] = azar.elegir([...set.values()]), [dc, dr] = azar.elegir([[1, 0], [-1, 0], [0, 1], [0, -1]]), n = [c + dc, r + dr];
      if (n[0] >= 0 && n[0] <= 2 && n[1] >= 0 && n[1] <= 2) set.set(n + "", n);
    }
    if (set.size !== k) continue;
    const cel = [...set.values()], c0 = Math.min(...cel.map((q) => q[0])), r0 = Math.min(...cel.map((q) => q[1]));
    return cel.map(([c, r]) => [c - c0, r - r0]).sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  }
}

export default registrar({
  id: "geometria.traslada",
  version: 1,
  cantidad: true,
  generar(params, azar, ctx) {
    const cnt = cuantosRejilla(ctx, 1, MIN_ALTO, [2, 1]), vistos = new Set(), ejercicios = [];
    while (ejercicios.length < cnt) {
      const celdas = figura(azar, azar.entero(3, 6)), bw = Math.max(...celdas.map((q) => q[0])) + 1, bh = Math.max(...celdas.map((q) => q[1])) + 1;
      const hx = azar.elegir(["R", "L"]), vy = azar.elegir(["U", "D"]), uno = azar.entero(0, 3) === 0, nx = azar.entero(1, 6), ny = azar.entero(1, 4);
      const pasos = uno ? [azar.entero(0, 1) ? [hx, nx] : [vy, ny]] : [[hx, nx], [vy, ny]];
      const dx = pasos.reduce((s, [d, n]) => s + DIR[d][0] * n, 0), dy = pasos.reduce((s, [d, n]) => s + DIR[d][1] * n, 0);
      if (Math.abs(dx) < bw && Math.abs(dy) < bh) continue;   // no se pisa con la original
      // posición de salida: la figura y su traslado caben en la cuadrícula
      const c0min = Math.max(0, -dx), c0max = Math.min(GC - bw, GC - bw - dx), r0min = Math.max(0, -dy), r0max = Math.min(GR - bh, GR - bh - dy);
      if (c0min > c0max || r0min > r0max) continue;
      const c0 = azar.entero(c0min, c0max), r0 = azar.entero(r0min, r0max), base = celdas.map(([c, r]) => [c + c0, r + r0]), clave = JSON.stringify([base, pasos]);
      if (vistos.has(clave)) continue;
      vistos.add(clave);
      ejercicios.push({ datos: { gc: GC, gr: GR, celdas: base, pasos }, solucion: { huecos: [], celdas: mover(base, pasos) } });
    }
    return { enunciado: "Mira las flechas y dibuja la figura trasladada.\nCada número dice cuántos cuadraditos te mueves.", ejercicios };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.rejilla(TOP, 1, act.ejercicios.length);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { gc, gr, celdas, pasos } = e.datos, rw = 150, s = Math.min(34, (cw - rw - 52) / gc, (ch - 24) / gr), gw = gc * s, gh = gr * s, gx = x + 36, gy = y + (ch - gh) / 2;
      p.marco(x, y, cw, ch, i);
      for (let c = 0; c <= gc; c++) p.line(gx + c * s, gy, gx + c * s, gy + gh, { lw: 0.7, gris: 0.62 });
      for (let r = 0; r <= gr; r++) p.line(gx, gy + r * s, gx + gw, gy + r * s, { lw: 0.7, gris: 0.62 });
      p.rrect(gx, gy, gw, gh, 0, { lw: 1.2, stroke: 0.4 });
      const celda = (c, r, o) => p.rrect(gx + c * s, gy + r * s, s, s, 0, o);
      if (p.solucion) for (const [c, r] of e.solucion.celdas) celda(c, r, { lw: 1.8, fill: "#F2B8B5", stroke: COLOR_SOLUCION });
      for (const [c, r] of celdas) celda(c, r, { lw: 1.8, fill: 0.72, stroke: INK });
      const tx = gx + gw + 16, tw = W - M - 14 - tx, cy = y + ch / 2;
      p.text(tx + tw / 2, cy + 40, "Muévete:", 13, { f: "PM", anchor: "middle" });
      pasos.forEach(([dir, n], k) => {
        const yy = cy + 6 - k * 40;
        flecha(p, tx + tw * 0.28, yy, dir, 13);
        p.text(tx + tw * 0.28 + 24, yy - 8, String(n), 24, { f: "PB" });
      });
    }));
  },
});
