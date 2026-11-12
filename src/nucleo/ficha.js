// Charta · generar(opciones, semilla) → ficha JSON (ESQUEMA.md, schemaVersion 1).
// Port de modelos.validar()/por_defecto() y de pagina()/titulo_pagina() del motor de referencia.
import { POR_ID } from "./catalogo.js";
import { crearAzar, mezclar } from "./azar.js";
import { tipo } from "./tipos.js";
import { normalizarVistas, conVistas, normalizarObligatorias, conObligatorias } from "../lengua/vistas.js";
import { normalizarPropias, conPropias, USA_FRASES } from "../lengua/frases.js";

export const SCHEMA_VERSION = 1;
export const COLORES = ["amarillo", "rosa", "azul", "verde"];

export function modelo(id) {
  const m = POR_ID[id];
  if (!m) throw new Error(`Modelo desconocido: «${id}»`);
  return m;
}

/** Cursos en los que está un modelo: el suyo y los de `cursos` (MATES_2.md: un modelo en varios cursos). */
export const cursosDe = (m) => [m.curso, ...Object.keys(m.cursos || {}).map(Number).filter((c) => c !== m.curso)];
/** Rangos de un modelo en un curso (sin curso, o si no está en él: los de su curso). */
export function rangosDe(id, curso) { const m = modelo(id); return m.cursos?.[curso]?.rangos ?? m.rangos; }
/** Todos los rangos admitidos (unión de cursos), en orden. */
export function rangosTodos(id) {
  const m = modelo(id);
  return [...new Set([...m.rangos, ...Object.values(m.cursos || {}).flatMap((c) => c.rangos)])].sort((a, b) => a - b);
}

/** Curso de una actividad: el pedido si el modelo está en él; si no, el que admite su rango; si no, el del modelo. */
export function cursoDe(id, { curso, rango, params } = {}) {
  const m = modelo(id), cs = cursosDe(m);
  if (cs.includes(curso)) return curso;
  // 2.º sin rango (lote 3): un valor con `curso` (p. ej. reloj «y cuarto») dice el curso.
  for (const o of params ? m.opciones : []) {
    const x = o.tipo === "opcion" ? o.valores.find((v) => v.valor === params[o.id]) : null, k = x?.curso ?? (params[o.id] != null && o.curso);
    if (k && cs.includes(k)) return k;
  }
  if (rango != null && !m.rangos.includes(rango)) { const c = cs.find((k) => rangosDe(id, k).includes(rango)); if (c) return c; }
  return m.curso;
}

/** Parámetros por defecto: { rango, opción: valor, … } (el rango, el del curso si se da). */
export function porDefecto(id, curso) {
  const m = modelo(id), p = {};
  for (const o of m.opciones) p[o.id] = o.defecto ?? null;
  p.rango = m.cursos?.[curso]?.rango ?? m.rango;
  return p;
}

/** Opción o valor visible con este rango (2.º: `rmin` = solo con números de tres cifras; MATES_2.md, lote 2;
 *  `rmax` = solo hasta ese rango, p. ej. dobles con dibujos). */
export const visible = (x, rango, curso) => (!x.rmin || (rango ?? 0) >= x.rmin) && (!x.rmax || (rango ?? 0) <= x.rmax)
  && (!x.curso || curso == null || Number(curso) >= x.curso);   // `curso`: solo desde ese curso (2.º, lote 3: modelos sin rango)
const soloCon = (x) => x.curso && !x.rmin && !x.rmax ? `solo desde ${x.curso}.º`
  : x.rmax ? `solo con números hasta ${x.rmax} o menos` : `solo con números hasta ${x.rmin} o más`;

/** Comprueba y completa los parámetros. Devuelve un objeto nuevo o lanza Error. */
/** ¿Admite el mapa de letras? (Lengua de 1.º) */
export const esLengua1 = (m, curso) => m.materia === "lengua" && String(curso ?? m.curso) === "1";

