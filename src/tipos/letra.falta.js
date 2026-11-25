// letra.falta · Pon la letra que falta (Lengua 1.º, lote 1; LENGUA_1.md §3, bloque 2).
// datos:    { palabra: "mesa" (en el caso elegido), pos: posición de la letra que falta, opciones: [3 letras] | null (sin ayuda) }
// solucion: { huecos: ["e"] }   la letra, en el mismo caso que la palabra.
// Reglas: la palabra está en el léxico y es la ÚNICA del léxico que encaja con el hueco (m_sa solo vale si no hay «masa», «misa»…);
//         las 2 letras de ayuda no forman otra palabra del léxico; el hueco nunca es una letra con tilde ni parte de ch, ll, rr, qu, gu.
// Opciones: ayuda (con tres letras / sin) · letra que falta (cualquiera / la primera) · tipo de sílabas · largo · caso. Palabras de hasta 8 letras, sin repetir.
// Cantidad: «Más grandes» 16 palabras (2 × 8; media: 8), «Más ejercicios» las que caben con tarjetas ≥ 64 pt (con ayuda) o 48 pt (sin ayuda).
import { registrar } from "../nucleo/tipos.js";
import { TOP, cuantosRejilla } from "../render/papel.js";
import { rodear, palabraHuecos } from "../lengua/dibujo.js";
import { LEXICO } from "../lengua/lexico.js";
import { permitida } from "../lengua/vistas.js";
import { esPalabra } from "../lengua/palabras.js";
import { alCaso, cuantas, elegirPalabras, largosDe, patronUnico, unidades, conTope, crece } from "./_lengua.js";

const MIN_ALTO = { ayuda: 64, sin: 48 };   // alto mínimo de tarjeta con «Más ejercicios»
const VOCALES = [..."aeiou"], CONSONANTES = [..."bcdfgjlmnprstvz"];
/** Posiciones (índice de letra) que pueden quedar en hueco: letras sueltas sin tilde (no dígrafos, ü ni «y»). */
export function posiblesHuecos(p) {
  let i = 0; const out = [];
  for (const u of unidades(p)) { if (u.length === 1 && /[a-zñ]/.test(u) && u !== "y") out.push(i); i += u.length; }
  return out;
}
const cambia = (p, i, c) => p.slice(0, i) + c + p.slice(i + 1);

export default registrar({
  id: "letra.falta",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const min = params.ayuda !== "sin" ? MIN_ALTO.ayuda : MIN_ALTO.sin;
    return conTope(cuantosRejilla(ctx, 2, min, [16, 8]), cuantas(ctx.tamano, 16), (n) => elegir(params, azar, n));
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.rejilla(TOP, 2, Math.ceil(act.ejercicios.length / 2)), k = crece(ch, 80);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { palabra, pos, opciones } = e.datos;
      p.marco(x, y, cw, ch, i);
      const conAyuda = !!opciones, ha = Math.min(30 * k, ch * 0.4), h1 = conAyuda ? ch - ha - 6 : ch, y1 = conAyuda ? y + ha + 2 : y;
      palabraHuecos(p, x + 30, y1, cw - 40, h1 - (conAyuda ? 6 : 0), palabra, [{ pos, largo: 1, sol: e.solucion.huecos[0] }], { fs: Math.min(28 * k, h1 * 0.8) });
      if (conAyuda) rodear(p, x + 30, y + 4, cw - 40, ha, opciones, [], { fs: Math.min(19 * k, ha * 0.63), gap: 14, tarjeta: true });
    }));
  },
});

function elegir(params, azar, n) {
  const ayuda = params.ayuda !== "sin";
  const ok = (e, az) => {
    let ps = posiblesHuecos(e.p);
    if (params.hueco === "primera") ps = ps.filter((i) => i === 0);
    ps = ps.filter((i) => patronUnico(e.p, [i]));
    if (!ps.length) return null;
    const pos = az.elegir(ps), real = e.p[pos];
    if (!ayuda) return { pos, opciones: null };
    const fam = VOCALES.includes(real) ? VOCALES : CONSONANTES;
    const malas = az.barajar(fam.filter((c) => c !== real && permitida(c) && !esPalabra(cambia(e.p, pos, c)) && !(pos === 0 && params.caso === "inicial" && c === "i")));
    if (malas.length < 2) return null;
    return { pos, opciones: az.barajar([real, malas[0], malas[1]]) };
  };
  const ps = elegirPalabras(azar, n, params, largosDe(params, [2, 3, 2, 3, 1, 4]), { extra: { maxLetras: 8 }, ok, id: "letra.falta" });
  return {
    enunciado: ayuda ? "Elige la letra que falta y escríbela\nen el cuadro gris." : "Escribe la letra que falta\nen el cuadro gris.",
    ejercicios: ps.map(({ p: w, r }) => {
      const palabra = alCaso(w, params.caso), mayus = params.caso === "mayus" || (params.caso === "inicial" && r.pos === 0);
      return { datos: { palabra, pos: r.pos, opciones: r.opciones && r.opciones.map((c) => (mayus ? c.toUpperCase() : c)) }, solucion: { huecos: [palabra[r.pos]] } };
    }),
  };
}
