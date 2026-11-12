// Charta · app. 4.8: pantalla de inicio · 4.1: selector y opciones · 4.2: compositor · 4.3: alumnos y variantes · 4.4: favoritas y recientes · 4.5: PWA y tableta · 5.1: nube · 5.2: Tabula · 5.3: Fori.
import { CATALOGO } from "./nucleo/catalogo.js";
import { generar, porDefecto, modelo, metadatosDe, rangosDe, cursoDe, visible, MAX_PAGINAS } from "./nucleo/ficha.js";
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
import { miniaturaDeSvg, dejarParaTabula } from "./ui/miniatura_ficha.js";
import { VOCALES, CLAVE_LETRAS, CLAVE_OBLIGATORIAS, hayLengua1, conLetras, letrasDe, obligatoriasDe, vistasDe, resumenLetras, CLAVE_FRASES, hayFrases, conFrases, frasesDe, resumenFrases } from "./ui/letras.js";
import { cuentasDe, agrupar, paginaDe, inicioDe } from "./ui/paginas.js";
import { ABECEDARIO } from "./lengua/reglas.js";
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
function editorActividad(id, { tamano, alCambiar, curso = null }) {
  const caja = el("div", { className: "act" });
  const ops = el("div", { className: "ops" });
  const mini = el("div", { className: "mini" }), nombre = el("strong"), desc = el("small");
  const cambiar = el("button", { textContent: "Cambiar" });
  const elegido = el("div", { className: "elegido" }, mini, el("div", { className: "elegido-txt" }, nombre, desc), cambiar);
  const etq = el("span"), herr = el("div", { className: "act-herr" });
  const cab = el("div", { className: "act-cab" }, etq, herr);
  caja.append(cab, elegido, ops);
  // Al cambiar «Números», se vuelven a pintar las opciones si alguna depende del rango (`rmin`, 2.º).
  ops.addEventListener("change", (ev) => {
    const m = modelo(ed.id);
    if (ev.target.dataset.op === "rango" && m.opciones.some((o) => o.rmin || o.rmax || o.valores?.some((v) => v.rmin || v.rmax))) ed.refrescar();
  });
  const ed = { caja, id, leer, poner, refrescar: () => pintarOpciones(leer().params),
    /** El compositor pone el número y los botones (subir, bajar, quitar). */
    cabecera(num, botones) { etq.textContent = `Actividad ${num}`; herr.replaceChildren(...botones); } };

  // curso: el elegido en el selector (MATES_2.md: un modelo en varios cursos, cada uno con sus rangos).
  function poner(nuevo, params, curso) {
    ed.id = nuevo; ed.curso = cursoDe(nuevo, { curso, rango: params?.rango, params });
    const m = modelo(nuevo), [fondo, borde] = PALETA[m.color] ?? PALETA.verde;
    nombre.textContent = m.nombre; desc.textContent = m.descripcion;
    mini.style.background = fondo; mini.style.borderColor = borde;
    try { mini.innerHTML = miniatura(nuevo); } catch { mini.textContent = ""; }
    pintarOpciones(params);
  }
  cambiar.onclick = () => abrirSelector({ actual: ed.id, curso: ed.curso, tamano: tamano(), alElegir: (n, c) => { poner(n, undefined, c); alCambiar(ed); } });

  // prev: valores que ya había (se conservan al pasar de página completa a media y al revés).
  function pintarOpciones(prev = {}) {
    const m = modelo(ed.id), rgs = rangosDe(m.id, ed.curso), def = { ...porDefecto(m.id, ed.curso), ...prev }, t = tamano();
    if (!rgs.includes(def.rango)) def.rango = porDefecto(m.id, ed.curso).rango;
    ops.replaceChildren();
    const campo = (etq, control) => ops.append(el("label", {}, etq, control));
    if (rgs.length > 1) {
      const s = el("select"); s.dataset.op = "rango";
      for (const r of rgs) s.add(new Option(`Hasta el ${r}`, r, false, r === def.rango));
      campo("Números", s);
    }
    for (const o of m.opciones) {
      if (!visible(o, def.rango, ed.curso)) continue;   // 2.º: opciones solo con tres cifras
      let c;
      if (o.tipo === "opcion") {
        c = el("select");
        o.valores.forEach((v, i) => {
          if (!visible(v, def.rango, ed.curso)) return;
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
    return { tipo: ed.id, params: p, ...(ed.curso !== m.curso && { curso: ed.curso }) };
  }
  poner(id, undefined, curso);
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

  // Compositor (paso 4.2): añadir, ordenar y quitar actividades (1 o 2 por hoja) y páginas (las actividades se numeran seguidas).
  // editores = todas las actividades seguidas; cuentas = cuántas lleva cada página ([2, 1, 1]).
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
    if (materia1 !== null) elegirFuente(fuenteMateria(editores[0].id));
    materia1 = m;
  }
  function cambiado(e) { if (editores[0] === e) { guardarUltimo(e.id); usos.anotar(e.id); letraMateria(); } pintar(); }
  function crearEditor(id, curso) { let ed = null; ed = editorActividad(id, { tamano: () => (ed ? tamanoDe(ed) : "completa"), alCambiar: cambiado, curso }); return ed; }
  function nuevoEditor(id, curso) { editores.push(crearEditor(id, curso)); cuentas = [editores.length]; recolocar(); }

  // Mapa de letras (Lengua de 1.º): marcadas = pueden salir. Se recuerdan las últimas (las que lleva la clase).
  const marcadas = new Set(ABECEDARIO);
  try { const g = localStorage.getItem(CLAVE_LETRAS); if (g !== null) { marcadas.clear(); for (const l of g) if (ABECEDARIO.includes(l)) marcadas.add(l); } } catch {}
  // Obligatorias (pulsación larga): todas las palabras y frases llevan al menos una. Siempre están también marcadas.
  const obligatorias = new Set();
  try { for (const l of localStorage.getItem(CLAVE_OBLIGATORIAS) || "") if (ABECEDARIO.includes(l)) { obligatorias.add(l); marcadas.add(l); } } catch {}
  const teclas = ABECEDARIO.map((l) => {
    const b = el("button", { type: "button", textContent: l, className: VOCALES.includes(l) ? "vocal" : "" });
    let reloj = null, larga = false;
    const parar = () => { clearTimeout(reloj); reloj = null; };
    b.addEventListener("pointerdown", () => {
      larga = false; parar();
      reloj = setTimeout(() => {
        reloj = null; larga = true;
        if (obligatorias.has(l)) obligatorias.delete(l); else { obligatorias.add(l); marcadas.add(l); }
        try { navigator.vibrate?.(30); } catch {}
        cambiarLetras();
      }, 500);
    });
    for (const ev of ["pointerup", "pointerleave", "pointercancel"]) b.addEventListener(ev, parar);
    b.addEventListener("contextmenu", (e) => e.preventDefault());   // en Android, la pulsación larga abre el menú
    b.onclick = () => {
      if (larga) { larga = false; return; }   // la pulsación larga ya ha hecho su cambio
      if (obligatorias.has(l)) obligatorias.delete(l);   // tocar una obligatoria la deja solo marcada
      else if (marcadas.has(l)) marcadas.delete(l); else marcadas.add(l);
      cambiarLetras();
    };
    return b;
  });
  $("mapaLetras").replaceChildren(...teclas);
  function pintarLetras() {
    teclas.forEach((b, i) => {
      const l = ABECEDARIO[i], on = marcadas.has(l), ob = obligatorias.has(l);
      b.setAttribute("aria-pressed", on); b.classList.toggle("obligatoria", ob);
      b.title = ob ? "Obligatoria: todas las palabras la llevan (toca para que solo pueda salir)" : on ? "Puede salir (toca para quitarla; mantén pulsada para hacerla obligatoria)" : "No sale (toca para ponerla)";
    });
    $("letrasCuenta").textContent = resumenLetras(marcadas, obligatorias);
  }
  function cambiarLetras(guardar = true) {
    for (const l of [...obligatorias]) if (!marcadas.has(l)) obligatorias.delete(l);   // una letra que no sale no puede ser obligatoria
    if (guardar) try { localStorage.setItem(CLAVE_LETRAS, ABECEDARIO.filter((l) => marcadas.has(l)).join("")); localStorage.setItem(CLAVE_OBLIGATORIAS, ABECEDARIO.filter((l) => obligatorias.has(l)).join("")); } catch {}
    pintarLetras(); pintar();
  }
  const atajo = (id, ls) => { $(id).onclick = () => { marcadas.clear(); for (const l of ls) marcadas.add(l); cambiarLetras(); }; };
  atajo("letrasTodas", ABECEDARIO); atajo("letrasVocales", VOCALES); atajo("letrasNinguna", "");
  pintarLetras();
  // «Mis frases»: las de la clase se recuerdan en el dispositivo; viajan en la composición (params.misFrases).
  try { $("misFrases").value = localStorage.getItem(CLAVE_FRASES) || ""; } catch {}
  const misFrases = () => resumenFrases($("misFrases").value, null).frases;
  function pintarMisFrases() {
    const r = resumenFrases($("misFrases").value, vistasDe(marcadas));
    $("misFrasesCuenta").textContent = r.cuenta ? `(${r.cuenta})` : ""; $("misFrasesInfo").textContent = r.info; $("misFrasesInfo").hidden = !r.info;
  }
  $("misFrases").addEventListener("change", () => { try { localStorage.setItem(CLAVE_FRASES, $("misFrases").value); } catch {} pintar(); });
  $("misFrases").addEventListener("input", pintarMisFrases);
  const actividades = () => conFrases(conLetras(editores.map((e) => e.leer()), vistasDe(marcadas), ABECEDARIO.filter((l) => obligatorias.has(l)).join("")), misFrases());

  function pintar() {
    $("error").hidden = true;
    queueMicrotask(() => marcarFavorito());
    try {
      contar();
      const ns = nombres(), total = ns.length || copias();
      const leidas = editores.map((e) => e.leer());
      $("secLetras").hidden = !hayLengua1(leidas); $("cajaMisFrases").hidden = !hayFrases(leidas);
      pintarMisFrases();
      const acts = actividades(), pags = agrupar(acts, cuentas);
      ficha = generar({
        paginas: pags,
        metadatos: metadatosDe(pags.map((p) => p.actividades.map((a) => a.tipo))),
        titulo: $("titulo").value.trim() || undefined,
        variantes: numVariantes($("variaciones").value, total),
        presentacion: { color: !$("bn").checked, ...($("fuente").value !== "andika" && { fuente: $("fuente").value }), ...($("grande").checked && { letraGrande: true }), ...($("facil").checked && { lecturaFacil: true }) },
      }, semilla);
      const bn = $("bn").checked;
      paginas = hojas(ficha, { nombres: ns, copias: total, bn });
      const etiqueta = (p) => (p.nombre || "Sin nombre") + (ficha.variantes > 1 ? ` · variante ${letraVariante(p.variante)}` : "") + (p.total > 1 ? ` · página ${p.pagina + 1} de ${p.total}` : "");
      $("hojas").replaceChildren(...paginas.map((p) => el("div", {}, el("p", { className: "hoja-etq", textContent: etiqueta(p) }),
        Object.assign(el("div", { className: "hoja" }), { innerHTML: p.svg }))));
      // Solucionario: una hoja resuelta por variante (sin nombres).
      const sol = Array.from({ length: ficha.variantes }, (_, v) => paginasVariante(ficha, v).map((pag, k, ps) => ({ v, k, total: ps.length,
        svg: hoja(pag, { titulo: ficha.titulo, bn, modo: "solucion", uid: k ? `s${v}p${k}` : `s${v}`, ...estiloLectura(ficha) }) }))).flat();
      $("hojasSol").replaceChildren(...sol.map((p) => el("div", {}, el("p", { className: "hoja-etq",
        textContent: (ficha.variantes > 1 ? `Variante ${letraVariante(p.v)}` : "Soluciones") + (p.total > 1 ? ` · página ${p.k + 1} de ${p.total}` : "") }),
        Object.assign(el("div", { className: "hoja" }), { innerHTML: p.svg }))));
      $("info").textContent = `${paginas.length} página${paginas.length > 1 ? "s" : ""}` +
        (ficha.variantes > 1 ? ` · variantes ${letraVariante(0)}–${letraVariante(ficha.variantes - 1)}` : "") + ` · ${ficha.titulo}`;
    } catch (e) { $("error").textContent = e.message; $("error").hidden = false; }
  }

  $("anadirPagina").onclick = () => { const u = editores[editores.length - 1]; abrirSelector({ tamano: "completa", actual: u.id, curso: u.curso,
    alElegir: (id, c) => { editores.push(crearEditor(id, c)); cuentas.push(1); recolocar(); pintar(); $("acts").lastElementChild?.scrollIntoView({ behavior: "smooth" }); } }); };
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
  const composicion = () => ({ actividades: (() => { try { return actividades(); } catch { return editores.map((e) => e.leer()); } })(), ...(cuentas.length > 1 && { paginas: [...cuentas] }), semilla, titulo: $("titulo").value.trim(),
    variaciones: $("variaciones").value, bn: $("bn").checked, grande: $("grande").checked, facil: $("facil").checked, fuente: $("fuente").value });
  function marcarFavorito() {
    try { const f = guardadas.esFavorito(composicion()); $("favorito").textContent = f ? "★ Favorita" : "☆ Favorita"; $("favorito").classList.toggle("on", f); } catch {}
  }
  function abrirGuardada(c) {
    aDiseno();
    editores.length = 0; cuentas = cuentasDe(c);
    for (const a of c.actividades) editores.push(crearEditor(a.tipo));
    recolocar();
    c.actividades.forEach((a, i) => editores[i].poner(a.tipo, a.params, a.curso));
    semilla = c.semilla || 1; $("titulo").value = c.titulo || ""; $("variaciones").value = c.variaciones || "iguales"; $("bn").checked = !!c.bn; $("grande").checked = !!c.grande; $("facil").checked = !!c.facil;
    if (!c.fuente || fuentePorId(c.fuente).id === c.fuente) elegirFuente(c.fuente || "andika");
    else { elegirFuente("andika"); $("infoFuente").textContent = `Esta ficha usaba la letra «${c.fuente.replace("usuario:", "")}», que no está en este dispositivo: se usa Andika. Puedes subirla otra vez.`; }
    materia1 = materiaDe(editores[0].id);
    if (hayLengua1(c.actividades)) { const v = letrasDe(c); marcadas.clear(); for (const l of v ?? ABECEDARIO) marcadas.add(l); obligatorias.clear(); for (const l of obligatoriasDe(c) ?? "") obligatorias.add(l); pintarLetras(); }   // sin guardarlas como las de la clase
    if (hayFrases(c.actividades)) $("misFrases").value = frasesDe(c).join("\n");   // ídem con «Mis frases»
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
    for (const g of grupos) $("grupoTabula").add(new Option(`${g.nombre} (${g.alumnos.length})`, g.id));
    if (entrada.grupo && grupos.some((g) => g.id === entrada.grupo)) { $("grupoTabula").value = entrada.grupo; $("grupoTabula").onchange(); }
  }).catch(() => {});
  $("aTabula").onclick = async () => {
    if (!ficha) return;
    avisoNube("");
    let id = null;
    // Con sesión, se guarda en la nube y Tabula la referencia por id (también la verá Fori); sin sesión, va la composición.
    // Si la nube falla, se envía igual (con la composición): Tabula no depende de la nube.
    if (nube.estado().estado === "dentro") try { if (!enNube) await leerNube(); id = (await nube.guardar(ficha, composicion())).id || null; } catch (e) { console.warn("Nube:", e.message); id = null; }
    // Miniatura de la hoja 1 SIN nombre (Tabula la recoge de localStorage; si falla, el documento sale sin imagen).
    try {
      const m = await miniaturaDeSvg(hoja(paginasVariante(ficha, 0)[0], { titulo: ficha.titulo, bn: $("bn").checked, uid: "mt", ...estiloLectura(ficha) }));
      dejarParaTabula(ficha.titulo, m);
    } catch {}
    const md = ficha.metadatos || {};
    location.href = urlVolver({ id, titulo: ficha.titulo, tipos: editores.map((e) => e.id), comp: composicion(),
      variantes: ficha.variantes, minutos: md.minutos, dificultad: md.dificultad, etiquetas: md.etiquetas,
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
  function nuevaFicha(id, curso) {
    if (!id || !hayTipo(id)) return;
    editores.splice(1); cuentas = [1]; recolocar();
    editores[0].poner(id, undefined, curso);
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
