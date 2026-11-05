// Charta · ayudantes de los tipos palabra.* (Lengua 1.º, lote 2; LENGUA_1.md §3, bloque 4).
// Sin DOM. Campos léxicos, palabras de un campo, elegir palabras por nº de letras y dibujo de letras sueltas.
import { LEXICO } from "../lengua/lexico.js";
import { plural } from "../lengua/reglas.js";
import { cap } from "./_lengua.js";
import { INK } from "../render/papel.js";

/** Campos léxicos que usan intrusa, clasifica y sopa (en este orden; «colores» solo lleva adjetivos). */
export const CAMPOS_P = ["animales", "comida", "ropa", "casa", "escuela", "cuerpo", "juguetes", "transportes", "familia", "naturaleza", "colores"];
export const PALABRA_LEXICO = new Map(LEXICO.map((e) => [e.p, e]));
export const PALABRAS_P = new Set(LEXICO.map((e) => e.p));

/** Nombre del grupo para una caja: «Animales» (o «ANIMALES»). */
export const rotuloCampo = (campo, caso) => (caso === "mayus" ? campo.toUpperCase() : cap(campo));

const memo = new Map();
/** Palabras de un campo: nombres (en «colores», adjetivos) frecuentes, de 3 a maxLetras letras; con «Mayúscula inicial» sin la «i» inicial. */
export function deCampo(campo, { caso = null, maxLetras = 9, sinTilde = false } = {}) {
  const clave = `${campo}|${caso === "inicial"}|${maxLetras}|${sinTilde}`;
  if (!memo.has(clave)) {
    const cats = campo === "colores" ? ["a", "n"] : ["n"];
    memo.set(clave, LEXICO.filter((e) => e.k.includes(campo) && cats.includes(e.c) && e.f <= 2 && e.p.length >= 3 && e.p.length <= maxLetras
      && !/[\s-]/.test(e.p) && (caso !== "inicial" || !/^[iíì]/.test(e.p)) && (!sinTilde || !/[áéíóúü]/.test(e.p))));
  }
  return memo.get(clave);   // no modificar: se comparte
}

/** Todas las palabras de todos los campos (sin repetir). */
export function deTodosCampos(opts) {
  const vistas = new Set(), out = [];
  for (const c of CAMPOS_P) for (const e of deCampo(c, opts)) if (!vistas.has(e.p)) { vistas.add(e.p); out.push(e); }
  return out;
}

/** Campos léxicos que comparten todas las palabras (de las entradas del léxico dadas). */
export const camposComunes = (es) => (es.length ? es[0].k.filter((c) => es.every((e) => e.k.includes(c))) : []);

/**
 * Elige n palabras (entradas) de la lista siguiendo la secuencia de largos en letras (p. ej. [3, 4, 5]); ok(entrada) → verdadero si sirve.
 * Error con «necesita» si no hay bastantes.
 */
export function elegirPorLetras(azar, n, lista, largos, ok, id) {
  const bolsas = {};
  for (const l of new Set(largos)) bolsas[l] = azar.barajar(lista.filter((e) => [...e.p].length === l && (!ok || ok(e))));
  const out = []; let i = 0;
  while (out.length < n) {
    let tomada = false;
    for (let k = 0; k < largos.length && !tomada; k++) {
      const b = bolsas[largos[(i + k) % largos.length]];
      if (b.length) { out.push(b.pop()); tomada = true; i += k + 1; }
    }
    if (!tomada) throw new Error(`«${id}» necesita más palabras: con esas opciones solo hay ${out.length} y hacen falta ${n}. Prueba con otro tipo de sílabas o con otro largo.`);
  }
  return out;
}

/** Fila de letras sueltas en «fichas» (cuadradas, con borde); la de `marcada` va resaltada (gris y borde grueso). Devuelve el x donde acaba. */
export function fichasLetras(p, x, y, h, letras, { fs = 26, gap = 8, marcada = -1 } = {}) {
  const bw = fs * 1.5, bh = fs * 1.55, by = y + (h - bh) / 2; let cx = x;
  letras.forEach((t, k) => {
    p.rrect(cx, by, bw, bh, 8, k === marcada ? { lw: 2.4, fill: 0.82, stroke: INK } : { lw: 0.8, fill: 1, stroke: 0.55 });
    p.text(cx + bw / 2, y + h / 2 - fs * 0.35, t, fs, { f: "PB", anchor: "middle" });
    cx += bw + gap;
  });
  return cx - gap;
}
export const anchoFichas = (n, fs = 26, gap = 8) => n * fs * 1.5 + (n - 1) * gap;

const tildes = (s) => (s.match(/[áéíóú]/g) || []).length;
/** Nombres que no se usan en plural en 1.º (no contables, deportes, momentos del día…): quedan fuera de artículo y plural. */
const NO_PLURAL = new Set("pan leche sal arroz nata dinero paz amor miedo frío silencio ruido tiempo sueño lana tela ceniza lava barro polvo hielo nieve lluvia niebla trigo césped hierba carne fruta ajedrez mañana tarde noche fútbol boxeo karate judo ciclismo patinaje esquí música historia verano otoño invierno primavera sábado domingo fin principio favor vez cosa mundo cielo fuego tierra viento sol luna rostro cuerpo ropa gente".split(" "));
/** Nombres que sirven para poner el artículo o el plural (género conocido; plural de reglas.js sin cambio de tilde). */
export const NOMBRES = LEXICO.filter((e) => e.c === "n" && e.f <= 2 && (e.g === "m" || e.g === "f") && e.p.length >= 3 && e.p.length <= 9 && !/[\s-]/.test(e.p) && !NO_PLURAL.has(e.p)
  && !(e.g === "f" && /^h?[aá]/.test(e.p)) && plural(e.p) !== e.p && tildes(plural(e.p)) === tildes(e.p) && plural(e.p).length <= 11);

