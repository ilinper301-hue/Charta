// Charta · mapa de letras (Lengua de 1.º), sin DOM: qué actividades lo admiten y cómo viajan las letras.
// Las letras van en `params.vistas` de cada actividad de Lengua de 1.º (composición, favoritas, nube, Tabula y Fori).
// Todas marcadas = sin el campo: la ficha es la de siempre.
import { modelo, esLengua1 } from "../nucleo/ficha.js";
import { ABECEDARIO } from "../lengua/reglas.js";
import { normalizarVistas } from "../lengua/vistas.js";


export const VOCALES = "aeiou";
export const CLAVE_LETRAS = "charta:letras";   // las últimas marcadas (las que lleva la clase): se proponen en fichas nuevas

const admite = (a) => { try { return esLengua1(modelo(a.tipo), a.curso); } catch { return false; } };
/** ¿Alguna actividad admite el mapa de letras? */
export const hayLengua1 = (acts) => acts.some(admite);
/** Las actividades con las letras puestas (vistas = cadena; null = todas; "" = ninguna → error claro). */
export function conLetras(acts, vistas) {
  if (vistas === "" && acts.some(admite)) throw new Error("Marca alguna letra en «Letras».");
  return acts.map((a) => {
    const { vistas: _, ...params } = a.params || {};
    return admite(a) && vistas ? { ...a, params: { ...params, vistas } } : { ...a, params };
  });
}
/** Letras de una composición guardada (las de su primera actividad de Lengua de 1.º) o null (todas). */
export const letrasDe = (c) => normalizarVistas((c?.actividades || []).find((a) => admite(a) && a.params?.vistas)?.params.vistas);
/** Conjunto marcado → cadena para la ficha: null si están todas, "" si ninguna. */
export function vistasDe(marcadas) {
  const s = ABECEDARIO.filter((l) => marcadas.has(l)).join("");
  return s.length === ABECEDARIO.length ? null : s;
}
/** Texto del contador: «Todas» · «Solo vocales» · «12 de 27». */
export function resumenLetras(marcadas) {
  const n = ABECEDARIO.filter((l) => marcadas.has(l)).length;
  if (n === ABECEDARIO.length) return "Todas";
  if (!n) return "Ninguna";
  if (n === 5 && [...VOCALES].every((v) => marcadas.has(v))) return "Solo vocales";
  return `${n} de ${ABECEDARIO.length}`;
}
