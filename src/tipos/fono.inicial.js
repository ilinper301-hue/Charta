// fono.inicial · ¿Con qué letra suena? (Lengua 1.º, lote 2; LENGUA_1.md §3, bloque 1). Versión escrita, sin dibujos.
// datos:    { palabra (en el caso elegido), pos: posición de la letra en hueco (0 = principio, última = final), opciones: [3 letras], posicion: "principio" | "final" }
// solucion: { huecos: [], rodea: índice (0–2) de la letra correcta en `opciones` }   (en la solución, rodeada en rojo)
// Reglas: palabra del léxico y la ÚNICA del léxico que encaja con ese hueco (patronUnico); la letra es suelta y sin tilde (no ch, ll, rr, qu, gu; ni h, k, w, x, y);
//         las otras 2 letras no forman otra palabra del léxico; «vocales» / «consonantes» = las 3 letras son del mismo tipo; sin repetir palabras. Palabras de hasta 8 letras.
//         Con «Mayúscula inicial» (letra al principio) las opciones van en mayúscula, sin «I».
// Opciones: letra que falta (principio / final) · letras (todas / vocales / consonantes) · tipo de sílabas · caso. Cantidad: 2 columnas; «Más grandes» 20 palabras (media: 10), «Más ejercicios» las que caben con tarjetas ≥ 40 pt.
import { registrar } from "../nucleo/tipos.js";
import { TOP, INK, cuantosRejilla } from "../render/papel.js";
import { rodear } from "../lengua/dibujo.js";
import { LEXICO } from "../lengua/lexico.js";
import { permitida } from "../lengua/vistas.js";
import { alCaso, cuantas, elegirPalabras, largosDe, patronUnico, unidades, conTope, ajusta } from "./_lengua.js";

const PALABRAS = new Set(LEXICO.map((e) => e.p));
const VOC = [..."aeiou"], CON = [..."bcdfgjlmnprstvz"];
const MIN_ALTO = 40;   // alto mínimo de tarjeta con «Más ejercicios»
const cambia = (p, i, c) => p.slice(0, i) + c + p.slice(i + 1);

export default registrar({
  id: "fono.inicial",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const n = cuantosRejilla(ctx, 2, MIN_ALTO, [20, 10]), fin = params.posicion === "final", tipoL = params.letras === "vocales" || params.letras === "consonantes" ? params.letras : "todas";
    const ok = (e, az) => {
      const p = e.p, u = fin ? unidades(p).at(-1) : unidades(p)[0], pos = fin ? p.length - 1 : 0;
      if (u.length !== 1 || !/[a-z]/.test(u) || "hkwxyq".includes(u)) return null;
      const esV = VOC.includes(u);
      if ((tipoL === "vocales" && !esV) || (tipoL === "consonantes" && esV)) return null;
      if (!patronUnico(p, [pos])) return null;
      const fam = tipoL === "vocales" ? VOC : tipoL === "consonantes" ? CON : [...VOC, ...CON];
      const malas = az.barajar(fam.filter((c) => c !== u && permitida(c) && !PALABRAS.has(cambia(p, pos, c)) && !(pos === 0 && params.caso === "inicial" && c === "i")));
      if (malas.length < 2) return null;
      return { pos, opciones: az.barajar([u, malas[0], malas[1]]) };
    };
    const ps = conTope(n, cuantas(ctx.tamano, 10), (k) => elegirPalabras(azar, k, params, largosDe(params, [2, 3, 2, 3, 1, 4]), { extra: { maxLetras: 8 }, ok, id: "fono.inicial" }));
    return {
      enunciado: fin ? "Rodea la letra que falta al final de la palabra." : "Rodea la letra que falta al principio de la palabra.",
      ejercicios: ps.map(({ p: w, r }) => {
        const palabra = alCaso(w, params.caso), mayus = params.caso === "mayus" || (params.caso === "inicial" && r.pos === 0);
        const opciones = r.opciones.map((c) => (mayus ? c.toUpperCase() : c));
        return { datos: { palabra, pos: r.pos, opciones, posicion: fin ? "final" : "principio" }, solucion: { huecos: [], rodea: opciones.indexOf(palabra[r.pos]) } };
      }),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.rejilla(TOP, 2, Math.ceil(act.ejercicios.length / 2));
    const fo = Math.min(20, ch * 0.34), x0 = 32, x1 = 10;   // letra de las opciones; margen izquierdo (tras el número) y derecho
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { palabra, pos, opciones } = e.datos;
      p.marco(x, y, cw, ch, i);
      // opciones a la derecha (en tarjetas pequeñas) y, a su izquierda, la palabra con el hueco gris (la solución es la letra rodeada)
      const gap = 7, ow = opciones.reduce((t, o) => t + p.ancho(o, "PB", fo) + fo * 0.7, 0) + gap * (opciones.length - 1);
      const aw = cw - x0 - x1 - ow - 26, a = palabra.slice(0, pos), b = palabra.slice(pos + 1);
      const anchoP = (f) => (a ? p.ancho(a, "PB", f) + f * 0.2 : 0) + f * 1.2 + (b ? f * 0.2 + p.ancho(b, "PB", f) : 0);
      const fs = ajusta(p, anchoP, aw, Math.min(28, ch * 0.46), 10), g = fs * 0.2, hw = fs * 1.2, wa = a ? p.ancho(a, "PB", fs) + g : 0;
      let cx = x + x0 + (aw - anchoP(fs)) / 2;
      if (a) p.text(cx, y + ch / 2 - fs * 0.35, a, fs, { f: "PB" });
      p.rrect(cx + wa, y + (ch - fs * 1.3) / 2, hw, fs * 1.3, 7, { lw: 1.5, fill: 0.9, stroke: INK });
      if (b) p.text(cx + wa + hw + g, y + ch / 2 - fs * 0.35, b, fs, { f: "PB" });
      p.text(x + x0 + aw + 13, y + ch / 2 - 16 * 0.35, "→", 16, { f: "PB", anchor: "middle", gris: 0.4 });
      rodear(p, x + cw - x1 - ow, y, ow, ch, opciones, e.solucion.rodea, { fs: fo, gap, tarjeta: true, relleno: 0.35 });
    }));
  },
});
