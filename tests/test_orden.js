// Charta · variantes «mismo contenido, otro orden» (src/nucleo/orden.js).  Uso: node tests/test_orden.js [--rapido]
// Para cada tipo de ORDEN_LIBRE: las variantes B y C llevan los mismos ejercicios que la A, ninguno en su sitio (si hay 2 o más),
// cumplen las invariantes y se dibujan. Los demás tipos salen iguales en todas. Determinista y válida (erroresFicha).
import assert from "node:assert/strict";
import { generar, modelo } from "../src/nucleo/ficha.js";
import { ORDEN_LIBRE, permutacion } from "../src/nucleo/orden.js";
import { crearAzar } from "../src/nucleo/azar.js";
import { erroresFicha } from "../src/nucleo/lector.js";
import { listaTipos } from "../src/tipos/index.js";
import { hojas } from "../src/render/hoja.js";
import { INVARIANTES, comunes } from "./invariantes.js";
import { combinaciones, contador } from "./comun.js";

const RAPIDO = process.argv.includes("--rapido");
const t = contador(), { prueba } = t;
const clave = (e) => JSON.stringify([e.datos, e.solucion, e.pasos ?? null]);

prueba("ORDEN_LIBRE solo nombra tipos registrados", () => {
  const hay = new Set(listaTipos());
  assert.deepEqual([...ORDEN_LIBRE].filter((id) => !hay.has(id)), []);
});

prueba("permutación sin puntos fijos y determinista", () => {
  for (let n = 2; n <= 30; n++) for (let s = 1; s <= 20; s++) {
    const p = permutacion(n, crearAzar(s));
    assert.deepEqual([...p].sort((a, b) => a - b), [...Array(n).keys()]);
    assert.ok(p.every((x, i) => x !== i), `n=${n} s=${s}`);
    assert.deepEqual(p, permutacion(n, crearAzar(s)));
  }
});

let actividades = 0;
for (const id of listaTipos()) {
  prueba(id, () => {
    const libre = ORDEN_LIBRE.has(id);
    const cs = combinaciones(id);
    for (const params of RAPIDO ? cs.slice(0, 1) : cs.slice(0, 6)) for (const tam of modelo(id).tamanos) for (const s of RAPIDO ? [1] : [1, 2]) {
      const acts = tam === "media" ? [{ tipo: id, params }, { tipo: id, params }] : [{ tipo: id, params }];
      let f;
      try { f = generar({ actividades: acts, variantes: 3, orden: true }, s); }
      catch (e) { if (/necesita|solo en|no admite/.test(e.message)) continue; throw e; }
      assert.deepEqual(erroresFicha(f), []);
      assert.equal(f.variantesOrden, true);
      assert.deepEqual(f, generar({ actividades: acts, variantes: 3, orden: true }, s), "determinista");
      for (const v of f.variantesDatos) v.paginas[0].actividades.forEach((a, j) => {
        const a0 = f.paginas[0].actividades[j];
        const { ejercicios: e0, ...r0 } = a0, { ejercicios: e1, ...r1 } = a;
        assert.deepEqual(r1, r0, "solo cambian los ejercicios");
        assert.deepEqual(e1.map((e) => e.id), e0.map((e) => e.id), "ids por posición");
        assert.deepEqual(e1.map(clave).sort(), e0.map(clave).sort(), "mismos ejercicios");
        if (!libre) assert.deepEqual(e1, e0, "fuera de ORDEN_LIBRE: igual que la A");
        else if (e0.length >= 2) {
          // ningún ejercicio en su sitio (salvo ejercicios repetidos, que no se distinguen)
          const fijos = e1.filter((e, k) => clave(e) === clave(e0[k]) && e0.filter((x) => clave(x) === clave(e)).length === 1);
          assert.equal(fijos.length, 0, `${fijos.length} ejercicios en su sitio`);
        }
        comunes(a); INVARIANTES[id]?.(a, tam);
        actividades++;
      });
      hojas(f, { nombres: ["A", "B", "C"] });
      hojas(f, { modo: "solucion" });
    }
  });
}

prueba("sin `orden`, las variantes cambian el contenido como siempre", () => {
  const f = generar({ actividades: [{ tipo: "palabra.dibuja" }], variantes: 2 }, 3);
  assert.equal(f.variantesOrden, undefined);
  const g = generar({ actividades: [{ tipo: "palabra.dibuja" }], variantes: 2, orden: true }, 3);
  assert.deepEqual(g.paginas, f.paginas, "la variante A no cambia");
  assert.notDeepEqual(f.variantesDatos[0].paginas[0].actividades[0].ejercicios.map(clave).sort(), g.paginas[0].actividades[0].ejercicios.map(clave).sort());
});

prueba("una sola variante: `orden` no añade nada", () => {
  assert.equal(generar({ actividades: [{ tipo: "palabra.dibuja" }], orden: true }, 3).variantesOrden, undefined);
});

console.log(`test_orden: ${t.n} pruebas · ${actividades} actividades reordenadas comprobadas`);
