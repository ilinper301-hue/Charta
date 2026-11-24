// trucos.multdecenas · Multiplicar decenas y centenas (truco de Calculi para 3.º, c3/12): 3 × 40 son 3 × 4 = 12 decenas, es decir, 120.
// Fila encadenada «3 × 40 = [12] × 10 = [120]» (y «4 × 300 = [12] × 100 = [1200]»). Factor de 2 a 9 por decenas de 20 a 90 o centenas de 200 a 900. Ver _trucos.js (2 columnas).
import { trucoTipo, fila } from "./_trucos.js";

export default trucoTipo({
  id: "trucos.multdecenas",
  enunciado: "Truco: multiplico las decenas (o centenas) y añado los ceros.\nEscribe los números que faltan.",
  filas: 8,
  columnas: 2,
  pool() {
    const out = [];
    for (let a = 2; a <= 9; a++) for (let t = 2; t <= 9; t++) {
      out.push(fila([`${a} × ${10 * t} =`, null, "× 10 =", null], a * t, a * t * 10));
      out.push(fila([`${a} × ${100 * t} =`, null, "× 100 =", null], a * t, a * t * 100));
    }
    return out;
  },
});
