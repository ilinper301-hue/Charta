// Charta · mide la letra impresa de cada tipo (paso 4 de «Espacio en la ficha»: ninguna letra < 9 pt reales).
// Uso: node tools/medir_letra.js [--tipo id] [--min 9] [--semillas 3] [--sin-mas] [--todas] [--detalle] [--curso 2]
//  --curso 2: solo los tipos de Lengua que están también en 2.º, con sus opciones de 2.º (palabras de 5 sílabas, frases de 8 palabras…).
//  Para cada tipo: completa y media, opciones por defecto, y con cantidad "mas" si el tipo la admite; además una
//  muestra de combinaciones de opciones (--todas: todas). Dibuja la hoja (render/hoja.js, modo papel) y calcula
//  el tamaño efectivo de cada <text> = font-size × escalas de los transforms ancestros (translate/scale/rotate/matrix).
// Excluye: lo que solo existe en modo solución (respuestas en rojo; no se dibujan en papel), el texto vacío y los
//  textos de «pega aquí / dibuja aquí» (marcas para el alumno que no son lectura). Informe: por tipo, mínimo y textos < min.
import "../src/tipos/index.js";
import { generar } from "../src/nucleo/ficha.js";
import { listaTipos } from "../src/tipos/index.js";
import { tipo } from "../src/nucleo/tipos.js";
import { hoja } from "../src/render/hoja.js";
import { combinaciones, cursosDePrueba } from "../tests/comun.js";

const args = process.argv.slice(2);
const val = (f, d) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : d; };
const CURSO = +val("--curso", 0), SOLO = val("--tipo"), SEMILLAS = +val("--semillas", 3), MIN = +val("--min", 9), TODAS = args.includes("--todas"), SIN_MAS = args.includes("--sin-mas"), DETALLE = args.includes("--detalle");
const EXCLUIR = /^(pega|pegar|dibuja|dibuja aqu)[^a-z]*(aqu|el dibujo)/i;

/** Escala de un transform SVG (translate/scale/rotate/matrix): factor sobre la longitud (sqrt|det|). */
export function escalaTransform(t) {
  let k = 1;
  for (const [, fn, a] of t.matchAll(/(\w+)\(([^)]*)\)/g)) {
    const n = a.split(/[\s,]+/).filter(Boolean).map(Number);
    if (fn === "scale") k *= Math.sqrt(Math.abs(n[0] * (n.length > 1 ? n[1] : n[0])));
    else if (fn === "matrix") k *= Math.sqrt(Math.abs(n[0] * n[3] - n[1] * n[2]));
  }
  return k;
}

/** Textos de un SVG: [{ s, pt }] con pt = font-size × escala acumulada. */
export function textosSvg(svg) {
  const pila = [], out = [], re = /<(\/?)([A-Za-z][\w:-]*)([^>]*?)(\/?)>([^<]*)/g;
  let m, texto = null;
  while ((m = re.exec(svg))) {
    const [, cierra, nom, attrs, auto, resto] = m;
    if (cierra) {
      if (nom === "text" && texto) { out.push({ s: texto.s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim(), pt: texto.fs * texto.k }); texto = null; }
      else pila.pop();
      continue;
    }
    const tr = /transform="([^"]*)"/.exec(attrs), k0 = pila.length ? pila[pila.length - 1] : 1;
    const k = k0 * (tr ? escalaTransform(tr[1]) : 1);
    if (nom === "text") { texto = { s: resto, fs: +(/font-size="([\d.]+)"/.exec(attrs)?.[1] ?? 16), k }; continue; }
    if (nom === "tspan") continue;
    if (!auto) pila.push(k);
  }
  return out;
}

const ids = listaTipos().filter((id) => (!SOLO || id === SOLO) && (CURSO !== 2 || cursosDePrueba(id).includes(2)));
const muestra = (cs) => (TODAS || cs.length <= 4 ? cs : [0, 1, 2, 3].map((i) => cs[Math.floor(i * (cs.length - 1) / 3)]));
const sinTexto = (e) => !e.s || EXCLUIR.test(e.s);
let combos = 0, bajo = 0;
const resumen = [];
for (const id of ids) {
  const T2 = tipo(id);
  let cs = [{}];
  try { cs = muestra([{}, ...combinaciones(id, CURSO === 2 ? 2 : cursosDePrueba(id)[0]).filter((c) => Object.keys(c).length)]); } catch { /* sin combinaciones */ }
  const malas = new Map(); let min = Infinity, nBajo = 0, n = 0;
  for (const params of cs) for (const tam of ["completa", "media"]) for (const cant of T2?.cantidad && !SIN_MAS ? ["grandes", "mas"] : ["grandes"]) for (let sem = 1; sem <= SEMILLAS; sem++) {
    const a1 = CURSO === 2 ? { tipo: id, params, curso: 2 } : { tipo: id, params };
    const acts = tam === "media" ? [a1, a1] : [a1];
    let f; try { f = generar({ actividades: acts, cantidad: cant }, sem); } catch { continue; }
    n++; combos++;
    let peor = Infinity;
    for (const pag of f.paginas) for (const e of textosSvg(hoja(pag, { titulo: f.titulo }))) {
      if (sinTexto(e)) continue;
      peor = Math.min(peor, e.pt); min = Math.min(min, e.pt);
      if (e.pt < MIN - 0.005) { const k = e.s.slice(0, 40); const o = malas.get(k) ?? { pt: e.pt, n: 0 }; o.pt = Math.min(o.pt, e.pt); o.n++; malas.set(k, o); }
    }
    if (peor < MIN - 0.005) { nBajo++; bajo++; }
  }
  resumen.push({ id, n, nBajo, min, malas });
}
const con = resumen.filter((r) => r.nBajo);
for (const r of con) {
  console.log(`${r.id}  mín ${r.min.toFixed(1)} pt  (${r.nBajo}/${r.n} combinaciones)`);
  if (DETALLE || SOLO) for (const [s, o] of [...r.malas].sort((a, b) => a[1].pt - b[1].pt).slice(0, 8)) console.log(`   ${o.pt.toFixed(1)} pt  «${s}»`);
  else { const [s, o] = [...r.malas].sort((a, b) => a[1].pt - b[1].pt)[0]; console.log(`   peor: ${o.pt.toFixed(1)} pt «${s}»`); }
}
console.log(`\n${ids.length} tipos, ${combos} combinaciones medidas; ${bajo} con letra < ${MIN} pt en ${con.length} tipos.`);
if (!SOLO && ids.length) console.log("Mínimo global: " + Math.min(...resumen.map((r) => r.min)).toFixed(1) + " pt");
if (bajo) process.exitCode = 1;
