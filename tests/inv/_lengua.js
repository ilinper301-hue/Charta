// Charta · ayudantes para las invariantes de Lengua (tests/inv/letra.js, silaba.js, …).
import assert from "node:assert/strict";
import { silabas, cabeTipo, sinTildes } from "../../src/lengua/reglas.js";
import { LEXICO } from "../../src/lengua/lexico.js";
import { cuantos, cuantosEntre } from "./_ayuda.js";

// Las invariantes de Lengua comprueban con el léxico del curso de la actividad (LENGUA_2.md, lote 1): en 1.º, sin las palabras de 2.º (n: 2),
// que solo salen desde 2.º. test_invariantes.js pone `sesion.curso` antes de cada actividad.
export const sesion = { curso: 1 };
const dos = () => sesion.curso >= 2;
export const LEXICO_1 = LEXICO.filter((e) => !e.n);
/** Nº de ejercicios: el pedido en 1.º; en 2.º, de la mitad al pedido (con palabras de 5 sílabas el banco da menos: conTope baja hasta el mínimo sin repetir). */
export const cantidadL = (es, max, min = max / 2) => (dos() ? cuantosEntre(es, max, min) : cuantos(es, max));
/** Léxico del curso que se está comprobando. */
export const lexicoCurso = () => (dos() ? LEXICO : LEXICO_1);
const P1 = new Set(LEXICO_1.map((e) => e.p)), P2 = new Set(LEXICO.map((e) => e.p));
/** Palabras del léxico del curso (solo se usa `.has`). */
export const PALABRAS = { has: (p) => (dos() ? P2 : P1).has(p) };
const cap = (t) => t[0].toUpperCase() + t.slice(1);

/** El texto está escrito en el caso pedido (null = minúscula, "inicial", "mayus") y devuelve su forma en minúscula. */
export function enCaso(txt, caso, q = "texto") {
  const m = txt.toLowerCase();
  const esperado = caso === "mayus" ? m.toUpperCase() : caso === "inicial" ? cap(m) : m;
  assert.equal(txt, esperado, `${q}: «${txt}» no está en el caso «${caso || "minúscula"}»`);
  return m;
}

/** Reglas comunes de una palabra de lectura: está en el léxico, es de un tipo de sílabas, tiene el largo pedido y no es «Isla…» con mayúscula inicial. */
export function palabraValida(m, params, { maxLetras = 99, largos = null } = {}) {
  assert.ok(PALABRAS.has(m), `«${m}» no está en el léxico`);
  assert.ok(cabeTipo(m, params.tipo || "directas"), `«${m}» no es de sílabas ${params.tipo || "directas"}`);
  assert.ok([...m].length <= maxLetras + (dos() ? 4 : 0), `«${m}» pasa de ${maxLetras} letras`);   // 2.º: palabras más largas (hasta 5 sílabas)
  const n = silabas(m).length;
  if (Number.isInteger(params.largo)) assert.equal(n, params.largo, `«${m}»: sílabas ≠ ${params.largo}`);
  if (largos) { const ok = dos() ? [...new Set([...largos, ...(largos.includes(3) ? [4, 5] : [])])] : largos; assert.ok(ok.includes(n), `«${m}»: ${n} sílabas fuera de ${ok}`); }
  if (params.caso === "inicial") assert.ok(!/^[iíì]/.test(m), `«${m}»: empieza por i con mayúscula inicial (I ≈ l)`);
}

/** ¿Hay otra palabra del léxico que encaje con la palabra salvo en las posiciones `libres`? (comparando sin tildes). */
const POR_LARGO = new Map();
export function otrasQueEncajan(m, libres) {
  const k = `${sesion.curso}|${m.length}`;
  if (!POR_LARGO.has(k)) POR_LARGO.set(k, lexicoCurso().filter((o) => o.p.length === m.length).map((o) => ({ p: o.p, s: sinTildes(o.p) })));
  const s = sinTildes(m), L = new Set(libres);
  return POR_LARGO.get(k).filter((o) => o.p !== m && [...o.s].every((c, i) => L.has(i) || c === s[i])).map((o) => o.p);
}

/** Todas las ordenaciones de una lista. */
export const permutaciones = (l) => (l.length <= 1 ? [l] : l.flatMap((x, i) => permutaciones([...l.slice(0, i), ...l.slice(i + 1)]).map((r) => [x, ...r])));

/** Unidades de una palabra en minúscula: ch, ll, rr, qu, gu (ante e, i) juntas. */
export const unidadesDe = (m) => m.match(/ch|ll|rr|qu|gu(?=[eéií])|./g);
