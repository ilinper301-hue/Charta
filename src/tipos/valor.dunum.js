// valor.dunum · Decenas, unidades y número (port de _v_dunum() del motor).
// datos:    { n, orden: "a" | "b" }   (se muestra «d D y u U = ▢» (a) o «▢ = d D y u U» (b); n = 10..min(R, 99))
// solucion: { huecos: [n] }   (el motor deja el hueco para el número en las dos formas)
// Opciones: nivel null | "completas" (ver valor.canje). Rango mínimo 30 (error «necesita»).
// 2.º (rango > 100, tres cifras): datos { n, orden, centenas: true } (n = 100..R; texto «3 C, 4 D y 5 U», con ceros si procede) y solucion { huecos: [n] };
//   nivel null: sin ceros en D ni U; "completas": la mitad con algún cero (ver numsCDU en valor.canje). Sin repetir. Cuadro de respuesta más ancho.
// 3.º (rango > 1000): datos { n, orden, millares: true } (n = 1000..R; texto «4 UM, 3 C, 5 D y 2 U») y solucion { huecos: [n] }.
// Completa: 12 casillas (6 filas × 2), mitad «a» y mitad «b»; media: 6. Cantidad (rejilla elástica, p.rejilla): «Más grandes» = 12 y 6 (tarjetas que llenan el panel; letra y cuadro crecen hasta ×1,25);
// «Más ejercicios» = las filas de 2 que caben con tarjetas ≥ 60 pt (20 y 10; en 1.º no más que los números distintos del banco, siempre pares).
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B } from "../render/papel.js";
import { numsDU, numsCDU, numsUMCDU, bancoDU } from "./valor.canje.js";
import { cuantos, crecer } from "./_elastica.js";

const MIN_ALTO = 60;   // alto mínimo de tarjeta con «Más ejercicios» (cuadro de 44)

export default registrar({
  id: "valor.dunum",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const R = params.rango ?? 30, cnt = cuantos(ctx, 2, MIN_ALTO, [12, 6], R > 100 ? Infinity : bancoDU(R, params.nivel));
    if (R < 30) throw new Error("Este modelo necesita un rango máximo de al menos 30.");
    const nums = (R > 1000 ? numsUMCDU : R > 100 ? numsCDU : numsDU)(cnt, R, azar, params.nivel);
    const tipos = azar.barajar([...Array(cnt / 2).fill("a"), ...Array(cnt / 2).fill("b")]);
    return {
      enunciado: "Completa cada casilla con el número o con sus decenas y unidades.",
      ejercicios: nums.map((n, i) => ({ datos: { n, orden: tipos[i], ...(R > 1000 ? { millares: true } : R > 100 ? { centenas: true } : {}) }, solucion: { huecos: [n] } })),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.rejilla(TOP, 2, Math.ceil(act.ejercicios.length / 2)), k = Math.max(1, Math.min(1.25, ch / 110));
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { n, orden } = e.datos;
      p.marco(x, y, cw, ch, i);
      const linea = (txt, caja, gap, dx, w = cw - dx) => p.linea(x + dx, y, w, ch, crecer(orden === "a" ? [txt, T("=", 17), caja] : [caja, T("=", 17), txt], k), gap);
      if (e.datos.millares) return linea(T(`${Math.floor(n / 1000)} UM, ${Math.floor(n / 100) % 10} C, ${Math.floor(n / 10) % 10} D y ${n % 10} U`, 15), B(66, 44, n), 8, 10, cw - 20);
      const cen = e.datos.centenas;
      linea(cen ? T(`${Math.floor(n / 100)} C, ${Math.floor(n / 10) % 10} D y ${n % 10} U`, 16) : T(`${Math.floor(n / 10)} D y ${n % 10} U`, 17), B(cen ? 66 : 56, 44, n), cen ? 8 : 10, 22);
    }));
  },
});
