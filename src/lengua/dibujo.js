// Charta · Lengua · ayudantes de dibujo comunes (lote 0 de LENGUA_1.md). Dibujan en un Papel (coordenadas del motor, y hacia arriba).
// Mismo estilo que Matemáticas: tarjetas blancas, huecos grises redondeados y la solución en rojo (modo "solucion").
// Cada ayudante dibuja dentro de la caja (x, y, w, h) y centra su contenido.
import { INK, COLOR_SOLUCION } from "../render/papel.js";

const FS = 24;       // tamaño de letra de las palabras de lectura

/** Ancho de un texto en negrita con la letra de la ficha. */
const anchoB = (p, t, fs) => p.ancho(t, "PB", fs);

/** Palabra con huecos: «m_sa». huecos = [{ pos, largo, sol }] (sol = lo que va; por defecto, las letras quitadas).
 *  Cada hueco es una caja gris del ancho de una letra ancha (o de su solución, si es mayor). */
export function palabraHuecos(p, x, y, w, h, palabra, huecos, { fs = FS, anchoHueco } = {}) {
  const trozos = []; let i = 0;
  for (const hu of [...huecos].sort((a, b) => a.pos - b.pos)) {
    if (hu.pos > i) trozos.push({ t: palabra.slice(i, hu.pos) });
    const sol = hu.sol ?? palabra.slice(hu.pos, hu.pos + hu.largo);
    trozos.push({ hueco: true, sol, w: anchoHueco ?? Math.max(fs * 0.95, anchoB(p, sol, fs) + fs * 0.45) });
    i = hu.pos + hu.largo;
  }
  if (i < palabra.length) trozos.push({ t: palabra.slice(i) });
  const ws = trozos.map((t) => (t.hueco ? t.w : anchoB(p, t.t, fs)));
  const g = fs * 0.12, total = ws.reduce((a, b) => a + b, 0) + g * (trozos.length - 1);
  let cx = x + (w - total) / 2;
  const bh = fs * 1.3, by = y + (h - bh) / 2;
  trozos.forEach((t, k) => {
    if (t.hueco) p.caja(cx, by, t.w, bh, null, fs, t.sol);
    else p.text(cx, y + h / 2 - fs * 0.35, t.t, fs, { f: "PB" });
    cx += ws[k] + g;
  });
}

/** Fila de n casillas centrada (sílabas, letras o palmadas).
 *  sol: lista de textos (uno por casilla) que se ven en rojo en la solución; rellenar: nº de casillas que se colorean
 *  (en la solución, en rojo suave: «colorea una por cada palmada»). */
export function casillas(p, x, y, w, h, n, { sol = null, rellenar = null, ancho = 46, alto = 40, gap = 8, fs = 20 } = {}) {
  const total = n * ancho + (n - 1) * gap;
  let cx = x + (w - total) / 2; const by = y + (h - alto) / 2;
  for (let k = 0; k < n; k++) {
    if (rellenar !== null) {
      const pinta = p.solucion && k < rellenar;
      p.rrect(cx, by, ancho, alto, 7, { lw: pinta ? 2.2 : 1.5, fill: pinta ? "#F6C9C9" : 1, stroke: pinta ? COLOR_SOLUCION : INK });
    } else p.caja(cx, by, ancho, alto, null, fs, sol ? sol[k] : null);
    cx += ancho + gap;
  }
}

/** Opciones para rodear, en fila y centradas (letras, sílabas o palabras). En la solución, la correcta rodeada en rojo.
 *  correcta: índice o lista de índices. Devuelve las cajas [{ x, y, w, h }] por si el tipo quiere dibujar algo encima. */
export function rodear(p, x, y, w, h, opciones, correcta, { fs = FS, gap = 22, tarjeta = false } = {}) {
  const ok = new Set([].concat(correcta ?? []));
  const pad = fs * 0.45, ws = opciones.map((o) => anchoB(p, o, fs) + 2 * pad);
  const total = ws.reduce((a, b) => a + b, 0) + gap * (opciones.length - 1), bh = fs * 1.55;
  let cx = x + (w - total) / 2; const by = y + (h - bh) / 2, cajas = [];
  opciones.forEach((o, k) => {
    if (tarjeta) p.rrect(cx, by, ws[k], bh, bh / 2, { lw: 0.8, fill: 1, stroke: 0.8 });
    p.text(cx + ws[k] / 2, y + h / 2 - fs * 0.35, o, fs, { f: "PB", anchor: "middle" });
    if (p.solucion && ok.has(k)) p.rrect(cx - 2, by - 2, ws[k] + 4, bh + 4, (bh + 4) / 2, { lw: 2.4, stroke: COLOR_SOLUCION });
    cajas.push({ x: cx, y: by, w: ws[k], h: bh });
    cx += ws[k] + gap;
  });
  return cajas;
}

/** Dos columnas para unir con flechas: izq[i] va con der[pares[i]]. Cada elemento lleva su punto de unión;
 *  en la solución, la línea en rojo. Cada fila es un ejercicio (ids[i]), para Fori. */
export function unir(p, x, y, w, h, izq, der, pares, { fs = 22, ids = null } = {}) {
  const n = izq.length, rh = h / n, cw = Math.min(200, w * 0.36), bh = Math.min(rh - 10, fs * 1.8);
  const xi = x + w * 0.06, xd = x + w - w * 0.06 - cw;
  const fila = (k) => y + h - (k + 1) * rh + (rh - bh) / 2;
  der.forEach((d, k) => {
    p.tarjeta(xd, fila(k), cw, bh);
    p.text(xd + cw / 2, fila(k) + bh / 2 - fs * 0.35, d, fs, { f: "PB", anchor: "middle" });
    p.circle(xd - 12, fila(k) + bh / 2, 4.5, { fill: INK, stroke: null });
  });
  izq.forEach((t, k) => {
    const dib = () => {
      p.tarjeta(xi, fila(k), cw, bh);
      p.text(xi + cw / 2, fila(k) + bh / 2 - fs * 0.35, t, fs, { f: "PB", anchor: "middle" });
      p.circle(xi + cw + 12, fila(k) + bh / 2, 4.5, { fill: INK, stroke: null });
      if (p.solucion) p.line(xi + cw + 12, fila(k) + bh / 2, xd - 12, fila(pares[k]) + bh / 2, { lw: 2.4, gris: COLOR_SOLUCION });
    };
    if (ids) p.ejercicio(ids[k], dib); else dib();
  });
}

/** Texto a la izquierda de la caja (una palabra, una frase con la sílaba en hueco…), en negrita, centrado en vertical. */
export function rotulo(p, x, y, h, texto, { fs = FS, anchor = "start", gris = INK } = {}) {
  p.text(x, y + h / 2 - fs * 0.35, texto, fs, { f: "PB", anchor, gris });
}
