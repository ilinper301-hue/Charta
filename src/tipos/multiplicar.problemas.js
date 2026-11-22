// multiplicar.problemas · Problemas de multiplicar (2.º, lote 6, bloque 13): grupos iguales con plantillas variadas.
// datos:    { texto, a, b, op: "×", obj }   (a = número de grupos, b = cuántos hay en cada uno; a × b ≤ 100)
// solucion: { huecos: [a, "×", b, a·b, a·b] }   (como los problemas de sumar y restar: ver _problemas.js)
// Opción tablas: la tabla es uno de los dos factores; el otro va de 2 a 10 (con 1 el plural no tendría sentido).
// Completa: 4 problemas; media: 2. Ni plantilla ni nombre ni objeto repetidos en la actividad.
import { registrar } from "../nucleo/tipos.js";
import { NOMBRES, OBJETOS, dibujarProblemas, enunciadoProblemas } from "./_problemas.js";
import { POR, tablasDe } from "./_multiplicar.js";

const cuantos = (g) => (g === "f" ? "Cuántas" : "Cuántos");
const entre = (g) => (g === "f" ? "todas" : "todos");

/** Plantillas: cada una da el texto a partir de { N, M, a, b, o, g } (a grupos de b). `fijo` = objeto propio de la plantilla. */
const PLANTILLAS = {
  cajas: ({ a, b, o, g }) => `En cada caja hay ${b} ${o}. ¿${cuantos(g)} ${o} hay en ${a} cajas?`,
  bolsas: ({ N, a, b, o, g }) => `${N} llena ${a} bolsas con ${b} ${o} cada una. ¿${cuantos(g)} ${o} tiene en total?`,
  platos: ({ a, b, o, g }) => `Hay ${a} platos y en cada plato hay ${b} ${o}. ¿${cuantos(g)} ${o} hay en total?`,
  sillas: ({ a, b }) => `En el salón hay ${a} filas de ${b} sillas. ¿Cuántas sillas hay en total?`,
  ninos: ({ a, b, o, g }) => `Cada niño tiene ${b} ${o} y hay ${a} niños. ¿${cuantos(g)} ${o} tienen entre ${entre(g)}?`,
  veces: ({ N, M, a, b, o, g }) => `${N} tiene ${b} ${o}. ${M} tiene ${a} veces esa cantidad. ¿${cuantos(g)} ${o} tiene ${M}?`,
  paquetes: ({ a, b, o, g }) => `Un paquete trae ${b} ${o}. ¿${cuantos(g)} ${o} hay en ${a} paquetes?`,
  mesas: ({ a, b }) => `En cada mesa se sientan ${b} niños. Hay ${a} mesas. ¿Cuántos niños hay en total?`,
};
const FIJOS = { sillas: ["sillas", "f"], mesas: ["niños", "m"] };
const CLAVES = Object.keys(PLANTILLAS);

export default registrar({
  id: "multiplicar.problemas",
  version: 1,
  generar(params, azar, { tamano }) {
    const cnt = tamano === "media" ? 2 : 4, tablas = tablasDe(params);
    const pares = [];
    for (const t of tablas) for (let m = 2; m <= 10; m++) { pares.push([t, m]); if (m !== t) pares.push([m, t]); }
    const claves = azar.barajar(CLAVES), nombres = azar.barajar(NOMBRES);
    const objs = azar.barajar(OBJETOS), vistos = new Set(), ejercicios = [];
    const unicos = [...new Map(pares.map((q) => [q.join(), q])).values()];
    for (let i = 0; i < cnt; i++) {
      const [a, b] = azar.elegir(unicos.filter((q) => !vistos.has(q.join())));
      vistos.add([a, b].join());
      const clave = claves[i % claves.length], [o, g] = FIJOS[clave] ?? objs[i % objs.length];
      const texto = PLANTILLAS[clave]({ N: nombres[2 * i], M: nombres[2 * i + 1], a, b, o, g });
      ejercicios.push({ datos: { texto, a, b, op: POR, obj: o }, solucion: { huecos: [a, POR, b, a * b, a * b] } });
    }
    return { enunciado: enunciadoProblemas, ejercicios };
  },
  dibujar: dibujarProblemas,
});
