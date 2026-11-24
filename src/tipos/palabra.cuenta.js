// palabra.cuenta · ¿Cuántas letras? (Lengua 1.º, lote 2; LENGUA_1.md §3, bloque 4).
// datos:    { palabra (en el caso elegido), n: nº de letras, respuesta: "numero" | "casillas" }
// solucion: numero   → { huecos: [n] }
//           casillas → { huecos: [las letras de la palabra, una por casilla, y n] }   (se copia la palabra letra a letra y se escribe cuántas son)
// Reglas: palabra del léxico de 3 a 7 letras; n = letras escritas ([...palabra].length: «ch», «ll», «rr», «qu» cuentan como dos). Sin repetidos;
//         con «variadas», las longitudes se reparten (3, 4, 5, 6, 7…).
// Opciones: letras (3 a 7 variadas, 3, 4, 5 o 6) · respuesta (solo el número / casillas y número) · tipo de sílabas · letra.
// Cantidad: «solo el número» va en 2 columnas (rejilla elástica): «Más grandes» = 20 palabras en completa y 10 en media (tarjetas de ≈ 62 pt, como las de antes);
//           «Más ejercicios» = las filas de 2 que caben con tarjetas ≥ 50 pt (24 y 12). «Casillas y número» necesita el ancho entero (hasta 7 casillas): 1 columna, 10/5 y 12/6.
import { registrar } from "../nucleo/tipos.js";
import { TOP, cuantosRejilla } from "../render/papel.js";
import { alCaso, candidatas, ajusta } from "./_lengua.js";
import { elegirPorLetras } from "./_palabra.js";

const MIN_ALTO = 50;   // alto mínimo de tarjeta con «Más ejercicios»

export default registrar({
  id: "palabra.cuenta",
  version: 3,
  cantidad: true,
  generar(params, azar, ctx) {
    const casillas = params.respuesta === "casillas", n = casillas ? cuantosRejilla(ctx, 1, MIN_ALTO, [10, 5]) : cuantosRejilla(ctx, 2, MIN_ALTO, [20, 10]);
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
    const casillas = act.params?.respuesta === "casillas", cols = casillas ? 1 : 2;
    const { cel, cw, ch } = p.rejilla(TOP, cols, Math.ceil(act.ejercicios.length / cols));
    const bh = Math.min(38, ch * 0.6), bw = 46, tx = 36;   // casilla del número: alto y ancho; x de la palabra (tras el número de orden)
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { palabra, n, respuesta } = e.datos;
      p.marco(x, y, cw, ch, i);
      const by = y + (ch - bh) / 2 - 4, bx = x + cw - 12 - bw;
      p.text(bx + bw / 2, by + bh + 4, "letras", 11, { f: "PM", anchor: "middle", gris: 0.3 });
      if (respuesta === "casillas") {
        const fs = ajusta(p, (q) => p.ancho(palabra, "PB", q), 150, 28, 16), q = 30, g = 4, qh = Math.min(36, ch - 14), ini = x + tx + 156;
        p.text(x + tx, y + ch / 2 - fs * 0.35, palabra, fs, { f: "PB" });
        for (let k = 0; k < n; k++) p.caja(ini + k * (q + g), y + (ch - qh) / 2, q, qh, null, 20, e.solucion.huecos[k]);
        p.text(ini + n * (q + g) + 6, y + ch / 2 - 8, "=", 20, { f: "PB", gris: 0.4 });
      } else {
        const w = bx - 38 - (x + tx), fs = ajusta(p, (q) => p.ancho(palabra, "PB", q), w, 28, 12);   // media tarjeta: la palabra baja solo si no cabe
        p.text(x + tx, y + ch / 2 - fs * 0.35, palabra, fs, { f: "PB" });
        p.text(bx - 19, y + ch / 2 - 8, "→", 20, { f: "PB", anchor: "middle", gris: 0.4 });
      }
      p.caja(bx, by, bw, bh, null, 22, e.solucion.huecos[respuesta === "casillas" ? n : 0]);
    }));
  },
});
