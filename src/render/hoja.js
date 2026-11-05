// Charta · paso 2.4 · página A4 completa en SVG: Nombre (impreso o línea en blanco), Fecha, título
// y 1 o 2 paneles con su actividad. Port de encabezado(), panel() y pagina() del motor.
// opciones: { titulo, nombre = "", bn = false (blanco y negro / ahorro de tinta), modo = "papel" | "solucion", uid, fuente (de fuentes.js; por defecto Andika),
//   grande = false (letra grande en cabecera y enunciado), facil = false (lectura fácil: letra grande + una frase por línea) }
import { Papel, W, H, M, INK, ZONA } from "./papel.js";
import { render } from "./actividad.js";
import { fuenteDe, FUENTE_POR_DEFECTO } from "./fuentes.js";

export const AZUL = "#1F4E79";
/** PALETA del motor: [relleno, borde] de cada panel. */
export const PALETA = { amarillo: ["#fff7e6", "#f7e7c4"], rosa: ["#fbeff3", "#f2d6df"], azul: ["#eef5fc", "#d1e2f3"], verde: ["#edf7ee", "#c7e0cc"] };
/** PANEL_COMPLETO del motor (x, yAbajo, w, h); con dos actividades, dos mitades separadas 12 pt. */
const PX = 34, PY = 26, PW = W - 68, PH = H - 108 - 26, GAP = 12;
export function rectsPanel(n) {
  if (n === 1) return [[PX, PY, PW, PH]];
  const hh = (PH - GAP) / 2;
  return [[PX, PY + hh + GAP, PW, hh], [PX, PY, PW, hh]];
}
const f2 = (x) => String(Math.round(x * 1000) / 1000);

/** "Título de la ficha" en minúsculas con inicial mayúscula, como _titulo() del motor. */
function tituloMotor(t) {
  const s = t.toLowerCase().replace(" d y u", " D y U"), k = s.search(/\p{L}/u);
  return k < 0 ? s : s.slice(0, k) + s[k].toUpperCase() + s.slice(k + 1);
}

function encabezado(p, titulo, nombre, bn, grande) {
  const fe = grande ? 13 : 10.5;
  p.text(34, H - 46, "Nombre:", fe, { f: "PR" }); p.text(360, H - 46, "Fecha:", fe, { f: "PR" });
  const x0 = 34 + p.ancho("Nombre: ", "PR", fe);
  p.line(x0, H - 48, 332, H - 48, { lw: 0.8, gris: 0 });
  p.line(360 + p.ancho("Fecha: ", "PR", fe), H - 48, 533, H - 48, { lw: 0.8, gris: 0 });
  if (nombre) {
    let fs = grande ? 14 : 12;
    while (p.ancho(nombre, "PM", fs) > 332 - x0 - 8 && fs > 7) fs -= 0.5;
    p.text(x0 + 4, H - 45, nombre, fs, { f: "PM" });
  }
  const tt = tituloMotor(titulo);
  let fs = grande ? 20 : 16;
  while (p.ancho(tt, "PB", fs) > W - 80 && fs > 10) fs -= 0.5;
  p.text(W / 2, H - 86, tt, fs, { f: "PB", anchor: "middle", gris: bn ? INK : AZUL });
}

/** Líneas del enunciado. Normal: las del motor. Grande: letra mayor, partiendo las líneas largas por palabras.
 *  Fácil: además, una frase por línea. Devuelve { lineas, fs, lh } (lh = interlineado). */
function enunciadoLineas(p, texto, ancho, grande, facil) {
  let lineas = texto.split("\n");
  if (!grande) return { lineas, fs: 0, lh: 16 };
  const fs = facil ? 15 : 14;
  if (facil) lineas = lineas.flatMap((l) => l.split(/(?<=[.:;?!])\s+/));
  const partidas = [];
  for (const l of lineas) {
    let actual = "";
    for (const pal of l.split(" ")) {
      const prueba = actual ? actual + " " + pal : pal;
      if (actual && p.ancho(prueba, "PR", fs) > ancho) { partidas.push(actual); actual = pal; } else actual = prueba;
    }
    partidas.push(actual);
  }
  return { lineas: partidas, fs, lh: fs * 1.4 };
}

