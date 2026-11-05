// valor.cifra · El valor de la cifra (port de _v_cifra() del motor).
// datos:    { n }   (n = 12..min(R, 99), con unidades y con cifras distintas)
// solucion: { huecos: [valor de la cifra de las decenas (n÷10·10), valor de la de las unidades (n mod 10)] }
// Rango mínimo 30 (error «necesita»). Completa: 8 filas, sin repetir; media: 4.
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, T, B } from "../render/papel.js";

export default registrar({
  id: "valor.cifra",
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 30, cnt = tamano === "media" ? 4 : 8;
    if (R < 30) throw new Error("El valor de la cifra necesita un rango máximo de al menos 30.");
    const cand = []; for (let v = 12; v <= Math.min(R, 99); v++) if (v % 10 && Math.floor(v / 10) !== v % 10) cand.push(v);
    return {
      enunciado: "Escribe cuánto vale cada cifra.",
      ejercicios: azar.muestra(cand, cnt).map((n) => ({ datos: { n }, solucion: { huecos: [Math.floor(n / 10) * 10, n % 10] } })),
    };
  },
  dibujar(p, act) {
    const rows = 8, GY = 8, rh = (TOP - M - (rows - 1) * GY) / rows;
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const { n } = e.datos, y = TOP - (i + 1) * rh - i * GY, d = Math.floor(n / 10), u = n % 10;
      p.marco(M, y, W - 2 * M, rh);
      p.linea(M, y, W - 2 * M, rh, [T(`En ${n},`, 16), T(`el ${d} vale`, 14, "PM"), B(56, 38, e.solucion.huecos[0]),
        T(`y el ${u} vale`, 14, "PM"), B(56, 38, e.solucion.huecos[1])], 14);
    }));
  },
});
