// silaba.falta · Pon la sílaba que falta (Lengua 1.º, lote 1; LENGUA_1.md §3, bloque 3).
// datos:    { palabra (en el caso elegido), pos: posición de la letra donde empieza la sílaba que falta, largo: letras que tiene, opciones: [3 sílabas] | null (sin ayuda) }
// solucion: { huecos: [sílaba] }   en el mismo caso que la palabra.
// Reglas: palabra del léxico con el silabeo de reglas.js y 2–4 sílabas; es la ÚNICA del léxico con esas otras sílabas (pe__ta no vale si hay otra palabra «pe…ta»);
//         las 2 sílabas de ayuda son del mismo tipo que la correcta, distintas (sin tildes), sin pistas (llevan tilde solo si la lleva la correcta; sin k, w, x, y, ü salvo la correcta) y no forman otra palabra del léxico. Palabras de hasta 9 letras, sin repetir.
// Opciones: ayuda (con tres sílabas / sin) · sílaba que falta (cualquiera / primera / última) · sílabas (variadas, 2, 3 o 4) · tipo de sílabas · caso.
// Completa: 10 palabras; media: 5.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { silabas, tipoSilaba, sinTildes } from "../lengua/reglas.js";
import { rodear, palabraHuecos } from "../lengua/dibujo.js";
import { LEXICO } from "../lengua/lexico.js";
import { datosPalabra } from "../lengua/palabras.js";
import { alCaso, cuantas, elegirPalabras, largosDe, candidatas } from "./_lengua.js";

const PALABRAS = new Set(LEXICO.map((e) => e.p));
const ENTRADAS = LEXICO.map((e) => ({ p: e.p, s: datosPalabra(e).s.map(sinTildes) }));
/** ¿Es la única palabra del léxico con esas otras sílabas (todas menos la k)? */
export function unicaSilaba(palabra, k) {
  const ss = silabas(palabra).map(sinTildes);
  return !ENTRADAS.some((o) => o.p !== palabra && o.s.length === ss.length && o.s.every((s, i) => i === k || s === ss[i]));
}

export default registrar({
  id: "silaba.falta",
  version: 1,
  generar(params, azar, { tamano }) {
    const n = cuantas(tamano, 10), ayuda = params.ayuda !== "sin", tipo = params.tipo || "directas";
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
      const valen = (s) => sinTildes(s) !== sinTildes(real) && !PALABRAS.has(pre + s + post) && tilde(s) === tilde(real) && (!raras.test(s) || raras.test(real)) && s.length > 1 === real.length > 1;   // sin pistas: la tilde y las letras raras no delatan la buena
      const malas = [...new Map(az.barajar([...reserva[tipoSilaba(real)]].filter(valen)).map((s) => [sinTildes(s), s])).values()];
      if (malas.length < 2) return null;
      return { k, opciones: az.barajar([real, malas[0], malas[1]]) };
    };
    const ps = elegirPalabras(azar, n, params, largosDe(params, [2, 3, 2, 3, 4]), { extra: { maxLetras: 9 }, ok, id: "silaba.falta" });
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
    const { cel, cw, ch } = p.celdas(TOP, 1, 10, 10, 8);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { palabra, pos, largo, opciones } = e.datos, hu = [{ pos, largo, sol: e.solucion.huecos[0] }];
      p.marco(x, y, cw, ch, i);
      if (opciones) {
        palabraHuecos(p, x + 34, y, cw * 0.5 - 20, ch, palabra, hu, { fs: 26 });
        rodear(p, x + cw * 0.53, y, cw * 0.45, ch, opciones, [], { fs: 20, gap: 12, tarjeta: true });
      } else palabraHuecos(p, x + 34, y, cw - 48, ch, palabra, hu, { fs: 28 });
    }));
  },
});
