// trucos.restaradelante · Restar hacia delante (truco de Calculi para 2.º, c2/15): cuento cuánto falta del pequeño al grande.
// Filas mezcladas «62 − 58 = [4]» y «58 + [4] = 62» (como trucos.restarsumando). Ver _trucos.js.
import { trucoTipo, fila, M } from "./_trucos.js";

export default trucoTipo({
  id: "trucos.restaradelante",
  enunciado: "Truco: cuento hacia delante. Escribe el número que falta en el cuadro gris.",
  filas: 8,
  pool() {
    const out = [];
    for (let db = 1; db <= 8; db++) for (let ub = 6; ub <= 9; ub++) for (let c2 = 1; c2 <= 9; c2++) {   // b acaba en 6–9 y a pasa de la decena
      const b = 10 * db + ub, a = 10 * (db + 1) + c2, r = a - b;
      out.push(fila([`${a} ${M} ${b} =`, null], r), fila([`${b} +`, null, `= ${a}`], r));
    }
    return out;
  },
});
