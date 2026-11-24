// combinada.combinada · ¿Qué número es? (port de nums_combinada() y ficha_combinada() del motor).
// datos:    { rep, n }   casilla i: representación `rep` (de COMB_30 si rango ≤ 30, si no de COMB_100) del número n
// solucion: { huecos: [n] }   (cuadrito gris arriba a la derecha)
// Completa: 12 casillas (4 filas × 3) y el recuadro «RETO»; media: 6 casillas (2 filas), sin reto.
// Los números salen de tres tercios de 1..R: cada casilla pide un número dentro del rango de su representación;
// casillas vecinas (también en diagonal) nunca repiten número y se repiten al menos 3 números.
import { registrar } from "../nucleo/tipos.js";
import { H, M, W } from "../render/papel.js";
import { rangosPara } from "../rep/index.js";
import { tercios } from "./_rep.js";

export const COMB_30 = ["dedos", "marco", "descomp", "dado", "palotes", "recta", "regletas", "letras", "objetos", "marco", "domino", "domino"];
/** 3.º (rango > 1000): las seis representaciones con millares, dos veces (la media página las tiene todas). */
export const COMB_1000 = ["bloques", "letras", "abaco", "descomp", "du", "recta", "letras", "recta", "bloques", "du", "abaco", "descomp"];
export const COMB_100 = ["bloques", "cuadricula", "monedas", "letras", "descomp", "recta", "palotes", "regletas", "abaco", "du", "cuadricula", "atados"];
/** Nombre de cada representación (columna NOM de CAT del motor). */
export const NOMBRES = {
  dedos: "Dedos", dado: "Dado", domino: "Dominó", marco: "Marco de diez", palotes: "Palotes", objetos: "Objetos", regletas: "Regletas",
  descomp: "Descomposición", letras: "Número en letras", recta: "Recta numérica", bloques: "Bloques de base diez",
  cuadricula: "Cuadrícula de 100", monedas: "Monedas", abaco: "Ábaco", du: "Decenas y unidades", atados: "Palitos y atados",
};

/** Con millares, la etiqueta de «du». */
const NOMBRES_M = { du: "UM, C, D y U", bloques: "Bloques" };
/** Representaciones de la ficha según el rango. */
export const clavesComb = (R) => R > 1000 ? COMB_1000 : R <= 30 ? COMB_30 : COMB_100;

/** nums_combinada(): un número por casilla, con los repetidos del reto. */
function numsCombinada(keys, R, azar) {
  const RANGOS = rangosPara(R);
  const th = tercios(1, R);
  let mejor = null;
  for (let it = 0; it < 20000; it++) {
    let pool = [];
    for (const t of th) pool = pool.concat(azar.muestra(t, Math.min(3, t.length)));
    const nums = []; let ok = true;
    for (const k of keys) {
      const [lo, mx] = RANGOS[k], cand = pool.filter((p) => lo <= p && p <= Math.min(mx, R));
      if (!cand.length) { ok = false; break; }
      nums.push(azar.elegir(cand));
    }
    if (!ok) continue;
    let mal = false;
    for (let a = 0; a < 12 && !mal; a++) for (let b = a + 1; b < 12; b++)
      if (Math.abs(Math.floor(a / 3) - Math.floor(b / 3)) <= 1 && Math.abs(a % 3 - b % 3) <= 1 && nums[a] === nums[b]) { mal = true; break; }
    if (mal) continue;
    mejor = nums;
    const cnt = new Map(); for (const v of nums) cnt.set(v, (cnt.get(v) || 0) + 1);
    if ([...cnt.values()].filter((v) => v >= 2).length >= 3 && cnt.size >= 7) return nums;
  }
  return mejor;
}

export default registrar({
  id: "combinada.combinada",
  version: 2,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 20, claves = clavesComb(R), nums = numsCombinada(claves, R, azar), mil = R > 1000;
    if (!nums) throw new Error("Esta ficha necesita un rango máximo mayor.");
    const cnt = tamano === "media" ? 6 : 12;
    return {
      enunciado: "Observa cada casilla y escribe en el cuadrito el número que representa.",
      ejercicios: claves.slice(0, cnt).map((rep, i) => ({ datos: { rep, n: nums[i], ...(mil ? { millares: true } : {}) }, solucion: { huecos: [nums[i]] } })),
    };
  },
  dibujar(p, act) {
    const R = act.params?.rango ?? 20, RETO_H = 74, top = H - M - 70, bottom = M + RETO_H + 14, GX = 10, GY = 9;
    const cw = (W - 2 * M - 2 * GX) / 3, ch = (top - bottom - 3 * GY) / 4;
    act.ejercicios.forEach((e, idx) => p.ejercicio(e.id, () => {
      const r = Math.floor(idx / 3), col = idx % 3, x = M + col * (cw + GX), y = top - (r + 1) * ch - r * GY, { rep, n } = e.datos;
      p.tarjeta(x, y, cw, ch);
      const mil = !!e.datos.millares;
      p.rotulo(x + 12, y + ch - 17, ((mil && NOMBRES_M[rep]) || NOMBRES[rep]).toUpperCase(), 11, cw - 12 - 58);   // ≥ 9 pt impresos
      if (mil) p.caja(x + cw - 9 - 58, y + ch - 9 - 30, 58, 30, null, 18, e.solucion.huecos[0]);   // hueco para 4 cifras
      else p.cuadrito(x, y, cw, ch, 30, e.solucion.huecos[0]);
      p.rep(rep, n, x + cw / 2, y + ch * 0.40, { i: idx, rango: R, millares: mil, escala: mil && rep === "bloques" ? 0.8 : 1 });   // celdas más bajas que en rep.*
    }));
    if (act.tamano === "media") return;
    p.tarjeta(M, M, W - 2 * M, RETO_H);
    p.text(M + 16, M + RETO_H - 22, "RETO:", 10.5, { f: "PB" });
    p.text(M + 16 + p.ancho("RETO: ", "PB", 10.5), M + RETO_H - 22, "Elige una casilla y explica cómo has sabido qué número era.", 10.5, { f: "PM" });
    p.line(M + 16, M + 26, W - M - 16, M + 26, { lw: 1.0 });
    p.line(M + 16, M + 40, W - M - 16, M + 40, { lw: 1.0 });
  },
});
