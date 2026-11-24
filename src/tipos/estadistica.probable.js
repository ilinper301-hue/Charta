// estadistica.probable · ¿Seguro, posible o imposible? (3.º, lote 7, bloque 11; solo curso 3, sin rango).
// datos:    { aparato: "bolsa"|"ruleta", fills: [relleno de cada bola o sector: "blanca"|"negra"|"gris"], obj: [1 o 2 rellenos del suceso], opciones: ["seguro", "posible", "imposible"] }
//           bolsa: 4 a 8 bolas (dos filas); ruleta: 4, 6 u 8 sectores iguales, el primero a la derecha de la flecha y siguiendo las agujas del reloj.
//           El suceso se escribe con suceso(): «Sacar una bola negra» · «Sacar una bola blanca o negra» · «Que la flecha pare en la zona gris».
// solucion: { huecos: [], correcta: "seguro" (todas las bolas o sectores son del suceso) | "imposible" (ninguna) | "posible" (algunas) }   (se rodea; en la solución, en rojo)
// Se imprime en blanco y negro: los rellenos son blanco (blanca), negro (negra) y gris medio (gris) y el suceso siempre los nombra; nunca se distinguen solo por color.
// Las tres respuestas salen repartidas (ciclo) y la bolsa y la ruleta se alternan. Rejilla elástica de 2 columnas con «Cantidad»: «Más grandes» = 8 y 4; «Más ejercicios» = las filas que caben con tarjetas ≥ 130 pt.
import { registrar } from "../nucleo/tipos.js";
import { TOP, INK, cuantosRejilla } from "../render/papel.js";
import { ciclo, chips } from "./geometria.dibujo.js";

export const RELLENOS = ["blanca", "negra", "gris"];
export const RESPUESTAS = ["seguro", "posible", "imposible"];
const GRIS = { blanca: 1, negra: INK, gris: 0.62 }, MIN_ALTO = 130;

/** Texto del suceso. */
export function suceso(aparato, obj) {
  const c = obj.join(" o ");
  return aparato === "bolsa" ? `Sacar una bola ${c}` : `Que la flecha pare en la zona ${c}`;
}
/** La respuesta que dicen las bolas o sectores. */
export function respuesta(fills, obj) {
  const n = fills.filter((f) => obj.includes(f)).length;
  return n === fills.length ? "seguro" : n === 0 ? "imposible" : "posible";
}

function componer(resp, obj, n, azar) {
  const dentro = obj, fuera = RELLENOS.filter((c) => !obj.includes(c));
  for (let t = 0; t < 200; t++) {
    let f;
    if (resp === "seguro") f = [...dentro, ...Array.from({ length: n - dentro.length }, () => azar.elegir(dentro))];   // con dos rellenos, salen los dos
    else if (resp === "imposible") f = Array.from({ length: n }, () => azar.elegir(fuera));
    else f = [azar.elegir(dentro), azar.elegir(fuera), ...Array.from({ length: n - 2 }, () => azar.elegir(RELLENOS))];
    f = azar.barajar(f);
    if (respuesta(f, obj) === resp) return f;
  }
  throw new Error("No se pudo componer el suceso.");
}

export default registrar({
  id: "estadistica.probable",
  version: 1,
  cantidad: true,
  generar(params, azar, ctx) {
    const cnt = cuantosRejilla(ctx, 2, MIN_ALTO, [8, 4]), aparatos = ciclo(["bolsa", "ruleta"], cnt, azar);
    return {
      enunciado: "Rodea si cada suceso es seguro, posible o imposible.\nLas bolas se sacan de la bolsa sin mirar.",
      ejercicios: ciclo(RESPUESTAS, cnt, azar).map((resp, i) => {
        const aparato = aparatos[i], dos = resp === "seguro" ? azar.entero(1, 10) <= 7 : azar.entero(1, 3) === 3, obj = azar.barajar(RELLENOS).slice(0, dos ? 2 : 1).sort((a, b) => RELLENOS.indexOf(a) - RELLENOS.indexOf(b));
        const n = aparato === "bolsa" ? azar.entero(4, 8) : azar.elegir([4, 6, 8]);
        return { datos: { aparato, fills: componer(resp, obj, n, azar), obj, opciones: RESPUESTAS }, solucion: { huecos: [], correcta: resp } };
      }),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.rejilla(TOP, 2, Math.ceil(act.ejercicios.length / 2));
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { aparato, fills, obj, opciones } = e.datos, cx = x + cw / 2;
      p.marco(x, y, cw, ch, i);
      chips(p, cx, y + 10, opciones, 11, e.solucion.correcta);
      const txt = suceso(aparato, obj);
      let fs = 11.5; while (p.ancho(txt, "PM", fs) > cw - 24 && fs > 9.5) fs -= 0.5;
      p.text(cx, y + 44, txt, fs, { f: "PB", anchor: "middle" });
      const y0 = y + 62, hd = ch - 62 - 10, cy = y0 + hd / 2;
      if (aparato === "bolsa") {
        const cols = Math.ceil(fills.length / 2), r = Math.min(10, (hd - 30) / 4.6), gap = 4, wb = cols * 2 * r + (cols + 1) * gap + 8, hb = 4 * r + 3 * gap + 8, yt = cy + (hb + 10) / 2 - 10;
        p.rrect(cx - wb / 2, yt - hb, wb, hb, 16, { lw: 1.8, fill: 1 });
        p.path([["M", cx - wb * 0.14, yt - 1], ["L", cx - wb * 0.28, yt + 13]], { lw: 1.8 });
        p.path([["M", cx + wb * 0.14, yt - 1], ["L", cx + wb * 0.28, yt + 13]], { lw: 1.8 });
        p.line(cx - wb * 0.15, yt - 1, cx + wb * 0.15, yt - 1, { lw: 3.2 });
        fills.forEach((f, k) => {
          const fila = k % 2, col = Math.floor(k / 2), enFila = fila === 0 ? cols : fills.length - cols;
          const bx = cx - (enFila * 2 * r + (enFila - 1) * gap) / 2 + r + col * (2 * r + gap), by = yt - 4 - gap - r - fila * (2 * r + gap);
          p.circle(bx, by, r, { lw: 1.4, fill: GRIS[f] });
        });
      } else {
        const rr = Math.min(34, hd / 2 - 6), n = fills.length, st = 2 * Math.PI / n;
        fills.forEach((f, k) => {
          const a0 = Math.PI / 2 - k * st, pts = Array.from({ length: 13 }, (_, j) => [cx + rr * Math.cos(a0 - st * j / 12), cy + rr * Math.sin(a0 - st * j / 12)]);
          p.path([["M", cx, cy], ...pts.map((q) => ["L", ...q]), ["Z"]], { lw: 0.3, fill: GRIS[f], stroke: GRIS[f] });
        });
        for (let k = 0; k < n; k++) {   // radios: una banda blanca con una raya negra, para que se vean también entre sectores negros
          const a = Math.PI / 2 - k * st;
          p.line(cx, cy, cx + rr * Math.cos(a), cy + rr * Math.sin(a), { lw: 3, gris: 1 });
          p.line(cx, cy, cx + rr * Math.cos(a), cy + rr * Math.sin(a), { lw: 1.2 });
        }
        p.circle(cx, cy, rr, { lw: 1.8 });
        p.path([["M", cx, cy + rr - 2], ["L", cx - 6, cy + rr + 9], ["L", cx + 6, cy + rr + 9], ["Z"]], { lw: 1, fill: INK, stroke: INK });
      }
    }));
  },
});
