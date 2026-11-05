// Charta · ficha ⇄ documento de Firestore (paso 5.1). Sin dependencias del SDK: se prueba en Node.
// Documento /apps/charta/fichas/{id}:
//   { schemaVersion, app: "charta", autor, titulo, creada, tipos, variantes, ficha, composicion }
//   ficha        = JSON de la ficha (texto: Firestore no admite listas dentro de listas)
//   composicion  = JSON de lo que hace falta para reabrirla y editarla en Charta (como las favoritas)
// NUNCA lleva nombres de alumnos: la ficha se comprueba con erroresFicha() y la composición pasa por limpiar().
import { erroresFicha, fichaDeDocumento } from "../nucleo/lector.js";
import { limpiar } from "../ui/guardadas.js";

/** Tamaño máximo del texto de la ficha (Firestore: 1 MiB por documento). */
export const TAM_MAX = 900000;
export const CAMPOS = ["schemaVersion", "app", "autor", "titulo", "creada", "tipos", "variantes", "ficha", "composicion"];

export function aDocumento(ficha, comp, uid, ahora = new Date()) {
  if (!uid) throw new Error("Hay que iniciar sesión para guardar en la nube.");
  const e = erroresFicha(ficha);
  if (e.length) throw new Error("Ficha no válida: " + e[0]);
  const creada = ahora.toISOString().replace(/\.\d{3}Z$/, "Z");
  const f = { ...ficha, autor: uid, creada };
  delete f.id; // el id lo da Firestore (es el del documento)
  const texto = JSON.stringify(f);
  if (texto.length > TAM_MAX) throw new Error("La ficha es demasiado grande para guardarla en la nube (prueba con menos variantes).");
  const tipos = [...new Set(f.paginas.flatMap((p) => p.actividades.map((a) => a.tipo)))];
  return { schemaVersion: f.schemaVersion, app: "charta", autor: uid, titulo: f.titulo, creada, tipos,
    variantes: f.variantes, ficha: texto, composicion: JSON.stringify(limpiar(comp)) };
}

/** Documento → { id, titulo, creada, tipos, composicion, ficha() } (la ficha se lee solo si hace falta). */
export function deDocumento(id, d) {
  let composicion = null;
  try { composicion = limpiar(JSON.parse(d.composicion)); } catch {}
  return { id, titulo: d.titulo || "Ficha", creada: d.creada || "", tipos: Array.isArray(d.tipos) ? d.tipos : [],
    composicion, ficha: () => fichaDeDocumento(d, id) };
}

/** ¿Misma composición (y misma semilla)? Para no guardar dos veces la misma ficha. */
export const mismaComposicion = (a, b) => !!a && !!b && JSON.stringify(limpiar(a)) === JSON.stringify(limpiar(b));
