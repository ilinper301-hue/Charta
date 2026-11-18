// trucos.sumar919 · Sumar 9 y 19 (truco de Calculi para 2.º, c2/06): sumo 10 o 20 y quito 1.
// Fila encadenada: «36 + 19 = [56] − 1 = [55]». Ver _trucos.js (2 columnas).
import { trucoTipo, fila, M } from "./_trucos.js";

export default trucoTipo({
  id: "trucos.sumar919",
  enunciado: "Truco: sumo 10 o 20 y quito 1. Escribe los números que faltan.",
  filas: 8,
  columnas: 2,
  pool() {
    const out = [];
    for (const k of [9, 19]) for (let a = 11; a + k <= 99; a++) if (a % 10) out.push(fila([`${a} + ${k} =`, null, `${M} 1 =`, null], a + k + 1, a + k));
    return out;
  },
});
