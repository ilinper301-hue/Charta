// valor.canje · Los canjes: cambiar unidades por decenas (port de _v_canje() y _nums_du() del motor).
// datos:    { n }   (n unidades; 10..min(R, 99))
// solucion: { huecos: [decenas, unidades] }
// Opciones: nivel null (2 decenas completas + el resto con unidades) | "completas" (solo decenas completas, pueden repetirse si hay pocas).
// Rango mínimo 20 (error «necesita»). Completa: 8 filas; media: 4.
// Ayudantes compartidos con los demás tipos de «valor»: muestra(), numsDU().
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, T, B } from "../render/papel.js";

/** _muestra(): k elementos distintos del pool; si no llegan, completa repitiendo al azar. */
export function muestra(pool, k, azar) {
  const out = azar.barajar(pool).slice(0, k);
  while (out.length < k) out.push(azar.elegir(pool));
  return out;
}

/** _nums_du(): cnt números de 10..min(R, 99): decenas completas («completas») o 2 completas + el resto con unidades. */
export function numsDU(cnt, R, azar, nivel) {
  const cap = Math.min(R, 99), mult = [], rest = [];
  for (let v = 10; v <= cap; v += 10) mult.push(v);
  for (let v = 11; v <= cap; v++) if (v % 10) rest.push(v);
  if (nivel === "completas" || nivel === "ceros") return muestra(mult, cnt, azar);
  return azar.barajar([...muestra(mult, Math.min(2, cnt), azar), ...muestra(rest, cnt - 2, azar)]);
}

export default registrar({
  id: "valor.canje",
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 20, cnt = tamano === "media" ? 4 : 8;
    if (Math.min(R, 99) < 20) throw new Error("Los canjes necesitan un rango máximo de al menos 20.");
    return {
      enunciado: "Cambia las unidades por decenas y escribe cuántas decenas y unidades son.",
      ejercicios: numsDU(cnt, R, azar, params.nivel).map((n) => ({ datos: { n }, solucion: { huecos: [Math.floor(n / 10), n % 10] } })),
    };
  },
  dibujar(p, act) {
    const rows = 8, GY = 8, rh = (TOP - M - (rows - 1) * GY) / rows;
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const { n } = e.datos, y = TOP - (i + 1) * rh - i * GY, [d, u] = e.solucion.huecos;
      p.marco(M, y, W - 2 * M, rh);
      p.linea(M, y, W - 2 * M, rh, [T(`${n} unidades`, 17), T("=", 17), B(44, 38, d), T("decena(s)", 13, "PM"), T("y", 13, "PM"),
        B(44, 38, u), T("unidad(es)", 13, "PM")], 12);
    }));
  },
});
