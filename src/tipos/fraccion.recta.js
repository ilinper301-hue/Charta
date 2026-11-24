// fraccion.recta · Fracciones en la recta (3.º, lote 5, bloque 15; solo curso 3, sin rango).
// datos:    { n, puntos: [k…] (ordenados), modo: null | "marca" }   (recta de 0 a 1 partida en n partes iguales)
// solucion: { huecos: [k1, n, k2, n] } (escribe: dos puntos señalados, cada uno con su fracción en dos casillas debajo)
//           · "marca": { huecos: [], marca: k } (la fracción k/n a la izquierda; se marca el punto: en la solución, punto rojo)
// Opciones: modo (None = escribe la fracción de los puntos · "marca") · den (None = hasta 12 · 6 · 10).
// Reglas: denominadores distintos en la ficha mientras se pueda (por turnos); en «escribe», dos puntos de 1…n−1 no vecinos (salvo en tercios).
// Dibujo: una recta por tarjeta, 6 (media 3).
import { registrar } from "../nucleo/tipos.js";
import { TOP, INK } from "../render/papel.js";
import { denominadores, fraccion, ROJO } from "./_fraccion.js";

export default registrar({
  id: "fraccion.recta",
  version: 1,
  generar(params, azar, { tamano }) {
    const marca = params.modo === "marca", cnt = tamano === "media" ? 3 : 6, dens = denominadores(params).filter((n) => marca || n >= 3);
    const ns = [];
    while (ns.length < cnt) ns.push(...azar.barajar(dens));
    const usados = new Set();
    const ejercicios = ns.slice(0, cnt).map((n) => {
      // todas las opciones válidas (en «escribe», dos puntos no vecinos salvo en tercios: sus casillas se tocarían); primero las no usadas
      const todas = [];
      for (let a = 1; a < n; a++) if (marca) todas.push([a]); else for (let b = a + (n > 3 ? 2 : 1); b < n; b++) todas.push([a, b]);
      const libres = todas.filter((q) => !usados.has(n + ":" + q)), puntos = azar.elegir(libres.length ? libres : todas);
      usados.add(n + ":" + puntos);
      return {
        datos: { n, puntos, modo: marca ? "marca" : null },
        solucion: marca ? { huecos: [], marca: puntos[0] } : { huecos: [puntos[0], n, puntos[1], n] },
      };
    });
    return { enunciado: marca ? "Marca en la recta el punto de cada fracción." : "Escribe la fracción de cada punto señalado.", ejercicios };
  },
  dibujar(p, act) {
    const es = act.ejercicios, { cel, cw, ch } = p.rejilla(TOP, 1, p.parte < 1 ? 3 : 6);
    es.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { n, puntos, modo } = e.datos, marca = modo === "marca";
      p.marco(x, y, cw, ch, i);
      const xa = x + (marca ? 110 : 48), xb = x + cw - 40, paso = (xb - xa) / n;
      const ly = marca ? y + ch / 2 + 6 : y + ch - 26, X = (k) => xa + k * paso;
      if (marca) fraccion(p, x + 66, ly, puntos[0], n, 20);
      p.line(xa, ly, xb, ly, { lw: 1.8 });
      for (let k = 0; k <= n; k++) p.line(X(k), ly - (k % n ? 7 : 11), X(k), ly + (k % n ? 7 : 11), { lw: k % n ? 1.4 : 1.8 });
      p.text(xa, ly - 28, "0", 15, { anchor: "middle" });
      p.text(xb, ly - 28, "1", 15, { anchor: "middle" });
      if (marca) {
        if (p.solucion) p.circle(X(puntos[0]), ly, 5, { lw: 1.2, fill: ROJO, stroke: ROJO });
        return;
      }
      const hb = Math.min(28, (ly - 14 - (y + 8) - 10) / 2), wb = Math.min(hb * 1.2, (n > 3 ? 2 : 1) * paso - 10);
      puntos.forEach((k, j) => {
        // flecha hacia el punto (desde arriba) y su fracción en dos casillas debajo
        p.path([["M", X(k), ly + 8], ["L", X(k) - 5, ly + 17], ["L", X(k) + 5, ly + 17], ["Z"]], { lw: 1, fill: INK, stroke: INK });
        p.line(X(k), ly + 17, X(k), ly + 24, { lw: 1.6 });
        const h = e.solucion.huecos;
        fraccion(p, X(k), ly - 14 - hb - 5, null, null, 20, { hueco: { w: wb, h: hb, sol: [h[2 * j], h[2 * j + 1]] } });
      });
    }));
  },
});
