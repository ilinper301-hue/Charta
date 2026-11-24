// trucos.suma2cifras · Sumar descomponiendo (truco de Calculi para 3.º, c3/10): sumo decenas por un lado y unidades por otro; las unidades pasan de 10 (hay llevada).
// Fila encadenada «47 + 36 = [70] + [13] = [83]». Ver _trucos.js (2 columnas).
import { trucoTipo, fila } from "./_trucos.js";

export default trucoTipo({
  id: "trucos.suma2cifras",
  enunciado: "Truco: sumo las decenas por un lado y las unidades por otro.\nEscribe los números que faltan.",
  filas: 8,
  columnas: 2,
  pool() {
    const out = [];
    for (let a = 12; a <= 99; a++) for (let b = 12; b <= 99; b++) {
      const ua = a % 10, ub = b % 10;
      if (!ua || !ub || ua + ub < 10 || a + b > 150) continue;
      out.push(fila([`${a} + ${b} =`, null, "+", null, "=", null], a - ua + b - ub, ua + ub, a + b));
    }
    return out;
  },
});
