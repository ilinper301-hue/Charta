// Charta · Lengua de 1.º · letras elegidas por la maestra (el «mapa de letras» del diseño).
// generar() activa las letras mientras genera cada actividad de Lengua (conVistas); buscar() y los bancos
// (frases, textos, adivinanzas…) solo dejan pasar lo que se escribe con esas letras. Sin letras: todo vale
// (las fichas de siempre no cambian). Las vocales con tilde o diéresis cuentan como su vocal. Sin DOM.
import { ABECEDARIO, sinTildes } from "./reglas.js";

let activas = null;   // Set de letras o null (todas)

/** Cadena normalizada (orden del abecedario, sin repetir) o null si están todas o no es válida. */
export function normalizarVistas(v) {
  if (v == null || v === "") return null;
  const s = new Set([...sinTildes(String(v).toLowerCase())]);
  const out = ABECEDARIO.filter((c) => s.has(c)).join("");
  return out.length === ABECEDARIO.length ? null : out;
}
/** Ejecuta f con esas letras activas (y las quita después, aunque f falle). */
export function conVistas(vistas, f) {
  const antes = activas;
  activas = vistas ? new Set(vistas) : null;
  try { return f(); } finally { activas = antes; }
}
/** Letras activas (cadena) o null. Sirve de clave de caché. */
export const vistasActivas = () => (activas ? [...activas].join("") : null);
/** ¿El texto se escribe solo con las letras activas? (ignora espacios, signos y números). */
export function permitida(texto) {
  if (!activas) return true;
  for (const c of sinTildes(String(texto).toLowerCase())) if (/\p{L}/u.test(c) && !activas.has(c)) return false;
  return true;
}
/** Elementos de la lista cuyo texto (f) usa solo las letras activas. */
export const filtrarVistas = (lista, f = (x) => x) => (activas ? lista.filter((x) => permitida(f(x))) : lista);
/** Letras activas como lista (o todo el abecedario). */
export const letrasActivas = () => (activas ? ABECEDARIO.filter((c) => activas.has(c)) : [...ABECEDARIO]);
/** Aviso para los errores «no hay bastantes»: solo si hay letras elegidas. */
export const avisoVistas = () => (activas ? " Con las letras elegidas no hay bastantes: marca más letras en «Letras»." : "");
