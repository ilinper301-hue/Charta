// geometria.cuenta · Cuenta las figuras (port de _g_cuenta() del motor).
// datos:    { figuras: [{ fig, var, dx, dy }…30] }   (posición j: fila j÷6, columna j mod 6, con desplazamiento dx, dy)
// solucion: { huecos: [nº de círculos, cuadrados, rectángulos, triángulos] }
// Un solo ejercicio (la lámina y sus 4 casillas). Cada clase aparece entre 4 y 18 veces (4 + 14 repartidas); en total 30. Solo completa.
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W } from "../render/papel.js";
import { FIGS, fig } from "./geometria.dibujo.js";

const r1 = (v) => Math.round(v * 10) / 10;

export default registrar({
  id: "geometria.cuenta",
  version: 1,
  generar(params, azar) {
    const cnt = [4, 4, 4, 4];
    for (let i = 0; i < 14; i++) cnt[azar.entero(0, 3)]++;
    const ks = azar.barajar(FIGS.flatMap((k, i) => Array(cnt[i]).fill(k)));
    return {
      enunciado: "Cuenta cuántas figuras de cada clase hay y escribe el número.",
      ejercicios: [{
        datos: { figuras: ks.map((k) => ({ fig: k, var: azar.entero(0, 3), dx: r1((azar.real() * 2 - 1) * 7), dy: r1((azar.real() * 2 - 1) * 7) })) },
        solucion: { huecos: cnt },
      }],
    };
  },
  dibujar(p, act) {
    const e = act.ejercicios[0], top = TOP;
    p.ejercicio(e.id, () => {
      p.marco(M, top - 480, W - 2 * M, 480);
      const px = (W - 2 * M) / 6;
      e.datos.figuras.forEach((f, j) => {
        const r = Math.floor(j / 6), q = j % 6;
        fig(p, f.fig, M + (q + 0.5) * px + f.dx, top - (r + 0.5) * 96 + f.dy, 38, f.var);
      });
      const cw = (W - 2 * M - 30) / 4, ch = 120, y = top - 490 - ch;
      FIGS.forEach((k, j) => {
        const x = M + j * (cw + 10);
        p.marco(x, y, cw, ch);
        fig(p, k, x + cw / 2, y + ch - 38, 36, 0);
        p.caja(x + cw / 2 - 28, y + 12, 56, 42, null, 22, e.solucion.huecos[j]);
      });
    });
  },
});
