// Charta · pruebas del alfabeto de letras de trazo (lote 4b).  Uso: node tests/test_trazos.js
import assert from "node:assert/strict";
import { Papel } from "../src/render/papel.js";
import { LETRAS_TRAZO, trazoACurvas, anchoTrazos, escribirTrazos, hayTrazo } from "../src/lengua/trazos.js";

let n = 0;
/** Puntos de la curva (las Bézier, muestreadas). */
function muestras(cmds) {
  const pts = []; let q = null;
  for (const [k, ...v] of cmds) {
    if (k === "C") for (let t = 0.05; t <= 1.0001; t += 0.05) {
      const u = 1 - t, b = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t], P = [q, [v[0], v[1]], [v[2], v[3]], [v[4], v[5]]];
      pts.push([0, 1].map((i) => b.reduce((s, bb, j) => s + bb * P[j][i], 0)));
    }
    q = [v.at(-2), v.at(-1)]; pts.push(q);
  }
  return pts;
}

// 1. Alfabeto completo: todas las letras que debe haber.
const ESPERADAS = [..."abcdefghijklmnñopqrstuvwxyzáéíóúü", ..."ABCDEFGHIJKLMNÑOPQRSTUVWXYZÁÉÍÓÚÜ", ..."0123456789", ".", ","];
for (const ch of ESPERADAS) { assert.ok(hayTrazo(ch), `falta «${ch}»`); n++; }

// 2. Cada letra: curvas válidas, dentro de la pauta (x ∈ [−0,05, w+0,05]; y ∈ [−0,85, 1,85]) y con ancho > 0.
//    Las letras con adorno (tilde, virgulilla, diéresis) llegan más arriba: el de mayúscula se dibuja a 1,98–2,28 → límite 2,3.
for (const [ch, L] of Object.entries(LETRAS_TRAZO)) {
  assert.ok(L.w > 0 && L.t.length >= 1, ch);
  const techo = L.ador ? 2.3 : 1.85;
  for (const tr of L.t) {
    let c; assert.doesNotThrow(() => { c = trazoACurvas(tr); }, ch);
    assert.equal(c.cmds[0][0], "M", ch);
    assert.ok(Math.abs(Math.hypot(...c.dir) - 1) < 1e-9 && Math.abs(Math.hypot(...c.flecha.d) - 1) < 1e-9, `${ch}: dirección`);
    const pts = muestras(c.cmds);
    for (const [x, y] of pts) {
      assert.ok(Number.isFinite(x) && Number.isFinite(y), ch);
      assert.ok(x >= -0.05 && x <= L.w + 0.05, `${ch}: x=${x.toFixed(2)} fuera de [0, ${L.w}]`);
      assert.ok(y >= -0.85 && y <= techo, `${ch}: y=${y.toFixed(2)} fuera de la pauta`);
    }
    n++;
  }
}

// 3. No hay dos letras iguales.
const vistas = new Map();
for (const [ch, L] of Object.entries(LETRAS_TRAZO)) {
  const k = JSON.stringify(L.t);
  assert.ok(!vistas.has(k), `«${ch}» y «${vistas.get(k)}» tienen los mismos trazos`);
  vistas.set(k, ch); n++;
}

// 4. Adornos: la letra con adorno reutiliza los trazos de la base y añade el suyo al final (í: la «i» sin punto).
const aniade = (ch, base, k, quitar = 0) => {
  const A = LETRAS_TRAZO[ch], B = LETRAS_TRAZO[base];
  assert.equal(A.t.length, B.t.length - quitar + k, ch);
  A.t.slice(0, B.t.length - quitar).forEach((t, i) => assert.equal(t, B.t[i], `${ch} no reutiliza ${base}`));   // mismos objetos, sin copiar datos
  assert.equal(A.w, B.w); n++;
};
for (const [ch, base] of [["á", "a"], ["é", "e"], ["ó", "o"], ["ú", "u"], ["ñ", "n"], ["Á", "A"], ["É", "E"], ["Í", "I"], ["Ó", "O"], ["Ú", "U"], ["Ñ", "N"]]) aniade(ch, base, 1);
aniade("í", "i", 1, 1); aniade("ü", "u", 2); aniade("Ü", "U", 2);

// 5. Texto con de todo y escritura sobre papel.
assert.doesNotThrow(() => anchoTrazos("Mamá Ñu 2026, é.")); n++;
{
  const p = new Papel(), t = "Mamá Ñu 2026, é.";
  const xf = escribirTrazos(p, t, 0, 0, 10, { flechas: true });
  assert.ok(Math.abs(xf - anchoTrazos(t) * 10) < 1e-9); n++;
}
console.log(`test_trazos: ${n} comprobaciones OK`);
