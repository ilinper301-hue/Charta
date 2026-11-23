// valor.descdu · Descomposición en D y U (port de _v_descdu() del motor).
// datos:    { n, suma: bool }   (n = 10..min(R, 99))
// solucion: { huecos: [n÷10, n mod 10] }  si suma = false (n = ▢ D + ▢ U);   { huecos: [n÷10·10, n mod 10] } si suma = true (n = ▢ + ▢)
// Opciones: modo null (D y U) | "suma" (40 + 3); nivel null | "completas" (ver valor.canje). Rango mínimo 30 (error «necesita»).
// 3.º (rango > 1000): datos { n, suma, millares: true } (n = 1000..R) y solucion { huecos: [um, c, d, u] } (n = ▢ UM + ▢ C + ▢ D + ▢ U) o
//   { huecos: [um·1000, c·100, d·10, u] } si suma = true (4000 + 300 + 50 + 2). Mismo nivel que en 2.º. Con rango 1000, el de 2.º (hasta 999).
// Completa: 15 casillas (5 filas × 3); media: 6.
// 2.º (rango > 100, tres cifras): datos { n, suma, centenas: true } (n = 100..R) y solucion { huecos: [c, d, u] } (n = ▢ C + ▢ D + ▢ U) o
//   { huecos: [c·100, d·10, u] } si suma = true (n = ▢ + ▢ + ▢, p. ej. 300 + 40 + 5). Se activa con rango > 100 (en 2.º, 200…999).
//   nivel null: sin ceros en D ni U (345); nivel "completas": la mitad (redondeando arriba: 8 de 15, 3 de 6) con algún cero (305, 340, 300) y el resto sin ceros. Sin repetir.
//   Dibujo: línea de arriba «345 =», debajo los huecos (más estrechos para caber en la celda).
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B } from "../render/papel.js";
import { numsDU, numsCDU, numsUMCDU } from "./valor.canje.js";

export default registrar({
  id: "valor.descdu",
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 30, cnt = tamano === "media" ? 6 : 15, suma = params.modo === "suma";
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
    const { cel, cw, ch } = p.celdas(TOP, 3, 5);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { n, suma } = e.datos;
      p.marco(x, y, cw, ch, i);
      if (e.datos.millares) {
        const [m4, c4, d4, u4] = e.solucion.huecos;
        p.linea(x, y + ch / 2 - 4, cw, ch / 2 - 8, [T(`${n} =`, 24)]);
        p.linea(x, y + 6, cw, ch / 2 - 10, suma ? [B(44, 34, m4), T("+", 14), B(38, 34, c4), T("+", 14), B(32, 34, d4), T("+", 14), B(26, 34, u4)]
          : [B(24, 34, m4), T("UM", 10, "PM"), T("+", 12), B(24, 34, c4), T("C", 10, "PM"), T("+", 12), B(24, 34, d4), T("D", 10, "PM"), T("+", 12), B(24, 34, u4), T("U", 10, "PM")], 3);
        return;
      }
      if (e.datos.centenas) {
        const [c3, d3, u3] = e.solucion.huecos;
        p.linea(x, y + ch / 2 - 4, cw, ch / 2 - 8, [T(`${n} =`, 24)]);
        p.linea(x, y + 6, cw, ch / 2 - 10, suma ? [B(46, 36, c3), T("+", 15), B(36, 36, d3), T("+", 15), B(28, 36, u3)]
          : [B(28, 36, c3), T("C", 12, "PM"), T("+", 14), B(28, 36, d3), T("D", 12, "PM"), T("+", 14), B(28, 36, u3), T("U", 12, "PM")], 4);
        return;
      }
      const [d, u] = e.solucion.huecos;
      p.linea(x, y + ch / 2 - 4, cw, ch / 2 - 8, [T(n, 24)]);
      const it = suma ? [T("=", 17), B(46, 38, d), T("+", 17), B(46, 38, u)]
        : [T("=", 17), B(38, 36, d), T("D", 13, "PM"), T("+", 15), B(38, 36, u), T("U", 13, "PM")];
      p.linea(x, y + 6, cw, ch / 2 - 10, it, 6);
    }));
  },
});
