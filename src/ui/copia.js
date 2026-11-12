// Charta · copia de seguridad (fase 7 de PLAN-DISENO, R5). Sin DOM: el almacén y las guardadas se inyectan.
// Un archivo JSON con las favoritas, las recientes y los ajustes del dispositivo (tema, letra, B/N, letras de la clase, «Mis frases»).
// NUNCA lleva nombres de alumnos (las listas pasan por limpiar()) ni el borrador. Las letras subidas (IndexedDB) no van: pesan mucho.
//   { v: 1, app: "charta", tipo: "copia", fecha, favoritos: [comp + nombre + fecha], recientes: […], ajustes: { "charta:tema": "oscuro", … } }
import { TEMAS } from "./tema.js";
import { ABECEDARIO } from "../lengua/reglas.js";
import { composicionValida } from "./tabula.js";

export const MAX_COPIA = 1500000;   // caracteres del archivo (30 favoritas con «Mis frases» rondan los 150.000)
const letras = (v) => typeof v === "string" && v.length <= ABECEDARIO.length && [...v].every((l) => ABECEDARIO.includes(l));
/** Ajustes que entran en la copia → cómo se comprueba cada valor al importar. */
export const AJUSTES = {
  "charta:tema": (v) => TEMAS.includes(v),
  "charta:fuente": (v) => typeof v === "string" && /^[\w.-]{1,60}$/.test(v),
  "charta:bnDefecto": (v) => v === "0" || v === "1",
  "charta:letras": letras,
  "charta:letrasObligatorias": letras,
  "charta:misFrases": (v) => typeof v === "string" && v.length <= 6000,
};

export const nombreArchivo = (ahora = new Date()) => `charta-copia-${ahora.toISOString().slice(0, 10)}.json`;

/** Objeto de la copia con lo que hay ahora en el dispositivo. */
export function crearCopia(almacen, guardadas, ahora = new Date()) {
  const ajustes = {};
  for (const [k, ok] of Object.entries(AJUSTES)) { let v = null; try { v = almacen.getItem(k); } catch {} if (v !== null && ok(v)) ajustes[k] = v; }
  return { v: 1, app: "charta", tipo: "copia", fecha: ahora.toISOString(), ...guardadas.exportar(), ajustes };
}

/** Texto de un archivo → copia comprobada ({ favoritos, recientes, ajustes, fecha }) o un Error con un mensaje claro. */
export function leerCopia(texto) {
  if (typeof texto !== "string" || texto.length > MAX_COPIA) throw new Error("El archivo es demasiado grande para ser una copia de Charta.");
  let d; try { d = JSON.parse(texto); } catch { throw new Error("El archivo no es una copia de Charta (no se puede leer)."); }
  if (!d || typeof d !== "object" || d.app !== "charta" || d.tipo !== "copia") throw new Error("El archivo no es una copia de Charta.");
  if (d.v !== 1) throw new Error("Esta copia es de una versión más nueva de Charta. Actualiza la app e inténtalo otra vez.");
  const lista = (x) => (Array.isArray(x) ? x : []);
  const ajustes = {};
  for (const [k, ok] of Object.entries(AJUSTES)) if (d.ajustes && Object.hasOwn(d.ajustes, k) && ok(d.ajustes[k])) ajustes[k] = d.ajustes[k];
  return { favoritos: lista(d.favoritos), recientes: lista(d.recientes), ajustes, fecha: String(d.fecha || "").slice(0, 10) };
}

/**
 * Aplica una copia leída. `reemplazar`: las listas y los ajustes de la copia sustituyen a los actuales; si no, se suman a las listas
 * (sin repetir) y los ajustes de la copia solo rellenan los que faltan.
 * → { favoritos, recientes, descartadas, ajustes } (cuántas fichas entran en cada lista, las que no valían y cuántos ajustes se ponen).
 */
export function aplicarCopia(copia, almacen, guardadas, { reemplazar = false, hayTipo } = {}) {
  const r = guardadas.importar(copia, { reemplazar, hayTipo });
  let ajustes = 0;
  for (const [k, v] of Object.entries(copia.ajustes)) {
    try { if (!reemplazar && almacen.getItem(k) !== null) continue; almacen.setItem(k, v); ajustes++; } catch {}
  }
  return { ...r, ajustes };
}

/**
 * Composición guardada → opciones de `generar(opciones, semilla)` (una variante, sin nombres). Es la misma lectura que hace Tabula
 * (`chartaOpciones` de tabula/js/combine-model.js; tests/test_contratos.js comprueba que coinciden). null si no sirve.
 */
export function opcionesDeComp(comp, hayTipo = () => true) {
  const c = composicionValida(comp, hayTipo);
  if (!c || !c.actividades.length) return null;
  const frases = Array.isArray(c.misFrases) && c.misFrases.length ? c.misFrases : null;
  const acts = frases ? c.actividades.map((a) => ({ ...a, params: { ...(a && a.params), misFrases: frases } })) : c.actividades;
  const cuentas = Array.isArray(c.paginas) && c.paginas.length && c.paginas.reduce((a, b) => a + (Number(b) || 0), 0) === acts.length ? c.paginas.map(Number) : [acts.length];
  let i = 0;
  const paginas = cuentas.map((n) => { const p = { actividades: acts.slice(i, i + n) }; i += n; return p; });
  const bn = !!c.bn;
  return { semilla: Number.isInteger(c.semilla) ? c.semilla : 1, bn, opciones: { paginas, variantes: 1, ...(c.titulo ? { titulo: String(c.titulo) } : {}),
    presentacion: { color: !bn, ...(c.fuente && c.fuente !== "andika" ? { fuente: c.fuente } : {}), ...(c.grande ? { letraGrande: true } : {}), ...(c.facil ? { lecturaFacil: true } : {}) } } };
}
