// geometria.copia · Copia el dibujo (port de _g_copia() y FORMAS del motor).
// datos:    { forma (nombre), lin: [[[x, y]…]…] }  — polilíneas en puntos de una rejilla 6×6 (ya girado/volteado)
// solucion: { huecos: [] }   (el alumno copia en la rejilla de la derecha; en soluciones se traza en rojo)
// 8 dibujos distintos (4 filas × 2). Solo completa.
import { registrar } from "../nucleo/tipos.js";
import { TOP, INK, COLOR_SOLUCION } from "../render/papel.js";
import { poli } from "./geometria.dibujo.js";

export const FORMAS = {
  casa: [[[0, 0], [4, 0], [4, 3], [2, 5], [0, 3], [0, 0]]], flecha: [[[0, 2], [3, 2], [3, 4], [5, 2], [3, 0], [3, 2]]],
  escalera: [[[0, 0], [0, 1], [1, 1], [1, 2], [2, 2], [2, 3], [3, 3], [3, 4], [4, 4], [4, 0], [0, 0]]],
  zigzag: [[[0, 1], [1, 4], [2, 1], [3, 4], [4, 1], [5, 4]]], bandera: [[[1, 0], [1, 5], [5, 4], [1, 3]]],
  diamante: [[[2, 0], [4, 2], [2, 4], [0, 2], [2, 0]]], T: [[[0, 5], [4, 5], [4, 4], [2, 4], [2, 0], [1, 0], [1, 4], [0, 4], [0, 5]]],
  barco: [[[0, 2], [5, 2], [4, 0], [1, 0], [0, 2]], [[2, 2], [2, 5], [4, 2]]],
};

export default registrar({
  id: "geometria.copia",
  version: 1,
  generar(params, azar) {
    const nom = azar.barajar(Object.keys(FORMAS));
    return {
      enunciado: "Copia cada dibujo en la cuadrícula de la derecha.",
      ejercicios: nom.map((forma) => {
        let lin = FORMAS[forma].map((pl) => pl.map(([a, b]) => [a, b]));
        for (let k = azar.entero(0, 3); k > 0; k--) lin = lin.map((pl) => pl.map(([a, b]) => [b, 5 - a]));
        if (azar.real() < 0.5) lin = lin.map((pl) => pl.map(([a, b]) => [5 - a, b]));
        return { datos: { forma, lin }, solucion: { huecos: [] } };
      }),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 2, 4), sp = 22;
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], lin = e.datos.lin;
      p.marco(x, y, cw, ch, i);
      const gx1 = x + (cw - 244) / 2, gx2 = gx1 + 134, gy = y + (ch - 110) / 2 - 4;
      for (const gx of [gx1, gx2]) for (let a = 0; a < 6; a++) for (let b = 0; b < 6; b++) p.circle(gx + a * sp, gy + b * sp, 1.8, { fill: INK, stroke: null });
      for (const pl of lin) poli(p, pl.map(([a, b]) => [gx1 + a * sp, gy + b * sp]), { lw: 2.2 });
      if (p.solucion) for (const pl of lin) poli(p, pl.map(([a, b]) => [gx2 + a * sp, gy + b * sp]), { lw: 2.2, stroke: COLOR_SOLUCION });
    }));
  },
});
