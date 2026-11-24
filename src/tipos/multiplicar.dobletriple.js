// multiplicar.dobletriple · El doble, el triple, la mitad y el tercio (3.º, lote 3, bloque 13; solo curso 3, sin rango).
// datos:    { tarea: "doble" | "triple" | "mitad" | "tercio", n }
// solucion: { huecos: [resultado] }
// Opción modo: None = doble y triple · "mitad" = mitad y tercio · "todo" = los cuatro (por turnos).
// Números por tarea (de más fácil a más difícil, por turnos): doble 11–49, 51–499 y centenas de 1000 a 4900; triple 11–33, 34–333 y centenas de 1000 a 3300;
// mitad pares de 12 a 98, de 102 a 998 y de 1000 a 9800 de 200 en 200; tercio múltiplos de 3 de 12 a 99, de 102 a 999 y de 1200 a 9900 de 300 en 300. Sin repetir (tarea, n).
// Rejilla elástica de 2 columnas × 8 filas (16; media 8). Cantidad: «Más grandes» = 16 y 8; «Más ejercicios» = las filas de 2 que caben con tarjetas ≥ 54 pt.
import { registrar } from "../nucleo/tipos.js";
import { T, B } from "../render/papel.js";
import { cuantos, pintarEl, MIN_OP } from "./_elastica.js";

const paso = (lo, hi, d) => { const l = []; for (let v = lo; v <= hi; v += d) l.push(v); return l; };
export const TAREAS = {
  doble: { texto: "El doble de", f: (n) => n * 2, clases: [paso(11, 49, 1), paso(51, 499, 1), paso(1000, 4900, 100)] },
  triple: { texto: "El triple de", f: (n) => n * 3, clases: [paso(11, 33, 1), paso(34, 333, 1), paso(1000, 3300, 100)] },
  mitad: { texto: "La mitad de", f: (n) => n / 2, clases: [paso(12, 98, 2), paso(102, 998, 2), paso(1000, 9800, 200)] },
  tercio: { texto: "El tercio de", f: (n) => n / 3, clases: [paso(12, 99, 3), paso(102, 999, 3), paso(1200, 9900, 300)] },
};
const MODOS = { null: ["doble", "triple"], mitad: ["mitad", "tercio"], todo: ["doble", "triple", "mitad", "tercio"] };

export default registrar({
  id: "multiplicar.dobletriple",
  version: 1,
  cantidad: true,
  generar(params, azar, ctx) {
    const tareas = MODOS[params.modo ?? null], cnt = cuantos(ctx, 2, MIN_OP, [16, 8]);
    const vistos = new Set(), ejercicios = [];
    for (let i = 0; i < cnt; i++) {
      const tarea = tareas[i % tareas.length], clases = TAREAS[tarea].clases, ronda = Math.floor(i / tareas.length);
      const lib = clases[ronda % clases.length].filter((n) => !vistos.has(tarea + n)), n = azar.elegir(lib.length ? lib : clases.flat().filter((m) => !vistos.has(tarea + m)));
      vistos.add(tarea + n);
      ejercicios.push({ datos: { tarea, n }, solucion: { huecos: [TAREAS[tarea].f(n)] } });
    }
    return { enunciado: "Calcula y escribe el resultado en el cuadro gris.", ejercicios };
  },
  dibujar(p, act) {
    const es = act.ejercicios;
    pintarEl(p, 2, es.map((e) => [T(`${TAREAS[e.datos.tarea].texto} ${e.datos.n} =`, 17), B(64, 38, e.solucion.huecos[0])]), es.map((e) => e.id), es.length / 2, 8, 8, 1);   // kMax 1: la letra no crece (los renglones largos ya llenan la tarjeta)
  },
});
