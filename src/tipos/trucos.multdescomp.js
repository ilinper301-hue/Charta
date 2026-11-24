// trucos.multdescomp · Multiplicar partiendo (truco de Calculi para 3.º, c3/13): 6 × 14 = 6 × 10 + 6 × 4.
// Fila encadenada «6 × 14 = [60] + [24] = [84]». Factor de 3 a 9 por un número de 12 a 19. Ver _trucos.js (2 columnas).
import { trucoTipo, fila } from "./_trucos.js";

export default trucoTipo({
  id: "trucos.multdescomp",
  enunciado: "Truco: parto el número en 10 y lo que sobra, multiplico cada parte y sumo.\nEscribe los números que faltan.",
  filas: 8,
  columnas: 2,
  pool() {
    const out = [];
    for (let a = 3; a <= 9; a++) for (let b = 12; b <= 19; b++) out.push(fila([`${a} × ${b} =`, null, "+", null, "=", null], a * 10, a * (b - 10), a * b));
    return out;
  },
});
