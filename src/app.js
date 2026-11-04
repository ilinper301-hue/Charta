// Charta · app (corte vertical de la fase 2). La interfaz completa llega en la fase 4.
import { CATALOGO } from "./nucleo/catalogo.js";
import { generar, porDefecto, modelo } from "./nucleo/ficha.js";
import { erroresFicha } from "./nucleo/lector.js";
import { listaTipos } from "./tipos/index.js";

globalThis.Charta = { generar, erroresFicha, listaTipos, CATALOGO };

function iniciar() {
  const $ = (id) => document.getElementById(id);
  const selModelo = $("modelo"), divOps = $("opciones"), inSemilla = $("semilla");

  for (const id of listaTipos()) selModelo.add(new Option(modelo(id).nombre, id));

  function pintarOpciones() {
    const m = modelo(selModelo.value), def = porDefecto(m.id);
    divOps.replaceChildren();
    const campo = (etq, control) => { const l = document.createElement("label"); l.append(etq, control); divOps.append(l); };
    if (m.rangos.length > 1) {
      const s = document.createElement("select"); s.dataset.op = "rango";
      for (const r of m.rangos) s.add(new Option(`Hasta el ${r}`, r, false, r === def.rango));
      campo("Rango", s);
    }
    for (const o of m.opciones) {
      let c;
      if (o.tipo === "opcion") {
        c = document.createElement("select");
        o.valores.forEach((v, i) => c.add(new Option(v.etiqueta, i, false, v.valor === def[o.id])));
      } else {
        c = document.createElement("input");
        c.type = o.tipo === "si_no" ? "checkbox" : "number";
        if (o.tipo === "si_no") c.checked = !!def[o.id]; else { c.min = o.min; c.max = o.max; c.value = def[o.id] ?? ""; }
      }
      c.dataset.op = o.id; campo(o.etiqueta, c);
    }
  }

  function leerParams() {
    const m = modelo(selModelo.value), p = {};
    for (const c of divOps.querySelectorAll("[data-op]")) {
      const k = c.dataset.op, o = m.opciones.find((x) => x.id === k);
      if (k === "rango") p.rango = +c.value;
      else if (o.tipo === "opcion") p[k] = o.valores[+c.value].valor;
      else if (o.tipo === "si_no") p[k] = c.checked;
      else p[k] = c.value === "" ? null : +c.value;
    }
    return p;
  }

  function pintar() {
    $("error").hidden = true;
    try {
      const f = generar({ actividades: [{ tipo: selModelo.value, params: leerParams() }] }, +inSemilla.value || 1);
      $("titulo").textContent = f.titulo;
      $("soluciones").replaceChildren(...f.paginas[0].actividades[0].ejercicios.map((e) => {
        const li = document.createElement("li");
        li.textContent = `${e.datos.a} ${e.datos.op} ${e.datos.b} = ${e.solucion.huecos.join(", ")}`;
        return li;
      }));
      $("json").textContent = JSON.stringify(f, null, 1);
    } catch (e) { $("error").textContent = e.message; $("error").hidden = false; }
  }

  selModelo.onchange = () => { pintarOpciones(); pintar(); };
  divOps.onchange = pintar;
  $("generar").onclick = pintar;
  $("variante").onclick = () => { inSemilla.value = (+inSemilla.value || 1) + 1; pintar(); };
  pintarOpciones(); pintar();
}

if (typeof document !== "undefined") iniciar();
