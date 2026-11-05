// Charta · letras subidas por la maestra (guardadas solo en este dispositivo, en IndexedDB «charta-fuentes»).
// Sin DOM salvo `crearAlmacenFuentes()` (IndexedDB) y `instalarCss()` (una <style>): lo demás se prueba en Node.
import { nombreFuente } from "../render/fuentes.js";

export const MAX_BYTES = 600 * 1024;           // una letra normal pesa 50–400 KB; así no revienta el almacenamiento ni el paquete para Fori
export const MAX_FUENTES = 8;
const FORMATOS = { ttf: ["truetype", "font/ttf"], otf: ["opentype", "font/otf"], woff: ["woff", "font/woff"], woff2: ["woff2", "font/woff2"] };
const extension = (n) => String(n).toLowerCase().split(".").pop();

/** Comprueba un archivo (name, size). Devuelve { ok: true, nombre, formato } o { ok: false, error }. */
export function validarArchivo({ name, size }, existentes = []) {
  const f = FORMATOS[extension(name)];
  if (!f) return { ok: false, error: "Solo se admiten letras .ttf, .otf, .woff o .woff2." };
  if (!size) return { ok: false, error: "El archivo está vacío." };
  if (size > MAX_BYTES) return { ok: false, error: `La letra pesa ${Math.round(size / 1024)} KB; el máximo es ${MAX_BYTES / 1024} KB. Prueba con una versión más ligera (por ejemplo, solo Regular).` };
  const nombre = nombreFuente(name);
  if (!existentes.includes(nombre) && existentes.length >= MAX_FUENTES) return { ok: false, error: `Ya hay ${MAX_FUENTES} letras guardadas: quita alguna antes.` };
  return { ok: true, nombre, formato: f[0], mime: f[1] };
}

/** Regla @font-face con la letra incrustada (data URL); sirve también para llevarla a Fori. */
export function cssFuente({ nombre, formato, mime, b64 }) {
  return `@font-face{font-family:"${nombre}";src:url(data:${mime};base64,${b64}) format("${formato}");}`;
}

/** Almacén en IndexedDB: { todas(), poner(rec), quitar(nombre) }. rec = { nombre, formato, mime, b64 }. */
export function crearAlmacenFuentes(idb = globalThis.indexedDB) {
  const abrir = () => new Promise((res, rej) => {
    const r = idb.open("charta-fuentes", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("fuentes", { keyPath: "nombre" });
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  const op = async (modo, f) => { const db = await abrir(); return new Promise((res, rej) => {
    const t = db.transaction("fuentes", modo), r = f(t.objectStore("fuentes"));
    t.oncomplete = () => { db.close(); res(r?.result); }; t.onerror = t.onabort = () => { db.close(); rej(t.error); };
  }); };
  return {
    todas: () => op("readonly", (s) => s.getAll()).then((x) => x || []),
    poner: (rec) => op("readwrite", (s) => s.put(rec)),
    quitar: (nombre) => op("readwrite", (s) => s.delete(nombre)),
  };
}

/** Pone (o quita, si rec es null) la regla @font-face de una letra en la página. Devuelve la promesa de que esté cargada. */
export function instalarCss(rec, nombre = rec?.nombre) {
  const id = "fuente-" + nombre.replace(/[^\p{L}\p{N}]/gu, "_");
  document.getElementById(id)?.remove();
  if (!rec) return Promise.resolve();
  const st = document.createElement("style"); st.id = id; st.textContent = cssFuente(rec); document.head.append(st);
  return document.fonts.load(`16px "${rec.nombre}"`).catch(() => {});
}

export const aBase64 = (buf) => { let s = ""; const b = new Uint8Array(buf); for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000)); return btoa(s); };
