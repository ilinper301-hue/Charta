// Charta · Lengua · reglas del español para 1.º (lote 0 de LENGUA_1.md). Sin dependencias ni DOM.
// Silabeo, tipo de sílaba, sílaba tónica, rima, plural, artículo, letras vistas y huecos de ortografía.
// Las palabras van en minúscula. «ch», «ll», «rr», «qu» y «gu» (ante e, i) cuentan como una consonante al silabear.

const FUERTES = "aeoáéíóú";            // í y ú con tilde rompen el diptongo (hiato), como las fuertes
const DEBILES = "iuü";
const VOCALES = FUERTES + DEBILES;
const TILDES = { á: "a", é: "e", í: "i", ó: "o", ú: "u", ü: "u" };
const PONER_TILDE = { a: "á", e: "é", i: "í", o: "ó", u: "ú" };
// Grupos que no se separan (van juntos a la sílaba siguiente): pla, bra, cri, dra, tre…
const TRABADOS = new Set(["pl", "pr", "bl", "br", "fl", "fr", "cl", "cr", "gl", "gr", "dr", "tr", "kl", "kr"]);

export const sinTildes = (s) => String(s).replace(/[áéíóúü]/g, (c) => TILDES[c]);

/** Unidades de la palabra: { t: texto, v: es vocal }. Dígrafos juntos; la «u» muda de que/qui/gue/gui va con su consonante;
 *  la «y» es vocal al final o entre consonantes (rey, muy, y) y consonante ante vocal (yo, mayo). */
function unidades(p) {
  const u = [];
  for (let i = 0; i < p.length; i++) {
    const c = p[i], d = p[i + 1];
    if ((c === "c" && d === "h") || (c === "l" && d === "l") || (c === "r" && d === "r")) { u.push({ t: c + d, v: false }); i++; continue; }
    if ((c === "q" || c === "g") && d === "u" && "eiéí".includes(p[i + 2] ?? "-")) { u.push({ t: c + d, v: false }); i++; continue; }
    if (c === "y") { u.push({ t: c, v: !VOCALES.includes(d ?? "-") }); continue; }
    u.push({ t: c, v: VOCALES.includes(c) });
  }
  return u;
}

const fuerte = (t) => FUERTES.includes(t);
const debil = (t) => DEBILES.includes(t) || t === "y";

/** Separa en sílabas: «pelota» → ["pe", "lo", "ta"]. */
export function silabas(palabra) {
  const p = String(palabra).toLowerCase();
  const u = unidades(p);
  // Núcleos: rachas de vocales partidas en los hiatos (dos fuertes seguidas, o débil con tilde).
  const nucleos = [];                      // [inicio, fin) en u
  for (let i = 0; i < u.length;) {
    if (!u[i].v) { i++; continue; }
    let j = i + 1;
    while (j < u.length && u[j].v && !(fuerte(u[j - 1].t) && fuerte(u[j].t))) j++;
    nucleos.push([i, j]); i = j;
  }
  if (nucleos.length <= 1) return [p];
  const cortes = [];                       // índice en u donde empieza cada sílaba (salvo la primera)
  for (let k = 0; k + 1 < nucleos.length; k++) {
    const a = nucleos[k][1], b = nucleos[k + 1][0], n = b - a;   // consonantes entre núcleos: u[a..b)
    const par = (i) => TRABADOS.has(u[i].t + u[i + 1].t);
    let corte;
    if (n === 0) corte = a;                                        // hiatos: le-ón, ma-íz
    else if (n === 1) corte = a;                                   // pe-lo-ta
    else if (n === 2) corte = par(a) ? a : a + 1;                  // pla-to · ár-bol
    else if (n === 3) corte = par(b - 2) ? a + 1 : a + 2;          // hom-bre · ins-tan-te
    else corte = a + 2;                                            // ins-truc-ción
    cortes.push(corte);
  }
  const s = []; let ini = 0;
  for (const c of [...cortes, u.length]) { s.push(u.slice(ini, c).map((x) => x.t).join("")); ini = c; }
  return s;
}

/** Tipo de una sílaba: "vocal" (a), "directa" (ma), "inversa" (al), "trabada" (pla, tren) o "mixta" (sol, con). */
export function tipoSilaba(s) {
  const u = unidades(String(s).toLowerCase());
  const i = u.findIndex((x) => x.v);
  if (i < 0) return "mixta";
  let j = i; while (j < u.length && u[j].v) j++;
  const ataque = i, coda = u.length - j;
  if (ataque >= 2) return "trabada";
  if (ataque === 1) return coda ? "mixta" : "directa";
  return coda ? "inversa" : "vocal";
}

