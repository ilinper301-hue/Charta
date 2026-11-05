// trucos.masmenos1 · Uno más, uno menos (truco de Calculi para 1.º; modelo propio de la app). Ver _trucos.js.
import { trucoTipo, fila, M } from "./_trucos.js";

export default trucoTipo({
  id: "trucos.masmenos1",
  enunciado: "Truco: doy un paso en la recta. Escribe el número que falta en el cuadro gris.",
  filas: 6,
  pool({ rango = 10, modo }) {
    const out = [];
    if (modo !== "menos") for (let n = 0; n < rango; n++) out.push(fila([`${n} + 1 =`, null], n + 1), fila([`1 + ${n} =`, null], n + 1));
    if (modo !== "mas") for (let n = 1; n <= rango; n++) out.push(fila([`${n} ${M} 1 =`, null], n - 1));
    return out;
  },
});
