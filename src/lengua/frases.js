// Charta · Lengua de 1.º · frases que no salen de las plantillas de _frase.js:
//   · FRASES_1 (datos/frases_1.tsv): frases para las primeras letras, por etapas. Solo entran con letras elegidas (mapa de letras):
//     con todas las letras, las fichas son las de siempre.
//   · «Mis frases»: las que escribe la maestra. Viajan en `params.misFrases` de las actividades que usan frases (como `params.vistas`)
//     y generar() las activa mientras genera esa actividad (conPropias). Siempre entran.
// Sin DOM.
import { ABECEDARIO, sinTildes } from "./reglas.js";

/** Tipos que sacan frases del banco y admiten frases libres (sin estructura: no sirven para «completa», «verdad» ni «libre»). */
export const USA_FRASES = new Set(["frase.ordena", "frase.separa", "frase.puntua", "escritura.frase", "escritura.dictado", "lectura.fluidez"]);
export const MAX_PROPIAS = 60;
export const MAX_LARGO = 60;

const LETRA = new RegExp(`^[${ABECEDARIO.join("")}áéíóúü]+$`, "i");
/**
 * Texto de la caja «Mis frases» (una por línea) → { frases: ["Mi mamá me mima.", …], errores: ["línea 3: …"] }.
 * Cada frase: de 3 a 5 palabras, solo letras; se le pone mayúscula y punto si faltan. Sin repetir; como mucho MAX_PROPIAS.
 */
export function leerPropias(texto) {
  const frases = [], errores = [], vistas = new Set();
  String(texto || "").split(/\r?\n/).forEach((l, i) => {
    let t = l.trim().replace(/\s+/g, " ").replace(/[.]+$/, "").trim();
    if (!t) return;
    const ws = t.split(" ");
    const mal = (m) => errores.push(`Línea ${i + 1} («${l.trim()}»): ${m}`);
    if (t.length > MAX_LARGO) return mal("es demasiado larga.");
    if (ws.length < 3 || ws.length > 5) return mal(`tiene ${ws.length} palabra${ws.length > 1 ? "s" : ""}; han de ser de 3 a 5.`);
    if (!ws.every((w) => LETRA.test(w))) return mal("solo puede llevar letras (sin comas ni otros signos).");
    t = t[0].toUpperCase() + t.slice(1) + ".";
    if (vistas.has(t.toLowerCase())) return;
    if (frases.length >= MAX_PROPIAS) return mal(`caben ${MAX_PROPIAS} frases como mucho.`);
    vistas.add(t.toLowerCase()); frases.push(t);
  });
  return { frases, errores };
}

/** Lista de frases para `params.misFrases` (normalizada) o null si no hay. */
export function normalizarPropias(lista) {
  if (!Array.isArray(lista)) return null;
  const { frases } = leerPropias(lista.filter((x) => typeof x === "string").join("\n"));
  return frases.length ? frases : null;
}

/** Palabras de una frase (sin el punto). La primera va en minúscula salvo que sea un nombre propio (sale con mayúscula en otra frase o en `nombres`). */
export function palabrasLibres(t, nombres) {
  const ws = t.replace(/\.$/, "").split(" ");
  if (!nombres.has(ws[0])) ws[0] = ws[0][0].toLowerCase() + ws[0].slice(1);
  return ws;
}
/** Nombres propios de una lista de frases: palabras con mayúscula que no van al principio. */
export const nombresDe = (frases) => new Set(frases.flatMap((t) => t.replace(/\.$/, "").split(" ").slice(1).filter((w) => w[0] !== w[0].toLowerCase())));

let activas = null;   // lista de textos o null
/** Ejecuta f con esas frases propias activas (y las quita después). */
export function conPropias(lista, f) {
  const antes = activas;
  activas = lista && lista.length ? lista : null;
  try { return f(); } finally { activas = antes; }
}
export const propiasActivas = () => activas;

/** Letras de una frase (sin tildes, en minúscula, sin repetir), para enseñar qué hace falta marcar. */
export const letrasFrase = (t) => [...new Set([...sinTildes(t.toLowerCase())].filter((c) => ABECEDARIO.includes(c)))];
