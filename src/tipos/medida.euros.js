// medida.euros · Paga con el menor número de billetes y monedas (2.º, lote 3b).
// datos:    { total, den: [valores de mayor a menor] }
// solucion: { huecos: [cuántas piezas de cada valor de `den`, con el algoritmo voraz (mínimo con 1, 2, 5, 10, 20, 50, 100)] }
// rango (100–500): tope del pago (100: de 11 a 99 € con billetes hasta 50; desde 200: hasta el rango, con billetes de 100). Sin opciones.
// Completa: 6 pagos (una fila cada uno); media: 3. Totales distintos, de 3 piezas o más y con 2 valores distintos como mínimo.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";

export const valores = (R) => (R > 100 ? [100, 50, 20, 10, 5, 2, 1] : [50, 20, 10, 5, 2, 1]);
export const voraz = (total, den) => { let r = total; return den.map((v) => { const n = Math.floor(r / v); r -= n * v; return n; }); };

export default registrar({
  id: "medida.euros",
  version: 2,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 200, den = valores(R), tope = R > 100 ? R : 99, cnt = tamano === "media" ? 3 : 6;
    const vistos = new Set(), ejercicios = [];
    for (let i = 0; i < cnt; i++) {
      let total, n, ok = false;
      for (let k = 0; k < 20000 && !ok; k++) {
        total = azar.entero(11, tope); n = voraz(total, den);
        ok = !vistos.has(total) && n.reduce((s, v) => s + v, 0) >= 3 && n.filter((v) => v > 0).length >= 2;
      }
      if (!ok) throw new Error("No hay pagos distintos suficientes con este rango.");
      vistos.add(total);
      ejercicios.push({ datos: { total, den }, solucion: { huecos: n } });
    }
    return { enunciado: "Paga con el menor número de billetes y monedas.\nEscribe cuántos de cada uno necesitas.", ejercicios };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 1, 6);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { total, den } = e.datos;
      p.marco(x, y, cw, ch, i);
      p.text(x + 38, y + ch - 24, `Paga ${total} €`, 15, { f: "PB" });
      const n = den.length, ancho = (cw - 90) / n;
      den.forEach((v, j) => {
        const cx = x + 66 + ancho * (j + 0.5), cy = y + ch * 0.6;
        if (v <= 2) { p.circle(cx, cy, v === 2 ? 14 : 12.5, { lw: 1.5 }); p.text(cx, cy - 3.5, `${v} €`, 11, { f: "PB", anchor: "middle" }); }
        else { p.rrect(cx - 21, cy - 11, 42, 22, 3, { lw: 1.5 }); p.text(cx, cy - 3.5, `${v} €`, 11.5, { f: "PB", anchor: "middle" }); }
        p.caja(cx - 19, y + 8, 38, 32, null, 18, e.solucion.huecos[j]);
      });
    }));
  },
});
