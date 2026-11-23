// orden.redondea · Redondea (3.º, MATES_3.md bloque 3): a la decena, a la centena o al millar.
// datos:    { n, u: "decena" | "centena" | "millar" }   (n = 1000..rango, nunca un múltiplo de u; el redondeo no pasa de 9999)
// solucion: { huecos: [n redondeado] }   (regla de siempre: la cifra siguiente de 5 a 9 sube; de 0 a 4 se queda)
// Opción a: null (mezcla: un tercio de cada) | "decena" | "centena" | "millar".
// Completa: 15 (3 columnas × 5 filas); media: 6. Con una sola unidad, la mitad sube y la otra mitad baja; sin repetir.
import { registrar } from "../nucleo/tipos.js";
import { TOP, MENOS, T } from "../render/papel.js";

export const UNIDAD = { decena: 10, centena: 100, millar: 1000 };
export const ARTICULO = { decena: "la decena", centena: "la centena", millar: "el millar" };
/** Redondeo de siempre: 5 o más, sube. */
export const redondear = (n, u) => Math.floor((n + u / 2) / u) * u;

/** Flecha → dibujada con trazos (las letras no llevan «→»). */
export function flecha(p, x, y, w = 24) {
  p.line(x, y, x + w, y, { lw: 2 });
  p.line(x + w - 6, y + 5, x + w, y, { lw: 2 }); p.line(x + w - 6, y - 5, x + w, y, { lw: 2 });
}

export default registrar({
  id: "orden.redondea",
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 9999, cnt = tamano === "media" ? 6 : 15, us = params.a ? [params.a] : ["decena", "centena", "millar"];
    const vistos = new Set(), unidades = [];
    for (let i = 0; i < cnt; i++) unidades.push(us[i % us.length]);
    const cuenta = {};
    const ejercicios = azar.barajar(unidades).map((u) => {
      cuenta[u] = (cuenta[u] ?? -1) + 1;
      const paso = UNIDAD[u], sube = cuenta[u] % 2 === 0;   // alterna subir y bajar dentro de cada unidad
      for (let k = 0; k < 3000; k++) {
        const n = azar.entero(1000, R);
        if (n % paso === 0 || redondear(n, paso) > 9999 || ((n % paso) >= paso / 2) !== sube || vistos.has(n)) continue;
        vistos.add(n);
        return { datos: { n, u }, solucion: { huecos: [redondear(n, paso)] } };
      }
      throw new Error("Esta ficha necesita un rango máximo mayor.");
    });
    return {
      enunciado: params.a ? `Redondea cada número a ${ARTICULO[params.a]}.` : "Redondea cada número como pide cada casilla.",
      ejercicios,
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 3, 5);
    const w = 56, h = 46, g = 8, tw = 2 * w + 24 + 2 * g;
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], by = y + (ch - 26 - h) / 2, bx = x + (cw - tw) / 2;
      p.marco(x, y, cw, ch, i, (e.datos.u === "millar" ? "AL " : "A LA ") + e.datos.u.toUpperCase());
      p.caja(bx, by, w, h, e.datos.n, 20);
      flecha(p, bx + w + g, by + h / 2);
      p.caja(bx + w + 24 + 2 * g, by, w, h, null, 20, e.solucion.huecos[0]);
    }));
  },
});
