// Charta · mapa de letras (Lengua de 1.º): con `params.vistas`, lo que lee o escribe el alumno usa solo esas letras.
// `node tests/test_vistas.js [prefijo] [--full]`. Sin `vistas` las fichas no cambian (lo comprueban las doradas).
import "../src/tipos/index.js";
import { generar, modelo, validar } from "../src/nucleo/ficha.js";
import { listaTipos } from "../src/nucleo/tipos.js";
import { normalizarVistas, conVistas, permitida } from "../src/lengua/vistas.js";
import { sinTildes } from "../src/lengua/reglas.js";
import { combinaciones, contador } from "./comun.js";
import { conLetras, letrasDe, vistasDe, resumenLetras, hayLengua1 } from "../src/ui/letras.js";

const args = process.argv.slice(2), FULL = args.includes("--full"), SOLO = args.find((a) => !a.startsWith("--"));
const t = contador();

// Campos de `datos` que no son texto para el alumno (opciones internas, rótulos fijos de la maqueta, títulos de grupos).
const INTERNOS = new Set(["modo", "tipo", "respuesta", "posicion", "cual", "campo", "genero", "sentido", "falta", "tema", "ayuda",
  "contenido", "familia", "variante", "nombre", "forma", "color", "tam", "estilo", "caso", "regla", "nivel", "cajas", "pista", "numero", "dir"]);
// Tipos sin palabras que filtrar (trazos) o que tratan del abecedario entero (letra.abecedario, letra.parejas: ver ESTADO.md).
const OBJETIVO = new Set(["letra.busca", "letra.enpalabras", "silaba.tabla"]);   // tienen una opción «letra» = objetivo de la ficha
const EXENTOS = new Set(["escritura.trazos", "letra.abecedario"]);

function textos(x, k, out) {
  if (typeof x === "string") { if (!INTERNOS.has(k)) out.push([k, x]); }
  else if (Array.isArray(x)) x.forEach((y) => textos(y, k, out));
  else if (x && typeof x === "object") for (const [kk, v] of Object.entries(x)) textos(v, kk, out);
}

t.prueba("normalizarVistas", () => {
  if (normalizarVistas("MÁpa") !== "amp") throw new Error(normalizarVistas("MÁpa"));
  if (normalizarVistas("abcdefghijklmnñopqrstuvwxyz") !== null) throw new Error("todas → null");
  if (normalizarVistas("") !== null) throw new Error("vacía → null");
  conVistas("ampso", () => { if (!permitida("¡Mamá, sapo!") || permitida("pato")) throw new Error("permitida"); });
  if (!permitida("pato")) throw new Error("sin vistas todo vale");
});
t.prueba("validar: solo Lengua de 1.º", () => {
  if (validar("letra.busca", { vistas: "mapsoiue" }).vistas !== "aeimopsu") throw new Error("lengua");
  if ("vistas" in validar("letra.busca", { vistas: "abcdefghijklmnñopqrstuvwxyz" })) throw new Error("todas");
  if ("vistas" in validar("sumar.h20", { vistas: "ams" })) throw new Error("mates");
});

t.prueba("ui/letras.js", () => {
  const acts = [{ tipo: "silaba.separa", params: {} }, { tipo: "sumar.h20", params: { vistas: "x" } }];
  const r = conLetras(acts, "ampso");
  if (r[0].params.vistas !== "ampso" || "vistas" in r[1].params) throw new Error("conLetras");
  if ("vistas" in conLetras(r, null)[0].params) throw new Error("todas");
  let falla = false; try { conLetras(acts, ""); } catch { falla = true; } if (!falla) throw new Error("ninguna");
  if (!hayLengua1(acts) || hayLengua1([acts[1]])) throw new Error("hayLengua1");
  if (letrasDe({ actividades: r }) !== "amops") throw new Error("letrasDe");
  if (vistasDe(new Set("aeiou")) !== "aeiou" || resumenLetras(new Set("aeiou")) !== "Solo vocales") throw new Error("resumen");
});

const JUEGOS = ["aeioumpslt", "aeioumpslntdcrbgf", "aeiouyñmpslntdcrbgfvjhz"];
const ids = listaTipos().filter((id) => modelo(id).materia === "lengua" && !EXENTOS.has(id) && (!SOLO || id.startsWith(SOLO)));
let fichas = 0, errores = 0;
for (const id of ids) t.prueba(id, () => {
  const m = modelo(id), combos = combinaciones(id), paso = FULL ? 1 : Math.max(1, Math.floor(combos.length / 40));
  const fallos = [];
  for (const v of JUEGOS) for (let i = 0; i < combos.length; i += paso) for (const tam of m.tamanos) for (const s of FULL ? [1, 2, 3] : [1]) {
    const act = { tipo: id, params: { ...combos[i], vistas: v } };
    // una letra concreta elegida por la maestra se respeta aunque no esté en el mapa de letras (escritura.letra): no es un fallo
    if (id === "escritura.letra" && combos[i].letra && combos[i].letra !== "palabra" && !v.includes(combos[i].letra)) continue;
    // ídem con la letra objetivo de letra.busca / letra.enpalabras / silaba.tabla (los distractores y las demás letras sí siguen filtrados)
    if (OBJETIVO.has(id) && combos[i].letra && !v.includes(combos[i].letra)) continue;
    let f;
    try { f = generar({ actividades: tam === "media" ? [act, act] : [act] }, s); fichas++; }
    catch (e) { errores++; if (!/necesita|solo en|no hay/i.test(e.message)) throw e; continue; }   // pocas letras: error claro, no una ficha mala
    for (const a of f.paginas[0].actividades) for (const e of a.ejercicios) {
      const out = []; textos(e.datos, "", out);
      const ok = new Set(v);
      for (const [k, x] of out) {
        const malas = [...sinTildes(x.toLowerCase())].filter((c) => /\p{L}/u.test(c) && !ok.has(c));
        if (malas.length && fallos.length < 3) fallos.push(`${v} ${JSON.stringify(combos[i])} ${tam}: ${k}=«${x.slice(0, 40)}» (${[...new Set(malas)].join("")})`);
      }
    }
  }
  if (fallos.length) throw new Error(fallos.join("\n"));
});
console.log(`test_vistas: ${t.n} pruebas OK · ${fichas} fichas · ${errores} con «faltan letras» (esperado con pocas letras)`);
