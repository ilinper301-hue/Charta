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

export const LETRAS_TRAZO = {
  a: { w: 0.9, t: [{ d: [BOLA()], en: 50 / 360 }, { d: [["M", 0.9, 1], ["L", 0.9, 0]], lado: -1, en: 0.45 }] },
  l: { w: 0.2, t: [{ d: [["M", 0.1, 1.8], ["L", 0.1, 0]], en: 0.25 }] },
  g: { w: 0.9, t: [{ d: [BOLA()], en: 50 / 360 }, { d: [["M", 0.9, 1], ["L", 0.9, -0.4], ["A", 0.5, -0.4, 0.4, 0.4, 0, -165]], lado: -1, en: 0.3 }] },
};

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
