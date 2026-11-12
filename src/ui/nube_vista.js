// Charta · nube en la interfaz (paso 5.1; fase 2 de PLAN-DISENO, antes en app.js): inicio de sesión con Google y fichas en
// /apps/charta/fichas/{id} (sin nombres de alumnos). La lista leída vive en `ctx.enNube` (null = sin leer).
// crearNubeVista(ctx) → { nube, avisoNube(texto, error), leerNube(), idUrl, aFori }
import { crearNube } from "../nube/nube.js";
import { confirmar } from "./piezas.js";
import { $ } from "./dom.js";

export function crearNubeVista(ctx) {
  const nube = crearNube({ almacen: ctx.almacen });
  ctx.enNube = null;
  const avisoNube = (t, error) => { $("estadoNube").textContent = t || ""; $("estadoNube").classList.toggle("error", !!error); $("estadoNube").hidden = !t; };
  async function leerNube() {
    try { ctx.enNube = await nube.listar(); } catch (e) { ctx.enNube = ctx.enNube || []; avisoNube(e.message, true); }
    ctx.lista.pintar(); ctx.refrescarInicio();
  }
  // La cuenta solo está en Ajustes (fase 3): #iaCuenta (Entrar / Cerrar sesión) y #iaCuentaTxt (estado).
  function pintarCuenta(e) {
    const b = $("iaCuenta"), dentro = e.estado === "dentro";
    b.disabled = e.estado === "cargando";
    b.textContent = dentro ? "Cerrar sesión" : e.estado === "cargando" ? "Entrando…" : "Entrar con Google";
    $("iaCuentaTxt").textContent = e.error || (dentro ? `Sesión de ${e.usuario.nombre || e.usuario.correo} (${e.usuario.correo}). Tus fichas de la nube están en Inicio → Mis fichas.`
      : "Entra con tu cuenta de Google para guardar fichas en la nube y abrirlas desde Tabula y Fori.");
    $("iaCuentaTxt").classList.toggle("error", !!e.error);
    if (e.error) avisoNube(e.error, true);
  }
  nube.alCambiar((e) => {
    pintarCuenta(e);
    if (e.estado === "dentro" && !ctx.enNube) leerNube(); else if (e.estado !== "dentro") ctx.enNube = null;
    ctx.lista.pintar(); ctx.refrescarInicio();
  });
  $("iaCuenta").onclick = async () => {
    const e = nube.estado();
    if (e.estado === "dentro") {
      if (await confirmar({ titulo: "¿Cerrar la sesión?", texto: `Sesión de ${e.usuario.correo}. Las fichas siguen en la nube.`, si: "Cerrar sesión" })) await nube.salir();
      return;
    }
    try { await nube.entrar(); } catch {}
  };
  $("guardarNube").onclick = async () => {
    const ficha = ctx.previa.ficha;
    if (!ficha) return;
    avisoNube("");
    try {
      if (nube.estado().estado !== "dentro") { await nube.entrar(); if (nube.estado().estado !== "dentro") return; }
      if (!ctx.enNube) await leerNube();
      const r = await nube.guardar(ficha, ctx.comp.composicion());
      avisoNube(r.repetida ? "Esta ficha ya estaba en la nube." : r.pendiente ? "Guardada en este dispositivo; se subirá a la nube cuando haya conexión." : "Guardada en la nube (sin nombres de alumnos).");
      if (!r.repetida && !r.pendiente) ctx.enNube = await nube.listar().catch(() => ctx.enNube);
      ctx.lista.mostrarNube();
    } catch (e) { avisoNube(e.message, true); }
  };
  // ?ficha={id}: abrir una ficha de la nube (enlace desde Tabula)
  const idUrl = new URLSearchParams(location.search).get("ficha");
  const aFori = new URLSearchParams(location.search).get("a") === "fori";   // la pide Fori: abrirla y devolvérsela
  if (nube.recordada() || idUrl) nube.iniciar().then(async () => {
    if (!idUrl) return;
    if (nube.estado().estado !== "dentro") { avisoNube("Inicia sesión (⋯ → Ajustes → Entrar con Google) para abrir la ficha enlazada."); return; }
    try { const x = await nube.abrir(idUrl); if (x.composicion) { ctx.comp.abrirGuardada(x.composicion); if (aFori) ctx.enlaces.proyectar(); } } catch (e) { avisoNube(e.message, true); }
  }).catch(() => {});
  return { nube, avisoNube, leerNube, idUrl, aFori };
}
