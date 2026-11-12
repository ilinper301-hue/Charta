// escritura.ordena · Miro y escribo (Lengua 1.º, petición de Iván 12-11-2026, a partir de su ficha «Miro y escribo · Repaso»; LENGUA_1.md §3, bloque 8).
// datos:    { letras: [letras desordenadas, en el caso elegido], palabra }   (cada ejercicio es una tarjeta: ESPACIO EN BLANCO para el dibujo —Charta no hace
//           dibujos: Iván pega el suyo—, las letras desordenadas en casillas y un renglón de pauta para escribir la palabra)
// solucion: { huecos: [palabra] }   la palabra solo sale en pantalla (solucionario y Fori), en rojo sobre la pauta; en el papel no se imprime
// Reglas: nombres del léxico que se pueden dibujar (campo «dibujo») de 3 a 6 letras, sin tildes ni ch/ll/rr/qu/gu (cada letra es un sonido) y con al menos dos
//         letras distintas; las letras mostradas nunca están ya en orden. Sin repetir. Completa 8 (2 × 4), media 4 (2 × 2). Respeta el mapa de letras.
//         No exige solución única entre anagramas (sol/los): la palabra la fija el dibujo que pegue la maestra.
// Aspecto (idéntico a la ficha de Iván): tarjeta de borde verde azulado, casillas de borde rojo con la letra y pauta Lamela de cuatro líneas
//         (las dos del cuerpo negras y las de las astas y los rabos grises).
// Opciones: letras de cada palabra (3 a 6 variadas / 3 / 4 / 5 / 6) · tipo de sílabas · letra (minúscula / MAYÚSCULA) · pauta (5, 4, 3,5 mm).
import { registrar } from "../nucleo/tipos.js";
import { TOP, COLOR_SOLUCION, INK } from "../render/papel.js";
import { cuantas, candidatas } from "./_lengua.js";
import { elegirPorLetras } from "./_palabra.js";
import { mmDe } from "./_escritura.js";
import { pautaLamela } from "../lengua/pauta.js";
import { VERDE_RECUADRO } from "./palabra.dibuja.js";

/** Rojo de las casillas de letras de la ficha de Iván. */
export const ROJO_CASILLA = "#E34C38";
const TAM_CASILLA = 22, SEP_CASILLA = 7, PAD = 12;

export default registrar({
  id: "escritura.ordena",
  version: 1,
  generar(params, azar, { tamano }) {
    const n = cuantas(tamano, 8), mayus = params.caso === "mayus";
    const largos = Number.isInteger(params.letras) ? [params.letras] : [3, 4, 5, 6, 4, 3, 5, 4];
    const lista = candidatas(params, { cat: "n", dibujo: true, minLetras: 3, maxLetras: 6 }).filter((e) => !/[áéíóúü]|ch|ll|rr|qu|gu[ei]/.test(e.p));
    const ps = elegirPorLetras(azar, n, lista, largos, (e) => new Set([...e.p]).size >= 2, "escritura.ordena");
    return {
      enunciado: "Ordena las letras y escribe el nombre del dibujo en la pauta.",
      ejercicios: azar.barajar(ps).map(({ p }) => {
        const ls = [...p];
        let mez = azar.barajar(ls);
        while (mez.join("") === p) mez = azar.barajar(ls);
        const t = (s) => (mayus ? s.toUpperCase() : s);
        return { datos: { letras: mez.map(t), palabra: t(p) }, solucion: { huecos: [t(p)] } };
      }),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 2, 4, 18, 8), c = p.mm(mmDe(act.params));
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], ls = e.datos.letras;
      p.rrect(x, y, cw, ch, 14, { lw: 1.1, fill: 1, stroke: VERDE_RECUADRO });
      // pauta abajo: la base queda a un cuerpo de la línea gris de abajo
      const base = y + PAD + c;
      pautaLamela(p, x + PAD, x + cw - PAD, base, c);
      if (p.solucion) p.text(x + PAD + 0.6 * c, base, e.solucion.huecos[0], 1.75 * c, { f: "PR", gris: COLOR_SOLUCION });
      // letras desordenadas justo encima de la pauta (y, sobre ellas, el espacio en blanco del dibujo)
      const total = ls.length * TAM_CASILLA + (ls.length - 1) * SEP_CASILLA;
      let cx = x + (cw - total) / 2; const ty = base + 2 * c + 12;
      for (const l of ls) {
        p.rrect(cx, ty, TAM_CASILLA, TAM_CASILLA, 6, { lw: 1, fill: 1, stroke: ROJO_CASILLA });
        p.text(cx + TAM_CASILLA / 2, ty + TAM_CASILLA / 2 - 15 * 0.35, l, 15, { f: "PR", anchor: "middle", gris: INK });
        cx += TAM_CASILLA + SEP_CASILLA;
      }
    }));
  },
});
