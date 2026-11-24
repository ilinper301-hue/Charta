// sumar.dobles · Los dobles (port de _s_dobles() del motor).
// datos:    { n, forma: 0 | 1 }   (forma 0: «n + n =»; forma 1: «Doble de n =»; 1 ≤ n ≤ max(2, min(10, rango/2)))
// solucion: { huecos: [2n] }
// Opción modo: null (solo números) | "dibujo" (dos filas de n círculos sobre el cuadro).
// 2.º (rango 100): n = decenas hasta 50 o números de dos cifras con unidades 0–4 (sin llevada); opción operacion:
//   null (dobles, formas 0 y 1) | "mitades" (forma 2: «Mitad de 2n =», hueco n) | "mezcla". Sin dibujos (rmax 20).
// «Más grandes»: 12 (4 filas × 3) en completa y 6 en media; «Más ejercicios»: 33 y 15 (tarjetas ≥ 54 pt; con dibujos, tarjetas ≥ 160 pt: sin cambio), con tope en las combinaciones distintas.
// Con rango 10 el motor completa con repetidos (solo hay 10 combinaciones).
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B, INK } from "../render/papel.js";
import { MIN_OP, cuantos, pintarEl } from "./_elastica.js";

const FIJO = [12, 6];
const MIN_DIBUJO = 160;   // con dibujos (dos filas de círculos sobre el cuadro): tarjetas de siempre

function dobles2(params, azar, k) {
  const op = params.operacion, formas = op === "mitades" ? [2] : op === "mezcla" ? [0, 1, 2] : [0, 1], pool = [];
  for (let n = 10; n <= 50; n++) if (n % 10 <= 4) for (const forma of formas) pool.push({ n, forma });
  let cs = azar.muestra(pool, k);
  if (op === "mezcla") {   // la mitad de dobles y la mitad de mitades (con k impar, un doble de más)
    const nd = Math.ceil(k / 2), d = azar.muestra(pool.filter((c) => c.forma < 2), nd), m = azar.muestra(pool.filter((c) => c.forma === 2 && !d.some((x) => x.n === c.n)), k - nd);
    cs = azar.barajar([...d, ...m]);
  }
  return {
    enunciado: op === "mitades" ? "Calcula la mitad de cada número." : op === "mezcla" ? "Calcula el doble o la mitad." : "Calcula el doble de cada número.",
    ejercicios: cs.map(({ n, forma }) => ({ datos: { n, forma }, solucion: { huecos: [forma === 2 ? n : 2 * n] } })),
  };
}

export default registrar({
  id: "sumar.dobles",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const minAlto = params.modo === "dibujo" ? MIN_DIBUJO : MIN_OP;
    if ((params.rango ?? 10) >= 100) {   // banco: 21 números (10–14, 20–24…, 50) × 2 formas; en «mitades» y «mezcla», 21 como máximo (los dobles no dejan sin mitades)
      const op = params.operacion, banco = op === "mitades" || op === "mezcla" ? 21 : 42;
      return dobles2(params, azar, cuantos(ctx, 3, minAlto, FIJO, banco));
    }
    const R = params.rango ?? 10, cap = Math.max(2, Math.min(10, Math.floor(R / 2))), pool = [];
    for (let n = 1; n <= cap; n++) for (const forma of [0, 1]) pool.push({ n, forma });
    const k = cuantos(ctx, 3, minAlto, FIJO, pool.length);
    const cs = azar.muestra(pool, k);
    while (cs.length < k) cs.push(azar.elegir(pool));
    return {
      enunciado: "Calcula el doble de cada número.",
      ejercicios: cs.map(({ n, forma }) => ({ datos: { n, forma }, solucion: { huecos: [2 * n] } })),
    };
  },
  dibujar(p, act) {
    const dibujo = act.params.modo === "dibujo", es = act.ejercicios;
    const items = (e) => { const { n, forma } = e.datos, s = e.solucion.huecos[0];
      return forma === 0 ? [T(`${n} + ${n} =`, 17), B(44, 38, s)] : forma === 1 ? [T(`Doble de ${n} =`, 14), B(44, 38, s)] : [T(`Mitad de ${2 * n} =`, 14), B(44, 38, s)]; };
    if (!dibujo) { pintarEl(p, 3, es.map(items), es.map((e) => e.id), 4, 10); return; }
    const { cel, cw, ch } = p.rejilla(TOP, 3, Math.max(Math.ceil(es.length / 3), p.n(4)));   // con dibujos las tarjetas son las de siempre
    es.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { n } = e.datos, pitch = Math.min(20, (cw - 36) / n), r = Math.min(6, pitch * 0.3), x0 = x + cw / 2 - (n - 1) * pitch / 2;
      p.marco(x, y, cw, ch, i);
      for (let j = 0; j < n; j++) {
        p.circle(x0 + j * pitch, y + 128 + pitch / 2, r, { fill: INK, stroke: null });
        p.circle(x0 + j * pitch, y + 128 - pitch / 2, r, { fill: INK, stroke: null });
      }
      p.linea(x, y + 10, cw, 60, items(e), 8);
    }));
  },
});
