// trucos.masmenos10 · Sumar y restar 10 (truco de Calculi para 1.º; modelo propio de la app). Ver _trucos.js.
import { trucoTipo, fila, M } from "./_trucos.js";

export default trucoTipo({
  id: "trucos.masmenos10",
  enunciado: "Truco: cambio solo las decenas. Escribe el número que falta en el cuadro gris.",
  filas: 6,
  pool({ rango = 50, modo }) {
    const out = [];
    if (modo !== "resta") for (let a = 11; a + 10 <= rango; a++) out.push(fila([`${a} + 10 =`, null], a + 10), fila([`10 + ${a} =`, null], a + 10));
    if (modo !== "suma") for (let a = 21; a <= rango; a++) out.push(fila([`${a} ${M} 10 =`, null], a - 10));
    return out;
  },
});
