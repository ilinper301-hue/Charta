// orden.entre · Un número entre dos (port de _o_entre() del motor).
// datos:    { a, b }   (|a − b| = d con 2 ≤ d ≤ max(4, R/5); a y b en 1..R; se muestran en este orden)
// solucion: { huecos: [m], entre: [min + 1, max − 1] }   (vale cualquier número del intervalo `entre`; m es el central, para mostrar)
// Cantidad (opción de la ficha): «Más grandes» = 15 parejas en completa y 6 en media; «Más ejercicios» = las filas de 3 que caben con tarjetas ≥ 86 pt (21 y 9). Rejilla elástica (p.rejilla). Sin repetir (a menor, d).
import { registrar } from "../nucleo/tipos.js";
import { TOP, cuantosRejilla } from "../render/papel.js";

const MIN_ALTO = 86;   // alto mínimo de tarjeta con «Más ejercicios»

export default registrar({
  id: "orden.entre",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const R = params.rango ?? 10, cnt = cuantosRejilla(ctx, 3, MIN_ALTO, [15, 6]), dmax = Math.max(4, Math.floor(R / 5));
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
    const { cel, cw, ch } = p.rejilla(TOP, 3, Math.ceil(act.ejercicios.length / 3));
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { a, b } = e.datos;
      p.marco(x, y, cw, ch, i);
      const cuatro = Math.max(a, b) > 999, w0 = cuatro ? 50 : 46, wh0 = cuatro ? 56 : 40, g0 = cuatro ? 6 : 8;   // 3.º: el hueco admite cuatro cifras
      const k = Math.max(1, Math.min(1.4, (ch - 26) * 0.5 / 46, (cw - 8) / (2 * w0 + wh0 + 2 * g0))), w = w0 * k, wh = wh0 * k, g = g0 * k, bh = 46 * k, fs = 22 * k;   // las cajas crecen con la tarjeta
      const bx = x + (cw - 2 * w - wh - 2 * g) / 2, by = y + (ch - 26 - bh) / 2;
      p.caja(bx, by, w, bh, a, fs);
      p.caja(bx + w + g, by, wh, bh, null, fs, e.solucion.huecos[0]);
      p.caja(bx + w + wh + 2 * g, by, w, bh, b, fs);
    }));
  },
});
