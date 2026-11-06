// Charta · Lengua · letras de trazo (una sola línea) para la pauta Lamela (lote 4 de LENGUA_1.md).
// Formas de Fredoka (a y g de un piso), en unidades de la pauta: base y = 0, cuerpo y = 1, asta hasta 1,8, rabo hasta −0,8.
// Cada letra: { w (ancho del dibujo), t: [trazo…] } en el ORDEN en que se escribe; cada trazo: { d: [segmento…], lado }.
//   Segmentos: ["M", x, y] · ["L", x, y] · ["A", cx, cy, rx, ry, a0, a1] (arco de elipse en grados, y hacia arriba;
//   a1 > a0 = sentido contrario a las agujas del reloj). El trazo empieza en su primer punto.
//   lado: +1 / −1, a qué lado del trazo va la flecha numerada (por defecto +1 = a la derecha del sentido de la marcha).
//   en: dónde va la flecha, en fracción del PRIMER segmento (0 = al empezar; por defecto 0).
// Pinta en un Papel como «modelo» (negro + punto verde de inicio + flechas numeradas), «repaso» (gris claro) o «punteado».

/** Separación entre letras, en cuerpos. */
export const ESPACIO_LETRA = 0.32;
export const VERDE_INICIO = "#2E7D32";
export const COLOR_FLECHA = "#1F4E79";

const BOLA = (desde = 40) => ["A", 0.45, 0.5, 0.45, 0.5, desde, desde + 360];   // panza de a, g, d, q: empieza arriba a la derecha y gira a la izquierda

// Ayudantes de dibujo (todo en unidades de la pauta).
const pl = (...pts) => pts.map(([x, y], i) => [i ? "L" : "M", x, y]);                      // polilínea
const ar = (cx, cy, rx, ry, a0, a1) => ["A", cx, cy, rx, ry, a0, a1];                       // arco de elipse
const T = (d, extra = {}) => ({ d, ...extra });
const tallo = (x, y0, y1, extra) => T(pl([x, y0], [x, y1]), extra);                         // trazo vertical
const barra = (x0, x1, y, extra) => T(pl([x0, y], [x1, y]), extra);                         // trazo horizontal
const punto = (x, y) => T([ar(x, y, 0.035, 0.035, 0, 360)]);                                // punto (círculo diminuto; con el trazo grueso sale relleno)
const ARCO_N = (x0, rx, y = 0.55, ry = 0.45) => ar(x0 + rx, y, rx, ry, 180, 0);             // arco de n, h, m: de la izquierda por arriba a la derecha
const BOLA_B = (x0 = 0.1) => ar(x0 + 0.45, 0.5, 0.45, 0.5, 180, -180);                      // panza de b y p: empieza en el asta y gira a la derecha
const CAP = 1.8;                                                                             // altura de mayúsculas y dígitos

