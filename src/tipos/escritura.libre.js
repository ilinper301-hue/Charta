// escritura.libre · Escribe una frase (Lengua 1.º, lote 4; LENGUA_1.md §3, bloque 8).
// datos:    { inicio: "El gato" | null, pregunta: "¿Qué hace el gato?", filas: 3, ejemplo: "El gato duerme mucho." }   (cada ejercicio es un bloque: una etiqueta con la pregunta o el tema y `filas` renglones
//           libres; con «frase empezada» el primer renglón lleva el comienzo («El gato») en negro con punto verde de inicio, para seguir escribiendo)
// solucion: { huecos: [] }   corrección abierta: no hay nada rojo en la hoja. `datos.ejemplo` es una posible respuesta (no se dibuja; para la pantalla). Va en `datos` y no en `solucion`
//           porque Fori exigiría pasos rojos a cualquier `solucion` con contenido.
// Reglas: completa 4 bloques, media 2. Frase empezada: frases de acción de _frase.js (verbos de hacer, no «es» ni «está»), sujetos distintos, con el sujeto
//         («El gato», «Los niños») como comienzo. Tema: 12 temas con su pregunta (banco TEMAS), sin repetir. Renglones por bloque: los que quepan tras la etiqueta
//         (ETIQUETA_MM = 9 mm), repartidos entre los bloques (≥ 2 siempre; el primero del bloque lleva el comienzo).
// Opciones: cómo empieza (frase empezada / tema para escribir) · pauta (5, 4, 3,5 mm).
import { registrar } from "../nucleo/tipos.js";
import { cuantas, ajusta } from "./_lengua.js";
import { elegirFrases, largosFrase, textoFrase } from "./_frase.js";
import { contexto, mmDe, escribir, CAP_MM, ETIQUETA_MM } from "./_escritura.js";
import { renglones } from "../lengua/pauta.js";

const ACCION = new Set(["i", "im", "ob", "od", "lug"]);
/** Temas para escribir: [tema, pregunta, ejemplo de respuesta]. */
export const TEMAS = [
  ["Mi familia", "¿Quién vive en tu casa?", "En mi casa vivimos cuatro."],
  ["Mi mascota", "¿Qué animal te gusta?", "Me gusta el perro."],
  ["Mi cole", "¿Qué haces en clase?", "En clase leo y pinto."],
  ["Mi comida favorita", "¿Qué te gusta comer?", "Me gusta la pasta."],
  ["El parque", "¿A qué juegas en el parque?", "Juego a la pelota."],
  ["Mi juguete", "¿Con qué juguete juegas?", "Juego con mi coche."],
  ["Mi amigo", "¿Cómo es tu amigo o tu amiga?", "Mi amiga es muy simpática."],
  ["El fin de semana", "¿Qué haces el sábado?", "El sábado voy al parque."],
  ["Mi dibujo", "¿Qué te gusta dibujar?", "Me gusta dibujar flores."],
  ["El verano", "¿Qué te gusta del verano?", "Me gusta nadar en el mar."],
  ["Mi cuarto", "¿Qué hay en tu cuarto?", "En mi cuarto hay una cama."],
  ["El tiempo", "¿Qué tiempo hace hoy?", "Hoy hace sol."],
];

const art = (w) => w[0].toUpperCase() + w.slice(1);

export default registrar({
  id: "escritura.libre",
  version: 1,
  generar(params, azar, { tamano }) {
    const n = cuantas(tamano, 4), mm = mmDe(params), empezada = params.inicio !== "tema";
    const total = Math.floor((CAP_MM[tamano] - n * ETIQUETA_MM) / (3 * mm) + 1e-9);
    const filas = Array.from({ length: n }, (_, i) => Math.floor(total / n) + (i < total % n ? 1 : 0));
    let items;
    if (empezada) {
      items = elegirFrases(azar, largosFrase(azar, n), { id: "escritura.libre", filtro: (f) => ACCION.has(f.tipo) })
        .map((f) => {
          const [a, s] = f.palabras, plural = f.numero === "p";
          return { inicio: `${art(a)} ${s}`, pregunta: `¿Qué ${plural ? "hacen" : "hace"} ${a} ${s}?`, ejemplo: textoFrase(f.palabras) };
        });
    } else items = azar.muestra(TEMAS, n).map(([tema, pregunta, ejemplo]) => ({ inicio: null, pregunta: `${tema}: ${pregunta}`, ejemplo }));
    return {
      enunciado: empezada ? "Escribe qué hace cada uno.\nContinúa la frase en los renglones." : "Escribe una frase sobre cada tema.",
      ejercicios: items.map((it, i) => ({ datos: { inicio: it.inicio, pregunta: it.pregunta, filas: filas[i], ejemplo: it.ejemplo }, solucion: { huecos: [] } })),
    };
  },
  dibujar(p, act) {
    const ctx = contexto(p, act), { c, paso, x0, x1 } = ctx, es = act.ejercicios, H = p.mm(ETIQUETA_MM);
    // si el panel es menor de lo previsto, se quitan renglones del final de los últimos bloques (siempre quedan 2)
    const filas = es.map((e) => e.datos.filas);
    let exceso = filas.reduce((a, b) => a + b, 0) * paso + es.length * H - ctx.alto;
    for (let i = filas.length - 1; i >= 0 && exceso > 0; i--) while (filas[i] > 2 && exceso > 0) { filas[i]--; exceso -= paso; }
    let y = ctx.yTop;
    es.forEach((e, i) => p.ejercicio(e.id, () => {
      const { pregunta, inicio } = e.datos, h = H * 0.78, by = y - H * 0.12 - h;
      p.rrect(x0, by, x1 - x0, h, h / 2.6, { lw: 0.8, fill: 0.965, stroke: 0.78 });
      const fs = ajusta(p, (q) => p.ancho(pregunta, "PB", q), x1 - x0 - 2 * c, 0.5 * H, 9);
      p.text(x0 + c, by + h / 2 - fs * 0.35, pregunta, fs, { f: "PB", gris: 0.2 });
      const { bases } = renglones(p, x0, x1, y - H, filas[i], { mm: ctx.mm });
      if (inicio) escribir(p, inicio, x0 + 0.6 * c, bases[0], c, "modelo");
      y -= H + filas[i] * paso;
    }));
  },
});
