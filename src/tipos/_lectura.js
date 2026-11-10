// Charta · ayudantes de los tipos lectura.* (Lengua 1.º, lote 5; LENGUA_1.md §3, bloque 7). Sin DOM.
// Todo el texto sale del léxico de 1.º (las formas: nombres y adjetivos con género y número, verbos en infinitivo o 3.ª persona) más palabras gramaticales
// (artículos, «en», «de», «por», «qué», «dónde»…). Nunca empieza una palabra de lectura por «I» mayúscula.
//   · TEXTO: crearTexto(azar, nivel) → { frases: [tokens], hechos: [{ kind, vals }] } y preguntas(): elegir entre 3, sí/no y completar, de solución única.
//   · SECUENCIAS (📚 banco de ~35 secuencias de 3–4 frases con orden inequívoco) y ADIVINANZAS (📚 banco de ~45, originales).
//   · INSTRUCCIONES: figuras (círculo, estrella, cuadrado, triángulo), tamaños y colores; figura(p, …) las dibuja.
//   · Dibujo: envolver()/ajustaLineas() para repartir un texto en líneas.
import { LEXICO } from "../lengua/lexico.js";
import { articulo } from "../lengua/reglas.js";
import { formaAdj } from "./_frase.js";
import { permitida, filtrarVistas, avisoVistas } from "../lengua/vistas.js";

const fv = (l) => filtrarVistas(l);   // sin letras elegidas devuelve la misma lista

const ENT = new Map(LEXICO.map((e) => [e.p, e]));
export const gen = (n) => {
  const e = ENT.get(n);
  if (!e || e.c !== "n" || !(e.g === "m" || e.g === "f")) throw new Error(`_lectura.js: «${n}» no es un nombre del léxico con género.`);
  return e.g;
};
const def = (n) => articulo(gen(n), {});
const indef = (n) => articulo(gen(n), { indefinido: true });
const adj = (a, n) => formaAdj(a, gen(n), "s");
export const cap = (t) => (t ? t[0].toUpperCase() + t.slice(1) : t);
/** Aplica «Letra»: null = como se escribe · "mayus" = TODO EN MAYÚSCULAS. */
export const alCaso = (t, caso) => (caso === "mayus" ? t.toUpperCase() : t);

// ---------------------------------------------------------------- dibujo: texto en líneas
/** Reparte el texto en líneas que caben en w (palabra a palabra). */
export function envolver(p, texto, w, fs, f = "PB") {
  const lineas = []; let l = "";
  for (const t of texto.split(" ")) {
    const c = l ? l + " " + t : t;
    if (l && p.ancho(c, f, fs) > w) { lineas.push(l); l = t; } else l = c;
  }
  if (l) lineas.push(l);
  return lineas;
}
/** Mayor tamaño de letra (de fs a min) con el que el texto cabe en w en no más de maxLineas líneas → { fs, lineas }. */
export function ajustaLineas(p, texto, w, fs, maxLineas, min = 14, f = "PB") {
  let q = fs, l = envolver(p, texto, w, q, f);
  while (q > min && l.length > maxLineas) { q -= 1; l = envolver(p, texto, w, q, f); }
  return { fs: q, lineas: l };
}
/** Dibuja líneas centradas en vertical en la caja (x, y, w, h); interlineado k·fs. Devuelve el alto usado. */
export function parrafo(p, x, y, h, lineas, fs, { k = 1.4, anchor = "start", gris } = {}) {
  const lh = fs * k, alto = lh * lineas.length, top = y + h / 2 + alto / 2;
  lineas.forEach((t, i) => p.text(x, top - lh * (i + 0.5) - fs * 0.35, t, fs, { f: "PB", anchor, ...(gris !== undefined && { gris }) }));
  return alto;
}

