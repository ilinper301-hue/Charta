// palabra.contrarios · Los contrarios (Lengua 1.º, lote 2; LENGUA_1.md §3, bloque 4).
// Tarea «une»    (8 filas; media 4): datos { izq: palabra, derecha: palabra de la caja de la derecha de esta fila }
//                                    solucion { huecos: [], une: índice de la fila cuya caja de la derecha lleva el contrario }
// Tarea «escribe» (12 filas; media 6): datos { palabra }   solucion { huecos: [el contrario] }
// Banco fijo BANCO de 46 pares [a, b, grupo]; todas las palabras están en el léxico (lo comprueba la prueba). A cada par se le da la vuelta al azar
// (se ve a o b). Reglas: ninguna palabra sale dos veces en la ficha y de los pares de un mismo `grupo` (palabras casi sinónimas: gordo/grueso, alto/largo…)
// sale como mucho uno, así cada palabra tiene un solo contrario posible. Con «Mayúscula inicial» no entra ninguna palabra que empiece por «i».
// Opciones: tarea (unir / escribir) · letra.
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W } from "../render/papel.js";
import { unir } from "../lengua/dibujo.js";
import { alCaso, cuantas, ajusta } from "./_lengua.js";

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
  version: 1,
  generar(params, azar, { tamano }) {
    const une = params.tarea !== "escribe", n = cuantas(tamano, une ? 8 : 12), caso = params.caso;
    const usadas = new Set(), grupos = new Set(), elegidos = [];
    for (const [a, b, g] of azar.barajar(BANCO)) {
      if (caso === "inicial" && /^[iíì]/.test(a + b)) continue;
      if (usadas.has(a) || usadas.has(b) || (g && grupos.has(g))) continue;
      usadas.add(a); usadas.add(b); if (g) grupos.add(g);
      elegidos.push(azar.real() < 0.5 ? [a, b] : [b, a]);
      if (elegidos.length === n) break;
    }
    if (elegidos.length < n) throw new Error(`«palabra.contrarios» necesita más pares: solo hay ${elegidos.length} y hacen falta ${n}.`);
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
  },
  dibujar(p, act) {
    const es = act.ejercicios;
    if (es[0].datos.izq !== undefined) {
      const h = (TOP - M) * p.parte;
      unir(p, M, TOP - h, W - 2 * M, h, es.map((e) => e.datos.izq), es.map((e) => e.datos.derecha), es.map((e) => e.solucion.une), { fs: 26, ids: es.map((e) => e.id) });
      return;
    }
    const { cel, cw, ch } = p.celdas(TOP, 1, 12, 10, 6);
    es.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i];
      p.marco(x, y, cw, ch, i);
      const fs = ajusta(p, (q) => p.ancho(e.datos.palabra, "PB", q), 190, 26, 14);
      p.text(x + 50, y + ch / 2 - fs * 0.35, e.datos.palabra, fs, { f: "PB" });
      p.text(x + 262, y + ch / 2 - 8, "→", 22, { f: "PB", anchor: "middle", gris: 0.4 });
      p.caja(x + 290, y + (ch - 38) / 2, cw - 290 - 20, 38, null, 22, e.solucion.huecos[0]);
    }));
  },
});
