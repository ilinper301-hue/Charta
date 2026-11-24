// multiplicar.tablas · Las tablas (2.º, lote 6, bloque 13): operaciones de las tablas del 2, 3, 4, 5 y 10 en rejilla.
// datos:    { a, b, falta: null | 0 | 1 }   (a × b; `falta` = factor que se esconde en modo "hueco")
//           modo "orden": además { tabla, orden: true } (tabla × b, con b de 1 a 10 seguidos)
// solucion: resultado → huecos [a·b] · "hueco" → [factor escondido] · "orden" → [tabla·b]
// Opciones: tablas (None = 2, 5 y 10; "2", "3", "4", "5", "10"; "todas") · modo (None = Resultado, "hueco", "orden").
// En una operación al menos un factor es de la tabla y el otro va de 1 a 10. Sin repetir operaciones (salvo en "orden").
// Resultado y hueco: rejilla de 3 columnas × 8 filas (24; media 12). Con una sola tabla hay solo 19–20 operaciones distintas: 6 filas (18; media 9).
// Cantidad (rejilla elástica, solo en Resultado y Hueco; «Orden» no cambia): «Más grandes» = 24 y 12 (18 y 9 con una tabla); «Más ejercicios» = las filas de 3 que caben con tarjetas ≥ 54 pt (33 y 15; con una tabla, las operaciones distintas que hay).
// Orden: una columna por tabla (hasta 3; con «todas» se sortean 3 de las 5), de ×1 a ×10; la media página, de ×1 a ×5.
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B, W, M } from "../render/papel.js";
import { cuantos, pintarEl, MIN_OP } from "./_elastica.js";
import { POR, tablasDe } from "./_multiplicar.js";

/** Parejas ordenadas (a, b) con al menos un factor de las tablas elegidas y los dos entre 1 y 10. */
export function parejas(tablas) {
  const out = [];
  for (let a = 1; a <= 10; a++) for (let b = 1; b <= 10; b++) if (tablas.includes(a) || tablas.includes(b)) out.push([a, b]);
  return out;
}

export default registrar({
  id: "multiplicar.tablas",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const media = ctx.tamano === "media", tablas = tablasDe(params), modo = params.modo ?? null;
    if (modo === "orden") {
      const elegidas = tablas.length > 3 ? azar.muestra(tablas, 3).sort((u, v) => u - v) : tablas;
      const hasta = media ? 5 : 10;
      return {
        enunciado: "Completa las tablas en orden.",
        ejercicios: elegidas.flatMap((t) => Array.from({ length: hasta }, (_, i) => ({
          datos: { a: t, b: i + 1, tabla: t, orden: true, falta: null }, solucion: { huecos: [t * (i + 1)] },
        }))),
      };
    }
    const pool = parejas(tablas).filter(([a, b]) => a !== 1 || b !== 1), filas = pool.length >= 24 ? 8 : 6, cnt = cuantos(ctx, 3, MIN_OP, [filas * 3, Math.floor(filas / 2) * 3], pool.length);
    const ejercicios = azar.muestra(pool, cnt).map(([a, b]) => {
      const falta = modo === "hueco" ? azar.entero(0, 1) : null;
      return { datos: { a, b, falta }, solucion: { huecos: [falta === null ? a * b : falta === 0 ? a : b] } };
    });
    return {
      enunciado: modo === "hueco" ? "Escribe el número que falta en cada multiplicación." : "Calcula y escribe el resultado en el cuadro gris.",
      ejercicios,
    };
  },
  dibujar(p, act) {
    const es = act.ejercicios, orden = act.params.modo === "orden";
    const items = (e) => {
      const { a, b, falta } = e.datos, h = e.solucion.huecos[0];
      if (falta === 0) return [B(40, 38, h), T(`${POR} ${b} = ${a * b}`, 19)];
      if (falta === 1) return [T(`${a} ${POR}`, 19), B(40, 38, h), T(`= ${a * b}`, 19)];
      return [T(`${a} ${POR} ${b} =`, 19), B(48, 38, h)];
    };
    if (!orden) {
      pintarEl(p, 3, es.map(items), es.map((e) => e.id), es.length / 3);   // rejilla elástica: la operación crece con la tarjeta
      return;
    }
    // La tabla en orden: una columna por tabla, 10 filas (la media, 5), centradas
    const tablas = [...new Set(es.map((e) => e.datos.tabla))], GX = 10, GY = 8, rows = 10;
    const cw = (W - 2 * M - 2 * GX) / 3, ch = (TOP - M - (rows - 1) * GY) / rows;
    const x0 = M + (3 - tablas.length) * (cw + GX) / 2;
    es.forEach((e) => p.ejercicio(e.id, () => {
      const col = tablas.indexOf(e.datos.tabla), r = e.datos.b - 1;
      const x = x0 + col * (cw + GX), y = TOP - (r + 1) * ch - r * GY;
      p.marco(x, y, cw, ch);
      p.linea(x, y, cw, ch, [T(`${e.datos.tabla} ${POR} ${e.datos.b} =`, 19), B(48, 38, e.solucion.huecos[0])], 8);
    }));
  },
});
