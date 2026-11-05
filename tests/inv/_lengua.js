// Charta · ayudantes para las invariantes de Lengua (tests/inv/letra.js, silaba.js, …).
import assert from "node:assert/strict";
import { silabas, cabeTipo, sinTildes } from "../../src/lengua/reglas.js";
import { LEXICO } from "../../src/lengua/lexico.js";

export const PALABRAS = new Set(LEXICO.map((e) => e.p));
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
  assert.ok([...m].length <= maxLetras, `«${m}» pasa de ${maxLetras} letras`);
  const n = silabas(m).length;
  if (Number.isInteger(params.largo)) assert.equal(n, params.largo, `«${m}»: sílabas ≠ ${params.largo}`);
  if (largos) assert.ok(largos.includes(n), `«${m}»: ${n} sílabas fuera de ${largos}`);
  if (params.caso === "inicial") assert.ok(!/^[iíì]/.test(m), `«${m}»: empieza por i con mayúscula inicial (I ≈ l)`);
}

/** ¿Hay otra palabra del léxico que encaje con la palabra salvo en las posiciones `libres`? (comparando sin tildes). */
const POR_LARGO = new Map();
export function otrasQueEncajan(m, libres) {
  if (!POR_LARGO.has(m.length)) POR_LARGO.set(m.length, LEXICO.filter((o) => o.p.length === m.length).map((o) => ({ p: o.p, s: sinTildes(o.p) })));
  const s = sinTildes(m), L = new Set(libres);
  return POR_LARGO.get(m.length).filter((o) => o.p !== m && [...o.s].every((c, i) => L.has(i) || c === s[i])).map((o) => o.p);
}

/** Todas las ordenaciones de una lista. */
export const permutaciones = (l) => (l.length <= 1 ? [l] : l.flatMap((x, i) => permutaciones([...l.slice(0, i), ...l.slice(i + 1)]).map((r) => [x, ...r])));

/** Unidades de una palabra en minúscula: ch, ll, rr, qu, gu (ante e, i) juntas. */
export const unidadesDe = (m) => m.match(/ch|ll|rr|qu|gu(?=[eéií])|./g);
