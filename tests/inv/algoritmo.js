// Charta · invariantes de la familia «algoritmo» (pensamiento computacional; ver tests/invariantes.js).
import assert from "node:assert/strict";
import { cuantos, unicos, ent } from "./_ayuda.js";
import { N, DIR, recorrer } from "../../src/tipos/geometria.itinerario.js";

/** Desarrollo del programa calculado aquí (independiente de src): cada bloque, su cuerpo repetido `rep` veces. */
const expandir = (prog) => { const o = []; for (const b of prog) for (let k = 0; k < (b.rep ?? 1); k++) o.push(...b.cuerpo); return o; };

export default {
  "algoritmo.sigue"(act, tam) {
    const tarea = act.params.tarea ?? null, bucles = act.params.bucles ?? true, es = act.ejercicios;
    cuantos(es, tam === "media" ? 1 : 3);
    unicos(es, (e) => JSON.stringify([e.datos.inicio, e.datos.programa]), "programas repetidos");
    for (const { datos: d, solucion } of es) {
      d.inicio.forEach((v) => ent(v, 0, N - 1, "salida"));
      const sueltos = d.programa.filter((b) => !b.rep), lazos = d.programa.filter((b) => b.rep);
      for (const b of d.programa) { assert.ok(b.cuerpo.length >= 1 && b.cuerpo.every((q) => DIR[q]), "cuerpo con flechas válidas"); }
      for (const b of lazos) { ent(b.rep, 2, 4, "repite"); assert.ok(b.cuerpo.length <= 3, "cuerpo de 1 a 3 flechas"); }
      for (const b of sueltos) assert.ok(b.cuerpo.length <= (bucles ? 2 : 8), "flechas sueltas de más");
      if (bucles) assert.equal(lazos.length, 1, "con bucles: un «repite»"); else { assert.equal(lazos.length, 0, "sin bucles: ninguno"); assert.equal(d.programa.length, 1); }
      const des = expandir(d.programa); assert.ok(des.length >= 6 && des.length <= 12, "6 a 12 pasos"); assert.ok(new Set(des).size >= 2, "una sola dirección");
      // el desarrollo coincide con el camino: dentro de la cuadrícula, sin repetir casilla, y acaba en `fin`
      const ruta = recorrer(d.inicio, des.map((q) => [q, 1])); assert.ok(ruta, "el camino se sale o pasa dos veces por una casilla");
      assert.equal(ruta.length, des.length + 1); ruta.forEach(([c, r]) => assert.ok(c >= 0 && r >= 0 && c < N && r < N));
      assert.deepEqual(ruta.at(-1), d.fin);
      if (tarea === null) { assert.deepEqual(solucion.ruta, ruta, "camino de la solución"); assert.deepEqual(solucion.huecos, []); assert.equal(d.ruta, undefined); }
      else if (tarea === "llega") { assert.deepEqual(solucion.huecos, ["ABCDEF"[d.fin[0]], d.fin[1] + 1]); assert.equal(d.ruta, undefined); assert.equal(solucion.ruta, undefined); }
      else {   // programa: el camino dibujado es el del programa y los huecos son sus flechas (y, en cada bucle, antes, el número de veces)
        assert.deepEqual(d.ruta, ruta, "camino dibujado"); assert.equal(solucion.ruta, undefined);
        assert.deepEqual(solucion.huecos, d.programa.flatMap((b) => (b.rep ? [b.rep, ...b.cuerpo] : b.cuerpo)));
        // releer los huecos como programa da el mismo camino
        const h = [...solucion.huecos], prog = []; let i = 0;
        for (const b of d.programa) { const rep = b.rep ? h[i++] : undefined; prog.push({ rep, cuerpo: h.slice(i, i += b.cuerpo.length) }); }
        assert.deepEqual(expandir(prog), des);
      }
    }
  },
};
