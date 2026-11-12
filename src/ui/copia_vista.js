// Charta · copia de seguridad en Ajustes (fase 7 de PLAN-DISENO, R5): guardar y cargar un archivo con favoritas, recientes y ajustes,
// y subir las favoritas a la nube (con sesión). La lógica sin DOM está en copia.js. crearCopiaVista(ctx) → { pintar() }
import { crearCopia, leerCopia, aplicarCopia, nombreArchivo, opcionesDeComp, MAX_COPIA } from "./copia.js";
import { generar } from "../nucleo/ficha.js";
import { hayTipo } from "../nucleo/tipos.js";
import { avisar, confirmar } from "./piezas.js";
import { $, el } from "./dom.js";

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

export function crearCopiaVista(ctx) {
  const info = (t, error = false) => { $("iaCopiaTxt").textContent = t; $("iaCopiaTxt").classList.toggle("error", error); };
  const dentro = () => ctx.nubeV.nube.estado().estado === "dentro";

  function pintar() {
    const n = ctx.guardadas.favoritos().length;
    $("iaSubir").hidden = !dentro();
    $("iaSubir").disabled = !n;
    $("iaSubir").textContent = n ? `Subir mis ${plural(n, "favorita", "favoritas")} a la nube` : "No hay favoritas que subir";
  }

  $("iaExportar").onclick = () => {
    const c = crearCopia(ctx.almacen, ctx.guardadas);
    const a = el("a", { href: URL.createObjectURL(new Blob([JSON.stringify(c)], { type: "application/json" })), download: nombreArchivo() });
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    info(`Copia guardada en «${nombreArchivo()}»: ${plural(c.favoritos.length, "favorita", "favoritas")}, ${plural(c.recientes.length, "reciente", "recientes")} y ${plural(Object.keys(c.ajustes).length, "ajuste", "ajustes")}. Guárdala en un sitio seguro (Drive, el correo…).`);
  };
  $("iaImportar").onclick = () => $("iaArchivo").click();
  $("iaArchivo").onchange = async () => {
    const f = $("iaArchivo").files[0];
    $("iaArchivo").value = "";
    if (!f) return;
    try {
      if (f.size > MAX_COPIA * 3) throw new Error("El archivo es demasiado grande para ser una copia de Charta.");
      const c = leerCopia(await f.text());
      const si = await confirmar({ titulo: "¿Cargar esta copia?", si: "Cargar", texto: `Trae ${plural(c.favoritos.length, "favorita", "favoritas")}, ${plural(c.recientes.length, "reciente", "recientes")} y ${plural(Object.keys(c.ajustes).length, "ajuste", "ajustes")}${c.fecha ? ` (del ${c.fecha})` : ""}. Se suman a lo que ya tienes, sin repetir y sin borrar nada.` });
      if (!si) return;
      const r = aplicarCopia(c, ctx.almacen, ctx.guardadas, { hayTipo });
      ctx.lista.pintar(); ctx.refrescarInicio(); pintar();
      const t = `Copia cargada: ${plural(r.favoritos, "favorita nueva", "favoritas nuevas")} y ${plural(r.recientes, "reciente nueva", "recientes nuevas")}${r.descartadas ? `; ${plural(r.descartadas, "ficha no se ha podido leer", "fichas no se han podido leer")}` : ""}.${r.ajustes ? " Cierra y abre la app para que se apliquen los ajustes." : ""}`;
      info(t); avisar("Copia cargada.");
    } catch (e) { info(e.message, true); }
  };

  $("iaSubir").onclick = async () => {
    const favs = ctx.guardadas.favoritos(), N = ctx.nubeV;
    if (!favs.length || !dentro()) return;
    $("iaSubir").disabled = true;
    let subidas = 0, repetidas = 0, fallidas = 0, motivo = "";
    try {
      if (!ctx.enNube) await N.leerNube();
      for (const [i, fav] of favs.entries()) {
        info(`Subiendo ${i + 1} de ${favs.length}…`);
        let ficha;
        try { const o = opcionesDeComp(fav, hayTipo); if (!o) throw new Error("ya no se puede abrir"); ficha = generar(o.opciones, o.semilla); }
        catch (e) { fallidas++; motivo = `«${fav.nombre || "Ficha"}»: ${e.message}`; continue; }
        try { const r = await N.nube.guardar(ficha, fav); if (r.repetida) repetidas++; else subidas++; }
        catch (e) { fallidas += favs.length - i; motivo = e.message; break; }   // un fallo de la nube (sesión, red, límite) afectaría a las demás
      }
      ctx.enNube = await N.nube.listar().catch(() => ctx.enNube);
    } finally { ctx.lista.pintar(); ctx.refrescarInicio(); pintar(); }
    info(`${plural(subidas, "favorita subida", "favoritas subidas")} a la nube (sin nombres de alumnos)${repetidas ? `; ${plural(repetidas, "ya estaba", "ya estaban")}` : ""}${fallidas ? `; ${fallidas} sin subir (${motivo})` : ""}.`, fallidas > 0);
  };

  return { pintar };
}
