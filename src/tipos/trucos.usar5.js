// trucos.usar5 · Usar el 5 (truco de Calculi para 1.º; modelo propio de la app). Ver _trucos.js.
import { trucoTipo, fila, M } from "./_trucos.js";

export default trucoTipo({
  id: "trucos.usar5",
  enunciado: "Truco: separo el 5 y sumo. Escribe el número que falta en el cuadro gris.",
  filas: 8,
  pool({ modo }) {
    const out = [];
    for (let a = 5; a <= 9; a++) for (let b = 5; b <= 9; b++) out.push(fila([`${a} + ${b} =`, null], a + b));
    if (modo !== "suma") for (let a = 6; a <= 9; a++) out.push(fila([`${a} = 5 +`, null], a - 5), fila([null, `+ 5 = ${a}`], a - 5));
    return out;
  },
});
