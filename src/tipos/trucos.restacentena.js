// trucos.restacentena · Restar llegando a la centena (guion de 3.º, lote 8): 503 − 497, cuento desde 497 hasta 500 y de 500 a 503.
// Fila encadenada «503 − 497 = [3] + [3] = [6]» (lo que falta para la centena + lo que se pasa). b = 100k − d (d 1..9), a = 100k + e (e 1..9), k 2..9.
// Ver _trucos.js (2 columnas).
import { trucoTipo, fila, M } from "./_trucos.js";

export default trucoTipo({
  id: "trucos.restacentena",
  enunciado: "Truco: cuento desde el número pequeño hasta la centena y de la centena al grande.\nEscribe los números que faltan.",
  filas: 8,
  columnas: 2,
  pool() {
    const out = [];
    for (let k = 2; k <= 9; k++) for (let d = 1; d <= 9; d++) for (let e = 1; e <= 9; e++) {
      const b = 100 * k - d, a = 100 * k + e;
      if (a > 999) continue;
      out.push(fila([`${a} ${M} ${b} =`, null, "+", null, "=", null], d, e, d + e));
    }
    return out;
  },
});
