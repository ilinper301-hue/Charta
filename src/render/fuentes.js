// Charta · letras de las fichas: Andika (la de siempre), Fredoka (incrustada) y las que suba la maestra (guardadas en el dispositivo).
// Una fuente = { id, nombre, css (font-family para SVG), ancho(texto, negrita, fs) en pt }. El id va en `ficha.presentacion.fuente`
// (solo si no es Andika, así las fichas anteriores no cambian): "fredoka" o "usuario:<Nombre>".
// Las fuentes subidas NO viajan con la ficha (solo su nombre): en otro dispositivo sin esa letra se usa Andika.
import { ancho as anchoAndika } from "../rep/index.js";
import { FREDOKA_R, FREDOKA_B } from "./anchos_fredoka.js";

export const ANDIKA_CSS = "Andika, Poppins, sans-serif";
const midiendo = (T) => (t, negrita, fs) => { let s = 0; for (const ch of String(t)) s += (negrita ? T.B : T.R)[ch] ?? (negrita ? T.B : T.R)["n"] ?? 560; return s * fs / 1000; };

const ANDIKA = { id: "andika", nombre: "Andika", css: ANDIKA_CSS, ancho: (t, n, fs) => anchoAndika(String(t), n, fs) };
const FREDOKA = { id: "fredoka", nombre: "Fredoka", css: "Fredoka, Andika, sans-serif", ancho: midiendo({ R: FREDOKA_R, B: FREDOKA_B }) };
export const FUENTES_INCLUIDAS = [ANDIKA, FREDOKA];
export const FUENTE_POR_DEFECTO = ANDIKA;

/** Nombre de familia seguro para CSS/SVG a partir del nombre de un archivo: letras, números, espacios y guiones. */
export function nombreFuente(archivo) {
  const base = String(archivo).replace(/\.[a-z0-9]+$/i, "").replace(/[^\p{L}\p{N} _-]/gu, "").replace(/[_ ]+/g, " ").trim().slice(0, 40);
  return base || "Mi letra";
}

/** Medidor de las fuentes subidas: canvas en el navegador (la letra ya cargada); en Node, anchuras de Andika (aproximadas). */
let ctx;
function medidor(nombre) {
  return (t, negrita, fs) => {
    try {
      ctx ||= (typeof document !== "undefined" ? document.createElement("canvas").getContext("2d") : null);
      if (!ctx) return anchoAndika(String(t), negrita, fs);
      ctx.font = `${negrita ? 700 : 400} 100px "${nombre}"`;
      return ctx.measureText(String(t)).width * fs / 100;
    } catch { return anchoAndika(String(t), negrita, fs); }
  };
}

const instaladas = new Map();     // nombre → fuente de usuario disponible en este dispositivo
export function registrarFuenteUsuario(nombre) {
  const f = { id: "usuario:" + nombre, nombre, css: `"${nombre}", Andika, sans-serif`, ancho: medidor(nombre), usuario: true };
  instaladas.set(nombre, f); return f;
}
export function quitarFuenteUsuario(nombre) { instaladas.delete(nombre); }
export const fuentesUsuario = () => [...instaladas.values()];
export const todasLasFuentes = () => [...FUENTES_INCLUIDAS, ...fuentesUsuario()];

/** Fuente por id; si no existe (p. ej. una letra subida en otro dispositivo) → Andika. */
export function fuentePorId(id) { return todasLasFuentes().find((f) => f.id === id) || FUENTE_POR_DEFECTO; }
/** Fuente de una ficha (presentacion.fuente). */
export const fuenteDe = (ficha) => fuentePorId(ficha?.presentacion?.fuente);
