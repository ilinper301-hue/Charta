// Charta · ayudantes de los tipos frase.* (Lengua 1.º, lote 3; LENGUA_1.md §3, bloque 5). Sin DOM.
// Frases de 3 a 5 palabras con concordancia, hechas con el léxico y reglas.js (articulo(), plural()), y la pequeña base de lo que hace cada cosa.
//   3 palabras: artículo + nombre + verbo                      El perro ladra.
//   4 palabras: … + verbo + mucho · … + verbo + nombre          El gato duerme mucho. / La niña bebe leche. / … + es/está + adjetivo
//   5 palabras: … + verbo + un/el + nombre · … + en/a + lugar   El niño lee un cuento. / La niña juega en casa. / … + es/está + muy + adjetivo
// Cada frase: { id, tipo, n, numero: "s" | "p", palabras: [minúsculas], suj: { i, lema, g, num }, obj: { i, lema, g, num, distr } | null, verbo, universal }
//   (suj.i y obj.i = posición de esa palabra; obj solo si la frase admite «completa» con el complemento: come, bebe, lee).
// Todo sale de BANCO (abajo): un animal solo hace lo que se anota, así que la frase siempre tiene sentido. Los femeninos con «a»/«ha» tónica
// (el agua) no entran. Las frases empiezan siempre por el artículo (El, La, Los, Las), nunca por «I».
import { LEXICO } from "../lengua/lexico.js";
import { articulo, plural, tonica } from "../lengua/reglas.js";

const ENT = new Map(LEXICO.map((e) => [e.p, e]));
const gen = (lema) => {
  const e = ENT.get(lema);
  if (!e || e.c !== "n" || !(e.g === "m" || e.g === "f")) throw new Error(`_frase.js: «${lema}» no es un nombre del léxico con género.`);
  if (e.g === "f" && /^h?[aá]/.test(lema) && tonica(lema) === 0) throw new Error(`_frase.js: «${lema}» es femenino con «a» tónica (el agua): no entra.`);
  return e.g;
};

// ---------------------------------------------------------------- verbos (3.ª persona del singular → infinitivo; el plural es la forma + «n»)
export const VERBOS = {
  duerme: "dormir", salta: "saltar", corre: "correr", trepa: "trepar", maúlla: "maullar", ladra: "ladrar", nada: "nadar", vuela: "volar", camina: "caminar",
  come: "comer", bebe: "beber", lee: "leer", canta: "cantar", baila: "bailar", juega: "jugar", dibuja: "dibujar", pinta: "pintar", escribe: "escribir",
  habla: "hablar", cocina: "cocinar", hace: "hacer", abre: "abrir", cierra: "cerrar", lava: "lavar", riega: "regar", limpia: "limpiar", planta: "plantar",
  pesca: "pescar", toca: "tocar", conduce: "conducir", lleva: "llevar", coge: "coger", tira: "tirar", lanza: "lanzar", va: "ir", llega: "llegar", estudia: "estudiar",
};

/** Verbos que admiten «mucho» detrás («El gato duerme mucho»). */
const MUCHO = new Set("duerme come corre ladra juega canta baila camina nada".split(" "));

// ---------------------------------------------------------------- adjetivos (forma masculina singular; se concuerdan con formaAdj)
export const ADJETIVOS = "contento cansado alegre enfadado dormido despierto asustado sorprendido alto bajo listo simpático amable valiente divertido tranquilo grande pequeño rápido lento fuerte blanco verde amarillo rojo azul caliente".split(" ");
/** Adjetivo concordado con el género (m/f) y el número ("s"/"p") del nombre: contento → contenta, contentos; verde → verdes; feliz → felices. */
export function formaAdj(base, g, num) {
  let f = base;
  if (g === "f" && /o$/.test(f)) f = f.slice(0, -1) + "a";
  return num === "p" ? plural(f) : f;
}

