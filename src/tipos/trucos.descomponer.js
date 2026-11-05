// trucos.descomponer · Descomponer hasta 10 (truco de Calculi para 1.º; modelo propio de la app). Ver _trucos.js.
import { trucoTipo, fila, M } from "./_trucos.js";

export default trucoTipo({
  id: "trucos.descomponer",
  enunciado: "Truco: parto el número en dos. Escribe el trozo que falta en el cuadro gris.",
  filas: 8,
  pool({ rango = 10 }) {
    const out = [];
    for (let t = 4; t <= rango; t++) for (let a = 1; a < t; a++) {
      const b = t - a;
      out.push(fila([`${t} = ${a} +`, null], b), fila([`${a} +`, null, `= ${t}`], b), fila([`${t} =`, null, `+ ${b}`], a), fila([null, `+ ${b} = ${t}`], a));
    }
    return out;
  },
});
