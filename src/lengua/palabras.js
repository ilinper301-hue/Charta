// Charta · Lengua · buscar palabras en el léxico de 1.º con los filtros de las opciones comunes (LENGUA_1.md, §2).
// Las sílabas se calculan una vez por palabra (caché). Sin DOM.
import { LEXICO } from "./lexico.js";
import { silabas, tipoSilaba, TIPOS_SILABA, soloLetras, llevaLetra } from "./reglas.js";
import { permitida, obligada, avisoVistas } from "./vistas.js";

const info = new Map();
/** Datos calculados de una palabra del léxico: sílabas y tipos de sílaba. */
export function datosPalabra(e) {
  if (!info.has(e.p)) { const s = silabas(e.p); info.set(e.p, { s, tipos: s.map(tipoSilaba) }); }
  return info.get(e.p);
}

/** Palabras que cumplen los filtros (todos opcionales):
 *  cat ("n" | "v" | "a" | "o" o lista), campos (lista: alguno), nSilabas (número o lista), tipo ("directas"… "mixtas"),
 *  letras (letras vistas: cadena o lista), conLetra (todas la llevan), dibujo (true: solo dibujables), frec (máxima), sin (palabras a excluir),
 *  minLetras / maxLetras. */
export function buscar({ cat, campos, nSilabas, tipo, letras, conLetra, dibujo, frec, sin, minLetras, maxLetras } = {}) {
  const cats = cat ? [].concat(cat) : null, ns = nSilabas ? [].concat(nSilabas) : null, fuera = sin ? new Set(sin) : null;
  return LEXICO.filter((e) => {
    if (cats && !cats.includes(e.c)) return false;
    if (campos && !campos.some((k) => e.k.includes(k))) return false;
    if (dibujo && !e.d) return false;
    if (frec && e.f > frec) return false;
    if (fuera && fuera.has(e.p)) return false;
    const n = [...e.p].length;
    if ((minLetras && n < minLetras) || (maxLetras && n > maxLetras)) return false;
    if (letras && !soloLetras(e.p, letras)) return false;
    if (!permitida(e.p)) return false;   // letras elegidas en el diseño (vistas.js)
    if (!obligada(e.p)) return false;    // letra obligatoria (pulsación larga en el mapa)
    if (conLetra && !llevaLetra(e.p, conLetra)) return false;
    const d = datosPalabra(e);
    if (ns && !ns.includes(d.s.length)) return false;
    if (tipo && !d.tipos.every((t) => TIPOS_SILABA[tipo].includes(t))) return false;
    return true;
  });
}

/** k palabras distintas al azar con esos filtros; error claro si no hay bastantes (la invariante lo comprobará en cada opción). */
export function elegirPalabras(azar, k, filtros = {}) {
  const ps = buscar(filtros);
  if (ps.length < k) throw new Error(`Solo hay ${ps.length} palabras con esas opciones (hacen falta ${k}).` + avisoVistas());
  return azar.muestra(ps, k);
}

export const CAMPOS_LEXICOS = ["animales", "comida", "ropa", "casa", "escuela", "cuerpo", "juguetes", "transportes", "familia", "naturaleza", "colores", "oficios"];
export const palabra = (p) => LEXICO.find((e) => e.p === p) || null;