export function validar(id, params = {}, tamano = "completa", curso) {
  const m = modelo(id), p = { ...porDefecto(id, curso), ...params }, rgs = rangosTodos(id);
  const c = cursoDe(id, { curso, rango: p.rango, params });
  if (!m.tamanos.includes(tamano)) throw new Error(`${id}: no admite el tamaño '${tamano}'`);
  const ops = Object.fromEntries(m.opciones.map((o) => [o.id, o]));
  // Letras elegidas (mapa de letras): solo Lengua de 1.º; todas = sin el campo (las fichas de siempre no cambian).
  if ("vistas" in p) { const v = esLengua1(m, c) ? normalizarVistas(p.vistas) : null; if (v) p.vistas = v; else delete p.vistas; }
  // Letras obligatorias (pulsación larga en el mapa): cada palabra o frase lleva al menos una. Solo Lengua de 1.º.
  if ("obligatorias" in p) { const o = esLengua1(m, c) ? normalizarObligatorias(p.obligatorias) : null; if (o) p.obligatorias = o; else delete p.obligatorias; }
  // «Mis frases» (Lengua de 1.º, tipos que usan frases): como las letras, viajan en los parámetros.
  if ("misFrases" in p) { const f = esLengua1(m, c) && USA_FRASES.has(id) ? normalizarPropias(p.misFrases) : null; if (f) p.misFrases = f; else delete p.misFrases; }
  for (const [k, v] of Object.entries(p)) {
    if (k === "vistas" || k === "obligatorias" || k === "misFrases") continue;
    if (k === "rango") {
      if (rgs.length && !rgs.includes(v)) throw new Error(`${id}: rango ${v} no admitido [${rgs}]`);
      continue;
    }
    const o = ops[k];
    if (!o) throw new Error(`${id}: opción desconocida '${k}'`);
    if (!visible(o, p.rango, c)) {   // 2.º: sin tres cifras no se guarda (las fichas de 1.º no cambian)
      if (v !== (o.defecto ?? (o.tipo === "si_no" ? false : null))) throw new Error(`${id}: '${o.etiqueta}' ${soloCon(o)}`);
      delete p[k]; continue;
    }
    if (o.tipo === "opcion") {
      const x = o.valores.find((x) => x.valor === v);
      if (!x) throw new Error(`${id}: valor '${v}' no válido para ${k}`);
      if (!visible(x, p.rango, c)) throw new Error(`${id}: '${x.etiqueta}' ${soloCon(x)}`);
      if (x.tamanos && !x.tamanos.includes(tamano)) throw new Error(`${id}: '${x.etiqueta}' solo en ${x.tamanos}`);
    }
    if (o.tipo === "numero" && v !== null && !(Number.isInteger(v) && o.min <= v && v <= o.max))
      throw new Error(`${id}: ${k}=${v} fuera de ${o.min}–${o.max}`);
    if (o.tipo === "si_no" && typeof v !== "boolean") throw new Error(`${id}: ${k} debe ser sí/no`);
  }
  return p;
}

/** "SUMAS HASTA 20" → "Sumas hasta 20" (como _titulo() del motor). */
export function capitalizar(t) {
  const s = t.toLowerCase().replace(" c, d y u", " C, D y U").replace(" d y u", " D y U");
  const k = s.search(/\p{L}/u);
  return k < 0 ? s : s.slice(0, k) + s[k].toUpperCase() + s.slice(k + 1);
}

/** 2.º (lote 2b): modelos que cambian de título con números desde 100 (en 1.º nunca llegan a 100). */
const TITULO_2 = { "valor.agrupa": { _: "AGRUPA EN CENTENAS" }, "sumar.dobles": { mitades: "LAS MITADES", mezcla: "DOBLES Y MITADES" } };
/** 2.º (lote 3): títulos de los modos que solo salen en 2.º (modelos sin rango). */
const TITULO_MODO_2 = { "medida.tiempo": { equivalencias: "LAS MEDIDAS DEL TIEMPO", horas: "ANTES Y DESPUÉS" } };
const NOMBRE_2 = { "valor.agrupa": "Agrupa en decenas y centenas", "sumar.dobles": "Los dobles y las mitades" };

