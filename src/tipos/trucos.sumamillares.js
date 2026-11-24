// trucos.sumamillares · Sumar y restar centenas y millares (truco de Calculi para 3.º, c3/14): cuento en centenas (o en millares) y añado los ceros.
// Filas «2500 + 300 = [2800]» y «5800 − 1000 = [4800]». Opción sumando: null = centenas redondas (a y b múltiplos de 100, b sin ser millar exacto) ·
// "mil" = un número cualquiera de 4 cifras y 1000, 2000 o 3000 (solo cambia la cifra de los millares). Opción modo: suma / resta / las dos. Ver _trucos.js.
import { trucoTipo, fila, M } from "./_trucos.js";

export default trucoTipo({
  id: "trucos.sumamillares",
  enunciado: "Truco: cuento en centenas o en millares y añado los ceros.\nEscribe el número que falta en el cuadro gris.",
  filas: 8,
  pool({ modo, sumando }) {
    const out = [], suma = modo !== "resta", resta = modo !== "suma";
    if (sumando === "mil") {
      for (let a = 1000; a <= 9999; a += 3) for (const b of [1000, 2000, 3000]) {   // de 3 en 3: pool amplio sin ser enorme
        if (a % 100 === 0) continue;   // el primer número no es redondo del todo
        if (suma && a + b <= 9999) out.push(fila([`${a} + ${b} =`, null], a + b));
        if (resta && a - b >= 1000) out.push(fila([`${a} ${M} ${b} =`, null], a - b));
      }
    } else {
      for (let a = 1000; a <= 9800; a += 100) for (let b = 100; b <= 4900; b += 100) {
        if (b % 1000 === 0 || a % 1000 === 0) continue;   // los redondos de verdad (3000 + 500) se ven con «Millares»
        if (suma && a + b <= 9900) out.push(fila([`${a} + ${b} =`, null], a + b));
        if (resta && a - b >= 1000) out.push(fila([`${a} ${M} ${b} =`, null], a - b));
      }
    }
    return out;
  },
});
