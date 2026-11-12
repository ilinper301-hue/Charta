// Charta · selector de la letra de las fichas (fase 2 de PLAN-DISENO; antes en app.js): Andika, Fredoka y las que suba la maestra
// (guardadas en este dispositivo). crearFuentesVista(ctx) → { elegirFuente(id) }.
import { fuentePorId, registrarFuenteUsuario, quitarFuenteUsuario, todasLasFuentes } from "../render/fuentes.js";
import { validarArchivo, crearAlmacenFuentes, instalarCss, aBase64 } from "./fuentes.js";
import { $, el } from "./dom.js";

export function crearFuentesVista(ctx) {
  const CLAVE_FUENTE = "charta:fuente", INFO_FUENTE = $("infoFuente").textContent;
  const almacenFuentes = (() => { try { return crearAlmacenFuentes(); } catch { return null; } })();
  const NOTAS = { andika: " (la de Matemáticas)", fredoka: " (redondeada)" };
  function elegirFuente(id) {
    const f = fuentePorId(id);
    $("fuente").replaceChildren(...todasLasFuentes().map((x) => el("option", { value: x.id, textContent: x.nombre + (x.usuario ? " (subida)" : NOTAS[x.id] || "") })));
    $("fuente").value = f.id; $("quitarFuente").hidden = !f.usuario; $("infoFuente").textContent = INFO_FUENTE;
    try { localStorage.setItem(CLAVE_FUENTE, f.id); } catch {}
  }
  const pintar = () => ctx.previa.pintar();
  $("fuente").addEventListener("change", () => { elegirFuente($("fuente").value); pintar(); });
  $("subirFuente").onclick = () => $("archivoFuente").click();
  $("archivoFuente").onchange = async () => {
    const f = $("archivoFuente").files[0]; $("archivoFuente").value = "";
    if (!f) return;
    const v = validarArchivo(f, todasLasFuentes().filter((x) => x.usuario).map((x) => x.nombre));
    if (!v.ok) { $("infoFuente").textContent = v.error; return; }
    try {
      const rec = { nombre: v.nombre, formato: v.formato, mime: v.mime, b64: aBase64(await f.arrayBuffer()) };
      await instalarCss(rec); await almacenFuentes?.poner(rec);
      registrarFuenteUsuario(rec.nombre); elegirFuente("usuario:" + rec.nombre); pintar();
    } catch (e) { $("infoFuente").textContent = "No se ha podido guardar la letra: " + (e.message || e); }
  };
  $("quitarFuente").onclick = async () => {
    const f = fuentePorId($("fuente").value); if (!f.usuario) return;
    await almacenFuentes?.quitar(f.nombre).catch(() => {}); instalarCss(null, f.nombre); quitarFuenteUsuario(f.nombre);
    elegirFuente("andika"); pintar();
  };
  let guardada = "andika"; try { guardada = localStorage.getItem(CLAVE_FUENTE) || "andika"; } catch {}
  elegirFuente(guardada);
  almacenFuentes?.todas().then(async (recs) => {
    for (const r of recs) { await instalarCss(r); registrarFuenteUsuario(r.nombre); }
    if (recs.length) { elegirFuente(guardada); pintar(); }
  }).catch(() => {});
  return { elegirFuente };
}
