// multiplicar.reparto · Reparte (2.º, lote 6, bloque 13): repartir en partes iguales, y la mitad y el tercio. Sin el signo ÷ (salvo `signo`, solo 3.º).
// Opción `signo` (si_no, por defecto false; 3.º): repartir → la línea final es «12 ÷ 3 = ☐»; mitad y tercio → «8 ÷ 2 = ☐» y «9 ÷ 3 = ☐». Los datos y la solución no cambian; sin `signo` la ficha sale idéntica.
// modo None = «Repartir en partes iguales»:
//   datos:    { texto, k, q, obj }   (reparte k·q objetos entre k niños: a cada uno le tocan q; k 2–5, q 2–6, reparto exacto)
//   solucion: { huecos: [q] }  · en modo solución se dibujan además en rojo q puntos dentro de cada plato.
//   Completa: 4 (una por fila); media: 2. Sin repetir (k, q) ni objeto.
// modo "mitad" = «La mitad y el tercio»:
//   datos:    { kind: "mitad" | "tercio", n }   (mitades de 2 a 20, pares; tercios de 3 a 18, múltiplos de 3)
//   solucion: { huecos: [n/2 | n/3] }
//   Completa: 6 (3 de cada); media: 3 (2 mitades y 1 tercio). Sin repetir (kind, n).
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B, INK } from "../render/papel.js";
import { partir, OBJETOS } from "./_problemas.js";
import { puntosFilas, puntoRojo } from "./_multiplicar.js";
import { DIV } from "./_dividir.js";

const REPARTIDOS = ["niños", "amigos", "primos", "hermanos"];
const MITADES = Array.from({ length: 10 }, (_, i) => 2 * (i + 1));
const TERCIOS = Array.from({ length: 6 }, (_, i) => 3 * (i + 1));

export default registrar({
  id: "multiplicar.reparto",
  version: 1,
  generar(params, azar, { tamano }) {
    const media = tamano === "media";
    if (params.modo === "mitad") {
      const nm = media ? 2 : 3, nt = media ? 1 : 3;
      const ms = azar.muestra(MITADES, nm).map((n) => ["mitad", n]), ts = azar.muestra(TERCIOS, nt).map((n) => ["tercio", n]);
      const orden = [];
      for (let i = 0; i < Math.max(ms.length, ts.length); i++) { if (ms[i]) orden.push(ms[i]); if (ts[i]) orden.push(ts[i]); }
      return {
        enunciado: params.signo ? "Mira los puntos y escribe la división." : "Mira los puntos y escribe la mitad o el tercio.",
        ejercicios: orden.map(([kind, n]) => ({ datos: { kind, n }, solucion: { huecos: [kind === "mitad" ? n / 2 : n / 3] } })),
      };
    }
    const pares = [];
    for (let k = 2; k <= 5; k++) for (let q = 2; q <= 6; q++) pares.push([k, q]);
    const objs = azar.barajar(OBJETOS), quien = azar.barajar(REPARTIDOS);
    const ejercicios = azar.muestra(pares, media ? 2 : 4).map(([k, q], i) => {
      const [obj, g] = objs[i], pl = quien[i % quien.length];
      const texto = `Reparte ${k * q} ${obj} entre ${k} ${pl}. ¿${g === "f" ? "Cuántas" : "Cuántos"} ${obj} le tocan a cada uno?`;
      return { datos: { texto, k, q, obj }, solucion: { huecos: [q] } };
    });
    return { enunciado: params.signo ? "Dibuja el reparto en los platos y escribe la división." : "Dibuja el reparto en los platos y escribe cuántos le tocan a cada uno.", ejercicios };
  },
  dibujar(p, act) {
    if (act.params.modo === "mitad") return dibujarMitad(p, act);
    const { cel, cw, ch } = p.celdas(TOP, 1, 4);
    act.ejercicios.slice(0, p.n(4)).forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { texto, k, q } = e.datos;
      p.marco(x, y, cw, ch, i);
      const fs = 14.5;
      partir(p, texto, cw - 84, fs).forEach((l, j) => p.text(x + 44, y + ch - 32 - j * 20, l, fs, { f: "PR" }));
      // objetos a repartir (a la izquierda) y platos vacíos (a la derecha)
      const total = k * q, cy = y + 76;
      puntosFilas(p, x + 24, cy - 28, 160, 56, total, Math.min(10, Math.ceil(total / (total > 20 ? 3 : 2))), 5.5, 15);
      const pr = 25, paso = 60, px0 = x + 215 + (5 - k) * paso / 2 + pr + 6;
      for (let j = 0; j < k; j++) {
        const cx = px0 + j * paso;
        p.circle(cx, cy, pr, { lw: 1.8, fill: 1, stroke: INK });
        p.circle(cx, cy, pr - 5, { lw: 0.8, fill: null, stroke: 0.6 });
        if (p.solucion) puntosFilas(p, cx - 18, cy - 18, 36, 36, q, q > 3 ? 3 : 2, 0, 11, (a, b) => puntoRojo(p, a, b));
      }
      p.linea(x + 20, y + 8, cw - 40, 40, act.params.signo
        ? [T(`${k * q} ${DIV} ${k} =`, 20, "PB"), B(52, 34, e.solucion.huecos[0])]
        : [T("A cada uno le tocan", 14.5, "PR"), B(52, 34, e.solucion.huecos[0])], 18);
    }));
  },
});

function dibujarMitad(p, act) {
  const { cel, cw, ch } = p.celdas(TOP, 1, 6);
  act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
    const [x, y] = cel[i], { kind, n } = e.datos;
    p.marco(x, y, cw, ch, i);
    // los puntos, en una caja redondeada
    const porFila = n > 10 ? 10 : n, filas = Math.ceil(n / porFila), bw = 10 * 17 + 20, bh = 74;
    p.rrect(x + 44, y + (ch - bh) / 2 - 2, bw, bh, 10, { lw: 1.2, fill: 1, stroke: 0.55 });
    puntosFilas(p, x + 44, y + (ch - bh) / 2 - 2, bw, bh, n, porFila, 5.5, 17);
    const texto = act.params.signo ? `${n} ${DIV} ${kind === "mitad" ? 2 : 3} =` : `${kind === "mitad" ? "La mitad de" : "Un tercio de"} ${n} es`;
    p.linea(x + 44 + bw + 10, y + (ch - 40) / 2 - 2, cw - bw - 44 - 18, 40, [T(texto, 18, "PB"), B(52, 36, e.solucion.huecos[0])], 10);
  }));
}
