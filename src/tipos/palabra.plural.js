// palabra.plural · Uno y muchos (Lengua 1.º, lote 2; LENGUA_1.md §3, bloque 4).
// datos:    { palabra (la que se ve: singular, o plural si «de muchos a uno»; en el caso elegido), sentido: "plural" | "singular" (lo que se escribe) }
// solucion: { huecos: [la palabra pedida] }
// Reglas: nombre del léxico de 3 a 8 letras; el plural es el de reglas.js (plural()) y no cambia de tilde ni es igual al singular (camión → camiones queda fuera).
//         «Solo -s»: nombres acabados en vocal sin tilde. «-s y -es»: un tercio acaba en consonante (flor → flores, pez → peces, rey → reyes) y el resto en vocal.
//         Sin repetidos. Completa: 12; media: 6.
// Opciones: plurales (solo -s / -s y -es) · sentido (de uno a muchos / de muchos a uno) · letra (minúscula / MAYÚSCULA).
import { registrar } from "../nucleo/tipos.js";
import { TOP, B, T } from "../render/papel.js";
import { plural } from "../lengua/reglas.js";
import { cuantas, ajusta } from "./_lengua.js";
import { NOMBRES } from "./_palabra.js";

const SIMPLES = NOMBRES.filter((e) => e.p.length <= 8);
const enVocal = (e) => /[aeiou]$/.test(e.p) && plural(e.p) === e.p + "s";
const enConsonante = (e) => !/[aeiouáéíóú]$/.test(e.p) && /es$/.test(plural(e.p));

export default registrar({
  id: "palabra.plural",
  version: 1,
  generar(params, azar, { tamano }) {
    const n = cuantas(tamano, 12), conEs = params.plural === "es", reves = params.sentido === "alreves";
    const nEs = conEs ? Math.round(n / 3) : 0;
    const conso = azar.barajar(SIMPLES.filter(enConsonante)), vocal = azar.barajar(SIMPLES.filter(enVocal));
    if (conso.length < nEs || vocal.length < n - nEs) throw new Error("«palabra.plural» necesita más nombres en el léxico para esas opciones.");
    const elegidos = [...conso.slice(0, nEs), ...vocal.slice(0, n - nEs)];
    const mayus = params.caso === "mayus", f = (t) => (mayus ? t.toUpperCase() : t);
    return {
      enunciado: reves ? "Escribe cada palabra en singular:\nuna sola cosa." : "Escribe cada palabra en plural:\nmuchas cosas.",
      ejercicios: azar.barajar(elegidos).map((e) => {
        const pl = plural(e.p);
        return reves ? { datos: { palabra: f(pl), sentido: "singular" }, solucion: { huecos: [f(e.p)] } } : { datos: { palabra: f(e.p), sentido: "plural" }, solucion: { huecos: [f(pl)] } };
      }),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 1, 12, 10, 6);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i];
      p.marco(x, y, cw, ch, i);
      const fs = ajusta(p, (q) => p.ancho(e.datos.palabra, "PB", q), 170, 26, 14);
      p.text(x + 50, y + ch / 2 - fs * 0.35, e.datos.palabra, fs, { f: "PB" });
      p.text(x + 250, y + ch / 2 - 8, "→", 22, { f: "PB", anchor: "middle", gris: 0.4 });
      p.caja(x + 280, y + (ch - 38) / 2, cw - 280 - 20, 38, null, 22, e.solucion.huecos[0]);
    }));
  },
});
