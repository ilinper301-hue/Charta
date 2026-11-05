// palabra.cuenta · ¿Cuántas letras? (Lengua 1.º, lote 2; LENGUA_1.md §3, bloque 4).
// datos:    { palabra (en el caso elegido), n: nº de letras, respuesta: "numero" | "casillas" }
// solucion: numero   → { huecos: [n] }
//           casillas → { huecos: [las letras de la palabra, una por casilla, y n] }   (se copia la palabra letra a letra y se escribe cuántas son)
// Reglas: palabra del léxico de 3 a 7 letras; n = letras escritas ([...palabra].length: «ch», «ll», «rr», «qu» cuentan como dos). Sin repetidos;
//         con «variadas», las longitudes se reparten (3, 4, 5, 6, 7…).
// Opciones: letras (3 a 7 variadas, 3, 4, 5 o 6) · respuesta (solo el número / casillas y número) · tipo de sílabas · letra. Completa: 10 palabras; media: 5.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { alCaso, cuantas, candidatas, ajusta } from "./_lengua.js";
import { elegirPorLetras } from "./_palabra.js";

export default registrar({
  id: "palabra.cuenta",
  version: 1,
  generar(params, azar, { tamano }) {
    const n = cuantas(tamano, 10), casillas = params.respuesta === "casillas";
    const largos = Number.isInteger(params.letras) ? [params.letras] : [3, 5, 4, 6, 7];
    const lista = candidatas(params, { minLetras: 3, maxLetras: 7 });
    const ps = azar.barajar(elegirPorLetras(azar, n, lista, largos, null, "palabra.cuenta"));
    return {
      enunciado: casillas ? "Escribe cada letra de la palabra en una casilla\ny cuenta cuántas letras tiene." : "Cuenta las letras de cada palabra\ny escribe cuántas tiene.",
      ejercicios: ps.map(({ p }) => {
        const palabra = alCaso(p, params.caso), ls = [...palabra];
        return { datos: { palabra, n: ls.length, respuesta: casillas ? "casillas" : "numero" }, solucion: { huecos: casillas ? [...ls, ls.length] : [ls.length] } };
      }),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 1, 10, 10, 8);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { palabra, n, respuesta } = e.datos, bh = 38;
      p.marco(x, y, cw, ch, i);
      const fs = ajusta(p, (q) => p.ancho(palabra, "PB", q), 150, 28, 16);
      p.text(x + 36, y + ch / 2 - fs * 0.35, palabra, fs, { f: "PB" });
      const bx = x + cw - 14 - 46;
      p.text(bx + 23, y + ch / 2 + bh / 2 + 3, "letras", 9, { f: "PM", anchor: "middle", gris: 0.3 });
      if (respuesta === "casillas") {
        const q = 30, g = 4, ini = x + 36 + 156;
        for (let k = 0; k < n; k++) p.caja(ini + k * (q + g), y + (ch - 36) / 2, q, 36, null, 20, e.solucion.huecos[k]);
        p.text(ini + n * (q + g) + 6, y + ch / 2 - 8, "=", 20, { f: "PB", gris: 0.4 });
        p.caja(bx, y + (ch - bh) / 2 - 5, 46, bh, null, 22, e.solucion.huecos[n]);
      } else {
        p.text(bx - 24, y + ch / 2 - 8, "→", 20, { f: "PB", anchor: "middle", gris: 0.4 });
        p.caja(bx, y + (ch - bh) / 2 - 5, 46, bh, null, 22, e.solucion.huecos[0]);
      }
    }));
  },
});
