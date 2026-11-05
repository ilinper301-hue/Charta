// juegos.colorea · Colorea y descubre (port de _j_colorea() y _op_valor() del motor). Solo página completa.
// datos:    { forma: "corazon"|"casa"|"arbol"|"diamante", resta, tgt, celdas: [{ a, b, r, x }…] }
//           celdas = filas × 6 casillas, por filas; r = a ± b (a + b o a − b); x = true si la casilla pertenece al dibujo (r = tgt);
//           ninguna otra casilla da tgt.
// solucion: { huecos: [], colorear: [índices de las casillas con x] }   (el alumno colorea; en modo solución se rellenan)
// Opciones: modo (sumas / restas), nivel (llevadas; solo con rango > 20) y n = dibujo (1 corazón, 2 casa, 3 árbol, 4 diamante; null al azar).
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, MENOS } from "../render/papel.js";

export const SHAPES = {
  corazon: [".XX.XX", "XXXXXX", "XXXXXX", ".XXXX.", "..XX.."],
  casa: ["..XX..", ".XXXX.", "XXXXXX", "XXXXXX", "XX..XX", "XX..XX"],
  arbol: ["..XX..", ".XXXX.", "XXXXXX", ".XXXX.", "..XX..", "..XX.."],
  diamante: ["..XX..", ".XXXX.", "XXXXXX", "XXXXXX", ".XXXX.", "..XX.."],
};
const rango = (a, b) => { const o = []; for (let i = a; i < b; i++) o.push(i); return o; };

/** _op_valor(): una suma o resta de resultado v (con o sin llevada según el nivel, a partir de rango > 20). */
function opValor(v, cap, resta, R, nivel, azar) {
  let a, b;
  for (let k = 0; k < 400; k++) {
    let ll;
    if (!resta) { a = azar.entero(1, v - 1); b = v - a; ll = (a % 10) + (b % 10) >= 10; }
    else { b = azar.entero(1, cap - v); a = v + b; ll = a % 10 < b % 10; }
    if (R <= 20 || nivel === "mezcla" || ll === (nivel === "con")) break;
  }
  return [a, b];
}

export default registrar({
  id: "juegos.colorea",
  version: 1,
  generar(params, azar) {
    const R = params.rango ?? 10, resta = params.modo === "resta", cap = Math.min(R, 99), nivel = params.nivel;
    const forma = params.n ? Object.keys(SHAPES)[(params.n - 1) % 4] : azar.elegir(Object.keys(SHAPES)), mapa = SHAPES[forma];
    let tgt = resta ? azar.entero(2, Math.max(3, Math.floor(cap / 2))) : azar.entero(Math.max(6, Math.floor(cap / 3)), cap);
    if (resta) tgt = Math.min(tgt, cap - 1);
    const valid = rango(2, cap + (resta ? 0 : 1)).filter((v) => v !== tgt);
    const cerca = valid.filter((v) => Math.abs(v - tgt) <= 3), cercanos = cerca.length ? cerca : valid;
    const celdas = [];
    for (const fila of mapa) for (const ch of fila) {
      const x = ch === "X";
      let v = x ? tgt : azar.real() < 0.6 ? azar.elegir(cercanos) : azar.elegir(valid);
      if (resta && v >= cap) v = cap - 1;
      const [a, b] = opValor(v, cap, resta, R, nivel, azar);
      celdas.push({ a, b, r: v, x });
    }
    return {
      enunciado: "Resuelve las operaciones y colorea las casillas del resultado indicado.",
      ejercicios: [{ datos: { forma, resta, tgt, celdas }, solucion: { huecos: [], colorear: celdas.flatMap((c, i) => (c.x ? [i] : [])) } }],
    };
  },
  dibujar(p, act) {
    const e = act.ejercicios[0], { resta, tgt, celdas } = e.datos, top = TOP;
    p.ejercicio(e.id, () => {
      const rows = celdas.length / 6, g = 6, cw = (W - 2 * M - 5 * g) / 6, chh = Math.min(84, (top - M - 70 - (rows - 1) * g) / rows);
      p.text(W / 2, top - 26, `Colorea las casillas que dan ${tgt}`, 18, { f: "PB", anchor: "middle" });
      const gy = top - 56;
      celdas.forEach((c, i) => {
        const r = Math.floor(i / 6), q = i % 6, x = M + q * (cw + g), y = gy - (r + 1) * chh - r * g;
        p.tarjeta(x, y, cw, chh);
        if (p.solucion && c.x) p.rrect(x, y, cw, chh, 9, { lw: 0.8, fill: "#F2B8B5", stroke: 0.8 });
        const txt = `${c.a} ${resta ? MENOS : "+"} ${c.b}`;
        let fs = 20; while (p.ancho(txt, "PB", fs) > cw - 12) fs -= 0.5;
        p.text(x + cw / 2, y + chh / 2 - fs * 0.33, txt, fs, { f: "PB", anchor: "middle" });
      });
    });
  },
});