// ================================================================ TEXTO: personajes, mascotas, lugares, colores, comidas, acciones
export const PERSONAJES = "niño niña hermano hermana amigo amiga".split(" ");
const COL4 = "rojo azul verde amarillo".split(" ");
export const COLORES = "rojo azul verde amarillo negro blanco gris marrón morado".split(" ");
/** Mascotas: colores que tienen sentido y qué comen. */
export const MASCOTAS = {
  gato: { colores: "negro blanco gris marrón".split(" "), come: "pescado carne queso".split(" "), verbos: "juega corre salta camina".split(" ") },
  perro: { colores: "negro blanco marrón gris".split(" "), come: "carne pan galletas".split(" "), verbos: "juega corre salta camina".split(" ") },
  conejo: { colores: "blanco gris marrón negro".split(" "), come: "zanahorias lechuga hierba".split(" "), verbos: "juega corre salta camina".split(" ") },
  pájaro: { colores: "azul amarillo verde rojo".split(" "), come: "semillas fruta pan".split(" "), verbos: "juega salta camina vuela".split(" ") },
  tortuga: { colores: "verde marrón gris".split(" "), come: "lechuga fruta hierba".split(" "), verbos: "juega camina nada".split(" ") },
  hámster: { colores: "marrón blanco gris negro".split(" "), come: "semillas fruta zanahorias".split(" "), verbos: "juega corre salta camina".split(" ") },
};
export const PRENDAS = "camiseta jersey gorro gorra chaqueta bufanda vestido falda pantalón".split(" ");
export const JUGUETES = "pelota globo bicicleta patinete peluche tambor muñeco puzle".split(" ");
export const COMIDAS = "pescado carne pan queso fruta lechuga arroz pasta sopa galletas hierba semillas zanahorias".split(" ");
export const ESTADOS = "contento cansado alegre dormido asustado despierto".split(" ");
export const MOMENTOS = "mañana tarde noche".split(" ");
export const LUGARES = { casa: "en casa", jardín: "en el jardín", parque: "en el parque", patio: "en el patio", campo: "en el campo", playa: "en la playa", granja: "en la granja" };
/** Verbo → lugares donde tiene sentido. */
export const VERBO_LUGAR = {
  juega: "casa jardín parque patio campo playa granja".split(" "),
  corre: "jardín parque patio campo playa".split(" "),
  salta: "jardín parque patio campo".split(" "),
  camina: "jardín parque campo playa granja".split(" "),
  vuela: "jardín parque campo playa".split(" "),
  nada: ["playa"],
  duerme: ["casa"],
};
/** Verbos de las personas con lugar («El niño corre en el parque»). */
const VERBOS_LUGAR_PERSONA = "juega corre salta camina".split(" ");
export const VERBOS_PERSONA = "canta baila lee dibuja pinta salta corre escribe camina".split(" ");

// Cada constructor da { t: tokens (minúscula; «tarde,» lleva la coma pegada), idx: posición de cada hueco posible }.
const CONSTRUCTORES = {
  poseer: (v) => ({ t: [def(v.suj), v.suj, v.verbo, indef(v.item), v.item, adj(v.color, v.item)], idx: { item: 4, color: 5 } }),
  comida: (v) => ({ t: [def(v.suj), v.suj, "come", v.comida], idx: { comida: 3 } }),
  lugar: (v) => {
    const pre = v.momento ? ["por", "la", v.momento + ","] : [], sp = LUGARES[v.lugar].split(" "), t = [...pre, def(v.suj), v.suj, v.verbo, ...sp], o = pre.length;
    return { t, idx: { verbo: o + 2, lugar: t.length - 1, ...(v.momento && { momento: 2 }) } };
  },
  estado: (v) => ({ t: [def(v.suj), v.suj, "está", adj(v.estado, v.suj)], idx: { estado: 3 } }),
  accion: (v) => ({ t: [def(v.suj), v.suj, v.verbo], idx: { verbo: 2 } }),
};
/** Huecos preguntables de cada tipo de frase. */
const HUECOS = { poseer: ["item", "color"], comida: ["comida"], lugar: ["lugar", "verbo"], estado: ["estado"], accion: ["verbo"] };

export const textoDe = (tokens) => cap(tokens.join(" ")) + ".";
/** Palabras de una frase en tokens (sin las comas pegadas). */
export const palabrasToken = (tokens) => tokens.join(" ").replace(/,/g, "").split(" ");

/**
 * Texto de nivel 1 (2 frases), 2 (4 frases) o 3 (cuento corto, 6 frases).
 * Devuelve { hechos: [{ kind, vals, t, idx }] } (una frase por hecho). Cada categoría (animal, color de cada cosa, comida, lugar, estado…) sale una sola vez, así que
 * cada pregunta tiene una sola respuesta.
 */
