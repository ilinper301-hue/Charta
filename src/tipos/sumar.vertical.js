// sumar.vertical · Sumas en vertical, columnas D y U (port de _s_vertical() del motor).
// datos:    { a, b }                (a ≥ 11, b ≥ 1, a + b ≤ min(rango, 99))
// solucion: { huecos: [decenas, unidades] del resultado }   (hueco de D, después el de U)
// Opción nivel: null/"sin" (sin llevadas), "con" (con llevada en las unidades), "mezcla" (alternadas).
// Completa: 12 sumas (4 filas × 3); media: 6.
// 2.º (rango > 100, columnas C, D, U; ver _tres.js):
//   datos:    { a, b } o, con sumandos: 3, { a, b, c }   (a ≥ b ≥ c, a de tres cifras, suma ≤ rango ≤ 999)
//   solucion: { huecos: [centenas, decenas, unidades] del resultado }   (las llevadas no son huecos: se calculan al dibujar)
//   Opción nivel: además de sin/con/mezcla, "u" (llevada solo en las unidades), "d" (solo en las decenas), "ud" (en las dos);
//   con tres sumandos la llevada de las unidades puede ser 2. Opción sumandos: null (dos) | 3 (tres filas).
//   Dibujo: sobre D y C, casilla pequeña de llevada (vacía en papel; en la solución, la llevada si la hay, en rojo).
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { sumasVert, vertical3 } from "./_tres.js";

export default registrar({
  id: "sumar.vertical",
  version: 1,
  generar(params, azar, { tamano }) {
    if ((params.rango ?? 30) > 100) {
      const k = params.sumandos === 3 ? 3 : 2, ps = sumasVert(params.rango, params.nivel, k, tamano === "media" ? 6 : 12, azar);
      return {
        enunciado: "Suma primero las unidades, después las decenas y las centenas.",
        ejercicios: ps.map(([a, b, c]) => {
          const t = a + b + (c ?? 0);
          return { datos: c === undefined ? { a, b } : { a, b, c }, solucion: { huecos: [Math.floor(t / 100), Math.floor(t / 10) % 10, t % 10] } };
        }),
      };
    }
    const cap = Math.min(params.rango ?? 30, 99), nivel = params.nivel || "sin", cnt = tamano === "media" ? 6 : 12;
    const cand = { true: [], false: [] };       // por «lleva»
    for (let a = 11; a <= cap - 1; a++) for (let b = 1; b <= cap - a; b++) cand[(a % 10) + (b % 10) >= 10].push([a, b]);
    const ps = [], vistos = new Set();
    while (ps.length < cnt) {
      const con = nivel === "con" || (nivel === "mezcla" && ps.length % 2 === 1);
      const lib = cand[con].filter((p) => !vistos.has(p.join()));
      if (!lib.length) throw new Error("Esta ficha necesita un rango máximo mayor.");
      const p = azar.elegir(lib); vistos.add(p.join()); ps.push(p);
    }
    return {
      enunciado: "Suma primero las unidades y después las decenas.",
      ejercicios: azar.barajar(ps).map(([a, b]) => ({ datos: { a, b }, solucion: { huecos: [Math.floor((a + b) / 10), (a + b) % 10] } })),
    };
  },
  dibujar(p, act) {
    if ((act.params.rango ?? 30) > 100) return vertical3(p, act, false);
    const { cel, cw, ch } = p.celdas(TOP, 3, 4);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { a, b } = e.datos, xt = x + cw / 2 - 17, xu = x + cw / 2 + 17;
      p.marco(x, y, cw, ch, i);
      p.text(xt, y + ch - 20, "D", 9, { f: "PM", anchor: "middle", gris: 0.3 });
      p.text(xu, y + ch - 20, "U", 9, { f: "PM", anchor: "middle", gris: 0.3 });
      [a, b].forEach((v, j) => {
        const yy = y + ch - 56 - j * 34;
        if (v >= 10) p.text(xt, yy, String(Math.floor(v / 10)), 24, { anchor: "middle" });
        p.text(xu, yy, String(v % 10), 24, { anchor: "middle" });
      });
      p.text(xt - 38, y + ch - 90, "+", 24, { anchor: "middle" });
      p.line(xt - 28, y + ch - 98, xu + 24, y + ch - 98, { lw: 1.6 });
      p.caja(xt - 15, y + 14, 30, 40, null, 22, e.solucion.huecos[0]);
      p.caja(xu - 15, y + 14, 30, 40, null, 22, e.solucion.huecos[1]);
    }));
  },
});
