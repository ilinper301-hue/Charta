// fraccion.de · La fracción de un número (3.º, lote 5, bloque 15; solo curso 3, sin rango).
// datos:    { k, n, N, ayuda: bool }   (k/n de N; N = n × m; resultado k × m)
// solucion: { huecos: [k × m] }   (con la ayuda, en la solución los k grupos coloreados en rojo)
// Opciones: tipo (None = unitarias, k = 1 · "varias" = no unitarias: 2/3, 3/4…) · ayuda (si_no: los N puntos repartidos en n grupos).
// Reglas: n y m de las tablas (2–10); con la ayuda, n 2–6 y m 2–5 (N ≤ 30, que se cuentan). Sin repetir (k, n, N).
// Dibujo: 2 columnas; con la ayuda, 6 (media 3) con «⅓ de 12 = ☐» arriba y los grupos debajo; sin ayuda, rejilla elástica con «Cantidad»: 12 (media 6).
import { registrar } from "../nucleo/tipos.js";
import { TOP, INK, cuantosRejilla } from "../render/papel.js";
import { fraccion, ROJO } from "./_fraccion.js";

export default registrar({
  id: "fraccion.de",
  version: 1,
  cantidad: true,
  generar(params, azar, ctx) {
    const varias = params.tipo === "varias", ayuda = params.ayuda ?? true;
    const ns = ayuda ? [2, 3, 4, 5, 6] : [2, 3, 4, 5, 6, 7, 8, 9, 10], ms = ayuda ? [2, 3, 4, 5] : [2, 3, 4, 5, 6, 7, 8, 9, 10];
    const banco = [];
    for (const n of ns) for (const m of ms) for (let k = 1; k < n; k++) if (varias ? k > 1 : k === 1) banco.push([k, n, m]);
    let cnt = cuantosRejilla(ctx, 2, ayuda ? 150 : 72, ayuda ? [6, 3] : [12, 6]);
    cnt = Math.min(cnt, Math.max(ctx.tamano === "media" ? (ayuda ? 3 : 6) : ayuda ? 6 : 12, Math.floor(banco.length / 2) * 2));
    // denominadores por turnos (cada uno con sus casos barajados)
    const colas = new Map(azar.barajar(ns).map((n) => [n, azar.barajar(banco.filter((b) => b[1] === n))]));
    const orden = [...colas.keys()], elegidos = [];
    for (let i = 0; elegidos.length < cnt && orden.some((n) => colas.get(n).length); i++) {
      const c = colas.get(orden[i % orden.length]);
      if (c.length) elegidos.push(c.pop());
    }
    const ejercicios = azar.barajar(elegidos).map(([k, n, m]) => ({ datos: { k, n, N: n * m, ayuda }, solucion: { huecos: [k * m] } }));
    return {
      enunciado: ayuda ? "Colorea los grupos que indica la fracción y escribe el resultado."
        : "Calcula la fracción de cada número.",
      ejercicios,
    };
  },
  dibujar(p, act) {
    const es = act.ejercicios, ayuda = act.params.ayuda ?? true;
    const filas = Math.max(Math.ceil(es.length / 2), p.n(ayuda ? 3 : 6));
    const { cel, cw, ch } = p.rejilla(TOP, 2, filas);
    es.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { k, n, N } = e.datos, m = N / n, fs = 20, alto = fs * 2.1;
      p.marco(x, y, cw, ch, i);
      const cy = ayuda ? y + ch - 16 - alto / 2 : y + ch / 2 - 2;
      const t = `de ${N} =`, tw = p.ancho(t, "PB", fs), total = 30 + 8 + tw + 8 + 50, x0 = x + (cw - total) / 2 + 10;
      const bw = fraccion(p, x0 + 15, cy, k, n, fs);
      p.text(x0 + 15 + bw / 2 + 8, cy - fs * 0.35, t, fs);
      p.caja(x0 + 15 + bw / 2 + 16 + tw, cy - 19, 50, 38, null, 22, e.solucion.huecos[0]);
      if (!ayuda) return;
      // n grupos (recuadros discontinuos) con m puntos cada uno; en la solución, los k primeros en rojo
      const zona = cy - alto / 2 - 10 - (y + 10), gw = Math.min(58, (cw - 28 - (n - 1) * 8) / n), r = Math.min(8, gw / 5);
      const paso = Math.min(r * 2.8, (zona - 12) / m), gh = paso * m + 8, gx0 = x + (cw - (n * gw + (n - 1) * 8)) / 2, gy = y + 10 + (zona - gh) / 2;
      for (let g = 0; g < n; g++) {
        const gx = gx0 + g * (gw + 8), rojo = p.solucion && g < k;
        p.rrect(gx, gy, gw, gh, 6, { lw: 1, fill: null, stroke: 0.55 });
        for (let q = 0; q < m; q++) p.circle(gx + gw / 2, gy + gh - 4 - paso * (q + 0.5), r, { lw: 1.2, fill: rojo ? ROJO : 1, stroke: rojo ? ROJO : INK });
      }
    }));
  },
});
