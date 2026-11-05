// Charta · invariantes aritméticas de todos los tipos (paso 2.5).  Uso: node tests/test_invariantes.js [--full] [--solo <prefijo>]
// Cada tipo, cada combinación de opciones, completa y media, varias semillas y variantes:
// las soluciones salen de los datos, nada supera el rango ni es negativo y se respetan los niveles.
import { generar, modelo } from "../src/nucleo/ficha.js";
import { listaTipos } from "../src/tipos/index.js";
import { INVARIANTES, comunes } from "./invariantes.js";
import { combinaciones, contador } from "./comun.js";

const FULL = process.argv.includes("--full");
const SOLO = (() => { const i = process.argv.indexOf("--solo"); return i > 0 ? process.argv[i + 1] : ""; })();   // --solo conteo. (prefijo)
const SEMILLAS = FULL ? 60 : 8;
const t = contador(), { prueba } = t;
let actividades = 0, ejercicios = 0;

prueba("todos los tipos tienen invariante", () => {
  const faltan = listaTipos().filter((id) => !INVARIANTES[id]);
  if (faltan.length) throw new Error("Falta invariante en tests/invariantes.js: " + faltan.join(", "));
});

for (const id of listaTipos().filter((x) => x.startsWith(SOLO))) {
  if (!INVARIANTES[id]) continue;
  prueba(id, () => {
    for (const params of combinaciones(id)) for (const tam of modelo(id).tamanos) for (let s = 1; s <= SEMILLAS; s++) {
      const acts = tam === "media" ? [{ tipo: id, params }, { tipo: id, params }] : [{ tipo: id, params }];
      let f;
      try { f = generar({ actividades: acts, variantes: 2 }, s); }
      catch (e) { if (/necesita|solo en|no admite/.test(e.message)) continue; throw e; }
      for (const pag of [...f.paginas, ...f.variantesDatos.flatMap((v) => v.paginas)]) for (const a of pag.actividades) {
        try { comunes(a); INVARIANTES[id](a, tam); }
        catch (e) { e.message = `${id} ${JSON.stringify(params)} ${tam} semilla ${s}: ${e.message}`; throw e; }
        actividades++; ejercicios += a.ejercicios.length;
      }
    }
  });
}

console.log(`test_invariantes: ${t.n} pruebas · ${actividades} actividades · ${ejercicios} ejercicios comprobados`);
