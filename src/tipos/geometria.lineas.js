// geometria.lineas · Las líneas (port de _g_lineas() y _trazo() del motor).
// datos:    { tipo: "recta"|"curva"|"quebrada"|"abierta"|"cerrada", tipos: [las opciones de la casilla], ang?, v?, ys? }
//           tipos: en cada casilla va en un orden distinto (se baraja), para que el alumnado tenga que leer; «abierta/cerrada» va en orden fijo.
//           recta: ang (grados) · curva: v (0|1) · quebrada: ys (5 alturas) · abierta/cerrada: v (0–3)
// solucion: { huecos: [], correcta: tipo }
// Opción modo: null (recta, curva o quebrada) | "cierre" (abierta o cerrada). Completa: 12 líneas (6 filas × 2); media: 6.
//   3.º (lote 7): "paralelas" · dos líneas rectas: datos { tipo: "paralelas"|"perpendiculares"|"oblicuas", tipos: [las 3, barajadas], a1, a2: ángulo de cada línea en grados (de 15 en 15),
//     u, v: dónde se cortan o cuánto se desplazan (décimas del semilargo; ver segmentos()) }; paralelas a2 = a1, perpendiculares a2 = a1 + 90, oblicuas a2 − a1 ∈ {45, 60, 120, 135} (ni casi paralelas ni casi
//     perpendiculares; las que se cortan se cortan dentro de las dos líneas). "rectas" · datos { tipo: "recta"|"semirrecta"|"segmento", tipos: [las 3, barajadas], ang, inv: 0|1 (en la semirrecta, qué extremo lleva el punto) }:
//     recta = flecha en los dos extremos, semirrecta = un punto y una flecha, segmento = un punto en cada extremo. solucion { huecos: [], correcta: tipo }.
import { registrar } from "../nucleo/tipos.js";
import { TOP, INK } from "../render/papel.js";
import { ciclo, arco, elipse, poli, chips } from "./geometria.dibujo.js";

/** Datos aleatorios del trazo (el motor los saca dentro de _trazo()). */
function nuevo(tipo, azar) {
  if (tipo === "recta") return { ang: azar.elegir([0, 30, 45, 60, 90, 120, 150]) };
  if (tipo === "curva") return { v: azar.entero(0, 1) };
  if (tipo === "quebrada") return { ys: [azar.elegir([-18, -8]), azar.elegir([12, 20]), azar.elegir([-18, -8]), azar.elegir([12, 20]), azar.elegir([-18, 0])] };
  return { v: azar.entero(0, 3) };
}

