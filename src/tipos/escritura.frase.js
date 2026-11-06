// escritura.frase · Copia la frase (Lengua 1.º, lote 4; LENGUA_1.md §3, bloque 8).
// datos:    { frase: "El gato come pan.", libres: 1 }   (frase del banco de _frase.js con mayúscula y punto; cada ejercicio es un bloque: 1 renglón de modelo
//           (negro, punto verde de inicio), 1 de repaso (gris o punteado) y `libres` renglones en blanco para copiarla)
// solucion: { huecos: [] }   no hay corrección
// Reglas: frases de _frase.js (3 a 5 palabras), distintas y de sujetos distintos mientras se pueda, que caben en UNA línea de la pauta (cabeEnLinea: en media página
//         con 5 mm las más largas de 5 palabras no entran) y con todos sus caracteres en trazos. Completa 4, media 2.
// Opciones: palabras de cada frase (variadas 3–5 / 3 / 4 / 5) · repaso (gris / punteado) · pauta (5, 4, 3,5 mm).
import { registrar } from "../nucleo/tipos.js";
import { cuantas } from "./_lengua.js";
import { elegirFrases, largosFrase, textoFrase } from "./_frase.js";
import { hayTrazo } from "../lengua/trazos.js";
import { contexto, recortar, repartirLibres, filasDe, mmDe, escribir, cabeEnLinea } from "./_escritura.js";
import { renglones } from "../lengua/pauta.js";

export default registrar({
  id: "escritura.frase",
  version: 1,
  generar(params, azar, { tamano }) {
    const n = cuantas(tamano, 4), mm = mmDe(params);
    const fs = elegirFrases(azar, largosFrase(azar, n, params.palabras), {
      id: "escritura.frase", filtro: (f) => { const t = textoFrase(f.palabras); return [...t].every(hayTrazo) && cabeEnLinea(t, tamano, mm); },
    });
    const libres = repartirLibres(filasDe(tamano, mm), Array(n).fill(2));
    return {
      enunciado: "Copia cada frase.\nEmpieza con mayúscula y acaba con punto.",
      ejercicios: fs.map((f, i) => ({ datos: { frase: textoFrase(f.palabras), libres: libres[i] }, solucion: { huecos: [] } })),
    };
  },
  dibujar(p, act) {
    const ctx = contexto(p, act), { c, paso, x0, x1 } = ctx, es = act.ejercicios, estilo = act.params.repaso === "punteado" ? "punteado" : "repaso";
    const libres = recortar(es.map((e) => e.datos.libres), es.map(() => 2), ctx.caben);
    let y = ctx.yTop;
    es.forEach((e, i) => p.ejercicio(e.id, () => {
      const n = 2 + libres[i], { bases } = renglones(p, x0, x1, y, n, { mm: ctx.mm });
      escribir(p, e.datos.frase, x0 + 0.6 * c, bases[0], c, "modelo");
      escribir(p, e.datos.frase, x0 + 0.6 * c, bases[1], c, estilo);
      y -= n * paso;
    }));
  },
});
