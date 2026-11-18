// trucos.centenas · Sumar y restar centenas (truco de Calculi para 2.º, c2/14): solo cambian las centenas. Ver _trucos.js.
import { trucoTipo, fila, M } from "./_trucos.js";

export default trucoTipo({
  id: "trucos.centenas",
  enunciado: "Truco: sumo o resto las centenas. Escribe el número que falta en el cuadro gris.",
  filas: 8,
  pool({ modo }) {
    const out = [];
    for (let c = 1; c <= 9; c++) for (let d = 0; d <= 9; d++) for (let b = 1; b <= 9; b++) {
      const a = 100 * c + 10 * d;
      if (modo !== "resta" && c + b <= 9) out.push(fila([`${a} + ${100 * b} =`, null], a + 100 * b));
      if (modo !== "suma" && b < c) out.push(fila([`${a} ${M} ${100 * b} =`, null], a - 100 * b));
    }
    return out;
  },
});
