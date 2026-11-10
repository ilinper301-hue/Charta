// restar.vertical · Restas en vertical, columnas D y U (port de _r_vertical() del motor).
// datos:    { a, b }                (21 ≤ a ≤ min(rango, 99), 1 ≤ b < a)
// solucion: { huecos: [decenas, unidades] del resultado }   (hueco de D, después el de U; D puede ser 0)
// Opción nivel: null/"sin" (sin llevadas: unidades de b ≤ unidades de a), "con" (con llevada: b%10 > a%10), "mezcla" (alternadas).
// Completa: 12 restas (4 filas × 3); media: 6.
// 2.º (rango > 100, columnas C, D, U; ver _tres.js):
//   datos:    { a, b }   (101 ≤ a ≤ rango ≤ 999, 1 ≤ b < a)
//   solucion: { huecos: [C, D, U] del resultado }  (C o D pueden ser 0 y se escriben) · con prueba: { huecos: [C, D, U, resultado] }
//   Opción nivel: sin/con/mezcla y "u" (se pide solo en las unidades), "d" (solo en las decenas), "ud" (en las dos).
//   Opción prueba (sí/no): debajo del resultado, «☐ + b = a» (el hueco recibe el resultado); caben los 12 (6 en media) sin reducir.
//   Sin casilla pequeña de llevada: en la resta se «pide» tachando y escribiendo sobre el minuendo, y la casilla no ayuda; se deja
//   aire sobre el minuendo y el espacio se usa para la prueba.
import { registrar } from "../nucleo/tipos.js";
import { TOP, MENOS } from "../render/papel.js";
import { restasVert, vertical3 } from "./_tres.js";

export default registrar({
  id: "restar.vertical",
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 30;
    if (R > 100) {
      return {
        enunciado: params.prueba ? "Resta y comprueba con la suma de abajo." : "Resta primero las unidades, después las decenas y las centenas.",
        ejercicios: restasVert(R, params.nivel, tamano === "media" ? 6 : 12, azar).map(([a, b]) => {
          const t = a - b, h = [Math.floor(t / 100), Math.floor(t / 10) % 10, t % 10];
          return { datos: { a, b }, solucion: { huecos: params.prueba ? [...h, t] : h } };
        }),
      };
    }
    if (R < 30) throw new Error("Restas en vertical necesita un rango máximo de al menos 30.");
    const cap = Math.min(R, 99), nivel = params.nivel || "sin", cnt = tamano === "media" ? 6 : 12, ps = [], vistos = new Set();
    while (ps.length < cnt) {
      const con = nivel === "con" || (nivel === "mezcla" && ps.length % 2 === 1);
      let a, b, ok = false;
      for (let k = 0; k < 800 && !ok; k++) {
        a = azar.entero(21, cap); b = azar.entero(1, a - 1);
        ok = ((b % 10) > (a % 10)) === con && !vistos.has(a + "," + b);
      }
      if (!ok) throw new Error("Esta ficha necesita un rango máximo mayor.");
      vistos.add(a + "," + b); ps.push([a, b]);
    }
    return {
      enunciado: "Resta primero las unidades y después las decenas.",
      ejercicios: azar.barajar(ps).map(([a, b]) => ({ datos: { a, b }, solucion: { huecos: [Math.floor((a - b) / 10), (a - b) % 10] } })),
    };
  },
  dibujar(p, act) {
    if ((act.params.rango ?? 30) > 100) return vertical3(p, act, true);
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
      p.text(xt - 38, y + ch - 90, MENOS, 24, { anchor: "middle" });
      p.line(xt - 28, y + ch - 98, xu + 24, y + ch - 98, { lw: 1.6 });
      p.caja(xt - 15, y + 14, 30, 40, null, 22, e.solucion.huecos[0]);
      p.caja(xu - 15, y + 14, 30, 40, null, 22, e.solucion.huecos[1]);
    }));
  },
});
