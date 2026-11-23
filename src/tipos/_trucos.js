// Charta · trucos de cálculo mental de 1.º (bloque 12), tomados de Calculi. Fábrica común de los tipos trucos.<clave>.
// Cada ejercicio es una fila de piezas: texto y huecos (null): ["7 + 8 =", null] o ["10 =", "3 +", null]
// datos:    { fila: [piezas] }       solucion: { huecos: [respuesta de cada null, en orden] }
// La fila se escribe con «−» (U+2212). Cantidad (rejilla elástica): «Más grandes» = `filas` × `columnas` en completa (3 por defecto: 24 con 8 filas; `columnas: 2` para filas encadenadas más anchas) y la mitad de filas en media;
// «Más ejercicios» = las filas que caben con tarjetas ≥ MIN_ALTO (54 pt: una línea con su casilla), sin pasar de las operaciones distintas que da el pool.
// Con «Más grandes» la operación crece (letra y casilla hasta ×1,3) según el alto de la tarjeta; el ancho sigue limitado (156/248 pt) y la letra nunca baja de la de siempre.
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B, W, M as MARGEN, cuantosRejilla } from "../render/papel.js";

export const M = "−";
const MIN_ALTO = 54;   // alto mínimo de tarjeta con «Más ejercicios»
/** Fila con huecos: texto = piezas con null donde va el cuadro gris; sol = respuestas. */
export const fila = (piezas, ...sol) => ({ clave: piezas.map((x) => x ?? "□").join(" "), fila: piezas, sol });

/**
 * def = { id, enunciado, filas = 8, pool(params) → [fila(...)…] (todas las filas posibles, sin repetir), minimo? }
 * Se barajan y se toman las necesarias; si la combinación de opciones no da suficientes filas, error «necesita…».
 */
export function trucoTipo({ id, enunciado, filas = 8, pool, version = 2, columnas = 3 }) {
  const fijas = [filas * columnas, Math.max(1, Math.floor(filas / 2)) * columnas];   // [completa, media] con «Más grandes»
  const limite = columnas === 3 ? 156 : Math.floor((W - 2 * MARGEN - (columnas - 1) * 10) / columnas - 17);   // 3 columnas: 156 pt (como siempre); 2 columnas: 248 pt
  return registrar({
    id, version, cantidad: true,
    generar(params, azar, ctx) {
      const todas = [...new Map(pool(params).map((e) => [e.clave, e])).values()];   // sin filas repetidas (p. ej. 9 + 9)
      const fija = fijas[ctx.tamano === "media" ? 1 : 0];
      let n = cuantosRejilla(ctx, columnas, MIN_ALTO, fijas);
      if (ctx.cantidad === "mas" && todas.length < n) n = Math.max(fija, Math.floor(todas.length / columnas) * columnas);   // «Más ejercicios»: el máximo único posible (filas completas)
      if (todas.length < n) throw new Error(`«${id}» necesita un rango mayor (solo hay ${todas.length} operaciones distintas).`);
      const elegidas = azar.barajar(todas).slice(0, n);
      return { enunciado, ejercicios: elegidas.map((e) => ({ datos: { fila: e.fila }, solucion: { huecos: e.sol } })) };
    },
    dibujar(p, act) {
      const es = act.ejercicios, GY = 8;
      const { cel, cw, ch } = p.rejilla(TOP, columnas, Math.ceil(es.length / columnas), 10, GY);
      const crece = Math.min(1.3, Math.max(1, (ch - 24) / 38));   // la operación crece con la tarjeta (solo si sobra alto); con «Más ejercicios» es 1
      es.forEach((e, i) => p.ejercicio(e.id, () => {
        let k = 0, fs = 19;
        const anchoDe = (f, kb) => e.datos.fila.reduce((t, x) => t + (x === null ? 42 * kb : p.ancho(x, "PB", f)), 0) + 8 * (e.datos.fila.length - 1);
        while (anchoDe(fs, 1) > limite && fs > 13) fs -= 1;   // la letra de siempre (casilla de 42)
        const base = fs;
        let g = 19 * crece;   // con «Más grandes» prueba más grande, con la casilla creciendo a la par; si no cabe, se queda en la de siempre
        while (g > base && anchoDe(g, Math.max(1, g / 19)) > limite) g -= 0.5;
        fs = Math.max(base, g);
        const kb = () => (fs > base ? Math.max(1, fs / 19) : 1);
        const items = e.datos.fila.map((x) => (x === null ? B(42 * kb(), 38 * kb(), e.solucion.huecos[k++]) : T(x, fs)));
        const [x, y] = cel[i];
        p.marco(x, y, cw, ch); p.linea(x, y, cw, ch, items, 8);
      }));
    },
  });
}