/** Tipos de sílaba que admite cada opción («Tipo de sílabas» en LENGUA_1.md); cada opción incluye las anteriores. */
export const TIPOS_SILABA = {
  directas: ["vocal", "directa"],
  inversas: ["vocal", "directa", "inversa"],
  trabadas: ["vocal", "directa", "inversa", "trabada"],
  mixtas: ["vocal", "directa", "inversa", "trabada", "mixta"],
};
/** ¿Todas las sílabas de la palabra son del nivel pedido? */
export const cabeTipo = (palabra, nivel = "mixtas") => silabas(palabra).every((s) => TIPOS_SILABA[nivel].includes(tipoSilaba(s)));

/** Índice de la sílaba tónica: la que lleva tilde; si no, aguda si acaba en consonante distinta de n, s; llana si no. */
export function tonica(palabra) {
  const s = silabas(palabra);
  const t = s.findIndex((x) => /[áéíóú]/.test(x));
  if (t >= 0) return t;
  if (s.length === 1) return 0;
  return /[aeiouns]$/.test(String(palabra).toLowerCase()) ? s.length - 2 : s.length - 1;
}
/** Aguda, llana o esdrújula (para el plural y la tilde). */
export function acentuacion(palabra) {
  const d = silabas(palabra).length - 1 - tonica(palabra);
  return d === 0 ? "aguda" : d === 1 ? "llana" : "esdrujula";
}

/** Posición (en la palabra) de la vocal tónica: la de la tilde o, en la sílaba tónica, la fuerte (o la 2.ª débil: «cuidado»). */
function vocalTonica(palabra) {
  const p = String(palabra).toLowerCase(), s = silabas(p), t = tonica(p);
  const ini = s.slice(0, t).join("").length, sil = s[t];
  let k = [...sil].findIndex((c) => "áéíóú".includes(c));
  if (k < 0) k = [...sil].findIndex((c, i) => fuerte(c) && !(c === "u" && i > 0 && "qg".includes(sil[i - 1])));
  if (k < 0) { const vs = [...sil].map((c, i) => [c, i]).filter(([c, i]) => (VOCALES.includes(c) || (c === "y" && i === sil.length - 1)) && !(c === "u" && i > 0 && "qg".includes(sil[i - 1]) && "eiéí".includes(sil[i + 1] ?? "-"))); k = vs.length ? vs[vs.length - 1][1] : 0; }
  return ini + k;
}

/** Rima: "silaba" = misma última sílaba (gato – pato); "vocal" = igual desde la vocal tónica (ratón – camión). Sin tildes. */
export function rima(palabra, modo = "vocal") {
  const p = String(palabra).toLowerCase();
  if (modo === "silaba") return sinTildes(silabas(p).at(-1));
  return sinTildes(p.slice(vocalTonica(p)));
}
export const riman = (a, b, modo = "vocal") => a !== b && rima(a, modo) === rima(b, modo);

/** Plural de un nombre o adjetivo: gato → gatos, flor → flores, pez → peces, camión → camiones, joven → jóvenes. */
const PLURAL_IRREGULAR = { jersey: "jerséis", espray: "espráis" };
export function plural(palabra) {
  const p = String(palabra).toLowerCase();
  if (PLURAL_IRREGULAR[p]) return PLURAL_IRREGULAR[p];
  if (/[tkcpbg]$/.test(p)) return p + "s";                         // robot → robots, cómic → cómics
  if (/[aeiouáéó]$/.test(p)) return p + "s";
  if (/[íú]$/.test(p)) return p + "s";                            // menú → menús, rubí → rubís (también admitido)
  if (p.endsWith("z")) return p.slice(0, -1) + "ces";
  if (/[sx]$/.test(p) && acentuacion(p) !== "aguda") return p;  // lunes, tórax
  if (p.endsWith("y")) return p + "es";                            // rey → reyes
  const ac = acentuacion(p);
  if (ac === "aguda" && /[áéíóú]/.test(p)) return sinTildeAguda(p) + "es";   // camión → camiones
  if (ac === "llana" && /n$/.test(p) && !/[áéíóú]/.test(p) && silabas(p).length > 1) {   // joven → jóvenes
    const k = vocalTonica(p); return p.slice(0, k) + PONER_TILDE[p[k]] + p.slice(k + 1) + "es";
  }
  return p + "es";
}
// La tilde de la aguda se va al ser llana (camión → camiones), salvo la de hiato (país → países).
const sinTildeAguda = (p) => p.replace(/([aeiou]?)([áéíóú])([aeiou]?)(?=[^áéíóú]*$)/, (m, a, c, b) => ("íú".includes(c) && (a || b)) ? m : a + TILDES[c] + b);

