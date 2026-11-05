// geometria.posiciones · Encima, debajo, izquierda y derecha (port de _g_posiciones() del motor).
// datos:    { a: "círculo"|"cuadrado" (el objeto por el que se pregunta), b: el otro, rel: "encima"|"debajo"|"a la izquierda"|"a la derecha" }
// solucion: { huecos: [], correcta: rel }
// Completa: 8 (4 filas × 2), las 4 posiciones dos veces cada una; media: 4.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { ciclo, chips } from "./geometria.dibujo.js";

const RELS = ["encima", "debajo", "a la izquierda", "a la derecha"];
const DESPL = { "encima": [0, 34], "debajo": [0, -34], "a la izquierda": [-52, 0], "a la derecha": [52, 0] };

export default registrar({
  id: "geometria.posiciones",
  version: 1,
  generar(params, azar, { tamano }) {
    const cnt = tamano === "media" ? 4 : 8;
    return {
      enunciado: "Mira el dibujo y rodea dónde está el primer objeto.",
      ejercicios: ciclo(RELS, cnt, azar).map((rel) => {
        const inv = azar.real() < 0.5, [a, b] = inv ? ["cuadrado", "círculo"] : ["círculo", "cuadrado"];
        return { datos: { a, b, rel }, solucion: { huecos: [], correcta: rel } };
      }),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 2, 4);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { a, b, rel } = e.datos;
      p.marco(x, y, cw, ch, i);
      p.text(x + cw / 2, y + ch - 22, `El ${a} está ______ del ${b}.`, 11, { f: "PR", anchor: "middle" });
      const [dx, dy] = DESPL[rel];
      const cx = x + cw / 2 - dx / 2, cy = y + 58 + (ch - 58 - 30) / 2 - dy / 2;
      for (const [ox, oy, nom] of [[cx, cy, b], [cx + dx, cy + dy, a]]) {
        if (nom === "círculo") p.circle(ox, oy, 12, { lw: 1.9 });
        else p.rrect(ox - 11, oy - 11, 22, 22, 0, { lw: 1.9 });
      }
      chips(p, x + cw / 2, y + 34, RELS.slice(0, 2), 10.5, rel);
      chips(p, x + cw / 2, y + 8, RELS.slice(2), 10.5, rel);
    }));
  },
});
