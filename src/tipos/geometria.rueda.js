// geometria.rueda · ¿Rueda o no rueda? (port de _g_rueda() del motor).
// datos:    { cuerpo: "esfera"|"cubo"|"cilindro"|"cono"|"piramide" }
// solucion: { huecos: [], correcta: "rueda" | "no rueda" }   (ruedan esfera, cilindro y cono)
// Completa: 12 cuerpos (4 filas × 3); media: 6.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { CUERPOS, RUEDAN, ciclo, cuerpo, chips } from "./geometria.dibujo.js";

export default registrar({
  id: "geometria.rueda",
  version: 1,
  generar(params, azar, { tamano }) {
    const cnt = tamano === "media" ? 6 : 12;
    return {
      enunciado: "Rodea si cada cuerpo rueda o no rueda.",
      ejercicios: ciclo(CUERPOS, cnt, azar).map((k) => ({
        datos: { cuerpo: k }, solucion: { huecos: [], correcta: RUEDAN.includes(k) ? "rueda" : "no rueda" },
      })),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 3, 4);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i];
      p.marco(x, y, cw, ch, i);
      cuerpo(p, e.datos.cuerpo, x + cw / 2, y + ch * 0.6, 62);
      chips(p, x + cw / 2, y + 14, ["rueda", "no rueda"], 11, e.solucion.correcta);
    }));
  },
});
