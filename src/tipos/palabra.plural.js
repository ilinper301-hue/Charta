// palabra.plural · Uno y muchos (Lengua 1.º, lote 2; LENGUA_1.md §3, bloque 4).
// datos:    { palabra (la que se ve: singular, o plural si «de muchos a uno»; en el caso elegido), sentido: "plural" | "singular" (lo que se escribe) }
// solucion: { huecos: [la palabra pedida] }
// Reglas: nombre del léxico de 3 a 8 letras; el plural es el de reglas.js (plural()) y no cambia de tilde ni es igual al singular (camión → camiones queda fuera).
//         «Solo -s»: nombres acabados en vocal sin tilde. «-s y -es»: un tercio acaba en consonante (flor → flores, pez → peces, rey → reyes) y el resto en vocal.
//         Sin repetidos. Cantidad: 2 columnas; «Más grandes» 24 (media: 12), «Más ejercicios» las que caben con tarjetas ≥ 40 pt.
// Con letras elegidas (vistas.js): el singular y el plural (los dos se leen o se escriben) usan solo ellas.
// Opciones: plurales (solo -s / -s y -es) · sentido (de uno a muchos / de muchos a uno) · letra (minúscula / MAYÚSCULA).
import { registrar } from "../nucleo/tipos.js";
import { TOP, cuantosRejilla } from "../render/papel.js";
import { plural } from "../lengua/reglas.js";
import { filtrarVistas, avisoVistas } from "../lengua/vistas.js";
import { cuantas, ajusta, conTope } from "./_lengua.js";
import { nombres } from "./_palabra.js";
import { porNivelDe } from "../lengua/palabras.js";

const MIN_ALTO = 40;   // alto mínimo de tarjeta con «Más ejercicios»
const simples = porNivelDe(() => nombres().filter((e) => e.p.length <= 8));
const enVocal = (e) => /[aeiou]$/.test(e.p) && plural(e.p) === e.p + "s";
const enConsonante = (e) => !/[aeiouáéíóú]$/.test(e.p) && /es$/.test(plural(e.p));

export default registrar({
  id: "palabra.plural",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    return conTope(cuantosRejilla(ctx, 2, MIN_ALTO, [24, 12]), cuantas(ctx.tamano, 12), (n) => elegir(params, azar, n));
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.rejilla(TOP, 2, Math.ceil(act.ejercicios.length / 2)), wp = 96, bx = 32 + wp + 20;
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], bh = Math.min(36, ch * 0.7);
      p.marco(x, y, cw, ch, i);
      const fs = ajusta(p, (q) => p.ancho(e.datos.palabra, "PB", q), wp, Math.min(26, ch * 0.5), 10);
      p.text(x + 32, y + ch / 2 - fs * 0.35, e.datos.palabra, fs, { f: "PB" });
      p.text(x + bx - 10, y + ch / 2 - 16 * 0.35, "→", 16, { f: "PB", anchor: "middle", gris: 0.4 });
      p.caja(x + bx, y + (ch - bh) / 2, cw - bx - 10, bh, null, 22, e.solucion.huecos[0]);
    }));
  },
});

/** n nombres y su plural (n/3 en -es con «-s y -es»). */
function elegir(params, azar, n) {
  const conEs = params.plural === "es", reves = params.sentido === "alreves";
  const nEs = conEs ? Math.round(n / 3) : 0;
  const ambos = filtrarVistas(simples(), (e) => e.p + " " + plural(e.p));
  const conso = azar.barajar(ambos.filter(enConsonante)), vocal = azar.barajar(ambos.filter(enVocal));
  if (conso.length < nEs || vocal.length < n - nEs) throw new Error("«palabra.plural» necesita más nombres en el léxico para esas opciones." + avisoVistas());
  const elegidos = [...conso.slice(0, nEs), ...vocal.slice(0, n - nEs)];
  const mayus = params.caso === "mayus", f = (t) => (mayus ? t.toUpperCase() : t);
  return {
    enunciado: reves ? "Escribe cada palabra en singular:\nuna sola cosa." : "Escribe cada palabra en plural:\nmuchas cosas.",
    ejercicios: azar.barajar(elegidos).map((e) => {
      const pl = plural(e.p);
      return reves ? { datos: { palabra: f(pl), sentido: "singular" }, solucion: { huecos: [f(e.p)] } } : { datos: { palabra: f(e.p), sentido: "plural" }, solucion: { huecos: [f(pl)] } };
    }),
  };
}
