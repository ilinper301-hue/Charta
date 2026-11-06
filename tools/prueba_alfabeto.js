// Charta · hoja de contactos del alfabeto de letras de trazo (lote 4b): para REVISAR cómo se forma cada letra.
// node tools/prueba_alfabeto.js [carpeta=/tmp] → alfabeto_1.svg … alfabeto_N.svg (A4, estilo «modelo» con punto verde y flechas
// numeradas, cuerpo de 14 mm sobre la pauta). Para verlas:  rsvg-convert -w 700 /tmp/alfabeto_1.svg -o /tmp/alfabeto_1.png
// Truco de medida: con escala 5/14, los «5 mm» de la pauta (TAMANOS_PAUTA) salen a 14 mm reales, ≥ 12 mm, donde caben las flechas.
import { writeFileSync } from "node:fs";
import { Papel, W, H, M } from "../src/render/papel.js";
import { renglones } from "../src/lengua/pauta.js";
import { LETRAS_TRAZO, escribirTrazos } from "../src/lengua/trazos.js";

const GRUPOS = [..."abcdefghijklmnñopqrstuvwxyz", ..."áéíóúü", ..."ABCDEFGHIJKLMNÑOPQRSTUVWXYZ", ..."ÁÉÍÓÚÜ", ..."0123456789", ".", ","];
const HUECO = 1.0;   // cuerpos entre letras (sitio para las flechas)

const filas = [[]]; let ancho = 0;
const C = new Papel({ escala: 5 / 14 }).mm(5);   // cuerpo en unidades de la página
for (const ch of GRUPOS) {
  const w = (LETRAS_TRAZO[ch].w + HUECO) * C;
  if (ancho + w > W - 2 * M && filas.at(-1).length) { filas.push([]); ancho = 0; }
  filas.at(-1).push(ch); ancho += w;
}
const POR_PAGINA = 6, carpeta = process.argv[2] || "/tmp";
for (let pg = 0; pg * POR_PAGINA < filas.length; pg++) {
  const p = new Papel({ escala: 5 / 14 }), grupo = filas.slice(pg * POR_PAGINA, (pg + 1) * POR_PAGINA);
  const { bases, c } = renglones(p, M, W - M, H - M - 10, grupo.length, { mm: 5, guia: true });
  grupo.forEach((fila, k) => {
    let x = M + 0.5 * c;
    for (const ch of fila) { x = escribirTrazos(p, ch, x, bases[k], c, { flechas: true }) + HUECO * c; }
  });
  const f = `${carpeta}/alfabeto_${pg + 1}.svg`;
  writeFileSync(f, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/><g stroke-linecap="round" stroke-linejoin="round">${p.o.join("")}</g></svg>`);
  console.log("Escrito", f);
}
