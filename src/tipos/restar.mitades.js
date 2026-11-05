// restar.mitades · Las mitades (port de _r_mitades() del motor).
// datos:    { n, forma: 0|1 }     (n par, 2 ≤ n ≤ min(rango, 20); forma 0: «La mitad de n = ☐»; forma 1: «n = ☐ + ☐»)
// solucion: { huecos: [n/2] }  (forma 0)   ·   { huecos: [n/2, n/2] }  (forma 1)
// Opción modo: null (solo números) o "dibujo" (dos filas de puntos con la mitad de n cada una).
// Completa: 12 tarjetas (4 filas × 3); media: 6. Como el motor, si hay menos pares (n, forma) que tarjetas, se repiten.
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B, INK } from "../render/papel.js";

export default registrar({
  id: "restar.mitades",
  version: 1,
  generar(params, azar, { tamano }) {
    const cap = Math.min(params.rango ?? 10, 20), cnt = tamano === "media" ? 6 : 12, pool = [];
    for (let n = 2; n <= cap; n += 2) for (const f of [0, 1]) pool.push([n, f]);
    const cs = azar.barajar(pool).slice(0, cnt);
    while (cs.length < cnt) cs.push(azar.elegir(pool));
    return {
      enunciado: "Escribe la mitad de cada número.",
      ejercicios: cs.map(([n, forma]) => ({ datos: { n, forma }, solucion: { huecos: forma === 0 ? [n / 2] : [n / 2, n / 2] } })),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 3, 4), dib = act.params.modo === "dibujo";
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { n, forma } = e.datos, s = e.solucion.huecos;
      p.marco(x, y, cw, ch, i);
      const it = forma === 0 ? [T(`La mitad de ${n} =`, 14), B(44, 38, s[0])] : [T(`${n} =`, 17), B(40, 38, s[0]), T("+", 17), B(40, 38, s[1])];
      if (dib) {
        const h = n / 2, pitch = Math.min(20, (cw - 36) / h), r = Math.min(6, pitch * 0.3), x0 = x + cw / 2 - (h - 1) * pitch / 2;
        for (let j = 0; j < h; j++) {
          p.circle(x0 + j * pitch, y + 128 + pitch / 2, r, { fill: INK, stroke: null });
          p.circle(x0 + j * pitch, y + 128 - pitch / 2, r, { fill: INK, stroke: null });
        }
        p.linea(x, y + 10, cw, 60, it, 8);
      } else p.linea(x, y, cw, ch, it, 8);
    }));
  },
});
