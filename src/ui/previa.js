// Charta · alumnos y vista previa (fase 2 de PLAN-DISENO, antes en app.js): genera la ficha, pinta todas las hojas y el
// solucionario, imprime. crearPrevia(ctx) → { pintar(), nombres(), copias(), ficha (lectura), paginas (lectura) }
import { generar, metadatosDe } from "../nucleo/ficha.js";
import { letraVariante, paginasVariante } from "../nucleo/lector.js";
import { hoja, hojas, estiloLectura } from "../render/hoja.js";
import { leerAlumnos, numVariantes, MAX_ALUMNOS } from "./alumnos.js";
import { hayLengua1, hayFrases } from "./letras.js";
import { agrupar } from "./paginas.js";
import { $, el } from "./dom.js";

export function crearPrevia(ctx) {
  let ficha = null, paginas = [];
  const nombres = () => leerAlumnos($("alumnos").value).slice(0, MAX_ALUMNOS);
  const copias = () => Math.max(1, Math.min(MAX_ALUMNOS, parseInt($("copias").value, 10) || 1));
  function contar() {
    const todos = leerAlumnos($("alumnos").value), n = Math.min(todos.length, MAX_ALUMNOS);
    $("filaCopias").hidden = n > 0;
    $("cuenta").textContent = !n ? "Sin alumnos: la ficha sale con la línea del nombre en blanco."
      : `${n} alumno${n > 1 ? "s" : ""}: una ficha con su nombre para cada uno.` + (todos.length > MAX_ALUMNOS ? ` (máximo ${MAX_ALUMNOS}; sobran ${todos.length - MAX_ALUMNOS})` : "");
  }

  function pintar() {
    $("error").hidden = true;
    queueMicrotask(() => ctx.lista.marcarFavorito());
    try {
      contar();
      const ns = nombres(), total = ns.length || copias();
      const leidas = ctx.comp.editores.map((e) => e.leer());
      $("secLetras").hidden = !hayLengua1(leidas); $("cajaMisFrases").hidden = !hayFrases(leidas);
      ctx.letras.pintarMisFrases();
      const acts = ctx.letras.actividades(), pags = agrupar(acts, ctx.comp.cuentas);
      ficha = generar({
        paginas: pags,
        metadatos: metadatosDe(pags.map((p) => p.actividades.map((a) => a.tipo))),
        titulo: $("titulo").value.trim() || undefined,
        variantes: numVariantes($("variaciones").value, total),
        presentacion: { color: !$("bn").checked, ...($("fuente").value !== "andika" && { fuente: $("fuente").value }), ...($("grande").checked && { letraGrande: true }), ...($("facil").checked && { lecturaFacil: true }) },
      }, ctx.semilla);
      const bn = $("bn").checked;
      $("barraTitulo").textContent = ficha.titulo;   // cabecera única (fase 3); editable en la fase 4
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
    ctx.comp.guardarBorrador();
  }

  for (const id of ["alumnos", "copias", "variaciones", "bn", "grande", "facil", "titulo"]) $(id).addEventListener("change", pintar);
  $("alumnos").addEventListener("input", contar);
  $("irPrevia").onclick = () => $("previa").scrollIntoView({ behavior: "smooth" });
  $("variante").onclick = () => { ctx.semilla++; pintar(); };
  $("versol").onclick = () => {
    const s = $("soluciones"); s.hidden = !s.hidden; $("versol").textContent = s.hidden ? "Ver soluciones" : "Ocultar soluciones";
    if (!s.hidden) s.scrollIntoView({ behavior: "smooth" });
  };
  $("imprimir").onclick = () => {
    if (!paginas.length) return;
    // Solo las fichas del alumnado: el solucionario nunca va al papel.
    $("impresion").replaceChildren(...paginas.map((p) => Object.assign(el("div", { className: "pag" }), { innerHTML: p.svg })));
    ctx.guardadas.anotarReciente(ctx.comp.composicion(), ficha.titulo); ctx.lista.pintar();
    ctx.borrador.descartar();   // ya está en Recientes (sin nombres)
    const t = document.title; document.title = ficha.titulo;
    document.fonts.ready.then(() => { window.print(); document.title = t; });
  };

  return { pintar, nombres, copias, get ficha() { return ficha; }, get paginas() { return paginas; } };
}
