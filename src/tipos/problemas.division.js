// problemas.division · Problemas de dividir (3.º, lote 4, bloque 8; solo curso 3, sin rango).
// datos:    { texto, a, b, c, r, op: "÷", obj, resp, sit: "reparto" | "agrupa", plan }
//           (a = dividendo, b = divisor 2–10, c = cociente 2–10, r = resto: 0 si es exacto, 1…b−1 en modo "resto"; a = b·c + r ≤ 100;
//            obj = lo que se reparte o agrupa; resp = lo que cuenta la respuesta: obj al repartir, «cajas», «bolsas»… al agrupar; plan = plantilla)
// solucion: { huecos: [a, "÷", b, c, c] }, y con resto un hueco más al final: [a, "÷", b, c, c, r] («Sobran ☐» en la última línea)
// Opciones: modo (None = repartir y agrupar alternados, empieza repartiendo · "reparto" · "agrupa" · "resto" = repartir y agrupar alternados, con resto y «¿cuántos sobran?») ·
//           tablas (divisor: None = del 2 al 10 · "2a5" · "6a9").
// Completa: 4 problemas; media: 2. Ni plantilla ni nombre ni objeto repetidos en la actividad, ni (a, b). Los divisores, distintos mientras haya.
import { registrar } from "../nucleo/tipos.js";
import { NOMBRES, OBJETOS, dibujarProblemas, enunciadoProblemas } from "./_problemas.js";
import { DIV, divisoresDe } from "./_dividir.js";

const cuantos = (g) => (g === "f" ? "Cuántas" : "Cuántos");
const cuantosMin = (g) => (g === "f" ? "cuántas" : "cuántos");
const los = (g) => (g === "f" ? "las" : "los");

/** Plantillas de repartir: { N, a, b, o, g, sob } → texto (sob = « y cuántos sobran» o vacío). La respuesta cuenta o. */
const REPARTO = {
  reparte: ({ a, b, o, g, sob }) => `Reparte ${a} ${o} entre ${b} amigos. ¿${cuantos(g)} ${o} le tocan a cada uno${sob}?`,
  partes: ({ N, a, b, o, g, sob }) => `${N} reparte ${a} ${o} en partes iguales entre ${b} amigos. ¿${cuantos(g)} ${o} recibe cada amigo${sob}?`,
  bolsa: ({ N, a, b, o, g, sob }) => `En una bolsa hay ${a} ${o}. ${N} ${los(g)} reparte entre ${b} primos. ¿${cuantos(g)} ${o} le tocan a cada uno${sob}?`,
  hermanos: ({ a, b, o, g, sob }) => `Entre ${b} hermanos se reparten ${a} ${o} en partes iguales. ¿${cuantos(g)} ${o} recibe cada hermano${sob}?`,
  companeros: ({ N, a, b, o, g, sob }) => `${N} tiene ${a} ${o} para repartir entre ${b} compañeros. ¿${cuantos(g)} ${o} le da a cada uno${sob}?`,
};
/** Plantillas de agrupar: [texto({ N, a, b, o, sob }), lo que cuenta la respuesta]. */
const AGRUPA = {
  cajas: [({ a, b, o, sob }) => `Hay ${a} ${o} y en cada caja caben ${b}. ¿Cuántas cajas se llenan${sob}?`, "cajas"],
  bolsas: [({ N, a, b, o, sob }) => `${N} guarda ${a} ${o} en bolsas de ${b}. ¿Cuántas bolsas llena${sob}?`, "bolsas"],
  paquetes: [({ a, b, o, sob }) => `Una tienda envasa ${a} ${o} en paquetes de ${b}. ¿Cuántos paquetes completa${sob}?`, "paquetes"],
  filas: [({ N, a, b, o, sob }) => `${N} coloca ${a} ${o} en filas de ${b}. ¿Cuántas filas completa${sob}?`, "filas"],
  montones: [({ a, b, o, sob }) => `Con ${a} ${o} se hacen montones de ${b}. ¿Cuántos montones se completan${sob}?`, "montones"],
};

export default registrar({
  id: "problemas.division",
  version: 1,
  generar(params, azar, { tamano }) {
    const modo = params.modo ?? null, resto = modo === "resto", cnt = tamano === "media" ? 2 : 4;
    const divs = azar.barajar(divisoresDe(params)), nombres = azar.barajar(NOMBRES), objs = azar.barajar(OBJETOS);
    const planesR = azar.barajar(Object.keys(REPARTO)), planesA = azar.barajar(Object.keys(AGRUPA));
    const vistos = new Set(), ejercicios = [];
    for (let i = 0; i < cnt; i++) {
      const sit = modo === "reparto" ? "reparto" : modo === "agrupa" ? "agrupa" : i % 2 === 0 ? "reparto" : "agrupa";
      const b = divs[i % divs.length];
      let c, r;
      do { c = azar.entero(2, resto ? 9 : 10); r = resto ? azar.entero(1, b - 1) : 0; } while (vistos.has(b * c + r + "," + b));
      const a = b * c + r;
      vistos.add(a + "," + b);
      const [o, g] = objs[i], N = nombres[i];
      const sob = resto ? ` y ${cuantosMin(g)} sobran` : "";
      const k = sit === "reparto" ? planesR[Math.floor(i / (modo ? 1 : 2)) % planesR.length] : planesA[Math.floor(i / (modo ? 1 : 2)) % planesA.length];
      const texto = sit === "reparto" ? REPARTO[k]({ N, a, b, o, g, sob }) : AGRUPA[k][0]({ N, a, b, o, sob });
      const resp = sit === "reparto" ? o : AGRUPA[k][1];
      ejercicios.push({
        datos: { texto, a, b, c, r, op: DIV, obj: o, resp, sit, plan: k },
        solucion: { huecos: [a, DIV, b, c, c, ...(resto ? [r] : [])] },
      });
    }
    return { enunciado: resto ? "Lee, divide y contesta: ¿cuántos sobran?" : enunciadoProblemas, ejercicios };
  },
  dibujar: dibujarProblemas,
});
