// orto.elige · Elige la letra (Lengua 1.º, lote 2; LENGUA_1.md §3, bloque 6).
// datos:    { palabra: "campo" (en el caso elegido, con la palabra entera), pos: posición del hueco, largo: letras que ocupa el hueco (1 o 2),
//             regla: "mpb" | "r" | "cqu" | "ggu" | "cz", opciones: [2 opciones, barajadas] | null (sin ayuda) }
// solucion: { huecos: ["m"] }   lo que va en el hueco (en el caso de la palabra: «QU» en MAYÚSCULAS, «Qu» con mayúscula inicial al principio).
// Reglas (huecosOrto de src/lengua/reglas.js): mpb = «m» antes de p y b (no «n»); r = «r» / «rr» (entre vocales o al principio, nunca al final); cqu = «c» ante a, o, u y «qu» ante e, i;
//         ggu = «g» ante a, o, u y «gu» ante e, i; cz = «z» ante a, o, u y «c» ante e, i. La regla decide: solo una opción es correcta.
// Palabras del léxico (nombres, adjetivos y verbos) de hasta 8 letras, sin repetir. Un solo hueco por palabra, y la otra opción nunca
// forma otra palabra del léxico (pero/perro, rizo/rico…). El hueco mide lo mismo con cualquier opción para no dar pistas.
// Opciones: regla (una o mezcladas) · ayuda (dos opciones / sin ayuda) · caso. Mezcladas reparte las reglas a partes iguales.
// Completa: 16 palabras (2 × 8); media: 8.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { rodear, palabraHuecos } from "../lengua/dibujo.js";
import { LEXICO } from "../lengua/lexico.js";
import { huecosOrto, REGLAS_ORTO } from "../lengua/reglas.js";
import { alCaso, candidatas, cuantas } from "./_lengua.js";

const PALABRAS = new Set(LEXICO.map((e) => e.p));
export const OPCIONES_REGLA = { mpb: ["m", "n"], r: ["r", "rr"], cqu: ["c", "qu"], ggu: ["g", "gu"], cz: ["c", "z"] };

/** Huecos de la palabra que sirven: la regla los decide, la otra opción no forma otra palabra del léxico y no hay confusión visual. */
export function huecosBuenos(p, regla) {
  return huecosOrto(p, regla).filter((h) => {
    if (regla === "mpb" && !"pb".includes(p[h.pos + 1])) return false;          // «n» ante «v» (enviar) es otra regla
    if (regla === "ggu" && h.largo === 1 && p[h.pos + 1] === "u") return false;  // gu + a/o (guapo): no es la regla de gue/gui
    if (regla === "r" && h.pos + h.largo >= p.length) return false;               // «r» final (abrazar) no es de esta regla
    const otra = h.opciones.find((o) => o !== h.correcta);
    return !PALABRAS.has(p.slice(0, h.pos) + otra + p.slice(h.pos + h.largo));
  });
}

const memo = new Map();
const buenas = (params, regla) => {
  const clave = `${params.caso === "inicial"}|${regla}`;
  if (!memo.has(clave)) {
    memo.set(clave, candidatas({ ...params, tipo: "mixtas" }, { maxLetras: 8 })
      .map((e) => ({ p: e.p, hs: huecosBuenos(e.p, regla) })).filter((x) => x.hs.length));
  }
  return memo.get(clave);
};

export default registrar({
  id: "orto.elige",
  version: 1,
  generar(params, azar, { tamano }) {
    const n = cuantas(tamano, 16), ayuda = params.ayuda !== "sin";
    const reglas = params.regla ? [params.regla] : REGLAS_ORTO;
    const bolsas = Object.fromEntries(reglas.map((r) => [r, azar.barajar(buenas(params, r))]));
    const usadas = new Set(), out = [];
    let vacias = 0;
    for (let k = 0; out.length < n; k++) {
      const r = reglas[k % reglas.length], b = bolsas[r];
      let e;
      while (b.length && (e = b.pop()) && usadas.has(e.p)) e = null;
      if (e) { usadas.add(e.p); out.push({ regla: r, p: e.p, h: azar.elegir(e.hs) }); vacias = 0; }
      else if (++vacias >= reglas.length) throw new Error(`«orto.elige» necesita más palabras: con esa regla solo hay ${out.length} y hacen falta ${n}. Prueba con «Mezcladas».`);
    }
    const mayus = (t, pos) => (params.caso === "mayus" ? t.toUpperCase() : params.caso === "inicial" && pos === 0 ? t[0].toUpperCase() + t.slice(1) : t);
    return {
      enunciado: ayuda ? "Elige lo que falta y escríbelo\nen el cuadro gris." : "Escribe lo que falta\nen el cuadro gris.",
      ejercicios: azar.barajar(out).map(({ regla, p, h }) => ({
        datos: { palabra: alCaso(p, params.caso), pos: h.pos, largo: h.largo, regla, opciones: ayuda ? azar.barajar(h.opciones).map((o) => mayus(o, h.pos)) : null },
        solucion: { huecos: [mayus(h.correcta, h.pos)] },
      })),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 2, 8, 10, 8), fs = 28;
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { palabra, pos, largo, regla, opciones } = e.datos;
      p.marco(x, y, cw, ch, i);
      const conAyuda = !!opciones, h1 = conAyuda ? ch - 36 : ch, y1 = conAyuda ? y + 32 : y;
      const mayor = Math.max(...OPCIONES_REGLA[regla].map((o) => p.ancho(act.params.caso === "mayus" ? o.toUpperCase() : o, "PB", fs)));
      palabraHuecos(p, x + 30, y1, cw - 40, h1 - (conAyuda ? 6 : 0), palabra, [{ pos, largo, sol: e.solucion.huecos[0] }], { fs, anchoHueco: Math.max(fs * 0.95, mayor + fs * 0.45) });
      if (conAyuda) rodear(p, x + 30, y + 4, cw - 40, 30, opciones, [], { fs: 19, gap: 14, tarjeta: true });
    }));
  },
});