export const LETRAS_TRAZO = {
  a: { w: 0.9, t: [{ d: [BOLA()], en: 50 / 360 }, { d: [["M", 0.9, 1], ["L", 0.9, 0]], lado: -1, en: 0.45 }] },
  l: { w: 0.2, t: [{ d: [["M", 0.1, 1.8], ["L", 0.1, 0]], en: 0.25 }] },
  g: { w: 0.9, t: [{ d: [BOLA()], en: 50 / 360 }, { d: [["M", 0.9, 1], ["L", 0.9, -0.4], ["A", 0.5, -0.4, 0.4, 0.4, 0, -165]], lado: -1, en: 0.3 }] },
  // ---- minúsculas
  b: { w: 1, t: [tallo(0.1, 1.8, 0, { en: 0.25 }), T([BOLA_B()], { en: 0.1 })] },
  c: { w: 0.85, t: [T([ar(0.45, 0.5, 0.45, 0.5, 45, 315)], { en: 0.1 })] },
  d: { w: 0.9, t: [{ d: [BOLA()], en: 50 / 360 }, tallo(0.9, 1.8, 0, { lado: -1, en: 0.25 })] },
  e: { w: 0.9, t: [T([...pl([0, 0.5], [0.9, 0.5]), ar(0.45, 0.5, 0.45, 0.5, 0, 320)], { lado: -1 })] },
  f: { w: 0.85, t: [T([ar(0.55, 1.5, 0.25, 0.3, 20, 180), ["L", 0.3, 0]], { lado: -1, en: 0.2 }), barra(0, 0.6, 1)] },
  h: { w: 1, t: [tallo(0.1, 1.8, 0, { en: 0.25 }), T([ARCO_N(0.1, 0.4), ["L", 0.9, 0]], { en: 0.35 })] },
  i: { w: 0.3, t: [tallo(0.15, 1, 0, { en: 0.25 }), punto(0.15, 1.4)] },
  j: { w: 0.6, t: [T([...pl([0.5, 1], [0.5, -0.4]), ar(0.2, -0.4, 0.3, 0.4, 0, -140)], { lado: -1, en: 0.3 }), punto(0.5, 1.4)] },
  k: { w: 0.9, t: [tallo(0.1, 1.8, 0, { en: 0.25 }), T(pl([0.8, 1], [0.1, 0.35], [0.85, 0]), { lado: -1 })] },
  m: { w: 1.2, t: [tallo(0.1, 1, 0, { en: 0.25 }), T([ARCO_N(0.1, 0.25), ["L", 0.6, 0]], { en: 0.3 }),
    T([ARCO_N(0.6, 0.25), ["L", 1.1, 0]], { en: 0.3 })] },
  n: { w: 1, t: [tallo(0.1, 1, 0, { en: 0.25 }), T([ARCO_N(0.1, 0.4), ["L", 0.9, 0]], { en: 0.35 })] },
  o: { w: 0.9, t: [T([ar(0.45, 0.5, 0.45, 0.5, 90, 450)], { en: 0.1 })] },
  p: { w: 1, t: [tallo(0.1, 1, -0.8, { en: 0.25 }), T([BOLA_B()], { en: 0.1 })] },
  q: { w: 0.9, t: [{ d: [BOLA()], en: 50 / 360 }, tallo(0.9, 1, -0.8, { lado: -1, en: 0.25 })] },
  r: { w: 0.7, t: [tallo(0.1, 1, 0, { en: 0.25 }), T([ar(0.45, 0.55, 0.35, 0.45, 180, 70)], { en: 0.35 })] },
  s: { w: 0.8, t: [T([ar(0.42, 0.75, 0.35, 0.25, 30, 270), ar(0.42, 0.25, 0.35, 0.25, 90, -150)], { en: 0.1 })] },
  t: { w: 0.65, t: [T([...pl([0.3, 1.45], [0.3, 0.25]), ar(0.55, 0.25, 0.25, 0.25, 180, 290)], { en: 0.15 }), barra(0, 0.6, 1)] },
  u: { w: 1, t: [T([...pl([0.1, 1], [0.1, 0.4]), ar(0.5, 0.4, 0.4, 0.4, 180, 360)], { lado: -1, en: 0.3 }), tallo(0.9, 1, 0, { lado: -1, en: 0.25 })] },
  v: { w: 0.9, t: [T(pl([0.05, 1], [0.45, 0], [0.85, 1]))] },
  w: { w: 1.1, t: [T(pl([0.05, 1], [0.3, 0], [0.55, 1], [0.8, 0], [1.05, 1]))] },
  x: { w: 0.8, t: [T(pl([0.05, 1], [0.75, 0])), T(pl([0.75, 1], [0.05, 0]), { lado: -1 })] },
  y: { w: 0.9, t: [T(pl([0.05, 1], [0.49, 0])), T(pl([0.85, 1], [0.2, -0.8]), { lado: -1 })] },
  z: { w: 0.85, t: [T(pl([0.05, 1], [0.8, 1], [0.05, 0], [0.8, 0]), { lado: -1 })] },
  // ---- mayúsculas
  A: { w: 1.1, t: [T(pl([0.05, 0], [0.55, CAP], [1.05, 0]), { lado: -1 }), barra(0.25, 0.85, 0.6)] },
  B: { w: 1.1, t: [tallo(0.1, CAP, 0, { en: 0.25 }), T([...pl([0.1, CAP], [0.5, CAP]), ar(0.5, 1.35, 0.4, 0.45, 90, -90), ["L", 0.1, 0.9]], { lado: -1 }),
    T([...pl([0.1, 0.9], [0.55, 0.9]), ar(0.55, 0.45, 0.45, 0.45, 90, -90), ["L", 0.1, 0]], { lado: -1 })] },
  C: { w: 1.1, t: [T([ar(0.55, 0.9, 0.5, 0.9, 45, 315)], { en: 0.1 })] },
  D: { w: 1.1, t: [tallo(0.1, CAP, 0, { en: 0.25 }), T([...pl([0.1, CAP], [0.4, CAP]), ar(0.4, 0.9, 0.6, 0.9, 90, -90), ["L", 0.1, 0]], { lado: -1 })] },
  E: { w: 0.95, t: [T(pl([0.85, CAP], [0.1, CAP], [0.1, 0], [0.85, 0]), { lado: -1 }), barra(0.1, 0.75, 0.9)] },
  F: { w: 0.95, t: [T(pl([0.85, CAP], [0.1, CAP], [0.1, 0]), { lado: -1 }), barra(0.1, 0.7, 0.95)] },
  G: { w: 1.1, t: [T([ar(0.55, 0.9, 0.5, 0.9, 45, 360), ["L", 0.6, 0.9]], { en: 0.1 })] },
  H: { w: 1, t: [tallo(0.1, CAP, 0, { en: 0.25 }), tallo(0.9, CAP, 0, { lado: -1, en: 0.25 }), barra(0.1, 0.9, 0.9)] },
  I: { w: 0.8, t: [tallo(0.4, CAP, 0, { en: 0.25 }), barra(0.15, 0.65, CAP), barra(0.15, 0.65, 0)] },
  J: { w: 0.85, t: [T([...pl([0.8, CAP], [0.8, 0.4]), ar(0.45, 0.4, 0.35, 0.4, 0, -150)], { lado: -1, en: 0.2 })] },
  K: { w: 1.05, t: [tallo(0.1, CAP, 0, { en: 0.25 }), T(pl([0.9, CAP], [0.1, 0.75]), { lado: -1 }), T(pl([0.35, 1.07], [0.95, 0]))] },
  L: { w: 0.9, t: [T(pl([0.1, CAP], [0.1, 0], [0.8, 0]), { en: 0.25 })] },
  M: { w: 1.2, t: [T(pl([0.1, 0], [0.1, CAP], [0.6, 0.5], [1.1, CAP], [1.1, 0]), { lado: -1, en: 0.25 })] },
  N: { w: 1, t: [T(pl([0.1, 0], [0.1, CAP], [0.9, 0], [0.9, CAP]), { lado: -1, en: 0.25 })] },
  O: { w: 1.1, t: [T([ar(0.55, 0.9, 0.5, 0.9, 90, 450)], { en: 0.1 })] },
  P: { w: 1, t: [tallo(0.1, CAP, 0, { en: 0.25 }), T([...pl([0.1, CAP], [0.45, CAP]), ar(0.45, 1.3, 0.45, 0.5, 90, -90), ["L", 0.1, 0.8]], { lado: -1 })] },
  Q: { w: 1.1, t: [T([ar(0.55, 0.9, 0.5, 0.9, 90, 450)], { en: 0.1 }), T(pl([0.65, 0.45], [1.05, -0.25]))] },
  R: { w: 1, t: [tallo(0.1, CAP, 0, { en: 0.25 }), T([...pl([0.1, CAP], [0.45, CAP]), ar(0.45, 1.3, 0.45, 0.5, 90, -90), ["L", 0.1, 0.8]], { lado: -1 }), T(pl([0.4, 0.8], [0.95, 0]))] },
  S: { w: 1, t: [T([ar(0.5, 1.35, 0.4, 0.45, 30, 270), ar(0.5, 0.45, 0.4, 0.45, 90, -150)], { en: 0.1 })] },
  T: { w: 1, t: [barra(0.05, 0.95, CAP), tallo(0.5, CAP, 0, { en: 0.25 })] },
  U: { w: 1, t: [T([...pl([0.1, CAP], [0.1, 0.6]), ar(0.5, 0.6, 0.4, 0.6, 180, 360), ["L", 0.9, CAP]], { lado: -1, en: 0.2 })] },
  V: { w: 1.1, t: [T(pl([0.05, CAP], [0.55, 0], [1.05, CAP]))] },
  W: { w: 1.3, t: [T(pl([0.05, CAP], [0.35, 0], [0.65, CAP], [0.95, 0], [1.25, CAP]))] },
  X: { w: 1, t: [T(pl([0.05, CAP], [0.95, 0])), T(pl([0.95, CAP], [0.05, 0]), { lado: -1 })] },
  Y: { w: 1, t: [T(pl([0.05, CAP], [0.5, 0.9])), T(pl([0.95, CAP], [0.5, 0.9], [0.5, 0]), { lado: -1 })] },
  Z: { w: 1, t: [T(pl([0.1, CAP], [0.9, CAP], [0.1, 0], [0.9, 0]), { lado: -1 })] },
  // ---- dígitos
  0: { w: 0.9, t: [T([ar(0.45, 0.9, 0.4, 0.9, 90, 450)], { en: 0.1 })] },
  1: { w: 0.7, t: [T(pl([0.15, 1.4], [0.5, CAP], [0.5, 0]), { lado: -1 })] },
  2: { w: 1, t: [T([ar(0.5, 1.35, 0.4, 0.45, 180, -35), ["L", 0.1, 0], ["L", 0.95, 0]], { en: 0.1 })] },
  3: { w: 1, t: [T([ar(0.5, 1.35, 0.38, 0.45, 150, -90), ar(0.5, 0.45, 0.42, 0.45, 90, -150)], { en: 0.1 })] },
  4: { w: 1, t: [T(pl([0.7, CAP], [0.05, 0.55], [0.95, 0.55]), { lado: -1 }), tallo(0.7, CAP, 0)] },
  5: { w: 1, t: [T([...pl([0.85, CAP], [0.2, CAP], [0.15, 0.9]), ar(0.5, 0.5, 0.4, 0.5, 150, -150)], { lado: -1 })] },
  6: { w: 1, t: [T([ar(0.9, 0.9, 0.8, 0.9, 100, 180), ["L", 0.1, 0.5], ar(0.5, 0.5, 0.4, 0.5, 180, 540)], { lado: -1 })] },
  7: { w: 1, t: [T(pl([0.1, CAP], [0.9, CAP], [0.35, 0]), { lado: -1 })] },
  8: { w: 1, t: [T([ar(0.5, 1.35, 0.35, 0.45, 90, 270), ar(0.5, 0.45, 0.42, 0.45, 90, -270), ar(0.5, 1.35, 0.35, 0.45, 270, 450)], { en: 0.1 })] },
  9: { w: 1, t: [T([ar(0.5, 1.3, 0.4, 0.5, 0, 360), ["L", 0.9, 0.9], ar(0.1, 0.9, 0.8, 0.9, 0, -80)], { lado: -1, en: 0.1 })] },
  // ---- puntuación (sobre la base)
  ".": { w: 0.25, t: [punto(0.12, 0.08)] },
  ",": { w: 0.25, t: [T(pl([0.15, 0.12], [0.05, -0.25]))] },
};

