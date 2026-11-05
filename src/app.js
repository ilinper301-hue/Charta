// Charta · app. 4.8: pantalla de inicio · 4.1: selector y opciones · 4.2: compositor · 4.3: alumnos y variantes · 4.4: favoritas y recientes · 4.5: PWA y tableta · 5.1: nube · 5.2: Tabula · 5.3: Fori.
import { CATALOGO } from "./nucleo/catalogo.js";
import { generar, porDefecto, modelo, metadatosDe } from "./nucleo/ficha.js";
import { erroresFicha, letraVariante, paginasVariante } from "./nucleo/lector.js";
import { listaTipos } from "./tipos/index.js";
import { hoja, hojas, estiloLectura, PALETA } from "./render/hoja.js";
import { hayTipo } from "./nucleo/tipos.js";
import { miniatura, fuenteMateria, materiaDe, cursos, materias } from "./ui/navegacion.js";
import { abrirSelector } from "./ui/selector.js";
import { crearGuardadas } from "./ui/guardadas.js";
import { saludo, crearUsos, accesosRapidos, ultimaComposicion, materiasDisponibles, fechaCorta } from "./ui/inicio.js";
import { crearInicio } from "./ui/inicio_vista.js";
import { leerAlumnos, numVariantes, MAX_ALUMNOS } from "./ui/alumnos.js";
import { registrarSW } from "./pwa/registro.js";
import { iniciarTema } from "./ui/tema.js";
import { crearNube } from "./nube/nube.js";
import { leerEntrada, leerTabula, gruposDeTabula, urlVolver } from "./ui/tabula.js";
import { paqueteFori, URL_FORI, CLAVE_FORI } from "./fori/diapositivas.js";
import { fuentePorId, registrarFuenteUsuario, quitarFuenteUsuario, todasLasFuentes } from "./render/fuentes.js";
import { validarArchivo, crearAlmacenFuentes, instalarCss, aBase64 } from "./ui/fuentes.js";

globalThis.Charta = { generar, modelo, erroresFicha, listaTipos, hojas, CATALOGO };

const $ = (id) => document.getElementById(id);
function el(tag, props = {}, ...hijos) { const e = Object.assign(document.createElement(tag), props); e.append(...hijos); return e; }

