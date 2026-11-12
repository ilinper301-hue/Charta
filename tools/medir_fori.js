// Charta · fase 7 (R9) · mide el paquete de Fori (`charta:aFori`): tamaño por diapositiva y de las peores fichas.
// Uso: node tools/medir_fori.js [--lengua]   (las letras se simulan con el peso real de los WOFF en base64)
import fs from "node:fs";
import { generar } from "../src/nucleo/ficha.js";
import { listaTipos } from "../src/tipos/index.js";
import { render } from "../src/render/actividad.js";
import { paqueteFori } from "../src/fori/diapositivas.js";

const woff = (f) => Math.ceil(fs.statSync(new URL(`../src/fuentes/${f}.woff`, import.meta.url)).size * 4 / 3);
const cssFalso = (n) => `@font-face{font-family:"x";src:url(data:font/woff;base64,${"A".repeat(n)})}`;
const FUENTES = cssFalso(woff("Andika-Regular") + woff("Andika-Bold"));
const FUENTES_FREDOKA = FUENTES + cssFalso(woff("Fredoka"));
const cajas = (z) => Object.fromEntries([...z.svg.matchAll(/class="ej" data-ej="([^"]*)"/g)].map((m) => [m[1], { x: z.x, y: z.y, w: z.w, h: z.h }]));
const kb = (n) => (n / 1024).toFixed(0) + " KB";
console.log(`letras por diapositiva: Andika ${kb(FUENTES.length)}, con Fredoka ${kb(FUENTES_FREDOKA.length)}`);

const filas = [];
for (const id of listaTipos()) for (const tam of ["completa", "media"]) {
  let f; try { f = generar({ actividades: tam === "media" ? [{ tipo: id }, { tipo: id }] : [{ tipo: id }] }, 7); } catch { continue; }
  const p = paqueteFori(f, { cajas, fuentes: FUENTES });
  const json = JSON.stringify(p);
  filas.push({ id, tam, n: p.diapositivas.length, total: json.length, sinLetras: json.length - p.diapositivas.length * FUENTES.length });
}
filas.sort((a, b) => b.total - a.total);
console.log("peores (una página):"); for (const x of filas.slice(0, 8)) console.log(` ${x.id} ${x.tam}: ${x.n} diapositivas, ${kb(x.total)} (${kb(x.sinLetras)} sin letras)`);
const med = filas.reduce((s, x) => s + x.total, 0) / filas.length;
console.log(`media de una página: ${kb(med)}; máximo ${kb(filas[0].total)}`);
const w = filas[0], porDiapo = w.total / w.n;
console.log(`10 páginas como la peor: ≈ ${kb(porDiapo * w.n * 10)} (límite habitual de localStorage ≈ 5 MB de caracteres, compartido con las demás apps)`);