export function crearTexto(azar, nivel) {
  const lugaresDe = (v) => filtrarVistas(VERBO_LUGAR[v], (l) => LUGARES[l]);
  const verbosOk = (vs) => filtrarVistas(vs).filter((v) => lugaresDe(v).length);
  const mascotas = Object.keys(MASCOTAS).filter((k) => permitida(k) && fv(MASCOTAS[k].colores).length && fv(MASCOTAS[k].come).length && verbosOk(MASCOTAS[k].verbos).length);
  if (!mascotas.length || !fv(PERSONAJES).length) throw new Error("«lectura.texto» necesita más letras para montar el texto." + avisoVistas());
  const persona = azar.elegir(fv(PERSONAJES)), mascota = azar.elegir(mascotas), M = MASCOTAS[mascota];
  const color = azar.elegir(fv(M.colores)), verbo = azar.elegir(verbosOk(M.verbos)), lugar = azar.elegir(lugaresDe(verbo));
  const tieneMascota = { kind: "poseer", vals: { suj: persona, verbo: "tiene", item: mascota, color, tipo: "mascota" } };
  const lugarMascota = (momento) => ({ kind: "lugar", vals: { suj: mascota, verbo, lugar, ...(momento && { momento }) } });
  const comida = { kind: "comida", vals: { suj: mascota, comida: azar.elegir(fv(M.come)) } };
  const estado = { kind: "estado", vals: { suj: mascota, estado: azar.elegir(fv(ESTADOS)) } };
  const ropa = (colorPrenda) => ({ kind: "poseer", vals: { suj: persona, verbo: "lleva", item: azar.elegir(fv(PRENDAS)), color: colorPrenda, tipo: "ropa" } });
  let hechos;
  if (nivel === 1) {
    const v = azar.entero(1, 4);
    if (v === 1) hechos = [tieneMascota, comida];
    else if (v === 2) hechos = [tieneMascota, lugarMascota()];
    else if (v === 3) hechos = [tieneMascota, estado];
    else {
      const verboP = azar.elegir(verbosOk(VERBOS_LUGAR_PERSONA)), lugarP = azar.elegir(lugaresDe(verboP));
      hechos = [ropa(azar.elegir(fv(COLORES))), { kind: "lugar", vals: { suj: persona, verbo: verboP, lugar: lugarP } }];
    }
  } else if (nivel === 2) hechos = [tieneMascota, lugarMascota(), comida, estado];
  else {
    const otros = fv(COLORES).filter((c) => c !== color);
    const verboP = azar.elegir(fv(VERBOS_PERSONA).filter((x) => x !== verbo));
    hechos = [tieneMascota, ropa(azar.elegir(otros)), lugarMascota(azar.elegir(fv(MOMENTOS))), { kind: "accion", vals: { suj: persona, verbo: verboP } }, comida, estado];
  }
  return { hechos: hechos.map((h) => ({ ...h, ...CONSTRUCTORES[h.kind](h.vals) })) };
}