/** Adornos (tilde, virgulilla, diéresis) como trazos propios, centrados en cx a la altura y. */
const ADORNOS = {
  tilde: (cx, y) => [T(pl([cx - 0.1, y - 0.15], [cx + 0.12, y + 0.15]))],
  tilde_n: (cx, y) => [T([ar(cx - 0.15, y, 0.15, 0.14, 180, 0), ar(cx + 0.15, y, 0.15, 0.14, 180, 360)])],
  dieresis: (cx, y) => [punto(cx - 0.17, y), punto(cx + 0.17, y)],
};
/** Letra con adorno: reutiliza los trazos de la letra base (sin copiar datos) y añade el adorno al final. quitarPunto: la «i» sin punto. */
function conAdorno(base, tipo, may, { quitarPunto = false } = {}) {
  const B = LETRAS_TRAZO[base], y = { tilde: may ? 2.13 : 1.5, tilde_n: may ? 2.15 : 1.45, dieresis: may ? 2.1 : 1.4 }[tipo];
  return { w: B.w, ador: true, t: [...(quitarPunto ? B.t.slice(0, 1) : B.t), ...ADORNOS[tipo](B.w / 2, y)] };
}
Object.assign(LETRAS_TRAZO, {
  "á": conAdorno("a", "tilde"), "é": conAdorno("e", "tilde"), "í": conAdorno("i", "tilde", false, { quitarPunto: true }),
  "ó": conAdorno("o", "tilde"), "ú": conAdorno("u", "tilde"), "ü": conAdorno("u", "dieresis"), "ñ": conAdorno("n", "tilde_n"),
  "Á": conAdorno("A", "tilde", true), "É": conAdorno("E", "tilde", true), "Í": conAdorno("I", "tilde", true),
  "Ó": conAdorno("O", "tilde", true), "Ú": conAdorno("U", "tilde", true), "Ü": conAdorno("U", "dieresis", true), "Ñ": conAdorno("N", "tilde_n", true),
});

