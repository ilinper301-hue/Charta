// trucos.por5 · Multiplicar por 5 (guion de 3.º, lote 8; en Calculi es de 4.º): por 10 y la mitad.
// Fila encadenada «24 × 5 = [240] : 2 = [120]». Números de dos cifras de 12 a 98 que no son decenas exactas. Ver _trucos.js (2 columnas).
import { trucoTipo, fila } from "./_trucos.js";

export default trucoTipo({
  id: "trucos.por5",
  enunciado: "Truco: multiplico por 10 y calculo la mitad. Escribe los números que faltan.",
  filas: 8,
  columnas: 2,
  pool() {
    const out = [];
    for (let n = 12; n <= 98; n++) if (n % 10) out.push(fila([`${n} × 5 =`, null, ": 2 =", null], 10 * n, 5 * n));
    return out;
  },
});
