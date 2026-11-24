// fraccion.colorea · Colorea la fracción (3.º, lote 5, bloque 15; solo curso 3, sin rango).
// datos:    { fig: "circulo" | "rect" | "tira", n, k }   (fracción propia k/n, n = 2…12; la figura sale partida en n partes iguales, en blanco)
// solucion: { huecos: [], colorea: k }   (en la solución, k partes en rojo claro: las primeras; vale cualquier k partes)
// Opciones: figura (None = mezcla · circulo · rect · tira) · den (None = hasta 12 · 6 · 10).
// Reglas: sin repetir fracción; denominadores por turnos; en la mezcla, las figuras se alternan.
// Dibujo: 3 × 4 tarjetas (12; media 6): la fracción arriba y la figura debajo.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { denominadores, figurasDe, fraccionesPropias, dibujarFigura, fraccion, ROJO_PARTE } from "./_fraccion.js";

export default registrar({
  id: "fraccion.colorea",
  version: 1,
  generar(params, azar, { tamano }) {
    const cnt = tamano === "media" ? 6 : 12, figs = figurasDe(params), salida = azar.entero(0, figs.length - 1);
    const ejercicios = fraccionesPropias(azar, denominadores(params), cnt).map(([k, n], i) => ({
      datos: { fig: figs[(i + salida) % figs.length], n, k },
      solucion: { huecos: [], colorea: k },
    }));
    return { enunciado: "Colorea la parte de la figura que indica la fracción.", ejercicios };
  },
  dibujar(p, act) {
    const es = act.ejercicios, { cel, cw, ch } = p.rejilla(TOP, 3, p.parte < 1 ? 2 : 4);
    es.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { fig, n, k } = e.datos, fs = 20, alto = fs * 2.1;
      p.marco(x, y, cw, ch, i);
      fraccion(p, x + cw / 2, y + ch - 14 - alto / 2, k, n, fs);
      const zona = ch - 30 - alto - 14, llenas = p.solucion ? Array.from({ length: k }, (_, j) => j) : [];
      dibujarFigura(p, fig, n, llenas, x + cw / 2, y + 12 + zona / 2, cw - 36, zona, { fill: ROJO_PARTE });
    }));
  },
});