/** Artículo: definido (el, la, los, las) o indefinido (un, una, unos, unas) según género (m/f) y número. */
export function articulo(genero, { plural: pl = false, indefinido = false } = {}) {
  const f = genero === "f";
  if (indefinido) return pl ? (f ? "unas" : "unos") : (f ? "una" : "un");
  return pl ? (f ? "las" : "los") : (f ? "la" : "el");
}

/** Letras de la palabra (la «ñ» es una; «ch» y «ll» son dos, como en el abecedario actual). */
export const letras = (palabra) => [...String(palabra).toLowerCase()];
export const ABECEDARIO = [..."abcdefghijklmnñopqrstuvwxyz"];
/** ¿La palabra usa solo letras vistas? (las vocales con tilde o diéresis cuentan como su vocal). */
export function soloLetras(palabra, vistas) {
  if (!vistas) return true;
  const v = new Set([...vistas].map(sinTildes));
  return letras(sinTildes(palabra)).every((c) => v.has(c));
}
/** ¿La palabra lleva la letra? */
export const llevaLetra = (palabra, letra) => letras(sinTildes(palabra)).includes(sinTildes(letra));

/** Huecos de ortografía (orto.elige): dónde se aplica la regla y qué va. Cada hueco: { pos, largo, correcta, opciones }.
 *  Reglas: "mpb" (m antes de p y b), "r" (r / rr entre vocales y al principio), "cqu" (c / qu), "ggu" (g / gu), "cz" (c / z). */
export function huecosOrto(palabra, regla) {
  const p = String(palabra).toLowerCase(), h = [];
  for (let i = 0; i < p.length; i++) {
    const sig = p[i + 1] ?? "", ant = p[i - 1] ?? "";
    const delante = sinTildes(p[i + 2] ?? "");
    if (regla === "mpb" && (p[i] === "m" || p[i] === "n") && "pbv".includes(sig) && sig) h.push({ pos: i, largo: 1, correcta: p[i], opciones: ["m", "n"] });   // campo, enviar
    if (regla === "r") {
      if (p.startsWith("rr", i)) { h.push({ pos: i, largo: 2, correcta: "rr", opciones: ["r", "rr"] }); i++; }
      else if (p[i] === "r" && VOCALES.includes(ant) && VOCALES.includes(sig)) h.push({ pos: i, largo: 1, correcta: "r", opciones: ["r", "rr"] });
      else if (p[i] === "r" && i === 0) h.push({ pos: 0, largo: 1, correcta: "r", opciones: ["r", "rr"] });
    }
    if (regla === "cqu") {
      if (p.startsWith("qu", i)) { h.push({ pos: i, largo: 2, correcta: "qu", opciones: ["c", "qu"] }); i++; }
      else if (p[i] === "c" && "aouáóú".includes(sig) && sig) h.push({ pos: i, largo: 1, correcta: "c", opciones: ["c", "qu"] });
    }
    if (regla === "ggu") {
      if (p.startsWith("gu", i) && "ei".includes(delante) && delante) { h.push({ pos: i, largo: 2, correcta: "gu", opciones: ["g", "gu"] }); i++; }
      else if (p[i] === "g" && "aouáóú".includes(sig) && sig) h.push({ pos: i, largo: 1, correcta: "g", opciones: ["g", "gu"] });
    }
    if (regla === "cz") {
      const s = sinTildes(sig);
      if (p[i] === "z" && "aouáóú".includes(sig) && sig) h.push({ pos: i, largo: 1, correcta: "z", opciones: ["c", "z"] });
      else if (p[i] === "c" && "ei".includes(s) && s) h.push({ pos: i, largo: 1, correcta: "c", opciones: ["c", "z"] });
    }
  }
  return h;
}
export const REGLAS_ORTO = ["mpb", "r", "cqu", "ggu", "cz"];
