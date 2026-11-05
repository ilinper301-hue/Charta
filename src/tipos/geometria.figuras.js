// geometria.figuras · Las figuras planas (port de _g_figuras(), _fig(), _chips() del motor).
// datos:    { fig: "circulo"|"cuadrado"|"rectangulo"|"triangulo", var (0–3), opciones: [3 nombres] }
// solucion: { huecos: [], correcta: nombre }   (el alumno rodea una opción: sin hueco escrito; en soluciones se rodea en rojo)
// Completa: 12 figuras (6 filas × 2), recorriendo las 4 clases; media: 6.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { FIGS, NOMF, ciclo, tres, fig, chips } from "./geometria.dibujo.js";

export default registrar({
  id: "geometria.figuras",
  version: 1,
  generar(params, azar, { tamano }) {
    const cnt = tamano === "media" ? 6 : 12;
    return {
      enunciado: "Rodea el nombre de cada figura.",
      ejercicios: ciclo(FIGS, cnt, azar).map((k) => {
        const v = azar.entero(0, 3);
        return { datos: { fig: k, var: v, opciones: tres(FIGS, k, azar).map((o) => NOMF[o]) }, solucion: { huecos: [], correcta: NOMF[k] } };
      }),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 2, 6);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i];
      p.marco(x, y, cw, ch, i);
      fig(p, e.datos.fig, x + cw / 2, y + ch * 0.6, 44, e.datos.var);
      chips(p, x + cw / 2, y + 10, e.datos.opciones, 10.5, e.solucion.correcta);
    }));
  },
});
