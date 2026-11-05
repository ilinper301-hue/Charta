// Charta · generar(opciones, semilla) → ficha JSON (ESQUEMA.md, schemaVersion 1).
// Port de modelos.validar()/por_defecto() y de pagina()/titulo_pagina() del motor de referencia.
import { POR_ID } from "./catalogo.js";
import { crearAzar, mezclar } from "./azar.js";
import { tipo } from "./tipos.js";

export const SCHEMA_VERSION = 1;
export const COLORES = ["amarillo", "rosa", "azul", "verde"];

export function modelo(id) {
  const m = POR_ID[id];
  if (!m) throw new Error(`Modelo desconocido: «${id}»`);
  return m;
}

/** Parámetros por defecto: { rango, opción: valor, … }. */
export function porDefecto(id) {
  const m = modelo(id), p = {};
  for (const o of m.opciones) p[o.id] = o.defecto ?? null;
  p.rango = m.rango;
  return p;
}

/** Comprueba y completa los parámetros. Devuelve un objeto nuevo o lanza Error. */
export function validar(id, params = {}, tamano = "completa") {
  const m = modelo(id), p = { ...porDefecto(id), ...params };
  if (!m.tamanos.includes(tamano)) throw new Error(`${id}: no admite el tamaño '${tamano}'`);
  const ops = Object.fromEntries(m.opciones.map((o) => [o.id, o]));
  for (const [k, v] of Object.entries(p)) {
    if (k === "rango") {
      if (m.rangos.length && !m.rangos.includes(v)) throw new Error(`${id}: rango ${v} no admitido [${m.rangos}]`);
      continue;
    }
    const o = ops[k];
    if (!o) throw new Error(`${id}: opción desconocida '${k}'`);
    if (o.tipo === "opcion") {
      const x = o.valores.find((x) => x.valor === v);
      if (!x) throw new Error(`${id}: valor '${v}' no válido para ${k}`);
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
  const s = t.toLowerCase().replace(" d y u", " D y U");
  const k = s.search(/\p{L}/u);
  return k < 0 ? s : s.slice(0, k) + s[k].toUpperCase() + s.slice(k + 1);
}

export function tituloModelo(m, p = {}) {
  const t = m.titulo;
  return typeof t === "string" ? t : t[p.modo ?? "_"] ?? t._;
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

function pagina(acts, tamano, colores, semilla) {
  return {
    actividades: acts.map((a, i) => {
      const T = tipo(a.tipo);
      const res = T.generar(a.params, crearAzar(mezclar(semilla, i + 1)), { tamano });
      const n = i + 1;
      return {
        n, tipo: a.tipo, tipoVersion: T.version, params: a.params, tamano, color: colores[i],
        enunciado: res.enunciado, ejemplo: res.ejemplo ?? null,
        ejercicios: res.ejercicios.map((e, k) => ({ id: `a${n}e${k + 1}`, datos: e.datos, solucion: e.solucion, ...(e.pasos ? { pasos: e.pasos } : {}) })),
      };
    }),
  };
}

/** Metadatos propios de una ficha (sin LOMLOE): dificultad = la mayor, minutos = suma (media página ≈ la mitad), etiquetas sin repetir. */
export function metadatosDe(ids) {
  const ms = ids.map((id) => modelo(id).metadatos);
  const mitad = ids.length > 1;
  return {
    dificultad: Math.max(...ms.map((m) => m.dificultad)),
    minutos: ms.reduce((t, m) => t + (mitad ? Math.round(m.minutos / 2) : m.minutos), 0),
    etiquetas: [...new Set(ms.flatMap((m) => m.etiquetas))],
  };
}

/**
 * opciones = {
 *   actividades: [{ tipo: "sumar.h20", params?: {…}, color?: "azul" }, …]   (1 o 2),
 *   titulo?, variantes?: 1 (N = variantes A, B, C…), presentacion?: { color, lecturaFacil, pictogramas },
 *   metadatos?: { dificultad, minutos, etiquetas }
 * }
 * Determinista: no pone id, creada ni autor (se añaden al guardar en Firestore).
 */
export function generar(opciones, semilla = 1) {
  const brutas = opciones?.actividades || [];
  if (brutas.length < 1 || brutas.length > 2) throw new Error("Una ficha lleva 1 o 2 actividades.");
  if (!Number.isInteger(semilla)) throw new Error("La semilla debe ser un entero.");
  const tamano = brutas.length === 1 ? "completa" : "media";
  const acts = brutas.map((a) => {
    const m = modelo(a.tipo);
    if (!m.tamanos.includes(tamano)) throw new Error(`«${m.nombre}» solo cabe en una página completa.`);
    if (!tipo(a.tipo)) throw new Error(`«${m.nombre}» aún no está disponible en la app.`);
    return { tipo: a.tipo, params: validar(a.tipo, a.params, tamano), color: a.color || null };
  });
  const colores = coloresPagina(acts);
  const variantes = opciones.variantes ?? 1;
  if (!Number.isInteger(variantes) || variantes < 1 || variantes > 30) throw new Error("variantes: de 1 a 30.");
  const semillaVariante = (v) => (v === 0 ? semilla >>> 0 : mezclar(semilla, v));
  const m0 = modelo(acts[0].tipo);
  const ficha = {
    schemaVersion: SCHEMA_VERSION, app: "charta",
    titulo: opciones.titulo || tituloPagina(acts),
    curso: m0.curso, area: m0.materia,
    semilla, variantes,
    presentacion: { color: true, lecturaFacil: false, pictogramas: false, ...(opciones.presentacion || {}) },
    paginas: [pagina(acts, tamano, colores, semillaVariante(0))],
    variantesDatos: [],
  };
  if (opciones.metadatos) ficha.metadatos = { ...opciones.metadatos };
  for (let v = 1; v < variantes; v++) {
    const s = semillaVariante(v);
    ficha.variantesDatos.push({ semilla: s, paginas: [pagina(acts, tamano, colores, s)] });
  }
  // Normalizada a JSON (−0 → 0…): la ficha en memoria es idéntica a la guardada en Firestore o leída por Tabula/Fori.
  return JSON.parse(JSON.stringify(ficha));
}
