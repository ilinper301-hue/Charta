// Charta · lista de alumnos escrita o pegada (paso 4.3). Sin DOM. Los nombres nunca se guardan.
export const MAX_ALUMNOS = 30;

/**
 * Admite: uno por línea (también «Apellidos, Nombre»), en una línea separados por comas o punto y coma, listas numeradas («1. Ana», «2) Luis», «- Eva»)
 * y filas pegadas de una hoja de cálculo (columnas con tabulador: se quitan las que son solo números).
 */
export function leerAlumnos(texto = "") {
  const sinNumero = (t) => t.replace(/^\s*(\d+\s*[.)º-]|[-•*·])\s*/, "");
  const lineas = String(texto).split(/\r?\n/).map(sinNumero).filter((l) => l.trim());
  // Varias líneas: la coma es «Apellidos, Nombre» (como en Séneca) → «Nombre Apellidos». Una línea: separa nombres.
  const varias = lineas.length > 1;
  const trozos = lineas.flatMap((l) => l.includes("\t") ? [l] : l.split(varias ? /;/ : /[;,]/))
    .map((t) => { const p = t.split(","); return p.length === 2 && p[1].trim() ? `${p[1].trim()} ${p[0].trim()}` : t.replace(/,/g, " "); });
  return trozos.map((t) => t.split("\t").map((c) => c.trim()).filter((c) => c && !/^\d+[.)º]?$/.test(c)).join(" "))
    .map((t) => sinNumero(t).replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

/** Nº de variantes según la opción elegida («iguales», «2», «3», «distintas») y el nº de páginas. */
export function numVariantes(opcion, paginas) {
  const n = opcion === "iguales" ? 1 : opcion === "distintas" ? paginas : +opcion || 1;
  return Math.max(1, Math.min(MAX_ALUMNOS, n, paginas));
}
