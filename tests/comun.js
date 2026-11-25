// Charta · utilidades comunes de las pruebas (sin efectos al importar).
import { modelo, rangosTodos, visible, cursoDe } from "../src/nucleo/ficha.js";

/** Todas las combinaciones de opciones (rangos de todos los cursos × valores; números: mín, defecto y máx), sin las que no admite el rango (`rmin`).
 *  Con `curso` (Lengua, que no tiene rangos): solo las de ese curso: en 1.º, sin las opciones y valores `curso: 2`. */
export function combinaciones(id, curso) {
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
  return out.filter((p) => ok(p) && (curso == null || curso >= 2 || cursoDe(id, { params: p }) === 1));
}

/** 2.º: los tipos de 1.º con miles de combinaciones (escritura.*) y sin cambios en 2.º se prueban con una muestra de unas `n` (si no, el doble de tiempo). */
export const tope = (cs, n = 300) => (cs.length <= n ? cs : cs.filter((_, i) => i % Math.ceil(cs.length / n) === 0));

/** Cursos en los que se prueba un tipo: los de Lengua con 2.º (LENGUA_2.md), uno y otro por separado; el resto, sin curso (como siempre). */
export const cursosDePrueba = (id) => (modelo(id).materia === "lengua" && modelo(id).cursos?.["2"] ? [1, 2] : [undefined]);

/** Contador de pruebas: prueba(nombre, f) no detiene el resto si una falla. */
export function contador() {
  const c = { n: 0 };
  c.prueba = (nombre, f) => {
    try { f(); c.n++; } catch (e) { console.error("FALLA:", nombre, "\n", e.stack || e.message); process.exitCode = 1; }
  };
  return c;
}
