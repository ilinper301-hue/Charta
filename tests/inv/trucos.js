// Charta · invariantes de la familia «trucos» (trucos de cálculo mental de Calculi; ver tests/invariantes.js).
// Cada fila ["7 + 8 =", null] con su solución debe ser una igualdad cierta (se evalúa con los huecos rellenos);
// las filas encadenadas de 2.º («34 + 25 = 50 + 9 = 59») valen lo mismo en todos los tramos.
import assert from "node:assert/strict";
import { ent, unicos, cuantos } from "./_ayuda.js";

const valor = (s) => { if (!/^[\d\s+−]+$/.test(s)) throw new Error("expresión no válida: " + s); return Function(`"use strict";return (${s.replaceAll("−", "-")})`)(); };
/** Reconstruye la igualdad con los huecos rellenos y comprueba que es cierta; devuelve los números que aparecen. */
function igualdad(e) {
  let k = 0;
  const txt = e.datos.fila.map((x) => (x === null ? String(e.solucion.huecos[k++]) : x)).join(" ");
  assert.equal(k, e.solucion.huecos.length, "huecos ≠ cuadros");
  const partes = txt.split("="); assert.ok(partes.length >= 2 && partes.length <= 3, "una igualdad (o cadena x = y = z): " + txt);
  const v = partes.map(valor); v.forEach((x) => assert.equal(x, v[0], "igualdad falsa: " + txt));   // en cadenas, todos los tramos valen lo mismo
  return { txt, nums: (txt.match(/\d+/g) || []).map(Number), hueco: e.solucion.huecos };
}

/** Reglas comunes: nº de filas, igualdad cierta, números dentro del rango y sin negativos, sin filas repetidas. */
function trucos(filas, { dentro = () => true, rango = (act) => act.params.rango ?? 20, columnas = 3 } = {}) {
  return (act, tam) => {
    const es = act.ejercicios, R = rango(act);
    cuantos(es, (tam === "media" ? Math.max(1, Math.floor(filas / 2)) : filas) * columnas);
    unicos(es, (e) => e.datos.fila.map((x) => x ?? "□").join(" "), "filas repetidas");
    for (const e of es) {
      const { txt, nums, hueco } = igualdad(e);
      for (const n of nums) ent(n, 0, R, `número de «${txt}»`);
      for (const h of hueco) ent(h, 0, R, `respuesta de «${txt}»`);
      assert.ok(dentro(txt, act), `regla del truco: ${txt}`);
    }
  };
}

