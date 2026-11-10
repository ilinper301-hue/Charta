// fono.rimas · Une las que riman (Lengua 1.º, lote 2; LENGUA_1.md §3, bloque 1). Versión escrita. Solo página completa.
// datos:    { izq: palabra de la columna izquierda, derecha: palabra de la columna derecha en esa fila (en el caso elegido) }
// solucion: { huecos: [], une: índice de la fila cuya caja de la derecha lleva la palabra que rima con esta }   (líneas rojas en la solución)
// Reglas: palabras del léxico; cada palabra rima (riman() de reglas.js, con el modo elegido) con su pareja y con NINGUNA otra de la ficha
//         (ni por la última sílaba ni desde la vocal fuerte); la rima tiene al menos 2 letras; sin palabras repetidas; columna derecha mezclada
//         (nunca en el mismo orden). Palabras de 1 a 3 sílabas y hasta 8 letras.
// Opciones: rima (misma última sílaba / desde la vocal fuerte) · parejas (4, 5 o 6; 5 por defecto) · tipo de sílabas · caso. Completa: 4–6 parejas.
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W } from "../render/papel.js";
import { unir } from "../lengua/dibujo.js";
import { avisoVistas } from "../lengua/vistas.js";
import { rima, silabas } from "../lengua/reglas.js";
import { alCaso, candidatas } from "./_lengua.js";

/** ¿Riman a, b de algún modo (última sílaba o desde la vocal fuerte)? Para no mezclar palabras parecidas de parejas distintas. */
export const rimanAlgo = (a, b) => a === b || rima(a, "silaba") === rima(b, "silaba") || rima(a, "vocal") === rima(b, "vocal");

export default registrar({
  id: "fono.rimas",
  version: 1,
  generar(params, azar) {
    const modo = params.rima === "vocal" ? "vocal" : "silaba", np = params.parejas ?? 5;
    const grupos = new Map();
    for (const e of candidatas(params, { nSilabas: [1, 2, 3], maxLetras: 8 })) {
      const r = rima(e.p, modo);
      if (r.length < 2) continue;
      if (!grupos.has(r)) grupos.set(r, []);
      grupos.get(r).push(e.p);
    }
    const elegidas = [];
    for (const [, ws] of azar.barajar([...grupos].filter(([, ws]) => ws.length >= 2))) {
      const par = azar.muestra(ws, 2);
      if (elegidas.some((q) => q.some((w) => par.some((v) => rimanAlgo(w, v))))) continue;
      elegidas.push(par);
      if (elegidas.length === np) break;
    }
    if (elegidas.length < np) throw new Error(`«fono.rimas» necesita más palabras que rimen: con esas opciones solo hay ${elegidas.length} parejas y hacen falta ${np}. Prueba con otro tipo de sílabas.` + avisoVistas());
    let der = azar.barajar(elegidas.map(([, b]) => b));
    while (der.every((b, i) => b === elegidas[i][1])) der = azar.barajar(der);
    return {
      enunciado: "Une con una línea las palabras que riman\n(las que terminan igual).",
      ejercicios: elegidas.map(([a, b], i) => ({
        datos: { izq: alCaso(a, params.caso), derecha: alCaso(der[i], params.caso) },
        solucion: { huecos: [], une: der.indexOf(b) },
      })),
    };
  },
  dibujar(p, act) {
    const es = act.ejercicios, h = Math.min(TOP - M, es.length * 130);
    unir(p, M, TOP - h, W - 2 * M, h, es.map((e) => e.datos.izq), es.map((e) => e.datos.derecha), es.map((e) => e.solucion.une), { fs: 28, ids: es.map((e) => e.id) });
  },
});
