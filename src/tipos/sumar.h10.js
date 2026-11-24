// sumar.h10 · Sumas hasta 10 (port de _s_horiz(t, 10, …) del motor).
// datos:    { a, b, op: "+" }   (1 ≤ a, b ≤ 9; a + b ≤ 10)
// solucion: { huecos: [a + b] }
// «Más grandes»: 24 sumas en completa y 12 en media; «Más ejercicios»: 33 y 15 (hasta 10 hay 45 sumas distintas).
import { registrar } from "../nucleo/tipos.js";
import { parejas, dibujarHoriz } from "./sumar.h100.js";

export default registrar({
  id: "sumar.h10",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    return {
      enunciado: "Calcula y escribe el resultado en el cuadro gris.",
      ejercicios: parejas(ctx, 10, null, azar).map(([a, b]) => ({ datos: { a, b, op: "+" }, solucion: { huecos: [a + b] } })),
    };
  },
  dibujar: dibujarHoriz,
});
