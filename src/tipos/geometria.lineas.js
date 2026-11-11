// geometria.lineas · Las líneas (port de _g_lineas() y _trazo() del motor).
// datos:    { tipo: "recta"|"curva"|"quebrada"|"abierta"|"cerrada", tipos: [las opciones de la casilla], ang?, v?, ys? }
//           tipos: en cada casilla va en un orden distinto (se baraja), para que el alumnado tenga que leer; «abierta/cerrada» va en orden fijo.
//           recta: ang (grados) · curva: v (0|1) · quebrada: ys (5 alturas) · abierta/cerrada: v (0–3)
// solucion: { huecos: [], correcta: tipo }
// Opción modo: null (recta, curva o quebrada) | "cierre" (abierta o cerrada). Completa: 12 líneas (6 filas × 2); media: 6.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
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

export default registrar({
  id: "geometria.lineas",
  version: 2,   // 2: las tres opciones salen desordenadas en cada casilla y las rectas caben en la casilla
  generar(params, azar, { tamano }) {
    const cierre = params.modo === "cierre", tipos = cierre ? ["abierta", "cerrada"] : ["recta", "curva", "quebrada"];
    const cnt = tamano === "media" ? 6 : 12;
    return {
      enunciado: cierre ? "Rodea si cada línea es abierta o cerrada." : "Rodea el nombre de cada línea.",
      ejercicios: ciclo(tipos, cnt, azar).map((k) => ({ datos: { tipo: k, tipos: cierre ? tipos : azar.barajar(tipos), ...nuevo(k, azar) }, solucion: { huecos: [], correcta: k } })),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 2, 6);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i];
      p.marco(x, y, cw, ch, i);
      trazo(p, e.datos, x + cw / 2, y + ch * 0.6);
      chips(p, x + cw / 2, y + 10, e.datos.tipos, 11, e.solucion.correcta);
    }));
  },
});
