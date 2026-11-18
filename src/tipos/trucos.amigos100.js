// trucos.amigos100 · Amigos del 100 (truco de Calculi para 2.º, c2/01). Ver _trucos.js.
import { trucoTipo, fila } from "./_trucos.js";

export default trucoTipo({
  id: "trucos.amigos100",
  enunciado: "Truco: busco el amigo del 100. Escribe el número que falta en el cuadro gris.",
  filas: 8,
  pool({ modo }) {
    const forma = (a, f) => (f === 0 ? fila([`${a} +`, null, "= 100"], 100 - a) : f === 1 ? fila([null, `+ ${a} = 100`], 100 - a) : fila([`100 = ${a} +`, null], 100 - a));
    const out = [];
    for (let a = 10; a <= 90; a += 10) for (let f = 0; f < 3; f++) out.push(forma(a, f));   // decenas exactas: las tres formas
    if (modo !== "decenas") for (let a = 11; a <= 99; a++) if (a % 10 && a !== 50) out.push(forma(a, a % 3));   // otros números: una forma cada uno (así las decenas exactas pesan lo suyo)
    return out;
  },
});
