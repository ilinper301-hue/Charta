// Charta · hoja de PRUEBA de la pauta Lamela y las letras de trazo (lote 4): para imprimirla y medirla con una regla.
// node tools/prueba_pauta.js [salida.html] → HTML A4 (mismo SVG y CSS de impresión que la app). Con Chrome:
//   google-chrome --headless --print-to-pdf=prueba_pauta.pdf --no-pdf-header-footer salida.html
// Lleva una regla de 10 cm (para comprobar que la impresión sale al 100 %), las pautas de 5, 4 y 3,5 mm con la
// muestra «a l g» (modelo, repaso, punteado) y, en la media página, la de 5 mm a la escala de media página.
import { writeFileSync, readFileSync } from "node:fs";
import { registrar } from "../src/nucleo/tipos.js";
import { hoja } from "../src/render/hoja.js";
import { M, W, TOP } from "../src/render/papel.js";
import { renglones, TAMANOS_PAUTA } from "../src/lengua/pauta.js";
import { escribirTrazos, anchoTrazos } from "../src/lengua/trazos.js";

const MUESTRA = "a l g";

function regla(p, x, y) {
  const cm = p.mm(10);
  p.line(x, y, x + 10 * cm, y, { lw: p.mm(0.25), gris: 0 });
  for (let i = 0; i <= 100; i++) {
    const h = i % 10 === 0 ? p.mm(3) : i % 5 === 0 ? p.mm(2) : p.mm(1);
    p.line(x + i * p.mm(1), y, x + i * p.mm(1), y + h, { lw: p.mm(0.15), gris: 0 });
  }
  p.text(x + 10 * cm + p.mm(2), y, "10 cm", p.mm(3.2), { f: "PR" });
}

function bloque(p, y, mm, filas) {
  const { bases, c } = renglones(p, M + 10, W - M - 10, y, filas, { mm, guia: true });
  p.text(M + 10, bases[0] + 2.1 * c, `Pauta de ${String(mm).replace(".", ",")} mm`, p.mm(3), { f: "PB", gris: 0.35 });
  const paso = (anchoTrazos(MUESTRA) + 1.4) * c;
  const estilos = ["modelo", "repaso", "punteado"];
  for (const [k, base] of bases.entries()) {
    if (k > 0) continue;
    estilos.forEach((e, i) => escribirTrazos(p, MUESTRA, M + 22 + i * paso, base, c, { estilo: e, punto: e !== "punteado" }));
  }
  return bases.at(-1) - c;    // borde inferior del bloque
}

registrar({
  id: "prueba.pauta", version: 1,
  generar: () => ({ datos: {}, solucion: { huecos: [] } }),
  dibujar(p) {
    let y = TOP - 4;
    regla(p, M + 10, y - p.mm(4)); y -= p.mm(12);
    if (p.parte < 1) { bloque(p, y, 5, 3); return; }
    for (const mm of TAMANOS_PAUTA) y = bloque(p, y, mm, 3) - p.mm(4);
  },
});

const act = (tamano, n, color) => ({ n, tipo: "prueba.pauta", tamano, color, enunciado: "Prueba de pauta: mide con una regla.", datos: {}, solucion: { huecos: [] } });
const svgCompleta = hoja({ actividades: [act("completa", 1, "verde")] }, { titulo: "Prueba de pauta Lamela" });
const svgMedias = hoja({ actividades: [act("media", 1, "azul"), act("media", 2, "amarillo")] }, { titulo: "Prueba de pauta (media página)" });
const woff = (f) => readFileSync(new URL(`../src/fuentes/${f}`, import.meta.url)).toString("base64");
const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:Andika;src:url(data:font/woff;base64,${woff("Andika-Regular.woff")})}
@font-face{font-family:Andika;font-weight:bold;src:url(data:font/woff;base64,${woff("Andika-Bold.woff")})}
@page{size:A4 portrait;margin:0}body{margin:0}.pag{width:210mm;height:297mm;overflow:hidden;break-after:page}
.pag:last-child{break-after:auto}svg{display:block;width:210mm;height:297mm}</style>
<div class="pag">${svgCompleta}</div><div class="pag">${svgMedias}</div>`;
const salida = process.argv[2] || "/tmp/prueba_pauta.html";
writeFileSync(salida, html);
console.log("Escrito", salida);
