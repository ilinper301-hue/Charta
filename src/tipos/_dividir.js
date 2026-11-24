// Charta · núcleo común de «dividir.*» (3.º, lote 4, bloque 14): signo ÷ y divisores permitidos.
export const DIV = "÷";

/** Opción `tablas` → lista de divisores / factores: None = del 2 al 10 · "2a5" · "6a9". */
export function divisoresDe(params) {
  const v = params?.tablas ?? null;
  if (v === null || v === undefined) return [2, 3, 4, 5, 6, 7, 8, 9, 10];
  if (v === "2a5") return [2, 3, 4, 5];
  if (v === "6a9") return [6, 7, 8, 9];
  throw new Error(`Tablas no permitidas: ${v}`);
}
