// sumar.dibujos · Suma con dibujos (port de _s_dibujos() y _dispersa() del motor).
// datos:    { a, b, kind, ga, gb }   (kind: "c" círculo, "s" estrella, "q" cuadrado, "t" triángulo, según el nº del ejercicio;
//                                     ga/gb: posiciones de los a y b dibujos, [fila, columna, jx, jy] con jx, jy en [−1, 1])
// solucion: { huecos: [a + b] }       (cuadro «Total =»)
// Rango 10 o 20: total t entre 3 y rango, a entre 1 y t − 1. Completa: 8 (4 filas × 2); media: 4.
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, T, B } from "../render/papel.js";

const GX = 10, GY = 10;
/** Medidas de cada zona de dibujos (celdas de 2 × 4 de _celdas()). */
export function zonaDibujos() {
  const cw = (W - 2 * M - GX) / 2, ch = (TOP - M - 3 * GY) / 4;
  return { cw, ch, aw: (cw - 60) / 2, ah: ch - 80 };
}

/** _dispersa(): n posiciones [fila, columna, jx, jy] en un área aw × ah (el azar ya decidido). */
export function dispersa(n, aw, ah, azar) {
  const cols = Math.max(1, Math.ceil(Math.sqrt(n * aw / ah))), rows = Math.ceil(n / cols), slots = [];
  for (let i = 0; i < cols * rows; i++) slots.push([Math.floor(i / cols), i % cols]);
  const j = () => azar.entero(-1000, 1000) / 1000;
  return azar.barajar(slots).slice(0, n).map(([r, c]) => [r, c, j(), j()]);
}

/** Dibuja las posiciones de dispersa() con la figura `kind` en el área (ax, ay, aw, ah). */
export function pintarDispersa(p, ax, ay, aw, ah, n, kind, g) {
  const cols = Math.max(1, Math.ceil(Math.sqrt(n * aw / ah))), rows = Math.ceil(n / cols);
  const sp = Math.min(aw / cols, ah / rows), r = Math.min(11, sp * 0.3), jit = sp * 0.1;
  for (const [ri, ci, jx, jy] of g) {
    const x = ax + aw / 2 + (ci - (cols - 1) / 2) * sp + jx * jit, y = ay + ah / 2 + ((rows - 1) / 2 - ri) * sp + jy * jit;
    figura(p, kind, x, y, r);
  }
}

function figura(p, kind, x, y, r) {
  const o = { lw: 1.5 };
  if (kind === "c") p.circle(x, y, r, o);
  else if (kind === "q") p.rrect(x - r * 0.9, y - r * 0.9, r * 1.8, r * 1.8, 0, o);
  else if (kind === "s") {
    const R = r * 1.2, cmds = [];
    for (let j = 0; j < 10; j++) {
      const ang = Math.PI / 2 + j * Math.PI / 5, rr = j % 2 === 0 ? R : R * 0.42;
      cmds.push([j ? "L" : "M", x + rr * Math.cos(ang), y + rr * Math.sin(ang)]);
    }
    p.path([...cmds, ["Z"]], o);
  } else p.path([["M", x, y + r * 1.05], ["L", x - r * 1.05, y - r * 0.8], ["L", x + r * 1.05, y - r * 0.8], ["Z"]], o);
}

export default registrar({
  id: "sumar.dibujos",
  version: 1,
  generar(params, azar, { tamano }) {
    const cap = (params.rango ?? 10) <= 10 ? 10 : 20, { aw, ah } = zonaDibujos(), ejercicios = [];
    for (let i = 0; i < (tamano === "media" ? 4 : 8); i++) {
      const t = azar.entero(3, cap), a = azar.entero(1, t - 1), b = t - a, kind = "csqt"[i % 4];
      ejercicios.push({ datos: { a, b, kind, ga: dispersa(a, aw, ah, azar), gb: dispersa(b, aw, ah, azar) }, solucion: { huecos: [t] } });
    }
    return { enunciado: "Cuenta los dibujos de cada grupo y escribe el total.", ejercicios };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 2, 4), { aw, ah } = zonaDibujos();
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { a, b, kind, ga, gb } = e.datos;
      p.marco(x, y, cw, ch, i);
      pintarDispersa(p, x + 14, y + 56, aw, ah, a, kind, ga);
      pintarDispersa(p, x + cw - 14 - aw, y + 56, aw, ah, b, kind, gb);
      p.text(x + cw / 2, y + 56 + ah / 2 - 9, "+", 26, { anchor: "middle" });
      p.linea(x, y + 8, cw, 44, [T("Total =", 14, "PM"), B(52, 38, e.solucion.huecos[0])], 8);
    }));
  },
});
