// Charta · vista de la pantalla de inicio (paso 4.8). Solo DOM: la lógica está en inicio.js.
// crearInicio(cb) → { pintar(estado), cerrarMaterias() }. Ajustes: ajustes_vista.js (fase 3). Todo lo que cambia la ficha lo hace app.js a través de cb.
import { PALETA } from "../render/hoja.js";
import { miniatura } from "./navegacion.js";
import { fechaCorta } from "./inicio.js";
import { disponible, nombresModelos, etiquetasPestanas } from "./lista_fichas.js";
import { prepararPestanas, marcarPestana } from "./piezas.js";
import { $, el } from "./dom.js";

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
  $("iniDescartar").onclick = () => cb.descartarBorrador();
  prepararPestanas(document.querySelector("#iniFichas .pestanas"), $("iniLista"));
  $("iFav").onclick = () => { pestana = "favoritos"; pintarFichas(); };
  $("iRec").onclick = () => { pestana = "recientes"; pintarFichas(); };
  $("iNube").onclick = () => { pestana = "nube"; cb.leerNube(); pintarFichas(); };

  function pintarFichas() {
    const { fav, rec, nube, dentro } = estado;
    if (pestana === "nube" && !dentro) pestana = "favoritos";
    if (pestana === "favoritos" && !fav.length) pestana = rec.length || !dentro ? "recientes" : "nube";
    $("iNube").hidden = !dentro;
    marcarPestana(document.querySelector("#iniFichas .pestanas"), $({ favoritos: "iFav", recientes: "iRec", nube: "iNube" }[pestana]));
    const t = etiquetasPestanas({ fav, rec, nube });
    $("iFav").textContent = t.fav; $("iRec").textContent = t.rec; $("iNube").textContent = t.nube;
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
    const disp = disponible(comp, cb.hayTipo);
    const mini = disp ? miniCaja(acts[0].tipo, cb.colorDe(acts[0].tipo)) : el("div", { className: "mini" });
    const b = el("button", { className: "g-abrir ini-fila", disabled: !disp }, mini,
      el("span", { className: "ini-fila-txt" }, el("strong", { textContent: nombre }),
        el("small", { textContent: nombresModelos(comp, cb.nombreModelo) + (fecha ? " · " + fechaCorta(fecha) : "") })));
    b.onclick = () => cb.abrir(comp);
    return el("li", {}, b);
  }

  return {
    /** estado: { saludo, seguir: { nombre, detalle, tipo, color, borrador? } | null, rapidos: [{ id, nombre, color }], fav, rec, nube, dentro } */
    pintar(e) {
      estado = e;
      $("iniSaludo").textContent = e.saludo;
      $("iniSeguir").hidden = !e.seguir; $("iniDescartar").hidden = !e.seguir?.borrador;
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
    },
    cerrarMaterias() { $("iniMaterias").hidden = true; },
  };
}
