// Charta · alumnos y vista previa (fase 2 de PLAN-DISENO, antes en app.js; fase 4: una hoja cada vez).
// La vista previa dibuja solo la hoja visible, con paginador «‹ Ana · A · 1 de 25 ›» y conmutador «Ficha | Soluciones».
// Se repinta con un pequeño retardo y solo se vuelve a generar si cambia el contenido (claveGeneracion): nombres, copias,
// título, color, letra o lectura solo vuelven a dibujar. Al imprimir se dibujan todas, como antes.
// crearPrevia(ctx) → { pintar(), ahora(), nombres(), copias(), imprimir(), otraVariante(), ver(), ficha (lectura) }
import { generar, metadatosDe } from "../nucleo/ficha.js";
import { paginasVariante } from "../nucleo/lector.js";
import { hoja, hojas, listaHojas, dibujarHoja, estiloLectura } from "../render/hoja.js";
import { fuentePorId } from "../render/fuentes.js";
import { leerAlumnos, numVariantes, MAX_ALUMNOS } from "./alumnos.js";
import { hayLengua1, hayFrases } from "./letras.js";
import { agrupar } from "./paginas.js";
import { resumenAlumnos, resumenImpresion, etiquetaHoja, listaSoluciones, etiquetaSolucion, claveGeneracion, conPresentacion, solucionDe } from "./previa_datos.js";
import { abrirHoja, avisar, prepararPestanas, marcarPestana, ICONOS } from "./piezas.js";
import { $, el } from "./dom.js";

const RETARDO = 120;   // ms: varios cambios seguidos se pintan una sola vez