// ---------------------------------------------------------------- preguntas
const sujDef = (v) => `${def(v.suj)} ${v.suj}`;
/** Opciones posibles de un hueco: { correcta, pool } (cadenas tal como se ven). */
function valoresDe(h, hueco) {
  const v = h.vals;
  switch (`${h.kind}.${hueco}`) {
    case "poseer.item": {
      const lista = v.tipo === "mascota" ? Object.keys(MASCOTAS) : v.tipo === "ropa" ? PRENDAS : JUGUETES;
      return { correcta: `${indef(v.item)} ${v.item}`, pool: lista.map((n) => `${indef(n)} ${n}`), q: `¿Qué ${v.verbo} ${sujDef(v)}?` };
    }
    case "poseer.color": {
      const plaus = v.tipo === "mascota" ? MASCOTAS[v.item].colores : COLORES;
      return { correcta: adj(v.color, v.item), pool: [...new Set([...plaus, ...COLORES])].map((c) => adj(c, v.item)), q: `¿De qué color es ${def(v.item)} ${v.item}?`, plaus: plaus.map((c) => adj(c, v.item)) };
    }
    case "comida.comida": return { correcta: v.comida, pool: COMIDAS, q: `¿Qué come ${sujDef(v)}?` };
    case "lugar.lugar": return { correcta: LUGARES[v.lugar], pool: Object.values(LUGARES), q: `¿Dónde ${v.verbo} ${sujDef(v)}?` };
    case "lugar.verbo": return { correcta: v.verbo, pool: [...(MASCOTAS[v.suj]?.verbos ?? VERBOS_LUGAR_PERSONA), "duerme"], q: `¿Qué hace ${sujDef(v)} ${LUGARES[v.lugar]}?` };
    case "lugar.momento": return { correcta: `por la ${v.momento}`, pool: MOMENTOS.map((m) => `por la ${m}`), q: `¿Cuándo ${v.verbo} ${sujDef(v)} ${LUGARES[v.lugar]}?` };
    case "estado.estado": return { correcta: adj(v.estado, v.suj), pool: ESTADOS.map((e) => adj(e, v.suj)), q: `¿Cómo está ${sujDef(v)}?` };
    case "accion.verbo": return { correcta: v.verbo, pool: VERBOS_PERSONA, q: `¿Qué hace ${sujDef(v)}?` };
    default: throw new Error(`_lectura.js: hueco desconocido ${h.kind}.${hueco}`);
  }
}
const clave = (s) => s.split(" ").pop();             // la palabra que distingue la opción («un gato» → gato; «en el parque» → parque)
/** Valores de un hueco que cambian el hecho (no son el verdadero ni aparecen en el texto). */
function alternativas(h, hueco, enTexto, cuales) {
  const { correcta, pool, plaus } = valoresDe(h, hueco);
  let ok = pool.filter((o) => o !== correcta && !enTexto.has(clave(o)) && permitida(o));
  if (cuales === "plausibles" && plaus) { const p = ok.filter((o) => plaus.includes(o)); if (p.length) ok = p; }
  return ok;
}

/** Valor «interno» (el de vals) de una opción vista: «un perro» → «perro», «en el parque» → «parque», «por la tarde» → «tarde», «negra» → «negro». */
function interno(h, hueco, visto) {
  const w = visto.split(" ").pop();
  if (hueco === "color" || hueco === "estado") return /a$/.test(w) && gen(h.vals.item ?? h.vals.suj) === "f" && (COLORES.includes(w.slice(0, -1) + "o") || ESTADOS.includes(w.slice(0, -1) + "o")) ? w.slice(0, -1) + "o" : w;
  return w;
}
const HUECO_VALS = { "poseer.item": "item", "poseer.color": "color", "comida.comida": "comida", "lugar.lugar": "lugar", "lugar.verbo": "verbo", "lugar.momento": "momento", "estado.estado": "estado", "accion.verbo": "verbo" };

/**
 * Elige n (hecho, hueco) distintos: primero uno por frase (frases al azar), después los que falten; en el orden del texto.
 * Devuelve [{ i: frase, h: hecho, hueco }].
 */
export function elegirHuecos(azar, hechos, n) {
  const todos = hechos.flatMap((h, i) => [...HUECOS[h.kind], ...(h.kind === "lugar" && h.vals.momento ? ["momento"] : [])].map((hueco) => ({ i, h, hueco })));
  const out = [], usado = new Set();
  const porFrase = azar.barajar(hechos.map((_, i) => i));
  for (const i of porFrase) {
    if (out.length >= n) break;
    const c = azar.elegir(todos.filter((x) => x.i === i)); out.push(c); usado.add(c);
  }
  for (const c of azar.barajar(todos)) { if (out.length >= n) break; if (!usado.has(c)) { out.push(c); usado.add(c); } }
  return out.sort((a, b) => a.i - b.i || todos.indexOf(a) - todos.indexOf(b));
}

/**
 * Pregunta de un tipo ("elegir" | "sino" | "completar") sobre un hueco. verdad = para «sino» (true: la frase del texto; false: con el hueco cambiado).
 * → { datos: { tipo, fuente, … }, solucion }, sin el caso aplicado (el tipo lo aplica).
 */
