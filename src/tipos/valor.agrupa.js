// valor.agrupa · Agrupa en decenas (port de _v_agrupa() del motor).
// datos:    { n, forma: "c" | "s" | "q" | "t", jit: [[jx, jy]…] }   (n dibujos en filas de 10; jit = desvío de cada dibujo, en pt, −1.5..1.5)
// solucion: { huecos: [decenas, unidades] }   (rodear los grupos de 10 no tiene hueco)
// Rango mínimo 20 (error «necesita» si no). Números: 10..min(R, 49); 1 decena completa + el resto con unidades (11..).
// Completa: 6 casillas (3 filas × 2); media: 2 (1 decena completa y 1 con unidades).
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { forma } from "./orden.cantidad.js";

export default registrar({
  id: "valor.agrupa",
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 20, cap = Math.min(R, 49), cnt = tamano === "media" ? 2 : 6;
    if (cap < 20) throw new Error("Agrupa en decenas necesita un rango máximo de al menos 20.");
    const mult = [], rest = [];
    for (let v = 10; v <= cap; v++) (v % 10 ? rest : mult).push(v);
    // rest incluye 11..cap sin múltiplos de 10
    const nums = azar.barajar([azar.elegir(mult), ...azar.muestra(rest, cnt - 1)]);
    const r2 = (v) => Math.round(v * 100) / 100 + 0;   // + 0: sin −0 (no sobrevive a JSON)
    return {
      enunciado: "Rodea grupos de 10 y escribe cuántas decenas y unidades hay.",
      ejercicios: nums.map((n, i) => ({
        datos: { n, forma: "csqt"[i % 4], jit: Array.from({ length: n }, () => [r2(azar.real() * 3 - 1.5), r2(azar.real() * 3 - 1.5)]) },
        solucion: { huecos: [Math.floor(n / 10), n % 10] },
      })),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 2, 3);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { n, forma: kind, jit } = e.datos;
      p.marco(x, y, cw, ch, i);
      const ax = x + 16, aw = cw - 32, rows = Math.ceil(n / 10);
      const sx = aw / 10, sy = Math.min(26, (ch - 92) / rows), r = Math.min(7, sx * 0.3);
      const ytop = y + ch - 38 - sy / 2 - ((ch - 92) - rows * sy) / 2;
      for (let k = 0; k < n; k++) {
        const rr = Math.floor(k / 10), cc = k % 10;
        forma(p, kind, ax + sx / 2 + cc * sx + jit[k][0], ytop - rr * sy + jit[k][1], r);
      }
      const x0 = x + (cw - 202) / 2;
      ["decenas", "unidades"].forEach((lab, j) => {
        const bx = x0 + j * 110;
        p.caja(bx, y + 12, 40, 34, null, 22, e.solucion.huecos[j]);
        p.text(bx + 46, y + 25, lab, 11, { f: "PM" });
      });
    }));
  },
});
