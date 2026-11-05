// trucos.sumar9 · Sumar 9 (truco de Calculi para 1.º; modelo propio de la app). Ver _trucos.js.
import { trucoTipo, fila, M } from "./_trucos.js";

export default trucoTipo({
  id: "trucos.sumar9",
  enunciado: "Truco: sumo 10 y quito 1. Escribe el número que falta en el cuadro gris.",
  filas: 6,
  pool({ rango = 30 }) {
    const out = [];
    for (let n = 2; n + 9 <= rango; n++) out.push(fila([`${n} + 9 =`, null], n + 9), fila([`9 + ${n} =`, null], n + 9));
    return out;
  },
});
