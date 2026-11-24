// multiplicar.por10 · Por 10, por 100 y por 1000 (3.º, lote 3, bloque 13; solo curso 3, sin rango).
// datos:    { a, f, falta: null | 0 | 1 }   (a × f; f = 10, 100 o 1000; `falta` = factor que se esconde en modo "hueco")
// solucion: { huecos: [a·f] } · "hueco" → [a] (falta 0) o [f] (falta 1)
// Opciones: por (None = mezcla de ×10, ×100 y ×1000 · "10" · "100") · modo (None = el resultado · "hueco" = el factor que falta).
// a sin cero final (para que se vea «añadir ceros»): ×10 → 2–9, 11–99 o 101–999; ×100 → 2–9 o 11–99; ×1000 → 2–9. Resultado ≤ 9999. Sin repetir (a, f).
// Rejilla elástica de 2 columnas × 8 filas (16; media 8). Cantidad: «Más grandes» = 16 y 8; «Más ejercicios» = las filas de 2 que caben con tarjetas ≥ 54 pt.
import { registrar } from "../nucleo/tipos.js";
import { T, B } from "../render/papel.js";
import { cuantos, pintarEl, MIN_OP } from "./_elastica.js";
import { POR } from "./_multiplicar.js";

/** Intervalos [lo, hi] de a para cada factor, de más fácil a más difícil (se reparten por turnos). */
/** Mezcla: ×10 la mitad, ×100 un tercio y ×1000 un sexto (el ×1000 solo tiene 8 números: 2–9). */
const PATRON = [10, 100, 1000, 10, 100, 10];
const CLASES = { 10: [[2, 9], [11, 99], [101, 999]], 100: [[2, 9], [11, 99]], 1000: [[2, 9]] };

function elegirA(f, i, azar, vistos) {
  const clases = CLASES[f];
  for (let intento = 0; intento < 200; intento++) {
    const [lo, hi] = clases[(i + Math.floor(intento / 40)) % clases.length], a = azar.entero(lo, hi);
    if (a >= 11 && a % 10 === 0) continue;
    if (!vistos.has(a + "," + f)) return a;
  }
  return null;
}

export default registrar({
  id: "multiplicar.por10",
  version: 1,
  cantidad: true,
  generar(params, azar, ctx) {
    const modo = params.modo ?? null, por = params.por == null ? null : Number(params.por);
    const fs = por ? [por] : PATRON;
    const cnt = cuantos(ctx, 2, MIN_OP, [16, 8]);
    const vistos = new Set(), usos = {}, orden = fs, ejercicios = [];
    for (let i = 0; ejercicios.length < cnt; i++) {   // los factores por turnos; si a uno no le quedan números, el siguiente
      let hecho = false;
      for (let j = 0; j < orden.length && !hecho; j++) {
        const f = orden[(i + j) % orden.length], a = elegirA(f, usos[f] ?? 0, azar, vistos);
        if (a === null) continue;
        vistos.add(a + "," + f); usos[f] = (usos[f] ?? 0) + 1; hecho = true;
        const falta = modo === "hueco" ? azar.entero(0, 1) : null;
        ejercicios.push({ datos: { a, f, falta }, solucion: { huecos: [falta === null ? a * f : falta === 0 ? a : f] } });
      }
      if (!hecho) break;
    }
    if (ejercicios.length % 2) ejercicios.pop();   // filas de 2 completas
    ejercicios.splice(0, ejercicios.length, ...azar.barajar(ejercicios));
    return {
      enunciado: modo === "hueco" ? "Escribe el número que falta." : "Calcula y escribe el resultado en el cuadro gris.",
      ejercicios,
    };
  },
  dibujar(p, act) {
    const es = act.ejercicios;
    const items = (e) => {
      const { a, f, falta } = e.datos, h = e.solucion.huecos[0];
      if (falta === 0) return [B(60, 38, h), T(`${POR} ${f} = ${a * f}`, 19)];
      if (falta === 1) return [T(`${a} ${POR}`, 19), B(68, 38, h), T(`= ${a * f}`, 19)];
      return [T(`${a} ${POR} ${f} =`, 19), B(68, 38, h)];
    };
    pintarEl(p, 2, es.map(items), es.map((e) => e.id), es.length / 2);
  },
});
