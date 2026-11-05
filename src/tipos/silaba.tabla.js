// silaba.tabla · Lee las sílabas (Lengua 1.º, lote 1; LENGUA_1.md §3, bloque 3). Solo página completa. Lectura en voz alta: sin respuesta escrita.
// datos:    { silabas: [5 sílabas de la fila], cons: consonante de la fila ("" si la fila mezcla varias) }
// solucion: { huecos: [] }
// Tipos: directas (ma me mi mo mu) · inversas (am em im om um) · trabadas (pla ple pli plo plu) · mixtas (man men min mon mun).
//   Cada sílaba es del tipo pedido según reglas.js (tipoSilaba).
// Opciones: letra (todas las filas de 12 consonantes al azar, o una sola letra) · tipo · orden · caso (minúscula / MAYÚSCULA).
//   Ordenadas: cada fila en orden a e i o u (con una letra concreta, las siguientes filas empiezan por otra vocal).
//   Mezcladas: las sílabas barajadas por toda la tabla (con una letra concreta, cada fila en un orden distinto).
// 12 filas de 5 sílabas.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { alCaso } from "./_lengua.js";

const V = [..."aeiou"];
export const CONSONANTES = ["m", "p", "s", "l", "t", "d", "n", "f", "b", "v", "r", "j", "c", "z", "g", "h", "ñ", "ch", "ll"];
const DIRECTA = { c: ["ca", "ce", "ci", "co", "cu"], g: ["ga", "gue", "gui", "go", "gu"] };
const CODAS_INV = ["l", "n", "r", "s", "m", "d", "z", "c", "p", "t", "b", "x"];
const GRUPOS = ["pl", "pr", "bl", "br", "fl", "fr", "cl", "cr", "gl", "gr", "dr", "tr"];
const INICIAL_MIXTA = ["m", "p", "s", "l", "t", "d", "n", "f", "b", "r"], CODAS_MIXTA = ["n", "s", "l", "r"];

/** Todas las filas posibles de un tipo: { cons, sil: [5 sílabas en orden a e i o u] }. «cons» = la letra que se elige en la opción. */
export function filasDe(tipo) {
  if (tipo === "inversas") return CODAS_INV.map((c) => ({ cons: c, sil: V.map((v) => v + c) }));
  if (tipo === "trabadas") return GRUPOS.map((g) => ({ cons: g[0], sil: V.map((v) => g + v) }));
  if (tipo === "mixtas") return INICIAL_MIXTA.flatMap((c) => CODAS_MIXTA.map((k) => ({ cons: c, sil: V.map((v) => c + v + k) })));
  return CONSONANTES.map((c) => ({ cons: c, sil: DIRECTA[c] || V.map((v) => c + v) }));
}
const FILAS = 12;

export default registrar({
  id: "silaba.tabla",
  version: 1,
  generar(params, azar) {
    const tipo = params.tipo || "directas", mezcla = params.orden === "mezcladas";
    let pool = filasDe(tipo);
    if (params.letra) {
      pool = pool.filter((f) => f.cons === params.letra);
      if (!pool.length) throw new Error(`«silaba.tabla» necesita una letra que tenga sílabas de ese tipo (con «${params.letra}» no hay sílabas ${tipo}).`);
    }
    let filas;
    if (params.letra) {
      const base = pool.length === 1 ? pool : azar.muestra(pool, Math.min(pool.length, 3));   // mixtas/trabadas: varias codas o grupos de la misma letra
      filas = Array.from({ length: FILAS }, (_, r) => {
        const b = base[r % base.length], sil = b.sil;
        return mezcla ? azar.barajar(sil) : [...sil.slice(Math.floor(r / base.length) % 5), ...sil.slice(0, Math.floor(r / base.length) % 5)];
      });
    } else {
      const elegidas = azar.muestra(pool, FILAS).sort((a, b) => pool.indexOf(a) - pool.indexOf(b));
      if (mezcla) {
        const todas = azar.barajar(elegidas.flatMap((f) => f.sil));
        filas = Array.from({ length: FILAS }, (_, r) => todas.slice(r * 5, r * 5 + 5));
      } else filas = elegidas.map((f) => f.sil);
    }
    const mayus = params.caso === "mayus";
    return {
      enunciado: "Lee en voz alta las sílabas de cada fila.",
      ejercicios: filas.map((sil) => ({ datos: { silabas: sil.map((s) => alCaso(s, mayus ? "mayus" : null)) }, solucion: { huecos: [] } })),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 1, FILAS, 10, 6);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], n = e.datos.silabas.length, x0 = x + 50, w = cw - 64, fs = 30;
      p.marco(x, y, cw, ch, i);
      e.datos.silabas.forEach((s, k) => p.text(x0 + (k + 0.5) * (w / n), y + ch / 2 - fs * 0.35, s, fs, { f: "PB", anchor: "middle" }));
    }));
  },
});
