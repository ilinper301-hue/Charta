// valor.cifra · El valor de la cifra (port de _v_cifra() del motor).
// datos:    { n }   (n = 12..min(R, 99), con unidades y con cifras distintas)
// solucion: { huecos: [valor de la cifra de las decenas (n÷10·10), valor de la de las unidades (n mod 10)] }
// 2.º (rango > 100, tres cifras): datos { n, centenas: true } (n = 100..R, cifras distintas y sin ceros: 345) y
//   solucion { huecos: [c·100, d·10, u] }  («En 345, el 3 vale ▢, el 4 vale ▢ y el 5 vale ▢» → 300, 40, 5). Cuadros de 52.
// 3.º (rango > 1000): datos { n, millares: true } (n = 1000..R, cuatro cifras distintas y sin ceros) y solucion { huecos: [um·1000, c·100, d·10, u] }.
// Rango mínimo 30 (error «necesita»). Completa: 8 filas, sin repetir; media: 4.
// Cantidad (rejilla elástica de una columna): «Más grandes» = 8 y 4 (llenan el panel; la operación crece hasta ×1,3 si cabe); «Más ejercicios» = 11 y 5 (tarjetas ≥ 54 pt), sin repetir.
import { registrar } from "../nucleo/tipos.js";
import { T, B } from "../render/papel.js";
import { MIN_OP, cuantos, pintarEl } from "./_elastica.js";

export default registrar({
  id: "valor.cifra",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const R = params.rango ?? 30;
    if (R < 30) throw new Error("El valor de la cifra necesita un rango máximo de al menos 30.");
    const cand = []; for (let v = 12; v <= Math.min(R, 99); v++) if (v % 10 && Math.floor(v / 10) !== v % 10) cand.push(v);
    const cnt = cuantos(ctx, 1, MIN_OP, [8, 4], R > 100 ? Infinity : cand.length);
    if (R > 1000) {   // 3.º: cuatro cifras distintas y sin ceros (4352)
      const c4 = []; for (let v = 1000; v <= R; v++) { const a = [Math.floor(v / 1000), Math.floor(v / 100) % 10, Math.floor(v / 10) % 10, v % 10]; if (!a.includes(0) && new Set(a).size === 4) c4.push(v); }
      return {
        enunciado: "Escribe cuánto vale cada cifra.",
        ejercicios: azar.muestra(c4, cnt).map((n) => ({ datos: { n, millares: true }, solucion: { huecos: [Math.floor(n / 1000) * 1000, Math.floor(n / 100) % 10 * 100, Math.floor(n / 10) % 10 * 10, n % 10] } })),
      };
    }
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
    const ids = act.ejercicios.map((e) => e.id), un = act.ejercicios[0]?.datos;
    const filas = act.ejercicios.map((e) => {
      const { n } = e.datos, d = Math.floor(n / 10), u = n % 10, hs = e.solucion.huecos;
      if (e.datos.millares) {
        const cs = [Math.floor(n / 1000), Math.floor(n / 100) % 10, Math.floor(n / 10) % 10, u];
        return [T(`En ${n},`, 15), ...cs.flatMap((c, k) => [T(k === 3 ? `y el ${c} vale` : `el ${c} vale`, 13, "PM"), B(46, 36, hs[k])])];
      }
      if (e.datos.centenas) {
        const c = Math.floor(n / 100), d3 = Math.floor(n / 10) % 10;
        return [T(`En ${n},`, 16), T(`el ${c} vale`, 14, "PM"), B(52, 38, hs[0]), T(`el ${d3} vale`, 14, "PM"), B(52, 38, hs[1]), T(`y el ${u} vale`, 14, "PM"), B(52, 38, hs[2])];
      }
      return [T(`En ${n},`, 16), T(`el ${d} vale`, 14, "PM"), B(56, 38, hs[0]), T(`y el ${u} vale`, 14, "PM"), B(56, 38, hs[1])];
    });
    pintarEl(p, 1, filas, ids, 8, 8, un?.millares ? 8 : un?.centenas ? 10 : 14);
  },
});
