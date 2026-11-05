// valor.pares · Pares e impares (port de _v_pares() del motor).
// Modo null («rodear»):  datos { n }  → solucion { huecos: [], rodea: "par" | "impar" }   (n = 1..min(R, 20); se cuentan los puntos y se rodea)
//   Completa: 12 casillas (3 filas × 4), 6 pares y 6 impares barajados; media: 6.
// Modo "clasifica" (solo completa): UN ejercicio  datos { numeros: [..], pares: k, impares: k' }  (k, k' = min(6, nº de pares/impares ≤ R))
//   solucion { huecos: [pares ordenados…, impares ordenados…] }   (primero los cuadros de la columna PARES, de arriba abajo; luego los de IMPARES)
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, INK } from "../render/papel.js";
import { muestra } from "./valor.canje.js";

const orden = (l) => l.slice().sort((a, b) => a - b);

export default registrar({
  id: "valor.pares",
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 10;
    if (params.modo === "clasifica") {
      if (tamano === "media") throw new Error("Clasificar pares e impares solo en página completa.");
      const ev = [], od = [];
      for (let v = 1; v <= R; v++) (v % 2 ? od : ev).push(v);
      const E = azar.muestra(ev, Math.min(6, ev.length)), O = azar.muestra(od, Math.min(6, od.length));
      return {
        enunciado: "Escribe cada número en su columna: pares o impares.",
        ejercicios: [{ datos: { numeros: azar.barajar([...E, ...O]), pares: E.length, impares: O.length }, solucion: { huecos: [...orden(E), ...orden(O)] } }],
      };
    }
    const cap = Math.min(R, 20), cnt = tamano === "media" ? 6 : 12, ev = [], od = [];
    for (let v = 1; v <= cap; v++) (v % 2 ? od : ev).push(v);
    const nums = azar.barajar([...muestra(ev, cnt / 2, azar), ...muestra(od, cnt / 2, azar)]);
    return {
      enunciado: "Cuenta los puntos de cada casilla y rodea si el número es par o impar.",
      ejercicios: nums.map((n) => ({ datos: { n }, solucion: { huecos: [], rodea: n % 2 ? "impar" : "par" } })),
    };
  },
  dibujar(p, act) {
    if (act.ejercicios[0]?.datos.numeros) return clasifica(p, act);
    const { cel, cw, ch } = p.celdas(TOP, 3, 4);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { n } = e.datos;
      p.marco(x, y, cw, ch, i);
      const cols = Math.ceil(n / 2), pitch = Math.min(22, (cw - 36) / cols), r = Math.min(6, pitch * 0.32);
      const x0 = x + cw / 2 - (cols - 1) * pitch / 2, yc = y + ch * 0.60;
      for (let k = 0; k < n; k++) p.circle(x0 + Math.floor(k / 2) * pitch, yc + pitch / 2 - (k % 2) * pitch, r, { fill: INK, stroke: null });
      ["PAR", "IMPAR"].forEach((lab, j) => {
        const bx = x + cw / 2 + (j - 1) * 70 + 3;
        p.rrect(bx, y + 14, 64, 30, 8);
        p.text(bx + 32, y + 25, lab, 11, { f: "PB", anchor: "middle" });
      });
    }));
  },
});

function clasifica(p, act) {
  const e = act.ejercicios[0], { numeros, pares, impares } = e.datos, sol = e.solucion.huecos;
  p.ejercicio(e.id, () => {
    const bw = 56, bh = 46, g = 12, ph = 132;
    p.marco(M, TOP - ph, W - 2 * M, ph);
    numeros.forEach((v, j) => {
      const r_ = Math.floor(j / 6), k = j % 6, m = Math.min(6, numeros.length - 6 * r_);
      const bx = M + (W - 2 * M - (m * bw + (m - 1) * g)) / 2;
      p.caja(bx + k * (bw + g), TOP - 14 - bh - r_ * (bh + 10), bw, bh, v, 20);
    });
    const t2 = TOP - ph - 12, pw = (W - 2 * M - 12) / 2;
    [["PARES", pares, 0], ["IMPARES", impares, pares]].forEach(([tit, cnt, off], j) => {
      const px = M + j * (pw + 12);
      p.marco(px, M, pw, t2 - M);
      p.text(px + pw / 2, t2 - 30, tit, 15, { f: "PB", anchor: "middle" });
      for (let k = 0; k < cnt; k++) p.caja(px + (pw - 120) / 2, t2 - 50 - 60 - k * 74, 120, 60, null, 22, sol[off + k]);
    });
  });
}
