// trucos.sumadecenas · Sumar decenas (truco de Calculi para 2.º, c2/02): las unidades no cambian. Ver _trucos.js.
import { trucoTipo, fila } from "./_trucos.js";

export default trucoTipo({
  id: "trucos.sumadecenas",
  enunciado: "Truco: solo sumo las decenas. Escribe el número que falta en el cuadro gris.",
  filas: 8,
  pool() {
    const out = [];
    for (let da = 1; da <= 8; da++) for (let ua = 1; ua <= 9; ua++) for (let k = 1; da + k <= 9; k++) {
      const a = 10 * da + ua, b = 10 * k;
      out.push(fila([`${a} + ${b} =`, null], a + b), fila([`${b} + ${a} =`, null], a + b));
    }
    return out;
  },
});
