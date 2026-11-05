// restar.encadenadas · Restas encadenadas, de izquierda a derecha (port de _r_enc() del motor).
// datos:    { a, b, c }     (a − b − c ≥ 1; max(6, cap/2) ≤ a ≤ cap, con cap = 10 si rango ≤ 10, si no 20)
// solucion: { huecos: [a − b − c] }
// Completa: 16 (8 filas × 2); media: 8. Sin repetidos.
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B, MENOS } from "../render/papel.js";

export default registrar({
  id: "restar.encadenadas",
  version: 1,
  generar(params, azar, { tamano }) {
    const cap = (params.rango ?? 10) <= 10 ? 10 : 20, cnt = tamano === "media" ? 8 : 16, vistos = new Set(), ejercicios = [];
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
    p.pintar(TOP, 2, 8, es.map((e) => [T(`${e.datos.a} ${MENOS} ${e.datos.b} ${MENOS} ${e.datos.c} =`, 18), B(44, 36, e.solucion.huecos[0])]), es.map((e) => e.id));
  },
});
