// fraccion.letras · La fracción en letras (3.º, lote 5, bloque 15; solo curso 3, sin rango).
// datos:    { k, n, sentido: "leer" | "escribir" }   (fracción propia k/n, n = 2…12)
// solucion: { huecos: ["tres quintos"] } (leer: 3/5 = ______) · [k, n] (escribir: «tres quintos =» y la fracción en dos casillas)
// Opciones: modo (None = los dos sentidos, alternados · "leer" · "escribir") · den (None = hasta 12 · 6 · 10).
// Reglas: sin repetir fracción; denominadores por turnos; en «los dos sentidos», mitad y mitad.
// Dibujo: rejilla elástica de 2 columnas con «Cantidad»: «Más grandes» 12 (media 6); «Más ejercicios», las que caben con tarjetas ≥ 74 pt.
import { registrar } from "../nucleo/tipos.js";
import { TOP, cuantosRejilla } from "../render/papel.js";
import { denominadores, fraccionesPropias, fraccion, enLetras } from "./_fraccion.js";

const MIN_ALTO = 74;

export default registrar({
  id: "fraccion.letras",
  version: 1,
  cantidad: true,
  generar(params, azar, ctx) {
    const modo = params.modo ?? null, dens = denominadores(params), banco = dens.reduce((t, n) => t + n - 1, 0);
    const cnt = Math.min(cuantosRejilla(ctx, 2, MIN_ALTO, [12, 6]), Math.floor(banco / 2) * 2);
    const empieza = azar.entero(0, 1);
    const ejercicios = fraccionesPropias(azar, dens, cnt).map(([k, n], i) => {
      const sentido = modo ?? ((i + empieza) % 2 ? "escribir" : "leer");
      return { datos: { k, n, sentido }, solucion: { huecos: sentido === "leer" ? [enLetras(k, n)] : [k, n] } };
    });
    return {
      enunciado: modo === "leer" ? "Escribe cómo se lee cada fracción." : modo === "escribir" ? "Escribe la fracción con números."
        : "Escribe cómo se lee cada fracción o escríbela con números.",
      ejercicios,
    };
  },
  dibujar(p, act) {
    const es = act.ejercicios, filas = Math.max(Math.ceil(es.length / 2), p.n(6));
    const { cel, cw, ch } = p.rejilla(TOP, 2, filas);
    const k = Math.max(1, Math.min(1.3, (ch - 14) / 64)), fs = 20 * k, hb = 24 * k;
    const largos = es.filter((e) => e.datos.sentido === "escribir").map((e) => p.ancho(`${enLetras(e.datos.k, e.datos.n)} =`, "PB", 17));
    const ft = Math.min(17 * k, ...largos.map((w) => 17 * (cw - 44 - 16 - (hb * 1.3 + 8)) / w));
    es.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { k: a, n, sentido } = e.datos, h = e.solucion.huecos, cy = y + ch / 2 - 4;
      p.marco(x, y, cw, ch, i);
      const x0 = x + 38;
      if (sentido === "leer") {
        const bw = fraccion(p, x0 + 14 * k, cy, a, n, fs);
        const xi = x0 + 14 * k + bw / 2 + 8;
        p.text(xi, cy - fs * 0.35, "=", fs);
        const xl = xi + p.ancho("=", "PB", fs) + 8, yl = cy - hb / 2;
        p.line(xl, yl, x + cw - 14, yl, { lw: 1, gris: 0.55 });
        if (p.solucion) {
          const sf = Math.min(15 * k, 15 * (x + cw - 18 - xl) / p.ancho(h[0], "PB", 15));
          p.solucionEn((xl + x + cw - 14) / 2, yl + 4 + sf * 0.45, h[0], sf);
        }
        return;
      }
      const t = `${enLetras(a, n)} =`, tw = p.ancho(t, "PB", ft), fw = hb * 1.3 + 8, total = tw + 16 + fw, xi = x + 30 + (cw - 44 - total) / 2;
      p.text(xi + tw, cy - ft * 0.35, t, ft, { anchor: "end" });   // anclado a la derecha: el hueco hasta la fracción no depende del ancho medido
      fraccion(p, xi + tw + 16 + fw / 2, cy, null, null, fs, { hueco: { w: hb * 1.3, h: hb, sol: [h[0], h[1]] } });
    }));
  },
});
