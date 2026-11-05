// palabra.sopa · Sopa de letras (Lengua 1.º, lote 2; LENGUA_1.md §3, bloque 4).
// datos:    { n: 10 (lado de la cuadrícula), filas: [10 textos de 10 letras, en el caso elegido], palabras: [las palabras escondidas, en el mismo caso y sin tildes] }
// solucion: { huecos: [], sopa: [{ p: palabra, f: fila (0 = arriba), c: columna (0 = izquierda), dir: "h" | "v" | "d" }] }
//           h = de izquierda a derecha · v = de arriba abajo · d = en diagonal, hacia abajo y a la derecha (solo con la opción «diagonal»)
// Reglas: palabras del léxico, del campo elegido (nombres de 3 a 8 letras sin tilde; en «colores», adjetivos), sin que una esté dentro de otra; todas caben y están
//         donde dice `sopa`; cada una aparece una sola vez en la cuadrícula (en h, v o d) y las direcciones se reparten; el resto son letras al azar.
// Opciones: campo (al azar o uno) · palabras (8, 7 o 6) · direcciones (h y v / también diagonal) · letra (MAYÚSCULAS / minúscula). Solo completa.
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, COLOR_SOLUCION } from "../render/papel.js";
import { CAMPOS_P, deCampo } from "./_palabra.js";

export const N = 10;
export const DIRS = { h: [0, 1], v: [1, 0], d: [1, 1] };
const RELLENO = "aaaaaaeeeeeeiiioooouuubcdddfgllmmnnpprrrsssstttvjzh";

/** Cuántas veces aparece la palabra en la cuadrícula (filas de texto en minúscula), mirando h, v y d. */
export function apariciones(filas, w) {
  let c = 0;
  for (const [df, dc] of Object.values(DIRS)) for (let f = 0; f < N; f++) for (let k = 0; k < N; k++) {
    if (f + df * (w.length - 1) >= N || k + dc * (w.length - 1) >= N) continue;
    if ([...w].every((l, i) => filas[f + df * i][k + dc * i] === l)) c++;
  }
  return c;
}

function colocar(azar, palabras, dirs) {
  const celdas = Array.from({ length: N }, () => Array(N).fill(null)), puestas = [];
  const orden = palabras.map((w, i) => ({ w, dir: dirs[i % dirs.length] })).sort((a, b) => b.w.length - a.w.length);
  for (const { w, dir } of orden) {
    const [df, dc] = DIRS[dir], sitios = [];
    for (let f = 0; f < N; f++) for (let c = 0; c < N; c++) {
      if (f + df * (w.length - 1) >= N || c + dc * (w.length - 1) >= N) continue;
      if ([...w].every((l, i) => celdas[f + df * i][c + dc * i] === null || celdas[f + df * i][c + dc * i] === l)) sitios.push([f, c]);
    }
    if (!sitios.length) return null;
    // mejor un sitio que cruce lo menos posible (palabras bien repartidas): se elige entre los de menos cruces
    const cruces = ([f, c]) => [...w].filter((l, i) => celdas[f + df * i][c + dc * i] === l).length;
    const min = Math.min(...sitios.map(cruces)), buenos = sitios.filter((s) => cruces(s) === min), [f, c] = azar.elegir(buenos);
    [...w].forEach((l, i) => { celdas[f + df * i][c + dc * i] = l; });
    puestas.push({ w, f, c, dir });
  }
  return { celdas, puestas };
}

