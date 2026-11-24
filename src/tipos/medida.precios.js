// medida.precios · Las compras (port de _m_precios() y _etiqueta() del motor).
// datos:    total → { a: [nombre, precio], b: [nombre, precio] } · cambio → { nom, precio, pago }
// solucion: { huecos: [a + b] } o { huecos: [pago − precio] }
// Opciones: modo null (total de la compra) | "cambio" (la vuelta de un billete de 5, 10 o 20 €); rango 10 | 20 (tope de la suma / billete).
// 2.º (rango 100): productos más caros (hasta 60 €), total hasta 100 € y billetes de 20, 50 y 100 €.
// 3.º (lote 6, opción `centimos`): precios con céntimos (múltiplos de 5 c, ≤ 15 €), total ≤ rango y vuelta de 5, 10 o 20 €; datos con `c: true` y precios en céntimos; la respuesta es texto con coma («3,85»).
// Completa: 10 tarjetas (2 × 5); media: 4 (2 filas).
// Cantidad (rejilla elástica, 2 columnas): «Más grandes» = 10 y 4 (tarjetas que llenan el panel; las etiquetas crecen hasta ×1,3); «Más ejercicios» = las filas que caben con tarjetas ≥ 100 pt (12 y 6).
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B, cuantosRejilla } from "../render/papel.js";
import { itemDinero } from "./medida.dinero.js";

/** 2.º (lote 3, rango 100): precios en euros enteros hasta 100 €; la vuelta de billetes de 20, 50 y 100 €. */
const PRODUCTOS_2 = { estuche: [5, 12], camiseta: [8, 16], muñeca: [10, 20], libro: [9, 18], balón: [12, 25], "juego de mesa": [15, 30], mochila: [18, 35], zapatillas: [25, 45], patinete: [35, 60], cometa: [6, 14] };
/** 3.º (lote 6): precios con céntimos (múltiplos de 5 c, en céntimos): total de dos compras y vuelta de un billete de 5, 10 o 20 €. */
const PRODUCTOS_C = { "lápiz": [60, 150], goma: [40, 120], sacapuntas: [50, 120], regla: [90, 250], pegamento: [120, 290], cuaderno: [150, 380], pelota: [250, 650], libro: [450, 950], mochila: [800, 1500] };
/** 1235 → «12,35» (coma decimal). */
export const euros = (c) => `${Math.floor(c / 100)},${String(c % 100).padStart(2, "0")}`;
const MIN_ALTO = 100;   // alto mínimo de tarjeta con «Más ejercicios» (etiqueta de 50 y la línea de la respuesta)

const PRODUCTOS = { "lápiz": [1, 3], goma: [1, 2], sacapuntas: [1, 2], regla: [2, 3], pegamento: [2, 4], cuaderno: [3, 5], pelota: [4, 8], libro: [5, 9], mochila: [8, 12] };

/** _etiqueta(): rótulo con el nombre y el precio. */
function etiqueta(p, x, y, nom, precio, s = 1, w = 104 * s, h = 50 * s, c = false) {
  p.rrect(x, y, w, h, 8, { lw: 1.5 });
  p.text(x + w / 2, y + h - 18 * s, nom, 12 * s, { f: "PM", anchor: "middle" });
  p.text(x + w / 2, y + 9 * s, `${c ? euros(precio) : precio} €`, 16 * s, { f: "PB", anchor: "middle" });
}

