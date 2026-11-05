// conteo.tabla · La tabla de números (port de _c_tabla() del motor).
// datos:    { R, huecos: [n…] }   tabla de 1..R en filas de 10 (R = mín(rango, 100)); huecos = los números que faltan (ordenados)
// solucion: { huecos: [los mismos números, en el orden de la tabla] }
// Opciones: huecos (3–30; por defecto máx(3, R/5)); como mucho R − 1. Una sola tabla por ficha (solo tamaño completa).
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W } from "../render/papel.js";

export default registrar({
  id: "conteo.tabla",
  version: 1,
  generar(params, azar) {
    const R = Math.min(params.rango ?? 10, 100);
    const h = Math.min(30, params.huecos ?? Math.max(3, Math.floor(R / 5)));
    const huecos = azar.muestra(Array.from({ length: R }, (_, i) => i + 1), Math.min(h, R - 1)).sort((a, b) => a - b);
    return {
      enunciado: "Completa la tabla escribiendo los números que faltan.",
      ejercicios: [{ datos: { R, huecos }, solucion: { huecos: [...huecos] } }],
    };
  },
  dibujar(p, act) {
    const e = act.ejercicios[0], { R, huecos } = e.datos;
    const rows = Math.ceil(R / 10), cw = (W - 2 * M) / 10, chh = Math.min(62, (TOP - M) / rows);
    p.ejercicio(e.id, () => {
      for (let n = 1; n <= R; n++) {
        const r = Math.floor((n - 1) / 10), k = (n - 1) % 10, vac = huecos.includes(n);
        p.caja(M + k * cw + 2, TOP - (r + 1) * chh + 2, cw - 4, chh - 4, vac ? null : n, 17, vac ? n : null);
      }
    });
  },
});
