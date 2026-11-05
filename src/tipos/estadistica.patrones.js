// estadistica.patrones · Los patrones (port de _e_patrones() del motor).
// datos:    { patron: "AAB", seq: ["c"|"s"|"q"|"t" × L] (la serie completa), vac: [posiciones en los cuadros grises, ordenadas], n }
//           n = nº de cuadros dibujados (el resto de seq no se ve). hueco → L = 10 y 3 cuadros grises repartidos; si no, L = 11 y 3 cuadros al final.
// solucion: { huecos: [], figuras: [seq[j] para j en vac] }   (el alumno dibuja; en modo solución se dibuja en rojo)
// Completa: 8 patrones; media: 4. Las figuras de cada letra son distintas dentro del patrón.
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, COLOR_SOLUCION } from "../render/papel.js";
import { figura } from "./estadistica.pictograma.js";

export const PATRONES = ["AB", "AAB", "ABB", "ABC", "AABB", "AB", "ABC", "AAB"];

export default registrar({
  id: "estadistica.patrones",
  version: 1,
  generar(params, azar, { tamano }) {
    const hueco = params.modo === "hueco", rows = 8;
    const pats = azar.barajar(PATRONES).slice(0, tamano === "media" ? Math.floor(rows / 2) : rows);
    const ejercicios = pats.map((pat) => {
      const letras = [...new Set(pat)].sort(), ks = azar.muestra([..."csqt"], letras.length);
      const mp = Object.fromEntries(letras.map((l, i) => [l, ks[i]]));
      const L = hueco ? 10 : 11, seq = Array.from({ length: L }, (_, j) => mp[pat[j % pat.length]]);
      const vis = 2 * pat.length + (pat.length <= 3 ? 1 : 0);
      const n = hueco ? L : Math.min(L, vis + 3);
      const vac = hueco
        ? azar.muestra(Array.from({ length: L - pat.length - 1 }, (_, i) => pat.length + 1 + i), 3).sort((a, b) => a - b)
        : Array.from({ length: n - vis }, (_, i) => vis + i);
      return { datos: { patron: pat, seq, vac, n }, solucion: { huecos: [], figuras: vac.map((j) => seq[j]) } };
    });
    return {
      enunciado: hueco ? "Dibuja las figuras que faltan en los cuadros grises." : "Descubre el patrón y dibuja las figuras que siguen.",
      ejercicios,
    };
  },
  dibujar(p, act) {
    const rows = 8, GY = 8, rh = (TOP - M - (rows - 1) * GY) / rows, bs = 40, g = 6;
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const { seq, vac, n } = e.datos, y = TOP - (i + 1) * rh - i * GY;
      p.marco(M, y, W - 2 * M, rh);
      const x0 = M + (W - 2 * M - (n * bs + (n - 1) * g)) / 2, by = y + (rh - bs) / 2;
      for (let j = 0; j < n; j++) {
        const x = x0 + j * (bs + g);
        if (vac.includes(j)) {
          p.caja(x, by, bs, bs, null);
          if (p.solucion) figura(p, seq[j], x + bs / 2, by + bs / 2, 11, { lw: 1.7, gris: COLOR_SOLUCION });
        } else {
          p.rrect(x, by, bs, bs, 7, { lw: 1.2, stroke: 0.75 });
          figura(p, seq[j], x + bs / 2, by + bs / 2, 11, { lw: 1.7 });
        }
      }
    }));
  },
});
