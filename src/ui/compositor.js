// Charta · compositor (paso 4.2; fase 2 de PLAN-DISENO, antes en app.js): añadir, ordenar y quitar actividades (1 o 2 por hoja)
// y páginas (las actividades se numeran seguidas), composición actual, abrir una guardada y borrador (fase 1, R1).
// crearCompositor(ctx) → { editores, cuentas (con setter), recolocar, nuevoEditor, letraMateria, ponerMateria1,
//   composicion(), abrirGuardada(c, extra), guardarBorrador() }
import { MAX_PAGINAS } from "../nucleo/ficha.js";
import { materiaDe, fuenteMateria } from "./navegacion.js";
import { abrirSelector } from "./selector.js";
import { hayLengua1, letrasDe, obligatoriasDe, hayFrases, frasesDe } from "./letras.js";
import { cuentasDe, paginaDe, inicioDe } from "./paginas.js";
import { ABECEDARIO } from "../lengua/reglas.js";
import { fuentePorId } from "../render/fuentes.js";
import { editorActividad } from "./editor_actividad.js";
import { guardarUltimo } from "./preferencias.js";
import { $, el } from "./dom.js";

export function crearCompositor(ctx) {
  const pintar = () => ctx.previa.pintar();
  // editores = todas las actividades seguidas; cuentas = cuántas lleva cada página ([2, 1, 1]).
  const editores = [];
  let cuentas = [1];
  const tamanoDe = (ed) => (cuentas[paginaDe(cuentas, editores.indexOf(ed))] > 1 ? "media" : "completa");
  const boton = (texto, titulo, f, clase = "") => { const b = el("button", { textContent: texto, title: titulo, className: clase }); b.onclick = f; return b; };
  function recolocar() {
    const varias = cuentas.length > 1;
    $("acts").replaceChildren(...cuentas.map((k, p) => {
      const i0 = inicioDe(cuentas, p), eds = editores.slice(i0, i0 + k);
      const caja = el("div", { className: "pagina-comp" + (varias ? " varias" : "") });
      if (varias) caja.append(el("div", { className: "pagina-cab" }, el("h3", { textContent: `Página ${p + 1}` }),
        boton("Quitar página", "Quitar esta página y sus actividades", () => quitarPagina(p))));
      caja.append(...eds.map((e) => e.caja));
      if (k < 2) caja.append(boton("+ Segunda actividad", "Otra actividad en esta página (cada una ocupa media página)", () => anadirSegunda(p), "anadir"));
      return caja;
    }));
    const n = editores.length;
    editores.forEach((e, i) => e.cabecera(i + 1, [
      ...(i > 0 ? [boton("↑ Subir", `Pasarla a actividad ${i}`, () => mover(i, -1))] : []),
      ...(i < n - 1 ? [boton("↓ Bajar", `Pasarla a actividad ${i + 2}`, () => mover(i, 1))] : []),
      ...(n > 1 ? [boton("Quitar", "Quitar esta actividad", () => quitar(i))] : []),
    ]));
    $("anadirPagina").hidden = cuentas.length >= MAX_PAGINAS;
    for (const e of editores) e.refrescar();
  }
  function mover(i, d) { [editores[i], editores[i + d]] = [editores[i + d], editores[i]]; recolocar(); letraMateria(); pintar(); }
  function quitar(i) {
    const p = paginaDe(cuentas, i);
    editores.splice(i, 1); cuentas[p]--; if (!cuentas[p]) cuentas.splice(p, 1);
    recolocar(); letraMateria(); pintar();
  }
  function quitarPagina(p) {
    if (cuentas.length < 2) return;
    editores.splice(inicioDe(cuentas, p), cuentas[p]); cuentas.splice(p, 1);
    recolocar(); letraMateria(); pintar();
  }
  function anadirSegunda(p) {
    const e0 = editores[inicioDe(cuentas, p)];
    abrirSelector({ tamano: "media", actual: e0.id, curso: e0.curso, alElegir: (id, c) => {
      editores.splice(inicioDe(cuentas, p) + 1, 0, crearEditor(id, c)); cuentas[p] = 2; recolocar(); pintar();
    } });
  }
  // Letra por materia: si la actividad 1 pasa a otra materia, se pone la letra de esa materia (Lengua → Fredoka).
  let materia1 = null;
  function letraMateria() {
    const m = materiaDe(editores[0]?.id); if (m === materia1) return;
    if (materia1 !== null) ctx.fuentes.elegirFuente(fuenteMateria(editores[0].id));
    materia1 = m;
  }
  function cambiado(e) { if (editores[0] === e) { guardarUltimo(e.id); ctx.usos.anotar(e.id); letraMateria(); } pintar(); }
  function crearEditor(id, curso) { let ed = null; ed = editorActividad(id, { tamano: () => (ed ? tamanoDe(ed) : "completa"), alCambiar: cambiado, curso }); return ed; }
  function nuevoEditor(id, curso) { editores.push(crearEditor(id, curso)); cuentas = [editores.length]; recolocar(); }
  $("anadirPagina").onclick = () => { const u = editores[editores.length - 1]; abrirSelector({ tamano: "completa", actual: u.id, curso: u.curso,
    alElegir: (id, c) => { editores.push(crearEditor(id, c)); cuentas.push(1); recolocar(); pintar(); $("acts").lastElementChild?.scrollIntoView({ behavior: "smooth" }); } }); };
  $("acts").addEventListener("change", pintar);

  // Composición actual (favoritas, recientes, nube, Tabula): sin nombres de alumnos.
  const composicion = () => {
    const L = ctx.letras;
    let acts; try { acts = L.actividadesBase(); } catch { acts = editores.map((e) => e.leer()); }
    const fr = hayFrases(acts) ? L.misFrases() : [];
    return { actividades: acts, ...(cuentas.length > 1 && { paginas: [...cuentas] }), semilla: ctx.semilla, titulo: $("titulo").value.trim(),
      variaciones: $("variaciones").value, bn: $("bn").checked, grande: $("grande").checked, facil: $("facil").checked, fuente: $("fuente").value,
      ...(fr.length && { misFrases: fr }) };
  };
  /** Abre una composición; `extra` (solo el borrador): { alumnos, copias, grupo } de este dispositivo. */
  function abrirGuardada(c, extra = null) {
    const L = ctx.letras;
    ctx.aDiseno();
    editores.length = 0; cuentas = cuentasDe(c);
    for (const a of c.actividades) editores.push(crearEditor(a.tipo));
    recolocar();
    c.actividades.forEach((a, i) => editores[i].poner(a.tipo, a.params, a.curso));
    ctx.semilla = c.semilla || 1; $("titulo").value = c.titulo || ""; $("variaciones").value = c.variaciones || "iguales"; $("bn").checked = !!c.bn; $("grande").checked = !!c.grande; $("facil").checked = !!c.facil;
    if (!c.fuente || fuentePorId(c.fuente).id === c.fuente) ctx.fuentes.elegirFuente(c.fuente || "andika");
    else { ctx.fuentes.elegirFuente("andika"); $("infoFuente").textContent = `Esta ficha usaba la letra «${c.fuente.replace("usuario:", "")}», que no está en este dispositivo: se usa Andika. Puedes subirla otra vez.`; }
    materia1 = materiaDe(editores[0].id);
    if (hayLengua1(c.actividades)) { const v = letrasDe(c); L.marcadas.clear(); for (const l of v ?? ABECEDARIO) L.marcadas.add(l); L.obligatorias.clear(); for (const l of obligatoriasDe(c) ?? "") L.obligatorias.add(l); L.pintarLetras(); }   // sin guardarlas como las de la clase
    if (hayFrases(c.actividades)) $("misFrases").value = frasesDe(c).join("\n");   // ídem con «Mis frases»
    if (extra) {
      $("alumnos").value = extra.alumnos || ""; $("copias").value = extra.copias || 1;
      if (extra.grupo && [...$("grupoTabula").options].some((o) => o.value === extra.grupo)) $("grupoTabula").value = extra.grupo; else ctx.grupoBorrador = extra.grupo || null;
    }
    pintar(); $("acts").scrollIntoView({ behavior: "smooth" });
  }

  // Fase 1 (R1) · borrador: la ficha en curso se guarda en cada cambio (con los nombres, solo en este dispositivo: ver borrador.js).
  function guardarBorrador() {
    if (!ctx.listo || ctx.vista !== "diseno" || !editores.length) return;
    ctx.borrador.guardar(composicion(), { alumnos: $("alumnos").value, copias: ctx.previa.copias(), grupo: $("grupoTabula").value });
  }
  let relojBorrador = null;
  const guardarLuego = () => { clearTimeout(relojBorrador); relojBorrador = setTimeout(guardarBorrador, 400); };
  for (const id of ["alumnos", "titulo", "copias", "misFrases"]) $(id).addEventListener("input", guardarLuego);
  addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") guardarBorrador(); });
  addEventListener("pagehide", guardarBorrador);

  return {
    editores,
    get cuentas() { return cuentas; }, set cuentas(v) { cuentas = v; },
    recolocar, nuevoEditor, crearEditor, letraMateria, composicion, abrirGuardada, guardarBorrador,
    /** Al arrancar mandan la letra guardada o la de la composición abierta. */
    ponerMateria1() { materia1 ??= materiaDe(editores[0].id); },
  };
}
