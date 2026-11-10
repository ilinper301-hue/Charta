// medida.reloj · Los relojes de agujas (port de _reloj(), _horas() y _m_reloj() del motor).
// datos:    { h (1–12), m (0, 15, 30 o 45; «menos cuarto» = h:45) }
// solucion: { huecos: [h, "00" | "15" | "30" | "45"] }
// Opción modo: null (en punto y y media, mitad y mitad) | "punto" | "media" · 2.º: "cuarto" | "todas".
// Completa: 12 relojes (4 filas × 3, horas distintas por grupo); media: 6.
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B, INK } from "../render/papel.js";

/** _reloj(): esfera con marcas, números y (si manos) las agujas. Ángulos como en el motor (12 arriba, sentido horario). */
export function dibujarReloj(p, cx, cy, r, h, m, manos = true) {
  p.circle(cx, cy, r, { lw: 2.0 });
  const rad = (g) => g * Math.PI / 180;
  for (let k = 0; k < 12; k++) {
    const a = rad(90 - 30 * k);
    p.line(cx + (r - 4) * Math.cos(a), cy + (r - 4) * Math.sin(a), cx + r * Math.cos(a), cy + r * Math.sin(a), { lw: 1.0 });
  }
  for (let k = 1; k <= 12; k++) {
    const a = rad(90 - 30 * k);
    p.text(cx + r * 0.74 * Math.cos(a), cy + r * 0.74 * Math.sin(a) - r * 0.09, String(k), r * 0.27, { f: "PB", anchor: "middle" });
  }
  if (manos) {
    let a = rad(90 - (30 * (h % 12) + m * 0.5));
    p.line(cx, cy, cx + r * 0.42 * Math.cos(a), cy + r * 0.42 * Math.sin(a), { lw: 3.4 });
    a = rad(90 - 6 * m);
    p.line(cx, cy, cx + r * 0.64 * Math.cos(a), cy + r * 0.64 * Math.sin(a), { lw: 1.8 });
  }
  p.circle(cx, cy, 2.3, { fill: INK, stroke: null });
}

const horas = (k, azar) => azar.muestra(Array.from({ length: 12 }, (_, i) => i + 1), k);
/** Minutos de cada modo: en 2.º (lote 3) «cuarto» = y cuarto y menos cuarto; «todas» = las cuatro (repartidas). */
export const MINUTOS = { punto: [0], media: [30], mezcla: [0, 30], cuarto: [15, 45], todas: [0, 15, 30, 45] };
/** [h, m] de cada reloj: los grupos de minutos a partes iguales (el resto, a los primeros), horas distintas en cada grupo. */
export function horasModo(modo, cnt, azar) {
  const ms = MINUTOS[modo || "mezcla"];
  if (ms.length === 1) return horas(cnt, azar).map((h) => [h, ms[0]]);
  const hs = ms.flatMap((m, k) => horas(Math.floor(cnt / ms.length) + (k < cnt % ms.length ? 1 : 0), azar).map((h) => [h, m]));
  return azar.barajar(hs);
}

export default registrar({
  id: "medida.reloj",
  version: 1,
  generar(params, azar, { tamano }) {
    const cnt = tamano === "media" ? 6 : 12, modo = params.modo || "mezcla";
    const hs = horasModo(modo, cnt, azar);
    return {
      enunciado: "Escribe la hora que marca cada reloj.",
      ejercicios: hs.map(([h, m]) => ({ datos: { h, m }, solucion: { huecos: [h, String(m).padStart(2, "0")] } })),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 3, 4);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { h, m } = e.datos, [sh, sm] = e.solucion.huecos;
      p.marco(x, y, cw, ch, i);
      dibujarReloj(p, x + cw / 2, y + ch * 0.6, 44, h, m);
      p.linea(x, y + 8, cw, 46, [B(42, 34, sh), T(":", 22), B(42, 34, sm)], 8);
    }));
  },
});
