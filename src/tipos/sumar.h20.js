// sumar.h20 · Sumas hasta 20 (port de _pares_suma(20, nivel) del motor).
// datos:    { a, b, op: "+" }
// solucion: { huecos: [a + b] }
// Completa: 24 sumas (8 filas × 3); media: 12 (la mitad de filas).
import { registrar } from "../nucleo/tipos.js";

const SIN = [], CON = [];
for (let a = 1; a < 20; a++) for (let b = 1; b < 20; b++)
  if (a + b <= 20 && !(a < 10 && b < 10 && a + b > 10)) SIN.push([a, b]);
for (let a = 2; a < 10; a++) for (let b = 2; b < 10; b++) if (a + b > 10) CON.push([a, b]);

/** Pares sin repetir alternando los grupos del nivel (como _unico() del motor). */
export function pares(grupos, cnt, azar) {
  const vistos = new Set(), out = [];
  for (let i = 0; i < cnt; i++) {
    const g = grupos[i % grupos.length];
    let p;
    for (let k = 0; k < 80; k++) { p = azar.elegir(g); if (!vistos.has(p.join())) break; }
    vistos.add(p.join()); out.push(p);
  }
  return azar.barajar(out);
}

export default registrar({
  id: "sumar.h20",
  version: 1,
  generar(params, azar, { tamano }) {
    const grupos = { sin: [SIN], con: [CON], mezcla: [SIN, CON] }[params.nivel || "sin"];
    const ps = pares(grupos, tamano === "media" ? 12 : 24, azar);
    return {
      enunciado: "Calcula y escribe el resultado en el cuadro gris.",
      ejercicios: ps.map(([a, b]) => ({ datos: { a, b, op: "+" }, solucion: { huecos: [a + b] } })),
    };
  },
});
