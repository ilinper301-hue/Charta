// medida.masa · ¿Cuánto pesa? (2.º, lote 3b): balanza con pesas de 1 kg y de ½ kg; ¿pesa más, menos o igual?
// datos:    { izq: [piezas de 1 kg, piezas de ½ kg], der: [piezas de 1 kg, piezas de ½ kg] }
// solucion: { huecos: ["<" | ">" | "="] } (compara el plato izquierdo con el derecho; 1 kg = 2 medios)
// Sin opciones. Cada plato lleva de 1 a 4 pesas (de 1 a 8 medios kilos). Un tercio de las balanzas, aproximadamente, está equilibrado (con pesas distintas).
// Completa: 8 balanzas (2 × 4); media: 4. La balanza se dibuja nivelada: la respuesta no se ve.
// Cantidad (rejilla elástica, 2 columnas): «Más grandes» = 8 y 4 (tarjetas que llenan el panel; las pesas crecen hasta ×1,3); «Más ejercicios» = las filas que caben con tarjetas ≥ 100 pt (12 y 6).
import { registrar } from "../nucleo/tipos.js";
import { TOP, cuantosRejilla } from "../render/papel.js";

const MIN_ALTO = 100;   // alto mínimo de tarjeta con «Más ejercicios» (cuatro pesas apiladas y la casilla)

const medios = ([k, m]) => 2 * k + m;
const plato = (azar) => { for (;;) { const k = azar.entero(0, 3), m = azar.entero(0, 3); if (k + m >= 1 && k + m <= 4) return [k, m]; } };

export default registrar({
  id: "medida.masa",
  version: 3,
  cantidad: true,
  generar(params, azar, ctx) {
    const cnt = cuantosRejilla(ctx, 2, MIN_ALTO, [8, 4]), vistos = new Set(), ejercicios = [];
    for (let i = 0; i < cnt; i++) {
      const igual = i % 3 === 2;
      let izq, der, ok = false;
      for (let k = 0; k < 20000 && !ok; k++) {
        izq = plato(azar); der = plato(azar);
        const a = medios(izq), b = medios(der);
        ok = (igual ? a === b && izq[0] !== der[0] : a !== b) && !vistos.has(izq + "|" + der) && !vistos.has(der + "|" + izq);
      }
      if (!ok) throw new Error("No hay balanzas distintas suficientes.");
      vistos.add(izq + "|" + der);
      const a = medios(izq), b = medios(der);
      ejercicios.push({ datos: { izq, der }, solucion: { huecos: [a < b ? "<" : a > b ? ">" : "="] } });
    }
    return { enunciado: "Compara lo que pesan los dos platos y escribe <, > o =.\n1 kg pesa lo mismo que dos pesas de ½ kg.", ejercicios };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.rejilla(TOP, 2, Math.ceil(act.ejercicios.length / 2)), esc = Math.max(1, Math.min(1.3, ch / 140));   // las pesas crecen con la tarjeta
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { izq, der } = e.datos;
      p.marco(x, y, cw, ch, i);
      const base = y + ch * 0.36, mx = x + cw / 2, pw = Math.min(88, cw * 0.34), cx = [x + cw * 0.25, x + cw * 0.75];
      // brazo nivelado, plato y pie
      p.path([["M", cx[0] - pw / 2, base], ["L", cx[1] + pw / 2, base]], { lw: 2 });
      p.path([["M", mx - 14, y + 12], ["L", mx, base], ["L", mx + 14, y + 12], ["Z"]], { lw: 1.6 });
      p.path([["M", mx - 22, y + 12], ["L", mx + 22, y + 12]], { lw: 2 });
      [izq, der].forEach(([k, m], s) => {
        let yy = base + 1.5;
        for (let j = 0; j < k + m; j++) {   // primero las de 1 kg (abajo) y encima las de ½ kg
          const grande = j < k, w = (grande ? 40 : 30) * esc, h = (grande ? 14 : 11) * esc;
          p.rrect(cx[s] - w / 2, yy, w, h, 2, { lw: 1.3 });
          const fs = Math.max(11, (grande ? 9 : 8) * esc);   // ≥ 9 pt impresos
          p.text(cx[s], yy + h / 2 - 0.35 * fs, grande ? "1 kg" : "½ kg", fs, { f: "PB", anchor: "middle" });
          yy += h + 1;
        }
      });
      p.caja(mx - 17, y + ch - 17 - 34, 34, 34, null, 22, e.solucion.huecos[0]);
    }));
  },
});
