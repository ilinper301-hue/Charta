// geometria.simetria · La simetría (port de _g_simetria() del motor).
// datos:    { hc (columnas de cada mitad, 3–5), pat: [6 filas de hc caracteres «X» (pintada) o «.»] }  — mitad izquierda
// solucion: { huecos: [] }   (el alumno colorea la mitad derecha como espejo; en soluciones se tiñe)
// Opción n: tamaño del dibujo (3–5, defecto 4). Cada dibujo tiene ≥ 6 cuadros pintados y ≥ 2 en la columna del eje.
// Completa: 8 dibujos (4 filas × 2); media: 4.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { lineaDash } from "./geometria.dibujo.js";

const ROWS = 6, CS = 20;

export default registrar({
  id: "geometria.simetria",
  version: 1,
  generar(params, azar, { tamano }) {
    const hc = Math.max(3, Math.min(5, params.n || 4)), cnt = tamano === "media" ? 4 : 8, ejercicios = [];
    for (let i = 0; i < cnt; i++) {
      let pat;
      for (;;) {
        pat = Array.from({ length: ROWS }, () => Array.from({ length: hc }, () => azar.real() < 0.45));
        if (pat.flat().filter(Boolean).length >= 6 && pat.filter((r) => r[hc - 1]).length >= 2) break;
      }
      ejercicios.push({ datos: { hc, pat: pat.map((r) => r.map((v) => (v ? "X" : ".")).join("")) }, solucion: { huecos: [] } });
    }
    return { enunciado: "Colorea la parte que falta para que los dos lados sean iguales.", ejercicios };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 2, 4);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { hc, pat } = e.datos;
      p.marco(x, y, cw, ch, i);
      const gx = x + (cw - 2 * hc * CS) / 2, gy = y + (ch - ROWS * CS) / 2 - 6;
      for (let r = 0; r < ROWS; r++) for (let q = 0; q < hc; q++) if (pat[r][q] === "X") {
        p.rrect(gx + q * CS, gy + (ROWS - 1 - r) * CS, CS, CS, 0, { fill: 0.45, stroke: null });
        if (p.solucion) p.rrect(gx + (2 * hc - 1 - q) * CS, gy + (ROWS - 1 - r) * CS, CS, CS, 0, { fill: "#EF9A9A", stroke: null });
      }
      for (let q = 0; q <= 2 * hc; q++) p.line(gx + q * CS, gy, gx + q * CS, gy + ROWS * CS, { lw: 0.5, gris: 0.6 });
      for (let r = 0; r <= ROWS; r++) p.line(gx, gy + r * CS, gx + 2 * hc * CS, gy + r * CS, { lw: 0.5, gris: 0.6 });
      p.rrect(gx, gy, 2 * hc * CS, ROWS * CS, 0, { lw: 1.6 });
      lineaDash(p, gx + hc * CS, gy - 6, gx + hc * CS, gy + ROWS * CS + 6, { lw: 1.6, dash: "4 3" });
    }));
  },
});
