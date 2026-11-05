// Charta · paso 5.3 · diapositivas para Fori.  Uso: node tests/test_fori.js [--full]
// Para cada tipo (todas las combinaciones con --full; si no, las opciones por defecto), completa y media:
// los pasos de la solución cubren todo lo rojo, cada ejercicio con respuesta tiene ≥ 1 paso,
// los pasos por ejercicio suman los de la actividad y las diapositivas son SVG bien formado.
import assert from "node:assert/strict";
import { generar } from "../src/nucleo/ficha.js";
import { listaTipos } from "../src/tipos/index.js";
import { render } from "../src/render/actividad.js";
import { COLOR_SOLUCION } from "../src/render/papel.js";
import { marcarPasos, diapositivas, paqueteFori, cssPasos } from "../src/fori/diapositivas.js";
import { combinaciones, contador } from "./comun.js";

const FULL = process.argv.includes("--full");
const c = contador(), prueba = c.prueba;
const rojos = (s) => (s.match(new RegExp(`<[^>]*(${[COLOR_SOLUCION, "#F2B8B5", "#EF9A9A"].join("|")})[^>]*>`, "gi")) || []).length;
const cajaFalsa = (zona) => (z) => Object.fromEntries([...z.svg.matchAll(/class="ej" data-ej="([^"]*)"/g)].map((m) => [m[1], { x: zona.x, y: zona.y, w: zona.w, h: zona.h }]));
const bien = (s) => {
  const pila = [];
  for (const m of s.matchAll(/<(\/?)([A-Za-z][\w:-]*)[^>]*?(\/?)>/g)) {
    if (m[1]) assert.equal(pila.pop(), m[2], "cierre inesperado " + m[2]); else if (!m[3]) pila.push(m[2]);
  }
  assert.deepEqual(pila, [], "etiquetas sin cerrar");
};

prueba("cssPasos", () => {
  assert.equal(cssPasos(3, 3), "");
  assert.equal(cssPasos(0, 2), ".cs{visibility:hidden}");
  assert.equal(cssPasos(2, 4), ".cs{visibility:hidden}.p0,.p1{visibility:visible}");
});
prueba("racha: arco + flecha = 1 paso; rojo, gris, rojo = 2", () => {
  const r = `stroke="${COLOR_SOLUCION}"`;
  assert.equal(marcarPasos(`<g class="ej" data-ej="a"><path ${r}/><path ${r}/></g>`).n, 1);
  const m = marcarPasos(`<g class="ej" data-ej="a"><text fill="${COLOR_SOLUCION}">1</text><rect fill="#eee"/><text fill="${COLOR_SOLUCION}">2</text></g><g class="ej" data-ej="b"><line ${r}/></g>`, "a");
  assert.equal(m.n, 2);
  assert.match(m.svg, /class="cs p1"/);
  assert.match(m.svg, /<line class="cs" /);
});

let diapos = 0;
for (const id of listaTipos()) {
  const combos = FULL ? combinaciones(id) : [{}];
  for (const params of combos) for (const tam of ["completa", "media"]) prueba(`${id} ${JSON.stringify(params)} ${tam}`, () => {
    let f;
    try { f = generar({ actividades: tam === "media" ? [{ tipo: id, params }, { tipo: id, params }] : [{ tipo: id, params }] }, 7); }
    catch (e) { if (/necesita|solo en|no admite|completa/.test(e.message)) return; throw e; }
    for (const act of f.paginas[0].actividades) {
      const zona = render(act, "solucion"), todo = marcarPasos(zona.svg);
      assert.equal(rojos(render(act, "papel").svg), 0, "colores de solución en el papel");
      assert.equal((todo.svg.match(/class="cs/g) || []).length, rojos(zona.svg), "todo lo rojo es paso");
      const ids = [...zona.svg.matchAll(/class="ej" data-ej="([^"]*)"/g)].map((m) => m[1]);
      let suma = 0;
      for (const x of act.ejercicios) {
        if (!ids.includes(x.id)) continue;                      // media: solo los ejercicios dibujados
        const k = marcarPasos(zona.svg, x.id).n; suma += k;
        const s = x.solucion, tiene = (s.huecos && s.huecos.length) || Object.keys(s).some((q) => q !== "huecos");
        if (tiene) assert.ok(k >= 1, `ejercicio ${x.id} sin pasos`);
      }
      const fuera = marcarPasos(zona.svg.replace(/<g class="ej"[\s\S]*$/, "")).n;
      if (!fuera) assert.equal(suma, todo.n, "pasos por ejercicio = pasos de la actividad");
    }
    const ds = diapositivas(f, { cajas: (z) => cajaFalsa(z)(z) });
    assert.ok(ds.length >= f.paginas[0].actividades.length);
    for (const d of ds) { bien(d.svg); assert.ok(d.svg.includes("/*PASOS*/")); assert.ok(Number.isInteger(d.n)); }
    diapos += ds.length;
  });
}

prueba("paquete: sin nombres, tamaño razonable", () => {
  const f = generar({ actividades: [{ tipo: "sumar.h20" }, { tipo: "restar.recta" }] }, 3);
  const p = paqueteFori(f, { cajas: (z) => cajaFalsa(z)(z) });
  assert.equal(p.v, 1); assert.equal(p.app, "charta");
  const t = JSON.stringify(p);
  assert.ok(!/alumno|nombres/.test(t));
  assert.ok(t.length < 400000, `paquete de ${t.length} caracteres`);
});

console.log(`test_fori: ${c.n} pruebas, ${diapos} diapositivas ${process.exitCode ? "CON ERRORES" : "OK"}`);