function trazo(p, d, cx, cy) {
  const lw = 2.0, t = d.tipo;
  if (t === "recta") {
    // La recta no debe salirse de la casilla ni tocar las opciones: se acorta si es muy inclinada y se sube un poco (la y del papel crece hacia arriba en los trazos).
    const a = d.ang * Math.PI / 180, L = Math.min(52, 30 / Math.max(Math.abs(Math.sin(a)), 1e-6)), dx = L * Math.cos(a), dy = L * Math.sin(a), y0 = cy + 6;
    p.line(cx - dx, y0 - dy, cx + dx, y0 + dy, { lw });
  } else if (t === "curva") {
    if (d.v === 0) p.path([["M", cx - 55, cy], ["C", cx - 20, cy + 45, cx + 20, cy - 45, cx + 55, cy]], { lw });
    else p.path([["M", cx - 50, cy - 20], ["C", cx - 30, cy + 32, cx + 30, cy + 32, cx + 50, cy - 20]], { lw });
  } else if (t === "quebrada") {
    poli(p, d.ys.map((y, j) => [cx - 56 + j * 28, cy + y]), { lw });
  } else if (t === "abierta") {
    if (d.v === 0) arco(p, cx - 32, cy - 28, cx + 32, cy + 28, 40, 280, { lw });
    else if (d.v === 1) poli(p, [[cx - 40, cy - 22], [cx, cy + 26], [cx + 40, cy - 22]], { lw });
    else if (d.v === 2) p.path([["M", cx - 28, cy + 26], ["L", cx - 28, cy - 18], ["C", cx - 28, cy - 34, cx + 28, cy - 34, cx + 28, cy - 18], ["L", cx + 28, cy + 26]], { lw });
    else p.path([["M", cx - 50, cy - 10], ["C", cx - 25, cy + 40, cx + 5, cy - 30, cx + 20, cy + 10], ["L", cx + 50, cy - 15]], { lw });
  } else if (d.v === 0) elipse(p, cx - 40, cy - 26, cx + 40, cy + 26, lw);
  else if (d.v === 1) p.rrect(cx - 38, cy - 22, 76, 44, 0, { lw });
  else if (d.v === 2) poli(p, [[cx - 40, cy - 24], [cx + 40, cy - 24], [cx, cy + 26]], { cerrar: true, lw });
  else p.path([["M", cx - 38, cy], ["C", cx - 38, cy + 40, cx + 10, cy + 34, cx + 36, cy + 10], ["C", cx + 50, cy - 18, cx + 10, cy - 34, cx - 10, cy - 24],
    ["C", cx - 30, cy - 18, cx - 38, cy - 10, cx - 38, cy], ["Z"]], { lw });
}

/** 3.º «paralelas»: los dos segmentos (semilargo 1, y hacia arriba) de una pareja de líneas: [[x1, y1, x2, y2], [x1, y1, x2, y2]]. */
export function segmentos(d) {
  const R = Math.PI / 180, d1 = [Math.cos(d.a1 * R), Math.sin(d.a1 * R)], d2 = [Math.cos(d.a2 * R), Math.sin(d.a2 * R)], seg = (c, e) => [c[0] - e[0], c[1] - e[1], c[0] + e[0], c[1] + e[1]];
  if (d.tipo === "paralelas") {   // la 2.ª, a 0.8–1.1 largos de la 1.ª (hacia un lado) y corrida u décimas a lo largo
    const n = [-d1[1], d1[0]], off = d.v / 10;
    return [seg([0, 0], d1), seg([n[0] * off + d1[0] * d.u / 10, n[1] * off + d1[1] * d.u / 10], d1)];
  }
  const P = [d1[0] * d.u / 10, d1[1] * d.u / 10];   // el punto donde se cortan
  return [seg([0, 0], d1), seg([P[0] - d2[0] * d.v / 10, P[1] - d2[1] * d.v / 10], d2)];
}

/** Flecha rellena en (x, y) apuntando a la dirección ang (grados). */
function punta(p, x, y, ang, t = 7) {
  const R = Math.PI / 180, a = ang * R, q = (k, w) => [x - t * k * Math.cos(a) - w * Math.sin(a), y - t * k * Math.sin(a) + w * Math.cos(a)];
  p.path([["M", x, y], ["L", ...q(1.6, t * 0.55)], ["L", ...q(1.6, -t * 0.55)], ["Z"]], { lw: 0.8, fill: INK, stroke: INK });
}

