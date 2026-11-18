// trucos.restadecenas · Restar decenas (truco de Calculi para 2.º, c2/03): las unidades no cambian. Ver _trucos.js.
import { trucoTipo, fila, M } from "./_trucos.js";

export default trucoTipo({
  id: "trucos.restadecenas",
  enunciado: "Truco: solo resto las decenas. Escribe el número que falta en el cuadro gris.",
  filas: 8,
  pool() {
    const out = [];
    for (let da = 2; da <= 9; da++) for (let ua = 1; ua <= 9; ua++) for (let k = 1; k < da; k++) out.push(fila([`${10 * da + ua} ${M} ${10 * k} =`, null], 10 * (da - k) + ua));
    return out;
  },
});
