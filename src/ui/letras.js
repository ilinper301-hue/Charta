// Charta · mapa de letras (Lengua de 1.º), sin DOM: qué actividades lo admiten y cómo viajan las letras.
// Las letras van en `params.vistas` de cada actividad de Lengua de 1.º (composición, favoritas, nube, Tabula y Fori).
// Todas marcadas = sin el campo: la ficha es la de siempre.
import { modelo, esLengua1 } from "../nucleo/ficha.js";
import { ABECEDARIO } from "../lengua/reglas.js";
import { normalizarVistas, normalizarObligatorias, conVistas, permitida } from "../lengua/vistas.js";
import { USA_FRASES, leerPropias } from "../lengua/frases.js";


export const VOCALES = "aeiou";
export const CLAVE_LETRAS = "charta:letras";   // las últimas marcadas (las que lleva la clase): se proponen en fichas nuevas
export const CLAVE_OBLIGATORIAS = "charta:letrasObligatorias";   // las obligatorias (pulsación larga): la letra que se está enseñando

const admite = (a) => { try { return esLengua1(modelo(a.tipo), a.curso); } catch { return false; } };
/** ¿Alguna actividad admite el mapa de letras? */
export const hayLengua1 = (acts) => acts.some(admite);
/** Las actividades con las letras puestas (vistas = cadena; null = todas; "" = ninguna → error claro)
 *  y las obligatorias (cadena o null: cada palabra o frase lleva al menos una). */
export function conLetras(acts, vistas, obligatorias = null) {
  if (vistas === "" && acts.some(admite)) throw new Error("Marca alguna letra en «Letras».");
  const ob = normalizarObligatorias(obligatorias);
  return acts.map((a) => {
    const { vistas: _, obligatorias: __, ...params } = a.params || {};
    if (!admite(a)) return { ...a, params };
    return { ...a, params: { ...params, ...(vistas && { vistas }), ...(ob && { obligatorias: ob }) } };
  });
}
/** Letras obligatorias de una composición guardada (las de su primera actividad de Lengua de 1.º que las lleve) o null. */
export const obligatoriasDe = (c) => normalizarObligatorias((c?.actividades || []).find((a) => admite(a) && a.params?.obligatorias)?.params.obligatorias);
/** Letras de una composición guardada (las de su primera actividad de Lengua de 1.º) o null (todas). */
export const letrasDe = (c) => normalizarVistas((c?.actividades || []).find((a) => admite(a) && a.params?.vistas)?.params.vistas);
/** Conjunto marcado → cadena para la ficha: null si están todas, "" si ninguna. */
export function vistasDe(marcadas) {
  const s = ABECEDARIO.filter((l) => marcadas.has(l)).join("");
  return s.length === ABECEDARIO.length ? null : s;
}
/** Texto del contador: «Todas» · «Solo vocales» · «12 de 27». */
export function resumenLetras(marcadas, obligatorias = new Set()) {
  const ob = ABECEDARIO.filter((l) => obligatorias.has(l));
  const r = resumenSolo(marcadas);
  return ob.length ? `${r} · obligatoria${ob.length > 1 ? "s" : ""}: ${ob.join(", ")}` : r;
}
function resumenSolo(marcadas) {
  const n = ABECEDARIO.filter((l) => marcadas.has(l)).length;
  if (n === ABECEDARIO.length) return "Todas";
  if (!n) return "Ninguna";
  if (n === 5 && [...VOCALES].every((v) => marcadas.has(v))) return "Solo vocales";
  return `${n} de ${ABECEDARIO.length}`;
}

// «Mis frases» (Lengua de 1.º): en la composición van UNA vez (`misFrases`, fase 1 R4); al generar, conFrases() las pone
// en `params.misFrases` de las actividades que usan frases (USA_FRASES), que es lo que lee generar().
export const CLAVE_FRASES = "charta:misFrases";   // las últimas escritas (las de la clase)
const usaFrases = (a) => admite(a) && USA_FRASES.has(a.tipo);
/** ¿Alguna actividad usa frases? (para enseñar la caja «Mis frases»). */
export const hayFrases = (acts) => acts.some(usaFrases);
/** Las actividades con las frases propias puestas (lista de textos ya leída con leerPropias; vacía = sin el campo). */
export function conFrases(acts, frases) {
  return acts.map((a) => {
    const { misFrases: _, ...params } = a.params || {};
    return usaFrases(a) && frases?.length ? { ...a, params: { ...params, misFrases: frases } } : { ...a, params };
  });
}
/** Frases propias de una composición guardada (`misFrases`; en las antiguas, las de su primera actividad que las lleve) o []. */
export const frasesDe = (c) => (Array.isArray(c?.misFrases) ? c.misFrases : (c?.actividades || []).find((a) => usaFrases(a) && Array.isArray(a.params?.misFrases))?.params.misFrases) || [];
/** Resumen de la caja: { frases, cuenta: "3", info: "…" } con los errores y las que no salen con las letras marcadas (vistas = cadena o null). */
export function resumenFrases(texto, vistas) {
  const { frases, errores } = leerPropias(texto);
  const fuera = vistas ? frases.filter((t) => !conVistas(vistas, () => permitida(t))) : [];
  const partes = [...errores];
  if (fuera.length) partes.push(`Con las letras marcadas no ${fuera.length > 1 ? "salen" : "sale"}: ${fuera.map((t) => `«${t}»`).join(", ")}.`);
  return { frases, cuenta: frases.length ? String(frases.length) : "", info: partes.join(" ") };
}
