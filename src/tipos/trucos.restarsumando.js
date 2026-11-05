// trucos.restarsumando · Restar sumando (truco de Calculi para 1.º; modelo propio de la app). Ver _trucos.js.
import { trucoTipo, fila, M } from "./_trucos.js";

export default trucoTipo({
  id: "trucos.restarsumando",
  enunciado: "Truco: cuento lo que falta para llegar. Escribe el número que falta en el cuadro gris.",
  filas: 8,
  pool() {
    const out = [];
    for (let s = 7; s <= 9; s++) for (let t = 11; t <= 18; t++) out.push(fila([`${t} ${M} ${s} =`, null], t - s), fila([`${s} +`, null, `= ${t}`], t - s));
    return out;
  },
});
