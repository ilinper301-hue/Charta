// trucos.descomponer2 · Decenas y unidades (truco de Calculi para 2.º, c2/04): sumar por separado, sin llevada.
// Fila encadenada de tres huecos: «34 + 25 = [50] + [9] = [59]». Ver _trucos.js (2 columnas: la fila es ancha).
import { trucoTipo, fila } from "./_trucos.js";

export default trucoTipo({
  id: "trucos.descomponer2",
  enunciado: "Truco: sumo decenas con decenas y unidades con unidades. Escribe los números que faltan.",
  filas: 8,
  columnas: 2,
  pool() {
    const out = [];
    for (let da = 1; da <= 8; da++) for (let db = 1; da + db <= 9; db++) for (let ua = 1; ua <= 8; ua++) for (let ub = 1; ua + ub <= 9; ub++) {
      const a = 10 * da + ua, b = 10 * db + ub;
      out.push(fila([`${a} + ${b} =`, null, "+", null, "=", null], 10 * (da + db), ua + ub, a + b));
    }
    return out;
  },
});
