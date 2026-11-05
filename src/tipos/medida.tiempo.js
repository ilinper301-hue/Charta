// medida.tiempo · Los días de la semana y los meses del año (port de _m_tiempo() y _chips2() del motor).
// datos:    días → { orden: [d, …] (0 = lunes, permutación no ordenada) }
//           meses → { tipo: "orden", orden: [m, …] (0 = enero) } y { tipo: "siguiente", mes, ops: [m, m, m] (opciones, una es el siguiente) }
// solucion: días → { huecos: [d + 1, …] (7) } · meses/orden → { huecos: [m + 1, …] (12) } · meses/siguiente → { huecos: [] } (se rodea una opción)
// Opción modo: null (días de la semana) | "meses". Días: 6 filas (media 3). Meses: ordenar los 12 + 6 preguntas «después de…» (media: solo ordenar).
import { registrar } from "../nucleo/tipos.js";
import { TOP, W, M } from "../render/papel.js";
import { MESES } from "./medida.calendario.js";

const DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

/** _chips(): opciones en píldoras centradas en cx (y = base). Devuelve [x, ancho] de cada una. */
export function chips(p, cx, y, opts, fs = 10.5, h = 22, gap = 6) {
  const ws = opts.map((o) => p.ancho(o, "PM", fs) + 16), pos = [];
  let x = cx - (ws.reduce((a, b) => a + b, 0) + gap * (opts.length - 1)) / 2;
  opts.forEach((o, k) => {
    p.rrect(x, y, ws[k], h, 8, { lw: 1.2 });
    p.text(x + ws[k] / 2, y + h / 2 - fs * 0.33, o, fs, { f: "PM", anchor: "middle" });
    pos.push([x, ws[k]]); x += ws[k] + gap;
  });
  return pos;
}
/** _chips2(): reduce la letra hasta que quepan en maxw. */
export function chips2(p, cx, y, opts, maxw, fs = 10.5) {
  while (opts.reduce((s, o) => s + p.ancho(o, "PM", fs) + 14, 0) + 6 * (opts.length - 1) > maxw && fs > 7) fs -= 0.5;
  return chips(p, cx, y, opts, fs);
}

export default registrar({
  id: "medida.tiempo",
  version: 1,
  generar(params, azar, { tamano }) {
    if (params.modo === "meses") {
      const orden = azar.barajar([...Array(12).keys()]);
      const ejercicios = [{ datos: { tipo: "orden", orden }, solucion: { huecos: orden.map((m) => m + 1) } }];
      if (tamano !== "media") {
        for (const mes of azar.muestra([...Array(12).keys()], 6)) {
          const sig = (mes + 1) % 12;
          const ops = azar.barajar([sig, ...azar.muestra([...Array(12).keys()].filter((k) => k !== sig), 2)]);
          ejercicios.push({ datos: { tipo: "siguiente", mes, sig, ops }, solucion: { huecos: [] } });
        }
      }
      return { enunciado: "Escribe el orden de los meses y rodea el mes que viene después.", ejercicios };
    }
    const ejercicios = [];
    for (let i = 0; i < (tamano === "media" ? 3 : 6); i++) {
      let ds;
      do ds = azar.barajar([0, 1, 2, 3, 4, 5, 6]); while (ds.every((d, k) => d === k));
      ejercicios.push({ datos: { orden: ds }, solucion: { huecos: ds.map((d) => d + 1) } });
    }
    return { enunciado: "Escribe el número de orden de cada día, empezando por el lunes.", ejercicios };
  },
  dibujar(p, act) {
    const top = TOP, es = act.ejercicios;
    if (es[0].datos.tipo) {                       // meses
      const fh = 300, colw = (W - 2 * M - 20) / 4;
      p.ejercicio(es[0].id, () => {
        p.marco(M, top - fh, W - 2 * M, fh);
        es[0].datos.orden.forEach((mm, j) => {
          const r = Math.floor(j / 4), q = j % 4, x = M + 10 + q * colw, y = top - 20 - (r + 1) * 88 + 22;
          p.text(x + colw / 2, y + 52, MESES[mm], 12.5, { f: "PM", anchor: "middle" });
          p.caja(x + colw / 2 - 20, y + 12, 40, 34, null, 22, es[0].solucion.huecos[j]);
        });
      });
      if (es.length > 1) {
        const { cel, cw, ch } = p.celdas(top - fh - 10, 2, 3);
        es.slice(1).forEach((e, i) => p.ejercicio(e.id, () => {
          const [x, y] = cel[i], { mes, sig, ops } = e.datos;
          p.marco(x, y, cw, ch, i);
          p.text(x + cw / 2, y + ch - 44, `Después de ${MESES[mes]} viene`, 12, { f: "PR", anchor: "middle" });
          const pos = chips2(p, x + cw / 2, y + 24, ops.map((o) => MESES[o]), cw - 12);
          if (p.solucion) { const [cx, w] = pos[ops.indexOf(sig)]; p.rrect(cx - 2, y + 22, w + 4, 26, 10, { lw: 1.6, stroke: "#C62828" }); }
        }));
      }
      return;
    }
    const rows = 6, GY = 10, rh = (top - M - (rows - 1) * GY) / rows, colw = (W - 2 * M - 20) / 7;
    es.forEach((e, i) => p.ejercicio(e.id, () => {
      const y = top - (i + 1) * rh - i * GY;
      p.marco(M, y, W - 2 * M, rh);
      e.datos.orden.forEach((d, j) => {
        const x = M + 10 + j * colw;
        p.text(x + colw / 2, y + rh - 32, DIAS[d], 12.5, { f: "PM", anchor: "middle" });
        p.caja(x + colw / 2 - 20, y + 16, 40, 36, null, 22, e.solucion.huecos[j]);
      });
    }));
  },
});