// ---------------------------------------------------------------- BANCO: qué hace cada sujeto
// s = nombre · i = verbos sin complemento · ob = [verbo, nombre, "*" si va en plural] (sin artículo: «come pan») · od = [verbo, "un"|"el", nombre, "*"] («lee un cuento»)
// lug = [verbo, preposición, lugar] · ser = adjetivos que siempre le valen · est = adjetivos con «está» · serP = con «es» (personas) · muy = adjetivos con «muy»
// distr: el complemento admite «completa» con ese verbo (lo comible, lo leíble…: las distractoras son objetos que no sirven).
const LISTA = (t) => t.split(" ").filter(Boolean);
const OB = (t) => LISTA(t).map((x) => { const [v, n] = x.split(":"); return n.endsWith("*") ? [v, n.slice(0, -1), "*"] : [v, n]; });
const OD = (t) => LISTA(t).map((x) => { const [v, a, n] = x.split(":"); return n.endsWith("*") ? [v, a, n.slice(0, -1), "*"] : [v, a, n]; });
const LUG = (t) => LISTA(t).map((x) => x.split(":"));
const S = (s, o) => ({ s, i: [], ob: [], od: [], lug: [], ser: [], est: [], serP: [], muy: [], ...o });

const NIÑOS_I = "salta corre canta baila juega lee dibuja pinta camina duerme escribe nada";
const NIÑOS_OB = "come:pan come:fruta come:queso come:pasta come:sopa come:arroz bebe:leche bebe:zumo lee:cuento* lee:libro*";
const NIÑOS_OD = "come:un:plátano come:una:manzana come:un:helado come:una:galleta lee:un:libro lee:un:cuento dibuja:una:casa dibuja:una:flor dibuja:un:sol pinta:un:cuadro pinta:una:flor abre:la:puerta cierra:la:ventana coge:la:pelota tira:la:pelota lanza:la:pelota";
const NIÑOS_LUG = "duerme:en:casa juega:en:casa come:en:casa lee:en:casa estudia:en:casa lee:en:clase escribe:en:clase canta:en:clase juega:en:clase va:a:casa va:a:clase llega:a:casa llega:a:clase";
const NIÑOS_EST = "contento cansado alegre enfadado dormido despierto asustado sorprendido";
const NIÑOS_SERP = "alto bajo listo simpático amable valiente divertido tranquilo";
const NIÑOS_MUY = "alto listo simpático contento cansado alegre valiente amable";

const NIÑO = (s) => S(s, { i: LISTA(NIÑOS_I), ob: OB(NIÑOS_OB), od: OD(NIÑOS_OD), lug: LUG(NIÑOS_LUG), est: LISTA(NIÑOS_EST), serP: LISTA(NIÑOS_SERP), muy: LISTA(NIÑOS_MUY) });

