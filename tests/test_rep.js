// Charta · pruebas de las 16 representaciones SVG (paso 2.2).  Uso: node tests/test_rep.js
import assert from "node:assert/strict";
import { REPS, RANGOS, rep, plantilla, svgCompleto, nombreNumero } from "../src/rep/index.js";

let n = 0;
const prueba = (nombre, f) => { try { f(); n++; } catch (e) { console.error("FALLA:", nombre, "\n", e.message); process.exitCode = 1; } };

/** Comprobación mínima de XML bien formado: etiquetas equilibradas, atributos entrecomillados, entidades válidas. */
function xmlBienFormado(s) {
  const pila = [];
  const re = /<(\/?)([A-Za-z][\w:-]*)((?:\s+[\w:-]+="[^"<]*")*)\s*(\/?)>/g;
  let pos = 0, m;
  while ((m = re.exec(s))) {
    const texto = s.slice(pos, m.index);
    assert.ok(!/[<>]/.test(texto), "texto con < o > sin escapar: " + texto);
    assert.ok(!/&(?!(amp|lt|gt|quot|apos);)/.test(texto), "& sin escapar");
    pos = re.lastIndex;
    if (m[1]) assert.equal(pila.pop(), m[2], "etiqueta de cierre inesperada " + m[2]);
    else if (!m[4]) pila.push(m[2]);
  }
  assert.ok(!/[<>]/.test(s.slice(pos)), "resto sin analizar");
  assert.deepEqual(pila, [], "etiquetas sin cerrar");
}
const cuenta = (r, clase) => (r.svg.match(new RegExp(`class="${clase}"`, "g")) || []).length;
const sano = (r, etiqueta) => {
  assert.ok(Number.isFinite(r.w) && Number.isFinite(r.h) && r.w > 0 && r.h > 0, `${etiqueta}: w,h`);
  assert.ok(!/NaN|undefined|Infinity/.test(r.svg), `${etiqueta}: NaN/undefined en svg`);
  xmlBienFormado(svgCompleto(r));
};
const numeros = (nom) => Array.from({ length: RANGOS[nom][1] - RANGOS[nom][0] + 1 }, (_, k) => RANGOS[nom][0] + k);

prueba("las 16 representaciones: caja finita, svg limpio y XML bien formado (todo n, i 0..2, vacío)", () => {
  assert.equal(REPS.length, 16);
  for (const nom of REPS) for (const k of numeros(nom)) for (let i = 0; i < 3; i++) for (const vacio of [false, true]) {
    const r = rep(nom, k, { i, vacio }); sano(r, `${nom} n=${k} i=${i} vacio=${vacio}`);
    const p = plantilla(nom, k, { i }); if (p) sano(p, `plantilla ${nom} n=${k}`);
  }
});

prueba("determinismo: misma entrada, mismo SVG", () => {
  for (const nom of REPS) assert.equal(rep(nom, RANGOS[nom][1], { i: 2 }).svg, rep(nom, RANGOS[nom][1], { i: 2 }).svg);
});

prueba("dado: n puntos; 1-6 un dado, 7-12 dos dados", () => {
  for (let k = 1; k <= 12; k++) for (let i = 0; i < 3; i++) {
    const r = rep("dado", k, { i });
    assert.equal(cuenta(r, "punto"), k, `dado ${k}`);
    assert.equal(cuenta(r, "dado"), k <= 6 ? 1 : 2, `dados de ${k}`);
    assert.equal(cuenta(rep("dado", k, { i, vacio: true }), "punto"), 0);
  }
});

prueba("dominó: n puntos en total, cada mitad entre 0 y 6", () => {
  for (let k = 1; k <= 12; k++) for (let i = 0; i < 6; i++) {
    const r = rep("domino", k, { i });
    assert.equal(cuenta(r, "punto"), k, `domino ${k}`);
    const xs = [...r.svg.matchAll(/class="punto" cx="([-\d.]+)"/g)].map((m) => +m[1]);
    const izq = xs.filter((x) => x < 0).length, der = xs.length - izq;   // la división está en x = 0
    assert.ok(izq <= 6 && der <= 6, `mitades ${izq}/${der} de ${k}`);
    assert.equal(cuenta(rep("domino", k, { i, vacio: true }), "punto"), 0);
  }
});

prueba("marco de diez: celdas llenas = n, por filas, 2×5 por marco", () => {
  for (let k = 1; k <= 40; k++) {
    const r = rep("marco", k), marcos = r.svg.split('<g class="marco">').slice(1);
    assert.equal(marcos.length, Math.ceil(k / 10), `marcos de ${k}`);
    assert.equal(cuenta(r, "celda-llena"), k);
    let resto = k;
    marcos.forEach((mk, idx) => {
      const llenas = Math.min(10, resto); resto -= llenas;
      const cs = [...mk.matchAll(/class="celda-llena" cx="([-\d.]+)" cy="([-\d.]+)"/g)].map((m) => [+m[1], +m[2]]);
      assert.equal(cs.length, llenas, `marco ${idx} de ${k}`);
      if (idx < marcos.length - 1) assert.equal(llenas, 10);   // solo el último marco puede estar incompleto
      cs.forEach(([x, y], q) => {  // orden fila a fila: primera fila (y menor) completa antes de la segunda
        assert.equal(y > cs[0][1] + 0.01, q >= 5, `fila de la celda ${q}`);
        if (q > 0 && q !== 5) assert.ok(x > cs[q - 1][0], "izquierda a derecha");
      });
      assert.equal((mk.split("</g>")[0].match(/<line /g) || []).length, 5, "rejilla 2×5: 4 verticales + 1 horizontal");
    });
    assert.equal(cuenta(rep("marco", k, { vacio: true }), "celda-llena"), 0);
  }
});

prueba("palotes: n palotes; grupos de 5 con tachado (el tachado no cuenta)", () => {
  for (let k = 1; k <= 30; k++) {
    const r = rep("palotes", k);
    assert.equal(cuenta(r, "palote") + Math.floor(k / 5), k, `palotes de ${k}`);   // 4 + tachado por grupo de 5
  }
});

prueba("palotes: grupos completos = 4 palotes + 1 tachado, resto sin tachar", () => {
  for (let k = 1; k <= 30; k++) {
    const r = rep("palotes", k);
    assert.equal(cuenta(r, "tachado"), Math.floor(k / 5));
  }
});

prueba("ábaco: ≤ 9 cuentas por varilla y cuentas = d + u", () => {
  for (let k = 1; k <= 99; k++) {
    const r = rep("abaco", k), [d, u] = [Math.floor(k / 10), k % 10];
    const varillas = r.svg.split('<g class="varilla">').slice(1);
    assert.equal(varillas.length, 2);
    const cs = varillas.map((v) => (v.match(/class="cuenta"/g) || []).length);
    assert.deepEqual(cs, [d, u], `ábaco ${k}`);
    assert.ok(cs.every((x) => x <= 9));
    assert.equal(cuenta(r, "cuenta"), d + u);
  }
  assert.equal(cuenta(plantilla("abaco", 45), "cuenta"), 0);
});

prueba("otras representaciones cuentan n", () => {
  for (let k = 1; k <= 30; k++) assert.equal(cuenta(rep("objetos", k, { i: k }), "objeto"), k, `objetos ${k}`);
  for (let k = 1; k <= 30; k++) {
    const r = rep("regletas", k);
    assert.equal(cuenta(r, "regleta"), k <= 10 ? 1 : Math.ceil(k / 10));
    const celdas = [...r.svg.matchAll(/<g class="regleta">(.*?)<\/g>/g)].map((m) => (m[1].match(/<line /g) || []).length + 1);
    assert.equal(celdas.reduce((a, b) => a + b, 0), k, `regletas ${k}`);
  }
  for (let k = 1; k <= 99; k++) {
    const r = rep("bloques", k); assert.equal(cuenta(r, "decena") * 10 + cuenta(r, "unidad"), k, `bloques ${k}`);
  }
  for (let k = 1; k <= 100; k++) assert.equal(cuenta(rep("cuadricula", k), "celda-llena"), k, `cuadricula ${k}`);
  for (let k = 1; k <= 69; k++) {
    const r = rep("monedas", k); assert.equal(cuenta(r, "moneda-10") * 10 + cuenta(r, "moneda-1"), k, `monedas ${k}`);
    const a = rep("atados", k); assert.equal(cuenta(a, "atado") * 10 + cuenta(a, "palito-suelto"), k, `atados ${k}`);
    assert.equal((a.svg.match(/class="palito"/g) || []).length, cuenta(a, "atado") * 10);
  }
  for (let k = 1; k <= 10; k++) assert.equal(cuenta(rep("dedos", k), "dedo") , k <= 5 ? k : 5 + (k - 5), `dedos ${k}`);
});

prueba("letras: nombreNumero", () => {
  assert.equal(nombreNumero(16), "dieciséis"); assert.equal(nombreNumero(22), "veintidós");
  assert.equal(nombreNumero(21), "veintiuno"); assert.equal(nombreNumero(30), "treinta");
  assert.equal(nombreNumero(100), "cien"); assert.equal(nombreNumero(47), "cuarenta y siete");
  assert.equal(nombreNumero(1), "uno"); assert.equal(nombreNumero(99), "noventa y nueve");
  assert.ok(rep("letras", 16).svg.includes("dieciséis"));
  assert.ok(rep("letras", 47).svg.includes(">y siete<"));
});

prueba("descomposición suma n; du coincide con n; textos escapados", () => {
  for (let k = 2; k <= 100; k++) for (let i = 0; i < 3; i++) {
    const t = rep("descomp", k, { i }).svg.match(/>(\d+) \+ (\d+)</);
    assert.equal(+t[1] + +t[2], k, `descomp ${k}`);
  }
  for (let k = 1; k <= 99; k++) {
    const t = [...rep("du", k).svg.matchAll(/class="du-numero"[^>]*>(\d+)</g)].map((m) => +m[1]);
    assert.deepEqual(t, [Math.floor(k / 10), k % 10]);
  }
});

prueba("plantilla: null donde TPL es None; svgCompleto", () => {
  for (const nom of ["dedos", "palotes", "objetos", "regletas", "bloques", "monedas", "atados"]) assert.equal(plantilla(nom, 5), null, nom);
  for (const nom of ["dado", "domino", "marco", "descomp", "letras", "recta", "cuadricula", "abaco", "du"]) assert.ok(plantilla(nom, 7), nom);
  const s = svgCompleto(rep("dado", 3), 2);
  assert.ok(s.startsWith('<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ') && s.endsWith("</svg>"));
});

console.log(`test_rep: ${n} pruebas OK`);