export default registrar({
  id: "palabra.sopa",
  version: 1,
  generar(params, azar) {
    const n = params.palabras ?? 8, dirs = params.direcciones === "diagonal" ? ["h", "v", "d"] : ["h", "v"], mayus = !params.minus;
    const posibles = CAMPOS_P.filter((c) => deCampo(c, { maxLetras: 8, sinTilde: true }).length >= n);
    const campo = params.campo || azar.elegir(posibles);
    if (!posibles.includes(campo)) throw new Error(`«palabra.sopa» necesita más palabras del campo «${campo}».`);
    for (let intento = 0; intento < 200; intento++) {
      const elegidas = [];
      for (const e of azar.barajar(deCampo(campo, { maxLetras: 8, sinTilde: true }))) {
        if (elegidas.some((o) => o.includes(e.p) || e.p.includes(o))) continue;
        elegidas.push(e.p);
        if (elegidas.length === n) break;
      }
      if (elegidas.length < n) continue;
      const puesto = colocar(azar, azar.barajar(elegidas), dirs);
      if (!puesto) continue;
      for (let r = 0; r < 20; r++) {
        const filas = puesto.celdas.map((fila) => fila.map((l) => l ?? RELLENO[azar.entero(0, RELLENO.length - 1)]).join(""));
        if (elegidas.some((w) => apariciones(filas, w) !== 1)) continue;
        const f = (t) => (mayus ? t.toUpperCase() : t);
        return {
          enunciado: `Busca las ${n} palabras en la sopa de letras y rodéalas.\nEstán ${params.direcciones === "diagonal" ? "en horizontal, en vertical y en diagonal" : "en horizontal (→) y en vertical (↓)"}.`,
          ejercicios: [{
            datos: { n: N, filas: filas.map(f), palabras: azar.barajar(elegidas).map(f) },
            solucion: { huecos: [], sopa: puesto.puestas.map(({ w, f: fi, c, dir }) => ({ p: f(w), f: fi, c, dir })) },
          }],
        };
      }
    }
    throw new Error(`«palabra.sopa» necesita más palabras: no se pudo componer la sopa con ${n} palabras de «${campo}».`);
  },
  dibujar(p, act) {
    const e = act.ejercicios[0], { filas, palabras } = e.datos, cw = W - 2 * M, ch = TOP - M;
    p.ejercicio(e.id, () => {
      const x = M, y = M, cel = 48, gx = x + (cw - N * cel) / 2, gy = y + ch - 16 - N * cel;
      p.tarjeta(x, y, cw, ch);
      p.rrect(gx, gy, N * cel, N * cel, 6, { lw: 1.6, fill: 1, stroke: 0.2 });
      for (let k = 1; k < N; k++) {
        p.line(gx + k * cel, gy, gx + k * cel, gy + N * cel, { lw: 0.6, gris: 0.8 });
        p.line(gx, gy + k * cel, gx + N * cel, gy + k * cel, { lw: 0.6, gris: 0.8 });
      }
      filas.forEach((fila, f) => [...fila].forEach((l, c) => p.text(gx + (c + 0.5) * cel, gy + (N - f - 0.5) * cel - 26 * 0.35, l, 26, { f: "PB", anchor: "middle" })));
      // lista de palabras, en columnas bajo la cuadrícula
      const cols = 4, fs = 20, ww = cw / cols, filasL = Math.ceil(palabras.length / cols);
      palabras.forEach((w, i) => {
        const r = Math.floor(i / cols), k = i % cols;
        p.text(x + k * ww + 30, gy - 36 - r * 34, w, fs, { f: "PB" });
        p.rrect(x + k * ww + 8, gy - 36 - r * 34 - 1, 15, 15, 3, { lw: 1.2, fill: 1, stroke: 0.35 });
      });
      if (p.solucion) for (const s of e.solucion.sopa) {
        const [df, dc] = DIRS[s.dir], L = s.p.length, r = cel * 0.42;
        const x0 = gx + (s.c + 0.5) * cel, y0 = gy + (N - s.f - 0.5) * cel, x1 = x0 + dc * (L - 1) * cel, y1 = y0 - df * (L - 1) * cel;
        if (s.dir === "h") p.rrect(x0 - r, y0 - r, x1 - x0 + 2 * r, 2 * r, r, { lw: 2.4, stroke: COLOR_SOLUCION });
        else if (s.dir === "v") p.rrect(x0 - r, y1 - r, 2 * r, y0 - y1 + 2 * r, r, { lw: 2.4, stroke: COLOR_SOLUCION });
        else {
          const ux = (x1 - x0) / Math.hypot(x1 - x0, y1 - y0), uy = (y1 - y0) / Math.hypot(x1 - x0, y1 - y0), nx = -uy, ny = ux, a = [x0 - ux * r, y0 - uy * r], b = [x1 + ux * r, y1 + uy * r];
          // cápsula en diagonal: dos lados rectos y dos semicírculos (curvas de Bézier)
          const k = 0.5523 * r;
          p.path([["M", a[0] + nx * r, a[1] + ny * r], ["L", b[0] + nx * r, b[1] + ny * r],
            ["C", b[0] + nx * r + ux * k, b[1] + ny * r + uy * k, b[0] + ux * r + nx * k - ux * 0 , b[1] + uy * r + ny * k, b[0] + ux * r, b[1] + uy * r],
            ["C", b[0] + ux * r - nx * k, b[1] + uy * r - ny * k, b[0] - nx * r + ux * k, b[1] - ny * r + uy * k, b[0] - nx * r, b[1] - ny * r],
            ["L", a[0] - nx * r, a[1] - ny * r],
            ["C", a[0] - nx * r - ux * k, a[1] - ny * r - uy * k, a[0] - ux * r - nx * k, a[1] - uy * r - ny * k, a[0] - ux * r, a[1] - uy * r],
            ["C", a[0] - ux * r + nx * k, a[1] - uy * r + ny * k, a[0] + nx * r - ux * k, a[1] + ny * r - uy * k, a[0] + nx * r, a[1] + ny * r], ["Z"]],
            { lw: 2.4, stroke: COLOR_SOLUCION });
        }
      }
    });
  },
});
