// restar.r20 · Restas hasta 20 (port de _r_horiz(…, 20) del motor).
// datos:    { a, b, op: "−" }     (2 ≤ a ≤ 20, 1 ≤ b < a)
// solucion: { huecos: [a − b] }
// Opción nivel: null/"sin" (sin llevadas: a ≤ 10 o a − b ≥ 10), "con" (a de 11 a 19 y a − b < 10), "mezcla" (mitad y mitad).
// Completa: 24 restas (8 filas × 3); media: 12.
import { restasHoriz } from "./restar.r10.js";
export default restasHoriz("restar.r20", 20, 20, "Restas hasta 20");
