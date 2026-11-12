// Charta · lógica sin DOM de la pantalla de diseño (fase 4 de PLAN-DISENO): resúmenes de las secciones plegadas, etiquetas
// del paginador y la clave que decide si hay que volver a generar la ficha o basta con volver a dibujarla.
import { letraVariante } from "../nucleo/lector.js";

const VARIACIONES = { iguales: "todas iguales", 2: "variantes A y B", 3: "variantes A, B y C", distintas: "una distinta para cada uno" };

/** «25 alumnos · variantes A y B» / «Sin nombres · 3 copias · todas iguales». */
export function resumenAlumnos({ alumnos = 0, copias = 1, variaciones = "iguales" }) {
  const v = VARIACIONES[variaciones] ?? VARIACIONES.iguales;
  if (alumnos) return `${alumnos} alumno${alumnos > 1 ? "s" : ""} · ${v}`;
  return `Sin nombres · ${copias} copia${copias > 1 ? "s" : ""}` + (copias > 1 ? ` · ${variaciones === "distintas" ? "una distinta para cada copia" : v}` : "");
}

/** «Color · Andika» / «Blanco y negro · Fredoka · letra grande». */
export function resumenImpresion({ bn = false, fuente = "Andika", grande = false, facil = false }) {
  return [bn ? "Blanco y negro" : "Color", fuente, ...(facil ? ["lectura fácil"] : grande ? ["letra grande"] : [])].join(" · ");
}

/** Texto de una hoja en el paginador: «Ana · A · pág. 2 de 3» (sin alumnos: «Copia 2» o «Sin nombre»). */
export function etiquetaHoja(h, { variantes = 1, copias = 1 } = {}) {
  const quien = h.nombre || (copias > 1 ? `Copia ${h.i + 1}` : "Sin nombre");
  return quien + (variantes > 1 ? ` · ${letraVariante(h.variante)}` : "") + (h.total > 1 ? ` · pág. ${h.pagina + 1} de ${h.total}` : "");
}

/** Hojas del solucionario: una por página de cada variante (sin nombres). → [{ variante, pagina, total }] */
export function listaSoluciones(ficha) {
  return Array.from({ length: ficha.variantes }, (_, v) => {
    const total = (v === 0 ? ficha.paginas : ficha.variantesDatos[v - 1].paginas).length;
    return Array.from({ length: total }, (_, k) => ({ variante: v, pagina: k, total }));
  }).flat();
}
export const etiquetaSolucion = (s, variantes = 1) =>
  (variantes > 1 ? `Variante ${letraVariante(s.variante)}` : "Soluciones") + (s.total > 1 ? ` · pág. ${s.pagina + 1} de ${s.total}` : "");

/**
 * Lo único que cambia el contenido de la ficha: actividades (con sus páginas), nº de variantes y semilla. Título,
 * color, letra y lectura solo cambian la presentación, y nombres o copias solo las hojas: con la misma clave no se genera.
 */
export const claveGeneracion = ({ paginas, variantes, semilla }) => JSON.stringify([paginas, variantes, semilla]);

/** La ficha generada (`base`, sin título ni presentación propios) con el título y la presentación de ahora. */
export const conPresentacion = (base, { titulo, presentacion = {} }) =>
  ({ ...base, titulo: titulo || base.titulo, presentacion: { ...base.presentacion, ...presentacion } });

/** Índice de la hoja de soluciones que corresponde a una hoja del alumnado (misma variante y página). */
export const solucionDe = (sols, h) => Math.max(0, sols.findIndex((s) => s.variante === h.variante && s.pagina === h.pagina));
