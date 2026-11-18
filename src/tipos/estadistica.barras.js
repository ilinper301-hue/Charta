// estadistica.barras · El gráfico de barras (port de _e_barras() del motor). Solo página completa.
// datos:    { lee, kinds: ["c"|"s"|"q"|"t" × 4, orden de las columnas], v: [valor de cada columna, 1..10], par: [i, o] }
//           lee = true: las barras vienen coloreadas y el alumno escribe los datos; lee = false: los datos vienen escritos y colorea.
//           par = columnas de «¿Cuántos A y B hay en total?».
//           2.º (lote 4; solo si se piden, para no cambiar 1.º): `esc` = 2 | 5 (cada casilla vale esc; los valores son múltiplos de esc, hasta 10·esc)
//           y `mas: true` (la pregunta final es «¿Cuántos A más que B hay?»; par = [mayor, menor]).
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
    const esc = params.escala ?? 1, mas = params.pregunta === "mas";
    const kinds = azar.barajar([..."csqt"]), v = datos4(azar, mx).map((x) => x * esc);
    let par = azar.muestra([0, 1, 2, 3], 2);
    if (mas && v[par[0]] < v[par[1]]) par = [par[1], par[0]];
    const res = mas ? v[par[0]] - v[par[1]] : v[par[0]] + v[par[1]];
    return {
      enunciado: esc > 1 ? (lee ? `Cada casilla del gráfico vale ${esc}.\nMira el gráfico, escribe los datos y contesta.` : `Cada casilla del gráfico vale ${esc}.\nColorea las casillas que hacen falta y contesta.`)
        : lee ? "Mira el gráfico, escribe los datos y contesta." : "Colorea una casilla por cada figura y contesta.",
      ejercicios: [{
        datos: { lee, kinds, v, par, ...(esc > 1 && { esc }), ...(mas && { mas }) },
        solucion: { huecos: [...(lee ? v : []), res], elegir: [NOMS[kinds[v.indexOf(Math.max(...v))]]] },
      }],
    };
  },
  dibujar(p, act) {
    const e = act.ejercicios[0], { lee, kinds, v, par, mas } = e.datos, esc = e.datos.esc ?? 1, top = TOP, mx = 10, sol = e.solucion.huecos;
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
      for (let r = 1; r <= mx; r++) p.text(gx - 10, gy + 40 + (r - 0.5) * ch - 3.5, String(r * esc), 10, { f: "PM", anchor: "end" });
      kinds.forEach((k, j) => {
        const x = gx + j * (cw + 30);
        for (let r = 0; r < mx; r++) {
          const yy = gy + 40 + r * ch;
          if (r < v[j] / esc && lee) p.rrect(x, yy, cw, ch, 0, { fill: 0.62, stroke: null });
          else if (r < v[j] / esc && p.solucion) p.rrect(x, yy, cw, ch, 0, { fill: "#F2B8B5", stroke: null });
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
      p.linea(M, y, W - 2 * M, rh, [T(mas ? `¿Cuántos ${NOMS[kinds[par[0]]]} más que ${NOMS[kinds[par[1]]]}?` : `¿Cuántos ${NOMS[kinds[par[0]]]} y ${NOMS[kinds[par[1]]]} hay en total?`, 13, "PM"), B(50, 36, sol[sol.length - 1])], mas ? 48 : 12);
    });
  },
});
