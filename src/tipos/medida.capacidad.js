// medida.capacidad · ¿Cuánto líquido hay? (port de _m_capacidad() del motor).
// datos:    { niv: [a, b, c] (tres niveles distintos de 1–5), asc (true: de menos a más) }
// solucion: { huecos: [puesto de cada vaso (1–3) según el orden pedido] }
// Sin opciones. Alterna «de menos a más» / «de más a menos» (empieza por menos a más). Completa: 8 tarjetas (2 × 4); media: 4.
// Cantidad (rejilla elástica, 2 columnas): «Más grandes» = 8 y 4 (tarjetas que llenan el panel; el vaso crece de 66 a 86 pt); «Más ejercicios» = las filas que caben con tarjetas ≥ 132 pt (10 y 4).
import { registrar } from "../nucleo/tipos.js";
import { TOP, cuantosRejilla } from "../render/papel.js";

const MIN_ALTO = 132;   // alto mínimo de tarjeta con «Más ejercicios» (casilla de 34, vaso de 52 y etiqueta)

export default registrar({
  id: "medida.capacidad",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const ejercicios = [];
    for (let i = 0, cnt = cuantosRejilla(ctx, 2, MIN_ALTO, [8, 4]); i < cnt; i++) {
      const niv = azar.muestra([1, 2, 3, 4, 5], 3), asc = i % 2 === 0;
      const orden = [...niv].sort((a, b) => (asc ? a - b : b - a));
      ejercicios.push({ datos: { niv, asc }, solucion: { huecos: niv.map((v) => orden.indexOf(v) + 1) } });
    }
    return { enunciado: "Ordena los vasos según el líquido que tienen, como dice cada casilla.", ejercicios };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.rejilla(TOP, 2, Math.ceil(act.ejercicios.length / 2));
    const gh = Math.max(52, Math.min(86, ch - 82)), s = gh / 66;   // el vaso crece con la tarjeta (hasta ×1,3)
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { niv, asc } = e.datos;
      p.marco(x, y, cw, ch, i);
      p.text(x + 34, y + ch - 20, asc ? "DE MENOS A MÁS" : "DE MÁS A MENOS", 9.5, { f: "PM", gris: 0.3 });
      const gw = 40 * s, g = 30 * s, gx0 = x + (cw - (3 * gw + 2 * g)) / 2;
      niv.forEach((lv, j) => {
        const gx = gx0 + j * (gw + g), gy = y + 56;
        p.rrect(gx + 0.8, gy + 0.8, gw - 1.6, gh * 0.18 * lv, 0, { fill: 0.72, stroke: null });
        p.path([["M", gx, gy + gh], ["L", gx, gy], ["L", gx + gw, gy], ["L", gx + gw, gy + gh]], { lw: 1.9 });
        p.caja(gx + gw / 2 - 20, y + 14, 40, 34, null, 22, e.solucion.huecos[j]);
      });
    }));
  },
});