export const BANCO = [
  // personas
  ...["niño", "niña", "hermano", "hermana", "amigo", "amiga"].map(NIÑO),
  S("madre", { i: LISTA("canta camina duerme lee cocina"), ob: OB("cocina:sopa cocina:pasta cocina:arroz bebe:leche lee:cuento*"), od: OD("lee:un:libro abre:la:puerta lava:el:plato limpia:la:ventana riega:las:planta* pinta:la:pared"), lug: LUG("cocina:en:casa duerme:en:casa lee:en:casa"), est: LISTA("contento cansado alegre tranquilo"), serP: LISTA("amable simpático fuerte tranquilo"), muy: LISTA("contento cansado alegre amable") }),
  S("padre", { i: LISTA("canta camina duerme lee cocina"), ob: OB("cocina:sopa cocina:pasta cocina:arroz bebe:zumo lee:cuento*"), od: OD("lee:un:libro abre:la:puerta lava:el:coche limpia:la:ventana riega:las:planta* pinta:la:pared"), lug: LUG("cocina:en:casa duerme:en:casa lee:en:casa"), est: LISTA("contento cansado alegre tranquilo"), serP: LISTA("amable simpático fuerte tranquilo"), muy: LISTA("contento cansado alegre amable") }),
  S("abuela", { i: LISTA("camina duerme lee canta"), ob: OB("come:sopa come:fruta bebe:leche lee:libro*"), od: OD("lee:un:cuento lee:un:libro riega:las:planta* abre:la:puerta"), lug: LUG("duerme:en:casa lee:en:casa come:en:casa"), est: LISTA("contento cansado alegre tranquilo"), serP: LISTA("amable simpático tranquilo"), muy: LISTA("contento cansado alegre amable") }),
  S("abuelo", { i: LISTA("camina duerme lee canta"), ob: OB("come:sopa come:fruta bebe:leche lee:libro*"), od: OD("lee:un:cuento lee:un:libro riega:las:planta* abre:la:puerta"), lug: LUG("duerme:en:casa lee:en:casa come:en:casa"), est: LISTA("contento cansado alegre tranquilo"), serP: LISTA("amable simpático tranquilo"), muy: LISTA("contento cansado alegre amable") }),
  ...["maestro", "maestra"].map((s) => S(s, { i: LISTA("lee escribe habla canta dibuja"), ob: OB("escribe:frase* lee:cuento*"), od: OD("lee:un:cuento lee:un:libro abre:la:puerta pinta:un:cuadro"), lug: LUG("habla:en:clase lee:en:clase canta:en:clase escribe:en:clase"), est: LISTA("contento cansado alegre"), serP: LISTA("amable simpático listo"), muy: LISTA("contento amable simpático listo") })),
  S("panadero", { od: OD("lleva:el:pan"), ob: OB("hace:pan"), lug: LUG("cocina:en:casa") }),
  S("cocinero", { ob: OB("cocina:sopa cocina:pasta cocina:arroz"), od: OD("hace:una:tarta hace:una:sopa") }),
  S("cocinera", { ob: OB("cocina:sopa cocina:pasta cocina:arroz"), od: OD("hace:una:tarta hace:una:sopa") }),
  S("cartero", { ob: OB("lleva:carta*"), od: OD("lleva:una:carta") }),
  S("jardinero", { ob: OB("planta:flor*"), od: OD("riega:las:planta* planta:un:pino") }),
  S("pintor", { od: OD("pinta:un:cuadro pinta:una:pared") }),
  S("granjero", { od: OD("riega:las:planta*") }),
  S("pescador", { ob: OB("pesca:pez*"), od: OD("pesca:un:pez") }),
  S("músico", { od: OD("toca:el:piano toca:la:guitarra toca:el:tambor"), i: LISTA("canta") }),
  S("bombero", { od: OD("conduce:un:camión") }),
  S("conductor", { od: OD("conduce:un:autobús conduce:un:camión") }),
  // animales
  S("gato", { i: LISTA("duerme salta corre trepa maúlla camina"), ob: OB("come:pescado bebe:leche"), od: OD("come:un:pez"), lug: LUG("duerme:en:casa juega:en:casa come:en:casa"), ser: [], est: LISTA("contento cansado dormido asustado"), muy: LISTA("contento cansado asustado") }),
  S("perro", { i: LISTA("ladra corre salta duerme camina nada"), ob: OB("come:carne bebe:leche"), od: OD("come:un:hueso"), lug: LUG("duerme:en:casa juega:en:casa come:en:casa va:a:casa"), est: LISTA("contento cansado dormido asustado"), muy: LISTA("contento cansado asustado") }),
  S("pato", { i: LISTA("nada camina vuela"), ob: OB("come:pan") }),
  S("pez", { i: LISTA("nada") }),
  S("vaca", { i: LISTA("camina duerme"), ob: OB("come:hierba"), ser: [] }),
  S("cerdo", { i: LISTA("camina duerme"), ob: OB("come:fruta come:pan") }),
  S("caballo", { i: LISTA("corre salta camina duerme"), ob: OB("come:hierba"), ser: LISTA("rápido fuerte"), muy: LISTA("rápido fuerte") }),
  S("oveja", { i: LISTA("camina duerme"), ob: OB("come:hierba") }),
  S("gallina", { i: LISTA("camina"), ob: OB("come:semilla*") }),
  S("conejo", { i: LISTA("salta corre duerme"), ob: OB("come:zanahoria*") }),
  S("ratón", { i: LISTA("corre salta"), ob: OB("come:queso") }),
  S("mono", { i: LISTA("salta trepa"), ob: OB("come:plátano*"), od: OD("come:un:plátano") }),
  S("oso", { i: LISTA("duerme camina nada"), ob: OB("come:pescado"), ser: LISTA("grande fuerte"), muy: LISTA("grande fuerte") }),
  S("león", { i: LISTA("duerme corre camina"), ob: OB("come:carne"), ser: LISTA("fuerte"), muy: LISTA("fuerte") }),
  S("tigre", { i: LISTA("corre salta"), ob: OB("come:carne"), ser: LISTA("fuerte"), muy: LISTA("fuerte") }),
  S("elefante", { i: LISTA("camina nada"), ob: OB("come:fruta"), ser: LISTA("grande fuerte"), muy: LISTA("grande fuerte") }),
  S("jirafa", { i: LISTA("camina"), ob: OB("come:hoja*"), ser: LISTA("alta"), muy: LISTA("alta") }),
  S("pájaro", { i: LISTA("vuela canta"), ob: OB("come:semilla*") }),
  S("mariposa", { i: LISTA("vuela") }),
  S("abeja", { i: LISTA("vuela") }),
  S("araña", { i: LISTA("camina trepa") }),
  S("rana", { i: LISTA("salta nada") }),
  S("tortuga", { i: LISTA("camina nada"), ob: OB("come:lechuga*"), ser: LISTA("lenta"), muy: LISTA("lenta") }),
  S("lobo", { i: LISTA("corre") }),
  S("zorro", { i: LISTA("corre") }),
  S("hormiga", { i: LISTA("camina"), ser: LISTA("pequeña"), muy: LISTA("pequeña") }),
  S("delfín", { i: LISTA("nada salta") }),
  S("pingüino", { i: LISTA("nada camina") }),
  S("canguro", { i: LISTA("salta") }),
  S("gallo", { i: LISTA("canta") }),
  // cosas (solo con «es»; siempre verdad)
  S("nieve", { ser: LISTA("blanca") }),
  S("hierba", { ser: LISTA("verde") }),
  S("fuego", { ser: LISTA("caliente") }),
  S("limón", { ser: LISTA("amarillo") }),
  S("plátano", { ser: LISTA("amarillo") }),
  S("fresa", { ser: LISTA("roja") }),
  S("tomate", { ser: LISTA("rojo") }),
  S("cielo", { ser: LISTA("azul") }),
];
// Los adjetivos de BANCO.ser se anotan ya concordados con un nombre de uno u otro género; se dejan en la forma masculina:
for (const s of BANCO) { s.ser = s.ser.map(baseAdj); s.muy = s.muy.map(baseAdj); }
function baseAdj(a) { return /a$/.test(a) && ADJETIVOS.includes(a.slice(0, -1) + "o") ? a.slice(0, -1) + "o" : a; }

