// multiplicar.filas · Filas y columnas (2.º, lote 6, bloque 13): matriz de puntos de r filas × c columnas.
// datos:    { r, c }   (r 2–5 filas, c 2–6 columnas; como mucho una matriz cuadrada r = c por actividad; sin repetir (r, c))
// solucion: modo None → huecos [r, c, r, c, r·c]            («[r] filas de [c]» y «[r] × [c] = [ ]»)
//           modo "dos" → huecos [r, c, r, c, r·c, c, r, r·c] (además «[c] × [r] = [ ]»: propiedad conmutativa)
// Opción modo: None = «Una multiplicación» · "dos" = «Las dos multiplicaciones». `tablas` no se usa.
// Completa: 6 tarjetas (una por fila; la media página son 3).
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B } from "../render/papel.js";
import { POR } from "./_multiplicar.js";

const PARES = [];
for (let r = 2; r <= 5; r++) for (let c = 2; c <= 6; c++) PARES.push([r, c]);

/** cnt pares distintos, con a lo sumo uno cuadrado (r = c). */
function elegir(cnt, azar) {
  const out = []; let cuadrado = false;
  for (const [r, c] of azar.barajar(PARES)) {
    if (out.length === cnt) break;
    if (r === c) { if (cuadrado) continue; cuadrado = true; }
    out.push([r, c]);
  }
  return out;
}

export default registrar({
  id: "multiplicar.filas",
  version: 1,
  generar(params, azar, { tamano }) {
    const dos = params.modo === "dos";
    return {
      enunciado: dos ? "Cuenta las filas y los puntos de cada fila. Escribe las dos multiplicaciones."
        : "Cuenta las filas y los puntos de cada fila. Escribe la multiplicación.",
      ejercicios: elegir(tamano === "media" ? 3 : 6, azar).map(([r, c]) => ({
        datos: { r, c }, solucion: { huecos: [r, c, r, c, r * c, ...(dos ? [c, r, r * c] : [])] },
      })),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 1, 6), dos = act.params.modo === "dos";
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { r, c } = e.datos, h = e.solucion.huecos;
      p.marco(x, y, cw, ch, i);
      // matriz de puntos, centrada en el lado izquierdo
      const paso = 18, mw = (c - 1) * paso, mh = (r - 1) * paso, mx = x + 40 + (5 * paso - mw) / 2 + 12, my = y + ch / 2 + mh / 2 - 2;
      p.rrect(mx - 14, my - mh - 14, mw + 28, mh + 28, 10, { lw: 1.2, fill: 1, stroke: 0.55 });
      for (let a = 0; a < r; a++) for (let b = 0; b < c; b++) p.circle(mx + b * paso, my - a * paso, 5.5, { lw: 1, fill: 0.12 });
      // escritura a la derecha
      const lx = x + 230, lw = cw - 230 - 8, hb = 28, fs = 17, alto = hb + 6;
      const filas = [
        [B(34, hb, h[0]), T("filas de", 15, "PR"), B(34, hb, h[1])],
        [B(34, hb, h[2]), T(POR, fs), B(34, hb, h[3]), T("=", fs), B(44, hb, h[4])],
        ...(dos ? [[B(34, hb, h[5]), T(POR, fs), B(34, hb, h[6]), T("=", fs), B(44, hb, h[7])]] : []),
      ];
      const y0 = y + (ch - filas.length * alto) / 2;
      filas.forEach((it, j) => p.linea(lx, y0 + (filas.length - 1 - j) * alto, lw, alto, it, 8));
    }));
  },
});
