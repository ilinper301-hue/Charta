// conteo.falta · El número que falta (port de _c_falta() del motor).
// datos:    { a, huecos: [j…] }   fila de 5 números consecutivos a, a+1, …, a+4; huecos = posiciones vacías (ordenadas)
// solucion: { huecos: [a + j de cada hueco, de izquierda a derecha] }
// Opciones: huecos (1–3, por defecto 1). a: 1..máx(1, R − 4), sin repetir si el rango da para tantas filas.
// Completa: 16 filas (8 filas × 2); media: 8 (4 filas).
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { elegirHuecos } from "./conteo.serie1.js";
import { unicosEn } from "./conteo.anterior.js";

const L = 5;

export default registrar({
  id: "conteo.falta",
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 10, h = Math.max(1, Math.min(3, params.huecos ?? 1));
    const as = unicosEn(1, Math.max(1, R - L + 1), 16, azar).slice(0, tamano === "media" ? 8 : 16);
    return {
      enunciado: "Escribe en cada cuadro gris el número que falta.",
      ejercicios: as.map((a) => {
        const huecos = elegirHuecos(L, h, azar);
        return { datos: { a, huecos }, solucion: { huecos: huecos.map((j) => a + j) } };
      }),
    };
  },
  dibujar(p, act) {
    const tres = act.params?.rango > 100, cols = 2, rows = 8, { cel, cw, ch } = p.celdas(TOP, cols, rows, 10, 8), bw = tres ? 48 : 40, bh = 44, g = tres ? 4 : 7, fs = tres ? 20 : 22;   // 2.º: 3 cifras
    act.ejercicios.forEach((e, idx) => p.ejercicio(e.id, () => {
      const [x, y] = cel[idx], { a, huecos } = e.datos;
      p.marco(x, y, cw, ch);
      const bx = x + (cw - (L * bw + (L - 1) * g)) / 2;
      for (let j = 0; j < L; j++) {
        const k = huecos.indexOf(j);
        p.caja(bx + j * (bw + g), y + (ch - bh) / 2, bw, bh, k >= 0 ? null : a + j, fs, k >= 0 ? e.solucion.huecos[k] : null);
      }
    }));
  },
});
