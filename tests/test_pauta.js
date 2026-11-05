// Charta · pruebas de la pauta Lamela y las letras de trazo (lote 4).  Uso: node tests/test_pauta.js
import assert from "node:assert/strict";
import { Papel, MM, escalaPanel } from "../src/render/papel.js";
import { registrar } from "../src/nucleo/tipos.js";
import { hoja } from "../src/render/hoja.js";
import { renglones, medidasPauta, cabenRenglones, TAMANOS_PAUTA, ASTA, RABO } from "../src/lengua/pauta.js";
import { LETRAS_TRAZO, trazoACurvas, anchoTrazos, escribirTrazos, hayTrazo } from "../src/lengua/trazos.js";

let n = 0;
const cerca = (a, b, tol, msg) => { assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} ≠ ${b}`); n++; };

// 1. Medidas reales: la escala que usa el tipo es la que aplica el panel (completa, media, enunciado de 1–3 líneas, letra grande).
let visto = [];
registrar({ id: "prueba.mm", version: 1, generar: () => ({ datos: {}, solucion: { huecos: [] } }), dibujar(p) { visto.push(p.escala); } });
const act = (tamano, n, enunciado) => ({ n, tipo: "prueba.mm", tamano, color: "verde", enunciado, datos: {}, solucion: { huecos: [] } });
for (const [acts, grande] of [[[act("completa", 1, "Una línea.")], false], [[act("completa", 1, "Una\ndos\ntres")], false],
  [[act("media", 1, "Una."), act("media", 2, "Una\ndos")], false], [[act("completa", 1, "Una línea bastante larga para partirla en dos líneas con letra grande, seguro que sí.")], true]]) {
  visto = [];
  const svg = hoja({ actividades: acts }, { titulo: "x", grande });
  const escalas = [...svg.matchAll(/class="actividad"[^>]*><g transform="translate\([^)]*\) scale\(([\d.]+)\)/g)].map((m) => +m[1]);
  assert.equal(escalas.length, acts.length);
  escalas.forEach((e, i) => {
    cerca(visto[i], e, 1e-3, "escala del panel");
    const p = new Papel({ escala: visto[i] });
    cerca(p.mm(5) * e, 5 * MM, 0.01, "5 mm en el papel");
  });
}
cerca(new Papel().escala, escalaPanel(1), 1e-12, "escala nominal");
cerca(new Papel({ parte: 0.5 }).escala, escalaPanel(0.5), 1e-12, "escala nominal (media)");

// 2. Pauta: paso de 3 cuerpos, base más marcada, guía entre renglones.
for (const mm of TAMANOS_PAUTA) {
  const p = new Papel();
  const { bases, c, paso } = renglones(p, 30, 500, 700, 4, { mm, guia: true });
  cerca(c * p.escala, mm * MM, 1e-9, `cuerpo de ${mm} mm`);
  cerca(paso, 3 * c, 1e-9, "paso");
  bases.slice(1).forEach((b, i) => cerca(bases[i] - b, paso, 1e-9, "base a base"));
  cerca(700 - bases[0], 2 * c, 1e-9, "aire de las astas");
  assert.equal(p.o.filter((s) => s.startsWith("<line")).length, 4 * 2 + 3); n++;
  assert.equal(cabenRenglones(p, 4 * paso, mm), 4); n++;
}
assert.throws(() => medidasPauta(new Papel(), 6)); n++;

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

// 3. Letras de trazo: cada trazo empieza con M o A, dentro de la pauta (asta ≤ 1,8, rabo ≥ −0,8) y del ancho declarado.
for (const [ch, L] of Object.entries(LETRAS_TRAZO)) {
  assert.ok(L.w > 0 && L.t.length >= 1, ch);
  for (const tr of L.t) {
    const { cmds, ini, dir, flecha } = trazoACurvas(tr);
    assert.equal(cmds[0][0], "M", ch);
    cerca(Math.hypot(...dir), 1, 1e-9, `${ch}: dirección unitaria`);
    cerca(Math.hypot(...flecha.d), 1, 1e-9, `${ch}: flecha unitaria`);
    const pts = muestras(cmds), xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
    assert.ok(Math.min(...ys) >= -RABO - 1e-6 && Math.max(...ys) <= 1 + ASTA + 1e-6, `${ch}: se sale de la pauta`);
    assert.ok(Math.min(...xs) >= -1e-6 && Math.max(...xs) <= L.w + 1e-6, `${ch}: se sale de su ancho`);
    assert.ok(ini.every(Number.isFinite)); n++;
  }
}
assert.ok(hayTrazo("a") && hayTrazo(" ") && !hayTrazo("€")); n++;
assert.throws(() => anchoTrazos("a€")); n++;
cerca(anchoTrazos("al"), LETRAS_TRAZO.a.w + LETRAS_TRAZO.l.w + 0.32, 1e-9, "ancho");

// 4. Estilos: modelo (punto verde; flechas solo si es grande), repaso y punteado; la x final avanza el ancho.
{
  const p = new Papel(), c = medidasPauta(p, 5).c;
  const xf = escribirTrazos(p, "alg", 40, 300, c);
  cerca(xf - 40, anchoTrazos("alg") * c, 1e-9, "avance");
  assert.equal(p.o.filter((s) => s.includes('fill="#2E7D32"')).length, 5); n++;         // 5 trazos → 5 puntos verdes
  assert.equal(p.o.filter((s) => s.startsWith("<text")).length, 0); n++;                 // a 5 mm, sin números
  const g = new Papel(); escribirTrazos(g, "alg", 40, 300, g.mm(20));
  assert.equal(g.o.filter((s) => s.startsWith("<text")).length, 5); n++;                 // grande: 5 flechas numeradas
  const r = new Papel(); escribirTrazos(r, "a", 0, 0, 10, { estilo: "punteado" });
  assert.ok(r.o.some((s) => s.includes("stroke-dasharray")) && !r.o.some((s) => s.includes("#2E7D32"))); n++;
  assert.throws(() => escribirTrazos(new Papel(), "a", 0, 0, 10, { estilo: "otro" })); n++;
}

console.log(`test_pauta: ${n} comprobaciones OK`);
