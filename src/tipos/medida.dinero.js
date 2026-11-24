// medida.dinero · Cuenta el dinero (port de _m_dinero() e _item_dinero() del motor; dibuja sus propias monedas y billetes).
// datos:    { u: "€" | "c", items: [["m" | "b", valor], …] (de mayor a menor valor) }
// solucion: { huecos: [total] }
// 3.º (lote 6, modo "mixto"): monedas de 2 €, 1 €, 50, 20, 10 y 5 c juntas (3–6 piezas, con euros y con céntimos); datos { u: "m", items: [["m", valor, "€" | "c"]] }; total ≤ min(rango, 10) €; respuesta con coma («3,70»).
// Opciones: modo null (euros: monedas de 1 y 2 € y billetes de 5, 10 y 20 € hasta el rango; 2.º, rango 200–500: también 50 y 100 €) | "centimos" (monedas de 1 a 50 c).
// rango (10, 20, 30, 100): tope del total (euros ≤ 50, céntimos ≤ 99); totales entre 3 y el tope, sin repetir.
// Completa: 8 cuentas (2 × 4); media: 4.
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B } from "../render/papel.js";
import { euros } from "./medida.precios.js";

export const BILLETES = { 5: [52, 28], 10: [56, 28], 20: [60, 28], 50: [64, 28], 100: [70, 28] };
export const RADIO = { "€": { 1: 15, 2: 17 }, c: { 1: 12.5, 2: 14, 5: 16.5, 10: 16, 20: 17.5, 50: 18.5 } };   // monedas de céntimos más grandes: rótulo de ≥ 9 pt impresos

/** _item_dinero(): una moneda ("m") o un billete ("b") centrado en (x, y). */
export function itemDinero(p, kind, v, x, y, u) {
  if (kind === "m") {
    const r = RADIO[u][v];
    p.circle(x, y, r, { lw: 1.6 }); p.circle(x, y, r - 2.4, { lw: 0.7 });
    p.text(x, y - 3, u === "€" ? `${v} €` : `${v} c`, u === "€" ? 11 : 10.5, { f: "PB", anchor: "middle" });
  } else {
    const [w, h] = BILLETES[v];
    p.rrect(x - w / 2, y - h / 2, w, h, 4, { lw: 1.6 });
    p.rrect(x - w / 2 + 3, y - h / 2 + 3, w - 6, h - 6, 0, { lw: 0.7 });
    p.text(x, y - 4, `${v} €`, 11.5, { f: "PB", anchor: "middle" });
  }
}

/** 2.º (lote 3, rango 200–500): totales hasta el rango, con billetes de 50 y 100 €. En 1.º, hasta 50 € (céntimos: 99). */
export const topeDinero = (R, cent) => cent ? Math.min(R, 99) : R > 100 ? R : Math.min(R, 50);
export const billetes = (R) => R > 100 ? [5, 10, 20, 50, 100] : [5, 10, 20];

/** 3.º (lote 6): euros y céntimos juntos. Piezas [tipo, valor, unidad] de mayor a menor valor; total en céntimos, con céntimos (no es un número exacto de euros), ≤ min(rango, 10) €. */
const MIXTAS = [["m", 2, "€"], ["m", 1, "€"], ["m", 50, "c"], ["m", 20, "c"], ["m", 10, "c"], ["m", 5, "c"]];
const centimos = ([, v, u]) => (u === "€" ? 100 * v : v);
function generarMixto(params, azar, tamano) {
  const R = params.rango ?? 20, cap = Math.min(R, 10) * 100, cnt = tamano === "media" ? 4 : 8, vistos = new Set(), ejercicios = [];
  for (let i = 0; i < cnt; i++) {
    let its, tot, ok = false;
    for (let k = 0; k < 20000 && !ok; k++) {
      its = Array.from({ length: azar.entero(3, 6) }, () => azar.elegir(MIXTAS)).sort((a, b) => centimos(b) - centimos(a));
      tot = its.reduce((t, it) => t + centimos(it), 0);
      ok = its.some((it) => it[2] === "€") && its.some((it) => it[2] === "c") && tot % 100 !== 0 && tot >= 150 && tot <= cap && !vistos.has(tot);
    }
    if (!ok) throw new Error("Este modelo necesita un rango máximo mayor para tantas cuentas distintas.");
    vistos.add(tot);
    ejercicios.push({ datos: { u: "m", items: its }, solucion: { huecos: [euros(tot)] } });
  }
  return { enunciado: "Cuenta las monedas y escribe el total en euros.", ejercicios };
}

export default registrar({
  id: "medida.dinero",
  version: 2,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 20;
    if (R < 10) throw new Error("Este modelo necesita un rango máximo de al menos 10.");
    if (params.modo === "mixto") return generarMixto(params, azar, tamano);
    const cent = params.modo === "centimos", u = cent ? "c" : "€", cap = topeDinero(R, cent);
    const vals = cent ? [1, 2, 5, 10, 20, 50].map((v) => ["m", v]) : [["m", 1], ["m", 2], ...billetes(R).filter((v) => v <= cap).map((v) => ["b", v])];
    const cnt = tamano === "media" ? 4 : 8, vistos = new Set(), ejercicios = [];
    for (let i = 0; i < cnt; i++) {
      let its, tot, ok = false;
      for (let k = 0; k < 20000 && !ok; k++) {
        its = Array.from({ length: azar.entero(2, 6) }, () => azar.elegir(vals)).sort((a, b) => b[1] - a[1]);
        tot = its.reduce((s, [, v]) => s + v, 0);
        ok = tot >= 3 && tot <= cap && !vistos.has(tot);
      }
      if (!ok) throw new Error("Este modelo necesita un rango máximo mayor para tantas cuentas distintas.");
      vistos.add(tot);
      ejercicios.push({ datos: { u, items: its }, solucion: { huecos: [tot] } });
    }
    return { enunciado: "Cuenta las monedas y los billetes y escribe el total.", ejercicios };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 2, 4);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { u, items } = e.datos;
      p.marco(x, y, cw, ch, i);
      const mixto = u === "m", uu = (it) => it[2] ?? u;
      const ws = items.map((it) => (it[0] === "m" ? 2 * RADIO[uu(it)][it[1]] : BILLETES[it[1]][0])), lin = [[]];
      let cur = 0;
      items.forEach((it, j) => {
        if (cur + ws[j] > cw - 28 && lin[lin.length - 1].length) { lin.push([]); cur = 0; }
        lin[lin.length - 1].push([it, ws[j]]); cur += ws[j] + 8;
      });
      let yc = y + 54 + (ch - 54 - 30) / 2 + (lin.length - 1) * 18;
      for (const ln of lin) {
        const tw = ln.reduce((s, [, w]) => s + w, 0) + 8 * (ln.length - 1);
        let xx = x + (cw - tw) / 2;
        for (const [it, w] of ln) { itemDinero(p, it[0], it[1], xx + w / 2, yc, uu(it)); xx += w + 8; }
        yc -= 36;
      }
      p.linea(x, y + 8, cw, 44, [T("Total =", 14, "PM"), B(mixto ? 74 : 54, 36, e.solucion.huecos[0]), T(u === "c" ? "cent." : "€", 14, "PM")], 8);
    }));
  },
});
