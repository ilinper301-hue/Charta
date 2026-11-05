// palabra.letras · Ordena las letras (Lengua 1.º, lote 2; LENGUA_1.md §3, bloque 4).
// datos:    { letras: [letras desordenadas, en el caso elegido], palabra, marca: true si la primera letra va marcada (y colocada la primera) }
// solucion: { huecos: [palabra] }
// Reglas: palabra del léxico de 3 a 5 letras, sin tildes ni ch/ll/rr/qu/gu (cada letra es un sonido); las letras mostradas nunca están ya en orden;
//         solución única: ninguna otra palabra del léxico se forma con esas letras (con la primera marcada, ninguna otra que empiece por ella).
//         Sin palabras repetidas. Con «Mayúscula inicial», la letra que va primera se ve ya con mayúscula.
// Opciones: letras (3 a 5 variadas, 3, 4 o 5) · primera letra (sin marcar / marcada) · tipo de sílabas · letra. Completa: 10 palabras; media: 5.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { LEXICO } from "../lengua/lexico.js";
import { sinTildes } from "../lengua/reglas.js";
import { alCaso, cap, cuantas, candidatas, ajusta } from "./_lengua.js";
import { elegirPorLetras, fichasLetras, anchoFichas } from "./_palabra.js";

const clave = (p) => [...sinTildes(p)].sort().join("");
const ANAGRAMAS = new Map();
for (const e of LEXICO) { const k = clave(e.p); (ANAGRAMAS.get(k) || ANAGRAMAS.set(k, []).get(k)).push(e.p); }
/** ¿Sirve la palabra? Sí si ninguna otra del léxico tiene las mismas letras (con `marca`, las mismas y la misma primera). */
export const sinAnagramas = (p, marca) => !ANAGRAMAS.get(clave(p)).some((o) => o !== p && (!marca || o[0] === p[0]));

export default registrar({
  id: "palabra.letras",
  version: 1,
  generar(params, azar, { tamano }) {
    const n = cuantas(tamano, 10), marca = params.marca === "primera";
    const largos = Number.isInteger(params.letras) ? [params.letras] : [3, 4, 5, 4, 3];
    const lista = candidatas(params, { minLetras: 3, maxLetras: 5 }).filter((e) => !/[áéíóúü]|ch|ll|rr|qu|gu[ei]/.test(e.p));
    const ps = elegirPorLetras(azar, n, lista, largos, (e) => sinAnagramas(e.p, marca) && new Set(marca ? [...e.p].slice(1) : [...e.p]).size >= 2, "palabra.letras");
    return {
      enunciado: marca ? "Ordena las letras y escribe la palabra.\nLa letra gris va la primera." : "Ordena las letras y escribe la palabra.",
      ejercicios: azar.barajar(ps).map(({ p }) => {
        const ls = [...p], resto = marca ? ls.slice(1) : ls;
        let mez = azar.barajar(resto);
        while ((marca ? [ls[0], ...mez] : mez).join("") === p) mez = azar.barajar(resto);
        let vistas = marca ? [ls[0], ...mez] : mez;
        vistas = vistas.map((l) => (params.caso === "mayus" ? l.toUpperCase() : l));
        if (params.caso === "inicial") { const k = marca ? 0 : vistas.indexOf(ls[0]); vistas[k] = cap(vistas[k]); }
        return { datos: { letras: vistas, palabra: alCaso(p, params.caso), marca }, solucion: { huecos: [alCaso(p, params.caso)] } };
      }),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 1, 10, 10, 8), bw = 190, wp = cw - 36 - bw - 40;
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], ls = e.datos.letras;
      p.marco(x, y, cw, ch, i);
      const fs = ajusta(p, (q) => anchoFichas(ls.length, q, 8), wp, 26, 14);
      fichasLetras(p, x + 36, y, ch, ls, { fs, gap: 8, marcada: e.datos.marca ? 0 : -1 });
      p.text(x + cw - 14 - bw - 20, y + ch / 2 - 8, "→", 20, { f: "PB", anchor: "middle", gris: 0.4 });
      p.caja(x + cw - 14 - bw, y + (ch - 40) / 2, bw, 40, null, 20, e.solucion.huecos[0]);
    }));
  },
});
