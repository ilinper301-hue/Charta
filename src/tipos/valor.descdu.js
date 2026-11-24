// valor.descdu · Descomposición en D y U (port de _v_descdu() del motor).
// datos:    { n, suma: bool }   (n = 10..min(R, 99))
// solucion: { huecos: [n÷10, n mod 10] }  si suma = false (n = ▢ D + ▢ U);   { huecos: [n÷10·10, n mod 10] } si suma = true (n = ▢ + ▢)
// Opciones: modo null (D y U) | "suma" (40 + 3); nivel null | "completas" (ver valor.canje). Rango mínimo 30 (error «necesita»).
// 3.º (rango > 1000): datos { n, suma, millares: true } (n = 1000..R) y solucion { huecos: [um, c, d, u] } (n = ▢ UM + ▢ C + ▢ D + ▢ U) o
//   { huecos: [um·1000, c·100, d·10, u] } si suma = true (4000 + 300 + 50 + 2). Mismo nivel que en 2.º. Con rango 1000, el de 2.º (hasta 999).
// Completa: 15 casillas (5 filas × 3); media: 6. Cantidad (rejilla elástica, p.rejilla): «Más grandes» = 15 y 6 (tarjetas que llenan el panel; la letra y los huecos crecen hasta ×1,25);
// «Más ejercicios» = las filas de 3 que caben con tarjetas ≥ 92 pt (21 y 9; en 1.º no más que los números distintos del banco).
// 2.º (rango > 100, tres cifras): datos { n, suma, centenas: true } (n = 100..R) y solucion { huecos: [c, d, u] } (n = ▢ C + ▢ D + ▢ U) o
//   { huecos: [c·100, d·10, u] } si suma = true (n = ▢ + ▢ + ▢, p. ej. 300 + 40 + 5). Se activa con rango > 100 (en 2.º, 200…999).
//   nivel null: sin ceros en D ni U (345); nivel "completas": la mitad (redondeando arriba: 8 de 15, 3 de 6) con algún cero (305, 340, 300) y el resto sin ceros. Sin repetir.
//   Dibujo: línea de arriba «345 =», debajo los huecos (más estrechos para caber en la celda).
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B } from "../render/papel.js";
import { numsDU, numsCDU, numsUMCDU, bancoDU } from "./valor.canje.js";
import { cuantos, crecer } from "./_elastica.js";

const MIN_ALTO = 92;   // alto mínimo de tarjeta con «Más ejercicios» (huecos de 38 abajo y el número de 24 arriba)

export default registrar({
  id: "valor.descdu",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const R = params.rango ?? 30, cnt = cuantos(ctx, 3, MIN_ALTO, [15, 6], R > 100 ? Infinity : bancoDU(R, params.nivel)), suma = params.modo === "suma";
    if (R < 30) throw new Error("La descomposición D/U necesita un rango máximo de al menos 30.");
    if (R > 1000) {   // 3.º: cuatro cifras (UM, C, D, U)
      return {
        enunciado: suma ? "Descompón cada número en una suma de millares, centenas, decenas y unidades." : "Descompón cada número en millares (UM), centenas (C), decenas (D) y unidades (U).",
        ejercicios: numsUMCDU(cnt, R, azar, params.nivel).map((n) => ({
          datos: { n, suma, millares: true },
          solucion: { huecos: [Math.floor(n / 1000) * (suma ? 1000 : 1), Math.floor(n / 100) % 10 * (suma ? 100 : 1), Math.floor(n / 10) % 10 * (suma ? 10 : 1), n % 10] },
        })),
      };
    }
    if (R > 100) {
      return {
        enunciado: suma ? "Descompón cada número en una suma de centenas, decenas y unidades." : "Descompón cada número en centenas (C), decenas (D) y unidades (U).",
        ejercicios: numsCDU(cnt, R, azar, params.nivel).map((n) => ({
          datos: { n, suma, centenas: true },
          solucion: { huecos: [Math.floor(n / 100) * (suma ? 100 : 1), Math.floor(n / 10) % 10 * (suma ? 10 : 1), n % 10] },
        })),
      };
    }
    return {
      enunciado: suma ? "Descompón cada número en una suma de decenas y unidades." : "Descompón cada número en decenas (D) y unidades (U).",
      ejercicios: numsDU(cnt, R, azar, params.nivel).map((n) => ({
        datos: { n, suma }, solucion: { huecos: [Math.floor(n / 10) * (suma ? 10 : 1), n % 10] },
      })),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.rejilla(TOP, 3, Math.ceil(act.ejercicios.length / 3));
    const k = Math.max(1, Math.min(1.25, ch / 134)), lh = Math.max(44, ch / 2 - 10), uy = lh + 6, uh = ch - uy - 12;   // abajo los huecos, arriba el número
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { n, suma } = e.datos;
      p.marco(x, y, cw, ch, i);
      const abajo = (its, gap) => p.linea(x, y + 6, cw, lh, crecer(its, k), gap), arriba = (its) => p.linea(x, y + uy, cw, uh, crecer(its, k));
      if (e.datos.millares) {
        const [m4, c4, d4, u4] = e.solucion.huecos;
        arriba([T(`${n} =`, 24)]);
        abajo(suma ? [B(44, 34, m4), T("+", 14), B(38, 34, c4), T("+", 14), B(32, 34, d4), T("+", 14), B(26, 34, u4)]
          : [B(24, 34, m4), T("UM", 10, "PM"), T("+", 12), B(24, 34, c4), T("C", 10, "PM"), T("+", 12), B(24, 34, d4), T("D", 10, "PM"), T("+", 12), B(24, 34, u4), T("U", 10, "PM")], 3);
        return;
      }
      if (e.datos.centenas) {
        const [c3, d3, u3] = e.solucion.huecos;
        arriba([T(`${n} =`, 24)]);
        abajo(suma ? [B(46, 36, c3), T("+", 15), B(36, 36, d3), T("+", 15), B(28, 36, u3)]
          : [B(28, 36, c3), T("C", 12, "PM"), T("+", 14), B(28, 36, d3), T("D", 12, "PM"), T("+", 14), B(28, 36, u3), T("U", 12, "PM")], 4);
        return;
      }
      const [d, u] = e.solucion.huecos;
      arriba([T(n, 24)]);
      abajo(suma ? [T("=", 17), B(46, 38, d), T("+", 17), B(46, 38, u)]
        : [T("=", 17), B(38, 36, d), T("D", 13, "PM"), T("+", 15), B(38, 36, u), T("U", 13, "PM")], 6);
    }));
  },
});
