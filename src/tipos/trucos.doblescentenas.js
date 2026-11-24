// trucos.doblescentenas · Dobles y mitades de centenas (guion de 3.º, lote 8): el doble de 3 centenas son 6 centenas.
// Filas «2 × 300 = [600]», «2 × 350 = [600] + [100] = [700]», «800 : 2 = [400]» y «700 : 2 = [300] + [50] = [350]» (se parte lo que no se reparte en dos).
// (Las filas con trozos solo con números de tres cifras, para que quepan grandes.) Opción modo: null = dobles y mitades · "doble" · "mitad". Sin repetir. Ver _trucos.js (2 columnas: las filas encadenadas son anchas).
import { trucoTipo, fila } from "./_trucos.js";

export default trucoTipo({
  id: "trucos.doblescentenas",
  enunciado: "Truco: calculo con centenas y después añado los ceros.\nEscribe los números que faltan.",
  filas: 8,
  columnas: 2,
  pool({ modo }) {
    const out = [];
    if (modo !== "mitad") {
      for (let n = 100; n <= 4900; n += 100) out.push(fila([`2 × ${n} =`, null], 2 * n));
      for (let n = 150; n <= 950; n += 100) out.push(fila([`2 × ${n} =`, null, "+", null, "=", null], 2 * (n - 50), 100, 2 * n));
    }
    if (modo !== "doble") {
      for (let n = 200; n <= 9800; n += 200) out.push(fila([`${n} : 2 =`, null], n / 2));
      for (let n = 100; n <= 900; n += 200) out.push(fila([`${n} : 2 =`, null, "+", null, "=", null], (n - 100) / 2, 50, n / 2));
    }
    return out;
  },
});
