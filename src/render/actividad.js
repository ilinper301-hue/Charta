// Charta · render(actividad, modo) → contenido de la actividad en SVG (paso 2.3).
// Devuelve la zona de página que el panel encaja (como panel() del motor): { x, y, w, h, svg }
// en coordenadas SVG de página A4 (pt, y hacia abajo). La plantilla A4 (paso 2.4) la escala dentro del panel.
// modos: "papel" (huecos vacíos) · "solucion" (huecos con la respuesta). "pantalla" (Fori) llegará en la fase 5.
import { tipo } from "../nucleo/tipos.js";
import { Papel } from "./papel.js";

export function render(actividad, modo = "papel") {
  const T = tipo(actividad.tipo);
  if (!T) throw new Error(`Tipo no disponible: «${actividad.tipo}»`);
  if (typeof T.dibujar !== "function") throw new Error(`${actividad.tipo}: falta dibujar()`);
  const p = new Papel({ modo, parte: actividad.tamano === "media" ? 0.5 : 1 });
  T.dibujar(p, actividad);
  return p.resultado();
}

/** SVG autónomo de la zona (para pruebas y comparaciones). */
export function svgZona({ x, y, w, h, svg }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}">${svg}</svg>`;
}