export function pregunta(azar, tipo, c, hechos, textoPal, verdad = true) {
  const h = c.h, { correcta, q } = valoresDe(h, c.hueco);
  if (tipo === "elegir") {
    const malas = azar.muestra(alternativas(h, c.hueco, textoPal), 2);
    if (malas.length < 2) throw new Error("«lectura.texto» necesita más opciones para las preguntas de elegir." + avisoVistas());
    const ops = azar.barajar([correcta, ...malas]);
    return { datos: { tipo, fuente: c.i, pregunta: q, opciones: ops }, solucion: { huecos: [], rodea: ops.indexOf(correcta) } };
  }
  if (tipo === "sino") {
    if (verdad) return { datos: { tipo, fuente: c.i, frase: textoDe(h.t) }, solucion: { huecos: [], rodea: 0 } };
    const clavVals = HUECO_VALS[`${h.kind}.${c.hueco}`], alts = alternativas(h, c.hueco, textoPal, "plausibles");
    if (!alts.length) throw new Error("«lectura.texto» necesita más opciones para las preguntas de sí o no." + avisoVistas());
    let candidatas = alts.map((a) => interno(h, c.hueco, a));
    if (h.kind === "poseer" && clavVals === "item") {   // el mismo género (un gato → un perro, una falda → una bufanda): solo cambia una palabra; y, si se puede, un animal que tenga ese color
      const mismo = candidatas.filter((a) => gen(a) === gen(h.vals.item));
      if (mismo.length) candidatas = mismo;
      if (h.vals.tipo === "mascota") { const buenas = candidatas.filter((a) => MASCOTAS[a].colores.includes(h.vals.color)); if (buenas.length) candidatas = buenas; }
    }
    const alt = azar.elegir(candidatas), vals = { ...h.vals, [clavVals]: alt };
    return { datos: { tipo, fuente: c.i, frase: textoDe(CONSTRUCTORES[h.kind](vals).t) }, solucion: { huecos: [], rodea: 1 } };
  }
  // completar: la frase del texto con una palabra en hueco
  const i = h.idx[c.hueco], t = h.t.slice(), hoy = t[i], coma = hoy.endsWith(",");
  const resp = coma ? hoy.slice(0, -1) : hoy;
  const antes = cap(t.slice(0, i).join(" ")) || "";
  let despues = t.slice(i + 1).join(" ");
  despues = (coma ? "," + (despues ? " " + despues : "") : despues) + ".";
  return { datos: { tipo, fuente: c.i, antes: i === 0 ? "" : antes, despues }, solucion: { huecos: [resp] } };
}

