// geometria.cuerpos · Los cuerpos geométricos (port de _g_cuerpos() y _cuerpo() del motor).
// datos:    { cuerpo: "esfera"|"cubo"|"cilindro"|"cono"|"piramide", opciones: [3 nombres] }
// solucion: { huecos: [], correcta: nombre }
// Completa: 12 cuerpos (6 filas × 2); media: 6.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { CUERPOS, NOMC, ciclo, tres, cuerpo, chips } from "./geometria.dibujo.js";

export default registrar({
  id: "geometria.cuerpos",
  version: 1,
  generar(params, azar, { tamano }) {
    const cnt = tamano === "media" ? 6 : 12;
    return {
      enunciado: "Rodea el nombre de cada cuerpo geométrico.",
      ejercicios: ciclo(CUERPOS, cnt, azar).map((k) => ({
        datos: { cuerpo: k, opciones: tres(CUERPOS, k, azar).map((o) => NOMC[o]) }, solucion: { huecos: [], correcta: NOMC[k] },
      })),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 2, 6);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i];
      p.marco(x, y, cw, ch, i);
      cuerpo(p, e.datos.cuerpo, x + cw / 2, y + ch * 0.6, 56);
      chips(p, x + cw / 2, y + 10, e.datos.opciones, 10.5, e.solucion.correcta);
    }));
  },
});
