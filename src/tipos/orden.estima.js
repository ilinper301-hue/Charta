// orden.estima · Estima (3.º, MATES_3.md bloque 3): redondear los números y operar para dar un resultado aproximado.
// datos:    { a, b, op: "+" | "-", u: "centena" | "millar", ra, rb }   (a, b de 1000..rango; ra, rb = a y b redondeados a u, con ra, rb ≥ 1000)
// solucion: { huecos: [ra, rb, ra ± rb] }   (suma: ra + rb ≤ 9999 y a + b ≤ rango; resta: a > b y ra > rb)
// Opciones: a (redondea) null = al millar | "centena"; op null (sumas y restas) | "suma" | "resta".
// Dibujo: «4352 + 2987» y debajo «≈ ☐ + ☐ = ☐» (el «≈» va dibujado con trazos). Completa: 12 (2 columnas × 6 filas); media: 6.
import { registrar } from "../nucleo/tipos.js";
import { TOP, MENOS, T } from "../render/papel.js";
import { UNIDAD, redondear } from "./orden.redondea.js";

/** «≈»: dos ondas (las letras no lo traen). */
export function casi(p, cx, cy) {
  for (const dy of [3.5, -3.5]) p.path([["M", cx - 9, cy + dy], ["C", cx - 5, cy + dy + 5, cx - 2, cy + dy - 5, cx, cy + dy], ["C", cx + 2, cy + dy + 5, cx + 5, cy + dy - 5, cx + 9, cy + dy]], { lw: 1.9 });
}

export default registrar({
  id: "orden.estima",
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 9999, cnt = tamano === "media" ? 6 : 12, u = params.a === "centena" ? "centena" : "millar", paso = UNIDAD[u];
    const vistos = new Set(), ejercicios = [];
    for (let i = 0; i < cnt; i++) {
      const resta = params.op === "resta" || (params.op !== "suma" && i % 2 === 1);
      let hecho = false;
      for (let k = 0; k < 5000 && !hecho; k++) {
        let a = azar.entero(1000, R), b = azar.entero(1000, R);
        if (resta && b > a) [a, b] = [b, a];
        if (a % paso === 0 || b % paso === 0 || a === b || vistos.has(a + "," + b)) continue;
        const ra = redondear(a, paso), rb = redondear(b, paso);
        if (ra > 9999 || rb > 9999 || (resta ? ra <= rb : a + b > R || ra + rb > 9999)) continue;
        vistos.add(a + "," + b); hecho = true;
        ejercicios.push({ datos: { a, b, op: resta ? "-" : "+", u, ra, rb }, solucion: { huecos: [ra, rb, resta ? ra - rb : ra + rb] } });
      }
      if (!hecho) throw new Error("Esta ficha necesita un rango máximo mayor.");
    }
    return {
      enunciado: `Redondea cada número ${u === "millar" ? "al millar" : "a la centena"} y calcula el resultado aproximado.`,
      ejercicios: azar.barajar(ejercicios),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 2, 6);
    const w = 52, h = 40, g = 6, op = 16;
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { a, b, op: o } = e.datos, [ha, hb, hr] = e.solucion.huecos, signo = o === "+" ? "+" : MENOS;
      p.marco(x, y, cw, ch, i);
      p.linea(x + 14, y + ch - 46, cw - 14, 34, [T(`${a} ${signo} ${b}`, 20)]);
      const tot = 22 + w + op + w + op + w + 5 * g, x0 = x + (cw - tot) / 2, yb = y + 10;
      let cx = x0;
      casi(p, cx + 11, yb + h / 2); cx += 22 + g;
      p.caja(cx, yb, w, h, null, 17, ha); cx += w + g;
      p.text(cx + op / 2, yb + h / 2 - 7, signo, 20, { anchor: "middle" }); cx += op + g;
      p.caja(cx, yb, w, h, null, 17, hb); cx += w + g;
      p.text(cx + op / 2, yb + h / 2 - 7, "=", 20, { anchor: "middle" }); cx += op + g;
      p.caja(cx, yb, w, h, null, 17, hr);
    }));
  },
});
