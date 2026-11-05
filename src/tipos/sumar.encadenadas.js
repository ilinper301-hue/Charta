// sumar.encadenadas · Sumas de tres números (port de _s_enc() del motor).
// datos:    { x, y, z }   (x + y + z = t, con t entre max(5, cap/2) y cap; cap = 10 si rango ≤ 10, si no 20)
// solucion: { huecos: [x + y + z] }
// Completa: 16 (8 filas × 2); media: 8. Tríos distintos.
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B } from "../render/papel.js";

export default registrar({
  id: "sumar.encadenadas",
  version: 1,
  generar(params, azar, { tamano }) {
    const cap = (params.rango ?? 10) <= 10 ? 10 : 20, cnt = tamano === "media" ? 8 : 16, vistos = new Set(), ejercicios = [];
    while (ejercicios.length < cnt) {
      let tr, t;
      for (let k = 0; k < 300; k++) {
        t = azar.entero(Math.max(5, Math.floor(cap / 2)), cap);
        const p = azar.muestra(Array.from({ length: t - 1 }, (_, i) => i + 1), 2).sort((u, v) => u - v);
        tr = [p[0], p[1] - p[0], t - p[1]];
        if (!vistos.has(tr.join())) break;
      }
      vistos.add(tr.join());
      ejercicios.push({ datos: { x: tr[0], y: tr[1], z: tr[2] }, solucion: { huecos: [t] } });
    }
    return { enunciado: "Suma los tres números y escribe el resultado.", ejercicios };
  },
  dibujar(p, act) {
    const es = act.ejercicios;
    p.pintar(TOP, 2, 8, es.map((e) => [T(`${e.datos.x} + ${e.datos.y} + ${e.datos.z} =`, 18), B(44, 36, e.solucion.huecos[0])]), es.map((e) => e.id));
  },
});
