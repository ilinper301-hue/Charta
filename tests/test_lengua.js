// Charta · pruebas de las reglas de Lengua (lote 0).  Uso: node tests/test_lengua.js
import assert from "node:assert/strict";
import { silabas, tipoSilaba, cabeTipo, tonica, acentuacion, rima, riman, plural, articulo, soloLetras, llevaLetra, huecosOrto, letras } from "../src/lengua/reglas.js";

// Lista de control hecha a mano (silabeo de la RAE; sin prefijos dudosos).
const CONTROL = `sol mar pan flor tren luz pez rey muy hoy y sal mes tos pie
ma-má pa-pá me-sa ca-sa pe-lo-ta lu-na ga-to pa-to ma-no ca-ma sa-po to-ma-te mu-ñe-ca pi-ña
ár-bol is-la al-to o-lla es-pe-jo ar-ma-rio ra-tón ca-mión can-ción ja-bón le-ón co-ra-zón
pla-to bru-ja flo-res li-bro ca-bra glo-bo dra-gón tri-go fre-sa cla-se blan-co pri-mo cro-que-ta
hom-bre ins-tan-te trans-por-te om-bli-go
pe-rro ca-rro go-rra ca-lle lla-ve po-llo chu-pe-te co-che le-che mu-cha-cho
que-so gui-ta-rra ju-gue-te ki-wi
pin-güi-no ci-güe-ña
dí-a pa-ís ma-íz rí-o tí-o bú-ho a-hí
au-la cie-lo pie-dra hue-vo a-gua cui-da-do rui-do ciu-dad bue-no nue-ve vein-te
ra-yo ma-yo a-yer jer-sey pla-ya yo-gur
lá-piz pá-ja-ro mú-si-ca plá-ta-no
a-mi-go e-le-fan-te o-ve-ja u-va i-gle-sia a-bue-la
e-xa-men ta-xi`.split(/\s+/).filter(Boolean);
let n = 0;
for (const x of CONTROL) {
  assert.deepEqual(silabas(x.replaceAll("-", "")), x.split("-"), x); n++;
}
assert.deepEqual(silabas("agua"), ["a", "gua"]);

// Tipo de sílaba
const T = { a: "vocal", ma: "directa", al: "inversa", es: "inversa", pla: "trabada", tren: "trabada", sol: "mixta", con: "mixta", que: "directa", gui: "directa", chu: "directa", rey: "directa", ins: "inversa", y: "vocal", güe: "directa" };
for (const [s, t] of Object.entries(T)) assert.equal(tipoSilaba(s), t, s);
assert.ok(cabeTipo("pelota", "directas") && !cabeTipo("árbol", "directas") && cabeTipo("árbol", "mixtas") && !cabeTipo("plato", "inversas") && cabeTipo("plato", "trabadas"));

// Tónica, rima
assert.equal(acentuacion("ratón"), "aguda"); assert.equal(acentuacion("mesa"), "llana"); assert.equal(acentuacion("pájaro"), "esdrujula"); assert.equal(acentuacion("reloj"), "aguda");
assert.equal(tonica("árbol"), 0); assert.equal(tonica("cuidado"), 1);
assert.ok(riman("gato", "pato") && riman("ratón", "camión") && riman("mesa", "fresa") && !riman("gato", "gota") && !riman("gato", "gato"));
assert.ok(riman("casa", "masa", "silaba") && riman("luna", "cuna", "vocal") && riman("sol", "col"));
assert.equal(rima("canción"), "on"); assert.equal(rima("cuidado"), "ado"); assert.equal(rima("rey"), "ey");

// Plural
const P = { gato: "gatos", flor: "flores", pez: "peces", lápiz: "lápices", camión: "camiones", ratón: "ratones", joven: "jóvenes", examen: "exámenes", árbol: "árboles", rey: "reyes", lunes: "lunes", autobús: "autobuses", mes: "meses", papá: "papás", sofá: "sofás", menú: "menús", pared: "paredes", reloj: "relojes", café: "cafés", imagen: "imágenes", país: "países", robot: "robots", jersey: "jerséis", maíz: "maíces", raíz: "raíces", hámster: "hámsteres" };
for (const [a, b] of Object.entries(P)) assert.equal(plural(a), b, a);

// Artículo, letras
assert.equal(articulo("m"), "el"); assert.equal(articulo("f", { plural: true }), "las"); assert.equal(articulo("m", { indefinido: true, plural: true }), "unos"); assert.equal(articulo("f", { indefinido: true }), "una");
assert.equal(letras("lluvia").length, 6); assert.equal(letras("niño").length, 4);
assert.ok(soloLetras("mamá", "mpa") && !soloLetras("mesa", "mpa") && soloLetras("pingüino", "pinguo") && soloLetras("cualquiera", null));
assert.ok(llevaLetra("árbol", "a") && !llevaLetra("sol", "a"));

