// Charta · invariantes aritméticas de todos los tipos (paso 2.5).  Uso: node tests/test_invariantes.js [--full | --rapido] [--solo <prefijo>]
// Cada tipo, cada combinación de opciones, completa y media, varias semillas y variantes:
// las soluciones salen de los datos, nada supera el rango ni es negativo y se respetan los niveles.
import { generar, modelo } from "../src/nucleo/ficha.js";
import { listaTipos } from "../src/tipos/index.js";
import { INVARIANTES, comunes } from "./invariantes.js";
import { combinaciones, contador, cursosDePrueba, tope } from "./comun.js";
import { sesion } from "./inv/_lengua.js";

const FULL = process.argv.includes("--full");
const SOLO = (() => { const i = process.argv.indexOf("--solo"); return i > 0 ? process.argv[i + 1] : ""; })();   // --solo conteo. (prefijo)
const RAPIDO = process.argv.includes("--rapido");   // npm run test:rapido: una semilla y una muestra de combinaciones (cambios de interfaz)
const SEMILLAS = RAPIDO ? 1 : FULL ? 60 : 8;
const muestra = (cs) => (RAPIDO ? cs.filter((_, i) => i % Math.max(1, Math.ceil(cs.length / 6)) === 0) : cs);
const t = contador(), { prueba } = t;
let actividades = 0, ejercicios = 0;

prueba("todos los tipos tienen invariante", () => {
  const faltan = listaTipos().filter((id) => !INVARIANTES[id]);
  if (faltan.length) throw new Error("Falta invariante en tests/invariantes.js: " + faltan.join(", "));
});

for (const id of listaTipos().filter((x) => x.startsWith(SOLO))) {
  if (!INVARIANTES[id]) continue;
  prueba(id, () => {
    for (const curso of cursosDePrueba(id)) for (const params of muestra(curso === 2 ? tope(combinaciones(id, curso)) : combinaciones(id, curso))) for (const tam of modelo(id).tamanos) for (let s = 1; s <= SEMILLAS; s++) {
      sesion.curso = curso ?? 1;   // Lengua: las invariantes comprueban con el léxico del curso de la actividad
      const a1 = curso === 2 ? { tipo: id, params, curso } : { tipo: id, params };
      const acts = tam === "media" ? [a1, a1] : [a1];
      let f;
      try { f = generar({ actividades: acts, variantes: 2 }, s); }
      catch (e) { if (/necesita|solo en|no admite/.test(e.message)) continue; throw e; }
      for (const pag of [...f.paginas, ...f.variantesDatos.flatMap((v) => v.paginas)]) for (const a of pag.actividades) {
        try { comunes(a); INVARIANTES[id](a, tam); }
        catch (e) { e.message = `${id} ${curso === 2 ? "(2.º) " : ""}${JSON.stringify(params)} ${tam} semilla ${s}: ${e.message}`; throw e; }
        actividades++; ejercicios += a.ejercicios.length;
      }
    }
  });
}

console.log(`test_invariantes: ${t.n} pruebas · ${actividades} actividades · ${ejercicios} ejercicios comprobados`);