function panel(p, act, rect, { bn, modo, clip, grande, facil, fuente }) {
  const [x, yB, w, h] = rect, yT = yB + h;
  const en = enunciadoLineas(p, act.enunciado, w - 72, grande, facil);
  const lineas = en.lineas, extra = en.lh * (lineas.length - 1);
  const [fill, borde] = bn ? ["#ffffff", "#8c8c8c"] : PALETA[act.color];
  p.rrect(x, yB, w, h, 14, { lw: 1, fill, stroke: borde });
  if (bn) p.circle(x + 24, yT - 22, 11, { lw: 1.4, fill: 1, stroke: INK });
  else p.circle(x + 24, yT - 22, 11, { fill: AZUL, stroke: null });
  p.text(x + 24, yT - 26, String(act.n), 11, { f: "PB", anchor: "middle", gris: bn ? INK : 1 });
  let fs = en.fs || 11.5;
  while (lineas.some((t) => p.ancho(t, "PR", fs) > w - 59) && fs > 8) fs -= 0.5;
  lineas.forEach((t, j) => p.text(x + 45, yT - 26 - j * en.lh, t, fs, { f: "PR" }));
  // Encaje de la zona de página (como panel()): punto (X, Y) → (sc·X + e, sc·Y + fy), y hacia arriba.
  const z = render(act, modo, fuente), parte = act.tamano === "media" ? 0.5 : 1;
  const hi = (yT - 43 - extra) - (yB + 14), alto = ZONA.alto * parte, base = ZONA.yArriba - alto;
  const sc = Math.min((w - 31) / ZONA.w, hi / alto);
  const e = x + w / 2 - ZONA.w * sc / 2 - sc * M, fy = (yB + 14) + (parte < 1 ? hi - alto * sc : 0) - sc * base;
  p.o.push(`<clipPath id="${clip}"><rect x="${f2(x)}" y="${f2(H - yT)}" width="${f2(w)}" height="${f2(h)}" rx="14"/></clipPath>`);
  p.o.push(`<g clip-path="url(#${clip})" class="actividad" data-n="${act.n}"><g transform="translate(${f2(e)} ${f2(H - fy - sc * H)}) scale(${f2(sc)})">${z.svg}</g></g>`);
}

/** SVG de una página (pagina = { actividades: [...] } de la ficha). */
export function hoja(pagina, { titulo, nombre = "", bn = false, modo = "papel", uid = "h", grande = false, facil = false, fuente = FUENTE_POR_DEFECTO } = {}) {
  grande = grande || facil;
  const acts = pagina.actividades;
  if (acts.length < 1 || acts.length > 2) throw new Error("Una página lleva 1 o 2 actividades.");
  const p = new Papel({ modo, fuente });
  encabezado(p, titulo, nombre, bn, grande);
  const rects = rectsPanel(acts.length);
  acts.forEach((a, i) => panel(p, a, rects[i], { bn, modo, clip: `${uid}c${i}`, grande, facil, fuente }));
  return `<svg xmlns="http://www.w3.org/2000/svg" class="hoja-svg" viewBox="0 0 ${f2(W)} ${f2(H)}" width="210mm" height="297mm">` +
    `<rect width="${f2(W)}" height="${f2(H)}" fill="#fff"/><g stroke-linecap="round" stroke-linejoin="round">${p.o.join("")}</g></svg>`;
}

/** Opciones de lectura y letra de la ficha (`presentacion.letraGrande` / `lecturaFacil` / `fuente`). */
export function estiloLectura(ficha) {
  const p = ficha.presentacion || {};
  return { grande: !!p.letraGrande, facil: !!p.lecturaFacil, fuente: fuenteDe(ficha) };
}

/**
 * Páginas para imprimir: una por alumno (o `copias` con la línea en blanco si no hay alumnos).
 * Con variantes > 1, el alumno i recibe la variante i % variantes. Devuelve [{ nombre, variante, svg }].
 * Los nombres solo se usan aquí, en el dispositivo: nunca entran en la ficha.
 */
export function hojas(ficha, { nombres = [], copias = 1, bn = false, modo = "papel" } = {}) {
  const lista = nombres.map((s) => String(s).trim()).filter(Boolean);
  const quienes = lista.length ? lista : Array(Math.max(1, copias | 0)).fill("");   // sin alumnos: copias con la línea en blanco
  return quienes.map((nombre, i) => {
    const v = i % ficha.variantes;
    const pag = (v === 0 ? ficha.paginas : ficha.variantesDatos[v - 1].paginas)[0];
    return { nombre, variante: v, svg: hoja(pag, { titulo: ficha.titulo, nombre, bn, modo, uid: `h${i}${modo[0]}`, ...estiloLectura(ficha) }) };
  });
}