// ================================================================ ORDENA: secuencias (📚)
/** Secuencias de 3–4 frases con un solo orden posible: lo que ocurre antes tiene que ocurrir antes (abrir antes de cerrar, romper antes de freír…). */
const SEC = [
  ["rutina", "El niño sale de casa.|El niño llega al colegio.|El niño entra en clase."],
  ["rutina", "La niña abre la puerta.|La niña entra en casa.|La niña cierra la puerta."],
  ["rutina", "La niña abre el grifo.|La niña se baña.|La niña se seca con la toalla."],
  ["rutina", "La niña se pone los calcetines.|La niña se pone los zapatos.|La niña ata los cordones."],
  ["rutina", "El niño se sienta a la mesa.|El niño come la sopa.|El niño se limpia la boca."],
  ["rutina", "La niña moja las manos.|La niña pone jabón.|La niña se seca las manos."],
  ["rutina", "Por la mañana, el niño desayuna.|Por la tarde, el niño merienda.|Por la noche, el niño cena."],
  ["rutina", "Por la mañana, la niña va al colegio.|Por la tarde, la niña juega en el parque.|Por la noche, la niña duerme."],
  ["rutina", "Es de noche.|El niño se acuesta.|El niño duerme.|Por la mañana, el niño se despierta."],
  ["rutina", "El niño se acuesta en la cama.|El niño cierra los ojos.|El niño sueña.|Por la mañana, el niño se levanta."],
  ["rutina", "El niño llega a casa.|El niño abre la mochila.|El niño saca el cuaderno.|El niño hace la tarea."],
  ["rutina", "La madre llama a la niña.|La niña se levanta de la cama.|La niña se viste.|La niña sale de casa."],
  ["rutina", "La niña llega al parque.|La niña juega en el tobogán.|La niña está cansada.|La niña se sienta en la hierba."],
  ["receta", "La madre coge el pan.|La madre corta el pan.|La madre pone queso.|El niño come el pan."],
  ["receta", "El niño echa la leche en un vaso.|El niño moja la galleta.|El niño se come la galleta."],
  ["receta", "El padre lava el tomate.|El padre corta el tomate.|El padre pone el tomate en el plato."],
  ["receta", "La madre coge una naranja.|La madre corta la naranja.|La madre echa el zumo en un vaso.|El niño bebe el zumo."],
  ["receta", "El cocinero rompe el huevo.|El cocinero fríe el huevo.|El cocinero pone el huevo en el plato."],
  ["receta", "La abuela hace la tarta.|La abuela mete la tarta en el horno.|La abuela saca la tarta del horno.|La niña come la tarta."],
  ["receta", "El padre cocina la sopa.|El padre echa la sopa en el plato.|El padre sopla la sopa.|El padre come la sopa."],
  ["receta", "La niña cava la tierra.|La niña pone la semilla.|La niña riega la semilla.|La flor crece."],
  ["receta", "La madre coge un yogur.|La madre abre el yogur.|El niño come el yogur."],
  ["receta", "El niño coge la plastilina.|El niño amasa la plastilina.|El niño hace un muñeco."],
  ["receta", "La abuela lava la fruta.|La abuela corta la fruta.|La abuela pone la fruta en un plato."],
  ["cuento", "La gallina pone un huevo.|El huevo se rompe.|Sale un pollo."],
  ["cuento", "El pájaro hace un nido.|El pájaro pone un huevo.|El huevo se rompe.|Sale un pájaro."],
  ["cuento", "El ratón ve el queso.|El ratón corre hacia el queso.|El ratón come el queso.|El ratón duerme."],
  ["cuento", "El niño lanza la pelota.|El perro corre.|El perro coge la pelota.|El perro lleva la pelota al niño."],
  ["cuento", "El cielo se pone gris.|Llueve.|Sale el sol.|Sale el arcoíris."],
  ["cuento", "El pescador sube al barco.|El barco sale del puerto.|El pescador pesca un pez.|El pescador llega al puerto."],
  ["cuento", "El niño coge el billete.|El tren llega a la estación.|El niño sube al tren.|El tren sale de la estación."],
  ["cuento", "El lobo ve una casa.|El lobo sopla.|La casa cae."],
  ["cuento", "El mono ve un plátano.|El mono trepa al árbol.|El mono coge el plátano.|El mono se come el plátano."],
  ["cuento", "La niña ve una flor.|La niña coge la flor.|La niña huele la flor."],
  ["cuento", "El pato ve el pan.|El pato nada hacia el pan.|El pato come el pan."],
  ["cuento", "El niño planta un árbol.|El niño riega el árbol.|El árbol crece."],
];
export const SECUENCIAS = SEC.map(([tema, f], i) => ({ id: i + 1, tema, frases: f.split("|") }));
export const TEMAS_SEC = ["rutina", "receta", "cuento"];

/**
 * n secuencias distintas (de `tema` o de todos los temas, de `frases` frases o de 3 y 4). Con todos los temas se reparten por turnos. Error con «necesita» si no hay bastantes.
 */
export function elegirSecuencias(azar, n, { tema = null, frases = null } = {}) {
  const ok = filtrarVistas(SECUENCIAS, (s) => s.frases.join(" ")).filter((s) => (!tema || s.tema === tema) && (!frases || s.frases.length === frases));
  const temas = tema ? [tema] : azar.barajar(TEMAS_SEC), out = [], usadas = new Set();
  for (let k = 0; out.length < n; k++) {
    const t = temas[k % temas.length], libres = ok.filter((s) => s.tema === t && !usadas.has(s.id));
    if (!libres.length) {
      const otras = ok.filter((s) => !usadas.has(s.id));
      if (!otras.length) throw new Error(`«lectura.ordena» necesita más secuencias: con esas opciones solo hay ${out.length} y hacen falta ${n}.${avisoVistas()}`);
      const s = azar.elegir(otras); usadas.add(s.id); out.push(s); continue;
    }
    const s = azar.elegir(libres); usadas.add(s.id); out.push(s);
  }
  return out;
}

