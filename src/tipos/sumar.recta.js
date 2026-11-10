// sumar.recta · Suma en la recta numérica, saltando hacia delante (port de _s_recta() del motor).
// datos:    { a, b, N }   (N = 10, 20 o 30: longitud de la recta; 2 ≤ b ≤ min(9, N − 2), 1 ≤ a ≤ N − b)
// solucion: { huecos: [a + b] }
// 2.º (rango ≥ 100): recta de 10 en 10 o de 100 en 100 (ver recta2() en restar.recta.js).
// Completa: 6 sumas (una por fila); media: 3.
import { registrar } from "../nucleo/tipos.js";
import { recta2, filaRecta } from "./restar.recta.js";

export default registrar({
  id: "sumar.recta",
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 10, N = R <= 10 ? 10 : R <= 20 ? 20 : 30, ejercicios = [];
    if (R >= 100) return { enunciado: "Sigue el salto en la recta y escribe el resultado.", ejercicios: recta2(params, azar, tamano, false) };
    for (let i = 0; i < (tamano === "media" ? 3 : 6); i++) {
      const b = azar.entero(2, Math.min(9, N - 2)), a = azar.entero(1, N - b);
      ejercicios.push({ datos: { a, b, N }, solucion: { huecos: [a + b] } });
    }
    return { enunciado: "Sigue el salto en la recta y escribe el resultado.", ejercicios };
  },
  dibujar(p, act) {
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => filaRecta(p, e, i, "+")));
  },
});
