// Charta · recientes y favoritos (paso 4.4). Sin DOM: el almacén se inyecta (localStorage en la app).
// Se guarda la composición (actividades + páginas + opciones, semilla, título, variantes, B/N); NUNCA los nombres de los alumnos.
import { cuentasDe } from "./paginas.js";
import { normalizarPropias } from "../lengua/frases.js";
export const MAX_RECIENTES = 8;
export const MAX_FAVORITOS = 30;
const CLAVES = { recientes: "charta:recientes", favoritos: "charta:favoritos" };

/** «Mis frases» de una composición: una sola vez, en `misFrases` (fase 1, R4); las guardadas antes las llevaban en cada actividad. */
export const frasesComp = (c) => normalizarPropias(Array.isArray(c?.misFrases) ? c.misFrases
  : (c?.actividades || []).find((a) => Array.isArray(a?.params?.misFrases))?.params.misFrases);

/** Solo los campos permitidos (así ningún nombre de alumno puede colarse). */
export function limpiar(c) {
  const frases = frasesComp(c);
  return {
    actividades: c.actividades.map((a) => {
      const { misFrases: _, ...params } = a.params || {};
      return { tipo: a.tipo, ...(Number.isInteger(a.curso) && { curso: a.curso }), params };
    }),
    ...(cuentasDe(c).length > 1 && { paginas: cuentasDe(c) }),                  // varias páginas: actividades de cada una
    semilla: c.semilla | 0, titulo: c.titulo || "", variaciones: c.variaciones || "iguales", bn: !!c.bn, grande: !!c.grande, facil: !!c.facil,
    ...(c.fuente && c.fuente !== "andika" && { fuente: String(c.fuente) }),     // solo el nombre; la letra no viaja
    ...(frases && { misFrases: frases }),                                        // «Mis frases» (Lengua 1.º), una vez para toda la ficha
  };
}
// Se comparan normalizadas con limpiar(): las favoritas guardadas antes (sin los campos nuevos) siguen reconociéndose.
const igualSinSemilla = (a, b) => JSON.stringify({ ...limpiar(a), semilla: 0 }) === JSON.stringify({ ...limpiar(b), semilla: 0 });
const igual = (a, b) => igualSinSemilla(a, b) && a.semilla === b.semilla;

export function crearGuardadas(almacen) {
  const leer = (k) => { try { const v = JSON.parse(almacen.getItem(CLAVES[k]) || "[]"); return Array.isArray(v) ? v : []; } catch { return []; } };
  const escribir = (k, v) => { try { almacen.setItem(CLAVES[k], JSON.stringify(v)); } catch {} };
  return {
    recientes: () => leer("recientes"),
    favoritos: () => leer("favoritos"),
    /** Al imprimir: la composición pasa la primera (sin repetir la misma con otra semilla). */
    anotarReciente(c, nombre) {
      const x = { ...limpiar(c), nombre, fecha: new Date().toISOString().slice(0, 10) };
      escribir("recientes", [x, ...leer("recientes").filter((r) => !igualSinSemilla(r, x))].slice(0, MAX_RECIENTES));
    },
    esFavorito: (c) => leer("favoritos").some((f) => igual(f, limpiar(c))),
    /** Añade o quita; devuelve true si queda en favoritos. Guarda la semilla: sale la misma ficha. */
    alternarFavorito(c, nombre) {
      const x = limpiar(c), fs = leer("favoritos");
      if (fs.some((f) => igual(f, x))) { escribir("favoritos", fs.filter((f) => !igual(f, x))); return false; }
      escribir("favoritos", [{ ...x, nombre, fecha: new Date().toISOString().slice(0, 10) }, ...fs].slice(0, MAX_FAVORITOS));
      return true;
    },
    quitar(k, i) { const v = leer(k); v.splice(i, 1); escribir(k, v); },
  };
}
