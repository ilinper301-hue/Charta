// conteo.tabla · La tabla de números (port de _c_tabla() del motor).
// datos:    { R, huecos: [n…] }   tabla de 1..R en filas de 10 (R = mín(rango, 100)); huecos = los números que faltan (ordenados)
// solucion: { huecos: [los mismos números, en el orden de la tabla] }
// Opciones: huecos (3–30; por defecto máx(3, R/5)); como mucho R − 1. Solo tamaño completa. Con R ≤ 10 (una sola fila) salen NTAB = 5 tablas seguidas, cada una con sus huecos (un ejercicio por tabla);
//           con R > 10, una sola.
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W } from "../render/papel.js";

export const NTAB = 5;   // tablas de una fila (R ≤ 10) por ficha

export default registrar({
  id: "conteo.tabla",
  version: 2,
  generar(params, azar) {
    const R = Math.min(params.rango ?? 10, 100);
    const h = Math.min(30, params.huecos ?? Math.max(3, Math.floor(R / 5)));
    const una = () => { const huecos = azar.muestra(Array.from({ length: R }, (_, i) => i + 1), Math.min(h, R - 1)).sort((a, b) => a - b); return { datos: { R, huecos }, solucion: { huecos: [...huecos] } }; };
    const n = R <= 10 ? NTAB : 1;
    return {
      enunciado: n > 1 ? "Completa las tablas escribiendo los números que faltan." : "Completa la tabla escribiendo los números que faltan.",
      ejercicios: Array.from({ length: n }, una),
    };
  },
  dibujar(p, act) {
    const R = act.ejercicios[0].datos.R, nt = act.ejercicios.length;
    const rows = Math.ceil(R / 10), cw = (W - 2 * M) / 10, slot = (TOP - M) / nt, chh = Math.min(nt > 1 ? 80 : 62, slot / rows);
    act.ejercicios.forEach((e, t) => p.ejercicio(e.id, () => {
      const { huecos } = e.datos, top = TOP - t * slot - (slot - chh * rows) / 2;   // varias tablas: cada una centrada en su franja
      for (let n = 1; n <= R; n++) {
        const r = Math.floor((n - 1) / 10), k = (n - 1) % 10, vac = huecos.includes(n);
        p.caja(M + k * cw + 2, top - (r + 1) * chh + 2, cw - 4, chh - 4, vac ? null : n, nt > 1 ? 20 : 17, vac ? n : null);
      }
    }));
  },
});
