// estadistica.barras · El gráfico de barras (port de _e_barras() del motor). Solo página completa.
// datos:    { lee, kinds: ["c"|"s"|"q"|"t" × 4, orden de las columnas], v: [valor de cada columna, 1..10], par: [i, o] }
//           lee = true: las barras vienen coloreadas y el alumno escribe los datos; lee = false: los datos vienen escritos y colorea.
//           par = columnas de «¿Cuántos A y B hay en total?».
// solucion: { huecos: lee ? [v₀, v₁, v₂, v₃, v[i] + v[o]] : [v[i] + v[o]], elegir: [figura de la barra más alta] }
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, T, B, INK } from "../render/papel.js";
import { NOMS, datos4, figura, chips } from "./estadistica.pictograma.js";

export default registrar({
  id: "estadistica.barras",
  version: 1,
  generar(params, azar) {
    const lee = params.modo === "lee", mx = Math.min(params.rango ?? 10, 10);
    if (mx < 10) throw new Error("Este modelo necesita un rango máximo de al menos 10.");
    const kinds = azar.barajar([..."csqt"]), v = datos4(azar, mx), par = azar.muestra([0, 1, 2, 3], 2);
    return {
      enunciado: lee ? "Mira el gráfico, escribe los datos y contesta." : "Colorea una casilla por cada figura y contesta.",
      ejercicios: [{
        datos: { lee, kinds, v, par },
        solucion: { huecos: [...(lee ? v : []), v[par[0]] + v[par[1]]], elegir: [NOMS[kinds[v.indexOf(Math.max(...v))]]] },
      }],
    };
  },
  dibujar(p, act) {
    const e = act.ejercicios[0], { lee, kinds, v, par } = e.datos, top = TOP, mx = 10, sol = e.solucion.huecos;
    p.ejercicio(e.id, () => {
      const tw = (W - 2 * M - 30) / 4;
      kinds.forEach((k, j) => {
        const x = M + j * (tw + 10);
        p.marco(x, top - 58, tw, 58);
        figura(p, k, x + 30, top - 29, 12);
        if (lee) p.caja(x + tw - 64, top - 49, 48, 40, null, 22, sol[j]);
        else p.text(x + tw - 40, top - 37, String(v[j]), 22, { f: "PB", anchor: "middle" });
      });
      const gh = 360, gy = top - 80 - gh;
      p.marco(M, gy - 10, W - 2 * M, gh + 10);
      const cw = 64, ch = (gh - 70) / mx, gx = M + (W - 2 * M - (4 * cw + 3 * 30)) / 2 + 10;
      for (let r = 1; r <= mx; r++) p.text(gx - 10, gy + 40 + (r - 0.5) * ch - 3.5, String(r), 10, { f: "PM", anchor: "end" });
      kinds.forEach((k, j) => {
        const x = gx + j * (cw + 30);
        for (let r = 0; r < mx; r++) {
          const yy = gy + 40 + r * ch;
          if (r < v[j] && lee) p.rrect(x, yy, cw, ch, 0, { fill: 0.62, stroke: null });
          else if (r < v[j] && p.solucion) p.rrect(x, yy, cw, ch, 0, { fill: "#F2B8B5", stroke: null });
          p.rrect(x, yy, cw, ch, 0, { lw: 0.8, stroke: 0.55 });
        }
        figura(p, k, x + cw / 2, gy + 20, 11);
      });
      const t2 = gy - 22, rh = (t2 - M - 8) / 2;
      let y = t2 - rh;
      p.marco(M, y, W - 2 * M, rh);
      p.text(W / 2, y + rh - 24, "¿Qué figura tiene la barra más alta?", 13, { f: "PM", anchor: "middle" });
      chips(p, W / 2, y + 8, kinds.map((k) => NOMS[k]), 11, e.solucion.elegir[0]);
      y = t2 - 2 * rh - 8;
      p.marco(M, y, W - 2 * M, rh);
      p.linea(M, y, W - 2 * M, rh, [T(`¿Cuántos ${NOMS[kinds[par[0]]]} y ${NOMS[kinds[par[1]]]} hay en total?`, 13, "PM"), B(50, 36, sol[sol.length - 1])], 12);
    });
  },
});
