// geometria.perimetro · El perímetro (3.º, lote 7, bloque 9; solo curso 3, sin rango).
// Opción modo:
//   null · «Polígonos con la medida de cada lado»: datos { forma: "triangulo"|"rectangulo"|"cuadrado"|"trapecio"|"casa"|"ele", pts: [[x, y]…] (vértices en cm, y hacia arriba, en sentido antihorario,
//            dibujados a escala), lados: [cm de cada lado, en el orden de pts: lado k va de pts[k] a pts[k+1]] }; solucion { huecos: [perímetro] } (suma de los lados).
//   "cuadricula" · «En la cuadrícula»: cada lado de un cuadradito mide 1 cm; datos { forma: "cuadricula", celdas: [[c, r]…] (r hacia arriba), bw, bh (caja en cuadraditos) }; solucion { huecos: [perímetro] }
//            (lados de cuadradito que hay en el borde de la figura). La figura es una torre de columnas (rectángulo, L, T, U o escalera, girada o volteada a veces), sin huecos, de 7 × 5 como mucho.
// Triángulo: lados de 3 a 9 que cumplen la desigualdad triangular con holgura; rectángulo 3–9 × 2–7 (no cuadrado); cuadrado 2–8; trapecio isósceles; casa (rectángulo y tejado); ele (hexágono con ángulos rectos).
// Rejilla elástica de 2 columnas con «Cantidad»: «Más grandes» = 6 y 4; «Más ejercicios» = las filas que caben con tarjetas ≥ 160 pt (8 y 4).
import { registrar } from "../nucleo/tipos.js";
import { TOP, cuantosRejilla } from "../render/papel.js";
import { T, B } from "../render/papel.js";
import { poli, ciclo } from "./geometria.dibujo.js";

export const FORMAS_P = ["triangulo", "rectangulo", "cuadrado", "trapecio", "casa", "ele"];
const MIN_ALTO = 160;
const r3 = (v) => Math.round(v * 1000) / 1000;

/** Vértices (cm, antihorario) y lados de una forma al azar. */
export function forma(k, azar) {
  if (k === "triangulo") {
    for (;;) {
      const [a, b, c] = [azar.entero(3, 9), azar.entero(3, 9), azar.entero(3, 9)];
      if (c > Math.abs(a - b) + 1 && c < a + b - 1) {
        const cx = (c * c + b * b - a * a) / (2 * c), cy = Math.sqrt(b * b - cx * cx);
        return { pts: [[0, 0], [c, 0], [r3(cx), r3(cy)]], lados: [c, a, b] };
      }
    }
  }
  if (k === "rectangulo") {
    let w, h; do { w = azar.entero(3, 9); h = azar.entero(2, 7); } while (w === h);
    return { pts: [[0, 0], [w, 0], [w, h], [0, h]], lados: [w, h, w, h] };
  }
  if (k === "cuadrado") { const l = azar.entero(2, 8); return { pts: [[0, 0], [l, 0], [l, l], [0, l]], lados: [l, l, l, l] }; }
  if (k === "trapecio") {
    const Bs = azar.entero(6, 10), bs = Bs - 2 * azar.entero(1, Math.floor((Bs - 2) / 2)), d = (Bs - bs) / 2, l = azar.entero(d + 1, Math.max(d + 1, 6)), hh = Math.sqrt(l * l - d * d);
    return { pts: [[0, 0], [Bs, 0], [Bs - d, r3(hh)], [d, r3(hh)]], lados: [Bs, l, bs, l] };
  }
  if (k === "casa") {
    const w = azar.entero(4, 8), h = azar.entero(3, 6), r = azar.entero(Math.floor(w / 2) + 1, Math.floor(w / 2) + 3), hh = Math.sqrt(r * r - (w / 2) ** 2);
    return { pts: [[0, 0], [w, 0], [w, h], [w / 2, r3(h + hh)], [0, h]], lados: [w, h, r, r, h] };
  }
  const A = azar.entero(5, 9), Bh = azar.entero(4, 8), c = azar.entero(2, A - 2), d = azar.entero(2, Bh - 2);
  return { pts: [[0, 0], [A, 0], [A, Bh - d], [A - c, Bh - d], [A - c, Bh], [0, Bh]], lados: [A, Bh - d, c, d, A - c, Bh] };
}

/** Celdas (columnas de alturas dadas) → lados de cuadradito en el borde. */
export function perimetroCeldas(celdas) {
  const hay = new Set(celdas.map((q) => q + ""));
  let n = 0;
  for (const [c, r] of celdas) for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!hay.has(`${c + dc},${r + dr}`)) n++;
  return n;
}

/** Figura de cuadraditos: columnas de alturas (rectángulo, L, T, U o escalera), con giros y vuelcos al azar. */
export function figuraCeldas(azar) {
  for (;;) {
    const t = azar.elegir(["rect", "ele", "te", "u", "escalera"]);
    let alt;
    if (t === "rect") alt = Array(azar.entero(3, 6)).fill(azar.entero(2, 4));
    else if (t === "ele") alt = [azar.entero(3, 4), ...Array(azar.entero(2, 4)).fill(azar.entero(1, 2))];
    else if (t === "te") { const k = azar.entero(1, 2); alt = [...Array(k).fill(1), azar.entero(3, 4), ...Array(k).fill(1)]; }
    else if (t === "u") alt = [azar.entero(2, 3), ...Array(azar.entero(1, 3)).fill(1), azar.entero(2, 3)];
    else alt = Array.from({ length: azar.entero(3, 4) }, (_, i) => i + 1);
    let cel = alt.flatMap((h, c) => Array.from({ length: h }, (_, r) => [c, r]));
    if (azar.entero(0, 1)) cel = cel.map(([c, r]) => [r, c]);   // girada (columnas → filas)
    const mc = Math.max(...cel.map((q) => q[0])), mr = Math.max(...cel.map((q) => q[1]));
    if (azar.entero(0, 1)) cel = cel.map(([c, r]) => [mc - c, r]);
    if (azar.entero(0, 1)) cel = cel.map(([c, r]) => [c, mr - r]);
    const bw = mc + 1, bh = mr + 1;
    if (bw <= 7 && bh <= 5) return { celdas: cel.sort((p, q) => p[0] - q[0] || p[1] - q[1]), bw, bh };
  }
}