/** Dibuja el modo «paralelas» o «rectas» (3.º) centrado en (cx, cy) dentro de aw × ah. */
function trazo3(p, modo, d, cx, cy, aw, ah) {
  const segs = modo === "paralelas" ? segmentos(d) : (() => { const R = Math.PI / 180; return [[-Math.cos(d.ang * R), -Math.sin(d.ang * R), Math.cos(d.ang * R), Math.sin(d.ang * R)]]; })();
  const xs = segs.flatMap((q) => [q[0], q[2]]), ys = segs.flatMap((q) => [q[1], q[3]]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const s = Math.min(modo === "paralelas" ? 34 : 50, aw / Math.max(x1 - x0, 0.01), ah / Math.max(y1 - y0, 0.01)), mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  segs.forEach(([a, b, c, e]) => {
    const A = [cx + (a - mx) * s, cy + (b - my) * s], C = [cx + (c - mx) * s, cy + (e - my) * s];
    p.line(A[0], A[1], C[0], C[1], { lw: 2 });
    if (modo === "paralelas") return;
    const ang = Math.atan2(e - b, c - a) * 180 / Math.PI;
    if (d.tipo === "segmento") { p.circle(A[0], A[1], 3.2, { fill: INK, lw: 1 }); p.circle(C[0], C[1], 3.2, { fill: INK, lw: 1 }); }
    else if (d.tipo === "recta") { punta(p, A[0], A[1], ang + 180); punta(p, C[0], C[1], ang); }
    else if (d.inv) { p.circle(C[0], C[1], 3.2, { fill: INK, lw: 1 }); punta(p, A[0], A[1], ang + 180); }
    else { p.circle(A[0], A[1], 3.2, { fill: INK, lw: 1 }); punta(p, C[0], C[1], ang); }
  });
}

export default registrar({
  id: "geometria.lineas",
  version: 2,   // 2: las tres opciones salen desordenadas en cada casilla y las rectas caben en la casilla
  generar(params, azar, { tamano }) {
    const cnt = tamano === "media" ? 6 : 12;
    if (params.modo === "paralelas") {   // 3.º
      const tipos = ["paralelas", "perpendiculares", "oblicuas"], DIF = [45, 60, 120, 135];
      return {
        enunciado: "Mira las dos líneas de cada casilla.\nRodea si son paralelas, perpendiculares u oblicuas.",
        ejercicios: ciclo(tipos, cnt, azar).map((k) => {
          const a1 = 15 * azar.entero(0, 11), a2 = k === "paralelas" ? a1 : k === "perpendiculares" ? (a1 + 90) % 180 : (a1 + azar.elegir(DIF)) % 180;
          const u = azar.entero(-3, 3), v = k === "paralelas" ? azar.entero(8, 11) : azar.entero(-3, 3);
          return { datos: { tipo: k, tipos: azar.barajar(tipos), a1, a2, u, v }, solucion: { huecos: [], correcta: k } };
        }),
      };
    }
    if (params.modo === "rectas") {   // 3.º
      const tipos = ["recta", "semirrecta", "segmento"];
      return {
        enunciado: "Rodea si cada línea es una recta, una semirrecta o un segmento.",
        ejercicios: ciclo(tipos, cnt, azar).map((k) => ({ datos: { tipo: k, tipos: azar.barajar(tipos), ang: 15 * azar.entero(0, 11), inv: azar.entero(0, 1) }, solucion: { huecos: [], correcta: k } })),
      };
    }
    const cierre = params.modo === "cierre", tipos = cierre ? ["abierta", "cerrada"] : ["recta", "curva", "quebrada"];
    return {
      enunciado: cierre ? "Rodea si cada línea es abierta o cerrada." : "Rodea el nombre de cada línea.",
      ejercicios: ciclo(tipos, cnt, azar).map((k) => ({ datos: { tipo: k, tipos: cierre ? tipos : azar.barajar(tipos), ...nuevo(k, azar) }, solucion: { huecos: [], correcta: k } })),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 2, 6), modo3 = act.params?.modo === "paralelas" || act.params?.modo === "rectas" ? act.params.modo : null;
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i];
      p.marco(x, y, cw, ch, i);
      if (modo3) {
        trazo3(p, modo3, e.datos, x + cw / 2, y + 40 + (ch - 50) / 2, cw - 70, ch - 62);
        chips(p, x + cw / 2, y + 10, e.datos.tipos, 11, e.solucion.correcta);
        return;
      }
      trazo(p, e.datos, x + cw / 2, y + ch * 0.6);
      chips(p, x + cw / 2, y + 10, e.datos.tipos, 11, e.solucion.correcta);
    }));
  },
});
