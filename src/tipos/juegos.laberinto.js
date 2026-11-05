// juegos.laberinto · Laberinto de números (port de _j_laberinto() del motor). Solo página completa.
// datos:    { paso, valores: [serie de L números, de la salida a la meta], camino: [[fila, col]…] (casillas de la serie, en orden,
//             caminando en horizontal/vertical sin repetir), rejilla: [[v…]×5]×5 (la serie en el camino; en el resto, números que no son de la serie) }
//           L = min(13, ⌊(rango − lo) / paso⌋ + 1), lo = 1 si paso = 1, si no 0; L ≥ 8.
// solucion: { huecos: [] }   (el alumno traza el camino; en modo solución se marca en rojo)
// Completa: 2 laberintos. Opción n = salto (null → 1, 2, 5 o 10).
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, COLOR_SOLUCION } from "../render/papel.js";

/** _camino_azar(): camino que no se cruza de L casillas en una rejilla n × n. */
function caminoAzar(azar, n, L) {
  const vec = ([r, q]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => [r + a, q + b]).filter(([a, b]) => a >= 0 && a < n && b >= 0 && b < n);
  for (let t = 0; t < 200; t++) {
    const path = [[azar.entero(0, n - 1), azar.entero(0, n - 1)]];
    const dfs = () => {
      if (path.length === L) return true;
      for (const q of azar.barajar(vec(path[path.length - 1]).filter((c) => !path.some((d) => d[0] === c[0] && d[1] === c[1])))) {
        path.push(q);
        if (dfs()) return true;
        path.pop();
      }
      return false;
    };
    if (dfs()) return path;
  }
  throw new Error("El laberinto necesita otra semilla.");
}

export default registrar({
  id: "juegos.laberinto",
  version: 1,
  generar(params, azar) {
    const R = params.rango ?? 10, p = params.n || 1;
    if (![1, 2, 5, 10].includes(p)) throw new Error("El salto debe ser 1, 2, 5 o 10.");
    const lo = p === 1 ? 1 : 0, L = Math.min(13, Math.floor((R - lo) / p) + 1);
    if (L < 8) throw new Error(`Con saltos de ${p} el laberinto necesita un rango máximo mayor (mínimo ${lo + 7 * p}).`);
    const N = 5, ejercicios = [];
    for (let k = 0; k < 2; k++) {
      const paso = p === 5 || p === 10 ? p : 1, ini = [];
      for (let s = lo; s <= R - (L - 1) * p; s += paso) ini.push(s);
      const s0 = azar.elegir(ini), valores = Array.from({ length: L }, (_, j) => s0 + j * p), camino = caminoAzar(azar, N, L);
      let libres = []; for (let v = 0; v <= R; v++) if (!valores.includes(v)) libres.push(v);
      if (!libres.length) libres = [R + 1];
      const rejilla = Array.from({ length: N }, () => Array(N).fill(null));
      camino.forEach(([r, q], j) => { rejilla[r][q] = valores[j]; });
      for (let r = 0; r < N; r++) for (let q = 0; q < N; q++) if (rejilla[r][q] === null) rejilla[r][q] = azar.elegir(libres);
      ejercicios.push({ datos: { paso: p, valores, camino, rejilla }, solucion: { huecos: [] } });
    }
    return { enunciado: `Sigue los números de ${p} en ${p}, desde la salida hasta la meta.`, ejercicios };
  },
  dibujar(p, act) {
    const N = 5, cs = 62;
    act.ejercicios.forEach((e, k) => p.ejercicio(e.id, () => {
      const { camino, rejilla } = e.datos, y0 = TOP - k * 360 - 350;
      p.marco(M, y0, W - 2 * M, 350);
      const gx = M + (W - 2 * M - N * cs) / 2, gy = y0 + (350 - N * cs) / 2;
      for (let r = 0; r < N; r++) for (let q = 0; q < N; q++) p.caja(gx + q * cs + 2, gy + (N - 1 - r) * cs + 2, cs - 4, cs - 4, rejilla[r][q], 20);
      [[camino[0], "SALIDA"], [camino[camino.length - 1], "META"]].forEach(([[r, q], tag]) =>
        p.text(gx + q * cs + cs / 2, gy + (N - 1 - r) * cs + 7, tag, 6.5, { f: "PM", anchor: "middle", gris: 0.3 }));
      if (p.solucion) {
        const c = ([r, q]) => [gx + q * cs + cs / 2, gy + (N - 1 - r) * cs + cs / 2];
        for (let j = 1; j < camino.length; j++) p.line(...c(camino[j - 1]), ...c(camino[j]), { lw: 3, gris: COLOR_SOLUCION });
      }
    }));
  },
});
