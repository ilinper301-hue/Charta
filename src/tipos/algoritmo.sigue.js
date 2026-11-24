// algoritmo.sigue · Sigue las instrucciones (3.º, lote 8, bloque 16 «Pensamiento computacional»; solo curso 3, sin rango).
// Programas de flechas (cada flecha = una casilla) con bucles sencillos («repite 3 veces: → ↑») sobre la cuadrícula 6 × 6 de geometria.itinerario (N, DIR, recorrer, flecha).
// datos:    { inicio: [c, r], programa: [bloque…], fin: [c, r], ruta?: [[c, r]…] (solo tarea «programa»: el camino dibujado) }
//           bloque = { cuerpo: ["R", "U"…] } (flechas sueltas, una vez) · { rep: n, cuerpo: [dirs] } (repite n veces el cuerpo, n = 2…4, 1…3 flechas)
//           dir: "R" → · "L" ← · "U" ↑ · "D" ↓ (r crece hacia arriba). Desarrollo = cada bloque con su cuerpo repetido `rep` veces; recorrer(inicio, desarrollo) = ruta.
// Opción tarea: null «Dibuja el camino» (solucion: huecos [], ruta en rojo) · "llega" «¿Dónde llegas?» (cuadrícula con letras A–F y números 1–6; huecos [letra, número])
//   · "programa" «Escribe el programa» (camino gris de la S a la L y casillas: huecos = [dir…] y, en cada bucle, [n, dir…]; el programa en rojo en la solución).
// Opción bucles (si_no, por defecto sí): con bucles = 0–2 flechas sueltas + «repite» + 0–2 flechas sueltas (6–12 pasos); sin bucles = 6–8 flechas sueltas.
// El camino nunca se sale de la cuadrícula ni pasa dos veces por una casilla. Rejilla elástica de 1 columna con «Cantidad»: «Más grandes» = 3 y 1; «Más ejercicios» = las filas que caben con tarjetas ≥ 200 pt.
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, INK, COLOR_SOLUCION, cuantosRejilla } from "../render/papel.js";
import { N, DIR, recorrer, flecha } from "./geometria.itinerario.js";

const MIN_ALTO = 200;
const OPUESTA = { R: "L", L: "R", U: "D", D: "U" };
const COLS = "ABCDEF";
/** Las flechas que hace el programa, una por casilla. */
export const desarrollo = (programa) => programa.flatMap((b) => Array.from({ length: b.rep ?? 1 }, () => b.cuerpo).flat());
/** Los huecos de la tarea «programa»: las flechas en orden y, en cada bucle, antes el número de veces. */
export const huecosPrograma = (programa) => programa.flatMap((b) => (b.rep ? [b.rep, ...b.cuerpo] : b.cuerpo));

function flechas(azar, n, prev = null) {
  const out = [];
  while (out.length < n) {
    const d = azar.elegir(["R", "L", "U", "D"]);
    if (d === OPUESTA[out.length ? out[out.length - 1] : prev]) continue;   // sin dar la vuelta en el sitio
    out.push(d);
  }
  return out;
}

function programaNuevo(azar, bucles) {
  for (let t = 0; t < 5000; t++) {
    let prog;
    if (!bucles) prog = [{ cuerpo: flechas(azar, azar.entero(6, 8)) }];
    else {
      const pre = flechas(azar, azar.entero(0, 2)), cuerpo = flechas(azar, azar.elegir([1, 2, 2, 2, 3, 3]), pre.at(-1) ?? null), rep = azar.entero(2, 4);
      const post = flechas(azar, azar.entero(0, 2), cuerpo.at(-1));
      if (cuerpo.length > 1 && cuerpo[0] === OPUESTA[cuerpo.at(-1)]) continue;   // al repetir el cuerpo no se da la vuelta en el sitio
      prog = [...(pre.length ? [{ cuerpo: pre }] : []), { rep, cuerpo }, ...(post.length ? [{ cuerpo: post }] : [])];
    }
    const des = desarrollo(prog);
    if (des.length < 6 || des.length > 12 || new Set(des).size < 2) continue;
    const inicio = [azar.entero(0, N - 1), azar.entero(0, N - 1)], ruta = recorrer(inicio, des.map((d) => [d, 1]));
    if (ruta) return { inicio, programa: prog, fin: ruta.at(-1), ruta };
  }
  throw new Error("No se encontró un programa.");
}

