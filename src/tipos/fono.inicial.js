// fono.inicial · ¿Con qué letra suena? (Lengua 1.º, lote 2; LENGUA_1.md §3, bloque 1). Versión escrita, sin dibujos.
// datos:    { palabra (en el caso elegido), pos: posición de la letra en hueco (0 = principio, última = final), opciones: [3 letras], posicion: "principio" | "final" }
// solucion: { huecos: [], rodea: índice (0–2) de la letra correcta en `opciones` }   (en la solución, rodeada en rojo)
// Reglas: palabra del léxico y la ÚNICA del léxico que encaja con ese hueco (patronUnico); la letra es suelta y sin tilde (no ch, ll, rr, qu, gu; ni h, k, w, x, y);
//         las otras 2 letras no forman otra palabra del léxico; «vocales» / «consonantes» = las 3 letras son del mismo tipo; sin repetir palabras. Palabras de hasta 8 letras.
//         Con «Mayúscula inicial» (letra al principio) las opciones van en mayúscula, sin «I».
// Opciones: letra que falta (principio / final) · letras (todas / vocales / consonantes) · tipo de sílabas · caso. Completa: 10 palabras; media: 5.
import { registrar } from "../nucleo/tipos.js";
import { TOP, INK } from "../render/papel.js";
import { rodear } from "../lengua/dibujo.js";
import { LEXICO } from "../lengua/lexico.js";
import { alCaso, cuantas, elegirPalabras, largosDe, patronUnico, unidades } from "./_lengua.js";

const PALABRAS = new Set(LEXICO.map((e) => e.p));
const VOC = [..."aeiou"], CON = [..."bcdfgjlmnprstvz"];
const cambia = (p, i, c) => p.slice(0, i) + c + p.slice(i + 1);

export default registrar({
  id: "fono.inicial",
  version: 1,
  generar(params, azar, { tamano }) {
    const n = cuantas(tamano, 10), fin = params.posicion === "final", tipoL = params.letras === "vocales" || params.letras === "consonantes" ? params.letras : "todas";
    const ok = (e, az) => {
      const p = e.p, u = fin ? unidades(p).at(-1) : unidades(p)[0], pos = fin ? p.length - 1 : 0;
      if (u.length !== 1 || !/[a-z]/.test(u) || "hkwxyq".includes(u)) return null;
      const esV = VOC.includes(u);
      if ((tipoL === "vocales" && !esV) || (tipoL === "consonantes" && esV)) return null;
      if (!patronUnico(p, [pos])) return null;
      const fam = tipoL === "vocales" ? VOC : tipoL === "consonantes" ? CON : [...VOC, ...CON];
      const malas = az.barajar(fam.filter((c) => c !== u && !PALABRAS.has(cambia(p, pos, c)) && !(pos === 0 && params.caso === "inicial" && c === "i")));
      if (malas.length < 2) return null;
      return { pos, opciones: az.barajar([u, malas[0], malas[1]]) };
    };
    const ps = elegirPalabras(azar, n, params, largosDe(params, [2, 3, 2, 3, 1, 4]), { extra: { maxLetras: 8 }, ok, id: "fono.inicial" });
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
    const { cel, cw, ch } = p.celdas(TOP, 1, 10, 10, 8);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { palabra, pos, opciones } = e.datos;
      p.marco(x, y, cw, ch, i);
      // palabra con el hueco gris (sin la letra en rojo: la solución es la letra rodeada)
      const fs = 28, a = palabra.slice(0, pos), b = palabra.slice(pos + 1), g = fs * 0.2, hw = 34, wa = a ? p.ancho(a, "PB", fs) + g : 0;
      let cx = x + 30 + (cw * 0.4 - (wa + hw + (b ? g + p.ancho(b, "PB", fs) : 0))) / 2;
      if (a) p.text(cx, y + ch / 2 - fs * 0.35, a, fs, { f: "PB" });
      p.rrect(cx + wa, y + (ch - fs * 1.3) / 2, hw, fs * 1.3, 7, { lw: 1.5, fill: 0.9, stroke: INK });
      if (b) p.text(cx + wa + hw + g, y + ch / 2 - fs * 0.35, b, fs, { f: "PB" });
      p.text(x + cw * 0.5, y + ch / 2 - 7, "→", 20, { f: "PB", anchor: "middle", gris: 0.4 });
      rodear(p, x + cw * 0.55, y, cw * 0.43, ch, opciones, e.solucion.rodea, { fs: 26, gap: 22, tarjeta: true });
    }));
  },
});