/** Nombres que no hacen nada (distractoras de «completa», falsedades de «verdad»): objetos inertes. */
export const INERTES = "mesa silla cama lámpara zapato lápiz armario sofá espejo".split(" ");

// ---------------------------------------------------------------- frases
const art = (g, num, indef = false) => articulo(g, { plural: num === "p", indefinido: indef });
const sust = (lema, num) => (num === "p" ? plural(lema) : lema);
const vb = (v, num) => (num === "p" ? v + "n" : v);
const DISTR = { come: "inerte", bebe: "inerte", lee: "inerte" };

function mkFrase(tipo, palabras, s, num, extra = {}) {
  return { id: palabras.join(" "), tipo, n: palabras.length, numero: num, palabras, suj: { i: 1, lema: s.s, g: gen(s.s), num }, obj: null, verbo: null, universal: false, ...extra };
}

function construir() {
  const out = [];
  for (const s of BANCO) for (const num of ["s", "p"]) {
    const g = gen(s.s), base = [art(g, num), sust(s.s, num)], V = (v) => vb(v, num), ser = num === "p" ? "son" : "es", esta = num === "p" ? "están" : "está";
    for (const v of s.i) {
      out.push(mkFrase("i", [...base, V(v)], s, num, { verbo: VERBOS[v], universal: true }));
      if (MUCHO.has(v)) out.push(mkFrase("im", [...base, V(v), "mucho"], s, num, { verbo: VERBOS[v] }));
    }
    for (const [v, n, pl] of s.ob) {
      const gn = gen(n), nn = pl ? "p" : "s", w = [...base, V(v), sust(n, nn)];
      out.push(mkFrase("ob", w, s, num, { verbo: VERBOS[v], universal: true, obj: DISTR[v] ? { i: 3, lema: n, g: gn, num: nn, distr: DISTR[v], art: null } : null }));
    }
    for (const [v, a, n, pl] of s.od) {
      const gn = gen(n), nn = pl ? "p" : "s", w = [...base, V(v), art(gn, nn, a === "un" || a === "una"), sust(n, nn)];
      out.push(mkFrase("od", w, s, num, { verbo: VERBOS[v], universal: true, obj: DISTR[v] ? { i: 4, lema: n, g: gn, num: nn, distr: DISTR[v], art: w[3] } : null }));
    }
    for (const [v, p, l] of s.lug) out.push(mkFrase("lug", [...base, V(v), p, l], s, num, { verbo: VERBOS[v] }));
    for (const a of s.ser) {
      out.push(mkFrase("ser", [...base, ser, formaAdj(a, g, num)], s, num, { verbo: "ser", adj: a, universal: true }));
      if (s.muy.includes(a)) out.push(mkFrase("serm", [...base, ser, "muy", formaAdj(a, g, num)], s, num, { verbo: "ser", adj: a }));
    }
    for (const a of s.serP) {
      out.push(mkFrase("ser", [...base, ser, formaAdj(a, g, num)], s, num, { verbo: "ser", adj: a }));
      if (s.muy.includes(a)) out.push(mkFrase("serm", [...base, ser, "muy", formaAdj(a, g, num)], s, num, { verbo: "ser", adj: a }));
    }
    for (const a of s.est) {
      out.push(mkFrase("est", [...base, esta, formaAdj(a, g, num)], s, num, { verbo: "estar", adj: a }));
      if (s.muy.includes(a)) out.push(mkFrase("estm", [...base, esta, "muy", formaAdj(a, g, num)], s, num, { verbo: "estar", adj: a }));
    }
  }
  const vistas = new Set();
  return out.filter((f) => !vistas.has(f.id) && vistas.add(f.id)).filter((f) => f.n >= 3 && f.n <= 5);
}
let memo = null;
/** Todas las frases posibles (singular y plural), sin repetir. No modificar: se comparte. */
export function todasFrases() { return (memo ??= construir()); }
const memoPorId = new Map();
export function frasePorId(id) {
  if (!memoPorId.size) for (const f of todasFrases()) memoPorId.set(f.id, f);
  return memoPorId.get(id) || null;
}

