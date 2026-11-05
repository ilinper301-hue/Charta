// sumar.h10 · Sumas hasta 10 (port de _s_horiz(t, 10, …) del motor).
// datos:    { a, b, op: "+" }   (1 ≤ a, b ≤ 9; a + b ≤ 10)
// solucion: { huecos: [a + b] }
// Completa: 24 sumas (8 filas × 3); media: 12.
import { registrar } from "../nucleo/tipos.js";
import { paresSuma, dibujarHoriz } from "./sumar.h100.js";

export default registrar({
  id: "sumar.h10",
  version: 1,
  generar(params, azar, { tamano }) {
    return {
      enunciado: "Calcula y escribe el resultado en el cuadro gris.",
      ejercicios: paresSuma(10, null, tamano === "media" ? 12 : 24, azar).map(([a, b]) => ({ datos: { a, b, op: "+" }, solucion: { huecos: [a + b] } })),
    };
  },
  dibujar: dibujarHoriz,
});
