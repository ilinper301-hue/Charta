// trucos.resta2cifras · Restar compensando (truco de Calculi para 3.º, c3/11): resto la decena redonda de al lado y devuelvo lo que me pasé.
// Fila encadenada «73 − 28 = 73 − 30 + [2] = [45]». b acaba en 6–9 (k = lo que falta para la decena, 1–4), a de 41 a 199, resultado ≥ 10. Ver _trucos.js (2 columnas).
import { trucoTipo, fila, M } from "./_trucos.js";

export default trucoTipo({
  id: "trucos.resta2cifras",
  enunciado: "Truco: resto la decena de al lado y devuelvo lo que me pasé.\nEscribe los números que faltan.",
  filas: 8,
  columnas: 2,
  pool() {
    const out = [];
    for (let t = 2; t <= 9; t++) for (let k = 1; k <= 4; k++) for (let a = 41; a <= 199; a++) {
      const b = 10 * t - k;
      if (a - b < 10) continue;
      out.push(fila([`${a} ${M} ${b} = ${a} ${M} ${10 * t} +`, null, "=", null], k, a - b));
    }
    return out;
  },
});