/** Texto de la frase tal como se escribe: «El gato come pan.» */
export const textoFrase = (palabras) => { const t = palabras.join(" "); return t[0].toUpperCase() + t.slice(1) + "."; };
/** Aplica «Letra»: null = como se escribe (Mayúscula inicial) · "mayus" = TODO EN MAYÚSCULAS. */
export const frAlCaso = (t, caso) => (caso === "mayus" ? t.toUpperCase() : t);

// ---------------------------------------------------------------- elegir frases
/** Secuencia de largos (nº de palabras) para n frases: un número fijo o variadas (3, 4 y 5 a partes iguales, barajadas). */
export function largosFrase(azar, n, palabras) {
  if (Number.isInteger(palabras)) return Array(n).fill(palabras);
  const l = []; for (let i = 0; i < n; i++) l.push(3 + (i % 3));
  return azar.barajar(l);
}

/**
 * Elige n frases distintas con esos largos. filtro(f) → falso para descartar; ya = Set de ids ya usados y sujetos = Set de sujetos ya usados (se actualizan).
 * Prefiere sujetos nuevos y deja ~1/3 en plural. Error con «necesita» si no hay bastantes.
 */
export function elegirFrases(azar, largos, { filtro = null, id = "frase", ya = new Set(), sujetos = new Set() } = {}) {
  const out = [];
  const porLargo = new Map();
  for (const l of new Set(largos)) porLargo.set(l, todasFrases().filter((f) => f.n === l && (!filtro || filtro(f))));
  for (const l of largos) {
    const libres = porLargo.get(l).filter((f) => !ya.has(f.id));
    if (!libres.length) throw new Error(`«${id}» necesita más frases: con esas opciones solo hay ${out.length} y hacen falta ${largos.length}. Prueba con frases de otro largo.`);
    const num = azar.entero(1, 3) === 1 ? "p" : "s";
    let pool = libres.filter((f) => f.numero === num); if (!pool.length) pool = libres;
    const nuevos = pool.filter((f) => !sujetos.has(f.suj.lema)); if (nuevos.length) pool = nuevos;
    const f = azar.elegir(pool);
    ya.add(f.id); sujetos.add(f.suj.lema); out.push(f);
  }
  return out;
}

