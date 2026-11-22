// multiplicar.grupos · Grupos iguales (2.º, lote 6, bloque 13): k grupos de n puntos; suma repetida y multiplicación.
// datos:    { k, n }   (k grupos de n; k 2–5, n 2–5)
// solucion: modo None → huecos [n × k sumandos (k veces n), k·n, k, n, k·n]  (n + n + … = [ ] y k × n = [ ])
//           modo "mult" → huecos [k, n, k·n]
// Opción modo: None = «Suma y multiplicación» · "mult" = «Solo la multiplicación». `tablas` no se usa (n ≤ 5).
// Completa: 6 tarjetas (una por fila; así la media página son 3); sin repetir (k, n).
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B } from "../render/papel.js";
import { POR, puntosDado } from "./_multiplicar.js";

const PARES = [];
for (let k = 2; k <= 5; k++) for (let n = 2; n <= 5; n++) PARES.push([k, n]);

export default registrar({
  id: "multiplicar.grupos",
  version: 1,
  generar(params, azar, { tamano }) {
    const cnt = tamano === "media" ? 3 : 6, mult = params.modo === "mult";
    const ejercicios = azar.muestra(PARES, cnt).map(([k, n]) => ({
      datos: { k, n },
      solucion: { huecos: mult ? [k, n, k * n] : [...Array(k).fill(n), k * n, k, n, k * n] },
    }));
    return {
      enunciado: mult ? "Cuenta los grupos y los puntos de cada grupo. Escribe la multiplicación."
        : "Cuenta los grupos y los puntos de cada grupo. Escribe la suma y la multiplicación.",
      ejercicios,
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 1, 6), mult = act.params.modo === "mult";
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { k, n } = e.datos, h = e.solucion.huecos;
      p.marco(x, y, cw, ch, i);
      // grupos: óvalos de 40 × 66 con sus puntos
      const gw = 40, gh = 66, gap = 6, x0 = x + 44 + (5 - k) * (gw + gap) / 2, cy = y + ch / 2 - 2;
      for (let j = 0; j < k; j++) {
        const gx = x0 + j * (gw + gap);
        p.rrect(gx, cy - gh / 2, gw, gh, 18, { lw: 1.6, fill: 1, stroke: 0.35 });
        puntosDado(p, gx + gw / 2, cy, gw, gh, n);
      }
      // líneas de escritura a la derecha
      const lx = x + 290, lw = cw - 290 - 8, hb = 28, fs = 17;
      const multi = [B(34, hb, h[mult ? 0 : k + 1]), T(POR, fs), B(34, hb, h[mult ? 1 : k + 2]), T("=", fs), B(44, hb, h[mult ? 2 : k + 3])];
      if (mult) p.linea(lx, y + (ch - hb - 8) / 2, lw, hb + 8, multi, 8);
      else {
        const suma = [];
        for (let j = 0; j < k; j++) { if (j) suma.push(T("+", fs)); suma.push(B(21, hb, h[j])); }
        suma.push(T("=", fs), B(34, hb, h[k]));
        p.linea(lx, y + ch / 2 + 2, lw, hb + 8, suma, 3);
        p.linea(lx, y + ch / 2 - hb - 10, lw, hb + 8, multi, 8);
      }
    }));
  },
});

