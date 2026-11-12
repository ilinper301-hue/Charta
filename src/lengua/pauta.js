// Charta · Lengua · pauta Lamela (doble pauta) en SVG (lote 4 de LENGUA_1.md).
// Cada renglón: dos líneas que marcan el cuerpo de la letra (la de abajo, la base, más marcada).
// Las astas y los rabos (0,8 del cuerpo) ocupan el espacio entre renglones; línea fina opcional en medio.
// Medidas REALES en el papel impreso: p.mm() compensa la escala del panel (ver Papel.mm).
//   Renglón = 3 cuerpos de alto: 1 por encima (asta 0,8 + aire), el cuerpo y 1 por debajo (rabo 0,8 + aire).
//   Con 5 mm: 15 mm de base a base. En unidades de la pauta (cuerpo = 1): base y = 0, línea de arriba y = 1.

/** Tamaños de cuerpo admitidos, en mm (decidido el 5-11-2026: 5 por defecto). */
export const TAMANOS_PAUTA = [5, 4, 3.5];
export const PAUTA_POR_DEFECTO = 5;
/** Proporciones en cuerpos: asta, rabo y alto del renglón (de base a base). */
export const ASTA = 0.8;
export const RABO = 0.8;
export const PASO = 3;

/** Cuerpo (c) y paso de la pauta de `mm` milímetros en unidades del papel. */
export function medidasPauta(p, mm = PAUTA_POR_DEFECTO) {
  if (!TAMANOS_PAUTA.includes(mm)) throw new Error(`Pauta de ${mm} mm no admitida (${TAMANOS_PAUTA.join(", ")}).`);
  const c = p.mm(mm);
  return { c, paso: PASO * c };
}

/** Renglones que caben en un alto (unidades del papel). */
export function cabenRenglones(p, alto, mm = PAUTA_POR_DEFECTO) {
  return Math.max(0, Math.floor(alto / medidasPauta(p, mm).paso + 1e-9));
}

/**
 * Pauta Lamela de cuatro líneas equidistantes (un cuerpo c entre ellas), como la de la ficha «Miro y escribo» de Iván:
 * las dos del cuerpo (base y base + c) negras y las de las astas y los rabos (base + 2c y base − c) grises. Un solo renglón.
 */
export function pautaLamela(p, x0, x1, base, c) {
  const lw = p.mm(0.3);
  p.line(x0, base + 2 * c, x1, base + 2 * c, { lw: p.mm(0.2), gris: 0.62 });
  p.line(x0, base + c, x1, base + c, { lw, gris: 0.1 });
  p.line(x0, base, x1, base, { lw, gris: 0.1 });
  p.line(x0, base - c, x1, base - c, { lw: p.mm(0.2), gris: 0.62 });
}

/**
 * Dibuja n renglones de x0 a x1 empezando en yArriba (borde superior del primer renglón, astas incluidas).
 * Devuelve las bases (y de cada renglón) y el cuerpo c, para escribir encima con trazos.js.
 * guia: línea fina discontinua entre renglones (marca hasta dónde llegan astas y rabos).
 */
export function renglones(p, x0, x1, yArriba, n, { mm = PAUTA_POR_DEFECTO, guia = false } = {}) {
  const { c, paso } = medidasPauta(p, mm), bases = [];
  const lwBase = p.mm(0.3), lwArriba = p.mm(0.18);
  for (let k = 0; k < n; k++) {
    const base = yArriba - k * paso - 2 * c;
    bases.push(base);
    p.line(x0, base + c, x1, base + c, { lw: lwArriba, gris: 0.62 });
    p.line(x0, base, x1, base, { lw: lwBase, gris: 0.35 });
    if (guia && k < n - 1) p.line(x0, base - c, x1, base - c, { lw: p.mm(0.12), gris: 0.75, dash: [p.mm(1.2), p.mm(1.2)] });
  }
  return { bases, c, paso };
}