// ---------------------------------------------------------------- orden único (ordena)
let VALIDAS = null;
/** Textos de todas las frases del banco (en orden normal). */
const validas = () => (VALIDAS ??= new Set(todasFrases().map((f) => f.id)));
const permutaciones = (l) => (l.length <= 1 ? [l] : l.flatMap((x, i) => permutaciones([...l.slice(0, i), ...l.slice(i + 1)]).map((r) => [x, ...r])));
const memoUnico = new Map();
/**
 * ¿La frase solo se puede ordenar de una manera? Ningún otro orden de sus palabras es otra frase del banco
 * (p. ej. «El niño lee un libro» ↔ «Un niño lee el libro» no existe porque los artículos no se mezclan).
 * Con la primera palabra marcada (mayúscula) solo cuentan los órdenes que empiezan por ella.
 */
export function ordenUnico(f, marcada = true) {
  const clave = f.id + (marcada ? "|m" : "");
  if (!memoUnico.has(clave)) {
    const V = validas();
    memoUnico.set(clave, !permutaciones(f.palabras).some((p) => { const t = p.join(" "); return t !== f.id && (!marcada || p[0] === f.palabras[0]) && V.has(t); }));
  }
  return memoUnico.get(clave);
}
/** Baraja las palabras hasta que no queden en el orden correcto (con la primera fija si `fija`). */
export function desordenar(azar, palabras, fija = false) {
  const resto = fija ? palabras.slice(1) : palabras.slice();
  const igual = (a, b) => a.join(" ").toLowerCase() === b.join(" ").toLowerCase();
  for (let k = 0; k < 20; k++) {
    const b = azar.barajar(resto);
    if (!igual(b, resto)) return fija ? [palabras[0], ...b] : b;
  }
  // todas las palabras iguales (imposible aquí): dar la vuelta
  return fija ? [palabras[0], ...resto.slice().reverse()] : resto.slice().reverse();
}

// ---------------------------------------------------------------- separar sin cortar «ll», «rr», «ch», «qu», «gu»
const UNIDADES = /ch|ll|rr|qu|gu(?=[eéií])|./gi;
/** ¿Los cortes entre palabras caen entre unidades de letra (no dentro de «ll», «rr»…)? */
export function cortesLimpios(palabras) {
  const finales = new Set(); let pos = 0;
  for (const u of palabras.join("").match(UNIDADES)) { pos += u.length; finales.add(pos); }
  let c = 0;
  for (const w of palabras.slice(0, -1)) { c += w.length; if (!finales.has(c)) return false; }
  return true;
}

// ---------------------------------------------------------------- «completa»: distractoras
/** Dos nombres inertes que no encajan, del mismo género y número que `g`/`num` (o de cualquiera si g es null). Sin repetir `excluir`. */
export function distractoras(azar, g, num, excluir = []) {
  const ok = INERTES.filter((n) => (g === null || gen(n) === g) && !excluir.includes(n));
  if (ok.length < 2) throw new Error("_frase.js necesita más nombres inertes para las distractoras.");
  return azar.muestra(ok, 2).map((n) => sust(n, num));
}

// ---------------------------------------------------------------- «verdad»: la base de lo que sí y lo que no
// IMPOSIBLE: verbo (3.ª persona) → sujetos que seguro no lo hacen. FALSO_SER: [sujeto, adjetivo] que seguro no es.
const IMPOSIBLE = {
  vuela: LISTA("vaca cerdo caballo oveja perro gato conejo elefante jirafa oso león tigre tortuga ratón mono mesa silla niño niña"),
  ladra: LISTA("gato vaca pez pato cerdo caballo pájaro mesa silla"),
  maúlla: LISTA("perro vaca pez pato cerdo caballo"),
  habla: LISTA("perro gato pez vaca cerdo caballo mesa silla"),
  canta: LISTA("pez mesa silla lápiz puerta cama"),
  corre: LISTA("pez mesa silla puerta cama armario"),
  salta: LISTA("mesa silla puerta cama armario sofá"),
  duerme: LISTA("mesa silla lápiz puerta zapato"),
  escribe: LISTA("perro gato pez vaca"),
};
const FALSO_SER = [["hormiga", "grande"], ["elefante", "pequeño"], ["jirafa", "bajo"], ["hierba", "rojo"], ["hierba", "azul"], ["nieve", "negro"], ["nieve", "verde"], ["limón", "azul"], ["fresa", "azul"], ["tomate", "azul"], ["cielo", "verde"], ["plátano", "azul"]];
/** Cosas que no se comen ni se beben (para «El gato come una silla»). */
export const NO_COMIBLE = [...INERTES, "puerta", "ventana"];
const ANIMALES_V = LISTA("gato perro vaca cerdo caballo conejo oso mono ratón oveja");

