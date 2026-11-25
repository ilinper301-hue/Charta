// frase.puntua · Mayúscula y punto (Lengua 1.º, lote 3; LENGUA_1.md §3, bloque 5).
// datos:    { frase: "la niña salta" (la frase mal escrita: sin la mayúscula, sin el punto o sin las dos), falta: "ambos" | "mayus" | "punto", modo: "rodea" | "escribe" }
// solucion: escribe → { huecos: ["La niña salta."] }   la frase bien escrita
//           rodea   → { huecos: ["."] | [], rodea: [0] | [] }   «rodea» = posiciones (0) de la letra que debe ser mayúscula (se rodea en rojo en la solución);
//                      «huecos» = el punto que se escribe en el cuadro gris que hay al final (solo si falta el punto)
// Reglas: frases de _frase.js (3 a 5 palabras; la primera siempre es el artículo, así que nunca empieza por «I»), sin repetir. Solo falta lo que dice «qué falta».
// Opciones: tarea (rodear la letra y poner el punto / escribirla bien) · qué falta (las dos / la mayúscula / el punto) · palabras de cada frase (variadas / 3 / 4 / 5).
// 2.º: palabras de cada frase de 4 a 8 («v2», por defecto) y qué falta = «dos frases seguidas» (solo 2.º; siempre «escribirla bien»): dos frases de 3 a 5 palabras sin mayúsculas ni puntos
//      ("el niño lee un cuento la niña come pan"), que se escriben con mayúscula al empezar y punto al final de cada una; solo se pueden partir de una manera (comprobado contra el banco) y con sujetos distintos.
// Cantidad: «Más grandes» 8 frases (media: 4), «Más ejercicios» las que caben con tarjetas ≥ 60 pt (escribir) o 46 pt (rodear).
import { registrar } from "../nucleo/tipos.js";
import { TOP, COLOR_SOLUCION, cuantosRejilla } from "../render/papel.js";
import { cuantas, ajusta, conTope, crece } from "./_lengua.js";
import { elegirFrases, largosFrase, textoFrase, sinMayusculas, validas } from "./_frase.js";

const MIN_ALTO = { escribe: 60, rodea: 46 };   // alto mínimo de tarjeta con «Más ejercicios»

export default registrar({
  id: "frase.puntua",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const min = params.tarea === "escribe" || params.falta === "dos" ? MIN_ALTO.escribe : MIN_ALTO.rodea;
    return conTope(cuantosRejilla(ctx, 1, min, [8, 4]), cuantas(ctx.tamano, 8), (n) => elegir(params, azar, n));
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.rejilla(TOP, 1, act.ejercicios.length), k = crece(ch, 80);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { frase, modo } = e.datos;
      p.marco(x, y, cw, ch, i);
      if (modo === "escribe") {
        const fs = ajusta(p, (q) => p.ancho(frase, "PB", q), cw - 70, Math.min(24 * k, ch * 0.32));
        p.text(x + cw / 2, y + ch * 0.74 - fs * 0.35, frase, fs, { f: "PB", anchor: "middle" });
        p.caja(x + 34, y + 9, cw - 52, Math.min(34 * k, ch * 0.4), null, Math.min(20 * k, ch * 0.26), e.solucion.huecos[0]);
        return;
      }
      const slot = e.solucion.huecos.length > 0, bw = 34 * k, gap = 10;
      const fs = ajusta(p, (q) => p.ancho(frase, "PB", q) + (slot ? gap + bw : 0), cw - 70, Math.min(28 * k, ch * 0.5));
      const w0 = p.ancho(frase, "PB", fs), total = w0 + (slot ? gap + bw : 0), x0 = x + (cw - total) / 2, cy = y + ch / 2;
      p.text(x0, cy - fs * 0.35, frase, fs, { f: "PB" });
      if (p.solucion && e.solucion.rodea.length) {
        const c = p.ancho(frase[0], "PB", fs);
        p.rrect(x0 - fs * 0.1, cy - fs * 0.62, c + fs * 0.2, fs * 1.24, Math.min(c / 2 + fs * 0.1, fs * 0.62), { lw: 2.4, stroke: COLOR_SOLUCION });
      }
      if (slot) p.caja(x0 + w0 + gap, cy - 19 * k, bw, 38 * k, null, 24 * k, e.solucion.huecos[0]);
    }));
  },
});

/** 2.º: n parejas de frases seguidas, sin mayúsculas ni puntos; cada pareja solo se puede partir en dos frases del banco de una manera. */
const PARES = [[3, 3], [3, 4], [4, 3], [4, 4], [3, 5], [5, 3]];
function elegirDos(azar, n) {
  const V = validas(), hechas = [];
  let ya = new Set(), sujetos = new Set();
  for (let intento = 0; hechas.length < n; intento++) {
    if (intento > n * 60) throw new Error("«frase.puntua» necesita más frases: con esas opciones solo hay " + hechas.length + " parejas y hacen falta " + n + ".");
    const ya2 = new Set(ya), sujetos2 = new Set(sujetos);
    const [a, b] = azar.elegir(PARES).map((l) => elegirFrases(azar, [l], { id: "frase.puntua", filtro: sinMayusculas, ya: ya2, sujetos: sujetos2 })[0]);
    const ws = [...a.palabras, ...b.palabras];
    let cortes = 0; for (let j = 3; j <= ws.length - 3; j++) if (V.has(ws.slice(0, j).join(" ")) && V.has(ws.slice(j).join(" "))) cortes++;
    if (cortes !== 1 || a.suj.lema === b.suj.lema) continue;
    ya = ya2; sujetos = sujetos2; hechas.push([a, b]);
  }
  return {
    enunciado: "Escribe bien las dos frases: mayúscula al empezar\ny punto al final de cada una.",
    ejercicios: hechas.map(([a, b]) => ({ datos: { frase: [...a.palabras, ...b.palabras].join(" "), falta: "dos", modo: "escribe" }, solucion: { huecos: [textoFrase(a.palabras) + " " + textoFrase(b.palabras)] } })),
  };
}

function elegir(params, azar, n) {
  if (params.falta === "dos") return elegirDos(azar, n);
  const falta = params.falta || "ambos", modo = params.tarea === "escribe" ? "escribe" : "rodea";
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
}
