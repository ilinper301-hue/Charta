// sumar.dobles · Los dobles (port de _s_dobles() del motor).
// datos:    { n, forma: 0 | 1 }   (forma 0: «n + n =»; forma 1: «Doble de n =»; 1 ≤ n ≤ max(2, min(10, rango/2)))
// solucion: { huecos: [2n] }
// Opción modo: null (solo números) | "dibujo" (dos filas de n círculos sobre el cuadro).
// Completa: 12 (4 filas × 3); media: 6. Con rango 10 el motor completa con repetidos (solo hay 10 combinaciones).
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B, INK } from "../render/papel.js";

export default registrar({
  id: "sumar.dobles",
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 10, cap = Math.max(2, Math.min(10, Math.floor(R / 2))), k = tamano === "media" ? 6 : 12, pool = [];
    for (let n = 1; n <= cap; n++) for (const forma of [0, 1]) pool.push({ n, forma });
    const cs = azar.muestra(pool, k);
    while (cs.length < k) cs.push(azar.elegir(pool));
    return {
      enunciado: "Calcula el doble de cada número.",
      ejercicios: cs.map(({ n, forma }) => ({ datos: { n, forma }, solucion: { huecos: [2 * n] } })),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 3, 4), dibujo = act.params.modo === "dibujo";
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { n, forma } = e.datos, s = e.solucion.huecos[0];
      p.marco(x, y, cw, ch, i);
      const it = forma === 0 ? [T(`${n} + ${n} =`, 17), B(44, 38, s)] : [T(`Doble de ${n} =`, 14), B(44, 38, s)];
      if (dibujo) {
        const pitch = Math.min(20, (cw - 36) / n), r = Math.min(6, pitch * 0.3), x0 = x + cw / 2 - (n - 1) * pitch / 2;
        for (let j = 0; j < n; j++) {
          p.circle(x0 + j * pitch, y + 128 + pitch / 2, r, { fill: INK, stroke: null });
          p.circle(x0 + j * pitch, y + 128 - pitch / 2, r, { fill: INK, stroke: null });
        }
        p.linea(x, y + 10, cw, 60, it, 8);
      } else p.linea(x, y, cw, ch, it, 8);
    }));
  },
});
