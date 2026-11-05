// valor.dunum · Decenas, unidades y número (port de _v_dunum() del motor).
// datos:    { n, orden: "a" | "b" }   (se muestra «d D y u U = ▢» (a) o «▢ = d D y u U» (b); n = 10..min(R, 99))
// solucion: { huecos: [n] }   (el motor deja el hueco para el número en las dos formas)
// Opciones: nivel null | "completas" (ver valor.canje). Rango mínimo 30 (error «necesita»).
// Completa: 12 casillas (6 filas × 2), mitad «a» y mitad «b»; media: 6.
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B } from "../render/papel.js";
import { numsDU } from "./valor.canje.js";

export default registrar({
  id: "valor.dunum",
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 30, cnt = tamano === "media" ? 6 : 12;
    if (R < 30) throw new Error("Este modelo necesita un rango máximo de al menos 30.");
    const nums = numsDU(cnt, R, azar, params.nivel);
    const tipos = azar.barajar([...Array(cnt / 2).fill("a"), ...Array(cnt / 2).fill("b")]);
    return {
      enunciado: "Completa cada casilla con el número o con sus decenas y unidades.",
      ejercicios: nums.map((n, i) => ({ datos: { n, orden: tipos[i] }, solucion: { huecos: [n] } })),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 2, 6);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { n, orden } = e.datos;
      p.marco(x, y, cw, ch, i);
      const txt = T(`${Math.floor(n / 10)} D y ${n % 10} U`, 17), caja = B(56, 44, n);
      p.linea(x + 22, y, cw - 22, ch, orden === "a" ? [txt, T("=", 17), caja] : [caja, T("=", 17), txt], 10);
    }));
  },
});
