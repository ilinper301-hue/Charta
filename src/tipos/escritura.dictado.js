// escritura.dictado · Hoja de dictado (Lengua 1.º, lote 4; LENGUA_1.md §3, bloque 8).
// datos:    { numero: 1, modo: "palabras" | "frases" }   (cada ejercicio es un renglón numerado en blanco; NO lleva el texto dictado)
// solucion: { huecos: ["mesa"] }   lo que dicta la maestra, en el orden de los renglones. Solo sale en pantalla (solucionario y Fori, modo «solucion»):
//           en el papel no se imprime nada de la lista.
// Reglas: n renglones (5–10, por defecto 10) en completa y la mitad (redondeada hacia arriba: 10 → 5, 5 → 3) en media. Palabras: del léxico, sílabas directas, sin
//         repetir; frases: de _frase.js (3–5 palabras), de sujetos distintos mientras se pueda. Con una letra, todo lo dictado la lleva. Solo caracteres con trazo.
//         Los renglones se separan para llenar la página (hasta 6 mm entre ellos); caben siempre (n ≤ 10 renglones de pauta: filasDe).
// Opciones: qué se dicta (palabras / frases) · renglones (5–10) · con la letra (todas / a–z; «letras vistas»: de momento no hay orden del método) · pauta (5, 4, 3,5 mm).
import { registrar } from "../nucleo/tipos.js";
import { elegirPalabras, ajusta } from "./_lengua.js";
import { elegirFrases, largosFrase, textoFrase } from "./_frase.js";
import { llevaLetra } from "../lengua/reglas.js";
import { hayTrazo } from "../lengua/trazos.js";
import { COLOR_SOLUCION } from "../render/papel.js";
import { contexto, mmDe } from "./_escritura.js";
import { renglones } from "../lengua/pauta.js";

export const renglonesDictado = (params, tamano) => { const n = params.numero ?? 10; return tamano === "media" ? Math.ceil(n / 2) : n; };

export default registrar({
  id: "escritura.dictado",
  version: 1,
  generar(params, azar, { tamano }) {
    const n = renglonesDictado(params, tamano), frases = params.modo === "frases";
    let lista;
    if (frases) {
      const fs = elegirFrases(azar, largosFrase(azar, n), {
        id: "escritura.dictado", filtro: (f) => (!params.letra || llevaLetra(f.palabras.join(""), params.letra)) && [...textoFrase(f.palabras)].every(hayTrazo),
      });
      lista = fs.map((f) => textoFrase(f.palabras));
    } else {
      const extra = params.letra ? { conLetra: params.letra } : {};
      lista = elegirPalabras(azar, n, params, [2, 3, 1, 2], { extra, ok: (e) => [...e.p].every(hayTrazo), id: "escritura.dictado" }).map((x) => x.p);
    }
    return {
      enunciado: frases ? "Escucha y escribe las frases que dicta tu maestra.\nEmpieza con mayúscula y acaba con punto." : "Escucha y escribe las palabras que dicta tu maestra.",
      ejercicios: lista.map((t, i) => ({ datos: { numero: i + 1, modo: frases ? "frases" : "palabras" }, solucion: { huecos: [t] } })),
    };
  },
  dibujar(p, act) {
    const ctx = contexto(p, act), { c, paso, x0, x1 } = ctx, es = act.ejercicios, n = es.length;
    const hueco = Math.max(0, Math.min((ctx.alto - n * paso - 2 * c) / n, p.mm(6)));
    const xr = x0 + p.mm(9);
    let y = ctx.yTop;
    es.forEach((e) => p.ejercicio(e.id, () => {
      const { bases } = renglones(p, xr, x1, y, 1, { mm: ctx.mm });
      p.text(x0, bases[0], String(e.datos.numero), 1.3 * c, { f: "PB", gris: 0.3 });
      if (p.solucion) {
        const t = e.solucion.huecos[0], fs = ajusta(p, (q) => p.ancho(t, "PB", q), x1 - xr - c, 1.3 * c, 8);
        p.text(xr + 0.6 * c, bases[0] + 0.2 * c, t, fs, { f: "PB", gris: COLOR_SOLUCION });
      }
      y -= paso + hueco;
    }));
  },
});
