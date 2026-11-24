// medida.longitud · Mide con cubitos (port de _m_longitud() del motor).
// datos:    { nombre, barras: [n] | [n1, n2] }  (longitud en cubitos, 2–12; con compara dos barras distintas A y B)
// solucion: medir → { huecos: [n] } · compara → { huecos: [] } (se rodea la letra de la barra más larga; en la solución, en rojo)
// Opción modo: null (medir y escribir) | "compara" (medir y rodear el más largo). Completa: 6 filas; media: 3.
// 2.º (lote 3c, valores con `curso`):
//   "regla" → datos { nombre, cm } (tira de 2–10 cm REALES, dibujada con Papel.mm(); sin repetir longitudes) · solucion { huecos: [cm] }
//   "mcm"   → datos { objeto } · solucion { huecos: [], unidad: "m" | "cm" } (se rodea la unidad; en la solución, en rojo). Completa: 12 (2 × 6); media: 6.
// Cantidad (rejilla elástica, solo en "regla" y "mcm"; medir y comparar con cubitos ya están en su mínimo y no cambian): «Más grandes» = los de siempre (tarjetas que llenan el panel);
//   «Más ejercicios» = las filas que caben: regla (tarjetas ≥ 70 pt, la tira sigue midiendo lo mismo en mm reales) 6/3 → 8/4; mcm (tarjetas ≥ 54 pt) 12/6 → 22/10.
import { registrar } from "../nucleo/tipos.js";
import { TOP, W, M, cuantosRejilla } from "../render/papel.js";
import { chips } from "./medida.tiempo.js";

/** ¿m o cm? Objetos sin duda posible para un niño de 2.º. */
export const UNIDADES = {
  cm: ["Un lápiz", "Una goma", "Un libro", "Una cuchara", "Un clip", "Tu mano", "Un zapato", "Unas tijeras", "Un estuche",
       "Una llave", "Un tenedor", "Un cepillo de dientes", "Una pajita", "Una hoja de papel"],
  m: ["El pasillo del cole", "El patio", "Una piscina", "Un campo de fútbol", "Una calle", "Un autobús", "Un tren",
      "Un edificio", "Una ballena", "Un camión", "La pista de atletismo", "La valla del cole"],
};
const ART = { cinta: "La", tira: "La", cuerda: "La", pajita: "La", regla: "La", hoja: "La" };
const ROJO = "#C62828";

const MIN_REGLA = 70, MIN_MCM = 54;   // alto mínimo de tarjeta con «Más ejercicios»

function generar2(modo, azar, ctx) {
  if (modo === "regla") {
    const n = Math.min(8, cuantosRejilla(ctx, 1, MIN_REGLA, [6, 3])), nombres = azar.barajar(["cinta", "tira", "cuerda", "pajita", "palo", "lazo", "cordón", "lápiz"]);
    const cms = azar.muestra([2, 3, 4, 5, 6, 7, 8, 9, 10], n);
    return { enunciado: "Mide cada tira con tu regla y escribe cuántos centímetros mide.\nPon el 0 de la regla al principio de la tira.",
             ejercicios: cms.map((cm, i) => ({ datos: { nombre: nombres[i], cm }, solucion: { huecos: [cm] } })) };
  }
  const n = Math.min(26, cuantosRejilla(ctx, 2, MIN_MCM, [12, 6])), nm = azar.entero(Math.max(Math.floor(n * 0.4), n - UNIDADES.cm.length), Math.min(Math.ceil(n * 0.6), UNIDADES.m.length));
  const lista = azar.barajar([...azar.muestra(UNIDADES.m, nm).map((o) => [o, "m"]), ...azar.muestra(UNIDADES.cm, n - nm).map((o) => [o, "cm"])]);
  return { enunciado: "¿Lo medirías en metros (m) o en centímetros (cm)? Rodea.",
           ejercicios: lista.map(([objeto, unidad]) => ({ datos: { objeto }, solucion: { huecos: [], unidad } })) };
}