const rad = (g) => (g * Math.PI) / 180;
const enArco = (cx, cy, rx, ry, a) => [cx + rx * Math.cos(rad(a)), cy + ry * Math.sin(rad(a))];

/** Trazo → { ini: [x, y], dir: [dx, dy] (unitario), flecha: { p, d } (dónde y hacia dónde va la flecha), cmds } en unidades de la pauta (cmds para Papel.path, ya en y hacia arriba). */
export function trazoACurvas(trazo) {
  const cmds = []; let ini = null, dir = null, pos = null, flecha = null;
  const f = trazo.en ?? 0;
  const empezar = (x, y) => { if (!pos) { ini = [x, y]; cmds.push(["M", x, y]); } else if (Math.hypot(x - pos[0], y - pos[1]) > 1e-6) cmds.push(["L", x, y]); };
  for (const s of trazo.d) {
    if (s[0] === "M") { if (pos) throw new Error("Un trazo solo tiene un «M» (al principio)."); empezar(s[1], s[2]); pos = [s[1], s[2]]; }
    else if (s[0] === "L") {
      if (!pos) throw new Error("El trazo empieza con «M» o «A».");
      if (!dir) { dir = [s[1] - pos[0], s[2] - pos[1]]; flecha = { p: [pos[0] + f * dir[0], pos[1] + f * dir[1]], d: dir }; }
      cmds.push(["L", s[1], s[2]]); pos = [s[1], s[2]];
    } else if (s[0] === "A") {
      const [, cx, cy, rx, ry, a0, a1] = s, sg = Math.sign(a1 - a0);
      empezar(...enArco(cx, cy, rx, ry, a0));
      if (!dir) {
        dir = [-rx * Math.sin(rad(a0)) * sg, ry * Math.cos(rad(a0)) * sg];
        const af = a0 + f * (a1 - a0);
        flecha = { p: enArco(cx, cy, rx, ry, af), d: [-rx * Math.sin(rad(af)) * sg, ry * Math.cos(rad(af)) * sg] };
      }
      const n = Math.max(1, Math.ceil(Math.abs(a1 - a0) / 90)), da = (a1 - a0) / n, k = (4 / 3) * Math.tan(rad(da) / 4);
      for (let i = 0; i < n; i++) {
        const t0 = rad(a0 + i * da), t1 = rad(a0 + (i + 1) * da);
        const [x0, y0] = [cx + rx * Math.cos(t0), cy + ry * Math.sin(t0)], [x3, y3] = [cx + rx * Math.cos(t1), cy + ry * Math.sin(t1)];
        cmds.push(["C", x0 - k * rx * Math.sin(t0), y0 + k * ry * Math.cos(t0), x3 + k * rx * Math.sin(t1), y3 - k * ry * Math.cos(t1), x3, y3]);
      }
      pos = enArco(cx, cy, rx, ry, a1);
    } else throw new Error(`Segmento desconocido: ${s[0]}`);
  }
  const u = ([x, y]) => { const m = Math.hypot(x, y); return [x / m, y / m]; };
  return { ini, dir: u(dir), flecha: { p: flecha.p, d: u(flecha.d) }, cmds };
}