export default registrar({
  id: "geometria.perimetro",
  version: 1,
  cantidad: true,
  generar(params, azar, ctx) {
    const cuad = params.modo === "cuadricula", cnt = cuantosRejilla(ctx, 2, MIN_ALTO, [6, 4]), vistos = new Set(), ejercicios = [];
    const tipos = cuad ? ["f"] : ciclo(FORMAS_P, cnt, azar);
    for (let i = 0; i < cnt; i++) {
      if (cuad) {
        let f, clave, n = 0;
        do { f = figuraCeldas(azar); clave = JSON.stringify(f.celdas); } while (vistos.has(clave) && ++n < 200);
        vistos.add(clave);
        ejercicios.push({ datos: { forma: "cuadricula", ...f }, solucion: { huecos: [perimetroCeldas(f.celdas)] } });
      } else {
        const f = forma(tipos[i], azar);
        ejercicios.push({ datos: { forma: tipos[i], pts: f.pts, lados: f.lados }, solucion: { huecos: [f.lados.reduce((a, b) => a + b, 0)] } });
      }
    }
    return {
      enunciado: cuad ? "Cada lado de un cuadradito mide 1 cm.\nCuenta y escribe el perímetro de cada figura." : "Suma las medidas de los lados y escribe el perímetro de cada figura.",
      ejercicios,
    };
  },
  dibujar(p, act) {
    const cuad = act.params?.modo === "cuadricula";
    const { cel, cw, ch } = p.rejilla(TOP, 2, Math.ceil(act.ejercicios.length / 2));
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], d = e.datos, fs = 12;
      p.marco(x, y, cw, ch, i);
      p.linea(x, y + 6, cw, 40, [T("Perímetro =", 13, "PM"), B(58, 34, e.solucion.huecos[0]), T("cm", 13, "PM")], 8);
      if (cuad) {
        const gw = d.bw + 2, gh = d.bh + 2, s = Math.min((cw - 24) / gw, (ch - 78) / gh, 26), gx = x + (cw - gw * s) / 2, gy = y + 52 + (ch - 78 - gh * s) / 2;
        for (let c = 0; c <= gw; c++) p.line(gx + c * s, gy, gx + c * s, gy + gh * s, { lw: 0.6, gris: 0.72 });
        for (let r = 0; r <= gh; r++) p.line(gx, gy + r * s, gx + gw * s, gy + r * s, { lw: 0.6, gris: 0.72 });
        const hay = new Set(d.celdas.map((q) => q + ""));
        for (const [c, r] of d.celdas) p.rrect(gx + (c + 1) * s, gy + (r + 1) * s, s, s, 0, { lw: 0.6, fill: 0.86, stroke: 0.72 });
        for (const [c, r] of d.celdas) {
          const X = gx + (c + 1) * s, Y = gy + (r + 1) * s;
          if (!hay.has(`${c},${r - 1}`)) p.line(X, Y, X + s, Y, { lw: 2.4 });
          if (!hay.has(`${c},${r + 1}`)) p.line(X, Y + s, X + s, Y + s, { lw: 2.4 });
          if (!hay.has(`${c - 1},${r}`)) p.line(X, Y, X, Y + s, { lw: 2.4 });
          if (!hay.has(`${c + 1},${r}`)) p.line(X + s, Y, X + s, Y + s, { lw: 2.4 });
        }
        p.rrect(x + cw - 62, y + ch - 24, 9, 9, 0, { lw: 1 });
        p.text(x + cw - 49, y + ch - 24, "= 1 cm", 11, { f: "PM" });
        return;
      }
      const xs = d.pts.map((q) => q[0]), ys = d.pts.map((q) => q[1]), bw = Math.max(...xs), bh = Math.max(...ys);
      const aw = cw - 84, ah = ch - 54 - 40, s = Math.min(aw / bw, ah / bh, 22), ox = x + (cw - bw * s) / 2, oy = y + 52 + (ch - 54 - bh * s) / 2;
      const pts = d.pts.map(([a, b]) => [ox + a * s, oy + b * s]);
      poli(p, pts, { cerrar: true, lw: 2.2 });
      pts.forEach(([a, b], k) => {
        const [c, q] = pts[(k + 1) % pts.length], dx = c - a, dy = q - b, len = Math.hypot(dx, dy), nx = dy / len, ny = -dx / len, txt = `${d.lados[k]} cm`, tw = p.ancho(txt, "PM", fs);
        const off = 5 + Math.abs(nx) * tw / 2 + Math.abs(ny) * fs * 0.45, lx = (a + c) / 2 + nx * off, ly = (b + q) / 2 + ny * off;
        p.text(lx, ly - fs * 0.33, txt, fs, { f: "PM", anchor: "middle" });
      });
    }));
  },
});
