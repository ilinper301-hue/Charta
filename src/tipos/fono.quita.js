// fono.quita · Quita una sílaba (Lengua 1.º, lote 2; LENGUA_1.md §3, bloque 1). Versión escrita.
// datos:    { silabas: [sílabas de la palabra, en el caso elegido], k: índice de la sílaba que se quita (0 = la primera, última = la última) }
// solucion: { huecos: [lo que queda] }   las demás sílabas juntas; con «Mayúscula inicial» conserva la mayúscula solo si la primera sílaba se queda.
// Reglas: palabra del léxico con el silabeo de reglas.js (2–4 sílabas); la sílaba que se quita y lo que queda tienen al menos 2 letras y son distintas;
//         «mezcla» = la mitad quita la primera y la otra mitad la última. Sin repetir palabras. Palabras de hasta 10 letras (2.º: hasta 13 y 5 sílabas; «variadas» = 2 a 5).
// Opciones: sílaba que se quita (primera / última / mezcla) · sílabas (variadas, 2, 3 o 4) · tipo de sílabas · caso. Cantidad: 2 columnas, la frase en tres líneas («Si a ca-sa» / «le quito [ca],» / «queda [   ]»); «Más grandes» 16 palabras (media: 8), «Más ejercicios» las que caben con tarjetas ≥ 60 pt.
import { registrar } from "../nucleo/tipos.js";
import { TOP, INK, cuantosRejilla } from "../render/papel.js";
import { silabas } from "../lengua/reglas.js";
import { trozosCaso, cuantas, largosDe, topeLetras, conTope } from "./_lengua.js";
import { elegirIdx, repartir } from "./_fono.js";

const MIN_ALTO = 60;   // alto mínimo de tarjeta con «Más ejercicios»

export default registrar({
  id: "fono.quita",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const ps = conTope(cuantosRejilla(ctx, 2, MIN_ALTO, [16, 8]), cuantas(ctx.tamano, 8), (n) => {
      const objetivos = params.quitar === "ultima" ? Array(n).fill(1) : params.quitar === "mezcla" ? repartir(azar, n, [0, 1]) : Array(n).fill(0);
      const intento = (e, i) => {
        const ss = silabas(e.p), k = objetivos[i] ? ss.length - 1 : 0, resto = ss.filter((_, j) => j !== k).join("");
        return ss[k].length >= 2 && resto.length >= 2 && ss[k] !== resto ? { k } : null;
      };
      return elegirIdx(azar, n, params, largosDe(params, [2, 3, 2, 3, 4], [2, 3, 4, 3, 5, 2, 4, 5]), intento, { extra: { maxLetras: topeLetras(10, 13) }, id: "fono.quita" });
    });
    return {
      enunciado: "Quita la sílaba y escribe lo que queda.",
      ejercicios: ps.map(({ p, r }) => {
        const ss = trozosCaso(silabas(p), params.caso);
        return { datos: { silabas: ss, k: r.k }, solucion: { huecos: [ss.filter((_, j) => j !== r.k).join("")] } };
      }),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.rejilla(TOP, 2, Math.ceil(act.ejercicios.length / 2));
    const x0 = 32, w = cw - x0 - 10, lh = (ch - 8) / 3, textoDe = (e) => { const ss = e.datos.silabas; return { palabra: ss.join("-"), quitada: ss[e.datos.k] }; };
    // «Si a / ca-sa», «le quito [ca],» y «queda [   ]» en tres líneas; mismo tamaño de letra en toda la actividad (el que cabe en la línea más larga)
    const l1 = (f, { palabra }) => p.ancho("Si a", "PM", f) + p.ancho(palabra, "PB", f * 1.15) + f * 0.5, l2 = (f, { quitada }) => p.ancho("le quito", "PM", f) + p.ancho(quitada, "PB", f) + f * 2.2;
    let f = Math.min(20, lh * 0.7); while (f > 10 && act.ejercicios.some((e) => Math.max(l1(f, textoDe(e)), l2(f, textoDe(e))) > w)) f -= 1;
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { palabra, quitada } = textoDe(e), cy = (k) => y + ch - 4 - lh * (k + 0.5), g = f * 0.5;
      p.marco(x, y, cw, ch, i);
      let cx = x + x0; const ty = (k) => cy(k) - f * 0.35;
      p.text(cx, ty(0), "Si a", f, { f: "PM", gris: INK }); cx += p.ancho("Si a", "PM", f) + g;
      p.text(cx, ty(0), palabra, f * 1.15, { f: "PB", gris: INK });
      cx = x + x0; p.text(cx, ty(1), "le quito", f, { f: "PM", gris: INK }); cx += p.ancho("le quito", "PM", f) + g;
      const qw = p.ancho(quitada, "PB", f) + f * 1.2;
      p.rrect(cx, cy(1) - f * 0.85, qw, f * 1.7, f * 0.85, { lw: 0.8, fill: 1, stroke: 0.55 });
      p.text(cx + qw / 2, ty(1), quitada, f, { f: "PB", anchor: "middle" }); cx += qw + g * 0.4;
      p.text(cx, ty(1), ",", f, { f: "PM" });
      cx = x + x0; p.text(cx, ty(2), "queda", f, { f: "PM", gris: INK }); cx += p.ancho("queda", "PM", f) + g * 1.6;
      const bh = Math.min(lh * 0.95, 34);
      p.caja(cx, cy(2) - bh / 2, x + cw - 10 - cx, bh, null, 20, e.solucion.huecos[0]);
    }));
  },
});
