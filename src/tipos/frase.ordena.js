// frase.ordena · Ordena la frase (Lengua 1.º, lote 3; LENGUA_1.md §3, bloque 5).
// datos:    { palabras: [las palabras desordenadas, tal como se ven (caso elegido); nunca en el orden de la frase], marca: boolean (la primera lleva mayúscula) }
// solucion: { huecos: ["El gato come pan."] }    la frase bien escrita (mayúscula inicial y punto; en MAYÚSCULAS si la letra lo es)
// Reglas: frases de _frase.js (artículo + nombre + verbo [+ complemento]; concordancia por reglas.js; todas las palabras del léxico), de 3 a 5 palabras; sin repetir.
//         Solución única: ningún otro orden de sus palabras es otra frase del banco (ordenUnico); con la primera palabra marcada solo cuentan los órdenes que
//         empiezan por ella. Orden normal (sujeto, verbo, complemento): no se tienen en cuenta órdenes raros como «Come el gato pan».
// Opciones: palabras de cada frase (variadas / 3 / 4 / 5) · primera palabra (con mayúscula, como pista / sin marcar) · letra (minúscula / MAYÚSCULAS;
//           en MAYÚSCULAS no hay marca). Completa: 8 frases; media: 4.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { cuantas, pildoras, anchoPildoras } from "./_lengua.js";
import { elegirFrases, largosFrase, ordenUnico, desordenar, textoFrase, frAlCaso } from "./_frase.js";

export default registrar({
  id: "frase.ordena",
  version: 1,
  generar(params, azar, { tamano }) {
    const n = cuantas(tamano, 8), mayus = params.caso === "mayus", marca = params.marca !== "sin" && !mayus;
    const frases = elegirFrases(azar, largosFrase(azar, n, params.palabras), { filtro: (f) => ordenUnico(f, marca), id: "frase.ordena" });
    return {
      enunciado: marca ? "Ordena las palabras y escribe la frase.\nEmpieza por la palabra con mayúscula." : "Ordena las palabras y escribe la frase.",
      ejercicios: frases.map((f) => {
        const vistas = f.palabras.map((w, i) => (marca && i === 0 ? w[0].toUpperCase() + w.slice(1) : mayus ? w.toUpperCase() : w));
        return { datos: { palabras: desordenar(azar, vistas), marca }, solucion: { huecos: [frAlCaso(textoFrase(f.palabras), params.caso)] } };
      }),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 1, 8, 10, 8);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], ts = e.datos.palabras;
      p.marco(x, y, cw, ch, i);
      let fs = 20; while (fs > 13 && anchoPildoras(p, ts, fs, 10) > cw - 70) fs -= 1;
      pildoras(p, x + (cw - anchoPildoras(p, ts, fs, 10)) / 2, y + ch * 0.5, ch * 0.46, ts, fs, 10);
      p.caja(x + 34, y + 9, cw - 52, 34, null, 20, e.solucion.huecos[0]);
    }));
  },
});
