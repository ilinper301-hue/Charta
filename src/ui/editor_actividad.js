// Charta · editor de una actividad (fase 2 de PLAN-DISENO; antes en app.js): modelo elegido (con el selector) + sus opciones (desde MODELOS).
import { modelo, porDefecto, rangosDe, cursoDe, visible } from "../nucleo/ficha.js";
import { PALETA } from "../render/hoja.js";
import { miniatura } from "./navegacion.js";
import { abrirSelector } from "./selector.js";
import { abrirMenu, ICONOS } from "./piezas.js";
import { el } from "./dom.js";

/** Editor de una actividad: modelo elegido (con el selector) + sus opciones (desde MODELOS). */
export function editorActividad(id, { tamano, alCambiar, curso = null }) {
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
    /** El compositor pone el número y las acciones del «⋯» (fase 4: Subir, Bajar, Quitar). */
    cabecera(num, items) {
      etq.textContent = `Actividad ${num}`;
      if (!items.length) { herr.replaceChildren(); return; }
      const b = el("button", { className: "fantasma icono", title: `Más opciones de la actividad ${num}`, innerHTML: ICONOS.mas });
      b.setAttribute("aria-label", `Más opciones de la actividad ${num}`); b.setAttribute("aria-haspopup", "menu"); b.setAttribute("aria-expanded", "false");
      b.onclick = () => abrirMenu(b, items);
      herr.replaceChildren(b);
    } };

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
