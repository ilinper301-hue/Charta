// Charta · app. 4.1: selector curso → materia → bloque → modelo y opciones · 4.2: compositor (añadir, ordenar, quitar).
import { CATALOGO } from "./nucleo/catalogo.js";
import { generar, porDefecto, modelo } from "./nucleo/ficha.js";
import { erroresFicha, letraVariante, paginasVariante } from "./nucleo/lector.js";
import { listaTipos } from "./tipos/index.js";
import { hoja, hojas, PALETA } from "./render/hoja.js";
import { hayTipo } from "./nucleo/tipos.js";
import { miniatura } from "./ui/navegacion.js";
import { abrirSelector } from "./ui/selector.js";

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

  function poner(nuevo) {
    ed.id = nuevo;
    const m = modelo(nuevo), [fondo, borde] = PALETA[m.color] ?? PALETA.verde;
    nombre.textContent = m.nombre; desc.textContent = m.descripcion;
    mini.style.background = fondo; mini.style.borderColor = borde;
    try { mini.innerHTML = miniatura(nuevo); } catch { mini.textContent = ""; }
    pintarOpciones();
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
  const nombres = () => $("alumnos").value.split("\n").map((s) => s.trim()).filter(Boolean);

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
    try {
      const ns = nombres(), distintas = $("variaciones").value === "distintas";
      ficha = generar({
        actividades: editores.map((e) => e.leer()),
        titulo: $("titulo").value.trim() || undefined,
        variantes: distintas ? Math.max(1, Math.min(30, ns.length)) : 1,
        presentacion: { color: !$("bn").checked },
      }, semilla);
      const bn = $("bn").checked;
      paginas = hojas(ficha, { nombres: ns, bn });
      const etiqueta = (p) => (p.nombre || "Sin nombre") + (ficha.variantes > 1 ? ` · variante ${letraVariante(p.variante)}` : "");
      $("hojas").replaceChildren(...paginas.map((p) => el("div", {}, el("p", { className: "hoja-etq", textContent: etiqueta(p) }),
        Object.assign(el("div", { className: "hoja" }), { innerHTML: p.svg }))));
      // Solucionario: una hoja resuelta por variante (sin nombres).
      const sol = Array.from({ length: ficha.variantes }, (_, v) => ({ svg: hoja(paginasVariante(ficha, v)[0], { titulo: ficha.titulo, bn, modo: "solucion", uid: `s${v}` }) }));
      $("hojasSol").replaceChildren(...sol.map((p, v) => el("div", {}, el("p", { className: "hoja-etq", textContent: ficha.variantes > 1 ? `Variante ${letraVariante(v)}` : "Soluciones" }),
        Object.assign(el("div", { className: "hoja" }), { innerHTML: p.svg }))));
      $("info").textContent = `${paginas.length} página${paginas.length > 1 ? "s" : ""} · ${ficha.titulo}`;
    } catch (e) { $("error").textContent = e.message; $("error").hidden = false; }
  }

  $("anadir").onclick = () => abrirSelector({ tamano: "media", actual: editores[0].id,
    alElegir: (id) => { nuevoEditor(id); pintar(); } });
  $("acts").addEventListener("change", pintar);
  for (const id of ["alumnos", "variaciones", "bn", "titulo"]) $(id).addEventListener("change", pintar);
  $("irPrevia").onclick = () => $("previa").scrollIntoView({ behavior: "smooth" });
  $("variante").onclick = () => { semilla++; pintar(); };
  $("versol").onclick = () => { const s = $("soluciones"); s.hidden = !s.hidden; $("versol").textContent = s.hidden ? "Ver soluciones" : "Ocultar soluciones"; };
  $("imprimir").onclick = () => {
    if (!paginas.length) return;
    // Solo las fichas del alumnado: el solucionario nunca va al papel.
    $("impresion").replaceChildren(...paginas.map((p) => Object.assign(el("div", { className: "pag" }), { innerHTML: p.svg })));
    const t = document.title; document.title = ficha.titulo;
    document.fonts.ready.then(() => { window.print(); document.title = t; });
  };
  const ultimo = leerUltimo();
  nuevoEditor(ultimo || listaTipos()[0]); pintar();
  // Primera vez: se empieza eligiendo la actividad (curso → materia → contenido → modelo).
  if (!ultimo) abrirSelector({ tamano: "completa", alElegir: (n) => { editores[0].poner(n); guardarUltimo(n); pintar(); } });
}

if (typeof document !== "undefined") iniciar();
