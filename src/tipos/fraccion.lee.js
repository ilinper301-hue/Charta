// fraccion.lee · ¿Qué parte está coloreada? (3.º, lote 5, bloque 15; solo curso 3, sin rango).
// datos:    { fig: "circulo" | "rect" | "tira", n, k, llenas: [índices coloreados], lee: bool }   (fracción propia k/n, n = 2…12)
// solucion: { huecos: [k, n] } · con «Y cómo se lee»: [k, n, «tres quintos»]
// Opciones: figura (None = mezcla · circulo · rect · tira) · den (None = hasta 12 · 6 · 10) · modo (None = escribe la fracción · "lee" = y cómo se lee).
// Reglas: sin repetir fracción; denominadores por turnos; en la mezcla, las figuras se alternan. Círculo y tira: partes seguidas; rectángulo de varias filas: sueltas.
// Dibujo: 3 × 4 tarjetas (12; media 6) con la figura arriba y la fracción (dos casillas) abajo; con «lee», 2 × 4 (8; media 4): figura a la izquierda,
// fracción a la derecha y «Se lee:» con su renglón debajo.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { denominadores, figurasDe, fraccionesPropias, partesColoreadas, dibujarFigura, fraccion, enLetras } from "./_fraccion.js";

export default registrar({
  id: "fraccion.lee",
  version: 1,
  generar(params, azar, { tamano }) {
    const lee = params.modo === "lee", media = tamano === "media";
    const cnt = lee ? (media ? 4 : 8) : media ? 6 : 12, figs = figurasDe(params), salida = azar.entero(0, figs.length - 1);
    const fr = fraccionesPropias(azar, denominadores(params), cnt);
    const ejercicios = fr.map(([k, n], i) => {
      const fig = figs[(i + salida) % figs.length];
      return { datos: { fig, n, k, llenas: partesColoreadas(azar, fig, n, k), lee }, solucion: { huecos: lee ? [k, n, enLetras(k, n)] : [k, n] } };
    });
    return { enunciado: lee ? "Escribe la fracción de la parte coloreada y cómo se lee." : "¿Qué parte está coloreada? Escribe la fracción.", ejercicios };
  },
  dibujar(p, act) {
    const es = act.ejercicios, lee = act.params.modo === "lee", cols = lee ? 2 : 3, filas = p.parte < 1 ? 2 : 4;
    const { cel, cw, ch } = p.rejilla(TOP, cols, filas);
    es.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { fig, n, llenas } = e.datos, h = e.solucion.huecos;
      p.marco(x, y, cw, ch, i);
      if (!lee) {
        const hb = Math.min(30, (ch - 40) * 0.2), wb = hb * 1.25, alto = hb * 2 + 10, zona = ch - 30 - alto - 14;
        dibujarFigura(p, fig, n, llenas, x + cw / 2, y + alto + 12 + zona / 2, cw - 36, zona);
        fraccion(p, x + cw / 2, y + 6 + alto / 2, null, null, 20, { hueco: { w: wb, h: hb, sol: [h[0], h[1]] } });
        return;
      }
      const lin = 34, zona = ch - 30 - lin, fw = cw * 0.55;
      dibujarFigura(p, fig, n, llenas, x + 14 + fw / 2, y + lin + zona / 2, fw - 14, zona - 8);
      const hb = Math.min(32, zona * 0.3);
      fraccion(p, x + fw + (cw - fw) / 2, y + lin + zona / 2, null, null, 20, { hueco: { w: hb * 1.25, h: hb, sol: [h[0], h[1]] } });
      p.text(x + 14, y + 13, "Se lee:", 13, { f: "PM", gris: 0.3 });
      const x0 = x + 14 + p.ancho("Se lee:", "PM", 13) + 8;
      p.line(x0, y + 11, x + cw - 14, y + 11, { lw: 1, gris: 0.55 });
      if (p.solucion) p.solucionEn((x0 + x + cw - 14) / 2, y + 22, h[2], 15);
    }));
  },
});
