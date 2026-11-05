// Charta · utilidades comunes de las pruebas (sin efectos al importar).
import { modelo } from "../src/nucleo/ficha.js";

/** Todas las combinaciones de opciones (rangos × valores; números: mín, defecto y máx). */
export function combinaciones(id) {
  const m = modelo(id);
  let out = [{}];
  const ejes = [];
  if (m.rangos.length) ejes.push(["rango", m.rangos]);
  for (const o of m.opciones) {
    if (o.tipo === "opcion") ejes.push([o.id, o.valores.map((v) => v.valor)]);
    else if (o.tipo === "si_no") ejes.push([o.id, [false, true]]);
    else ejes.push([o.id, [...new Set([o.min, o.defecto ?? o.min, o.max])]]);
  }
  for (const [k, vs] of ejes) out = out.flatMap((p) => vs.map((v) => ({ ...p, [k]: v })));
  return out;
}

/** Contador de pruebas: prueba(nombre, f) no detiene el resto si una falla. */
export function contador() {
  const c = { n: 0 };
  c.prueba = (nombre, f) => {
    try { f(); c.n++; } catch (e) { console.error("FALLA:", nombre, "\n", e.stack || e.message); process.exitCode = 1; }
  };
  return c;
}
