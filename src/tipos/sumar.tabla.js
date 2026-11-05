// sumar.tabla · Tabla de sumar de doble entrada (port de _s_tabla() del motor).
// datos:    { filas: [..], columnas: [..], vac: [índices vacíos (fila·nCol + col), ascendentes] }   (un solo ejercicio: la tabla entera)
// solucion: { huecos: [filas[i] + columnas[j] de cada casilla vacía, en orden de fila] }
// Rango ≤10: 1..5 × 1..5; ≤20: 6 filas y 6 columnas de 1..10; más: decenas (hasta 6) × 6 de 1..9.
// Opción huecos: nº de cuadros vacíos (por defecto el 55 %). Solo tamaño completo.
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, INK } from "../render/papel.js";

/** round() de Python (a la par más cercana en los .5). */
const redondea = (x) => { const f = Math.floor(x), d = x - f; return d < 0.5 ? f : d > 0.5 ? f + 1 : f % 2 === 0 ? f : f + 1; };
const ordenado = (l) => l.slice().sort((a, b) => a - b);

export default registrar({
  id: "sumar.tabla",
  version: 1,
  generar(params, azar) {
    const R = params.rango ?? 10;
    let filas, columnas;
    if (R <= 10) { filas = columnas = [1, 2, 3, 4, 5]; }
    else if (R <= 20) {
      const d = Array.from({ length: 10 }, (_, i) => i + 1);
      filas = ordenado(azar.muestra(d, 6)); columnas = ordenado(azar.muestra(d, 6));
    } else {
      const decenas = []; for (let v = 10; v < Math.min(R, 99) - 8; v += 10) decenas.push(v);
      filas = ordenado(azar.muestra(decenas, Math.min(6, decenas.length)));
      columnas = ordenado(azar.muestra([1, 2, 3, 4, 5, 6, 7, 8, 9], 6));
    }
    const total = filas.length * columnas.length;
    const nh = params.huecos == null ? redondea(total * 0.55) : Math.min(params.huecos, total);
    const vac = ordenado(azar.muestra(Array.from({ length: total }, (_, i) => i), nh));
    return {
      enunciado: "Suma el número de la fila y el de la columna y completa la tabla.",
      ejercicios: [{ datos: { filas, columnas, vac }, solucion: { huecos: vac.map((q) => filas[Math.floor(q / columnas.length)] + columnas[q % columnas.length]) } }],
    };
  },
  dibujar(p, act) {
    const e = act.ejercicios[0], { filas, columnas, vac } = e.datos, kr = filas.length, kc = columnas.length;
    const cs = Math.min(78, (W - 2 * M) / (kc + 1), (TOP - M - 10) / (kr + 1)), x0 = M + (W - 2 * M - (kc + 1) * cs) / 2, y0 = TOP - 10;
    const cab = (x, y, t) => {
      p.rrect(x + 2, y + 2, cs - 4, cs - 4, 8, { lw: 2.4, fill: 1, stroke: INK });
      p.text(x + cs / 2, y + cs / 2 - 6.5, String(t), 18, { anchor: "middle" });
    };
    p.ejercicio(e.id, () => {
      p.circle(x0 + cs / 2, y0 - cs / 2, cs * 0.3, { lw: 2.4 });
      p.text(x0 + cs / 2, y0 - cs / 2 - 7.5, "+", 22, { anchor: "middle" });
      columnas.forEach((v, j) => cab(x0 + (j + 1) * cs, y0 - cs, v));
      filas.forEach((v, i) => cab(x0, y0 - (i + 2) * cs, v));
      filas.forEach((rv, i) => columnas.forEach((cv, j) => {
        const hueco = vac.includes(i * kc + j);
        p.caja(x0 + (j + 1) * cs + 2, y0 - (i + 2) * cs + 2, cs - 4, cs - 4, hueco ? null : rv + cv, 18, hueco ? rv + cv : null);
      }));
    });
  },
});
