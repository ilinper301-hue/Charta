// Charta · ver un tipo en PNG (sin motor de referencia; útil para los modelos de 2.º).
// Uso: node tools/ver_tipo.js <id> ['{"rango":999,"nivel":"con"}'] [--media] [--solucion] [--semilla N] [--salida f.png]
// Escribe /tmp/ver_<id>[_media][_sol].png (A4 a 100 ppp con rsvg-convert; letras del sistema, no Andika).
import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import "../src/tipos/index.js";
import { generar } from "../src/nucleo/ficha.js";
import { hoja } from "../src/render/hoja.js";

const args = process.argv.slice(2), flag = (f) => args.includes(f);
const valor = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined; };
const [id, json] = args.filter((a, i) => !a.startsWith("--") && !["--semilla", "--salida"].includes(args[i - 1]));
if (!id) { console.error("Uso: node tools/ver_tipo.js <id> ['{params}'] [--media] [--solucion] [--semilla N]"); process.exit(1); }
const params = json ? JSON.parse(json) : {}, media = flag("--media"), modo = flag("--solucion") ? "solucion" : "papel";
const acts = media ? [{ tipo: id, params }, { tipo: id, params }] : [{ tipo: id, params }];
const ficha = generar({ actividades: acts }, +(valor("--semilla") ?? 1));
const svg = hoja(ficha.paginas[0], { titulo: ficha.titulo, modo });
const base = `/tmp/ver_${id}${media ? "_media" : ""}${modo === "solucion" ? "_sol" : ""}`;
writeFileSync(base + ".svg", svg);
const png = valor("--salida") || base + ".png";
execFileSync("rsvg-convert", ["-d", "100", "-p", "100", "-o", png, base + ".svg"]);
console.log(png);