export function crearPrevia(ctx) {
  let ficha = null, base = null, clave = null;            // base: la ficha generada; ficha: con el título y la presentación de ahora
  let lista = [], sols = [], modo = "ficha", idx = 0, idxSol = 0, dibujada = null, ultimoError = "";
  let reloj = null, visor = null;
  const nombres = () => leerAlumnos($("alumnos").value).slice(0, MAX_ALUMNOS);
  const copias = () => Math.max(1, Math.min(MAX_ALUMNOS, parseInt($("copias").value, 10) || 1));
  function contar() {
    const todos = leerAlumnos($("alumnos").value), n = Math.min(todos.length, MAX_ALUMNOS);
    $("filaCopias").hidden = n > 0;
    $("cuenta").textContent = !n ? "Sin alumnos: la ficha sale con la línea del nombre en blanco."
      : `${n} alumno${n > 1 ? "s" : ""}: una ficha con su nombre para cada uno.` + (todos.length > MAX_ALUMNOS ? ` (máximo ${MAX_ALUMNOS}; sobran ${todos.length - MAX_ALUMNOS})` : "");
    $("resAlumnos").textContent = resumenAlumnos({ alumnos: n, copias: copias(), variaciones: $("variaciones").value });
  }
  const resumenImp = () => { $("resImpresion").textContent = resumenImpresion({ bn: $("bn").checked, fuente: fuentePorId($("fuente").value).nombre, grande: $("grande").checked, facil: $("facil").checked }); };

  /** Pide un repintado (con retardo). */
  function pintar() { clearTimeout(reloj); reloj = setTimeout(pintarYa, RETARDO); }
  /** Si hay un repintado pendiente, lo hace ya (antes de leer la ficha, imprimir, guardar…). */
  function ahora() { if (reloj !== null) pintarYa(); return ficha; }

  function pintarYa() {
    clearTimeout(reloj); reloj = null;
    $("error").hidden = true;
    try {
      contar(); resumenImp();
      const ns = nombres(), total = ns.length || copias();
      const leidas = ctx.comp.editores.map((e) => e.leer());
      $("secLetras").hidden = !hayLengua1(leidas); $("cajaMisFrases").hidden = !hayFrases(leidas);
      ctx.letras.pintarMisFrases();
      const acts = ctx.letras.actividades(), pags = agrupar(acts, ctx.comp.cuentas), variantes = numVariantes($("variaciones").value, total);
      const k = claveGeneracion({ paginas: pags, variantes, semilla: ctx.semilla });
      if (k !== clave) {
        base = generar({ paginas: pags, metadatos: metadatosDe(pags.map((p) => p.actividades.map((a) => a.tipo))), variantes }, ctx.semilla);
        clave = k;
      }
      ficha = conPresentacion(base, {
        titulo: $("titulo").value.trim() || undefined,
        presentacion: { color: !$("bn").checked, ...($("fuente").value !== "andika" && { fuente: $("fuente").value }), ...($("grande").checked && { letraGrande: true }), ...($("facil").checked && { lecturaFacil: true }) },
      });
      $("titulo").placeholder = base.titulo;   // el título automático, en la cabecera (editable)
      lista = listaHojas(ficha, { nombres: ns, copias: total });
      sols = listaSoluciones(ficha);
      idx = Math.min(idx, lista.length - 1); idxSol = Math.min(idxSol, sols.length - 1);
      ultimoError = "";
      dibujar(true);
    } catch (e) {
      $("error").textContent = e.message; $("error").hidden = false;
      if (e.message !== ultimoError) avisar(e.message, { error: true });   // en el móvil la vista previa puede no verse
      ultimoError = e.message;
    }
    ctx.comp.guardarBorrador();
  }

  /** Dibuja solo la hoja visible (y el paginador). */
  function dibujar(forzar = false) {
    if (!ficha) return;
    const sol = modo === "soluciones", bn = $("bn").checked;
    const xs = sol ? sols : lista, i = sol ? idxSol : idx, h = xs[i];
    const etq = (x, j) => (sol ? etiquetaSolucion(x, ficha.variantes) : etiquetaHoja(x, { variantes: ficha.variantes, copias: lista.length / (lista[0]?.total || 1) })) + (xs.length > 1 ? ` · ${j + 1} de ${xs.length}` : "");
    const svg = sol ? hoja(paginasVariante(ficha, h.variante)[h.pagina], { titulo: ficha.titulo, bn, modo: "solucion", uid: h.pagina ? `s${h.variante}p${h.pagina}` : `s${h.variante}`, ...estiloLectura(ficha) })
      : dibujarHoja(ficha, h, { bn });
    if (forzar || svg !== dibujada) {
      const caja = el("div", { className: "hoja" }); caja.innerHTML = svg;
      caja.setAttribute("role", "img"); caja.setAttribute("aria-label", (sol ? "Soluciones: " : "Ficha: ") + etq(h, i));
      $("hojas").replaceChildren(caja); dibujada = svg;
    }
    $("paginador").hidden = xs.length < 2;
    if (xs.length > 1) {
      const s = $("pagSel");
      if (s.options.length !== xs.length || s.dataset.modo !== modo || forzar) { s.replaceChildren(...xs.map((x, j) => new Option(etq(x, j), j))); s.dataset.modo = modo; }
      s.value = String(i); $("pagAnt").disabled = i === 0; $("pagSig").disabled = i === xs.length - 1;
    }
    $("notaSol").hidden = !sol;
    $("info").textContent = sol ? "" : `${lista.length} hoja${lista.length > 1 ? "s" : ""}`;
  }
  function ir(j) {
    if (!ficha) return;
    const xs = modo === "soluciones" ? sols : lista, n = Math.max(0, Math.min(xs.length - 1, j));
    if (modo === "soluciones") idxSol = n; else idx = n;
    dibujar();
  }
  const actual = () => (modo === "soluciones" ? idxSol : idx);
  function ponerModo(m) {
    ahora();
    if (m === "soluciones" && modo !== m && lista[idx]) idxSol = solucionDe(sols, lista[idx]);   // la de la hoja que se veía
    modo = m; marcarPestana($("previaModo"), $(m === "soluciones" ? "pSol" : "pFicha")); dibujar(true);
  }

  // Controles de la vista previa: conmutador, paginador, flechas del teclado y deslizar el dedo.
  prepararPestanas($("previaModo"), $("hojas"));
  marcarPestana($("previaModo"), $("pFicha"));
  $("pFicha").onclick = () => ponerModo("ficha");
  $("pSol").onclick = () => ponerModo("soluciones");
  $("pagAnt").innerHTML = ICONOS.ant; $("pagSig").innerHTML = ICONOS.sig;
  $("pagAnt").onclick = () => ir(actual() - 1);
  $("pagSig").onclick = () => ir(actual() + 1);
  $("pagSel").onchange = () => ir(+$("pagSel").value);
  $("previa").addEventListener("keydown", (e) => {
    if (e.target.closest("select, .pestanas")) return;
    const d = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
    if (d) { e.preventDefault(); ir(actual() + d); }
  });
  let x0 = null, y0 = 0;
  $("hojas").addEventListener("pointerdown", (e) => { x0 = e.clientX; y0 = e.clientY; });
  $("hojas").addEventListener("pointerup", (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > 1.5 * Math.abs(dy)) ir(actual() + (dx < 0 ? 1 : -1));
  });
  $("hojas").addEventListener("pointercancel", () => { x0 = null; });

  for (const id of ["alumnos", "copias", "variaciones", "bn", "grande", "facil", "titulo"]) $(id).addEventListener("change", pintar);
  $("alumnos").addEventListener("input", contar);
  $("titulo").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); $("titulo").blur(); } });

  /** «Ver ficha»: la vista previa a pantalla completa (la misma sección, que vuelve a su sitio al cerrar). */
  function ver() {
    if (visor) return;
    ahora();
    const imp = el("button", { className: "primario", onclick: imprimir }, Object.assign(el("span", { className: "ico" }), { innerHTML: ICONOS.imprimir }), "Imprimir");
    imp.title = "Imprimir o guardar en PDF";
    visor = abrirHoja({ titulo: ficha?.titulo || "Vista previa", contenido: $("previa"), clase: "pantalla", alCerrar: () => { visor = null; } });
    visor.caja.append(el("div", { className: "visor-pie" }, imp));
  }
  $("verFicha").innerHTML = ICONOS.ver + "<span>Ver ficha</span>";
  $("verFicha").onclick = ver;

  function imprimir() {
    ahora();
    if (!ficha || !lista.length) return;
    // Solo las fichas del alumnado (todas): el solucionario nunca va al papel.
    const ps = hojas(ficha, { nombres: nombres(), copias: nombres().length || copias(), bn: $("bn").checked });
    $("impresion").replaceChildren(...ps.map((p) => Object.assign(el("div", { className: "pag" }), { innerHTML: p.svg })));
    ctx.guardadas.anotarReciente(ctx.comp.composicion(), ficha.titulo); ctx.lista.pintar();
    ctx.borrador.descartar();   // ya está en Recientes (sin nombres)
    const t = document.title; document.title = ficha.titulo;
    document.fonts.ready.then(() => { window.print(); document.title = t; });
  }
  $("imprimir").innerHTML = ICONOS.imprimir + "<span>Imprimir</span>";
  $("imprimir").onclick = imprimir;

  function otraVariante() { ctx.semilla++; pintarYa(); avisar("Otra variante: los mismos ejercicios con otros datos."); }

  return { pintar, ahora, nombres, copias, imprimir, otraVariante, ver, get ficha() { return ahora(); }, get hojas() { ahora(); return lista.length; } };
}
