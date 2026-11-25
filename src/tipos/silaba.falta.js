// silaba.falta · Pon la sílaba que falta (Lengua 1.º, lote 1; LENGUA_1.md §3, bloque 3).
// datos:    { palabra (en el caso elegido), pos: posición de la letra donde empieza la sílaba que falta, largo: letras que tiene, opciones: [3 sílabas] | null (sin ayuda) }
// solucion: { huecos: [sílaba] }   en el mismo caso que la palabra.
// Reglas: palabra del léxico con el silabeo de reglas.js y 2–4 sílabas; es la ÚNICA del léxico con esas otras sílabas (pe__ta no vale si hay otra palabra «pe…ta»);
//         las 2 sílabas de ayuda son del mismo tipo que la correcta, distintas (sin tildes), sin pistas (llevan tilde solo si la lleva la correcta; sin k, w, x, y, ü salvo la correcta) y no forman otra palabra del léxico. Palabras de hasta 9 letras, sin repetir.
// Opciones: ayuda (con tres sílabas / sin) · sílaba que falta (cualquiera / primera / última) · sílabas (variadas, 2, 3 o 4) · tipo de sílabas · caso.
// Cantidad: 2 columnas; con ayuda, palabra arriba y las 3 sílabas debajo; «Más grandes» 20 palabras (media: 10), «Más ejercicios» las que caben con tarjetas ≥ 50 pt.
import { registrar } from "../nucleo/tipos.js";
import { TOP, cuantosRejilla } from "../render/papel.js";
import { silabas, tipoSilaba, sinTildes } from "../lengua/reglas.js";
import { rodear, palabraHuecos } from "../lengua/dibujo.js";
import { LEXICO } from "../lengua/lexico.js";
import { datosPalabra, esPalabra, porNivelDe } from "../lengua/palabras.js";
import { alCaso, cuantas, elegirPalabras, largosDe, candidatas, conTope, dosFilas } from "./_lengua.js";

const MIN_ALTO = 50;   // alto mínimo de tarjeta con «Más ejercicios»
const entradas = porNivelDe((L) => L.map((e) => ({ p: e.p, s: datosPalabra(e).s.map(sinTildes) })));
/** ¿Es la única palabra del léxico con esas otras sílabas (todas menos la k)? */
export function unicaSilaba(palabra, k) {
  const ss = silabas(palabra).map(sinTildes);
  return !entradas().some((o) => o.p !== palabra && o.s.length === ss.length && o.s.every((s, i) => i === k || s === ss[i]));
}

export default registrar({
  id: "silaba.falta",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const n = cuantosRejilla(ctx, 2, MIN_ALTO, [20, 10]), ayuda = params.ayuda !== "sin", tipo = params.tipo || "directas";
    // Sílabas que pueden servir de ayuda, por tipo (de las palabras del léxico que caben en el tipo pedido).
    const reserva = {};
    for (const e of candidatas(params)) for (const s of datosPalabra(e).s) (reserva[tipoSilaba(s)] ??= new Set()).add(s);
    const ok = (e, az) => {
      const ss = silabas(e.p);
      let ks = ss.map((_, k) => k);
      if (params.hueco === "primera") ks = [0]; else if (params.hueco === "ultima") ks = [ss.length - 1];
      ks = ks.filter((k) => unicaSilaba(e.p, k));
      if (!ks.length) return null;
      const k = az.elegir(ks);
      if (!ayuda) return { k, opciones: null };
      const real = ss[k], pre = ss.slice(0, k).join(""), post = ss.slice(k + 1).join("");
      const raras = /[kwxyü]/, tilde = (s) => /[áéíóú]/.test(s);
      const valen = (s) => sinTildes(s) !== sinTildes(real) && !esPalabra(pre + s + post) && tilde(s) === tilde(real) && (!raras.test(s) || raras.test(real)) && s.length > 1 === real.length > 1;   // sin pistas: la tilde y las letras raras no delatan la buena
      const malas = [...new Map(az.barajar([...reserva[tipoSilaba(real)]].filter(valen)).map((s) => [sinTildes(s), s])).values()];
      if (malas.length < 2) return null;
      return { k, opciones: az.barajar([real, malas[0], malas[1]]) };
    };
    const ps = conTope(n, cuantas(ctx.tamano, 10), (k) => elegirPalabras(azar, k, params, largosDe(params, [2, 3, 2, 3, 4]), { extra: { maxLetras: 9 }, ok, id: "silaba.falta" }));
    return {
      enunciado: ayuda ? "Elige la sílaba que falta y escríbela\nen el cuadro gris." : "Escribe la sílaba que falta\nen el cuadro gris.",
      ejercicios: ps.map(({ p: w, r }) => {
        const ss = silabas(w), palabra = alCaso(w, params.caso), pos = ss.slice(0, r.k).join("").length, largo = ss[r.k].length;
        const mayus = params.caso === "mayus" || (params.caso === "inicial" && r.k === 0);
        return { datos: { palabra, pos, largo, opciones: r.opciones && r.opciones.map((s) => (mayus ? alCaso(s, params.caso === "mayus" ? "mayus" : "inicial") : s)) }, solucion: { huecos: [palabra.slice(pos, pos + largo)] } };
      }),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.rejilla(TOP, 2, Math.ceil(act.ejercicios.length / 2)), x0 = 32, w = cw - x0 - 10;
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { palabra, pos, largo, opciones } = e.datos, hu = [{ pos, largo, sol: e.solucion.huecos[0] }];
      p.marco(x, y, cw, ch, i);
      if (opciones) {
        const { arriba, abajo } = dosFilas(y, ch);
        palabraHuecos(p, x + x0, arriba.y, w, arriba.h, palabra, hu, { fs: Math.min(26, arriba.h * 0.8) });
        rodear(p, x + x0, abajo.y, w, abajo.h, opciones, [], { fs: Math.min(20, abajo.h / 1.55), gap: 12, tarjeta: true });
      } else palabraHuecos(p, x + x0, y, w, ch, palabra, hu, { fs: Math.min(28, ch * 0.45) });
    }));
  },
});
