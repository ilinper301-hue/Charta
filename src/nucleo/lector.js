// Charta · lectura de fichas JSON sin motor (lo pueden importar Tabula y Fori).
// Sin dependencias: no importa el catálogo ni los tipos.

export const VERSIONES_LEIDAS = [1];
const COLORES = ["amarillo", "rosa", "azul", "verde"];

/** Lista de errores del esquema (vacía = ficha válida). */
export function erroresFicha(f) {
  const e = [], es = (c, msg) => { if (!c) e.push(msg); };
  if (!f || typeof f !== "object") return ["La ficha no es un objeto."];
  es(VERSIONES_LEIDAS.includes(f.schemaVersion), `schemaVersion ${f.schemaVersion} no admitida`);
  es(f.app === "charta", "app debe ser «charta»");
  es(typeof f.titulo === "string" && f.titulo, "falta el título");
  es(Number.isInteger(f.semilla), "semilla debe ser entera");
  es(Number.isInteger(f.variantes) && f.variantes >= 1, "variantes debe ser un entero ≥ 1");
  es(Array.isArray(f.paginas) && f.paginas.length, "faltan las páginas");
  es(Array.isArray(f.variantesDatos) && f.variantesDatos.length === (f.variantes || 1) - 1, "variantesDatos no cuadra con variantes");
  if ("alumnos" in f || "nombres" in f) e.push("la ficha no debe llevar datos de alumnos");
  const grupos = [f.paginas || [], ...(f.variantesDatos || []).map((v) => v.paginas || [])];
  grupos.forEach((ps, v) => ps.forEach((p, i) => {
    const donde = `variante ${v + 1}, página ${i + 1}`;
    if (!Array.isArray(p.actividades) || p.actividades.length < 1 || p.actividades.length > 2) { e.push(`${donde}: 1 o 2 actividades`); return; }
    p.actividades.forEach((a, k) => {
      const d = `${donde}, actividad ${k + 1}`;
      es(a.n === k + 1, `${d}: n debe ser ${k + 1}`);
      es(typeof a.tipo === "string" && Number.isInteger(a.tipoVersion), `${d}: tipo y tipoVersion`);
      es(["completa", "media"].includes(a.tamano), `${d}: tamano no válido`);
      es(COLORES.includes(a.color), `${d}: color no válido`);
      es(typeof a.enunciado === "string", `${d}: falta el enunciado`);
      es(Array.isArray(a.ejercicios) && a.ejercicios.length, `${d}: sin ejercicios`);
      (a.ejercicios || []).forEach((x, j) => es(x.id && x.datos && x.solucion, `${d}, ejercicio ${j + 1}: id, datos y solucion`));
    });
  }));
  return e;
}

/** Páginas de la variante v (0 = A). */
export function paginasVariante(f, v = 0) {
  return v === 0 ? f.paginas : f.variantesDatos[v - 1].paginas;
}

/** Letra de la variante: 0 → "A". */
export const letraVariante = (v) => String.fromCharCode(65 + v);

/**
 * Ficha guardada en Firestore (/apps/charta/fichas/{id}) → ficha JSON, o error claro.
 * El documento guarda la ficha como texto en `ficha` (Firestore no admite listas dentro de listas).
 */
export function fichaDeDocumento(datos, id) {
  if (!datos || typeof datos.ficha !== "string") throw new Error("El documento no contiene una ficha de Charta.");
  let f;
  try { f = JSON.parse(datos.ficha); } catch { throw new Error("La ficha guardada está dañada."); }
  if (id) f.id = id;
  const e = erroresFicha(f);
  if (e.length) throw new Error("Ficha no válida: " + e[0]);
  return f;
}
