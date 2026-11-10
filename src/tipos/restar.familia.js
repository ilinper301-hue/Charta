// restar.familia · Familias de operaciones: de una suma, dos restas (port de _r_familia() y _pares_suma() del motor).
// datos:    { a, b, t }     (t = a + b; a ≠ b; t ≤ min(rango, 99))
// solucion: { huecos: [t − a, t − b] }   (es decir [b, a]; en la tarjeta, de arriba abajo)
// Opción nivel: llevadas de la suma a + b (como sumar.h20 / sumar.vertical). Hasta 10 no hay opción.
// Completa: 8 tarjetas (4 filas × 2); media: 4. Sin repetidos (el motor los permitía con rango 30).
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B, MENOS } from "../render/papel.js";
import { pares } from "./sumar.h20.js";
import { paresSuma3 } from "./_tres.js";

/** Grupos de pares (a, b) de _pares_suma(R, nivel) del motor (copia propia). */
function gruposSuma(R, nivel) {
  nivel = nivel || "sin";
  const r = (lo, hi, st = 1) => { const o = []; for (let v = lo; v <= hi; v += st) o.push(v); return o; };
  const prod = (as, bs, f) => as.flatMap((a) => bs.map((b) => [a, b])).filter(([a, b]) => f(a, b));
  if (R <= 10) return [prod(r(1, 9), r(1, 9), (a, b) => a + b <= 10)];
  if (R <= 20) {
    const sin = prod(r(1, 19), r(1, 19), (a, b) => a + b <= 20 && !(a < 10 && b < 10 && a + b > 10));
    const con = prod(r(2, 9), r(2, 9), (a, b) => a + b > 10);
    con.lleva = true;   // pares(): no rellenar con otro tipo de grupo
    return { sin: [sin], con: [con], mezcla: [sin, con] }[nivel];
  }
  const cap = Math.min(R, 99), ten = r(10, cap, 10), uu = r(11, cap - 1).filter((a) => a % 10);
  const dd = prod(ten, ten, (a, b) => a + b <= cap);
  const du0 = prod(ten, r(1, 9), (a, b) => a + b <= cap), du = [...du0, ...du0.map(([a, b]) => [b, a])];
  const s = prod(uu, r(1, 9), (a, b) => a % 10 + b < 10 && a + b <= cap);
  const k = prod(uu, r(1, 9), (a, b) => a % 10 + b >= 10 && a + b <= cap);
  k.lleva = true;   // pares(): no rellenar con otro tipo de grupo
  return { sin: [dd, du, s], con: [k], mezcla: [dd, du, s, k] }[nivel];
}

export default registrar({
  id: "restar.familia",
  version: 1,
  generar(params, azar, { tamano }) {
    // Como el motor (20 sumas, sin a = b, las primeras 8), pero sin repetir: con rango 30 el grupo de decenas solo tiene 2 parejas.
    const R = params.rango ?? 10, vistos = new Set(), ps = (R > 100 ? paresSuma3(R, params.nivel, 20, azar) : pares(gruposSuma(R, params.nivel), 20, azar))
      .filter(([a, b]) => a !== b && !vistos.has(a + "," + b) && vistos.add(a + "," + b)).slice(0, tamano === "media" ? 4 : 8);
    return {
      enunciado: "Usa la suma para completar las dos restas.",
      ejercicios: ps.map(([a, b]) => ({ datos: { a, b, t: a + b }, solucion: { huecos: [b, a] } })),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 2, 4);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { a, b, t } = e.datos, s = e.solucion.huecos;
      p.marco(x, y, cw, ch, i);
      p.linea(x, y + ch - 62, cw, 44, [T(`${a} + ${b} = ${t}`, 20)], 8);
      p.linea(x, y + 62, cw, 46, [T(`${t} ${MENOS} ${a} =`, 18), B(48, 36, s[0])], 8);
      p.linea(x, y + 10, cw, 46, [T(`${t} ${MENOS} ${b} =`, 18), B(48, 36, s[1])], 8);
    }));
  },
});