export function tituloModelo(m, p = {}) {
  const t2 = p.rango >= 100 && TITULO_2[m.id], t2v = t2 && (t2[p.operacion] ?? t2._);
  if (t2v) return t2v;
  const tm = TITULO_MODO_2[m.id]?.[p.modo];
  if (tm) return tm;
  const t0 = m.titulo, t = typeof t0 === "string" ? t0 : t0[p.modo ?? "_"] ?? t0._;
  return p.rango > 100 ? t.replace(/(HASTA|hasta) 100\b/, `$1 ${p.rango}`).replace(/\bD (Y|y) U\b/, "C, D $1 U") : t;   // 2.º: «Sumas hasta 999»
}

/** Nombre del modelo en el selector de un curso: en 2.º, «hasta 100» → «hasta» el rango mayor del curso. */
export function nombreEnCurso(m, curso) {
  if (String(curso) === "2" && NOMBRE_2[m.id]) return NOMBRE_2[m.id];
  const rg = m.cursos?.[curso]?.rangos, mx = rg?.length ? Math.max(...rg) : 0;
  return mx > 100 ? m.nombre.replace(/hasta 100\b/, `hasta ${mx}`).replace(/\bD y U\b/, "C, D y U") : m.nombre;
}

/** Título por defecto: el del modelo; con dos, «X y y». */
export function tituloPagina(acts) {
  const ts = acts.map((a) => capitalizar(tituloModelo(modelo(a.tipo), a.params)));
  if (ts.length === 1 || ts[0] === ts[1]) return ts[0];
  return ts[0] + " y " + ts[1][0].toLowerCase() + ts[1].slice(1);
}

/** Colores de los paneles: el de la familia; si dos coinciden (sin elegirlos), el segundo pasa al siguiente. */
export function coloresPagina(acts) {
  const usados = [];
  return acts.map((a) => {
    let k = a.color || modelo(a.tipo).color;
    if (usados.includes(k) && !a.color) {
      const i = COLORES.indexOf(k);
      k = [...COLORES.slice(i + 1), ...COLORES].find((x) => !usados.includes(x));
    }
    if (!COLORES.includes(k)) throw new Error(`Color no válido: «${k}»`);
    usados.push(k);
    return k;
  });
}

/** Una página: sus actividades se numeran desde `n0 + 1` (la numeración sigue de una página a otra) y su semilla es la de su número. */
function pagina(acts, tamano, colores, semilla, n0 = 0) {
  return {
    actividades: acts.map((a, j) => {
      const T = tipo(a.tipo), i = n0 + j;
      const res = conPropias(a.params.misFrases || null, () => conVistas(a.params.vistas || null, () => conObligatorias(a.params.obligatorias || null, () => T.generar(a.params, crearAzar(mezclar(semilla, i + 1)), { tamano }))));
      const n = i + 1;
      return {
        n, tipo: a.tipo, tipoVersion: T.version, params: a.params, tamano, color: colores[j],
        enunciado: res.enunciado, ejemplo: res.ejemplo ?? null,
        ejercicios: res.ejercicios.map((e, k) => ({ id: `a${n}e${k + 1}`, datos: e.datos, solucion: e.solucion, ...(e.pasos ? { pasos: e.pasos } : {}) })),
      };
    }),
  };
}

/** Metadatos propios de una ficha (sin LOMLOE): dificultad = la mayor, minutos = suma (media página ≈ la mitad), etiquetas sin repetir. */
export function metadatosDe(ids) {
  // ids: los de una página (["sumar.h20", …]) o los de varias ([["a", "b"], ["c"]]): media página = la mitad de minutos.
  const pags = Array.isArray(ids[0]) ? ids : [ids];
  const ms = pags.flatMap((p) => p.map((id) => ({ ...modelo(id).metadatos, mitad: p.length > 1 })));
  return {
    dificultad: Math.max(...ms.map((m) => m.dificultad)),
    minutos: ms.reduce((t, m) => t + (m.mitad ? Math.round(m.minutos / 2) : m.minutos), 0),
    etiquetas: [...new Set(ms.flatMap((m) => m.etiquetas))],
  };
}

