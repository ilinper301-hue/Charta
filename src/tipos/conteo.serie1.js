// conteo.serie1 · Series de 1 en 1 (port de _c_series(…, [1]) del motor).
// datos:    { paso: 1, valores: [v…], huecos: [j…], sube }   (valores en el orden en que se ven, de izquierda a derecha;
//           huecos = posiciones vacías; sube = true si la serie crece hacia la derecha)
// solucion: { huecos: [valores de los huecos, de izquierda a derecha] }
// Cantidad: «Más grandes» = 8 series en completa y 4 en media; «Más ejercicios» = 10 y 5 (filas ≥ 60 pt). Rejilla elástica. Cada serie tiene 6 números (opción «huecos»: 1–4 vacíos).
import { registrar } from "../nucleo/tipos.js";
import { cuantosRejilla } from "../render/papel.js";
import { dibujarSerie, elegirHuecos, MIN_ALTO_SERIE } from "./conteo.series.js";


export default registrar({
  id: "conteo.serie1",
  version: 3,
  cantidad: true,
  generar(params, azar, ctx) {
    const R = params.rango ?? 10, h = params.huecos ?? 3, s = 1;
    const L = Math.min(6, Math.floor(R / s) + 1);
    if (L < 3) throw new Error(`Esta serie necesita un rango máximo mayor (paso ${s}, máx. ${R}).`);
    const filas = cuantosRejilla(ctx, 1, MIN_ALTO_SERIE, [8, 4]), usadas = new Set(), ejercicios = [];
    for (let i = 0; i < filas; i++) {
      let cand = []; for (let a = 1; a <= R - (L - 1) * s; a++) cand.push(a);
      cand = cand.filter((a) => !usadas.has(a)).length ? cand.filter((a) => !usadas.has(a)) : cand;
      const a = azar.elegir(cand); usadas.add(a);
      let vals = Array.from({ length: L }, (_, j) => a + j * s);
      const sube = i % 2 === 0;
      if (!sube) vals.reverse();
      const huecos = elegirHuecos(L, Math.min(h, L - 2), azar);
      ejercicios.push({ datos: { paso: s, valores: vals, huecos, sube }, solucion: { huecos: huecos.map((j) => vals[j]) } });
    }
    return { enunciado: "Completa cada serie escribiendo los números que faltan en los cuadros grises.", ejercicios };
  },
  dibujar: dibujarSerie,
});
