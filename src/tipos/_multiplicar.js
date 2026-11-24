// Charta · núcleo común de «multiplicar.*» (2.º, bloque 13, lote 6): tablas permitidas y dibujo de puntos.
// Convención: «3 grupos de 4» → 3 × 4 = 12 (primero cuántas veces, luego cuánto hay en cada una).
import { INK, COLOR_SOLUCION } from "../render/papel.js";

export const POR = "×";
/** Tablas que se trabajan en 2.º. */
export const TABLAS = [2, 3, 4, 5, 10];
/** 3.º (MATES_3.md, lote 3): todas las tablas, del 2 al 10. */
export const TABLAS_3 = [2, 3, 4, 5, 6, 7, 8, 9, 10];

/** Opción `tablas` → lista de tablas: None = 2, 5 y 10; "todas" = 2, 3, 4, 5 y 10; "2a10" = del 2 al 10 (3.º); "3" = solo la del 3 (en 3.º, también 6–9). */
export function tablasDe(params) {
  const v = params?.tablas ?? null;
  if (v === null || v === undefined) return [2, 5, 10];
  if (v === "todas") return [...TABLAS];
  if (v === "2a10") return [...TABLAS_3];
  const n = Number(v);
  if (!TABLAS_3.includes(n)) throw new Error(`Tabla no permitida: ${v}`);
  return [n];
}

/** n elementos (de la lista) sin repetir, mezclados; si no hay bastantes, se repite el ciclo (solo entonces). */
export function sinRepetir(lista, n, azar) {
  let out = [];
  while (out.length < n) out = out.concat(azar.barajar(lista));
  return out.slice(0, n);
}

/** Posiciones (en −1…1) de n puntos (2–5) como en un dado. */
const DADO = {
  2: [[-.5, .5], [.5, -.5]],
  3: [[-.6, .6], [0, 0], [.6, -.6]],
  4: [[-.5, .5], [.5, .5], [-.5, -.5], [.5, -.5]],
  5: [[-.5, .5], [.5, .5], [0, 0], [-.5, -.5], [.5, -.5]],
};
/** Punto de n (2–5) bien colocado en una caja de w × h centrada en (cx, cy). */
export function puntosDado(p, cx, cy, w, h, n, r = 4.5) {
  const sx = w / 2 - r - 4, sy = h / 2 - r - 4;
  for (const [a, b] of DADO[n]) p.circle(cx + a * sx, cy + b * sy, r, { lw: 1, fill: INK });
}

/** n puntos en filas de `porFila` (la última, centrada si queda corta; `dibujo(x, y)` = otra forma de pintarlos), dentro de la caja x…x+w, y…y+h. */
export function puntosFilas(p, x, y, w, h, n, porFila, r = 5, paso = 15, dibujo = null) {
  const filas = Math.ceil(n / porFila);
  for (let i = 0; i < n; i++) {
    const f = Math.floor(i / porFila), enFila = Math.min(porFila, n - f * porFila), k = i % porFila;
    const px = x + w / 2 + (k - (enFila - 1) / 2) * paso, py = y + h / 2 + ((filas - 1) / 2 - f) * paso;
    if (dibujo) dibujo(px, py); else p.circle(px, py, r, { lw: 1, fill: INK });
  }
}

/** Punto rojo (línea mínima con extremos redondos: sin relleno, así no cuenta como respuesta escrita en la solución). */
export function puntoRojo(p, x, y) { p.line(x, y, x + 0.01, y, { lw: 7, gris: COLOR_SOLUCION }); }
