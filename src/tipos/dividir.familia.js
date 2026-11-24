// dividir.familia · La familia de la multiplicación y la división (3.º, lote 4, bloque 14; solo curso 3, sin rango).
// Una tarjeta = una familia de tres números a < b (factores 2–10) y c = a × b.
// datos:    { a, b, c, esc?: [0..3] }   (esc = qué se esconde en cada fila de «Completa»; sin esc en «libre»)
// modo None = «Completa»: cuatro filas con parte escrita y UN hueco de solución única:
//   fila 1  a × b = ☐ (c) o b × a = ☐ (c, orden aleatorio) · fila 2  b × ☐ = c (a) o a × ☐ = c (b) · fila 3  c ÷ a = ☐ (b) o c ÷ b = ☐ (a) · fila 4  c ÷ ☐ = a (b) o c ÷ ☐ = b (a)
//   datos.f = [[x, y], [x, y], [x, y], [x, y]] ya con los números escritos (null = hueco) para que el dibujo no recalcule nada.
//   solucion.huecos = [c, a|b, b|a, b|a]  (un hueco por fila, de arriba abajo)
// modo "libre": se dan los tres números (en un triángulo) y cuatro filas «☐ × ☐ = ☐», «☐ × ☐ = ☐», «☐ ÷ ☐ = ☐», «☐ ÷ ☐ = ☐».
//   solucion.huecos = [a, b, c,  b, a, c,  c, a, b,  c, b, a]  (a × b = c, b × a = c, c ÷ a = b, c ÷ b = a; 12 huecos)
// Opciones: tablas (factor de la tabla: None = del 2 al 10 · "2a5" · "6a9"; al menos uno de los dos factores de la familia está en las tablas elegidas) · modo.
// Sin repetir la familia {a, b}. Completa: 6 tarjetas (2 columnas × 3); media: 4 en «Completa» (2 × 2) y 2 en «libre» (más altas).
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B } from "../render/papel.js";
import { POR } from "./_multiplicar.js";
import { DIV, divisoresDe } from "./_dividir.js";

/** Las cuatro filas de «Completa»: [u, op, v, w] con UN solo null (el hueco); la solución de cada una sale de los tres números. */
function filasCompleta(a, b, c, azar) {
  const [p, q] = azar.elegir([[a, b], [b, a]]);          // fila 1: p × q = ☐ (c)
  const x2 = azar.elegir([a, b]), d3 = azar.elegir([a, b]), d4 = azar.elegir([a, b]);
  return {
    f: [[p, POR, q, null], [x2, POR, null, c], [c, DIV, d3, null], [c, DIV, null, d4]],   // x2 × ☐ = c · c ÷ d3 = ☐ · c ÷ ☐ = d4
    huecos: [c, a + b - x2, a + b - d3, a + b - d4],
  };
}

export default registrar({
  id: "dividir.familia",
  version: 1,
  generar(params, azar, { tamano }) {
    const modo = params.modo ?? null, fs = divisoresDe(params), media = tamano === "media";
    const cnt = modo === "libre" ? (media ? 2 : 4) : media ? 4 : 6;
    // familias {a < b}, con al menos un factor de las tablas elegidas; a ≠ b
    const pool = [];
    for (let a = 2; a <= 10; a++) for (let b = a + 1; b <= 10; b++) if (fs.includes(a) || fs.includes(b)) pool.push([a, b]);
    const elegidas = azar.muestra(pool, cnt), ejercicios = elegidas.map(([a, b]) => {
      const c = a * b;
      if (modo === "libre") return { datos: { a, b, c }, solucion: { huecos: [a, b, c, b, a, c, c, a, b, c, b, a] } };
      const { f, huecos } = filasCompleta(a, b, c, azar);
      return { datos: { a, b, c, f }, solucion: { huecos } };
    });
    return {
      enunciado: modo === "libre" ? "Con los tres números, escribe las dos multiplicaciones y las dos divisiones." : "Completa las cuatro operaciones de cada familia.",
      ejercicios,
    };
  },
  dibujar(p, act) {
    const libre = act.params.modo === "libre", es = act.ejercicios, media = p.parte < 1;
    const { cel, cw, ch } = p.rejilla(TOP, 2, libre ? (media ? 1 : 2) : media ? 2 : 3);
    es.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { a, b, c, f } = e.datos, h = e.solucion.huecos;
      p.marco(x, y, cw, ch, i);
      if (libre) {
        // los tres números, en tres casillas blancas arriba, y debajo las cuatro filas «☐ × ☐ = ☐»
        const w = 46, gap = 18, x0 = x + (cw - (3 * w + 2 * gap)) / 2;
        [a, b, c].forEach((n, k) => p.caja(x0 + k * (w + gap), y + ch - 62, w, 40, n, 22));
        const hh = Math.min(70, (ch - 84) / 4);
        [POR, POR, DIV, DIV].forEach((op, r) => {
          const s = h.slice(3 * r, 3 * r + 3);
          p.linea(x, y + ch - 84 - (r + 1) * hh, cw, hh, [B(46, 36, s[0]), T(op, 20), B(46, 36, s[1]), T("=", 20), B(46, 36, s[2])], 8);
        });
      } else {
        const hh = (ch - 28) / 4;
        f.forEach((fila, r) => {
          const it = (n) => (n === null ? B(46, Math.min(34, hh - 4), h[r]) : T(n, 19));
          p.linea(x, y + 6 + (3 - r) * hh, cw, hh, [it(fila[0]), T(fila[1], 19), it(fila[2]), T("=", 19), it(fila[3])], 8);
        });
      }
    }));
  },
});
