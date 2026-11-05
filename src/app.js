// Charta · app. 4.1: selector y opciones · 4.2: compositor · 4.3: alumnos y variantes · 4.4: favoritas y recientes · 4.5: PWA y tableta.
import { CATALOGO } from "./nucleo/catalogo.js";
import { generar, porDefecto, modelo } from "./nucleo/ficha.js";
import { erroresFicha, letraVariante, paginasVariante } from "./nucleo/lector.js";
import { listaTipos } from "./tipos/index.js";
import { hoja, hojas, PALETA } from "./render/hoja.js";
import { hayTipo } from "./nucleo/tipos.js";
import { miniatura } from "./ui/navegacion.js";
import { abrirSelector } from "./ui/selector.js";
import { crearGuardadas } from "./ui/guardadas.js";
import { leerAlumnos, numVariantes, MAX_ALUMNOS } from "./ui/alumnos.js";
import { registrarSW } from "./pwa/registro.js";

globalThis.Charta = { generar, modelo, erroresFicha, listaTipos, hojas, CATALOGO };

const $ = (id) => document.getElementById(id);
function el(tag, props = {}, ...hijos) { const e = Object.assign(document.createElement(tag), props); e.append(...hijos); return e; }

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

function iniciar() {
  let semilla = 1, ficha = null, paginas = [];
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
  function mover(i, d) { [editores[i], editores[i + d]] = [editores[i + d], editores[i]]; recolocar(); pintar(); }
  function quitar(i) { editores.splice(i, 1); recolocar(); pintar(); }
  function cambiado(e) { if (editores[0] === e) guardarUltimo(e.id); pintar(); }
  function nuevoEditor(id) { editores.push(editorActividad(id, { tamano, alCambiar: cambiado })); recolocar(); }

  function pintar() {
    $("error").hidden = true;
    queueMicrotask(() => marcarFavorito());
    try {
      contar();
      const ns = nombres(), total = ns.length || copias();
      ficha = generar({
        actividades: editores.map((e) => e.leer()),
        titulo: $("titulo").value.trim() || undefined,
        variantes: numVariantes($("variaciones").value, total),
        presentacion: { color: !$("bn").checked },
      }, semilla);
      const bn = $("bn").checked;
      paginas = hojas(ficha, { nombres: ns, copias: total, bn });
      const etiqueta = (p) => (p.nombre || "Sin nombre") + (ficha.variantes > 1 ? ` · variante ${letraVariante(p.variante)}` : "");
      $("hojas").replaceChildren(...paginas.map((p) => el("div", {}, el("p", { className: "hoja-etq", textContent: etiqueta(p) }),
        Object.assign(el("div", { className: "hoja" }), { innerHTML: p.svg }))));
      // Solucionario: una hoja resuelta por variante (sin nombres).
      const sol = Array.from({ length: ficha.variantes }, (_, v) => ({ svg: hoja(paginasVariante(ficha, v)[0], { titulo: ficha.titulo, bn, modo: "solucion", uid: `s${v}` }) }));
      $("hojasSol").replaceChildren(...sol.map((p, v) => el("div", {}, el("p", { className: "hoja-etq", textContent: ficha.variantes > 1 ? `Variante ${letraVariante(v)}` : "Soluciones" }),
        Object.assign(el("div", { className: "hoja" }), { innerHTML: p.svg }))));
      $("info").textContent = `${paginas.length} página${paginas.length > 1 ? "s" : ""}` +
        (ficha.variantes > 1 ? ` · variantes ${letraVariante(0)}–${letraVariante(ficha.variantes - 1)}` : "") + ` · ${ficha.titulo}`;
    } catch (e) { $("error").textContent = e.message; $("error").hidden = false; }
  }

  $("anadir").onclick = () => abrirSelector({ tamano: "media", actual: editores[0].id,
    alElegir: (id) => { nuevoEditor(id); pintar(); } });
  $("acts").addEventListener("change", pintar);
  for (const id of ["alumnos", "copias", "variaciones", "bn", "titulo"]) $(id).addEventListener("change", pintar);
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
    variaciones: $("variaciones").value, bn: $("bn").checked });
  function marcarFavorito() {
    try { const f = guardadas.esFavorito(composicion()); $("favorito").textContent = f ? "★ Favorita" : "☆ Favorita"; $("favorito").classList.toggle("on", f); } catch {}
  }
  function abrirGuardada(c) {
    editores.length = 0;
    for (const a of c.actividades) { const e = editorActividad(a.tipo, { tamano, alCambiar: cambiado }); editores.push(e); }
    recolocar();
    c.actividades.forEach((a, i) => editores[i].poner(a.tipo, a.params));
    semilla = c.semilla || 1; $("titulo").value = c.titulo || ""; $("variaciones").value = c.variaciones || "iguales"; $("bn").checked = !!c.bn;
    pintar(); $("acts").scrollIntoView({ behavior: "smooth" });
  }
  function pintarGuardadas() {
    const fav = guardadas.favoritos(), rec = guardadas.recientes();
    $("guardadas").hidden = !fav.length && !rec.length;
    if (!fav.length && pestana === "favoritos") pestana = "recientes";
    if (!rec.length && pestana === "recientes") pestana = "favoritos";
    $("pFav").classList.toggle("activa", pestana === "favoritos"); $("pRec").classList.toggle("activa", pestana === "recientes");
    $("pFav").textContent = `★ Favoritas (${fav.length})`; $("pRec").textContent = `Recientes (${rec.length})`;
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
  pintarGuardadas();
  const ultimo = leerUltimo();
  nuevoEditor(ultimo || listaTipos()[0]); pintar();
  // Primera vez: se empieza eligiendo la actividad (curso → materia → contenido → modelo).
  if (!ultimo) abrirSelector({ tamano: "completa", alElegir: (n) => { editores[0].poner(n); guardarUltimo(n); pintar(); } });
}

if (typeof document !== "undefined") {
  iniciar();
  // Paso 4.5 · sin conexión. Si llega una versión nueva, se avisa (no se recarga solo: se perdería lo escrito).
  registrarSW(() => { $("aviso").hidden = false; $("recargar").onclick = () => location.reload(); });
}
