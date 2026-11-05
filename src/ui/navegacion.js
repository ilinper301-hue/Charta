// Charta · navegación del catálogo (paso 4.1): curso → materia → bloque → modelo.
// Sin DOM (se prueba en Node). Solo ofrece modelos con tipo registrado en la app.
import { CATALOGO } from "../nucleo/catalogo.js";
import { generar } from "../nucleo/ficha.js";
import { hayTipo } from "../nucleo/tipos.js";
import { render, svgZona } from "../render/actividad.js";

const disponibles = () => CATALOGO.modelos.filter((m) => hayTipo(m.id));
const unicos = (xs) => [...new Set(xs)];

export function cursos() {
  return unicos(disponibles().map((m) => m.curso)).sort((a, b) => a - b)
    .map((c) => ({ id: c, nombre: CATALOGO.cursos[c] ?? `${c}.º` }));
}

export function materias(curso) {
  return unicos(disponibles().filter((m) => m.curso === curso).map((m) => m.materia))
    .map((k) => ({ id: k, nombre: CATALOGO.materias[k] ?? k }));
}

export function bloques(curso, materia) {
  const ms = disponibles().filter((m) => m.curso === curso && m.materia === materia);
  return unicos(ms.map((m) => m.bloque)).sort((a, b) => a - b)
    .map((b) => ({ id: b, nombre: CATALOGO.bloques[b] ?? `Bloque ${b}`, n: ms.filter((m) => m.bloque === b).length }));
}

/** Modelos de un bloque; `cabe` = false si no admite el tamaño pedido (p. ej. media página). */
export function modelos(curso, materia, bloque, tamano = "completa") {
  return disponibles().filter((m) => m.curso === curso && m.materia === materia && m.bloque === bloque)
    .map((m) => ({ id: m.id, nombre: m.nombre, descripcion: m.descripcion, color: m.color, ...m.metadatos, cabe: m.tamanos.includes(tamano) }));
}

const cache = new Map();
/** Miniatura: la actividad con opciones por defecto (semilla fija) en SVG autónomo. */
export function miniatura(id) {
  if (!cache.has(id)) {
    const f = generar({ actividades: [{ tipo: id }] }, 1);
    cache.set(id, svgZona(render(f.paginas[0].actividades[0], "papel")));
  }
  return cache.get(id);
}
