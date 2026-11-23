// rep.romanos · Los números romanos (3.º): I, V, X, L, C con las reglas normales (IV, IX, XL, XC; nunca más de tres iguales seguidos).
// datos:    { n, romano, sentido: "leer" | "escribir" }   (leer: se da el romano, hueco para el número; escribir: se da el número, hueco para el romano)
// solucion: { huecos: [n] } (leer) | { huecos: [romano] } (escribir)
// Opciones: modo null (los dos sentidos, alternando) | "leer" | "escribir"; ayuda (por defecto true): tarjeta con I = 1 · V = 5 · X = 10 · L = 50 · C = 100.
// Números de 1 a rango sin repetir, repartidos por todo el rango; al menos un tercio con resta (IV, IX, XL, XC) en cuanto el rango lo permite.
// Completa: 18 (3 columnas × 6 filas); media: 9 (3 × 3). Con ayuda la tarjeta ocupa la parte de arriba y las filas se hacen más bajas (94 pt) para que las 3 de media página quepan.
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W } from "../render/papel.js";

const VALORES = [[100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];

/** Número (1–100) → romano en forma canónica. */
export function aRomano(n) {
  if (!Number.isInteger(n) || n < 1 || n > 100) throw new Error(`aRomano(${n}): solo de 1 a 100`);
  let s = "";
  for (const [v, r] of VALORES) while (n >= v) { s += r; n -= v; }
  return s;
}

/** Romano → número (valor de las letras con resta); null si no es una cadena romana de I, V, X, L, C. */
export function deRomano(s) {
  const v = { I: 1, V: 5, X: 10, L: 50, C: 100 };
  if (typeof s !== "string" || !/^[IVXLC]+$/.test(s)) return null;
  let t = 0;
  for (let i = 0; i < s.length; i++) t += v[s[i]] < (v[s[i + 1]] ?? 0) ? -v[s[i]] : v[s[i]];
  return t;
}

const conResta = (n) => /IV|IX|XL|XC/.test(aRomano(n));

/** Elige c elementos de la lista ordenada, uno de cada tramo (repartidos por todo el rango). */
function repartidos(lista, c, azar) {
  const m = lista.length, r = [];
  for (let i = 0; i < c; i++) r.push(azar.elegir(lista.slice(Math.floor(i * m / c), Math.floor((i + 1) * m / c))));
  return r;
}

const ENUNCIADOS = {
  leer: "Escribe con cifras cada número romano.",
  escribir: "Escribe cada número con números romanos.",
  mixto: "Escribe con cifras o con números romanos,\nsegún corresponda.",
};

export default registrar({
  id: "rep.romanos",
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 100, k = tamano === "media" ? 9 : 18, modo = params.modo ?? null;
    const todos = Array.from({ length: R }, (_, i) => i + 1);
    const S = todos.filter(conResta), O = todos.filter((n) => !conResta(n));
    const s = Math.min(Math.ceil(k / 3), S.length), o = Math.min(k - s, O.length);
    const ns = azar.barajar([...repartidos(S, s, azar), ...repartidos(O, o, azar)]);
    const ejercicios = ns.map((n, i) => {
      const sentido = modo ?? (i % 2 === 0 ? "leer" : "escribir"), romano = aRomano(n);
      return { datos: { n, romano, sentido }, solucion: { huecos: [sentido === "leer" ? n : romano] } };
    });
    return { enunciado: ENUNCIADOS[modo ?? "mixto"], ejercicios };
  },
  dibujar(p, act) {
    const ayuda = act.params.ayuda !== false;
    let top = TOP;
    if (ayuda) {
      const h = 34, w = W - 2 * M;
      p.tarjeta(M, top - h, w, h);
      p.text(M + w / 2, top - h / 2 - 6, "I = 1  ·  V = 5  ·  X = 10  ·  L = 50  ·  C = 100", 17, { anchor: "middle" });
      top -= h + 8;
    }
    const { cel, cw, ch: ch0 } = p.celdas(top, 3, 6, 10, 8);
    const ch = ayuda ? 94 : ch0;   // con ayuda, las tres filas de media página caben en la mitad superior de la zona
    if (ayuda) cel.forEach((c, i) => { c[1] = top - (Math.floor(i / 3) + 1) * ch - Math.floor(i / 3) * 8; });
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { n, romano, sentido } = e.datos, leer = sentido === "leer";
      p.marco(x, y, cw, ch, i);
      const w = leer ? 60 : 144, h = 38, hy = y + 11 + (ch - 94) * 0.35;   // hueco abajo, dentro de la tarjeta; el dato justo encima
      p.text(x + cw / 2, hy + h + 14, leer ? romano : String(n), 26, { anchor: "middle" });
      p.caja(x + (cw - w) / 2, hy, w, h, null, 22, e.solucion.huecos[0]);
    }));
  },
});
