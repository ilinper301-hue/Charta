// Charta · fichas de varias páginas en la composición, sin DOM.
// La composición guarda las actividades seguidas (`actividades`, como siempre) y, si hay más de una página,
// cuántas lleva cada una (`paginas: [2, 1, 1]`). Sin `paginas` = una sola página (las guardadas de antes no cambian).
import { MAX_PAGINAS } from "../nucleo/ficha.js";

/** Actividades por página de una composición: [2, 1, 1]; si `paginas` no cuadra o no está, una sola página. */
export function cuentasDe(c) {
  const n = c?.actividades?.length || 0, p = c?.paginas;
  if (Array.isArray(p) && p.length >= 1 && p.length <= MAX_PAGINAS && p.every((x) => x === 1 || x === 2) && p.reduce((a, b) => a + b, 0) === n) return [...p];
  return [Math.max(1, Math.min(2, n))];
}
/** ¿La composición es válida en páginas? (de 1 a MAX_PAGINAS páginas de 1 o 2 actividades). */
export function paginasValidas(c) {
  const n = c?.actividades?.length || 0;
  if (c?.paginas == null) return n >= 1 && n <= 2;
  return JSON.stringify(cuentasDe(c)) === JSON.stringify(c.paginas);
}
/** Reparte la lista según las cuentas: ([a, b, c], [2, 1]) → [{ actividades: [a, b] }, { actividades: [c] }]. */
export function agrupar(lista, cuentas) {
  let i = 0;
  return cuentas.map((k) => ({ actividades: lista.slice(i, (i += k)) }));
}
/** Página (0…) de la actividad i. */
export function paginaDe(cuentas, i) {
  let fin = 0;
  for (let k = 0; k < cuentas.length; k++) { fin += cuentas[k]; if (i < fin) return k; }
  return -1;
}
/** Primera actividad (índice) de la página k. */
export const inicioDe = (cuentas, k) => cuentas.slice(0, k).reduce((a, b) => a + b, 0);
