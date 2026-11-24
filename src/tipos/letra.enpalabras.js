// letra.enpalabras · Rodea la letra en las palabras (Lengua 1.º, lote 1; LENGUA_1.md §3, bloque 2).
// datos:    { palabra: "pelota" (en el caso elegido), letra: "o", cuenta: true|false (lleva cuadro para el número de veces) }
// solucion: { huecos: [veces] (solo si lleva cuadro), rodea: [posiciones de las letras a rodear, por unidad: «ch», «ll», «rr» cuentan como una] }
//           «a» y «á» son la misma letra. No salen palabras donde la letra pedida forma parte de «ch», «ll», «rr», «qu» o «gu».
// Opciones: letra (al azar o una concreta) · tarea (rodear y contar / solo rodear) · tipo de sílabas · caso. Palabras de hasta 9 letras, sin repetir.
// Cantidad: «Más grandes» 12 palabras (2 × 6; media: 6), «Más ejercicios» las que caben con tarjetas ≥ 52 pt (o las que dé el banco de esa letra, mínimo las de siempre).
import { registrar } from "../nucleo/tipos.js";
import { TOP, cuantosRejilla } from "../render/papel.js";
import { sinTildes } from "../lengua/reglas.js";
import { letrasActivas, vistasActivas, avisoVistas, claveLetras } from "../lengua/vistas.js";
import { alCaso, candidatas, unidades, palabraLetras, cuantas, crece } from "./_lengua.js";

/** Posiciones (por unidad) de la letra en la palabra; null si forma parte de un dígrafo (ch, ll, rr, qu, gu): ahí no se puede rodear sola. */
export function posiciones(palabra, letra) {
  const us = unidades(palabra), pos = [];
  for (let k = 0; k < us.length; k++) {
    const u = sinTildes(us[k].toLowerCase());
    if (u === letra) pos.push(k);
    else if (u.length > 1 && u.includes(letra)) return null;
  }
  return pos;
}

const MIN_ALTO = 52;   // alto mínimo de tarjeta con «Más ejercicios»
const memo = new Map();   // palabras buenas por tipo, caso inicial, letra y letras elegidas

export default registrar({
  id: "letra.enpalabras",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const base = cuantas(ctx.tamano, 12), cuenta = params.tarea !== "rodea";
    const buenas = (l) => {
      const clave = `${params.tipo}|${params.caso === "inicial"}|${l}|${claveLetras()}`;
      if (!memo.has(clave)) memo.set(clave, candidatas(params, { conLetra: l, maxLetras: 9 }).filter((e) => { const p = posiciones(e.p, l); return p && p.length >= 1 && p.length <= 4; }));
      return memo.get(clave);
    };
    let letra = params.letra;
    if (!letra) {
      const posibles = letrasActivas().filter((l) => !"kqwxy".includes(l) && buenas(l).length >= base);
      if (!posibles.length) throw new Error("«letra.enpalabras» necesita más palabras: con ese tipo de sílabas no hay letra con palabras de sobra." + avisoVistas());
      letra = azar.elegir(posibles);
    }
    const ps = buenas(letra);
    if (ps.length < base) throw new Error(`«letra.enpalabras» necesita más palabras con la «${letra}»: con esas opciones solo hay ${ps.length} y hacen falta ${base}.` + avisoVistas());
    const n = Math.min(cuantosRejilla(ctx, 2, MIN_ALTO, [12, 6]), ps.length);   // si el banco de esa letra no da para el doble, las que haya
    const fmt = (t) => (params.caso === "mayus" ? t.toUpperCase() : t);
    return {
      enunciado: cuenta ? `Rodea la letra «${fmt(letra)}» en cada palabra\ny escribe cuántas veces sale.` : `Rodea la letra «${fmt(letra)}» en cada palabra.`,
      ejercicios: azar.muestra(ps, n).map((e) => {
        const rodea = posiciones(e.p, letra);
        return { datos: { palabra: alCaso(e.p, params.caso), letra: fmt(letra), cuenta }, solucion: { huecos: cuenta ? [rodea.length] : [], rodea } };
      }),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.rejilla(TOP, 2, Math.ceil(act.ejercicios.length / 2)), k = crece(ch, 110);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], cuenta = e.datos.cuenta, bw = 40 * k, bh = Math.min(38 * k, ch - 14);
      p.marco(x, y, cw, ch, i);
      const ancho = cuenta ? cw - 30 - bw - 22 : cw - 56;
      palabraLetras(p, x + 32, y, ancho, ch, e.datos.palabra, { fs: Math.min(28 * k, ch * 0.5), gap: 0.27, rodear: e.solucion.rodea });
      if (cuenta) {
        p.text(x + cw - 14 - bw / 2, y + ch / 2 + bh / 2 + 4, "veces", 9 * k, { f: "PM", anchor: "middle", gris: 0.3 });
        p.caja(x + cw - 14 - bw, y + (ch - bh) / 2 - 5, bw, bh, null, 22 * k, e.solucion.huecos[0]);
      }
    }));
  },
});
