// fono.quita · Quita una sílaba (Lengua 1.º, lote 2; LENGUA_1.md §3, bloque 1). Versión escrita.
// datos:    { silabas: [sílabas de la palabra, en el caso elegido], k: índice de la sílaba que se quita (0 = la primera, última = la última) }
// solucion: { huecos: [lo que queda] }   las demás sílabas juntas; con «Mayúscula inicial» conserva la mayúscula solo si la primera sílaba se queda.
// Reglas: palabra del léxico con el silabeo de reglas.js (2–4 sílabas); la sílaba que se quita y lo que queda tienen al menos 2 letras y son distintas;
//         «mezcla» = la mitad quita la primera y la otra mitad la última. Sin repetir palabras. Palabras de hasta 10 letras.
// Opciones: sílaba que se quita (primera / última / mezcla) · sílabas (variadas, 2, 3 o 4) · tipo de sílabas · caso. Completa: 8 palabras; media: 4.
import { registrar } from "../nucleo/tipos.js";
import { TOP, INK } from "../render/papel.js";
import { silabas } from "../lengua/reglas.js";
import { trozosCaso, cuantas, largosDe } from "./_lengua.js";
import { elegirIdx, repartir } from "./_fono.js";

export default registrar({
  id: "fono.quita",
  version: 1,
  generar(params, azar, { tamano }) {
    const n = cuantas(tamano, 8);
    const objetivos = params.quitar === "ultima" ? Array(n).fill(1) : params.quitar === "mezcla" ? repartir(azar, n, [0, 1]) : Array(n).fill(0);
    const intento = (e, i) => {
      const ss = silabas(e.p), k = objetivos[i] ? ss.length - 1 : 0, resto = ss.filter((_, j) => j !== k).join("");
      return ss[k].length >= 2 && resto.length >= 2 && ss[k] !== resto ? { k } : null;
    };
    const ps = elegirIdx(azar, n, params, largosDe(params, [2, 3, 2, 3, 4]), intento, { extra: { maxLetras: 10 }, id: "fono.quita" });
    return {
      enunciado: "Quita la sílaba y escribe lo que queda.",
      ejercicios: ps.map(({ p, r }) => {
        const ss = trozosCaso(silabas(p), params.caso);
        return { datos: { silabas: ss, k: r.k }, solucion: { huecos: [ss.filter((_, j) => j !== r.k).join("")] } };
      }),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 1, 8, 10, 8);
    const bw = 130, textoDe = (e) => { const ss = e.datos.silabas; return { palabra: ss.join("-"), quitada: ss[e.datos.k] }; };
    // «Si a ca-sa le quito [ca], queda [   ]» en una fila; mismo tamaño de letra en toda la actividad (el que cabe en la fila más larga)
    const total = (f, { palabra, quitada }) => p.ancho("Si a", "PM", f) + p.ancho(palabra, "PB", f * 1.15) + p.ancho("le quito", "PM", f) + p.ancho(quitada, "PB", f) + f * 1.2 + p.ancho("queda", "PM", f) + bw + f * 4.6;
    let f = 22; while (f > 13 && act.ejercicios.some((e) => total(f, textoDe(e)) > cw - 56)) f -= 1;
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { palabra, quitada } = textoDe(e);
      p.marco(x, y, cw, ch, i);
      let cx = x + 28; const ty = y + ch / 2 - f * 0.35, g = f * 0.5;
      const t = (s, fnt, fz) => { p.text(cx, ty, s, fz, { f: fnt, gris: INK }); cx += p.ancho(s, fnt, fz) + g; };
      t("Si a", "PM", f); t(palabra, "PB", f * 1.15); t("le quito", "PM", f);
      const qw = p.ancho(quitada, "PB", f) + f * 1.2;
      p.rrect(cx, y + ch / 2 - f * 0.95, qw, f * 1.9, f * 0.95, { lw: 0.8, fill: 1, stroke: 0.55 });
      p.text(cx + qw / 2, ty, quitada, f, { f: "PB", anchor: "middle" }); cx += qw + g * 0.4;
      p.text(cx, ty, ",", f, { f: "PM" }); cx += g * 1.2;
      t("queda", "PM", f);
      p.caja(cx, y + (ch - 40) / 2, Math.min(bw, x + cw - 14 - cx), 40, null, 22, e.solucion.huecos[0]);
    }));
  },
});
