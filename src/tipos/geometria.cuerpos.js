// geometria.cuerpos · Los cuerpos geométricos (port de _g_cuerpos() y _cuerpo() del motor).
// datos:    { cuerpo: "esfera"|"cubo"|"cilindro"|"cono"|"piramide", opciones: [3 nombres] }
// solucion: { huecos: [], correcta: nombre }
// Completa: 12 cuerpos (6 filas × 2); media: 6.
// Opción modo (solo 3.º, lote 7): "elementos" · «Caras, aristas y vértices»: datos { cuerpo: "cubo"|"prisma_rect"|"prisma_tri"|"piramide_cuad"|"piramide_tri" },
//   solucion { huecos: [caras, aristas, vértices] } (cubo 6/12/8, prisma rectangular 6/12/8, prisma triangular 5/9/6, pirámide cuadrada 5/8/5, pirámide triangular 4/6/4).
//   Dibujo en perspectiva con las aristas ocultas discontinuas y un punto en cada vértice; el nombre del cuerpo va escrito. Completa: 8 (2 × 4); media: 4. Recorre los 5 cuerpos.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { CUERPOS, NOMC, ciclo, tres, cuerpo, cuerpoElementos, chips } from "./geometria.dibujo.js";

/** nombre, caras, aristas y vértices de cada cuerpo del modo «elementos». */
export const ELEMENTOS = {
  cubo: ["Cubo", 6, 12, 8], prisma_rect: ["Prisma rectangular", 6, 12, 8], prisma_tri: ["Prisma triangular", 5, 9, 6],
  piramide_cuad: ["Pirámide cuadrada", 5, 8, 5], piramide_tri: ["Pirámide triangular", 4, 6, 4],
};

export default registrar({
  id: "geometria.cuerpos",
  version: 1,
  generar(params, azar, { tamano }) {
    if (params.modo === "elementos") {
      return {
        enunciado: "Cuenta las caras, las aristas y los vértices (los puntos) de cada cuerpo.\nLas líneas discontinuas son aristas que no se ven.",
        ejercicios: ciclo(Object.keys(ELEMENTOS), tamano === "media" ? 4 : 8, azar).map((k) => ({ datos: { cuerpo: k }, solucion: { huecos: ELEMENTOS[k].slice(1) } })),
      };
    }
    const cnt = tamano === "media" ? 6 : 12;
    return {
      enunciado: "Rodea el nombre de cada cuerpo geométrico.",
      ejercicios: ciclo(CUERPOS, cnt, azar).map((k) => ({
        datos: { cuerpo: k, opciones: tres(CUERPOS, k, azar).map((o) => NOMC[o]) }, solucion: { huecos: [], correcta: NOMC[k] },
      })),
    };
  },
  dibujar(p, act) {
    if (act.params?.modo === "elementos") {
      const { cel, cw, ch } = p.celdas(TOP, 2, 4);
      act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
        const [x, y] = cel[i], [nombre] = ELEMENTOS[e.datos.cuerpo], bx = x + cw - 124, sp = Math.min(50, (ch - 18) / 3);
        p.marco(x, y, cw, ch, i);
        cuerpoElementos(p, e.datos.cuerpo, x + (cw - 132) / 2 + 6, y + 30 + (ch - 40) / 2, cw - 156, ch - 70);
        p.text(x + (cw - 132) / 2 + 6, y + 9, nombre, 11.5, { f: "PM", anchor: "middle" });
        ["caras", "aristas", "vértices"].forEach((t, k) => {
          const cy = y + ch - 10 - (k + 0.5) * sp;
          p.text(bx, cy - 4, t, 12.5, { f: "PM" });
          p.caja(bx + 68, cy - 17, 46, 34, null, 22, e.solucion.huecos[k]);
        });
      }));
      return;
    }
    const { cel, cw, ch } = p.celdas(TOP, 2, 6);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i];
      p.marco(x, y, cw, ch, i);
      cuerpo(p, e.datos.cuerpo, x + cw / 2, y + ch * 0.6, 56);
      chips(p, x + cw / 2, y + 10, e.datos.opciones, 10.5, e.solucion.correcta);
    }));
  },
});
