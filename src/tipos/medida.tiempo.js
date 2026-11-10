// medida.tiempo · Los días de la semana y los meses del año (port de _m_tiempo() y _chips2() del motor).
// datos:    días → { orden: [d, …] (0 = lunes, permutación no ordenada) }
//           meses → { tipo: "orden", orden: [m, …] (0 = enero) } y { tipo: "siguiente", mes, ops: [m, m, m] (opciones, una es el siguiente) }
// solucion: días → { huecos: [d + 1, …] (7) } · meses/orden → { huecos: [m + 1, …] (12) } · meses/siguiente → { huecos: [] } (se rodea una opción)
//           2.º · equivalencias → { tipo: "equiv", a: [n, unidad], b: unidad } («1 hora = ▢ minutos») · huecos: [n']
//           2.º · horas → { tipo: "hora", h, m (0 | 30), k (1–3), dentro (bool) } (sin pasar de las 12) · huecos: [h', "00" | "30"]
// Opción modo: null (días de la semana) | "meses" · 2.º: "equivalencias" (12; media 6) | "horas" (antes y después: 8; media 4). Días: 6 filas (media 3). Meses: ordenar los 12 + 6 preguntas «después de…» (media: solo ordenar).
import { registrar } from "../nucleo/tipos.js";
import { TOP, W, M, T, B } from "../render/papel.js";
import { dibujarReloj } from "./medida.reloj.js";
import { MESES } from "./medida.calendario.js";

/** Equivalencias de 2.º: [unidad mayor (sing., pl.), unidad menor (sing., pl.), cuántas, multiplicadores]. */
const EQUIV = [[["hora", "horas"], ["minuto", "minutos"], 60, [1, 2, 3]], [["día", "días"], ["hora", "horas"], 24, [1, 2]],
  [["semana", "semanas"], ["día", "días"], 7, [1, 2, 3, 4]], [["año", "años"], ["mes", "meses"], 12, [1, 2]]];
const unidad = ([s, pl], n) => (n === 1 ? s : pl);
/** Todas las equivalencias: «k mayor = ▢ menor» y al revés; más «media hora = 30 minutos». */
function equivalencias() {
  const out = [];
  for (const [g, p, c, ks] of EQUIV) for (const k of ks) {
    out.push({ a: [k, unidad(g, k)], b: unidad(p, k * c), sol: k * c, base: k === 1 });
    out.push({ a: [k * c, unidad(p, k * c)], b: unidad(g, k), sol: k });
  }
  out.push({ a: ["media", "hora"], b: "minutos", sol: 30 });
  return out;
}

function generar2(modo, azar, cnt) {
  if (modo === "equivalencias") {
    const todas = equivalencias(), base = todas.filter((e) => e.base), resto = todas.filter((e) => !e.base);
    const nb = cnt >= 12 ? 4 : 2, sel = azar.barajar([...azar.muestra(base, nb), ...azar.muestra(resto, cnt - nb)]);
    return { enunciado: "Escribe el número que falta.",
      ejercicios: sel.map(({ a, b, sol }) => ({ datos: { tipo: "equiv", a, b }, solucion: { huecos: [sol] } })) };
  }
  const todas = [];
  for (let h = 1; h <= 12; h++) for (const m of [0, 30]) for (let k = 1; k <= 3; k++) for (const dentro of [true, false]) {
    const h2 = dentro ? h + k : h - k;
    if (h2 >= 1 && h2 <= 12) todas.push({ h, m, k, dentro, h2 });
  }
  let sel;   // horas de partida distintas (si se puede) y mitad «dentro de», mitad «hace»
  do sel = [...azar.muestra(todas.filter((x) => x.dentro), cnt / 2), ...azar.muestra(todas.filter((x) => !x.dentro), cnt / 2)];
  while (new Set(sel.map((x) => x.h * 100 + x.m)).size < cnt);
  return { enunciado: "Mira el reloj y escribe qué hora será o qué hora era.",
    ejercicios: azar.barajar(sel).map(({ h, m, k, dentro, h2 }) => ({ datos: { tipo: "hora", h, m, k, dentro }, solucion: { huecos: [h2, m ? "30" : "00"] } })) };
}

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
    if (params.modo === "equivalencias") return generar2(params.modo, azar, tamano === "media" ? 6 : 12);
    if (params.modo === "horas") return generar2(params.modo, azar, tamano === "media" ? 4 : 8);
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
    const top = TOP, es = act.ejercicios, t0 = es[0].datos.tipo;
    if (t0 === "equiv") {
      const { cel, cw, ch } = p.celdas(top, 2, 6);
      es.forEach((e, i) => p.ejercicio(e.id, () => {
        const [x, y] = cel[i], { a, b } = e.datos;
        p.marco(x, y, cw, ch);
        p.linea(x, y, cw, ch, [T(`${a[0]} ${a[1]} =`, 16, "PM"), B(58, 36, e.solucion.huecos[0]), T(b, 16, "PM")], 8);
      }));
      return;
    }
    if (t0 === "hora") {
      const { cel, cw, ch } = p.celdas(top, 2, 4);
      es.forEach((e, i) => p.ejercicio(e.id, () => {
        const [x, y] = cel[i], { h, m, k, dentro } = e.datos, [sh, sm] = e.solucion.huecos, r = Math.min(46, ch * 0.3);
        p.marco(x, y, cw, ch, i);
        dibujarReloj(p, x + 18 + r, y + ch / 2 - 6, r, h, m);
        const xt = x + 30 + 2 * r, wt = cw - (xt - x) - 8;
        p.text(xt + wt / 2, y + ch * 0.58, `${dentro ? "Dentro de" : "Hace"} ${k} ${k === 1 ? "hora" : "horas"}`, 14, { f: "PM", anchor: "middle" });
        p.linea(xt, y + ch * 0.2, wt, 44, [B(40, 34, sh), T(":", 22), B(40, 34, sm)], 6);
      }));
      return;
    }
    if (t0) {                       // meses
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
