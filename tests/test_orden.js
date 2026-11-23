// Charta · variantes «mismo contenido, otro orden» (src/nucleo/orden.js).  Uso: node tests/test_orden.js [--rapido]
// Para cada tipo de ORDEN_LIBRE: las variantes B y C llevan los mismos ejercicios que la A, ninguno en su sitio (si hay 2 o más),
// cumplen las invariantes y se dibujan. Los demás tipos salen iguales en todas. Determinista y válida (erroresFicha).
import assert from "node:assert/strict";
import { generar, modelo } from "../src/nucleo/ficha.js";
import { ORDEN_LIBRE, DENTRO, UNIR, seReordena, permutacion } from "../src/nucleo/orden.js";
import { crearAzar } from "../src/nucleo/azar.js";
import { erroresFicha } from "../src/nucleo/lector.js";
import { listaTipos } from "../src/tipos/index.js";
import { hojas } from "../src/render/hoja.js";
import { INVARIANTES, comunes } from "./invariantes.js";
import { combinaciones, contador } from "./comun.js";

const RAPIDO = process.argv.includes("--rapido");
const t = contador(), { prueba } = t;
const clave = (e) => JSON.stringify([e.datos, e.solucion, e.pasos ?? null]);
// Las piezas de un ejercicio sin su orden (listas y objetos como conjuntos de valores): «mismas piezas, otro orden».
const canon = (x) => (Array.isArray(x) ? JSON.stringify(x.map(canon).sort()) : x && typeof x === "object" ? JSON.stringify(Object.values(x).map(canon).sort()) : JSON.stringify(x));
const piezas = (e) => canon(e.datos);

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
    const libre = ORDEN_LIBRE.has(id) || UNIR.has(id), dentro = id in DENTRO || UNIR.has(id), cambia = seReordena(id);
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
        if (UNIR.has(id) && e0[0].datos.derecha !== undefined) {
          // de unir: las mismas filas a la izquierda y las mismas casillas a la derecha, cada una en otro orden
          const izq = (es) => es.map((e) => canon({ ...e.datos, derecha: null })).sort();
          assert.deepEqual(izq(e1), izq(e0), "mismas filas"); assert.deepEqual(e1.map((e) => e.datos.derecha).sort(), e0.map((e) => e.datos.derecha).sort(), "misma columna derecha");
          assert.ok(e1.some((e, k) => e.solucion.une !== k), "todas en línea recta");
        } else assert.deepEqual(e1.map(dentro ? piezas : clave).sort(), e0.map(dentro ? piezas : clave).sort(), "mismos ejercicios y piezas");
        if (!cambia) assert.deepEqual(e1, e0, "tipo sin cambio de orden: igual que la A");
        else if ((dentro || new Set(e0.map(clave)).size > 1) && !(id === "lectura.texto" && !e0.some((e) => e.datos.opciones)) && !(id === "medida.tiempo" && e0.every((e) => !e.datos.orden && !e.datos.ops))) assert.notDeepEqual(e1, e0, "no cambia nada");
        if (libre && e0.length >= 2) {
          // ningún ejercicio en su sitio (salvo ejercicios repetidos, que no se distinguen)
          const k1 = UNIR.has(id) ? (e) => JSON.stringify({ ...e.datos, derecha: null }) : dentro ? piezas : clave;
          const fijos = e1.filter((e, k) => k1(e) === k1(e0[k]) && e0.filter((x) => k1(x) === k1(e)).length === 1);
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
