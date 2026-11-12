// Charta · listas de fichas guardadas: favoritas, recientes y nube (fase 2 de PLAN-DISENO, antes en app.js).
// Ayudantes comunes (los usa inicio_vista.js) y la favorita de la ficha abierta.
// crearListaFichas(ctx) → { pintar(), esFavorita(), alternarFavorita() }
import { modelo } from "../nucleo/ficha.js";
import { hayTipo } from "../nucleo/tipos.js";
import { avisar } from "./piezas.js";

/** ¿Se puede abrir? Todos sus modelos existen en esta versión. */
export const disponible = (comp, hay = hayTipo) => { const a = comp?.actividades || []; return a.length > 0 && a.every((x) => hay(x.tipo)); };
const nombreDe = (id) => { try { return modelo(id).nombre; } catch { return id; } };
/** «Modelo 1 + Modelo 2» */
export const nombresModelos = (comp, nombre = nombreDe) => (comp?.actividades || []).map((a) => nombre(a.tipo)).join(" + ");
/** Textos de las pestañas; `nube` = lista de la nube (null = sin leer). */
export const etiquetasPestanas = ({ fav, rec, nube }) => ({
  fav: `★ Favoritas (${fav.length})`, rec: `Recientes (${rec.length})`, nube: nube ? `☁ En la nube (${nube.length})` : "☁ En la nube",
});
/** 2026-11-12 → 12-11-2026 (como se ve en las listas). */
export const fechaDMA = (iso) => iso.split("-").reverse().map(Number).join("-");

/**
 * Fase 4: la tarjeta Favoritas/Recientes sale del diseño (las listas están solo en Inicio). Queda la favorita de la
 * ficha abierta (en «⋯» de la barra) y pintar(), que refresca el inicio.
 */
export function crearListaFichas(ctx) {
  const esFavorita = () => { try { return ctx.guardadas.esFavorito(ctx.comp.composicion()); } catch { return false; } };
  function alternarFavorita() {
    const ficha = ctx.previa.ficha; if (!ficha) return;
    ctx.guardadas.alternarFavorito(ctx.comp.composicion(), ficha.titulo);
    avisar(esFavorita() ? "Añadida a favoritas (en Inicio → Mis fichas)." : "Quitada de favoritas.");
  }
  return { pintar: () => ctx.refrescarInicio(), esFavorita, alternarFavorita };
}
