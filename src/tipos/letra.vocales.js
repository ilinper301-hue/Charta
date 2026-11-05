// letra.vocales · Completa las vocales (Lengua 1.º, lote 1; LENGUA_1.md §3, bloque 2).
// datos:    { palabra: "pelota" (en el caso elegido), huecos: [posiciones (índice de letra) de las vocales ocultas, de izquierda a derecha] }
// solucion: { huecos: ["e", "o", "a"] }   las vocales ocultas, tal como van en la palabra (con su tilde).
// Reglas: la palabra está en el léxico y es la ÚNICA del léxico que encaja con esos huecos (p_l_t_ solo vale si ninguna otra palabra encaja);
//         la «u» muda de que, qui, gue, gui no se oculta; la «y» no cuenta como vocal; no salen palabras con «ü». Palabras de hasta 8 letras, sin repetir.
// Opciones: vocales que faltan (todas / una / algunas al azar) · tipo de sílabas · largo · caso. Completa: 16 palabras (2 × 8); media: 8.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { palabraHuecos } from "../lengua/dibujo.js";
import { alCaso, cuantas, elegirPalabras, largosDe, patronUnico, unidades } from "./_lengua.js";

/** Posiciones de las vocales que se pueden ocultar (no la «u» de qu/gu, no la «y»). */
export function vocalesOcultables(p) {
  let i = 0; const out = [];
  for (const u of unidades(p)) { if (u.length === 1 && /[aeiouáéíóú]/.test(u)) out.push(i); i += u.length; }
  return out;
}

export default registrar({
  id: "letra.vocales",
  version: 1,
  generar(params, azar, { tamano }) {
    const n = cuantas(tamano, 16), modo = params.faltan || "todas";
    const ok = (e, az) => {
      if (e.p.includes("ü")) return null;
      const vs = vocalesOcultables(e.p);
      if (!vs.length || (modo === "azar" && vs.length < 2)) return null;
      if (modo === "todas") return patronUnico(e.p, vs) ? vs : null;
      for (let k = 0; k < 12; k++) {
        const hs = modo === "una" ? [az.elegir(vs)] : az.muestra(vs, az.entero(1, vs.length - 1)).sort((a, b) => a - b);
        if (patronUnico(e.p, hs)) return hs;
      }
      return null;
    };
    const ps = elegirPalabras(azar, n, params, largosDe(params, [2, 3, 2, 3, 1, 4]), { extra: { maxLetras: 8 }, ok, id: "letra.vocales" });
    return {
      enunciado: modo === "una" ? "Escribe la vocal que falta en cada palabra." : "Escribe las vocales que faltan\nen cada palabra.",
      ejercicios: ps.map(({ p: w, r }) => {
        const palabra = alCaso(w, params.caso);
        return { datos: { palabra, huecos: r }, solucion: { huecos: r.map((i) => palabra[i]) } };
      }),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 2, 8, 10, 8);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i];
      p.marco(x, y, cw, ch, i);
      palabraHuecos(p, x + 30, y, cw - 40, ch, e.datos.palabra, e.datos.huecos.map((pos, k) => ({ pos, largo: 1, sol: e.solucion.huecos[k] })), { fs: 26 });
    }));
  },
});
