// Charta · invariantes de la familia «rep» (rep.dado y rep.marco están en tests/invariantes.js).
import assert from "node:assert/strict";
import { rep, ent, unicos, cuantos } from "./_ayuda.js";

// Comprobación independiente de aRomano: forma canónica por tabla de unidades, decenas y centenas.
const canon = (n) => (n === 100 ? "C" : ["", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"][Math.floor(n / 10)] + ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"][n % 10]);
const valor = (s) => [...s].reduce((t, c, i, a) => { const v = { I: 1, V: 5, X: 10, L: 50, C: 100 }; return t + (v[c] < (v[a[i + 1]] ?? 0) ? -v[c] : v[c]); }, 0);

export default {
  "rep.romanos"(act, tam) {
    const es = act.ejercicios, R = act.params.rango ?? 100, modo = act.params.modo ?? null, k = tam === "media" ? 9 : 18;
    cuantos(es, k); unicos(es, (e) => e.datos.n, "números repetidos");
    for (const { datos: { n, romano, sentido }, solucion } of es) {
      ent(n, 1, R, "n");
      assert.equal(romano, canon(n), `romano de ${n}`); assert.equal(valor(romano), n); assert.ok(!/(.)\1{3}/.test(romano), "más de tres iguales");
      assert.ok(modo === null ? ["leer", "escribir"].includes(sentido) : sentido === modo, "sentido");
      assert.deepEqual(solucion.huecos, [sentido === "leer" ? n : romano]);
    }
    const sub = es.filter((e) => /IV|IX|XL|XC/.test(e.datos.romano)).length, posibles = Array.from({ length: R }, (_, i) => canon(i + 1)).filter((r) => /IV|IX|XL|XC/.test(r)).length;
    assert.ok(sub >= Math.min(Math.ceil(k / 3), posibles), `con resta: ${sub}`);
    if (modo === null) assert.ok(Math.abs(es.filter((e) => e.datos.sentido === "leer").length - es.length / 2) <= 0.5, "mitad y mitad");
    if (R >= 100) assert.ok(es.some((e) => e.datos.n > 66) && es.some((e) => e.datos.n <= 33), "no repartidos por el rango");
  },
  "rep.dedos": rep("dedos"),
  "rep.domino": rep("domino"),
  "rep.palotes": rep("palotes"),
  "rep.objetos": rep("objetos"),
  "rep.regletas": rep("regletas"),
  "rep.descomp": rep("descomp"),
  "rep.letras": rep("letras"),
  "rep.recta": rep("recta"),
  "rep.bloques": rep("bloques"),
  "rep.cuadricula": rep("cuadricula"),
  "rep.monedas": rep("monedas"),
  "rep.abaco": rep("abaco"),
  "rep.du": rep("du"),
  "rep.atados": rep("atados"),
};
