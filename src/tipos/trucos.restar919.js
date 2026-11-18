// trucos.restar919 · Restar 9 y 19 (truco de Calculi para 2.º, c2/07): resto 10 o 20 y devuelvo 1.
// Fila encadenada: «52 − 19 = [32] + 1 = [33]». Ver _trucos.js (2 columnas).
import { trucoTipo, fila, M } from "./_trucos.js";

export default trucoTipo({
  id: "trucos.restar919",
  enunciado: "Truco: resto 10 o 20 y devuelvo 1. Escribe los números que faltan.",
  filas: 8,
  columnas: 2,
  pool() {
    const out = [];
    for (const k of [9, 19]) for (let a = k === 9 ? 21 : 30; a <= 99; a++) if (a % 10) out.push(fila([`${a} ${M} ${k} =`, null, "+ 1 =", null], a - k - 1, a - k));
    return out;
  },
});
