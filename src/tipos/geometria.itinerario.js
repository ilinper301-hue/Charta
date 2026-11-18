// geometria.itinerario · Sigue el camino (2.º, lote 4): cuadrícula 6 × 6 con salida (S) y flechas con números de casillas.
// datos:    { inicio: [c, r], pasos: [[dir, n]…] (dir: "R" → · "L" ← · "U" ↑ · "D" ↓; los ejes se alternan; n = 1…4), fin: [c, r],
//             figs?: [{ c, r, k }] (solo «llega»: k = "c"|"s"|"q"|"t"; la casilla de llegada siempre lleva una) }  (r crece hacia arriba)
// Opción modo: null «Dibuja el camino» (solucion: huecos [], camino en rojo) · "llega" «¿Dónde llegas?» (4 pasos; se rodea el nombre de la figura de la
//   llegada: solucion { huecos: [], correcta }) · "flechas" «Escribe las flechas» (3 pasos; huecos [flecha, n, flecha, n, …], la flecha en rojo es un dibujo)
// El camino no pasa dos veces por una casilla. Solo completa: 3 ejercicios.
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, INK, COLOR_SOLUCION } from "../render/papel.js";
import { figura } from "./estadistica.pictograma.js";
import { chips } from "./geometria.dibujo.js";

export const N = 6;
export const DIR = { R: [1, 0], L: [-1, 0], U: [0, 1], D: [0, -1] };
export const FIGURAS = { c: "círculo", s: "estrella", q: "cuadrado", t: "triángulo" };
/** Recorre los pasos desde `inicio`: las casillas por las que pasa (la última es la llegada) o null si se sale o repite casilla. */
export function recorrer(inicio, pasos) {
  const vistas = new Set([inicio + ""]), ruta = [inicio.slice()];
  let [c, r] = inicio;
  for (const [d, n] of pasos) for (let k = 0; k < n; k++) {
    c += DIR[d][0]; r += DIR[d][1];
    if (c < 0 || r < 0 || c >= N || r >= N || vistas.has(c + "," + r)) return null;
    vistas.add(c + "," + r); ruta.push([c, r]);
  }
  return ruta;
}

/** Flecha rellena (un solo trazo) centrada en (cx, cy), tamaño s, apuntando a dir. */
export function flecha(p, cx, cy, dir, s, fill = INK) {
  const base = [[-1, -.22], [.25, -.22], [.25, -.7], [1, 0], [.25, .7], [.25, .22], [-1, .22]];
  const rot = { R: ([a, b]) => [a, b], L: ([a, b]) => [-a, b], U: ([a, b]) => [b, a], D: ([a, b]) => [b, -a] }[dir];
  const q = base.map(rot).map(([a, b]) => [cx + a * s, cy + b * s]);
  p.path([["M", ...q[0]], ...q.slice(1).map((v) => ["L", ...v]), ["Z"]], { lw: 0.5, fill, stroke: fill });
}

function camino(azar, n) {
  for (let t = 0; t < 2000; t++) {
    const inicio = [azar.entero(0, N - 1), azar.entero(0, N - 1)], pasos = [];
    let eje = azar.entero(0, 1), [c, r] = inicio, ok = true;
    for (let k = 0; k < n && ok; k++, eje = 1 - eje) {
      const opc = (eje === 0 ? ["R", "L"] : ["U", "D"]).flatMap((d) => [1, 2, 3, 4].map((m) => [d, m]))
        .filter(([d, m]) => { const a = c + DIR[d][0] * m, b = r + DIR[d][1] * m; return a >= 0 && b >= 0 && a < N && b < N; });
      if (!opc.length) { ok = false; break; }
      const paso = azar.elegir(opc); pasos.push(paso); c += DIR[paso[0]][0] * paso[1]; r += DIR[paso[0]][1] * paso[1];
    }
    const ruta = ok && recorrer(inicio, pasos);
    if (ruta) return { inicio, pasos, fin: ruta[ruta.length - 1] };
  }
  throw new Error("No se encontró un camino.");
}