function construirVerdad() {
  const out = [], mk = (palabras, s, num, verdad, extra = {}) => ({ id: palabras.join(" "), n: palabras.length, numero: num, palabras, verdad, suj: s, ...extra });
  const nums = ["s", "p"];
  for (const f of todasFrases()) if (["i", "ob", "od", "ser"].includes(f.tipo) && f.universal) out.push({ id: f.id, n: f.n, numero: f.numero, palabras: f.palabras, verdad: true, suj: f.suj.lema });
  for (const [v, ss] of Object.entries(IMPOSIBLE)) for (const s of ss) for (const num of nums) {
    out.push(mk([art(gen(s), num), sust(s, num), vb(v, num)], s, num, false));
  }
  for (const [s, a] of FALSO_SER) for (const num of nums) out.push(mk([art(gen(s), num), sust(s, num), num === "p" ? "son" : "es", formaAdj(a, gen(s), num)], s, num, false));
  // animales que «comen» lo que no se come, o «leen»
  for (const s of ANIMALES_V) for (const n of NO_COMIBLE) for (const num of nums) {
    const nn = "s", gn = gen(n);
    for (const v of ["come", "bebe"]) out.push(mk([art(gen(s), num), sust(s, num), vb(v, num), art(gn, nn, true), n], s, num, false, { falso: [v, n] }));
  }
  for (const s of LISTA("gato perro vaca pez cerdo caballo")) for (const n of ["libro", "cuento"]) for (const num of nums) out.push(mk([art(gen(s), num), sust(s, num), vb("lee", num), art(gen(n), "s", true), n], s, num, false));
  const vistas = new Set();
  return out.filter((f) => !vistas.has(f.id) && vistas.add(f.id));
}
let memoV = null;
/** Hechos para «¿Sí o no?»: { id, n, numero, palabras, verdad, suj }. */
export const hechosVerdad = () => (memoV ??= construirVerdad());

/** n hechos mezclados, mitad verdaderos y mitad falsos (n par), sin repetir ni sujeto (mientras haya de otros). */
export function elegirVerdades(azar, n, { id = "frase.verdad" } = {}) {
  const todos = hechosVerdad(), usados = new Set(), sujetos = new Map(), out = [];
  const largos = (k) => { const l = []; for (let i = 0; i < k; i++) l.push(3 + (i % 3)); return azar.barajar(l); };
  for (const verdad of [true, false]) {
    for (const l of largos(n / 2)) {
      const libres = todos.filter((h) => h.verdad === verdad && h.n === l && !usados.has(h.id));
      if (!libres.length) throw new Error(`«${id}» necesita más frases de ${l} palabras (${verdad ? "verdaderas" : "falsas"}).`);
      const num = azar.entero(1, 3) === 1 ? "p" : "s";
      let pool = libres.filter((h) => h.numero === num); if (!pool.length) pool = libres;
      const nuevos = pool.filter((h) => !(sujetos.get(h.suj) >= 1)); if (nuevos.length) pool = nuevos;
      const h = azar.elegir(pool); usados.add(h.id); sujetos.set(h.suj, (sujetos.get(h.suj) || 0) + 1); out.push(h);
    }
  }
  let mezcla = azar.barajar(out);
  for (let k = 0; k < 30 && /^(t+f+|f+t+)$/.test(mezcla.map((h) => (h.verdad ? "t" : "f")).join("")); k++) mezcla = azar.barajar(out);   // mezcladas, no por bloques
  return mezcla;
}
