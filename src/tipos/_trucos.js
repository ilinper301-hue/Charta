// Charta · trucos de cálculo mental de 1.º (bloque 12), tomados de Calculi. Fábrica común de los tipos trucos.<clave>.
// Cada ejercicio es una fila de piezas: texto y huecos (null): ["7 + 8 =", null] o ["10 =", "3 +", null]
// datos:    { fila: [piezas] }       solucion: { huecos: [respuesta de cada null, en orden] }
// La fila se escribe con «−» (U+2212). Completa: `filas` × `columnas` (3 por defecto: 24 con 8 filas; `columnas: 2` para filas encadenadas más anchas); media: la mitad de filas.
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B, W, M as MARGEN } from "../render/papel.js";

export const M = "−";
/** Fila con huecos: texto = piezas con null donde va el cuadro gris; sol = respuestas. */
export const fila = (piezas, ...sol) => ({ clave: piezas.map((x) => x ?? "□").join(" "), fila: piezas, sol });

/**
 * def = { id, enunciado, filas = 8, pool(params) → [fila(...)…] (todas las filas posibles, sin repetir), minimo? }
 * Se barajan y se toman las necesarias; si la combinación de opciones no da suficientes filas, error «necesita…».
 */
export function trucoTipo({ id, enunciado, filas = 8, pool, version = 1, columnas = 3 }) {
  const cuantas = (tamano) => (tamano === "media" ? Math.max(1, Math.floor(filas / 2)) * columnas : filas * columnas);
  const limite = columnas === 3 ? 156 : Math.floor((W - 2 * MARGEN - (columnas - 1) * 10) / columnas - 17);   // 3 columnas: 156 pt (como siempre); 2 columnas: 248 pt
  return registrar({
    id, version,
    generar(params, azar, { tamano }) {
      const todas = [...new Map(pool(params).map((e) => [e.clave, e])).values()], n = cuantas(tamano);   // sin filas repetidas (p. ej. 9 + 9)
      if (todas.length < n) throw new Error(`«${id}» necesita un rango mayor (solo hay ${todas.length} operaciones distintas).`);
      const elegidas = azar.barajar(todas).slice(0, n);
      return { enunciado, ejercicios: elegidas.map((e) => ({ datos: { fila: e.fila }, solucion: { huecos: e.sol } })) };
    },
    dibujar(p, act) {
      const es = act.ejercicios;
      const items = es.map((e) => {
        let fs = 19, k = 0;
        const ancho = () => e.datos.fila.reduce((t, x) => t + (x === null ? 42 : p.ancho(x, "PB", fs)), 0) + 8 * (e.datos.fila.length - 1);
        while (ancho() > limite && fs > 13) fs -= 1;
        return e.datos.fila.map((x) => (x === null ? B(42, 38, e.solucion.huecos[k++]) : T(x, fs)));
      });
      p.pintar(TOP, columnas, filas, items, es.map((e) => e.id));
    },
  });
}