export default registrar({
  id: "geometria.itinerario",
  version: 1,
  generar(params, azar) {
    const modo = params.modo ?? null, n = modo === "flechas" ? 3 : 4, vistos = new Set(), ejercicios = [];
    while (ejercicios.length < 3) {
      const d = camino(azar, n), clave = JSON.stringify([d.inicio, d.pasos]);
      if (vistos.has(clave)) continue;
      vistos.add(clave);
      if (modo === "flechas") ejercicios.push({ datos: d, solucion: { huecos: d.pasos.flatMap(([dir, m]) => [dir, m]) } });
      else if (modo === "llega") {
        const libres = []; for (let c = 0; c < N; c++) for (let r = 0; r < N; r++) if (!(c === d.inicio[0] && r === d.inicio[1]) && !(c === d.fin[0] && r === d.fin[1])) libres.push([c, r]);
        const k = azar.elegir([..."csqt"]), figs = [{ c: d.fin[0], r: d.fin[1], k }, ...azar.muestra(libres, 7).map(([c, r]) => ({ c, r, k: azar.elegir([..."csqt"]) }))];
        ejercicios.push({ datos: { ...d, figs }, solucion: { huecos: [], correcta: FIGURAS[k] } });
      } else ejercicios.push({ datos: d, solucion: { huecos: [] } });
    }
    const enunciado = { flechas: "Escribe una flecha y un número por cada tramo del camino que va de la S a la L.", llega: "Sal de la S, sigue las flechas y rodea la figura donde llegas.\nCada número dice cuántas casillas avanzas." }[modo]
      ?? "Sal de la S y dibuja el camino que dicen las flechas.\nCada número dice cuántas casillas avanzas.";
    return { enunciado, ejercicios };
  },
  dibujar(p, act) {
    const modo = act.params?.modo ?? null, top = TOP, GY = 10, rh = (top - M - 2 * GY) / 3, cel = Math.min(30, (rh - 34) / N), g = cel * N;
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const y = top - (i + 1) * rh - i * GY, d = e.datos, gx = M + 44, gy = y + (rh - g) / 2 - 6, ctr = ([c, r]) => [gx + (c + 0.5) * cel, gy + (r + 0.5) * cel];
      p.marco(M, y, W - 2 * M, rh, i);
      for (let c = 0; c < N; c++) for (let r = 0; r < N; r++) p.rrect(gx + c * cel, gy + r * cel, cel, cel, 0, { lw: 0.8, stroke: 0.55 });
      if (modo === "llega") for (const f of d.figs) figura(p, f.k, ...ctr([f.c, f.r]), cel * 0.3, { lw: 1.3 });
      const ruta = recorrer(d.inicio, d.pasos).map(ctr);
      if (modo === "flechas") p.path(ruta.map((q, k) => [k ? "L" : "M", ...q]), { lw: 3, stroke: 0.35 });
      if (p.solucion && modo !== "flechas") p.path(ruta.map((q, k) => [k ? "L" : "M", ...q]), { lw: 3, stroke: COLOR_SOLUCION });
      const [sx, sy] = ctr(d.inicio);
      p.circle(sx, sy, cel * 0.3, { lw: 1, fill: INK });
      p.text(sx, sy - 3.5, "S", 10, { f: "PB", anchor: "middle", gris: 1 });
      if (modo === "flechas") { const [lx, ly] = ctr(d.fin); p.circle(lx, ly, cel * 0.3, { lw: 2, fill: 1 }); p.text(lx, ly - 3.5, "L", 10, { f: "PB", anchor: "middle" }); }
      const rx = gx + g + 36, rw = W - M - 16 - rx, cy = y + rh / 2;
      if (modo === "flechas") {
        const bw = 34, pw = 2 * bw + 4, gap = (rw - d.pasos.length * pw) / (d.pasos.length - 1);
        d.pasos.forEach(([dir], k) => {
          const bx = rx + k * (pw + gap);
          p.caja(bx, cy - 17, bw, 34, null, 20, null); p.caja(bx + bw + 4, cy - 17, bw, 34, null, 20, e.solucion.huecos[2 * k + 1]);
          if (p.solucion) flecha(p, bx + bw / 2, cy, dir, 11, COLOR_SOLUCION);
        });
      } else {
        const iw = Math.min(64, rw / d.pasos.length), x0 = rx + (rw - iw * d.pasos.length) / 2, yy = modo === "llega" ? cy + 14 : cy - 14;
        d.pasos.forEach(([dir, m], k) => {
          flecha(p, x0 + k * iw + iw * 0.3, yy, dir, 11);
          p.text(x0 + k * iw + iw * 0.58, yy - 7, String(m), 20, { f: "PB" });
        });
        if (modo === "llega") {
          p.text(rx + rw / 2, cy - 18, "¿Dónde llegas?", 12.5, { f: "PM", anchor: "middle" });
          chips(p, rx + rw / 2, cy - 54, Object.values(FIGURAS), 10.5, e.solucion.correcta);
        }
      }
    }));
  },
});
