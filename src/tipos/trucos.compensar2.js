// trucos.compensar2 · Redondear y compensar (truco de Calculi para 2.º, c2/08): redondeo a la decena, sumo y quito lo que me pasé.
// Fila encadenada: «48 + 25 = 50 + 25 − [2] = [73]». Ver _trucos.js (2 columnas).
import { trucoTipo, fila, M } from "./_trucos.js";

export default trucoTipo({
  id: "trucos.compensar2",
  enunciado: "Truco: redondeo a la decena, sumo y compenso. Escribe los números que faltan.",
  filas: 8,
  columnas: 2,
  pool() {
    const out = [];
    for (let da = 1; da <= 7; da++) for (const fin of [7, 8, 9]) for (let b = 11; b <= 49; b++) {
      const a = 10 * da + fin, red = 10 * (da + 1);
      if (b % 10 === 0 || red + b > 99) continue;
      out.push(fila([`${a} + ${b} = ${red} + ${b} ${M}`, null, "=", null], red - a, a + b));
    }
    return out;
  },
});
