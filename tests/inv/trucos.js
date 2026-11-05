// Charta · invariantes de la familia «trucos» (trucos de cálculo mental de Calculi; ver tests/invariantes.js).
// Cada fila ["7 + 8 =", null] con su solución debe ser una igualdad cierta (se evalúa con los huecos rellenos).
import assert from "node:assert/strict";
import { ent, unicos, cuantos } from "./_ayuda.js";

const valor = (s) => { if (!/^[\d\s+−]+$/.test(s)) throw new Error("expresión no válida: " + s); return Function(`"use strict";return (${s.replaceAll("−", "-")})`)(); };
/** Reconstruye la igualdad con los huecos rellenos y comprueba que es cierta; devuelve los números que aparecen. */
function igualdad(e) {
  let k = 0;
  const txt = e.datos.fila.map((x) => (x === null ? String(e.solucion.huecos[k++]) : x)).join(" ");
  assert.equal(k, e.solucion.huecos.length, "huecos ≠ cuadros");
  const partes = txt.split("="); assert.equal(partes.length, 2, "una sola igualdad: " + txt);
  assert.equal(valor(partes[0]), valor(partes[1]), "igualdad falsa: " + txt);
  return { txt, nums: (txt.match(/\d+/g) || []).map(Number), hueco: e.solucion.huecos };
}

/** Reglas comunes: nº de filas, igualdad cierta, números dentro del rango y sin negativos, sin filas repetidas. */
function trucos(filas, { dentro = () => true, rango = (act) => act.params.rango ?? 20 } = {}) {
  return (act, tam) => {
    const es = act.ejercicios, R = rango(act);
    cuantos(es, (tam === "media" ? Math.max(1, Math.floor(filas / 2)) : filas) * 3);
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
};