/** Orden en que se ven las frases (índices de la secuencia): nunca el orden correcto. */
export function desordenarIdx(azar, k) {
  const base = [...Array(k).keys()];
  for (let i = 0; i < 30; i++) { const b = azar.barajar(base); if (b.some((v, j) => v !== j)) return b; }
  return base.slice().reverse();
}

// ================================================================ ADIVINANZA (📚): originales, una palabra del léxico como respuesta
const ADIV = [
  ["gato", "Maúlla, trepa y duerme mucho. Le gusta el pescado y la leche."],
  ["perro", "Ladra y corre. Es amigo de los niños y cuida la casa."],
  ["pez", "Vive en una pecera y nada sin parar. Se pesca en el río."],
  ["vaca", "Es blanca y negra. Da leche y come hierba en el campo."],
  ["gallina", "Vive en la granja y pone huevos. Come semillas."],
  ["caballo", "Corre muy rápido y se monta en él. Come hierba en el campo."],
  ["cerdo", "Vive en la granja y es rosa. Le gusta el barro."],
  ["conejo", "Tiene las orejas largas y salta mucho. Le gusta la zanahoria."],
  ["elefante", "Es enorme y tiene la nariz muy larga. Sus orejas son grandes."],
  ["jirafa", "Tiene el cuello muy largo. Come hojas de los árboles altos."],
  ["mono", "Salta de rama en rama y trepa a los árboles. Le gustan los plátanos."],
  ["oso", "Es grande y fuerte, tiene el pelo marrón y duerme todo el invierno."],
  ["araña", "Hace una tela en la pared o en el techo y vive en ella."],
  ["rana", "Es verde, salta y nada en el lago."],
  ["sol", "Sale por la mañana y brilla en el cielo. Es grande, amarillo y redondo."],
  ["luna", "Brilla en el cielo por la noche. Es redonda o delgada, pero no es una estrella."],
  ["nube", "Es blanca o gris y está en el cielo. De ella cae la lluvia."],
  ["nieve", "Es blanca y cae en invierno. Con ella se hacen muñecos."],
  ["árbol", "Tiene tronco, ramas y hojas. Los pájaros hacen el nido en él."],
  ["flor", "Tiene pétalos de colores y huele muy bien. Crece en el jardín."],
  ["mesa", "Se come en ella. Encima ponen el plato, el vaso y la cuchara."],
  ["silla", "El niño se sienta en ella para comer. Está al lado de la mesa."],
  ["cama", "Es grande y blanda. Con almohada, sábana y manta, se duerme en ella por la noche."],
  ["puerta", "Se abre y se cierra. Por ella se entra en casa."],
  ["casa", "Tiene puertas, ventanas y tejado. En ella vive la familia."],
  ["llave", "Es pequeña. Abre la puerta de casa y se guarda en el bolsillo."],
  ["lápiz", "Escribe y dibuja y se guarda en el estuche. Se borra con la goma."],
  ["goma", "Es pequeña y blanda. Borra lo que escribe el lápiz."],
  ["tijera", "Tiene dos hojas, corta el papel y se usa con la mano."],
  ["libro", "Tiene hojas, letras y dibujos. Se abre para leer un cuento."],
  ["mochila", "Se lleva en la espalda al colegio. Dentro se guarda el estuche y el cuaderno."],
  ["zapato", "Se lleva en el pie. Tiene suela y cordones."],
  ["calcetín", "Va dentro del zapato. Se lleva en el pie y es de lana."],
  ["reloj", "Se lleva en la muñeca. Tiene números y dice la hora."],
  ["toalla", "Es suave y se seca el cuerpo con ella después del baño."],
  ["escoba", "Se usa para barrer el suelo. Es larga y delgada."],
  ["peine", "Se usa para peinar el pelo. Tiene muchos dientes."],
  ["cuchara", "Con ella se come la sopa y el yogur."],
  ["manzana", "Es una fruta roja o verde. Es redonda y tiene semillas dentro."],
  ["plátano", "Es amarillo y largo. Se quita la piel antes de comer."],
  ["limón", "Es amarillo, redondo y muy ácido. Es una fruta."],
  ["fresa", "Es roja, pequeña y dulce. Tiene las semillas por fuera."],
  ["pan", "El panadero lo hace en el horno. Se come con queso o con jamón."],
  ["leche", "Es blanca y se bebe en un vaso. Sale de la vaca."],
  ["helado", "Es frío, dulce y de muchos sabores. Se come en verano."],
  ["payaso", "Está en el circo y hace reír a los niños. Lleva la nariz roja."],
  ["cartero", "Lleva las cartas a las casas y llama a la puerta."],
];
export const ADIVINANZAS = ADIV.map(([r, t], i) => ({ id: i + 1, respuesta: r, texto: t }));
const PALABRAS_DE = (t) => t.toLowerCase().match(/[a-záéíóúüñ]+/g) || [];

