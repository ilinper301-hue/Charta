// orden.entre · Un número entre dos (port de _o_entre() del motor).
// datos:    { a, b }   (|a − b| = d con 2 ≤ d ≤ max(4, R/5); a y b en 1..R; se muestran en este orden)
// solucion: { huecos: [m], entre: [min + 1, max − 1] }   (vale cualquier número del intervalo `entre`; m es el central, para mostrar)
// Completa: 15 parejas (5 filas × 3); media: 6. Sin repetir (a menor, d).
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";

export default registrar({
  id: "orden.entre",
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 10, cnt = tamano === "media" ? 6 : 15, dmax = Math.max(4, Math.floor(R / 5));
    const vistos = new Set(), ejercicios = [];
    for (let i = 0; i < cnt; i++) {
      let a, d;
      for (let k = 0; k < 500; k++) {
        d = azar.entero(2, dmax); a = azar.entero(1, R - d);
        if (!vistos.has(a + "," + d)) break;
      }
      vistos.add(a + "," + d);
      const p = azar.real() < 0.5 ? [a, a + d] : [a + d, a], lo = Math.min(...p), hi = Math.max(...p);
      ejercicios.push({ datos: { a: p[0], b: p[1] }, solucion: { huecos: [Math.floor((lo + hi) / 2)], entre: [lo + 1, hi - 1] } });
    }
    return { enunciado: "Escribe un número que esté entre los dos.", ejercicios };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 3, 5);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { a, b } = e.datos;
      p.marco(x, y, cw, ch, i);
      const g = 8, bx = x + (cw - 132 - 2 * g) / 2, by = y + (ch - 46 - 10) / 2;
      p.caja(bx, by, 46, 46, a, 22);
      p.caja(bx + 46 + g, by, 40, 46, null, 22, e.solucion.huecos[0]);
      p.caja(bx + 86 + 2 * g, by, 46, 46, b, 22);
    }));
  },
});
