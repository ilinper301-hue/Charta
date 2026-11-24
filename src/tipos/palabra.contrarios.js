// palabra.contrarios · Los contrarios (Lengua 1.º, lote 2; LENGUA_1.md §3, bloque 4).
// Tarea «une»    (8 filas; media 4): datos { izq: palabra, derecha: palabra de la caja de la derecha de esta fila }
//                                    solucion { huecos: [], une: índice de la fila cuya caja de la derecha lleva el contrario }
// Tarea «escribe» (2 columnas; «Más grandes» 24 (media 12), «Más ejercicios» las que caben con tarjetas ≥ 40 pt): datos { palabra }   solucion { huecos: [el contrario] }
// Banco fijo BANCO de 46 pares [a, b, grupo]; todas las palabras están en el léxico (lo comprueba la prueba). A cada par se le da la vuelta al azar
// (se ve a o b). Reglas: ninguna palabra sale dos veces en la ficha y de los pares de un mismo `grupo` (palabras casi sinónimas: gordo/grueso, alto/largo…)
// sale como mucho uno, así cada palabra tiene un solo contrario posible. Con «Mayúscula inicial» no entra ninguna palabra que empiece por «i».
// Con letras elegidas (vistas.js) solo entran los pares cuyas dos palabras se escriben con ellas (con pocas letras casi no hay: error «necesita»).
// Opciones: tarea (unir / escribir) · letra.
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, cuantosRejilla } from "../render/papel.js";
import { unir } from "../lengua/dibujo.js";
import { filtrarVistas, avisoVistas } from "../lengua/vistas.js";
import { alCaso, cuantas, ajusta, conTope } from "./_lengua.js";

const MIN_ALTO = 40;   // alto mínimo de tarjeta con «Más ejercicios»
export const BANCO = [
  ["grande", "pequeño", "tam"], ["alto", "bajo", "alt"], ["largo", "corto", "alt"], ["gordo", "delgado", "gru"], ["grueso", "fino", "gru"], ["ancho", "estrecho", "gru"],
  ["pesado", "ligero", null], ["lleno", "vacío", null], ["abierto", "cerrado", "abre"], ["abrir", "cerrar", "abre"], ["limpio", "sucio", null], ["mojado", "seco", null],
  ["nuevo", "viejo", null], ["bonito", "feo", null], ["fuerte", "débil", null], ["rápido", "lento", null], ["duro", "blando", "tacto"], ["suave", "áspero", "tacto"],
  ["despierto", "dormido", "sue"], ["dormir", "despertar", "sue"], ["cercano", "lejano", "cer"], ["cerca", "lejos", "cer"], ["claro", "oscuro", "col"], ["blanco", "negro", "col"],
  ["bueno", "malo", null], ["ruidoso", "silencioso", "cal"], ["nervioso", "tranquilo", "cal"], ["fácil", "difícil", null], ["dulce", "amargo", null], ["primero", "último", null],
  ["mucho", "poco", null], ["aburrido", "divertido", null], ["rizado", "liso", null], ["caliente", "frío", null], ["día", "noche", "tie"], ["antes", "después", "tie"],
  ["hoy", "ayer", "tie"], ["siempre", "nunca", null], ["arriba", "abajo", "pos"], ["encima", "debajo", "pos"], ["subir", "bajar", "pos"], ["dentro", "fuera", null],
  ["delante", "detrás", null], ["entrar", "salir", null], ["ganar", "perder", null], ["dar", "quitar", "qui"], ["poner", "quitar", "qui"], ["empujar", "tirar", null],
];

export default registrar({
  id: "palabra.contrarios",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    const une = params.tarea !== "escribe";
    return une ? pares(params, azar, cuantas(ctx.tamano, 8), true) : conTope(cuantosRejilla(ctx, 2, MIN_ALTO, [24, 12]), cuantas(ctx.tamano, 12), (n) => pares(params, azar, n, false));
  },
  dibujar(p, act) {
    const es = act.ejercicios;
    if (es[0].datos.izq !== undefined) {
      const h = (TOP - M) * p.parte;
      unir(p, M, TOP - h, W - 2 * M, h, es.map((e) => e.datos.izq), es.map((e) => e.datos.derecha), es.map((e) => e.solucion.une), { fs: 26, ids: es.map((e) => e.id) });
      return;
    }
    const { cel, cw, ch } = p.rejilla(TOP, 2, Math.ceil(es.length / 2)), wp = 100, bx = 32 + wp + 20;
    es.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], bh = Math.min(36, ch * 0.7);
      p.marco(x, y, cw, ch, i);
      const fs = ajusta(p, (q) => p.ancho(e.datos.palabra, "PB", q), wp, Math.min(26, ch * 0.5), 10);
      p.text(x + 32, y + ch / 2 - fs * 0.35, e.datos.palabra, fs, { f: "PB" });
      p.text(x + bx - 10, y + ch / 2 - 16 * 0.35, "→", 16, { f: "PB", anchor: "middle", gris: 0.4 });
      p.caja(x + bx, y + (ch - bh) / 2, cw - bx - 10, bh, null, 22, e.solucion.huecos[0]);
    }));
  },
});

/** n pares del banco: a unir (columna derecha barajada) o a escribir. */
function pares(params, azar, n, une) {
  const caso = params.caso;
  const usadas = new Set(), grupos = new Set(), elegidos = [];
  for (const [a, b, g] of azar.barajar(filtrarVistas(BANCO, ([x, y]) => x + " " + y))) {
    if (caso === "inicial" && /^[iíì]/.test(a + b)) continue;
    if (usadas.has(a) || usadas.has(b) || (g && grupos.has(g))) continue;
    usadas.add(a); usadas.add(b); if (g) grupos.add(g);
    elegidos.push(azar.real() < 0.5 ? [a, b] : [b, a]);
    if (elegidos.length === n) break;
  }
  if (elegidos.length < n) throw new Error(`«palabra.contrarios» necesita más pares: solo hay ${elegidos.length} y hacen falta ${n}.` + avisoVistas());
  if (!une) {
    return {
      enunciado: "Escribe el contrario de cada palabra.",
      ejercicios: elegidos.map(([a, b]) => ({ datos: { palabra: alCaso(a, caso) }, solucion: { huecos: [alCaso(b, caso)] } })),
    };
  }
  let der = azar.barajar(elegidos.map(([, b]) => b));
  while (der.every((b, i) => b === elegidos[i][1])) der = azar.barajar(der);
  return {
    enunciado: "Une cada palabra con su contrario.",
    ejercicios: elegidos.map(([a, b], i) => ({ datos: { izq: alCaso(a, caso), derecha: alCaso(der[i], caso) }, solucion: { huecos: [], une: der.indexOf(b) } })),
  };
}
