// Charta · vista de la pantalla de inicio (paso 4.8). Solo DOM: la lógica está en inicio.js.
// crearInicio(cb) → { pintar(estado), cerrarMaterias() }. Todo lo que cambia la ficha lo hace app.js a través de cb.
import { PALETA } from "../render/hoja.js";
import { miniatura } from "./navegacion.js";
import { fechaCorta } from "./inicio.js";

const $ = (id) => document.getElementById(id);
function el(tag, props = {}, ...hijos) { const e = Object.assign(document.createElement(tag), props); e.append(...hijos); return e; }

/** Miniaturas de una en una (no bloquean la pantalla); se cancelan si el inicio se repinta. */
let tanda = 0;
function cargarMiniaturas(raiz) {
  const mi = ++tanda, pend = [...raiz.querySelectorAll(".mini[data-id]")].filter((m) => !m.firstChild);
  const paso = () => {
    const m = pend.shift();
    if (!m || mi !== tanda) return;
    if (m.isConnected) try { m.innerHTML = miniatura(m.dataset.id); } catch { m.textContent = ""; }
    setTimeout(paso, 0);
  };
  setTimeout(paso, 0);
}
const miniCaja = (id, color) => {
  const [fondo, borde] = PALETA[color] ?? PALETA.verde;
  const m = el("div", { className: "mini" }); m.dataset.id = id; m.style.background = fondo; m.style.borderColor = borde;
  return m;
};

export function crearInicio(cb) {
  let pestana = "favoritos", estado = null;

  $("iniCrear").onclick = () => {
    const ms = cb.materias();
    if (ms.length <= 1) return cb.crear(ms[0]?.id ?? null);
    const abierto = !$("iniMaterias").hidden;
    $("iniMaterias").hidden = abierto;
    if (!abierto) $("iniMateriasBtn").replaceChildren(...ms.map((m) => el("button", { textContent: m.nombre, onclick: () => cb.crear(m.id) })));
  };
  $("iniSeguir").onclick = () => cb.seguir();
  $("iFav").onclick = () => { pestana = "favoritos"; pintarFichas(); };
  $("iRec").onclick = () => { pestana = "recientes"; pintarFichas(); };
  $("iNube").onclick = () => { pestana = "nube"; cb.leerNube(); pintarFichas(); };

  // Ajustes discretos
  $("iniAjustesBtn").onclick = () => {
    const abrir = $("iniAjustes").hidden;
    $("iniAjustes").hidden = !abrir; $("iniAjustesBtn").setAttribute("aria-expanded", String(abrir));
    if (abrir) { pintarAjustes(); $("iniAjustes").scrollIntoView({ behavior: "smooth", block: "nearest" }); }
  };
  $("iaFuente").onchange = () => cb.ponerFuente($("iaFuente").value);
  $("iaBn").onchange = () => cb.ponerBn($("iaBn").checked);
  $("iaTema").onclick = () => $("tema").click();
  $("iaCuenta").onclick = () => $("cuentaNube").click();
  function pintarAjustes() {
    const { fuentes, fuente } = cb.fuentes();
    $("iaFuente").replaceChildren(...fuentes.map((f) => el("option", { value: f.id, textContent: f.nombre, selected: f.id === fuente })));
    $("iaBn").checked = cb.bnDefecto();
    $("iaCuenta").textContent = $("cuentaNube").textContent; $("iaCuenta").disabled = $("cuentaNube").disabled;
  }

  function pintarFichas() {
    const { fav, rec, nube, dentro } = estado;
    if (pestana === "nube" && !dentro) pestana = "favoritos";
    if (pestana === "favoritos" && !fav.length) pestana = rec.length || !dentro ? "recientes" : "nube";
    $("iFav").classList.toggle("activa", pestana === "favoritos"); $("iRec").classList.toggle("activa", pestana === "recientes");
    $("iNube").classList.toggle("activa", pestana === "nube"); $("iNube").hidden = !dentro;
    $("iFav").textContent = `★ Favoritas (${fav.length})`; $("iRec").textContent = `Recientes (${rec.length})`;
    $("iNube").textContent = nube ? `☁ En la nube (${nube.length})` : "☁ En la nube";
    const vacio = (t) => [el("li", { className: "info", textContent: t })];
    let filas;
    if (pestana === "nube") {
      filas = !nube ? vacio("Cargando…") : !nube.length ? vacio("Aún no hay fichas en la nube: usa «☁ Guardar en la nube» al preparar una.")
        : nube.slice(0, 12).map((x) => fila({ comp: x.composicion, nombre: x.titulo, fecha: x.creada }));
    } else {
      const lista = pestana === "favoritos" ? fav : rec;
      filas = !lista.length ? vacio(pestana === "favoritos" ? "Marca una ficha con ☆ Favorita y la tendrás aquí." : "Las fichas que imprimas aparecerán aquí.")
        : lista.slice(0, 12).map((c) => fila({ comp: c, nombre: c.nombre || "Ficha", fecha: c.fecha }));
    }
    $("iniLista").replaceChildren(...filas);
    cargarMiniaturas($("inicio"));
  }

  function fila({ comp, nombre, fecha }) {
    const acts = comp?.actividades || [];
    const disp = acts.length > 0 && acts.every((a) => cb.hayTipo(a.tipo));
    const mini = disp ? miniCaja(acts[0].tipo, cb.colorDe(acts[0].tipo)) : el("div", { className: "mini" });
    const b = el("button", { className: "g-abrir ini-fila", disabled: !disp }, mini,
      el("span", { className: "ini-fila-txt" }, el("strong", { textContent: nombre }),
        el("small", { textContent: acts.map((a) => cb.nombreModelo(a.tipo)).join(" + ") + (fecha ? " · " + fechaCorta(fecha) : "") })));
    b.onclick = () => cb.abrir(comp);
    return el("li", {}, b);
  }

  return {
    /** estado: { saludo, seguir: { nombre, detalle, tipo, color } | null, rapidos: [{ id, nombre, color }], fav, rec, nube, dentro } */
    pintar(e) {
      estado = e;
      $("iniSaludo").textContent = e.saludo;
      $("iniSeguir").hidden = !e.seguir;
      if (e.seguir) {
        $("iniSeguirNombre").textContent = e.seguir.nombre; $("iniSeguirDetalle").textContent = e.seguir.detalle;
        const m = $("iniSeguirMini"), [fondo, borde] = PALETA[e.seguir.color] ?? PALETA.verde;
        m.style.background = fondo; m.style.borderColor = borde; m.dataset.id = e.seguir.tipo; m.replaceChildren();
      }
      $("iniRapidos").hidden = !e.rapidos.length;
      $("iniRapidosLista").replaceChildren(...e.rapidos.map((r) => {
        const b = el("button", { className: "ini-rapido" }, miniCaja(r.id, r.color), el("strong", { textContent: r.nombre }));
        b.onclick = () => cb.crearModelo(r.id);
        return b;
      }));
      pintarFichas();
      if (!$("iniAjustes").hidden) pintarAjustes();
    },
    cerrarMaterias() { $("iniMaterias").hidden = true; },
  };
}
