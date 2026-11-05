// medida.longitud · Mide con cubitos (port de _m_longitud() del motor).
// datos:    { nombre, barras: [n] | [n1, n2] }  (longitud en cubitos, 2–12; con compara dos barras distintas A y B)
// solucion: medir → { huecos: [n] } · compara → { huecos: [] } (se rodea la letra de la barra más larga; en la solución, en rojo)
// Opción modo: null (medir y escribir) | "compara" (medir y rodear el más largo). Completa: 6 filas; media: 3.
import { registrar } from "../nucleo/tipos.js";
import { TOP, W, M } from "../render/papel.js";
import { chips } from "./medida.tiempo.js";

export default registrar({
  id: "medida.longitud",
  version: 1,
  generar(params, azar, { tamano }) {
    const compara = params.modo === "compara", nombres = azar.barajar(["lápiz", "cinta", "tira", "palo", "cuerda", "pajita", "regla", "hoja"]), ejercicios = [];
    for (let i = 0; i < (tamano === "media" ? 3 : 6); i++) {
      const n1 = azar.entero(2, 12), n2 = azar.elegir([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter((v) => v !== n1));
      const barras = compara ? [n1, n2] : [n1];
      ejercicios.push({ datos: { nombre: nombres[i], barras }, solucion: { huecos: compara ? [] : [n1] } });
    }
    return { enunciado: compara ? "Mide con los cubitos y rodea el más largo." : "Cuenta cuántos cubitos mide cada objeto y escribe el número.", ejercicios };
  },
  dibujar(p, act) {
    const top = TOP, rows = 6, GY = 10, rh = (top - M - (rows - 1) * GY) / rows, u = 26, gx = M + 108;
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const y = top - (i + 1) * rh - i * GY, { barras, nombre } = e.datos, compara = barras.length === 2;
      p.marco(M, y, W - 2 * M, rh);
      barras.forEach((nb, j) => {
        const by = y + rh - 36 - j * 26;
        p.rrect(gx, by, nb * u, 16, 6, { lw: 1.5, fill: 0.82 });
        p.text(M + 16, by + 3, compara ? (j === 0 ? "A" : "B") : `El ${nombre}`, 12, { f: "PM" });
      });
      for (let k = 0; k < 12; k++) p.rrect(gx + k * u, y + 12, u, u, 0, { lw: 1.3 });
      if (compara) {
        const pos = chips(p, W - M - 62, y + rh / 2 - 11, ["A", "B"], 12);
        if (p.solucion) { const [cx, w] = pos[barras[0] > barras[1] ? 0 : 1]; p.rrect(cx - 2, y + rh / 2 - 13, w + 4, 26, 10, { lw: 1.6, stroke: "#C62828" }); }
      } else {
        p.caja(W - M - 96, y + rh / 2 - 6, 50, 36, null, 22, e.solucion.huecos[0]);
        p.text(W - M - 42, y + rh / 2 + 6, "cubitos", 10.5, { f: "PM" });
      }
    }));
  },
});