export default registrar({
  id: "medida.precios",
  version: 3,
  cantidad: true,
  generar(params, azar, ctx) {
    const R = params.rango ?? 20;
    if (R < 10) throw new Error("Este modelo necesita un rango máximo de al menos 10.");
    const cent = !!params.centimos, dos = R > 20 && !cent, P = cent ? PRODUCTOS_C : dos ? PRODUCTOS_2 : PRODUCTOS, pagos = dos ? [20, 50, 100] : [5, 10, 20];
    const cap = dos ? R : Math.min(R, 20), cambio = params.modo === "cambio", cnt = cuantosRejilla(ctx, 2, MIN_ALTO, [10, 4]), nombres = Object.keys(P), ejercicios = [], vistos = new Set();
    for (let i = 0; i < cnt; i++) {
      if (cent) {   // en céntimos (enteros); al menos un precio con céntimos y resultado distinto en cada tarjeta
        let d, sol, ok = false;
        for (let k = 0; k < 5000 && !ok; k++) {
          const c5 = ([lo, hi]) => 5 * azar.entero(lo / 5, hi / 5);
          if (cambio) {
            const pago = azar.elegir(pagos.filter((v) => v <= cap)), nom = azar.elegir(nombres.filter((n) => P[n][0] < pago * 100)), precio = c5([P[nom][0], Math.min(P[nom][1], pago * 100 - 5)]);
            d = { nom, precio, pago, c: true }; sol = pago * 100 - precio; ok = precio % 100 !== 0;
          } else {
            const [a, b] = azar.muestra(nombres, 2), pa = c5(P[a]), pb = c5(P[b]);
            d = { a: [a, pa], b: [b, pb], c: true }; sol = pa + pb; ok = sol <= cap * 100 && (pa % 100 !== 0 || pb % 100 !== 0);
          }
          ok = ok && !vistos.has(sol);
        }
        if (!ok) throw new Error("No hay compras distintas suficientes.");
        vistos.add(sol); ejercicios.push({ datos: d, solucion: { huecos: [euros(sol)] } });
        continue;
      }
      if (cambio) {
        const pago = azar.elegir(pagos.filter((v) => v <= cap));
        const nom = azar.elegir(nombres.filter((k) => P[k][0] < pago)), [lo, hi] = P[nom];
        const precio = azar.entero(lo, Math.min(hi, pago - 1));
        ejercicios.push({ datos: { nom, precio, pago }, solucion: { huecos: [pago - precio] } });
      } else {
        let a, b, pa, pb, ok = false;
        for (let k = 0; k < 2000 && !ok; k++) {
          [a, b] = azar.muestra(nombres, 2); pa = azar.entero(...P[a]); pb = azar.entero(...P[b]);
          ok = pa + pb <= cap;
        }
        if (!ok) throw new Error("Este modelo necesita un rango máximo mayor.");
        ejercicios.push({ datos: { a: [a, pa], b: [b, pb] }, solucion: { huecos: [pa + pb] } });
      }
    }
    return { enunciado: cambio ? "Calcula cuánto dinero te devuelven y escríbelo." : "Calcula cuánto cuesta lo que compras y escribe el total.", ejercicios };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.rejilla(TOP, 2, Math.ceil(act.ejercicios.length / 2)), s = Math.max(1, Math.min(1.3, (ch - 56) / 62)), ew = 104 * s, eh = 50 * s;   // las etiquetas crecen con la tarjeta; debajo, la línea de la respuesta (≈ 52)
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], d = e.datos, sol = e.solucion.huecos[0];
      p.marco(x, y, cw, ch, i);
      if (d.pago !== undefined) {
        etiqueta(p, x + 26, y + ch - 14 - eh, d.nom, d.precio, s, undefined, undefined, d.c);
        p.text(x + 38 + ew, y + ch - 14 - eh / 2 - 4, "Pago con", 12, { f: "PM" });
        itemDinero(p, "b", d.pago, x + 91 + ew, y + ch - 14 - eh / 2, "€");
        p.linea(x, y + 8, cw, 40, [T("Me devuelven", 13, "PM"), B(d.c ? 70 : 46, 34, sol), T("€", 14, "PM")], 8);
      } else {
        etiqueta(p, x + 20, y + ch - 14 - eh, d.a[0], d.a[1], s, undefined, undefined, d.c);
        etiqueta(p, x + cw - 20 - ew, y + ch - 14 - eh, d.b[0], d.b[1], s, undefined, undefined, d.c);
        p.text(x + cw / 2, y + ch - 14 - eh / 2 - 8, "+", 22, { f: "PB", anchor: "middle" });
        p.linea(x, y + 8, cw, 40, [T("Cuesta en total", 13, "PM"), B(d.c ? 70 : 46, 34, sol), T("€", 14, "PM")], 8);
      }
    }));
  },
});
