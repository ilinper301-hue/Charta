// palabra.clasifica · Cada palabra en su caja (Lengua 1.º, lote 2; LENGUA_1.md §3, bloque 4).
// datos:    { banco: [palabras mezcladas, en el caso elegido], cajas: [nombre del grupo de cada caja], n: palabras por caja }
// solucion: { huecos: [las palabras de la caja 1, luego las de la 2…, cada una en el orden del banco], clasifica: [[palabras de la caja 1], [caja 2], …] }
//           (los huecos son los espacios para escribir, uno por palabra, caja a caja de izquierda a derecha y de arriba abajo)
// Reglas: palabras del léxico; cada palabra es de su campo y de ninguno de los otros campos de la misma tarjeta (campos todos distintos entre
//         tarjetas); 4 palabras por caja con 2 cajas, 3 con 3 cajas. Sin repetidos.
// Con letras elegidas (vistas.js) solo entran palabras que se escriben con ellas y campos con palabras de sobra; si no llegan para 3 tarjetas, lleva menos.
// Opciones: cajas (2 o 3) · letra. Solo completa: 3 tarjetas.
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W } from "../render/papel.js";
import { vistasActivas, avisoVistas } from "../lengua/vistas.js";
import { alCaso } from "./_lengua.js";
import { CAMPOS_P, deCampo, rotuloCampo } from "./_palabra.js";

const SLOT = 24, SGAP = 3, TIT = 20, INK_CAJA = 0.35;

export default registrar({
  id: "palabra.clasifica",
  version: 1,
  generar(params, azar) {
    const nc = params.cajas === 3 ? 3 : 2, por = nc === 2 ? 4 : 3, caso = params.caso;
    const viables = vistasActivas() ? CAMPOS_P.filter((c) => deCampo(c, { caso }).length >= por) : CAMPOS_P;
    const orden = azar.barajar(viables), usadas = new Set(), ejercicios = [];
    const nt = Math.min(3, Math.floor(orden.length / nc));
    if (nt < 1) throw new Error(`«palabra.clasifica» necesita palabras de al menos ${nc} campos con ${por} palabras cada uno.` + avisoVistas());
    for (let t = 0; t < nt; t++) {
      const campos = orden.slice(t * nc, t * nc + nc);
      const cajas = campos.map((c) => {
        const buenas = deCampo(c, { caso }).filter((e) => !usadas.has(e.p) && campos.every((o) => o === c || !e.k.includes(o)));
        if (buenas.length < por) throw new Error(`«palabra.clasifica» necesita más palabras del campo «${c}».` + avisoVistas());
        const ws = azar.muestra(buenas, por).map((e) => e.p);
        ws.forEach((w) => usadas.add(w));
        return ws;
      });
      const banco = azar.barajar(cajas.flat());
      const clasifica = cajas.map((ws) => ws.slice().sort((a, b) => banco.indexOf(a) - banco.indexOf(b)).map((w) => alCaso(w, caso)));
      ejercicios.push({ datos: { banco: banco.map((w) => alCaso(w, caso)), cajas: campos.map((c) => rotuloCampo(c, caso)), n: por }, solucion: { huecos: clasifica.flat(), clasifica } });
    }
    return { enunciado: "Escribe cada palabra en su caja.", ejercicios };
  },
  dibujar(p, act) {
    const es = act.ejercicios, gy = 8, ch = (TOP - M - 2 * gy) / es.length, cw = W - 2 * M;
    es.forEach((e, i) => p.ejercicio(e.id, () => {
      const x = M, y = TOP - (i + 1) * ch - i * gy, { banco, cajas, n } = e.datos;
      p.marco(x, y, cw, ch, i);
      // banco de palabras: píldoras en filas (como mucho 2), centradas
      let fs = 17, filas;
      const repartir = (f) => {
        const ancho = (t) => p.ancho(t, "PB", f) + f * 0.9, libre = cw - 70, out = [[]]; let uso = 0;
        banco.forEach((t) => {
          if (uso && uso + ancho(t) + 7 > libre) { out.push([]); uso = 0; }
          out.at(-1).push(t); uso += ancho(t) + 7;
        });
        return out;
      };
      filas = repartir(fs);
      while (filas.length > 2 && fs > 12) filas = repartir(--fs);
      const bh = fs * 1.7, top = y + ch - 12;
      filas.forEach((fila, r) => {
        const ws = fila.map((t) => p.ancho(t, "PB", fs) + fs * 0.9), tot = ws.reduce((a, b) => a + b, 0) + 7 * (fila.length - 1);
        let cx = x + 28 + (cw - 28 - 14 - tot) / 2; const by = top - (r + 1) * bh - r * 5;
        fila.forEach((t, k) => {
          p.rrect(cx, by, ws[k], bh, bh / 2, { lw: 0.8, fill: 1, stroke: 0.55 });
          p.text(cx + ws[k] / 2, by + bh / 2 - fs * 0.35, t, fs, { f: "PB", anchor: "middle" });
          cx += ws[k] + 7;
        });
      });
      // cajas con su nombre y un hueco por palabra
      const nc = cajas.length, g = 14, bw = (cw - 28 - g * (nc - 1)) / nc, alto = TIT + n * (SLOT + SGAP) + 6, by0 = y + 8;
      let k = 0;
      cajas.forEach((nombre, c) => {
        const bx = x + 14 + c * (bw + g);
        p.rrect(bx, by0, bw, alto, 8, { lw: 1.5, fill: 1, stroke: INK_CAJA });
        p.text(bx + bw / 2, by0 + alto - TIT + 4, nombre, 13, { f: "PB", anchor: "middle", gris: 0.25 });
        p.line(bx + 8, by0 + alto - TIT, bx + bw - 8, by0 + alto - TIT, { lw: 0.8, gris: 0.7 });
        for (let s = 0; s < n; s++) p.caja(bx + 8, by0 + alto - TIT - (s + 1) * (SLOT + SGAP) + SGAP - 1, bw - 16, SLOT, null, 15, e.solucion.huecos[k++]);
      });
    }));
  },
});
