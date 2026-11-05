// trucos.casidobles · Casi dobles (truco de Calculi para 1.º; modelo propio de la app). Ver _trucos.js.
import { trucoTipo, fila, M } from "./_trucos.js";

export default trucoTipo({
  id: "trucos.casidobles",
  enunciado: "Truco: busco el doble y sumo 1. Escribe el número que falta en el cuadro gris.",
  filas: 6,
  pool() {
    const out = [];
    for (let n = 1; n <= 9; n++) out.push(fila([`${n} + ${n + 1} =`, null], 2 * n + 1), fila([`${n + 1} + ${n} =`, null], 2 * n + 1));
    return out;
  },
});
