// restar.mitades · Las mitades (port de _r_mitades() del motor).
// datos:    { n, forma: 0|1 }     (n par, 2 ≤ n ≤ min(rango, 20); forma 0: «La mitad de n = ☐»; forma 1: «n = ☐ + ☐»)
// solucion: { huecos: [n/2] }  (forma 0)   ·   { huecos: [n/2, n/2] }  (forma 1)
// Opción modo: null (solo números) o "dibujo" (dos filas de puntos con la mitad de n cada una).
// «Más grandes»: 12 tarjetas en completa (4 filas × 3) y 6 en media; «Más ejercicios»: 33 y 15 (tarjetas ≥ 54 pt; con dibujo, ≥ 160 pt: sin cambio), con tope en los pares (n, forma) distintos.
// Como el motor, si hay menos pares (n, forma) que tarjetas de siempre, se repiten.
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B, INK } from "../render/papel.js";
import { MIN_OP, cuantos, pintarEl } from "./_elastica.js";

const MIN_DIBUJO = 160;   // con dibujo (dos filas de puntos): tarjetas de siempre

export default registrar({
  id: "restar.mitades",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const cap = Math.min(params.rango ?? 10, 20), pool = [];
    for (let n = 2; n <= cap; n += 2) for (const f of [0, 1]) pool.push([n, f]);
    const cnt = cuantos(ctx, 3, params.modo === "dibujo" ? MIN_DIBUJO : MIN_OP, [12, 6], pool.length);
    const cs = azar.barajar(pool).slice(0, cnt);
    while (cs.length < cnt) cs.push(azar.elegir(pool));
    return {
      enunciado: "Escribe la mitad de cada número.",
      ejercicios: cs.map(([n, forma]) => ({ datos: { n, forma }, solucion: { huecos: forma === 0 ? [n / 2] : [n / 2, n / 2] } })),
    };
  },
  dibujar(p, act) {
    const es = act.ejercicios, dib = act.params.modo === "dibujo";
    const items = (e) => { const { n, forma } = e.datos, s = e.solucion.huecos;
      return forma === 0 ? [T(`La mitad de ${n} =`, 14), B(44, 38, s[0])] : [T(`${n} =`, 17), B(40, 38, s[0]), T("+", 17), B(40, 38, s[1])]; };
    if (!dib) { pintarEl(p, 3, es.map(items), es.map((e) => e.id), 4, 10); return; }
    const { cel, cw, ch } = p.rejilla(TOP, 3, Math.max(Math.ceil(es.length / 3), p.n(4)));   // con dibujo las tarjetas son las de siempre
    es.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], h = e.datos.n / 2, pitch = Math.min(20, (cw - 36) / h), r = Math.min(6, pitch * 0.3), x0 = x + cw / 2 - (h - 1) * pitch / 2;
      p.marco(x, y, cw, ch, i);
      for (let j = 0; j < h; j++) {
        p.circle(x0 + j * pitch, y + 128 + pitch / 2, r, { fill: INK, stroke: null });
        p.circle(x0 + j * pitch, y + 128 - pitch / 2, r, { fill: INK, stroke: null });
      }
      p.linea(x, y + 10, cw, 60, items(e), 8, false);
    }));
  },
});
