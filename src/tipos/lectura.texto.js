// lectura.texto · Lee y responde (Lengua 1.º, lote 5; LENGUA_1.md §3, bloque 7).
// datos:    { texto: [las frases del texto, en el caso elegido; igual en todos los ejercicios], tipo: "elegir" | "sino" | "completar", fuente: nº de la frase de donde sale la respuesta (desde 0),
//             elegir → pregunta: "¿Qué come el gato?", opciones: [3] · sino → frase: "El gato come pescado." · completar → antes: "El gato come", despues: "." }
// solucion: elegir → { huecos: [], rodea: índice de la opción } · sino → { huecos: [], rodea: 0 (Sí) | 1 (No) } · completar → { huecos: ["pescado"] }
// Reglas: el texto sale de plantillas de _lectura.js (personaje, mascota, color, lugar, comida, acción, estado, momento) con concordancia; cada categoría sale UNA vez en el texto, así que cada
//         pregunta tiene una sola respuesta: en «elegir» las otras dos opciones no aparecen en el texto; en «sí o no» el Sí es una frase del texto y el No es esa frase con una sola cosa cambiada
//         (no es verdad según el texto); en «completar» la palabra que falta es la de la frase del texto. Todo con palabras del léxico de 1.º. Nunca «I» mayúscula inicial.
// Opciones: nivel 1 (2 frases) · 2 (4 frases) · 3 (cuento corto, 6 frases) — en media página solo el nivel 1 · tipo de preguntas (variadas / elegir / sí o no / completar) · letra (minúscula / MAYÚSCULAS).
// Preguntas: nivel 1: 3 (media: 2) · nivel 2: 4 · nivel 3: 5. Con «sí o no» solo, mitad Sí y mitad No.
import { registrar } from "../nucleo/tipos.js";
import { TOP, ZONA, M, W, T, B } from "../render/papel.js";
import { rodear } from "../lengua/dibujo.js";
import { ajusta } from "./_lengua.js";
import { vistasActivas, permitida, avisoVistas } from "../lengua/vistas.js";
import { crearTexto, elegirHuecos, pregunta, textoDe, palabrasToken, alCaso, ajustaLineas, parrafo } from "./_lectura.js";

const TIPOS = ["elegir", "sino", "completar"];
const CUANTAS = { 1: 3, 2: 4, 3: 5 };

const leibles = (e) => {
  const d = e.datos;
  return [d.texto, d.pregunta, d.opciones, d.frase, d.antes, d.despues, e.solucion.huecos].flat(2).every((x) => typeof x !== "string" || permitida(x));
};

function montar(params, azar, { tamano }) {
  const nivel = params.nivel ?? 1, mayus = params.caso === "mayus";
    if (tamano === "media" && nivel !== 1) throw new Error("Lee y responde solo en página completa con el nivel 2 o 3 (en media página, el nivel 1).");
    const n = tamano === "media" ? 2 : CUANTAS[nivel];
    const { hechos } = crearTexto(azar, nivel);
    const frases = hechos.map((h) => textoDe(h.t)), pal = new Set();
    for (const w of hechos.flatMap((h) => palabrasToken(h.t))) { pal.add(w); if (/[ao]$/.test(w)) pal.add(w.slice(0, -1) + (w.endsWith("a") ? "o" : "a")); }   // negro ≈ negra: ninguna de las dos formas como distractora
    const huecos = elegirHuecos(azar, hechos, n);
    // tipos de pregunta: variadas = los tres, repartidos; si no, todas del mismo tipo
    let tipos;
    if (TIPOS.includes(params.preguntas)) tipos = Array(n).fill(params.preguntas);
    else { tipos = []; while (tipos.length < n) tipos.push(...azar.barajar(TIPOS)); tipos = tipos.slice(0, n); }
    // «sí o no»: mitad verdaderas y mitad falsas (entre las del mismo tipo)
    const idxSino = tipos.flatMap((t, i) => (t === "sino" ? [i] : []));
    const verdades = azar.barajar(idxSino.map((_, k) => k % 2 === 0));
    if (!TIPOS.includes(params.preguntas)) idxSino.forEach((i, k) => { if (huecos.some((c, j) => j !== i && c.i === huecos[i].i)) verdades[k] = false; });   // un Sí que copia la frase delataría las otras preguntas de esa frase
    else idxSino.forEach((i, k) => { if (verdades[k] && idxSino.some((j, m) => m < k && verdades[m] && huecos[j].i === huecos[i].i)) verdades[k] = false; });   // dos Sí de la misma frase serían la misma pregunta
    const rows = huecos.map((c, i) => {
      const r = pregunta(azar, tipos[i], c, hechos, pal, tipos[i] === "sino" ? verdades[idxSino.indexOf(i)] : true);
      return r;
    });
    const aCaso = (v) => (typeof v === "string" ? alCaso(v, params.caso) : Array.isArray(v) ? v.map(aCaso) : v);
    const texto = frases.map((f) => alCaso(f, params.caso));
    const rodea = tipos.includes("elegir") || tipos.includes("sino"), escribe = tipos.includes("completar");
    const seg = rodea && escribe ? "Rodea la respuesta o escribe la palabra que falta." : escribe ? "Escribe la palabra que falta." : tipos.includes("sino") && !tipos.includes("elegir") ? "Rodea Sí o No." : "Rodea la respuesta correcta.";
    return {
      enunciado: mayus ? "LEE EL TEXTO Y CONTESTA.\n" + seg.toUpperCase() : "Lee el texto y contesta.\n" + seg,
      ejercicios: rows.map(({ datos, solucion }) => ({
        datos: { texto, ...Object.fromEntries(Object.entries(datos).map(([k, v]) => [k, k === "tipo" || k === "fuente" ? v : aCaso(v)])) },
        solucion: { ...solucion, huecos: solucion.huecos.map(aCaso) },
      })),
    };
}