// Paso 5.3 · Fori: caja de cada ejercicio (getBBox en un SVG oculto) y fuentes incrustadas para las diapositivas.
function cajasEjercicios(zona) {
  const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  s.setAttribute("style", "position:absolute;left:-10000px;top:0;width:10px;height:10px;visibility:hidden");
  s.innerHTML = zona.svg; document.body.append(s);
  const out = {};
  for (const g of s.querySelectorAll("g.ej")) { const b = g.getBBox(); out[g.getAttribute("data-ej")] = { x: b.x, y: b.y, w: b.width, h: b.height }; }
  s.remove();
  return out;
}
/** @font-face incrustados (data:) de las letras que usa la ficha: Andika siempre y, si es otra, la elegida. */
const cssFuentes = (usadas = ["Andika"]) => [...document.styleSheets].flatMap((h) => { try { return [...h.cssRules]; } catch { return []; } })
  .filter((r) => r instanceof CSSFontFaceRule && /data:/.test(r.cssText) && usadas.includes(r.style.getPropertyValue("font-family").replace(/["']/g, "").trim())).map((r) => r.cssText).join("");

/** Editor de una actividad: modelo elegido (con el selector) + sus opciones (desde MODELOS). */
function editorActividad(id, { tamano, alCambiar }) {
  const caja = el("div", { className: "act" });
  const ops = el("div", { className: "ops" });
  const mini = el("div", { className: "mini" }), nombre = el("strong"), desc = el("small");
  const cambiar = el("button", { textContent: "Cambiar" });
  const elegido = el("div", { className: "elegido" }, mini, el("div", { className: "elegido-txt" }, nombre, desc), cambiar);
  const etq = el("span"), herr = el("div", { className: "act-herr" });
  const cab = el("div", { className: "act-cab" }, etq, herr);
  caja.append(cab, elegido, ops);
  const ed = { caja, id, leer, poner, refrescar: () => pintarOpciones(leer().params),
    /** El compositor pone el número y los botones (subir, bajar, quitar). */
    cabecera(num, botones) { etq.textContent = `Actividad ${num}`; herr.replaceChildren(...botones); } };

  function poner(nuevo, params) {
    ed.id = nuevo;
    const m = modelo(nuevo), [fondo, borde] = PALETA[m.color] ?? PALETA.verde;
    nombre.textContent = m.nombre; desc.textContent = m.descripcion;
    mini.style.background = fondo; mini.style.borderColor = borde;
    try { mini.innerHTML = miniatura(nuevo); } catch { mini.textContent = ""; }
    pintarOpciones(params);
  }
  cambiar.onclick = () => abrirSelector({ actual: ed.id, tamano: tamano(), alElegir: (n) => { poner(n); alCambiar(ed); } });

  // prev: valores que ya había (se conservan al pasar de página completa a media y al revés).
  function pintarOpciones(prev = {}) {
    const m = modelo(ed.id), def = { ...porDefecto(m.id), ...prev }, t = tamano();
    ops.replaceChildren();
    const campo = (etq, control) => ops.append(el("label", {}, etq, control));
    if (m.rangos.length > 1) {
      const s = el("select"); s.dataset.op = "rango";
      for (const r of m.rangos) s.add(new Option(`Hasta el ${r}`, r, false, r === def.rango));
      campo("Números", s);
    }
    for (const o of m.opciones) {
      let c;
      if (o.tipo === "opcion") {
        c = el("select");
        o.valores.forEach((v, i) => {
          const op = new Option(v.etiqueta, i, false, v.valor === def[o.id]);
          if (v.tamanos && !v.tamanos.includes(t)) { op.disabled = true; op.text += " (solo página completa)"; op.selected = false; }
          c.add(op);
        });
        if (c.selectedOptions[0]?.disabled !== false) c.value = [...c.options].find((x) => !x.disabled)?.value ?? c.value;
      } else if (o.tipo === "si_no") {
        c = el("input", { type: "checkbox", checked: !!def[o.id] });
      } else c = el("input", { type: "number", min: o.min, max: o.max, value: def[o.id] ?? "", placeholder: "Automático", inputMode: "numeric" });
      c.dataset.op = o.id;
      if (o.tipo === "si_no") ops.append(el("label", { className: "check" }, c, " " + o.etiqueta)); else campo(o.etiqueta, c);
    }
  }
  function leer() {
    const m = modelo(ed.id), p = {};
    for (const c of ops.querySelectorAll("[data-op]")) {
      const k = c.dataset.op, o = m.opciones.find((x) => x.id === k);
      if (k === "rango") p.rango = +c.value;
      else if (o.tipo === "opcion") p[k] = o.valores[+c.value].valor;
      else if (o.tipo === "si_no") p[k] = c.checked;
      else p[k] = c.value === "" ? null : +c.value;
    }
    return { tipo: ed.id, params: p };
  }
  poner(id);
  return ed;
}

const ULTIMO = "charta:ultimoModelo";
function guardarUltimo(id) { try { localStorage.setItem(ULTIMO, id); } catch {} }
function leerUltimo() { try { const id = localStorage.getItem(ULTIMO); return id && hayTipo(id) ? id : null; } catch { return null; } }

const BN_DEFECTO = "charta:bnDefecto";
const bnDefecto = () => { try { return localStorage.getItem(BN_DEFECTO) === "1"; } catch { return false; } };

function iniciar() {
  let semilla = 1, ficha = null, paginas = [];
  let vista = "diseno", inicioVista = null, pusheado = false;   // 4.8: "inicio" | "diseno"
  const editores = [];
  const nombres = () => leerAlumnos($("alumnos").value).slice(0, MAX_ALUMNOS);
  const copias = () => Math.max(1, Math.min(MAX_ALUMNOS, parseInt($("copias").value, 10) || 1));
  function contar() {
    const todos = leerAlumnos($("alumnos").value), n = Math.min(todos.length, MAX_ALUMNOS);
    $("filaCopias").hidden = n > 0;
    $("cuenta").textContent = !n ? "Sin alumnos: la ficha sale con la línea del nombre en blanco."
      : `${n} alumno${n > 1 ? "s" : ""}: una ficha con su nombre para cada uno.` + (todos.length > MAX_ALUMNOS ? ` (máximo ${MAX_ALUMNOS}; sobran ${todos.length - MAX_ALUMNOS})` : "");
  }

  const tamano = () => (editores.length > 1 ? "media" : "completa");
  // Compositor (paso 4.2): añadir, ordenar y quitar actividades (1 o 2 por hoja).
  const boton = (texto, titulo, f) => { const b = el("button", { textContent: texto, title: titulo }); b.onclick = f; return b; };
  function recolocar() {
    $("acts").replaceChildren(...editores.map((e) => e.caja));
    editores.forEach((e, i) => e.cabecera(i + 1, [
      ...(editores.length > 1 ? [i ? boton("↑ Subir", "Pasarla a actividad 1", () => mover(i, -1)) : boton("↓ Bajar", "Pasarla a actividad 2", () => mover(i, 1))] : []),
      ...(editores.length > 1 ? [boton("Quitar", "Quitar esta actividad", () => quitar(i))] : []),
    ]));
    $("anadir").hidden = editores.length >= 2;
    for (const e of editores) e.refrescar();
  }
  function mover(i, d) { [editores[i], editores[i + d]] = [editores[i + d], editores[i]]; recolocar(); letraMateria(); pintar(); }
  function quitar(i) { editores.splice(i, 1); recolocar(); letraMateria(); pintar(); }
  // Letra por materia: si la actividad 1 pasa a otra materia, se pone la letra de esa materia (Lengua → Fredoka).
  let materia1 = null;
  function letraMateria() {
    const m = materiaDe(editores[0]?.id); if (m === materia1) return;
    if (materia1 !== null) elegirFuente(fuenteMateria(editores[0].id));
    materia1 = m;
  }
  function cambiado(e) { if (editores[0] === e) { guardarUltimo(e.id); usos.anotar(e.id); letraMateria(); } pintar(); }
  function nuevoEditor(id) { editores.push(editorActividad(id, { tamano, alCambiar: cambiado })); recolocar(); }

  function pintar() {
    $("error").hidden = true;
    queueMicrotask(() => marcarFavorito());
    try {
      contar();
      const ns = nombres(), total = ns.length || copias();
      const acts = editores.map((e) => e.leer());
      ficha = generar({
        actividades: acts,
        metadatos: metadatosDe(acts.map((a) => a.tipo)),
        titulo: $("titulo").value.trim() || undefined,
        variantes: numVariantes($("variaciones").value, total),
        presentacion: { color: !$("bn").checked, ...($("fuente").value !== "andika" && { fuente: $("fuente").value }), ...($("grande").checked && { letraGrande: true }), ...($("facil").checked && { lecturaFacil: true }) },
      }, semilla);
      const bn = $("bn").checked;
      paginas = hojas(ficha, { nombres: ns, copias: total, bn });
      const etiqueta = (p) => (p.nombre || "Sin nombre") + (ficha.variantes > 1 ? ` · variante ${letraVariante(p.variante)}` : "");
      $("hojas").replaceChildren(...paginas.map((p) => el("div", {}, el("p", { className: "hoja-etq", textContent: etiqueta(p) }),
        Object.assign(el("div", { className: "hoja" }), { innerHTML: p.svg }))));
      // Solucionario: una hoja resuelta por variante (sin nombres).
      const sol = Array.from({ length: ficha.variantes }, (_, v) => ({ svg: hoja(paginasVariante(ficha, v)[0], { titulo: ficha.titulo, bn, modo: "solucion", uid: `s${v}`, ...estiloLectura(ficha) }) }));
      $("hojasSol").replaceChildren(...sol.map((p, v) => el("div", {}, el("p", { className: "hoja-etq", textContent: ficha.variantes > 1 ? `Variante ${letraVariante(v)}` : "Soluciones" }),
        Object.assign(el("div", { className: "hoja" }), { innerHTML: p.svg }))));
      $("info").textContent = `${paginas.length} página${paginas.length > 1 ? "s" : ""}` +
        (ficha.variantes > 1 ? ` · variantes ${letraVariante(0)}–${letraVariante(ficha.variantes - 1)}` : "") + ` · ${ficha.titulo}`;
    } catch (e) { $("error").textContent = e.message; $("error").hidden = false; }
  }

  $("anadir").onclick = () => abrirSelector({ tamano: "media", actual: editores[0].id,
    alElegir: (id) => { nuevoEditor(id); pintar(); } });
  $("acts").addEventListener("change", pintar);
  for (const id of ["alumnos", "copias", "variaciones", "bn", "grande", "facil", "titulo"]) $(id).addEventListener("change", pintar);

  // Letra de las fichas: Andika, Fredoka y las que suba la maestra (guardadas en este dispositivo).
  const CLAVE_FUENTE = "charta:fuente", INFO_FUENTE = $("infoFuente").textContent;
  const almacenFuentes = (() => { try { return crearAlmacenFuentes(); } catch { return null; } })();
  const NOTAS = { andika: " (la de Matemáticas)", fredoka: " (redondeada)" };
  function elegirFuente(id) {
    const f = fuentePorId(id);
    $("fuente").replaceChildren(...todasLasFuentes().map((x) => el("option", { value: x.id, textContent: x.nombre + (x.usuario ? " (subida)" : NOTAS[x.id] || "") })));
    $("fuente").value = f.id; $("quitarFuente").hidden = !f.usuario; $("infoFuente").textContent = INFO_FUENTE;
    try { localStorage.setItem(CLAVE_FUENTE, f.id); } catch {}
  }
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
  $("alumnos").addEventListener("input", contar);
  $("irPrevia").onclick = () => $("previa").scrollIntoView({ behavior: "smooth" });
  $("variante").onclick = () => { semilla++; pintar(); };
  $("versol").onclick = () => {
    const s = $("soluciones"); s.hidden = !s.hidden; $("versol").textContent = s.hidden ? "Ver soluciones" : "Ocultar soluciones";
    if (!s.hidden) s.scrollIntoView({ behavior: "smooth" });
  };

  // Paso 4.4 · favoritas (con su semilla: sale la misma ficha) y recientes (al imprimir). Sin nombres de alumnos.
  const almacen = (() => { try { return localStorage; } catch { return { getItem: () => null, setItem() {} }; } })();
  const guardadas = crearGuardadas(almacen);
  let pestana = "favoritos";
  const composicion = () => ({ actividades: editores.map((e) => e.leer()), semilla, titulo: $("titulo").value.trim(),
    variaciones: $("variaciones").value, bn: $("bn").checked, grande: $("grande").checked, facil: $("facil").checked, fuente: $("fuente").value });
  function marcarFavorito() {
    try { const f = guardadas.esFavorito(composicion()); $("favorito").textContent = f ? "★ Favorita" : "☆ Favorita"; $("favorito").classList.toggle("on", f); } catch {}
  }
  function abrirGuardada(c) {
    aDiseno();
    editores.length = 0;
    for (const a of c.actividades) { const e = editorActividad(a.tipo, { tamano, alCambiar: cambiado }); editores.push(e); }
    recolocar();
    c.actividades.forEach((a, i) => editores[i].poner(a.tipo, a.params));
    semilla = c.semilla || 1; $("titulo").value = c.titulo || ""; $("variaciones").value = c.variaciones || "iguales"; $("bn").checked = !!c.bn; $("grande").checked = !!c.grande; $("facil").checked = !!c.facil;
    if (!c.fuente || fuentePorId(c.fuente).id === c.fuente) elegirFuente(c.fuente || "andika");
    else { elegirFuente("andika"); $("infoFuente").textContent = `Esta ficha usaba la letra «${c.fuente.replace("usuario:", "")}», que no está en este dispositivo: se usa Andika. Puedes subirla otra vez.`; }
    materia1 = materiaDe(editores[0].id);
    pintar(); $("acts").scrollIntoView({ behavior: "smooth" });
  }
  function pintarGuardadas() {
    const fav = guardadas.favoritos(), rec = guardadas.recientes(), dentro = nube.estado().estado === "dentro";
    const nubeLista = dentro ? enNube || [] : [];
    $("guardadas").hidden = !fav.length && !rec.length && !dentro;
    if (pestana === "nube" && !dentro) pestana = "favoritos";
    if (!fav.length && pestana === "favoritos") pestana = dentro ? "nube" : "recientes";
    if (!rec.length && pestana === "recientes") pestana = fav.length || !dentro ? "favoritos" : "nube";
    $("pFav").classList.toggle("activa", pestana === "favoritos"); $("pRec").classList.toggle("activa", pestana === "recientes");
    $("pNube").classList.toggle("activa", pestana === "nube"); $("pNube").hidden = !dentro;
    $("pFav").textContent = `★ Favoritas (${fav.length})`; $("pRec").textContent = `Recientes (${rec.length})`;
    $("pNube").textContent = enNube ? `☁ En la nube (${nubeLista.length})` : "☁ En la nube";
    if (pestana === "nube") return pintarNube(nubeLista);
    const lista = pestana === "favoritos" ? fav : rec;
    $("listaGuardadas").replaceChildren(...lista.map((c, i) => {
      const disp = c.actividades.every((a) => hayTipo(a.tipo));
      const abrir = el("button", { className: "g-abrir", disabled: !disp },
        el("strong", { textContent: c.nombre || "Ficha" }),
        el("small", { textContent: c.actividades.map((a) => { try { return modelo(a.tipo).nombre; } catch { return a.tipo; } }).join(" + ") + (c.fecha ? " · " + c.fecha.split("-").reverse().map(Number).join("-") : "") }));
      abrir.onclick = () => abrirGuardada(c);
      const x = el("button", { className: "g-quitar", textContent: "✕", title: "Quitar de la lista" });
      x.onclick = () => { guardadas.quitar(pestana, i); pintarGuardadas(); marcarFavorito(); };
      return el("li", {}, abrir, x);
    }));
  }
  // Paso 5.1 · nube: inicio de sesión con Google y fichas en /apps/charta/fichas/{id} (sin nombres de alumnos).
  const nube = crearNube({ almacen });
  let enNube = null; // lista de la nube (null = sin leer)
  const avisoNube = (t, error) => { $("estadoNube").textContent = t || ""; $("estadoNube").classList.toggle("error", !!error); $("estadoNube").hidden = !t; };
  const nombreModelos = (c) => (c?.actividades || []).map((a) => { try { return modelo(a.tipo).nombre; } catch { return a.tipo; } }).join(" + ");
  function pintarNube(lista) {
    if (!enNube) { $("listaGuardadas").replaceChildren(el("li", { className: "info", textContent: "Cargando…" })); return; }
    if (!lista.length) { $("listaGuardadas").replaceChildren(el("li", { className: "info", textContent: "Aún no hay fichas en la nube: usa «☁ Guardar en la nube»." })); return; }
    $("listaGuardadas").replaceChildren(...lista.map((x) => {
      const disp = !!x.composicion && x.composicion.actividades.every((a) => hayTipo(a.tipo));
      const abrir = el("button", { className: "g-abrir", disabled: !disp },
        el("strong", { textContent: x.titulo }),
        el("small", { textContent: nombreModelos(x.composicion) + (x.creada ? " · " + x.creada.slice(0, 10).split("-").reverse().map(Number).join("-") : "") }));
      abrir.onclick = () => abrirGuardada(x.composicion);
      const b = el("button", { className: "g-quitar", textContent: "✕", title: "Borrar de la nube" });
      b.onclick = async () => {
        if (!confirm(`¿Borrar «${x.titulo}» de la nube? Tabula y Fori dejarán de verla.`)) return;
        try { await nube.borrar(x.id); enNube = enNube.filter((y) => y.id !== x.id); pintarGuardadas(); } catch (e) { avisoNube(e.message, true); }
      };
      return el("li", {}, abrir, b);
    }));
  }
  async function leerNube() {
    try { enNube = await nube.listar(); } catch (e) { enNube = enNube || []; avisoNube(e.message, true); }
    pintarGuardadas(); refrescarInicio();
  }
  function pintarCuenta(e) {
    const b = $("cuentaNube");
    b.disabled = e.estado === "cargando";
    b.textContent = e.estado === "dentro" ? "☁ " + (e.usuario.nombre.split(" ")[0] || "Mi cuenta") : e.estado === "cargando" ? "☁ …" : "☁ Entrar";
    b.title = e.estado === "dentro" ? `Sesión de ${e.usuario.correo}. Pulsa para cerrarla.` : "Iniciar sesión con Google para guardar fichas en la nube";
    if (e.error) avisoNube(e.error, true);
  }
  nube.alCambiar((e) => {
    pintarCuenta(e);
    if (e.estado === "dentro" && !enNube) leerNube(); else if (e.estado !== "dentro") enNube = null;
    pintarGuardadas(); refrescarInicio();
  });
  $("cuentaNube").onclick = async () => {
    const e = nube.estado();
    if (e.estado === "dentro") { if (confirm(`¿Cerrar la sesión de ${e.usuario.correo}? Las fichas siguen en la nube.`)) await nube.salir(); return; }
    try { await nube.entrar(); } catch {}
  };
  $("guardarNube").onclick = async () => {
    if (!ficha) return;
    avisoNube("");
    try {
      if (nube.estado().estado !== "dentro") { await nube.entrar(); if (nube.estado().estado !== "dentro") return; }
      if (!enNube) await leerNube();
      const r = await nube.guardar(ficha, composicion());
      avisoNube(r.repetida ? "Esta ficha ya estaba en la nube." : r.pendiente ? "Guardada en este dispositivo; se subirá a la nube cuando haya conexión." : "Guardada en la nube (sin nombres de alumnos).");
      if (!r.repetida && !r.pendiente) enNube = await nube.listar().catch(() => enNube);
      pestana = "nube"; pintarGuardadas();
    } catch (e) { avisoNube(e.message, true); }
  };
  $("pNube").onclick = () => { pestana = "nube"; pintarGuardadas(); if (!enNube) leerNube(); };
  // ?ficha={id}: abrir una ficha de la nube (enlace desde Tabula)
  const idUrl = new URLSearchParams(location.search).get("ficha");
  const aFori = new URLSearchParams(location.search).get("a") === "fori";   // la pide Fori: abrirla y devolvérsela
  if (nube.recordada() || idUrl) nube.iniciar().then(async () => {
    if (!idUrl) return;
    if (nube.estado().estado !== "dentro") { avisoNube("Inicia sesión (☁ Entrar) para abrir la ficha enlazada."); return; }
    try { const x = await nube.abrir(idUrl); if (x.composicion) { abrirGuardada(x.composicion); if (aFori) proyectar(); } } catch (e) { avisoNube(e.message, true); }
  }).catch(() => {});
  $("pFav").onclick = () => { pestana = "favoritos"; pintarGuardadas(); };
  $("pRec").onclick = () => { pestana = "recientes"; pintarGuardadas(); };
  $("favorito").onclick = () => {
    if (!ficha) return;
    pestana = "favoritos"; guardadas.alternarFavorito(composicion(), ficha.titulo); marcarFavorito(); pintarGuardadas();
  };
  $("imprimir").onclick = () => {
    if (!paginas.length) return;
    // Solo las fichas del alumnado: el solucionario nunca va al papel.
    $("impresion").replaceChildren(...paginas.map((p) => Object.assign(el("div", { className: "pag" }), { innerHTML: p.svg })));
    guardadas.anotarReciente(composicion(), ficha.titulo); pintarGuardadas();
    const t = document.title; document.title = ficha.titulo;
    document.fonts.ready.then(() => { window.print(); document.title = t; });
  };
  // Paso 5.2 · Tabula: grupos leídos de su almacén (mismo origen, solo lectura) y vuelta con la ficha por URL.
  const entrada = leerEntrada(location.search, hayTipo);
  let grupos = [];
  $("grupoTabula").onchange = () => {
    const g = grupos.find((x) => x.id === $("grupoTabula").value);
    if (g) { $("alumnos").value = g.alumnos.join("\n"); pintar(); }
  };
  leerTabula().then((t) => {
    grupos = t ? gruposDeTabula(t.groups, t.students) : [];
    $("filaTabula").hidden = !grupos.length;
    $("aTabula").hidden = !grupos.length && !entrada.desdeTabula;
    for (const g of grupos) $("grupoTabula").add(new Option(`${g.nombre} (${g.alumnos.length})`, g.id));
    if (entrada.grupo && grupos.some((g) => g.id === entrada.grupo)) { $("grupoTabula").value = entrada.grupo; $("grupoTabula").onchange(); }
  }).catch(() => { $("aTabula").hidden = !entrada.desdeTabula; });
  $("aTabula").onclick = async () => {
    if (!ficha) return;
    avisoNube("");
    let id = null;
    // Con sesión, se guarda en la nube y Tabula la referencia por id (también la verá Fori); sin sesión, va la composición.
    if (nube.estado().estado === "dentro") try { if (!enNube) await leerNube(); id = (await nube.guardar(ficha, composicion())).id; } catch (e) { avisoNube(e.message, true); return; }
    location.href = urlVolver({ id, titulo: ficha.titulo, tipos: editores.map((e) => e.id), comp: composicion(),
      grupo: $("grupoTabula").value || entrada.grupo, sesion: entrada.sesion, tarea: entrada.tarea });
  };
  // Paso 5.3 · Fori: diapositivas (variante A) por localStorage del mismo origen; Fori las convierte en páginas.
  async function proyectar() {
    if (!ficha) return;
    avisoNube("");
    try {
      await document.fonts.ready;
      const p = paqueteFori(ficha, { cajas: cajasEjercicios, fuentes: cssFuentes(["Andika", fuentePorId(ficha.presentacion?.fuente).nombre]) });
      localStorage.setItem(CLAVE_FORI, JSON.stringify(p));
      location.href = URL_FORI + "?charta=1";
    } catch (e) { avisoNube("No se ha podido preparar la ficha para Fori: " + e.message, true); }
  }
  $("aFori").onclick = proyectar;
  // Paso 4.8 · pantalla de inicio: saludo, Crear ficha, Seguir con la última, accesos rápidos y Mis fichas.
  const usos = crearUsos(almacen);
  const nombreModelo = (id) => { try { return modelo(id).nombre; } catch { return id; } };
  const colorDe = (id) => { try { return modelo(id).color; } catch { return "verde"; } };
  const ultimaDeInicio = () => ultimaComposicion({ recientes: guardadas.recientes(), ultimo: leerUltimo(), hayTipo });
  function estadoInicio() {
    const rec = guardadas.recientes(), fav = guardadas.favoritos(), e = nube.estado(), dentro = e.estado === "dentro", u = ultimaDeInicio();
    let seguir = null;
    if (u?.composicion) {
      const c = u.composicion, t = c.actividades[0].tipo;
      seguir = { nombre: c.nombre || "Ficha", tipo: t, color: colorDe(t),
        detalle: c.actividades.map((a) => nombreModelo(a.tipo)).join(" + ") + (c.fecha ? " · " + fechaCorta(c.fecha) : "") };
    } else if (u?.modelo) seguir = { nombre: nombreModelo(u.modelo), tipo: u.modelo, color: colorDe(u.modelo), detalle: "Último modelo elegido" };
    const rapidos = accesosRapidos({ usos: usos.mapa(), recientes: rec, ultimo: leerUltimo(), hayTipo })
      .map((id) => ({ id, nombre: nombreModelo(id), color: colorDe(id) }));
    return { saludo: saludo(new Date().getHours(), dentro ? e.usuario?.nombre : ""), seguir, rapidos, fav, rec, nube: dentro ? enNube : null, dentro };
  }
  function refrescarInicio() { if (vista === "inicio") inicioVista?.pintar(estadoInicio()); }
  function mostrar(v) {
    vista = v; document.body.dataset.vista = v;
    $("inicio").hidden = v !== "inicio"; document.querySelector("main").hidden = v === "inicio"; $("aInicio").hidden = v === "inicio";
    if (v === "inicio") { inicioVista.cerrarMaterias(); refrescarInicio(); }
    window.scrollTo(0, 0);
  }
  // El botón «Atrás» de Android vuelve al inicio (se apunta una entrada de historial al entrar en el diseño desde el inicio).
  function aDiseno() { if (vista === "diseno") return; history.pushState({ diseno: 1 }, ""); pusheado = true; mostrar("diseno"); }
  function aInicio() { if (vista === "inicio") return; if (pusheado) history.back(); else mostrar("inicio"); }
  addEventListener("popstate", () => { pusheado = !!history.state?.diseno; mostrar(pusheado ? "diseno" : "inicio"); });
  $("aInicio").onclick = aInicio;
  /** «Crear ficha»: una ficha nueva con el modelo elegido (la composición anterior no se toca: sigue en Recientes). */
  function nuevaFicha(id) {
    if (!id || !hayTipo(id)) return;
    editores.splice(1); recolocar();
    editores[0].poner(id);
    semilla = 1; $("titulo").value = ""; $("bn").checked = bnDefecto();
    usos.anotar(id); guardarUltimo(id); letraMateria();
    aDiseno(); pintar();
  }
  inicioVista = crearInicio({
    hayTipo, nombreModelo, colorDe,
    materias: () => materiasDisponibles(cursos, materias),
    crear: (materia) => abrirSelector({ tamano: "completa", ruta: materia ? { materia } : null, alElegir: nuevaFicha }),
    crearModelo: nuevaFicha,
    seguir: () => { const u = ultimaDeInicio(); if (u?.composicion) abrirGuardada(u.composicion); else if (u?.modelo) nuevaFicha(u.modelo); },
    abrir: abrirGuardada,
    leerNube: () => { if (!enNube) leerNube(); },
    fuentes: () => ({ fuentes: todasLasFuentes(), fuente: $("fuente").value }),
    ponerFuente: (id) => { elegirFuente(id); pintar(); },
    bnDefecto,
    ponerBn: (v) => { try { localStorage.setItem(BN_DEFECTO, v ? "1" : "0"); } catch {} $("bn").checked = v; pintar(); },
  });

  pintarGuardadas();
  const ultimo = leerUltimo();
  if (!entrada.comp && !idUrl) $("bn").checked = bnDefecto();
  nuevoEditor(entrada.comp?.actividades[0].tipo || ultimo || listaTipos()[0]); pintar();
  if (entrada.comp) { abrirGuardada(entrada.comp); if (aFori) proyectar(); }
  // Los enlaces directos (?ficha=, ?comp=, ?grupo=, ?desde=tabula…) van al diseño; si no, la app abre en el inicio.
  const directo = !!(idUrl || entrada.comp || entrada.grupo || entrada.desdeTabula || entrada.sesion || entrada.tarea);
  mostrar(directo ? "diseno" : "inicio");
  materia1 ??= materiaDe(editores[0].id);   // al arrancar mandan la letra guardada o la de la composición abierta
}

if (typeof document !== "undefined") {
  iniciarTema($("tema"));
  iniciar();
  // Paso 4.5 · sin conexión. Si llega una versión nueva, se avisa (no se recarga solo: se perdería lo escrito).
  registrarSW(() => { $("aviso").hidden = false; $("recargar").onclick = () => location.reload(); });
}
