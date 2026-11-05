// sumar.h20 · Sumas hasta 20 (port de _pares_suma(20, nivel) del motor).
// datos:    { a, b, op: "+" }
// solucion: { huecos: [a + b] }
// Completa: 24 sumas (8 filas × 3); media: 12 (la mitad de filas). Dibujo: _s_horiz() → _pintar().
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B } from "../render/papel.js";

const SIN = [], CON = [];
for (let a = 1; a < 20; a++) for (let b = 1; b < 20; b++)
  if (a + b <= 20 && !(a < 10 && b < 10 && a + b > 10)) SIN.push([a, b]);
for (let a = 2; a < 10; a++) for (let b = 2; b < 10; b++) if (a + b > 10) CON.push([a, b]);
CON.lleva = true;

/** Pares sin repetir alternando los grupos del nivel (como _unico() del motor). */
export function pares(grupos, cnt, azar) {
  const vistos = new Set(), out = [];
  for (let i = 0; i < cnt; i++) {
    const g = grupos[i % grupos.length];
    let p;
    for (let k = 0; k < 80; k++) { p = azar.elegir(g); if (!vistos.has(p.join())) break; }
    if (vistos.has(p.join())) {      // grupo agotado (rangos pequeños): una sin usar de otro grupo del mismo tipo (con/sin llevada: marca .lleva)
      const libres = grupos.filter((x) => !!x.lleva === !!g.lleva).flat().filter((q) => !vistos.has(q.join()));
      if (libres.length) p = azar.elegir(libres);
    }
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
  dibujar(p, act) {
    const es = act.ejercicios;
    p.pintar(TOP, 3, 8, es.map((e) => [T(`${e.datos.a} + ${e.datos.b} =`, 19), B(42, 38, e.solucion.huecos[0])]), es.map((e) => e.id));
  },
});
