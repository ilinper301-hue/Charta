// frase.puntua · Mayúscula y punto (Lengua 1.º, lote 3; LENGUA_1.md §3, bloque 5).
// datos:    { frase: "la niña salta" (la frase mal escrita: sin la mayúscula, sin el punto o sin las dos), falta: "ambos" | "mayus" | "punto", modo: "rodea" | "escribe" }
// solucion: escribe → { huecos: ["La niña salta."] }   la frase bien escrita
//           rodea   → { huecos: ["."] | [], rodea: [0] | [] }   «rodea» = posiciones (0) de la letra que debe ser mayúscula (se rodea en rojo en la solución);
//                      «huecos» = el punto que se escribe en el cuadro gris que hay al final (solo si falta el punto)
// Reglas: frases de _frase.js (3 a 5 palabras; la primera siempre es el artículo, así que nunca empieza por «I»), sin repetir. Solo falta lo que dice «qué falta».
// Opciones: tarea (rodear la letra y poner el punto / escribirla bien) · qué falta (las dos / la mayúscula / el punto) · palabras de cada frase (variadas / 3 / 4 / 5).
// Completa: 8 frases; media: 4.
import { registrar } from "../nucleo/tipos.js";
import { TOP, COLOR_SOLUCION } from "../render/papel.js";
import { cuantas, ajusta } from "./_lengua.js";
import { elegirFrases, largosFrase, textoFrase, sinMayusculas } from "./_frase.js";

export default registrar({
  id: "frase.puntua",
  version: 1,
  generar(params, azar, { tamano }) {
    const n = cuantas(tamano, 8), falta = params.falta || "ambos", modo = params.tarea === "escribe" ? "escribe" : "rodea";
    const frases = elegirFrases(azar, largosFrase(azar, n, params.palabras), { id: "frase.puntua", filtro: sinMayusculas });
    const enunciado = modo === "escribe" ? "Escribe bien cada frase: mayúscula al empezar\ny punto al final."
      : falta === "mayus" ? "Rodea la letra que debe ser mayúscula."
      : falta === "punto" ? "Pon el punto en el cuadro gris."
      : "Rodea la letra que debe ser mayúscula\ny pon el punto en el cuadro gris.";
    return {
      enunciado,
      ejercicios: frases.map((f) => {
        const t = f.palabras.join(" "), buena = textoFrase(f.palabras);
        const frase = (falta === "punto" ? buena.slice(0, -1) : falta === "mayus" ? t + "." : t);
        const datos = { frase, falta, modo };
        if (modo === "escribe") return { datos, solucion: { huecos: [buena] } };
        return { datos, solucion: { huecos: falta === "mayus" ? [] : ["."], rodea: falta === "punto" ? [] : [0] } };
      }),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 1, 8, 10, 8);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { frase, modo } = e.datos;
      p.marco(x, y, cw, ch, i);
      if (modo === "escribe") {
        const fs = ajusta(p, (q) => p.ancho(frase, "PB", q), cw - 70, 24);
        p.text(x + cw / 2, y + ch * 0.74 - fs * 0.35, frase, fs, { f: "PB", anchor: "middle" });
        p.caja(x + 34, y + 9, cw - 52, 34, null, 20, e.solucion.huecos[0]);
        return;
      }
      const slot = e.solucion.huecos.length > 0, bw = 34, gap = 10;
      const fs = ajusta(p, (q) => p.ancho(frase, "PB", q) + (slot ? gap + bw : 0), cw - 70, 28);
      const w0 = p.ancho(frase, "PB", fs), total = w0 + (slot ? gap + bw : 0), x0 = x + (cw - total) / 2, cy = y + ch / 2;
      p.text(x0, cy - fs * 0.35, frase, fs, { f: "PB" });
      if (p.solucion && e.solucion.rodea.length) {
        const c = p.ancho(frase[0], "PB", fs);
        p.rrect(x0 - fs * 0.1, cy - fs * 0.62, c + fs * 0.2, fs * 1.24, Math.min(c / 2 + fs * 0.1, fs * 0.62), { lw: 2.4, stroke: COLOR_SOLUCION });
      }
      if (slot) p.caja(x0 + w0 + gap, cy - 19, bw, 38, null, 24, e.solucion.huecos[0]);
    }));
  },
});
