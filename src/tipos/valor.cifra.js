// valor.cifra · El valor de la cifra (port de _v_cifra() del motor).
// datos:    { n }   (n = 12..min(R, 99), con unidades y con cifras distintas)
// solucion: { huecos: [valor de la cifra de las decenas (n÷10·10), valor de la de las unidades (n mod 10)] }
// 2.º (rango > 100, tres cifras): datos { n, centenas: true } (n = 100..R, cifras distintas y sin ceros: 345) y
//   solucion { huecos: [c·100, d·10, u] }  («En 345, el 3 vale ▢, el 4 vale ▢ y el 5 vale ▢» → 300, 40, 5). Cuadros de 52.
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
    if (R > 100) {
      const c3 = []; for (let v = 100; v <= R; v++) { const a = [Math.floor(v / 100), Math.floor(v / 10) % 10, v % 10]; if (!a.includes(0) && new Set(a).size === 3) c3.push(v); }
      return {
        enunciado: "Escribe cuánto vale cada cifra.",
        ejercicios: azar.muestra(c3, cnt).map((n) => ({ datos: { n, centenas: true }, solucion: { huecos: [Math.floor(n / 100) * 100, Math.floor(n / 10) % 10 * 10, n % 10] } })),
      };
    }
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
      if (e.datos.centenas) {
        const [h1, h2, h3] = e.solucion.huecos, c = Math.floor(n / 100), d3 = Math.floor(n / 10) % 10;
        p.linea(M, y, W - 2 * M, rh, [T(`En ${n},`, 16), T(`el ${c} vale`, 14, "PM"), B(52, 38, h1), T(`el ${d3} vale`, 14, "PM"), B(52, 38, h2),
          T(`y el ${u} vale`, 14, "PM"), B(52, 38, h3)], 10);
        return;
      }
      p.linea(M, y, W - 2 * M, rh, [T(`En ${n},`, 16), T(`el ${d} vale`, 14, "PM"), B(56, 38, e.solucion.huecos[0]),
        T(`y el ${u} vale`, 14, "PM"), B(56, 38, e.solucion.huecos[1])], 14);
    }));
  },
});