// Ortografía
const h = (p, r) => huecosOrto(p, r).map((x) => p.slice(0, x.pos) + "_" + p.slice(x.pos + x.largo) + ":" + x.correcta).join(" ");
assert.equal(h("campo", "mpb"), "ca_po:m"); assert.equal(h("hombre", "mpb"), "ho_bre:m"); assert.equal(h("enviar", "mpb"), "e_viar:n"); assert.equal(h("mesa", "mpb"), "");
assert.equal(h("perro", "r"), "pe_o:rr"); assert.equal(h("pera", "r"), "pe_a:r"); assert.equal(h("ratón", "r"), "_atón:r"); assert.equal(h("árbol", "r"), "");
assert.equal(h("queso", "cqu"), "_eso:qu"); assert.equal(h("casa", "cqu"), "_asa:c"); assert.equal(h("coche", "cqu"), "_oche:c");
assert.equal(h("guitarra", "ggu"), "_itarra:gu"); assert.equal(h("gato", "ggu"), "_ato:g"); assert.equal(h("pingüino", "ggu"), "");
assert.equal(h("zapato", "cz"), "_apato:z"); assert.equal(h("cielo", "cz"), "_ielo:c"); assert.equal(h("taza", "cz"), "ta_a:z");
console.log(`test_lengua: silabeo de ${n + 1} palabras de control, tipos, tónica, rima, plural, artículo, letras y ortografía OK`);

// Léxico: al día con el TSV, silabeo limpio, plurales y verbos.
import { readFileSync } from "node:fs";
import { LEXICO } from "../src/lengua/lexico.js";
import { buscar, elegirPalabras, datosPalabra, CAMPOS_LEXICOS } from "../src/lengua/palabras.js";
import { crearAzar } from "../src/nucleo/azar.js";
{
  const tsv = readFileSync(new URL("../datos/lexico_1.tsv", import.meta.url), "utf8").split("\n").slice(1).filter((l) => l.trim() && !l.startsWith("#"));
  assert.equal(LEXICO.length, tsv.length, "lexico.js desfasado: ejecutar python3 tools/lexico.py");
  for (const e of LEXICO) {
    const { s } = datosPalabra(e);
    assert.equal(s.join(""), e.p, e.p);
    assert.ok(s.every((x) => /[aeiouáéíóúüy]/.test(x)), `${e.p}: sílaba sin vocal`);
    if (e.c === "n") assert.ok(/s$/.test(plural(e.p)), `${e.p}: plural`);
    if (e.c === "v") assert.ok(/(ar|er|ir|ír)$/.test(e.p) && e.v3, `${e.p}: verbo`);
  }
  for (const k of CAMPOS_LEXICOS) assert.ok(buscar({ campos: [k], cat: k === "colores" ? null : "n" }).length >= 8, `campo ${k}: pocas palabras`);
  const az = crearAzar(7), ps = elegirPalabras(az, 6, { cat: "n", nSilabas: 2, tipo: "directas" });
  assert.equal(new Set(ps.map((e) => e.p)).size, 6);
  assert.ok(ps.every((e) => datosPalabra(e).s.length === 2 && cabeTipo(e.p, "directas")));
  assert.deepEqual(elegirPalabras(crearAzar(7), 6, { cat: "n", nSilabas: 2, tipo: "directas" }), ps, "reproducible con la semilla");
  assert.ok(buscar({ letras: "mpsaeiou" }).every((e) => soloLetras(e.p, "mpsaeiou")));
  assert.throws(() => elegirPalabras(az, 5, { letras: "m" }), /Solo hay/);
  const tabla = [1, 2, 3, 4].map((n) => Object.keys({ directas: 0, inversas: 0, trabadas: 0, mixtas: 0 }).map((t) => buscar({ nSilabas: n, tipo: t }).length).join("/"));
  console.log(`test_lengua: léxico de ${LEXICO.length} palabras OK · por sílabas 1–4 (directas/inversas/trabadas/mixtas): ${tabla.join(" · ")}`);
}

// Ayudantes de dibujo: sin NaN; el rojo solo en la solución.
import { Papel } from "../src/render/papel.js";
import { fuentePorId } from "../src/render/fuentes.js";
import { palabraHuecos, casillas, rodear, unir, rotulo } from "../src/lengua/dibujo.js";
{
  for (const modo of ["papel", "solucion"]) {
    const p = new Papel({ modo, fuente: fuentePorId("fredoka") });
    palabraHuecos(p, 28, 700, 260, 50, "mesa", [{ pos: 1, largo: 1 }]);
    palabraHuecos(p, 28, 640, 260, 50, "guitarra", [{ pos: 0, largo: 2 }, { pos: 5, largo: 2 }]);
    casillas(p, 28, 580, 260, 50, 3, { sol: ["pe", "lo", "ta"] });
    casillas(p, 28, 520, 260, 50, 4, { rellenar: 2 });
    rodear(p, 28, 460, 260, 50, ["b", "d", "p"], 1, { tarjeta: true });
    rotulo(p, 300, 460, 50, "gato");
    unir(p, 28, 100, 540, 300, ["gato", "luna", "mesa"], ["cuna", "fresa", "pato"], [2, 0, 1], { ids: ["u1", "u2", "u3"] });
    const svg = p.resultado().svg;
    assert.ok(!/NaN|undefined/.test(svg), modo);
    assert.equal(/#C62828/.test(svg), modo === "solucion", `${modo}: rojo`);
    assert.ok(svg.includes("Fredoka") && (svg.match(/class="ej"/g) || []).length === 3);
    if (modo === "solucion") assert.ok(svg.includes(">gu<") && svg.includes(">rr<") && svg.includes(">lo<"));
  }
  console.log("test_lengua: ayudantes de dibujo (huecos, casillas, rodear, unir) OK");
}
