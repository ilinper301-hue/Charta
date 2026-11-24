// geometria.rueda · ¿Rueda o no rueda? (port de _g_rueda() del motor).
// datos:    { cuerpo: "esfera"|"cubo"|"cilindro"|"cono"|"piramide" }
// solucion: { huecos: [], correcta: "rueda" | "no rueda" }   (ruedan esfera, cilindro y cono)
// Completa: 12 cuerpos (4 filas × 3); media: 6. Cantidad (rejilla elástica de 3 columnas): «Más grandes» = 12 y 6 (tarjetas que llenan el panel; el cuerpo crece de 62 a 77 pt);
// «Más ejercicios» = las filas que caben con tarjetas ≥ 128 pt (15 y 6, los cinco cuerpos por turnos).
import { registrar } from "../nucleo/tipos.js";
import { TOP, cuantosRejilla } from "../render/papel.js";
import { CUERPOS, RUEDAN, ciclo, cuerpo, chips } from "./geometria.dibujo.js";

export default registrar({
  id: "geometria.rueda",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const cnt = cuantosRejilla(ctx, 3, 128, [12, 6]);
    return {
      enunciado: "Rodea si cada cuerpo rueda o no rueda.",
      ejercicios: ciclo(CUERPOS, cnt, azar).map((k) => ({
        datos: { cuerpo: k }, solucion: { huecos: [], correcta: RUEDAN.includes(k) ? "rueda" : "no rueda" },
      })),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.rejilla(TOP, 3, Math.ceil(act.ejercicios.length / 3)), s = Math.max(62, Math.min(77, (ch - 50) * 0.75));
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i];
      p.marco(x, y, cw, ch, i);
      cuerpo(p, e.datos.cuerpo, x + cw / 2, y + 42 + (ch - 50) / 2, s);
      chips(p, x + cw / 2, y + 14, ["rueda", "no rueda"], 11, e.solucion.correcta);
    }));
  },
});