export default registrar({
  id: "medida.longitud",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const { tamano } = ctx;
    if (params.modo === "regla" || params.modo === "mcm") return generar2(params.modo, azar, ctx);
    const compara = params.modo === "compara", nombres = azar.barajar(["lápiz", "cinta", "tira", "palo", "cuerda", "pajita", "regla", "hoja"]), ejercicios = [];
    for (let i = 0; i < (tamano === "media" ? 3 : 6); i++) {
      const n1 = azar.entero(2, 12), n2 = azar.elegir([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter((v) => v !== n1));
      const barras = compara ? [n1, n2] : [n1];
      ejercicios.push({ datos: { nombre: nombres[i], barras }, solucion: { huecos: compara ? [] : [n1] } });
    }
    return { enunciado: compara ? "Mide con los cubitos y rodea el más largo." : "Cuenta cuántos cubitos mide cada objeto y escribe el número.", ejercicios };
  },
  dibujar(p, act) {
    if (act.params?.modo === "regla") return dibujarRegla(p, act);
    if (act.params?.modo === "mcm") return dibujarMcm(p, act);
    const top = TOP, rows = 6, GY = 10, rh = (top - M - (rows - 1) * GY) / rows, u = 26, gx = M + 108;
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const y = top - (i + 1) * rh - i * GY, { barras, nombre } = e.datos, compara = barras.length === 2;
      p.marco(M, y, W - 2 * M, rh);
      barras.forEach((nb, j) => {
        const by = y + rh - 36 - j * 26;
        p.rrect(gx, by, nb * u, 16, 6, { lw: 1.5, fill: 0.82 });
        p.text(M + 16, by + 3, compara ? (j === 0 ? "A" : "B") : `El ${nombre}`, 12, { f: "PM" });
      });
      for (let k = 0; k < 12; k++) p.rrect(gx + k * u, y + 12, u, u, 0, { lw: 1.3 });
      if (compara) {
        const pos = chips(p, W - M - 62, y + rh / 2 - 11, ["A", "B"], 12);
        if (p.solucion) { const [cx, w] = pos[barras[0] > barras[1] ? 0 : 1]; p.rrect(cx - 2, y + rh / 2 - 13, w + 4, 26, 10, { lw: 1.6, stroke: "#C62828" }); }
      } else {
        p.caja(W - M - 96, y + rh / 2 - 6, 50, 36, null, 22, e.solucion.huecos[0]);
        p.text(W - M - 42, y + rh / 2 + 6, "cubitos", 10.5, { f: "PM" });
      }
    }));
  },
});

/** Tiras de longitud real: 1 cm en el papel impreso al 100 % = 1 cm de la regla. */
function dibujarRegla(p, act) {
  const { cel, ch: rh } = p.rejilla(TOP, 1, act.ejercicios.length), gx = M + 22;
  act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
    const y = cel[i][1], { nombre, cm } = e.datos, alto = p.mm(6);
    p.marco(M, y, W - 2 * M, rh);
    p.text(gx, y + rh - 26, `${ART[nombre] ?? "El"} ${nombre}`, 12, { f: "PM" });
    const by = y + rh / 2 - alto / 2 - 8;
    p.rrect(gx, by, p.mm(cm * 10), alto, 0, { lw: 1.2, fill: 0.82 });
    p.caja(W - M - 106, y + rh / 2 - 22, 50, 36, null, 22, e.solucion.huecos[0]);
    p.text(W - M - 50, y + rh / 2 - 10, "cm", 14, { f: "PM" });
  }));
}

/** ¿m o cm?: objeto a la izquierda y las dos unidades para rodear a la derecha. */
function dibujarMcm(p, act) {
  const { cel, cw, ch } = p.rejilla(TOP, 2, Math.ceil(act.ejercicios.length / 2));
  act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
    const [x, y] = cel[i];
    p.marco(x, y, cw, ch, i);
    const tot = p.ancho("m", "PM", 14) + p.ancho("cm", "PM", 14) + 32 + 8, x0 = x + 30, max = x + cw - 16 - tot - 14 - x0;
    let fs = 13; while (p.ancho(e.datos.objeto, "PM", fs) > max && fs > 8) fs -= 0.5;
    p.text(x0, y + ch / 2 - fs * 0.33, e.datos.objeto, fs, { f: "PM" });
    const pos = chips(p, x + cw - 16 - tot / 2, y + ch / 2 - 12, ["m", "cm"], 14, 24, 8);
    if (p.solucion) { const [cx, w] = pos[e.solucion.unidad === "m" ? 0 : 1]; p.rrect(cx - 3, y + ch / 2 - 15, w + 6, 30, 11, { lw: 1.6, stroke: ROJO }); }
  }));
}
