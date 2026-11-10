// Charta · utilidades comunes de las pruebas (sin efectos al importar).
import { modelo, rangosTodos, visible, cursoDe } from "../src/nucleo/ficha.js";

/** Todas las combinaciones de opciones (rangos de todos los cursos × valores; números: mín, defecto y máx), sin las que no admite el rango (`rmin`). */
export function combinaciones(id) {
  const m = modelo(id);
  let out = [{}];
  const ejes = [];
  const rgs = rangosTodos(id);
  if (rgs.length) ejes.push(["rango", rgs]);
  for (const o of m.opciones) {
    if (o.tipo === "opcion") ejes.push([o.id, o.valores.map((v) => v.valor)]);
    else if (o.tipo === "si_no") ejes.push([o.id, [false, true]]);
    else ejes.push([o.id, [...new Set([o.min, o.defecto ?? o.min, o.max])]]);
  }
  for (const [k, vs] of ejes) out = out.flatMap((p) => vs.map((v) => ({ ...p, [k]: v })));
  // 2.º: las opciones y valores con `rmin` solo con números de tres cifras (si no, su valor por defecto).
  const ok = (p) => { const c = cursoDe(id, { rango: p.rango, params: p }); return m.opciones.every((o) => {
    if (!visible(o, p.rango, c)) return p[o.id] === (o.defecto ?? (o.tipo === "si_no" ? false : null));   // `rmin` solo en opciones y sí/no
    return o.tipo !== "opcion" || visible(o.valores.find((v) => v.valor === p[o.id]), p.rango, c);
  }); };
  return out.filter(ok);
}

/** Contador de pruebas: prueba(nombre, f) no detiene el resto si una falla. */
export function contador() {
  const c = { n: 0 };
  c.prueba = (nombre, f) => {
    try { f(); c.n++; } catch (e) { console.error("FALLA:", nombre, "\n", e.stack || e.message); process.exitCode = 1; }
  };
  return c;
}
