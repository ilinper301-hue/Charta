// Charta · app (corte vertical de la fase 2: paso 2.4). La interfaz completa llega en la fase 4.
import { CATALOGO } from "./nucleo/catalogo.js";
import { generar, porDefecto, modelo } from "./nucleo/ficha.js";
import { erroresFicha, letraVariante, paginasVariante } from "./nucleo/lector.js";
import { listaTipos } from "./tipos/index.js";
import { hoja, hojas } from "./render/hoja.js";

globalThis.Charta = { generar, modelo, erroresFicha, listaTipos, hojas, CATALOGO };

const $ = (id) => document.getElementById(id);
function el(tag, props = {}, ...hijos) { const e = Object.assign(document.createElement(tag), props); e.append(...hijos); return e; }

/** Editor de una actividad: modelo + opciones (desde MODELOS). */
function editorActividad(num, alQuitar) {
  const caja = el("div", { className: "act" });
  const sel = el("select"), ops = el("div", { className: "ops" });
  const cab = el("div", { className: "act-cab" }, `Actividad ${num}`);
  if (alQuitar) { const b = el("button", { textContent: "Quitar" }); b.onclick = alQuitar; cab.append(b); }
  for (const id of listaTipos()) sel.add(new Option(modelo(id).nombre, id));
  caja.append(cab, el("label", {}, "Modelo", sel), ops);

  function pintarOpciones() {
    const m = modelo(sel.value), def = porDefecto(m.id);
    ops.replaceChildren();
    const campo = (etq, control) => ops.append(el("label", {}, etq, control));
    if (m.rangos.length > 1) {
      const s = el("select"); s.dataset.op = "rango";
      for (const r of m.rangos) s.add(new Option(`Hasta el ${r}`, r, false, r === def.rango));
      campo("Rango", s);
    }
    for (const o of m.opciones) {
      let c;
      if (o.tipo === "opcion") {
        c = el("select");
        o.valores.forEach((v, i) => c.add(new Option(v.etiqueta, i, false, v.valor === def[o.id])));
      } else if (o.tipo === "si_no") {
        c = el("input", { type: "checkbox", checked: !!def[o.id] });
      } else c = el("input", { type: "number", min: o.min, max: o.max, value: def[o.id] ?? "" });
      c.dataset.op = o.id;
      if (o.tipo === "si_no") ops.append(el("label", { className: "check" }, c, " " + o.etiqueta)); else campo(o.etiqueta, c);
    }
  }
  function leer() {
    const m = modelo(sel.value), p = {};
    for (const c of ops.querySelectorAll("[data-op]")) {
      const k = c.dataset.op, o = m.opciones.find((x) => x.id === k);
      if (k === "rango") p.rango = +c.value;
      else if (o.tipo === "opcion") p[k] = o.valores[+c.value].valor;
      else if (o.tipo === "si_no") p[k] = c.checked;
      else p[k] = c.value === "" ? null : +c.value;
    }
    return { tipo: sel.value, params: p };
  }
  sel.addEventListener("change", pintarOpciones);
  pintarOpciones();
  return { caja, leer, sel };
}

function iniciar() {
  let semilla = 1, ficha = null, paginas = [];
  const editores = [];
  const nombres = () => $("alumnos").value.split("\n").map((s) => s.trim()).filter(Boolean);

  function ponerEditores(n) {
    while (editores.length > n) editores.pop().caja.remove();
    while (editores.length < n) {
      const e = editorActividad(editores.length + 1, editores.length ? () => { ponerEditores(1); pintar(); } : null);
      if (editores.length) e.sel.value = editores[0].sel.value, e.sel.dispatchEvent(new Event("change"));
      editores.push(e); $("acts").append(e.caja);
    }
    $("anadir").hidden = n >= 2;
  }

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

  $("anadir").onclick = () => { ponerEditores(2); pintar(); };
  $("acts").addEventListener("change", pintar);
  for (const id of ["alumnos", "variaciones", "bn", "titulo"]) $(id).addEventListener("change", pintar);
  $("variante").onclick = () => { semilla++; pintar(); };
  $("versol").onclick = () => { const s = $("soluciones"); s.hidden = !s.hidden; $("versol").textContent = s.hidden ? "Ver soluciones" : "Ocultar soluciones"; };
  $("imprimir").onclick = () => {
    if (!paginas.length) return;
    // Solo las fichas del alumnado: el solucionario nunca va al papel.
    $("impresion").replaceChildren(...paginas.map((p) => Object.assign(el("div", { className: "pag" }), { innerHTML: p.svg })));
    const t = document.title; document.title = ficha.titulo;
    document.fonts.ready.then(() => { window.print(); document.title = t; });
  };
  ponerEditores(1); pintar();
}

if (typeof document !== "undefined") iniciar();
