// trucos.pasardecena2 · Pasar la decena (truco de Calculi para 2.º, c2/05): sumar con llevada completando la decena.
// Fila encadenada: «38 + 7 = 40 + [5] = [45]». Ver _trucos.js (2 columnas).
import { trucoTipo, fila } from "./_trucos.js";

export default trucoTipo({
  id: "trucos.pasardecena2",
  enunciado: "Truco: completo la decena y sumo lo que sobra. Escribe los números que faltan.",
  filas: 8,
  columnas: 2,
  pool() {
    const out = [];
    for (let da = 1; da <= 8; da++) for (let ua = 5; ua <= 9; ua++) for (let b = 3; b <= 9; b++) {
      if (ua + b < 11) continue;   // siempre con llevada (y sin caer justo en la decena)
      out.push(fila([`${10 * da + ua} + ${b} = ${10 * (da + 1)} +`, null, "=", null], ua + b - 10, 10 * da + ua + b));
    }
    return out;
  },
});
