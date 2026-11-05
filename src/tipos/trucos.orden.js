// trucos.orden · El orden no importa (truco de Calculi para 1.º; modelo propio de la app). Ver _trucos.js.
import { trucoTipo, fila, M } from "./_trucos.js";

export default trucoTipo({
  id: "trucos.orden",
  enunciado: "Truco: empiezo por el número grande. Escribe el número que falta en el cuadro gris.",
  filas: 8,
  pool({ rango = 10, forma }) {
    const out = [];
    for (let a = 1; a < rango; a++) for (let b = a + 1; a + b <= rango; b++) {
      if (forma !== "calcula") out.push(fila([`${a} + ${b} = ${b} +`, null], a), fila([`${a} + ${b} =`, null, `+ ${a}`], b));
      if (forma !== "igualdad") out.push(fila([`${a} + ${b} =`, null], a + b), fila([`${b} + ${a} =`, null], a + b));
    }
    return out;
  },
});
