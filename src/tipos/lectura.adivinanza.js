// lectura.adivinanza · Adivinanzas (Lengua 1.º, lote 5; LENGUA_1.md §3, bloque 7).
// datos:    { texto: la adivinanza (en el caso elegido), n: nº de letras de la respuesta, ayuda: "sin" | "letras", id: nº en el banco }
// solucion: sin ayuda → { huecos: ["gato"] } · con una casilla por cada letra → { huecos: ["g", "a", "t", "o"] } (ch, ll, rr, qu y gu van en una sola casilla)
// Reglas: banco 📚 de ~45 adivinanzas ORIGINALES de _lectura.js (ADIVINANZAS); la respuesta es una palabra del léxico de hasta 9 letras, no sale en la adivinanza, es única en la ficha
//         y ninguna adivinanza nombra la respuesta de otra de la misma ficha. Cada adivinanza solo encaja con un objeto, animal o persona del léxico.
// Opciones: ayuda (sin ayuda / una casilla por cada letra) · letra (minúscula / MAYÚSCULAS). Completa: 4; media: 2.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { cuantas, unidades } from "./_lengua.js";
import { elegirAdivinanzas, alCaso, ajustaLineas, parrafo } from "./_lectura.js";
import { casillas } from "../lengua/dibujo.js";

export default registrar({
  id: "lectura.adivinanza",
  version: 1,
  generar(params, azar, { tamano }) {
    const n = cuantas(tamano, 4), letras = params.ayuda === "letras", mayus = params.caso === "mayus";
    const as = elegirAdivinanzas(azar, n);
    return {
      enunciado: mayus ? (letras ? "LEE LA ADIVINANZA Y ESCRIBE LA RESPUESTA,\nUNA LETRA EN CADA CASILLA." : "LEE LA ADIVINANZA Y ESCRIBE LA RESPUESTA.") : (letras ? "Lee la adivinanza y escribe la respuesta,\nuna letra en cada casilla." : "Lee la adivinanza y escribe la respuesta."),
      ejercicios: as.map((a) => ({
        datos: { texto: alCaso(a.texto, params.caso), n: unidades(a.respuesta).length, ayuda: letras ? "letras" : "sin", id: a.id },
        solucion: { huecos: letras ? unidades(a.respuesta).map((u) => alCaso(u, params.caso)) : [alCaso(a.respuesta, params.caso)] },
      })),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 1, 4, 10, 10);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { texto, n, ayuda } = e.datos, sol = e.solucion.huecos;
      p.marco(x, y, cw, ch, i);
      const alturaCaja = 48, { fs, lineas } = ajustaLineas(p, texto, cw - 80, 23, 3, 17);
      parrafo(p, x + 38, y + alturaCaja + 14, ch - alturaCaja - 24, lineas, fs, { k: 1.4 });
      if (ayuda === "letras") casillas(p, x + 20, y + 8, cw - 40, alturaCaja, n, { sol, ancho: Math.min(46, (cw - 60) / n - 8), alto: 40, gap: 8, fs: 24 });
      else p.caja(x + cw / 2 - 150, y + 10, 300, 42, null, 26, sol[0]);
    }));
  },
});
