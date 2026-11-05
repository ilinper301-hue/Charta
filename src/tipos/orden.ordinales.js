// orden.ordinales · Los ordinales (port de _o_ordinales() del motor).
// datos:    { tarea: "colorea" | "lugar", k, m, fig: 0 | 1 | 2 }   (m = 7..10 dibujos en fila, k = 1..m el pedido; fig = flor | coche | niño)
// solucion: { huecos: [] } si colorea (el alumno colorea);  { huecos: [k] } si lugar (lugar que ocupa el dibujo marcado)
// Opciones: modo null (mezclado: filas pares «colorea», impares «lugar») | "colorea" | "lugar".
// Completa: 6 filas; media: 3. La figura depende de la fila (i % 3).
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, INK } from "../render/papel.js";

/** flecha() del motor: línea con cabeza triangular rellena. */
export function flecha(p, x1, y1, x2, y2, hd = 4.5, lw = 1.6) {
  p.line(x1, y1, x2, y2, { lw });
  const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
  p.path([["M", x2, y2], ["L", x2 - ux * hd * 1.6 - uy * hd, y2 - uy * hd * 1.6 + ux * hd],
    ["L", x2 - ux * hd * 1.6 + uy * hd, y2 - uy * hd * 1.6 - ux * hd], ["Z"]], { fill: INK, stroke: null });
}

const flor = (p, x, y) => {
  p.line(x, y - 16, x, y - 3, { lw: 1.5 }); p.line(x, y - 11, x + 6, y - 7, { lw: 1.5 });
  for (let j = 0; j < 5; j++) {
    const a = Math.PI / 2 + j * 2 * Math.PI / 5;
    p.circle(x + 8.5 * Math.cos(a), y + 5 + 8.5 * Math.sin(a), 5.2, { fill: 1 });
  }
  p.circle(x, y + 5, 4.3, { fill: 1 });
};
const coche = (p, x, y) => {
  p.rrect(x - 17, y - 8, 34, 11, 3); p.rrect(x - 9, y + 3, 18, 9, 3);
  for (const dx of [-9, 9]) p.circle(x + dx, y - 9, 4.2, { fill: 1 });
};
const nino = (p, x, y) => {
  p.circle(x, y + 12, 5); p.line(x, y + 7, x, y - 6, { lw: 1.5 }); p.line(x - 8, y + 2, x + 8, y + 2, { lw: 1.5 });
  p.line(x, y - 6, x - 6, y - 16, { lw: 1.5 }); p.line(x, y - 6, x + 6, y - 16, { lw: 1.5 });
};
const FIGURAS = [flor, coche, nino];

export default registrar({
  id: "orden.ordinales",
  version: 1,
  generar(params, azar, { tamano }) {
    const modo = params.modo || "mezcla", cnt = tamano === "media" ? 3 : 6, ejercicios = [];
    for (let i = 0; i < cnt; i++) {
      const tarea = modo === "colorea" || (modo === "mezcla" && i % 2 === 0) ? "colorea" : "lugar";
      const m = azar.entero(7, 10), k = azar.entero(1, m);
      ejercicios.push({ datos: { tarea, k, m, fig: i % 3 }, solucion: { huecos: tarea === "lugar" ? [k] : [] } });
    }
    return { enunciado: "Cuenta desde el principio y haz lo que pide cada fila.", ejercicios };
  },
  dibujar(p, act) {
    const rows = 6, GY = 8, rh = (TOP - M - (rows - 1) * GY) / rows, pitch = 48;
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const { tarea, k, m, fig } = e.datos, y = TOP - (i + 1) * rh - i * GY;
      p.marco(M, y, W - 2 * M, rh);
      const cy = y + 42, x0 = M + (W - 2 * M - m * pitch) / 2 + pitch / 2;
      for (let j = 0; j < m; j++) FIGURAS[fig](p, x0 + j * pitch, cy);
      if (tarea === "colorea") {
        p.text(M + 16, y + rh - 22, `COLOREA EL ${k}.º`, 10.5, { f: "PB" });
      } else {
        p.text(M + 16, y + rh - 22, "¿QUÉ LUGAR OCUPA EL DIBUJO MARCADO?", 10.5, { f: "PB" });
        flecha(p, x0 + (k - 1) * pitch, cy + 36, x0 + (k - 1) * pitch, cy + 21);
        p.caja(W - M - 62, y + rh - 46, 34, 30, null, 22, e.solucion.huecos[0]);
        p.text(W - M - 25, y + rh - 33, "º", 12, { f: "PM" });
      }
      p.text(M + 16, y + 7, "EMPIEZA", 7.5, { f: "PM", gris: 0.3 });
      flecha(p, M + 56, y + 10, M + 84, y + 10, 3.5, 1.0);
    }));
  },
});
