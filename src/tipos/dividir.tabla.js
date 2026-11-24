// dividir.tabla · Divisiones de la tabla (3.º, lote 4, bloque 14; solo curso 3, sin rango).
// datos:    { d, c, modo: null | "porque" | "hueco" }   (dividendo = d × c; d = divisor, c = cociente 2–10; ni ÷1 ni cociente 1)
// solucion: { huecos: [c] } (None: «24 ÷ 6 = ☐») · "porque" → [c, c] («24 ÷ 6 = ☐ porque ☐ × 6 = 24»: cociente y el mismo número en cociente × divisor = dividendo)
//           · "hueco" → [d] («24 ÷ ☐ = 4»)
// Opciones: tablas (None = divisor del 2 al 10 · "2a5" · "6a9") · modo (None = el cociente · "porque" · "hueco").
// Divisiones exactas, sin repetir (d, c); los divisores se reparten por turnos (ninguno se repite mucho).
// Rejilla elástica de 2 columnas (cantidad): «Más grandes» = 16 (media 8) con el cociente y el hueco; con «porque» (renglón largo) 12 (media 6).
import { registrar } from "../nucleo/tipos.js";
import { T, B } from "../render/papel.js";
import { cuantos, pintarEl, MIN_OP } from "./_elastica.js";
import { POR } from "./_multiplicar.js";
import { DIV, divisoresDe } from "./_dividir.js";

export default registrar({
  id: "dividir.tabla",
  version: 1,
  cantidad: true,
  generar(params, azar, ctx) {
    const modo = params.modo ?? null, ds = divisoresDe(params), banco = ds.length * 9;
    const fijo = modo === "porque" ? [12, 6] : [16, 8];
    const cnt = cuantos(ctx, 2, MIN_OP, fijo, banco);
    // cada divisor con sus cocientes barajados; se reparte por turnos entre los divisores (también barajados)
    const colas = new Map(azar.barajar(ds).map((d) => [d, azar.barajar([2, 3, 4, 5, 6, 7, 8, 9, 10])]));
    const orden = [...colas.keys()], pares = [];
    for (let i = 0; pares.length < cnt && orden.some((d) => colas.get(d).length); i++) {
      const d = orden[i % orden.length];
      if (colas.get(d).length) pares.push([d, colas.get(d).pop()]);
    }
    const ejercicios = azar.barajar(pares).map(([d, c]) => ({
      datos: { d, c, modo },
      solucion: { huecos: modo === "porque" ? [c, c] : modo === "hueco" ? [d] : [c] },
    }));
    return {
      enunciado: modo === "porque" ? "Divide y comprueba con la multiplicación."
        : modo === "hueco" ? "Escribe el número que falta." : "Divide y escribe el resultado en el cuadro gris.",
      ejercicios,
    };
  },
  dibujar(p, act) {
    const es = act.ejercicios;
    const items = (e) => {
      const { d, c, modo } = e.datos, h = e.solucion.huecos, n = d * c;
      if (modo === "porque") return [T(`${n} ${DIV} ${d} =`, 17), B(38, 36, h[0]), T("porque", 14, "PR"), B(38, 36, h[1]), T(`${POR} ${d} = ${n}`, 17)];
      if (modo === "hueco") return [T(`${n} ${DIV}`, 19), B(44, 38, h[0]), T(`= ${c}`, 19)];
      return [T(`${n} ${DIV} ${d} =`, 19), B(52, 38, h[0])];
    };
    pintarEl(p, 2, es.map(items), es.map((e) => e.id), es.length / 2);
  },
});