/** ¿Hay letra de trazo para este carácter? */
export const hayTrazo = (ch) => ch === " " || Object.hasOwn(LETRAS_TRAZO, ch);

/** Ancho de un texto en cuerpos (sin el espacio tras la última letra). Espacio = 0,7 cuerpos. */
export function anchoTrazos(texto) {
  let w = 0;
  [...texto].forEach((ch, i) => {
    if (ch === " ") w += 0.7;
    else { const L = LETRAS_TRAZO[ch]; if (!L) throw new Error(`Falta la letra de trazo «${ch}».`); w += L.w; }
    if (i < [...texto].length - 1) w += ESPACIO_LETRA;
  });
  return w;
}

/**
 * Escribe `texto` con letras de trazo en (x, base), cuerpo c (unidades del papel). Devuelve la x final.
 * estilo: "modelo" (negro, punto verde y flechas numeradas) · "repaso" (gris claro) · "punteado".
 * punto: punto verde de inicio en cada trazo (en el modelo siempre). flechas: flechas numeradas del modelo
 * (por defecto solo si el cuerpo mide 12 mm o más: a 5 mm no se leen).
 */
export function escribirTrazos(p, texto, x, base, c, { estilo = "modelo", punto = estilo === "modelo", flechas = c >= p.mm(12) } = {}) {
  const chars = [...texto];
  chars.forEach((ch, i) => {
    if (ch === " ") { x += 0.7 * c + (i < chars.length - 1 ? ESPACIO_LETRA * c : 0); return; }
    const L = LETRAS_TRAZO[ch];
    if (!L) throw new Error(`Falta la letra de trazo «${ch}».`);
    const aPapel = (u, v) => [x + u * c, base + v * c];
    L.t.forEach((tr, j) => {
      const { ini, flecha: fl, cmds } = trazoACurvas(tr);
      const cm = cmds.map(([k, ...v]) => [k, ...v.map((n, q) => (q % 2 ? base + n * c : x + n * c))]);
      if (estilo === "modelo") p.path(cm, { lw: 0.11 * c, stroke: 0.1 });
      else if (estilo === "repaso") p.path(cm, { lw: 0.12 * c, stroke: "#c4c4c4" });
      else if (estilo === "punteado") p.path(cm, { lw: 0.09 * c, stroke: 0.45, dash: [0.001 * c, 0.17 * c] });
      else throw new Error(`Estilo de trazo desconocido: ${estilo}`);
      const [sx, sy] = aPapel(...ini);
      if (punto) p.circle(sx, sy, (estilo === "modelo" ? 0.1 : 0.075) * c, { fill: VERDE_INICIO, stroke: null });
      if (estilo === "modelo" && flechas) flecha(p, ...aPapel(...fl.p), fl.d, (tr.lado ?? 1), j + 1, c);
    });
    x += L.w * c + (i < chars.length - 1 ? ESPACIO_LETRA * c : 0);
  });
  return x;
}

/** Flecha corta paralela al comienzo del trazo, a un lado, con el número de orden detrás. */
function flecha(p, sx, sy, [dx, dy], lado, num, c) {
  const nx = dy * lado, ny = -dx * lado, off = 0.3 * c, L = 0.38 * c, lw = 0.055 * c;
  const ax = sx + nx * off, ay = sy + ny * off, bx = ax + dx * L, by = ay + dy * L, h = 0.12 * c;
  p.line(ax, ay, bx, by, { lw, gris: COLOR_FLECHA });
  for (const s of [1, -1]) p.line(bx, by, bx - dx * h + s * -dy * h * 0.7, by - dy * h + s * dx * h * 0.7, { lw, gris: COLOR_FLECHA });
  const fs = 0.34 * c;
  p.text(ax - dx * 0.2 * c, ay - dy * 0.2 * c - fs * 0.35, String(num), fs, { f: "PB", anchor: "middle", gris: COLOR_FLECHA });
}
