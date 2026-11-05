// Charta · enlace con Tabula (paso 5.2). Mismo origen (ilinper301-hue.github.io/…), así que Charta LEE
// los grupos y el alumnado del almacén de Tabula (solo lectura, sin conexión) y le devuelve la ficha por URL.
// Los nombres solo se usan para imprimir: nunca se guardan ni van en una URL.
//
// Contrato de URL (igual en tabula/js/charta.js):
//   Tabula → Charta  ../Charta/?desde=tabula[&grupo=G][&sesion=S][&tarea=T]   crear ficha
//                    ../Charta/?ficha=ID | ?comp=B64 [&grupo=G]&desde=tabula     abrir una guardada
//   Charta → Tabula  /tabula/?charta=B64( {v:1, id?, titulo, tipos, comp, grupo?, sesion?, tarea?, variantes?, minutos?, dificultad?, etiquetas?} )
//                    + la miniatura de la hoja 1 (sin nombres) en localStorage["charta:aTabula"] = {v:1, titulo, miniatura} (5.4)

export const URL_TABULA = "/tabula/"; // raíz del sitio (ilinper301-hue.github.io); la app está en /Charta/dist/

/** Texto UTF-8 → base64url sin «=». */
export function b64url(texto) {
  let bin = "";
  for (const b of new TextEncoder().encode(String(texto))) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
/** base64url → texto UTF-8 (lanza error si no es válido). */
export function deB64url(s) {
  const bin = atob(String(s).replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

/** Composición válida (la de Charta: actividades + opciones, semilla, título…) o null. */
export function composicionValida(c, hayTipo = () => true) {
  if (!c || typeof c !== "object" || !Array.isArray(c.actividades)) return null;
  if (c.actividades.length < 1 || c.actividades.length > 2) return null;
  if (!c.actividades.every((a) => a && typeof a.tipo === "string" && hayTipo(a.tipo) && (a.params == null || typeof a.params === "object"))) return null;
  return c;
}

/** Parámetros de entrada: ?desde=tabula, ?grupo, ?sesion, ?tarea, ?comp (composición en base64url). */
export function leerEntrada(search = "", hayTipo) {
  const q = new URLSearchParams(search), id = (k) => (q.get(k) || "").slice(0, 100) || null;
  let comp = null;
  if (q.get("comp")) try { comp = composicionValida(JSON.parse(deB64url(q.get("comp"))), hayTipo); } catch { comp = null; }
  return { desdeTabula: q.get("desde") === "tabula", grupo: id("grupo"), sesion: id("sesion"), tarea: id("tarea"), comp };
}

/** URL para volver a Tabula con la ficha (sin nombres de alumnos). */
export function urlVolver({ id, titulo, tipos, comp, grupo, sesion, tarea, variantes, minutos, dificultad, etiquetas }, base = URL_TABULA) {
  const datos = { v: 1, ...(id ? { id } : {}), titulo: String(titulo || "Ficha").slice(0, 200), tipos: tipos || [], comp,
    ...(variantes > 1 ? { variantes } : {}), ...(minutos ? { minutos } : {}), ...(dificultad ? { dificultad } : {}),
    ...(etiquetas?.length ? { etiquetas: etiquetas.slice(0, 6).map((t) => String(t).slice(0, 30)) } : {}),
    ...(grupo ? { grupo } : {}), ...(sesion ? { sesion } : {}), ...(tarea ? { tarea } : {}) };
  return `${base}?charta=${b64url(JSON.stringify(datos))}`;
}

/** Grupos activos de Tabula con su alumnado en orden → [{ id, nombre, alumnos: ["Nombre Apellidos", …] }]. */
export function gruposDeTabula(groups = [], students = []) {
  const nombre = (s) => [s.nombre, s.apellidos].map((x) => String(x || "").trim()).filter(Boolean).join(" ");
  const orden = (a, b) => (a.orden ?? 1e9) - (b.orden ?? 1e9) || String(a.apellidos || "").localeCompare(String(b.apellidos || ""), "es");
  return groups.filter((g) => g && g.id && !g.archivado)
    .sort((a, b) => (a.curso || 0) - (b.curso || 0) || String(a.nombre || "").localeCompare(String(b.nombre || ""), "es"))
    .map((g) => ({ id: g.id, nombre: String(g.nombre || "Grupo"),
      alumnos: students.filter((s) => s && s.groupId === g.id).sort(orden).map(nombre).filter(Boolean) }));
}

/**
 * Lee las colecciones «groups» y «students» de Tabula: IndexedDB «tabula-data» (almacén «cols») y,
 * si no está, localStorage («tabula:v1:groups»…). Nunca crea la base de Tabula. → { groups, students } o null.
 */
export async function leerTabula(idb = globalThis.indexedDB, ls = globalThis.localStorage) {
  const deIdb = await new Promise((ok) => {
    if (!idb) return ok(null);
    let req;
    try { req = idb.open("tabula-data"); } catch { return ok(null); }
    // Si no existía, se cancela la creación (no hay que dejar una base vacía que estropearía Tabula).
    req.onupgradeneeded = () => { try { req.transaction.abort(); } catch {} };
    req.onerror = () => ok(null);
    req.onblocked = () => ok(null);
    req.onsuccess = () => {
      const db = req.result;
      try {
        if (!db.objectStoreNames.contains("cols")) { db.close(); return ok(null); }
        const st = db.transaction("cols", "readonly").objectStore("cols"), r = {};
        let quedan = 2;
        for (const k of ["groups", "students"]) {
          const g = st.get(k);
          g.onsuccess = () => { r[k] = Array.isArray(g.result) ? g.result : []; if (!--quedan) { db.close(); ok(r); } };
          g.onerror = () => { db.close(); ok(null); };
        }
      } catch { try { db.close(); } catch {} ok(null); }
    };
  });
  if (deIdb && deIdb.groups.length) return deIdb;
  try {
    const leer = (k) => { const v = JSON.parse(ls?.getItem("tabula:v1:" + k) || "[]"); return Array.isArray(v) ? v : []; };
    const r = { groups: leer("groups"), students: leer("students") };
    return r.groups.length ? r : deIdb;
  } catch { return deIdb; }
}