/** n adivinanzas con respuestas distintas; ninguna menciona la respuesta de otra de la misma ficha (se evita si se puede). */
export function elegirAdivinanzas(azar, n, { maxLetras = 9 } = {}) {
  const sinI = filtrarVistas(ADIVINANZAS, (a) => a.texto + " " + a.respuesta).filter((a) => a.respuesta.length <= maxLetras);
  for (let intento = 0; intento < 40; intento++) {
    const out = [];
    for (const a of azar.barajar(sinI)) {
      if (out.length >= n) break;
      const m = new Set(PALABRAS_DE(a.texto));
      if (out.some((o) => m.has(o.respuesta) || PALABRAS_DE(o.texto).includes(a.respuesta))) continue;
      out.push(a);
    }
    if (out.length === n) return out;
  }
  throw new Error(`«lectura.adivinanza» necesita más adivinanzas: hacen falta ${n}.${avisoVistas()}`);
}

// ================================================================ INSTRUCCIONES: figuras, tamaños y colores
export const FORMAS = { c: { n: "círculo" }, s: { n: "estrella" }, q: { n: "cuadrado" }, t: { n: "triángulo" } };
/** Color → { c: relleno en pantalla (nunca el rojo de las respuestas), basico } */
export const PINTURAS = {
  rojo: { c: "#E45B5B", basico: true }, azul: { c: "#4F8FD9", basico: true }, verde: { c: "#5DB56A", basico: true }, amarillo: { c: "#F5D547", basico: true },
  naranja: { c: "#F59E42", basico: false }, rosa: { c: "#F4A6C6", basico: false }, morado: { c: "#9D74CE", basico: false }, marrón: { c: "#A67B5B", basico: false },
};
export const COLORES_INSTR = (todos) => Object.keys(PINTURAS).filter((c) => todos || PINTURAS[c].basico);
export const TAMANOS = { g: "grande", p: "pequeño" };
/** «el círculo grande», «la estrella pequeña» */
export function sintagma({ forma, tam }) {
  const n = FORMAS[forma].n, t = tam ? " " + formaAdj(TAMANOS[tam], gen(n), "s") : "";
  return `${def(n)} ${n}${t}`;
}
/** «Colorea de rojo la estrella grande.» o con dos órdenes: «Colorea de rojo el círculo grande y de azul la estrella pequeña.» */
export const textoInstruccion = (ordenes) => "Colorea " + ordenes.map((o) => `de ${o.color} ${sintagma(o)}`).join(" y ") + ".";

/** Dibuja una figura centrada en (x, y); r = radio (círculo y mitad del lado del cuadrado). estilo = { fill, stroke, lw } (shape() del motor). */
export function figura(p, forma, x, y, r, { fill = 1, stroke = 0.12, lw = 2.2 } = {}) {
  if (forma === "c") p.circle(x, y, r, { fill, stroke, lw });
  else if (forma === "s") {
    const R = r * 1.2, cm = [];
    for (let j = 0; j < 10; j++) {
      const ang = Math.PI / 2 + j * Math.PI / 5, rr = j % 2 === 0 ? R : R * 0.42;
      cm.push([j ? "L" : "M", x + rr * Math.cos(ang), y + rr * Math.sin(ang)]);
    }
    p.path([...cm, ["Z"]], { fill, stroke, lw });
  } else if (forma === "q") p.rrect(x - r * 0.9, y - r * 0.9, r * 1.8, r * 1.8, 0, { fill, stroke, lw });
  else p.path([["M", x, y + r * 1.05], ["L", x - r * 1.05, y - r * 0.8], ["L", x + r * 1.05, y - r * 0.8], ["Z"]], { fill, stroke, lw });
}
