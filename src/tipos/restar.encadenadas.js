// restar.encadenadas · Restas encadenadas, de izquierda a derecha (port de _r_enc() del motor).
// datos:    { a, b, c }     (a − b − c ≥ 1; max(6, cap/2) ≤ a ≤ cap, con cap = 10 si rango ≤ 10, si no 20)
// solucion: { huecos: [a − b − c] }
// 2.º (rango ≥ 100): a = decena (o centena, salto 100) hasta el rango; b y c, de 10 a 90 (o de 100 a 900); a − b − c ≥ 10 (100).
// «Más grandes»: 16 en completa (8 filas × 2) y 8 en media; «Más ejercicios»: 22 y 10 (tarjetas ≥ 54 pt, rejilla elástica). Sin repetidos.
import { registrar } from "../nucleo/tipos.js";
import { T, B, MENOS } from "../render/papel.js";
import { encadenadas2, FIJO } from "./sumar.encadenadas.js";
import { MIN_OP, cuantos, pintarEl } from "./_elastica.js";

export default registrar({
  id: "restar.encadenadas",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const cap = (params.rango ?? 10) <= 10 ? 10 : 20, cnt = cuantos(ctx, 2, MIN_OP, FIJO), vistos = new Set(), ejercicios = [];
    if ((params.rango ?? 10) >= 100) return { enunciado: "Resta de izquierda a derecha y escribe el resultado.", ejercicios: encadenadas2(params, azar, cnt, true) };
    while (ejercicios.length < cnt) {
      let a, b, c;
      for (let k = 0; k < 300; k++) {
        a = azar.entero(Math.max(6, Math.floor(cap / 2)), cap); b = azar.entero(1, a - 2);
        c = a - b > 1 ? azar.entero(1, a - b - 1) : 1;
        if (!vistos.has([a, b, c].join()) && a - b - c >= 0) break;
      }
      vistos.add([a, b, c].join());
      ejercicios.push({ datos: { a, b, c }, solucion: { huecos: [a - b - c] } });
    }
    return { enunciado: "Resta de izquierda a derecha y escribe el resultado.", ejercicios };
  },
  dibujar(p, act) {
    const es = act.ejercicios;
    pintarEl(p, 2, es.map((e) => [T(`${e.datos.a} ${MENOS} ${e.datos.b} ${MENOS} ${e.datos.c} =`, 18), B(es.some((e) => e.datos.a >= 100) ? 54 : 44, 36, e.solucion.huecos[0])]), es.map((e) => e.id), 8);
  },
});
