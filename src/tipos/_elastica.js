// Charta · rejilla elástica de operaciones (sumar.*, restar.*): ayudantes comunes de la opción «Cantidad» (paso 3 de «Espacio en la ficha»).
// «Más grandes» = los números de siempre ([completa, media]); las tarjetas llenan el panel y la operación crece (hasta ×1,3) si cabe.
// «Más ejercicios» = las filas que caben con tarjetas ≥ MIN_OP (54 pt: una línea con su casilla), sin pasar de las operaciones distintas que da el banco.
import { TOP, cuantosRejilla } from "../render/papel.js";

export const MIN_OP = 54;   // alto mínimo de tarjeta con «Más ejercicios» (una línea con su casilla de 38)

/** Nº de ejercicios: cuantosRejilla(), pero con «Más ejercicios» no pasa de las filas completas que da el banco (`banco` = operaciones distintas), nunca menos que lo de siempre. */
export function cuantos(ctx, cols, minAlto, fijo, banco = Infinity) {
  const n = cuantosRejilla(ctx, cols, minAlto, fijo), fija = fijo[ctx.tamano === "media" ? 1 : 0];
  return ctx.cantidad === "mas" && banco < n ? Math.max(fija, Math.floor(banco / cols) * cols) : n;
}

/** Con «Más ejercicios»: quita los repetidos (clave(x)) y deja filas completas, sin bajar de lo de siempre (si hace falta, rellena con repetidos como antes). Con «Más grandes» no toca nada. */
export function sinRepetir(ctx, lista, cols, fijo, clave) {
  if (ctx.cantidad !== "mas") return lista;
  const vistos = new Set(), unicas = [], resto = [];
  for (const x of lista) (vistos.has(clave(x)) ? resto : unicas).push(x) && vistos.add(clave(x));
  if (!resto.length) return lista;
  const n = Math.max(fijo[ctx.tamano === "media" ? 1 : 0], Math.floor(unicas.length / cols) * cols);
  return [...unicas, ...resto].slice(0, Math.min(lista.length, n));
}

/** Rejilla elástica de operaciones: filas = [items de linea()…]; filasOrig = filas de la rejilla de siempre (p.n(): la mitad en media), para no estirar las tarjetas de un banco corto. */
export function pintarEl(p, cols, filas, ids, filasOrig, GY = 8, gap = 8) {
  const rows = Math.max(Math.ceil(filas.length / cols), p.n(filasOrig));
  const { cel, cw, ch } = p.rejilla(TOP, cols, rows, 10, GY);
  const ancho = (its) => its.reduce((t, it) => t + (it.t === "t" ? p.ancho(it.s, it.f, it.fs) : it.w), 0);
  const cabe = Math.min(...filas.map((its) => (cw - 10 - gap * (its.length - 1)) / ancho(its)));
  const k = Math.max(1, Math.min(1.3, (ch - 24) / 38, cabe));   // la operación crece con la tarjeta (letra y casilla a la par), nunca por debajo de la de siempre
  const gr = (its) => (k === 1 ? its : its.map((it) => (it.t === "t" ? { ...it, fs: it.fs * k } : { ...it, w: it.w * k, h: it.h * k })));
  filas.forEach((its, i) => p.ejercicio(ids[i], () => {
    const [x, y] = cel[i];
    p.marco(x, y, cw, ch); p.linea(x, y, cw, ch, gr(its), gap);
  }));
  return { cel, cw, ch, k };
}
