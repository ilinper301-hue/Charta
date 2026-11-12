// Charta · listas de fichas guardadas: favoritas, recientes y nube (fase 2 de PLAN-DISENO, antes en app.js).
// Ayudantes comunes (los usa también inicio_vista.js) y la tarjeta de la pantalla de diseño.
// crearListaFichas(ctx) → { pintar(), marcarFavorito(), mostrarNube() }
import { modelo } from "../nucleo/ficha.js";
import { hayTipo } from "../nucleo/tipos.js";
import { $, el } from "./dom.js";

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

export function crearListaFichas(ctx) {
  let pestana = "favoritos";
  const comp = () => ctx.comp, nubeV = () => ctx.nubeV;
  function marcarFavorito() {
    try { const f = ctx.guardadas.esFavorito(comp().composicion()); $("favorito").textContent = f ? "★ Favorita" : "☆ Favorita"; $("favorito").classList.toggle("on", f); } catch {}
  }
  function pintar() {
    const g = ctx.guardadas, fav = g.favoritos(), rec = g.recientes(), dentro = nubeV().nube.estado().estado === "dentro";
    const nubeLista = dentro ? ctx.enNube || [] : [];
    $("guardadas").hidden = !fav.length && !rec.length && !dentro;
    if (pestana === "nube" && !dentro) pestana = "favoritos";
    if (!fav.length && pestana === "favoritos") pestana = dentro ? "nube" : "recientes";
    if (!rec.length && pestana === "recientes") pestana = fav.length || !dentro ? "favoritos" : "nube";
    $("pFav").classList.toggle("activa", pestana === "favoritos"); $("pRec").classList.toggle("activa", pestana === "recientes");
    $("pNube").classList.toggle("activa", pestana === "nube"); $("pNube").hidden = !dentro;
    const t = etiquetasPestanas({ fav, rec, nube: ctx.enNube });
    $("pFav").textContent = t.fav; $("pRec").textContent = t.rec; $("pNube").textContent = t.nube;
    if (pestana === "nube") return pintarNube(nubeLista);
    const lista = pestana === "favoritos" ? fav : rec;
    $("listaGuardadas").replaceChildren(...lista.map((c, i) => {
      const abrir = el("button", { className: "g-abrir", disabled: !disponible(c) },
        el("strong", { textContent: c.nombre || "Ficha" }),
        el("small", { textContent: nombresModelos(c) + (c.fecha ? " · " + fechaDMA(c.fecha) : "") }));
      abrir.onclick = () => comp().abrirGuardada(c);
      const x = el("button", { className: "g-quitar", textContent: "✕", title: "Quitar de la lista" });
      x.onclick = () => { g.quitar(pestana, i); pintar(); marcarFavorito(); };
      return el("li", {}, abrir, x);
    }));
  }
  function pintarNube(lista) {
    if (!ctx.enNube) { $("listaGuardadas").replaceChildren(el("li", { className: "info", textContent: "Cargando…" })); return; }
    if (!lista.length) { $("listaGuardadas").replaceChildren(el("li", { className: "info", textContent: "Aún no hay fichas en la nube: usa «☁ Guardar en la nube»." })); return; }
    $("listaGuardadas").replaceChildren(...lista.map((x) => {
      const abrir = el("button", { className: "g-abrir", disabled: !disponible(x.composicion) },
        el("strong", { textContent: x.titulo }),
        el("small", { textContent: nombresModelos(x.composicion) + (x.creada ? " · " + fechaDMA(x.creada.slice(0, 10)) : "") }));
      abrir.onclick = () => comp().abrirGuardada(x.composicion);
      const b = el("button", { className: "g-quitar", textContent: "✕", title: "Borrar de la nube" });
      b.onclick = async () => {
        if (!confirm(`¿Borrar «${x.titulo}» de la nube? Tabula y Fori dejarán de verla.`)) return;
        try { await nubeV().nube.borrar(x.id); ctx.enNube = ctx.enNube.filter((y) => y.id !== x.id); pintar(); } catch (e) { nubeV().avisoNube(e.message, true); }
      };
      return el("li", {}, abrir, b);
    }));
  }
  function mostrarNube() { pestana = "nube"; pintar(); }
  $("pFav").onclick = () => { pestana = "favoritos"; pintar(); };
  $("pRec").onclick = () => { pestana = "recientes"; pintar(); };
  $("pNube").onclick = () => { mostrarNube(); if (!ctx.enNube) nubeV().leerNube(); };
  $("favorito").onclick = () => {
    if (!ctx.previa.ficha) return;
    pestana = "favoritos"; ctx.guardadas.alternarFavorito(comp().composicion(), ctx.previa.ficha.titulo); marcarFavorito(); pintar();
  };
  return { pintar, marcarFavorito, mostrarNube };
}
