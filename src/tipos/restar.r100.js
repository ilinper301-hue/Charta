// restar.r100 · Restas hasta 100 (port de _r_horiz(…, R) del motor; R = params.rango, 30 o 100).
// datos:    { a, b, op: "−" }     (a ≤ min(R, 99), 1 ≤ b < a)
// solucion: { huecos: [a − b] }
// Opción nivel: "sin" (D−D, DU−U, DU−DU sin llevada), "con" (unidades del minuendo menores que b ≤ 9), "mezcla" (una de cada cuatro con llevada).
// Completa: 24 restas (8 filas × 3); media: 12.
import { restasHoriz } from "./restar.r10.js";
export default restasHoriz("restar.r100", null, 30, "Restas hasta 100");