/** Páginas como máximo en una ficha. */
export const MAX_PAGINAS = 10;

/**
 * opciones = {
 *   actividades: [{ tipo: "sumar.h20", params?: {…}, color?: "azul" }, …]   (1 o 2: una página)
 *   o paginas: [{ actividades: [1 o 2] }, …]   (varias páginas: hasta MAX_PAGINAS; las actividades se numeran seguidas: 1, 2, 3…),
 *   titulo?, variantes?: 1 (N = variantes A, B, C…), presentacion?: { color, lecturaFacil, pictogramas },
 *   metadatos?: { dificultad, minutos, etiquetas }
 * }
 * Determinista: no pone id, creada ni autor (se añaden al guardar en Firestore).
 * La semilla de cada actividad depende de su número: la página 1 de una ficha larga es igual que la ficha de una página.
 */
export function generar(opciones, semilla = 1) {
  const brutasPags = opciones?.paginas ? opciones.paginas.map((p) => p?.actividades || []) : [opciones?.actividades || []];
  if (!brutasPags.length || brutasPags.length > MAX_PAGINAS) throw new Error(`Una ficha lleva de 1 a ${MAX_PAGINAS} páginas.`);
  brutasPags.forEach((b, k) => { if (b.length < 1 || b.length > 2) throw new Error(brutasPags.length > 1 ? `La página ${k + 1} lleva 1 o 2 actividades.` : "Una ficha lleva 1 o 2 actividades."); });
  if (!Number.isInteger(semilla)) throw new Error("La semilla debe ser un entero.");
  const pags = brutasPags.map((brutas) => {
    const tamano = brutas.length === 1 ? "completa" : "media";
    const acts = brutas.map((a) => {
      const m = modelo(a.tipo);
      if (!m.tamanos.includes(tamano)) throw new Error(`«${m.nombre}» solo cabe en una página completa.`);
      if (!tipo(a.tipo)) throw new Error(`«${m.nombre}» aún no está disponible en la app.`);
      const curso = cursosDe(m).includes(a.curso) ? a.curso : cursoDe(a.tipo, { params: a.params });   // curso elegido en el selector (o el que pide un valor con `curso`)
      return { tipo: a.tipo, curso, params: validar(a.tipo, a.params, tamano, curso), color: a.color || null };
    });
    return { acts, tamano, colores: coloresPagina(acts) };
  });
  const todas = pags.flatMap((p) => p.acts);
  const variantes = opciones.variantes ?? 1;
  if (!Number.isInteger(variantes) || variantes < 1 || variantes > 30) throw new Error("variantes: de 1 a 30.");
  const semillaVariante = (v) => (v === 0 ? semilla >>> 0 : mezclar(semilla, v));
  const paginasDe = (s) => { let n0 = 0; return pags.map((p) => { const r = pagina(p.acts, p.tamano, p.colores, s, n0); n0 += p.acts.length; return r; }); };
  const m0 = modelo(todas[0].tipo);
  const ficha = {
    schemaVersion: SCHEMA_VERSION, app: "charta",
    titulo: opciones.titulo || tituloPagina(todas),
    curso: todas[0].curso, area: m0.materia,
    semilla, variantes,
    presentacion: { color: true, lecturaFacil: false, pictogramas: false, ...(opciones.presentacion || {}) },
    paginas: paginasDe(semillaVariante(0)),
    variantesDatos: [],
  };
  if (opciones.metadatos) ficha.metadatos = { ...opciones.metadatos };
  for (let v = 1; v < variantes; v++) {
    const s = semillaVariante(v);
    ficha.variantesDatos.push({ semilla: s, paginas: paginasDe(s) });
  }
  // Normalizada a JSON (−0 → 0…): la ficha en memoria es idéntica a la guardada en Firestore o leída por Tabula/Fori.
  return JSON.parse(JSON.stringify(ficha));
}
