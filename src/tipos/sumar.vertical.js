// sumar.vertical · Sumas en vertical, columnas D y U (port de _s_vertical() del motor).
// datos:    { a, b }                (a ≥ 11, b ≥ 1, a + b ≤ min(rango, 99))
// solucion: { huecos: [decenas, unidades] del resultado }   (hueco de D, después el de U)
// Opción nivel: null/"sin" (sin llevadas), "con" (con llevada en las unidades), "mezcla" (alternadas).
// Completa: 12 sumas (4 filas × 3); media: 6.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";

export default registrar({
  id: "sumar.vertical",
  version: 1,
  generar(params, azar, { tamano }) {
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
