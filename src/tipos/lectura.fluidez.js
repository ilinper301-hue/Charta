// lectura.fluidez · Lectura rápida (Lengua 1.º, lote 5; LENGUA_1.md §3, bloque 7). Solo página completa.
// datos:    { items: [las palabras o frases numeradas, en el caso elegido], contenido: "palabras" | "frases", total: nº de palabras de la lista }
// solucion: { huecos: [total] }   la casilla «Palabras leídas» (no hay respuesta que corregir: en pantalla, el total de palabras de la lista)
// Reglas: palabras del léxico (nombres, adjetivos y verbos del tipo de sílabas elegido, hasta 8 letras, sin repetir; sin «I» mayúscula inicial con «Mayúscula inicial») o frases del banco de
//         _frase.js (3 a 5 palabras, distintas). 40 palabras (4 columnas × 10) o 12 frases. El total cuenta todas las palabras de la lista.
// Opciones: qué se lee (palabras / frases) · tipo de sílabas y sílabas de cada palabra (solo palabras) · letra (minúscula / Mayúscula inicial / MAYÚSCULAS; las frases, minúscula o MAYÚSCULAS).
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, B } from "../render/papel.js";
import { alCaso, elegirPalabras, largosDe, ajusta } from "./_lengua.js";
import { elegirFrases, largosFrase, textoFrase } from "./_frase.js";

export const PALABRAS_FLUIDEZ = 40;
export const FRASES_FLUIDEZ = 12;

export default registrar({
  id: "lectura.fluidez",
  version: 1,
  generar(params, azar, { tamano }) {
    if (tamano === "media") throw new Error("La lectura rápida solo en página completa.");
    const frases = params.contenido === "frases", mayus = params.caso === "mayus";
    let items, total;
    if (frases) {
      const fs = elegirFrases(azar, largosFrase(azar, FRASES_FLUIDEZ, null), { id: "lectura.fluidez" });
      items = fs.map((f) => (mayus ? textoFrase(f.palabras).toUpperCase() : textoFrase(f.palabras))); total = fs.reduce((t, f) => t + f.palabras.length, 0);
    } else {
      const ps = elegirPalabras(azar, PALABRAS_FLUIDEZ, params, largosDe(params, [1, 2, 3, 2, 2, 3, 4, 2]), { extra: { maxLetras: 8 }, id: "lectura.fluidez" });
      items = ps.map(({ p }) => alCaso(p, params.caso)); total = items.length;
    }
    return {
      enunciado: mayus ? "LEE EN VOZ ALTA DURANTE UN MINUTO.\nESCRIBE CUÁNTAS PALABRAS HAS LEÍDO." : "Lee en voz alta durante un minuto.\nEscribe cuántas palabras has leído.",
      ejercicios: [{ datos: { items, contenido: frases ? "frases" : "palabras", total }, solucion: { huecos: [total] } }],
    };
  },
  dibujar(p, act) {
    const e = act.ejercicios[0], { items, contenido } = e.datos, w = W - 2 * M, hCaja = 70, gap = 10;
    p.ejercicio(e.id, () => {
      const hLista = TOP - M - hCaja - gap, cols = contenido === "frases" ? 1 : 4, filas = Math.ceil(items.length / cols);
      p.tarjeta(M, M + hCaja + gap, w, hLista);
      const ancho = (w - 24) / cols, alto = (hLista - 20) / filas;
      let fs = contenido === "frases" ? 24 : 27;
      fs = ajusta(p, (q) => Math.max(...items.map((t) => p.ancho(t, "PB", q))), ancho - 52, fs, 14);
      items.forEach((t, i) => {
        const c = Math.floor(i / filas), r = i % filas, x = M + 12 + c * ancho, yc = M + hCaja + gap + hLista - 10 - alto * (r + 0.5);
        p.text(x + 26, yc - 4 - fs * 0.35 + 4, String(i + 1), 11, { f: "PB", gris: 0.45, anchor: "end" });
        p.text(x + 34, yc - fs * 0.35, t, fs, { f: "PB" });
      });
      // casilla de palabras leídas
      p.tarjeta(M, M, w, hCaja);
      p.text(M + 24, M + hCaja / 2 - 7, "Palabras leídas:", 22, { f: "PB" });
      p.caja(M + 24 + p.ancho("Palabras leídas:", "PB", 22) + 16, M + (hCaja - 46) / 2, 110, 46, null, 28, e.solucion.huecos[0]);
      p.text(M + w - 24, M + hCaja / 2 - 7, "1 minuto", 16, { f: "PM", anchor: "end", gris: 0.35 });
    });
  },
});