export default registrar({
  id: "algoritmo.sigue",
  version: 1,
  cantidad: true,
  generar(params, azar, ctx) {
    const tarea = params.tarea ?? null, bucles = params.bucles ?? true, cnt = cuantosRejilla(ctx, 1, MIN_ALTO, [3, 1]), vistos = new Set(), ejercicios = [];
    while (ejercicios.length < cnt) {
      const { inicio, programa, fin, ruta } = programaNuevo(azar, bucles), clave = JSON.stringify([inicio, programa]);
      if (vistos.has(clave)) continue;
      vistos.add(clave);
      if (tarea === "programa") ejercicios.push({ datos: { inicio, programa, fin, ruta }, solucion: { huecos: huecosPrograma(programa) } });
      else if (tarea === "llega") ejercicios.push({ datos: { inicio, programa, fin }, solucion: { huecos: [COLS[fin[0]], fin[1] + 1] } });
      else ejercicios.push({ datos: { inicio, programa, fin }, solucion: { huecos: [], ruta } });
    }
    const enunciado = {
      llega: "Sal de la S y sigue el programa: cada flecha es una casilla.\nEscribe la letra y el número de la casilla donde llegas.",
      programa: bucles ? "Mira el camino que va de la S a la L y escribe el programa con flechas.\nSi algo se repite, usa «repite»." : "Mira el camino que va de la S a la L.\nEscribe una flecha por cada casilla que avanzas.",
    }[tarea] ?? "Sal de la S y sigue el programa: cada flecha es una casilla.\nDibuja el camino que haces. «Repite» quiere decir que haces lo de dentro varias veces.";
    return { enunciado, ejercicios };
  },
  dibujar(p, act) {
    const tarea = act.params?.tarea ?? null, { cel: celdas, cw, ch } = p.rejilla(TOP, 1, act.ejercicios.length);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = celdas[i], d = e.datos, cel = Math.min(40, (ch - 44) / N), g = cel * N, gx = x + 46, gy = y + (ch - g) / 2 + (tarea === "llega" ? 4 : -2);
      const ctr = ([c, r]) => [gx + (c + 0.5) * cel, gy + (r + 0.5) * cel], trazo = (ruta, o) => p.path(ruta.map(ctr).map((q, k) => [k ? "L" : "M", ...q]), o);
      p.marco(x, y, cw, ch, i);
      for (let c = 0; c < N; c++) for (let r = 0; r < N; r++) p.rrect(gx + c * cel, gy + r * cel, cel, cel, 0, { lw: 0.8, stroke: 0.55 });
      if (tarea === "llega") {
        for (let c = 0; c < N; c++) p.text(gx + (c + 0.5) * cel, gy - 15, COLS[c], 12, { f: "PB", anchor: "middle", gris: 0.3 });
        for (let r = 0; r < N; r++) p.text(gx - 12, gy + (r + 0.5) * cel - 4.2, String(r + 1), 12, { f: "PB", anchor: "middle", gris: 0.3 });
      }
      if (tarea === "programa") trazo(d.ruta, { lw: 3, stroke: 0.35 });
      if (p.solucion && tarea === null) trazo(e.solucion.ruta, { lw: 3, stroke: COLOR_SOLUCION });
      const [sx, sy] = ctr(d.inicio), [lx, ly] = ctr(d.fin);
      if (p.solucion && tarea === "llega") p.circle(lx, ly, cel * 0.42, { lw: 2.4, stroke: COLOR_SOLUCION });
      p.circle(sx, sy, cel * 0.36, { lw: 1, fill: INK });
      p.text(sx, sy - 4.2, "S", 12, { f: "PB", anchor: "middle", gris: 1 });
      if (tarea === "programa") { p.circle(lx, ly, cel * 0.36, { lw: 2, fill: 1 }); p.text(lx, ly - 4.2, "L", 12, { f: "PB", anchor: "middle" }); }
      // ---- el programa (a la derecha) ----
      const rx = gx + g + 30, rw = x + cw - 14 - rx, caja = tarea === "programa", PASO = caja ? 38 : 30, K = caja ? 4 : 7;
      const lineas = [];   // {k: "f" flechas sueltas | "r" repite | "c" cuerpo del bucle, dirs, n}
      for (const b of d.programa) {
        if (b.rep) { lineas.push({ k: "r", n: b.rep }); lineas.push({ k: "c", dirs: b.cuerpo }); }
        else for (let k = 0; k < b.cuerpo.length; k += K) lineas.push({ k: "f", dirs: b.cuerpo.slice(k, k + K) });
      }
      const llega = tarea === "llega", libre = ch - 28 - (llega ? 62 : 0), pitch = Math.min(caja ? 46 : 34, libre / lineas.length), bloque = pitch * lineas.length;
      const top = llega ? y + ch - 24 : y + ch / 2 + bloque / 2;
      let hu = 0;   // índice de huecos (tarea «programa»)
      lineas.forEach((l, k) => {
        const cy = top - (k + 0.5) * pitch, x0 = rx + 6 + (l.k === "c" ? 24 : 0);
        if (l.k === "r") {
          if (caja) {
            const fs = 13, t1 = "repite", w1 = p.ancho(t1, "PM", fs);
            p.text(x0, cy - fs * 0.35, t1, fs, { f: "PM" }); p.caja(x0 + w1 + 6, cy - 17, 34, 34, null, 20, e.solucion.huecos[hu++]);
            p.text(x0 + w1 + 46, cy - fs * 0.35, "veces:", fs, { f: "PM" });
          } else p.text(x0, cy - 4.5, `repite ${l.n} veces:`, 14, { f: "PB" });
          return;
        }
        if (l.k === "c") p.line(rx + 14, cy - pitch / 2 + 3, rx + 14, cy + pitch / 2 - 3, { lw: 1.6, gris: 0.35 });
        l.dirs.forEach((dir, j) => {
          if (caja) {
            const bx = x0 + j * PASO; p.caja(bx, cy - 17, 34, 34, null, 20, null); hu++;
            if (p.solucion) flecha(p, bx + 17, cy, dir, 11, COLOR_SOLUCION);
          } else flecha(p, x0 + 12 + j * PASO, cy, dir, 11);
        });
      });
      if (llega) {
        const t = "Llegas a la casilla", fs = 13.5, w = p.ancho(t, "PM", fs), x0 = rx + 6, cy = y + 36;
        p.text(x0, cy - fs * 0.35, t, fs, { f: "PM" });
        p.caja(x0 + w + 22, cy - 18, 36, 36, null, 22, e.solucion.huecos[0]); p.caja(x0 + w + 64, cy - 18, 36, 36, null, 22, e.solucion.huecos[1]);
      }
    }));
  },
});
