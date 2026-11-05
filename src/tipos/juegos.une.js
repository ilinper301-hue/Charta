// juegos.une · Une operaciones y resultados (port de _j_une() del motor). Solo página completa.
// datos:    { a, b, op: "+" | "-", r: a ± b, derecha: número que aparece en la caja de la derecha de esta fila }
//           (8 filas; la columna de la derecha son los 8 resultados barajados)
// solucion: { huecos: [], une: índice de la fila cuya caja de la derecha lleva el resultado r }   (el alumno traza la línea; en modo solución, en rojo)
// Opciones: modo (sumas y restas / suma / resta) y nivel (llevadas), como sumar.* y restar.* (rangos 10, 20, 30, 100).
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, MENOS, INK, COLOR_SOLUCION } from "../render/papel.js";

const rango = (a, b, paso = 1) => { const o = []; for (let i = a; i < b; i += paso) o.push(i); return o; };

/** _unico(): elige un par no repetido (hasta 80 intentos). */
function unico(pool, vistos, azar) {
  let p;
  for (let k = 0; k < 80; k++) { p = azar.elegir(pool); if (!vistos.has(p.join())) break; }
  vistos.add(p.join()); return p;
}

/** _pares_suma(R, nivel, cnt). */
export function paresSuma(R, nivel, cnt, azar) {
  nivel = nivel || "sin"; let grupos;
  if (R <= 10) grupos = [rango(1, 10).flatMap((a) => rango(1, 10).filter((b) => a + b <= 10).map((b) => [a, b]))];
  else if (R <= 20) {
    const sin = rango(1, 20).flatMap((a) => rango(1, 20).filter((b) => a + b <= 20 && !(a < 10 && b < 10 && a + b > 10)).map((b) => [a, b]));
    const con = rango(2, 10).flatMap((a) => rango(2, 10).filter((b) => a + b > 10).map((b) => [a, b]));
    con.lleva = true;   // pares(): no rellenar con otro tipo de grupo
    grupos = { sin: [sin], con: [con], mezcla: [sin, con] }[nivel];
  } else {
    const cap = Math.min(R, 99), ten = rango(10, cap + 1, 10);
    const dd = ten.flatMap((a) => ten.filter((b) => a + b <= cap).map((b) => [a, b]));
    let du = ten.flatMap((a) => rango(1, 10).filter((b) => a + b <= cap).map((b) => [a, b])); du = [...du, ...du.map(([a, b]) => [b, a])];
    const uu = rango(11, cap).filter((a) => a % 10);
    const s = uu.flatMap((a) => rango(1, 10).filter((b) => (a % 10) + b < 10 && a + b <= cap).map((b) => [a, b]));
    const k = uu.flatMap((a) => rango(1, 10).filter((b) => (a % 10) + b >= 10 && a + b <= cap).map((b) => [a, b]));
    k.lleva = true;   // pares(): no rellenar con otro tipo de grupo
    grupos = { sin: [dd, du, s], con: [k], mezcla: [dd, du, s, k] }[nivel];
  }
  const vistos = new Set();
  return azar.barajar(Array.from({ length: cnt }, (_, i) => unico(grupos[i % grupos.length], vistos, azar)));
}

/** _pares_resta(R, nivel, cnt). */
export function paresResta(R, nivel, cnt, azar) {
  nivel = nivel || "sin"; let grupos;
  if (R <= 10) grupos = [rango(2, 11).flatMap((a) => rango(1, a).map((b) => [a, b]))];
  else if (R <= 20) {
    const sin = rango(2, 21).flatMap((a) => rango(1, a).filter((b) => a <= 10 || a - b >= 10).map((b) => [a, b]));
    const con = rango(11, 20).flatMap((a) => rango(2, 10).filter((b) => b < a && a - b < 10).map((b) => [a, b]));
    con.lleva = true;   // pares(): no rellenar con otro tipo de grupo
    grupos = { sin: [sin], con: [con], mezcla: [sin, con] }[nivel];
  } else {
    const cap = Math.min(R, 99), ten = rango(10, cap + 1, 10);
    const dd = ten.flatMap((a) => ten.filter((b) => b < a).map((b) => [a, b]));
    const uu = rango(11, cap + 1).filter((a) => a % 10);
    const du = uu.flatMap((a) => rango(1, 10).filter((b) => b <= a % 10 && b < a).map((b) => [a, b]));
    const dudu = uu.flatMap((a) => rango(11, a).filter((b) => b % 10 <= a % 10).map((b) => [a, b]));
    const con = rango(11, cap + 1).flatMap((a) => rango(2, 10).filter((b) => a % 10 < b).map((b) => [a, b]));
    con.lleva = true;   // pares(): no rellenar con otro tipo de grupo
    grupos = { sin: [dd, du, dudu], con: [con], mezcla: [dd, du, dudu, con] }[nivel];
  }
  const vistos = new Set();
  return azar.barajar(Array.from({ length: cnt }, (_, i) => unico(grupos[i % grupos.length], vistos, azar)));
}

export default registrar({
  id: "juegos.une",
  version: 1,
  generar(params, azar) {
    const R = params.rango ?? 10, srcs = { suma: [0], resta: [1], mezcla: [0, 1] }[params.modo || "mezcla"];
    const ps = [paresSuma(R, params.nivel, 60, azar), paresResta(R, params.nivel, 60, azar)];
    const ops = [], usados = new Set();
    for (let i = 0; i < 120 && ops.length < 8; i++) {
      const t = srcs[ops.length % srcs.length], [a, b] = ps[t][i % 60], r = t === 0 ? a + b : a - b;
      if (!usados.has(r)) { usados.add(r); ops.push({ a, b, op: t === 0 ? "+" : "-", r }); }
    }
    while (ops.length < 8) ops.push(ops[ops.length % ops.length]);
    const fil = azar.barajar(ops), der = azar.barajar(fil.map((o) => o.r));
    return {
      enunciado: "Une cada operación con su resultado.",
      ejercicios: fil.map((o, i) => ({ datos: { ...o, derecha: der[i] }, solucion: { huecos: [], une: der.indexOf(o.r) } })),
    };
  },
  dibujar(p, act) {
    const rh = (TOP - M) / 8, lw = 170, rw = 110, hh = 54, xl = M + 20, xr = W - M - 20 - rw;
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const { a, b, op, derecha } = e.datos, y = TOP - (i + 1) * rh + (rh - hh) / 2;
      p.tarjeta(xl, y, lw, hh); p.tarjeta(xr, y, rw, hh);
      p.text(xl + lw / 2, y + hh / 2 - 7.5, `${a} ${op === "+" ? "+" : MENOS} ${b}`, 22, { f: "PB", anchor: "middle" });
      p.text(xr + rw / 2, y + hh / 2 - 8, String(derecha), 24, { f: "PB", anchor: "middle" });
      p.circle(xl + lw, y + hh / 2, 5, { fill: INK }); p.circle(xr, y + hh / 2, 5, { fill: INK });
      if (p.solucion) {
        const yd = TOP - (e.solucion.une + 1) * rh + (rh - hh) / 2;
        p.line(xl + lw, y + hh / 2, xr, yd + hh / 2, { lw: 2.4, gris: COLOR_SOLUCION });
      }
    }));
  },
});