export default registrar({
  id: "lectura.texto",
  version: 1,
  generar(params, azar, ctx) {
    if (!vistasActivas()) return montar(params, azar, ctx);
    // con letras elegidas: personajes y cosas del texto solo entre los permitidos; se descarta el intento si algo (frases fijas, preguntas, opciones) usa otra letra
    for (let k = 0; k < 120; k++) {
      let r;
      try { r = montar(params, azar, ctx); } catch (e) { if (/necesita/.test(e.message)) continue; throw e; }
      if (r.ejercicios.every(leibles)) return r;
    }
    throw new Error("«lectura.texto» necesita más letras para montar el texto y las preguntas." + avisoVistas());
  },
  dibujar(p, act) {
    const es = act.ejercicios, texto = es[0].datos.texto, mayus = act.params.caso === "mayus", ops = mayus ? ["SÍ", "NO"] : ["Sí", "No"];
    const alto = ZONA.alto * p.parte, w = W - 2 * M, gap = 10, nQ = es.length;
    const minimo = (e) => (e.datos.tipo === "elegir" ? 84 : 62);
    const sumaMin = es.reduce((t, e) => t + minimo(e), 0);
    // tamaño del texto: el mayor que deja sitio a las preguntas
    const textoCard = (fs) => { const l = texto.map((f) => ajustaLineas(p, f, w - 84, fs, 2, fs)); const lineas = l.reduce((t, x) => t + x.lineas.length, 0); return { lineas: l.flatMap((x) => x.lineas), h: lineas * fs * 1.45 + 26 }; };
    let fs = 28, tc = textoCard(fs);
    while (fs > 16 && tc.h + sumaMin + gap * nQ > alto) { fs -= 1; tc = textoCard(fs); }
    const libre = alto - tc.h - gap * nQ, k = Math.min(1.7, Math.max(1, libre / sumaMin));
    let y = TOP - tc.h;
    p.tarjeta(M, y, w, tc.h);
    parrafo(p, M + 26, y, tc.h, tc.lineas, fs, { k: 1.45 });
    es.forEach((e, i) => p.ejercicio(e.id, () => {
      const h = minimo(e) * k; y -= gap + h;
      const x = M, { tipo } = e.datos, sol = e.solucion;
      p.marco(x, y, w, h, i);
      if (tipo === "elegir") {
        const fsq = ajusta(p, (q) => p.ancho(e.datos.pregunta, "PB", q), w - 60, 21);
        p.text(x + 36, y + h - 27, e.datos.pregunta, fsq, { f: "PB" });
        const fo = ajusta(p, (q) => e.datos.opciones.reduce((t, o) => t + p.ancho(o, "PB", q) + q * 0.9, 0) + 18 * 2, w - 30, 21);
        rodear(p, x + 10, y + 6, w - 20, (h - 30), e.datos.opciones, sol.rodea, { fs: fo, gap: 18, tarjeta: true });
      } else if (tipo === "sino") {
        const ancho = w - 250, { fs: fsf, lineas } = ajustaLineas(p, e.datos.frase, ancho, 21, 2, 15);
        parrafo(p, x + 36, y, h, lineas, fsf, { k: 1.3 });
        rodear(p, x + w - 200, y, 180, h, ops, sol.rodea, { fs: 21, gap: 22 });
      } else {
        const { antes, despues } = e.datos, resp = sol.huecos[0], bw = Math.max(110, p.ancho(resp, "PB", 22) + 30);
        const fsc = ajusta(p, (q) => p.ancho(antes, "PB", q) + p.ancho(despues, "PB", q) + bw + 24, w - 50, 22);
        p.linea(x + 14, y, w - 28, h, [...(antes ? [T(antes, fsc)] : []), B(bw, 36, resp), T(despues, fsc)], despues === "." ? 4 : 7);
      }
    }));
  },
});
