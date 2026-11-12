// Charta · ficha ⇄ documento de Firestore (paso 5.1). Sin dependencias del SDK: se prueba en Node.
// Documento /apps/charta/fichas/{id}:
//   { schemaVersion, app: "charta", autor, titulo, creada, tipos, variantes, ficha, composicion }
//   ficha        = JSON de la ficha (texto: Firestore no admite listas dentro de listas)
//   composicion  = JSON de lo que hace falta para reabrirla y editarla en Charta (como las favoritas)
// NUNCA lleva nombres de alumnos: la ficha se comprueba con erroresFicha() y la composición pasa por limpiar().
import { erroresFicha, fichaDeDocumento } from "../nucleo/lector.js";
import { limpiar } from "../ui/guardadas.js";

/** Límites de las reglas de Firestore (bloque Charta de firestore.rules): se comprueban aquí para dar un aviso claro. */
export const TAM_MAX = 900000;      // texto de la ficha (Firestore: 1 MiB por documento)
export const MAX_TIPOS = 10;        // `tipos` es solo un índice: se recorta (una ficha admite 10 páginas × 2 modelos)
export const MAX_COMPOSICION = 20000;
export const MAX_TITULO = 200;
export const CAMPOS = ["schemaVersion", "app", "autor", "titulo", "creada", "tipos", "variantes", "ficha", "composicion"];

export function aDocumento(ficha, comp, uid, ahora = new Date()) {
  if (!uid) throw new Error("Hay que iniciar sesión para guardar en la nube.");
  const e = erroresFicha(ficha);
  if (e.length) throw new Error("Ficha no válida: " + e[0]);
  const creada = ahora.toISOString().replace(/\.\d{3}Z$/, "Z");
  const f = { ...ficha, autor: uid, creada };
  delete f.id; // el id lo da Firestore (es el del documento)
  const texto = JSON.stringify(f);
  if (texto.length > TAM_MAX) throw new Error("La ficha es demasiado grande para guardarla en la nube (prueba con menos variantes o menos páginas).");
  if (!(f.variantes >= 1 && f.variantes <= 30)) throw new Error("La nube admite como mucho 30 variantes.");
  const composicion = JSON.stringify(limpiar(comp));
  if (composicion.length > MAX_COMPOSICION) throw new Error("La ficha tiene demasiadas opciones para la nube (prueba con menos «Mis frases»).");
  const tipos = [...new Set(f.paginas.flatMap((p) => p.actividades.map((a) => a.tipo)))].slice(0, MAX_TIPOS);
  return { schemaVersion: f.schemaVersion, app: "charta", autor: uid, titulo: String(f.titulo || "Ficha").slice(0, MAX_TITULO), creada, tipos,
    variantes: f.variantes, ficha: texto, composicion };
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
