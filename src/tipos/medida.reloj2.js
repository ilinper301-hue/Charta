// medida.reloj2 · Dibuja las agujas (port de _m_reloj2() del motor; reutiliza dibujarReloj de medida.reloj).
// datos:    { h (1–12), m (0, 15, 30 o 45) }
// solucion: { huecos: [] }  (el alumno dibuja las agujas; en la hoja de soluciones se pintan en rojo)
// Opción modo: null (en punto y y media, mitad y mitad) | "punto" | "media". Completa: 12 relojes (3 × 4); media: 6.
import { registrar } from "../nucleo/tipos.js";
import { TOP, COLOR_SOLUCION } from "../render/papel.js";
import { dibujarReloj, horasModo } from "./medida.reloj.js";


export default registrar({
  id: "medida.reloj2",
  version: 1,
  generar(params, azar, { tamano }) {
    const cnt = tamano === "media" ? 6 : 12, modo = params.modo || "mezcla";
    const hs = horasModo(modo, cnt, azar);
    return {
      enunciado: "Dibuja las agujas para marcar la hora.",
      ejercicios: hs.map(([h, m]) => ({ datos: { h, m }, solucion: { huecos: [] } })),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 3, 4);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { h, m } = e.datos, cx = x + cw / 2, cy = y + (ch - 48) / 2, r = 46;
      p.marco(x, y, cw, ch, i);
      p.text(cx, y + ch - 36, `${h}:${String(m).padStart(2, "0")}`, 26, { f: "PB", anchor: "middle" });
      dibujarReloj(p, cx, cy, r, h, m, false);
      if (p.solucion) {
        const rad = (g) => g * Math.PI / 180;
        let a = rad(90 - (30 * (h % 12) + m * 0.5));
        p.line(cx, cy, cx + r * 0.42 * Math.cos(a), cy + r * 0.42 * Math.sin(a), { lw: 3.4, gris: COLOR_SOLUCION });
        a = rad(90 - 6 * m);
        p.line(cx, cy, cx + r * 0.64 * Math.cos(a), cy + r * 0.64 * Math.sin(a), { lw: 1.8, gris: COLOR_SOLUCION });
      }
    }));
  },
});