export default {
  "trucos.masmenos1": trucos(6, { dentro: (t, act) => /[+−] 1 =|1 \+ \d+ =/.test(t) && (act.params.modo !== "mas" || !t.includes("−")) && (act.params.modo !== "menos" || !/\+/.test(t)) }),
  "trucos.descomponer": trucos(8, { dentro: (t) => { const n = t.match(/\d+/g).map(Number); return Math.max(...n) <= 10 && Math.max(...n) >= 4; } }),
  "trucos.orden": trucos(8, { dentro: (t, act) => {
    const n = t.match(/\d+/g).map(Number);
    const f = act.params.forma, esIg = t.split("=")[1].includes("+");
    return (f !== "igualdad" || esIg) && (f !== "calcula" || !esIg) && Math.min(n[0], n[1]) >= 1;
  } }),
  "trucos.usar5": trucos(8, { dentro: (t, act) => act.params.modo !== "suma" || /^[5-9] \+ [5-9] = \d+$/.test(t) }),
  "trucos.casidobles": trucos(6, { dentro: (t) => { const [a, b] = t.match(/\d+/g).map(Number); return Math.abs(a - b) === 1; } }),
  "trucos.sumar9": trucos(6, { dentro: (t) => /(^| )9( |$)/.test(t.split("=")[0]) }),
  "trucos.restarsumando": trucos(8, { dentro: (t) => { const n = t.match(/\d+/g).map(Number); return Math.max(...n) >= 11 && (n.includes(7) || n.includes(8) || n.includes(9)); } }),
  "trucos.masmenos10": trucos(6, { dentro: (t, act) => /(^| )10( |$)/.test(t.split("=")[0]) && (act.params.modo !== "suma" || !t.includes("−")) && (act.params.modo !== "resta" || !/\+/.test(t)) }),
  // ---- 2.º (Calculi c2) ----
  "trucos.amigos100": trucos(8, { rango: () => 100, dentro: (t, act) => {
    const [x, y] = t.replace("100", "").match(/\d+/g).map(Number);   // a + □ = 100 en cualquier forma
    return x + y === 100 && (act.params.modo !== "decenas" || (x % 10 === 0 && y % 10 === 0)) && /(^| )100( |$)/.test(t);
  } }),
  "trucos.sumadecenas": trucos(8, { rango: () => 100, dentro: (t) => {
    const [p, q, r] = t.match(/\d+/g).map(Number), dec = p % 10 === 0 ? p : q, otro = dec === p ? q : p;
    return dec % 10 === 0 && dec >= 10 && otro % 10 !== 0 && r % 10 === otro % 10 && r <= 99 && t.includes("+") && !t.includes("−");
  } }),
  "trucos.restadecenas": trucos(8, { rango: () => 100, dentro: (t) => {
    const [a, b, r] = t.match(/\d+/g).map(Number);
    return t.includes("−") && b % 10 === 0 && a % 10 !== 0 && r % 10 === a % 10 && r === a - b && r > 0;
  } }),
  "trucos.descomponer2": trucos(8, { columnas: 2, rango: () => 100, dentro: (t) => {
    const [a, b, d, u, r] = t.match(/\d+/g).map(Number);   // 34 + 25 = 50 + 9 = 59: decenas juntas, unidades juntas, sin llevada
    return d === a - (a % 10) + b - (b % 10) && u === (a % 10) + (b % 10) && u <= 9 && r === d + u && r === a + b && r <= 99 && a % 10 > 0 && b % 10 > 0;
  } }),
  "trucos.pasardecena2": trucos(8, { columnas: 2, rango: () => 100, dentro: (t) => {
    const [a, b, dec, resto, r] = t.match(/\d+/g).map(Number);   // 38 + 7 = 40 + 5 = 45: con llevada
    return dec % 10 === 0 && dec === a - (a % 10) + 10 && (a % 10) + b > 10 && resto === b - (dec - a) && r === a + b && r <= 99;
  } }),
  "trucos.sumar919": trucos(8, { columnas: 2, rango: () => 100, dentro: (t) => {
    const [a, k, m, q, r] = t.match(/\d+/g).map(Number);   // 36 + 19 = 56 − 1 = 55
    return (k === 9 || k === 19) && q === 1 && m === a + (k === 9 ? 10 : 20) && r === a + k && t.includes("−");
  } }),
  "trucos.restar919": trucos(8, { columnas: 2, rango: () => 100, dentro: (t) => {
    const [a, k, m, q, r] = t.match(/\d+/g).map(Number);   // 52 − 19 = 32 + 1 = 33
    return (k === 9 || k === 19) && q === 1 && m === a - (k === 9 ? 10 : 20) && r === a - k && /\+ 1 =/.test(t);
  } }),
  "trucos.compensar2": trucos(8, { columnas: 2, rango: () => 100, dentro: (t) => {
    const [a, b, red, b2, c, r] = t.match(/\d+/g).map(Number);   // 48 + 25 = 50 + 25 − 2 = 73
    return [7, 8, 9].includes(a % 10) && red === a + c && red % 10 === 0 && b2 === b && c <= 3 && r === a + b && r <= 99;
  } }),
  "trucos.centenas": trucos(8, { rango: () => 999, dentro: (t, act) => {
    const [a, b, r] = t.match(/\d+/g).map(Number), suma = t.includes("+"), c = (x) => Math.floor(x / 100);
    return b % 100 === 0 && b >= 100 && r % 100 === a % 100 && c(r) !== c(a) && (suma ? c(r) === c(a) + c(b) : c(r) === c(a) - c(b) && r >= 100) &&
      (act.params.modo !== "suma" || suma) && (act.params.modo !== "resta" || !suma);
  } }),
  "trucos.restaradelante": trucos(8, { rango: () => 100, dentro: (t) => {
    const n = t.match(/\d+/g).map(Number), [a, b, r] = t.includes("−") ? n : [n[2], n[0], n[1]];   // 62 − 58 = 4  /  58 + 4 = 62
    return b % 10 >= 6 && r === a - b && Math.floor(a / 10) > Math.floor(b / 10) && r <= 13;
  } }),
};
