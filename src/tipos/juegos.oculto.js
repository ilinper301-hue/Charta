// juegos.oculto · El número oculto (port de _j_oculto() y _pistas() del motor).
// datos:    { t, pistas: ["Soy mayor que 4.", …] }   (3–4 pistas en texto; juntas dejan solo el número t entre 1 y el rango)
// solucion: { huecos: [t] }
// Completa: 8 (2 columnas × 4 filas); media: 4. Los números t son distintos (2..rango − 1).
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B } from "../render/papel.js";

/** _pistas(t, R): hasta 3 pistas que acotan el conjunto de candidatos + una de «Vengo después/antes» si hace falta. */
function pistas(t, R, azar) {
  let C = new Set(Array.from({ length: R }, (_, i) => i + 1)); const out = [];
  const filtra = (f) => new Set([...Array.from({ length: R }, (_, i) => i + 1)].filter(f));
  const pista = (tp) => {
    if (tp === "gt") { const a = azar.entero(Math.max(1, t - 6), t - 1); return [`Soy mayor que ${a}.`, filtra((v) => v > a)]; }
    if (tp === "lt") { const b = azar.entero(t + 1, Math.min(R + 1, t + 6)); return [`Soy menor que ${b}.`, filtra((v) => v < b)]; }
    if (tp === "par") return t % 2 === 0 ? ["Soy par.", filtra((v) => v % 2 === 0)] : ["Soy impar.", filtra((v) => v % 2 === 1)];
    if (tp === "dec") { const d = Math.floor(t / 10); return [`Tengo ${d} decena${d !== 1 ? "s" : ""}.`, filtra((v) => Math.floor(v / 10) === d)]; }
    const u = t % 10; return [`Tengo ${u} unidad${u !== 1 ? "es" : ""}.`, filtra((v) => v % 10 === u)];
  };
  for (const tp of azar.barajar(["gt", "lt", "par", "uni", ...(t >= 10 ? ["dec"] : [])])) {
    if (out.length >= 3 || (C.size === 1 && out.length >= 2)) break;
    const [txt, S] = pista(tp);
    if (S.size < C.size || out.length < 2) { out.push(txt); C = new Set([...C].filter((v) => S.has(v))); }
  }
  if (C.size > 1) out.push(azar.real() < 0.5 ? `Vengo después del ${t - 1}.` : `Vengo antes del ${t + 1}.`);
  return out;
}

export default registrar({
  id: "juegos.oculto",
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 10;
    if (R < 10) throw new Error("El número oculto necesita un rango máximo de al menos 10.");
    const pool = Array.from({ length: R - 2 }, (_, i) => i + 2), cnt = tamano === "media" ? 4 : 8;
    const ejercicios = azar.muestra(pool, cnt).map((t) => ({ datos: { t, pistas: pistas(t, R, azar) }, solucion: { huecos: [t] } }));
    return { enunciado: "Lee las pistas y escribe qué número soy.", ejercicios };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 2, 4);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i];
      p.marco(x, y, cw, ch, i, "¿QUÉ NÚMERO SOY?");
      e.datos.pistas.forEach((t, k) => p.text(x + 18, y + ch - 50 - k * 19, t, 12, { f: "PR" }));
      p.linea(x, y + 8, cw, 44, [T("Soy el", 14, "PM"), B(54, 38, e.solucion.huecos[0])], 8);
    }));
  },
});
