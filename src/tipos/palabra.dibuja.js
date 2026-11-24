// palabra.dibuja · Leo y dibujo (Lengua 1.º, petición de Iván 12-11-2026, a partir de su ficha «Leo y dibujo · Repaso»; LENGUA_1.md §3, bloque 4).
// datos:    { palabra }   (ya en el caso pedido; cada ejercicio es una palabra con un recuadro vacío debajo para dibujar lo que dice)
// solucion: { huecos: [] }   el dibujo es libre: no hay corrección
// Reglas: nombres del léxico que se pueden dibujar (campo «dibujo»), con las opciones comunes (tipo de sílabas, letra) y las letras elegidas del mapa de letras;
//         sin repetir; con letra obligatoria y pocas palabras de 2–3 sílabas, también de 1 y 4 (hay pocas con «q»…). Cantidad: «Más grandes» 12 (3 × 4; media 6 = 3 × 2), «Más ejercicios» las que caben con tarjetas ≥ 110 pt. Con «Mayúscula inicial» no entran las que empiezan por «i» (candidatas()).
// Aspecto (idéntico a la ficha de Iván): palabra arriba a la izquierda en Fredoka normal y recuadro de esquinas redondeadas con borde verde azulado.
// Opciones: sílabas de cada palabra (variadas / 1 / 2 / 3) · tipo de sílabas · letra (minúscula / mayúscula inicial / MAYÚSCULAS).
import { registrar } from "../nucleo/tipos.js";
import { TOP, cuantosRejilla } from "../render/papel.js";
import { cuantas, elegirPalabras, alCaso, largosDe, ajusta, conTope } from "./_lengua.js";
import { obligatoriasActivas } from "../lengua/vistas.js";

/** Verde azulado de los recuadros de la ficha de Iván. */
export const VERDE_RECUADRO = "#196B78";
const FS = 24, ALTO_PALABRA = 38;
const MIN_ALTO = 110;   // alto mínimo de tarjeta con «Más ejercicios» (palabra + recuadro de 72 pt)

export default registrar({
  id: "palabra.dibuja",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    return conTope(cuantosRejilla(ctx, 3, MIN_ALTO, [12, 6]), cuantas(ctx.tamano, 12), (n) => elegir(params, azar, n));
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.rejilla(TOP, 3, Math.ceil(act.ejercicios.length / 3), 14, 8);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], t = e.datos.palabra;
      const fs = ajusta(p, (q) => p.ancho(t, "PR", q), cw - 12, FS, 12);
      p.text(x + 6, y + ch - ALTO_PALABRA + 11, t, fs, { f: "PR" });
      p.rrect(x, y, cw, ch - ALTO_PALABRA, 14, { lw: 1.1, fill: 1, stroke: VERDE_RECUADRO });
    }));
  },
});

function elegir(params, azar, n) {
  const pide = (largos) => elegirPalabras(azar, n, params, largosDe(params, largos), { extra: { cat: "n", dibujo: true }, id: "palabra.dibuja" });
  let ps;
  try { ps = pide([2, 2, 3, 2]); }
  catch (e) { if (!obligatoriasActivas() || Number.isInteger(params.largo)) throw e; ps = pide([2, 3, 2, 4, 1]); }   // con obligatoria y pocas palabras: cualquier largo
  return {
    enunciado: "Lee cada palabra y dibuja lo que dice.",
    ejercicios: ps.map(({ p }) => ({ datos: { palabra: alCaso(p, params.caso) }, solucion: { huecos: [] } })),
  };
}
