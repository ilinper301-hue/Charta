// letra.abecedario · Antes y después (Lengua 1.º, lote 1; LENGUA_1.md §3, bloque 2). Como conteo.anterior, con el abecedario (27 letras, con ñ).
// datos:    { letra, patron }   patron = "hnh" (antes y después), "hn" (solo antes) o "nh" (solo después): «n» = la letra, «h» = hueco.
// solucion: { huecos: [letra de antes y/o de después, de izquierda a derecha] }
// Opciones: modo (ambas / anterior / posterior) · caso (minúscula / MAYÚSCULA). Letras sin repetir: la de antes no existe para la «a» y la de después no existe para la «z».
// Completa: 18 letras (3 × 6); media: 9.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { ABECEDARIO } from "../lengua/reglas.js";
import { cuantas } from "./_lengua.js";

const TEXTO = {
  ambos: "Escribe la letra de antes y la de después\nde cada letra del abecedario.",
  anterior: "Escribe la letra de antes\nde cada letra del abecedario.",
  posterior: "Escribe la letra de después\nde cada letra del abecedario.",
};

export default registrar({
  id: "letra.abecedario",
  version: 1,
  generar(params, azar, { tamano }) {
    const modo = params.modo || "ambos", n = cuantas(tamano, 18), L = ABECEDARIO.length;
    const [lo, hi] = { ambos: [1, L - 2], anterior: [1, L - 1], posterior: [0, L - 2] }[modo];
    const patron = { ambos: "hnh", anterior: "hn", posterior: "nh" }[modo];
    const fmt = (c) => (params.caso === "mayus" ? c.toUpperCase() : c);
    const idx = azar.muestra(Array.from({ length: hi - lo + 1 }, (_, k) => lo + k), n);
    return {
      enunciado: TEXTO[modo],
      ejercicios: idx.map((i) => ({
        datos: { letra: fmt(ABECEDARIO[i]), patron },
        solucion: { huecos: [...patron].flatMap((t, j) => (t === "h" ? [fmt(ABECEDARIO[j < patron.indexOf("n") ? i - 1 : i + 1])] : [])) },
      })),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 3, 6, 10, 10), bw = 44, bh = 48, g = 7;
    act.ejercicios.forEach((e, idx) => p.ejercicio(e.id, () => {
      const [x, y] = cel[idx], { letra, patron } = e.datos;
      p.marco(x, y, cw, ch, idx);
      const bx = x + (cw - (patron.length * bw + (patron.length - 1) * g)) / 2;
      let k = 0;
      [...patron].forEach((t, j) => p.caja(bx + j * (bw + g), y + (ch - 14 - bh) / 2, bw, bh, t === "n" ? letra : null, 26, t === "n" ? null : e.solucion.huecos[k++]));
    }));
  },
});
