// Charta · fichas doradas (paso 2.5): opciones + semilla → JSON y SVG esperados.
// Uso: node tests/test_doradas.js               (compara con tests/doradas.json)
//      node tests/test_doradas.js --actualizar  (reescribe doradas.json: SOLO si el cambio es intencionado)
// Si falla, una ficha ya guardada (Tabula/Fori) o una «Otra variante» saldría distinta:
// o es un error, o hay que subir la «version» del tipo y actualizar las doradas.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { generar } from "../src/nucleo/ficha.js";
import { listaTipos } from "../src/tipos/index.js";
import { hojas } from "../src/render/hoja.js";
import { contador } from "./comun.js";

const RUTA = new URL("./doradas.json", import.meta.url).pathname;
const ACTUALIZAR = process.argv.includes("--actualizar");
const hash = (s) => createHash("sha256").update(s).digest("hex").slice(0, 16);

/** Casos fijos: uno por tipo (opciones por defecto) + combinaciones, variantes, nombres y B/N. */
const CASOS = [
  ...listaTipos().sort().map((id) => ({ nombre: id, opciones: { actividades: [{ tipo: id }] }, semilla: 1 })),
  { nombre: "dos actividades", semilla: 7, opciones: { actividades: [{ tipo: "sumar.h20", params: { nivel: "con" } }, { tipo: "restar.recta", params: { rango: 20 } }] } },
  { nombre: "mismo color corregido", semilla: 3, opciones: { actividades: [{ tipo: "orden.signos", color: "rosa" }, { tipo: "conteo.serie1", color: "rosa" }] } },
  { nombre: "variantes y título", semilla: 42, opciones: { titulo: "Repaso del lunes", variantes: 3, actividades: [{ tipo: "sumar.vertical", params: { nivel: "mezcla", rango: 100 } }, { tipo: "medida.reloj", params: { modo: "media" } }] } },
  // Matemáticas 3.º · lote 0 (millares)
  { nombre: "3.º bloques y recta hasta 9999", semilla: 8, opciones: { actividades: [{ tipo: "rep.bloques", curso: 3, params: { rango: 9999 } }, { tipo: "rep.recta", curso: 3, params: { rango: 9999 } }] } },
  { nombre: "3.º ¿Qué número es? hasta 9999", semilla: 8, opciones: { actividades: [{ tipo: "combinada.combinada", curso: 3, params: { rango: 9999 } }] } },
  // Matemáticas 2.º · lote 2 (tres cifras)
  { nombre: "2.º sumas en vertical", semilla: 8, opciones: { actividades: [{ tipo: "sumar.vertical", params: { rango: 999, nivel: "ud", sumandos: 3 } }] } },
  { nombre: "2.º restas con prueba", semilla: 8, opciones: { actividades: [{ tipo: "restar.vertical", params: { rango: 999, nivel: "con", prueba: true } }] } },
  { nombre: "2.º descomposición y canjes", semilla: 8, opciones: { actividades: [{ tipo: "valor.descdu", params: { rango: 999, modo: "suma" } }, { tipo: "valor.canje", params: { rango: 500 } }] } },
  { nombre: "2.º recta de 10 en 10 y de 100 en 100", semilla: 8, opciones: { actividades: [{ tipo: "sumar.recta", params: { rango: 999 } }, { tipo: "restar.recta", params: { rango: 999, salto: 100 } }] } },
  { nombre: "2.º encadenadas", semilla: 8, opciones: { actividades: [{ tipo: "sumar.encadenadas", params: { rango: 999, sumandos: 4 } }, { tipo: "restar.encadenadas", params: { rango: 999, salto: 100 } }] } },
  { nombre: "2.º dobles y mitades", semilla: 8, opciones: { actividades: [{ tipo: "sumar.dobles", params: { rango: 100, operacion: "mezcla" } }] } },
  { nombre: "2.º agrupa en centenas", semilla: 8, opciones: { actividades: [{ tipo: "valor.agrupa", params: { rango: 300 } }] } },
  { nombre: "2.º decenas y cifra", semilla: 8, opciones: { actividades: [{ tipo: "sumar.decenas", params: { rango: 999 } }, { tipo: "valor.cifra", params: { rango: 999 } }] } },
  // Matemáticas 2.º · lote 3 (medida)
  { nombre: "2.º reloj con cuartos", semilla: 8, opciones: { actividades: [{ tipo: "medida.reloj", curso: 2, params: { modo: "todas" } }, { tipo: "medida.reloj2", curso: 2, params: { modo: "cuarto" } }] } },
  { nombre: "2.º medidas del tiempo", semilla: 8, opciones: { actividades: [{ tipo: "medida.tiempo", curso: 2, params: { modo: "equivalencias" } }, { tipo: "medida.tiempo", curso: 2, params: { modo: "horas" } }] } },
  { nombre: "2.º dinero y compras", semilla: 8, opciones: { actividades: [{ tipo: "medida.dinero", params: { rango: 300 } }, { tipo: "medida.precios", params: { rango: 100, modo: "cambio" } }] } },
  { nombre: "2.º regla y ¿m o cm?", semilla: 8, opciones: { actividades: [{ tipo: "medida.longitud", curso: 2, params: { modo: "regla" } }, { tipo: "medida.longitud", curso: 2, params: { modo: "mcm" } }] } },
  { nombre: "2.º lados (dos actividades)", semilla: 8, opciones: { actividades: [{ tipo: "geometria.lados", curso: 2, params: {} }, { tipo: "geometria.lados", curso: 2, params: {} }] } },
  { nombre: "2.º itinerario con flechas", semilla: 8, opciones: { actividades: [{ tipo: "geometria.itinerario", curso: 2, params: { modo: "flechas" } }] } },
  { nombre: "2.º barras con escala", semilla: 8, opciones: { actividades: [{ tipo: "estadistica.barras", curso: 2, params: { modo: "lee", escala: 5, pregunta: "mas" } }] } },
  { nombre: "2.º euros y masa", semilla: 8, opciones: { actividades: [{ tipo: "medida.euros", curso: 2, params: { rango: 200 } }, { tipo: "medida.masa", curso: 2, params: {} }] } },
  { nombre: "nombres y B/N", semilla: 5, nombres: ["Ana", "Luis", "Marta"], bn: true, opciones: { variantes: 2, actividades: [{ tipo: "rep.dado", params: { lectura: true } }, { tipo: "rep.marco", params: { rango: 20 } }] } },
  // Espacio en la ficha · paso 2: rejilla elástica y «Más ejercicios»
  { nombre: "más ejercicios: mayor o menor", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "orden.mayor" }] } },
  { nombre: "más ejercicios: mayor o menor en media", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "orden.mayor", params: { rango: 9999 }, curso: 3 }, { tipo: "orden.signos" }] } },
  // Espacio en la ficha · paso 3, lote 1 (familia orden)
  ...["orden.cantidad", "orden.entre", "orden.grupo", "orden.signos", "orden.redondea"].map((t) => ({ nombre: "más ejercicios: " + t, semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: t, ...(t === "orden.redondea" ? { curso: 3, params: { rango: 9999 } } : {}) }] } })),
  { nombre: "más ejercicios en media: entre, grupo y cantidad", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "orden.entre" }, { tipo: "orden.grupo" }] } },
  { nombre: "más ejercicios en media: cantidad y redondea", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "orden.cantidad" }, { tipo: "orden.redondea", curso: 3, params: { rango: 9999 } }] } },
  // Espacio en la ficha · paso 3, lote 2 (familia conteo)
  ...["conteo.anterior", "conteo.cuenta", "conteo.falta", "conteo.serie1", "conteo.serie2", "conteo.serie5", "conteo.serie10", "conteo.series"].map((t) => ({ nombre: "más ejercicios: " + t, semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: t }] } })),
  { nombre: "más ejercicios en media: anterior y cuenta", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "conteo.anterior" }, { tipo: "conteo.cuenta" }] } },
  { nombre: "más ejercicios en media: falta y serie1", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "conteo.falta" }, { tipo: "conteo.serie1" }] } },
  // Trucos (Calculi): rejilla elástica. 3.º «Sumar 9» (3 columnas) y 2.º encadenado (2 columnas), completa y media
  { nombre: "más ejercicios: trucos sumar9 (3.º)", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "trucos.sumar9", curso: 3, params: { rango: 9999 } }] } },
  { nombre: "más ejercicios: trucos encadenado 2.º", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "trucos.sumar919", curso: 2 }] } },
  { nombre: "más ejercicios en media: sumar9 y compensar2", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "trucos.sumar9", curso: 3, params: { rango: 9999 } }, { tipo: "trucos.compensar2", curso: 2 }] } },
  { nombre: "más ejercicios: palabra.cuenta (número y casillas)", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "palabra.cuenta", curso: 1 }, { tipo: "palabra.cuenta", curso: 1, params: { respuesta: "casillas", letras: 6 } }] } },
  // Espacio en la ficha · paso 3, Lengua 1.º (una palabra por fila → 2 columnas)
  ...["fono.inicial", "fono.posicion", "fono.silabas", "fono.larga", "fono.quita", "letra.busca", "silaba.separa", "silaba.ordena", "silaba.falta", "silaba.junta", "palabra.letras", "palabra.plural", "palabra.contrarios"].map((t) => ({ nombre: "más ejercicios: " + t, semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: t, curso: 1 }] } })),
  { nombre: "más ejercicios en media: inicial, posicion y silabas (colorear)", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "fono.inicial", curso: 1 }, { tipo: "fono.posicion", curso: 1 }] } },
  { nombre: "más ejercicios en media: larga (mezcla) y quita", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "fono.larga", curso: 1, params: { cual: "mezcla" } }, { tipo: "fono.quita", curso: 1, params: { quitar: "mezcla" } }] } },
  { nombre: "más ejercicios en media: separa (rayas) y ordena", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "silaba.separa", curso: 1, params: { modo: "rayas" } }, { tipo: "silaba.ordena", curso: 1 }] } },
  { nombre: "más ejercicios en media: falta sin ayuda y junta", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "silaba.falta", curso: 1, params: { ayuda: "sin" } }, { tipo: "silaba.junta", curso: 1 }] } },
  { nombre: "más ejercicios en media: letras marcada y plural -es", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "palabra.letras", curso: 1, params: { marca: "primera" } }, { tipo: "palabra.plural", curso: 1, params: { plural: "es", sentido: "alreves" } }] } },
  { nombre: "más ejercicios en media: contrarios (escribir) y fono.silabas (número)", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "palabra.contrarios", curso: 1, params: { tarea: "escribe" } }, { tipo: "fono.silabas", curso: 1, params: { respuesta: "numero" } }] } },
  // Espacio en la ficha · paso 3, lote 3 (sumar y restar: rejilla elástica de operaciones)
  ...["sumar.h10", "sumar.h20", "sumar.h100", "sumar.hueco", "sumar.dobles", "sumar.comp10", "sumar.comp20", "sumar.decenas", "sumar.encadenadas", "sumar.piramide", "restar.r10", "restar.r20", "restar.r100", "restar.hueco", "restar.decenas", "restar.encadenadas", "restar.faltan", "restar.mitades"].map((t) => ({ nombre: "más ejercicios: " + t, semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: t }] } })),
  { nombre: "más ejercicios: 3.º sumas con hueco hasta 9999", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "sumar.hueco", curso: 3, params: { rango: 9999, nivel: "con" } }] } },
  { nombre: "más ejercicios: 3.º decenas y restas de decenas", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "sumar.decenas", curso: 3, params: { rango: 9999 } }, { tipo: "restar.decenas", curso: 3, params: { rango: 9999 } }] } },
  { nombre: "más ejercicios: 2.º encadenadas, dobles y mitades", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "sumar.encadenadas", curso: 2, params: { rango: 999, sumandos: 4 } }, { tipo: "sumar.dobles", curso: 2, params: { rango: 100, operacion: "mezcla" } }] } },
  { nombre: "más ejercicios en media: sumar.h20 y restar.hueco", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "sumar.h20", params: { nivel: "mezcla" } }, { tipo: "restar.hueco", curso: 2, params: { rango: 100, nivel: "con" } }] } },
  { nombre: "más ejercicios en media: pirámide y completa hasta 10", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "sumar.piramide" }, { tipo: "sumar.comp10" }] } },
  { nombre: "más ejercicios en media: dobles con dibujos y mitades", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "sumar.dobles", params: { modo: "dibujo" } }, { tipo: "restar.mitades", params: { modo: "dibujo" } }] } },
  { nombre: "más ejercicios en media: faltan y encadenadas", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "restar.faltan", params: { rango: 20 } }, { tipo: "restar.encadenadas", params: { rango: 20 } }] } },
  // Espacio en la ficha · paso 3, lote 4 (valor, juegos y geometría)
  ...["valor.agrupa", "valor.descdu", "valor.dunum", "valor.pares", "valor.canje", "valor.cifra", "juegos.cuadrado", "juegos.oculto", "geometria.lados", "geometria.rueda"].map((t) => ({ nombre: "más ejercicios: " + t, semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: t, ...(t === "valor.agrupa" ? { params: { rango: 20 } } : t === "juegos.oculto" ? { params: { rango: 20 } } : {}) }] } })),
  { nombre: "más ejercicios: 3.º descomposición, número y canje con millares", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "valor.descdu", curso: 3, params: { rango: 9999, modo: "suma" } }, { tipo: "valor.canje", curso: 3, params: { rango: 9999 } }] } },
  { nombre: "más ejercicios: 3.º decenas y unidades, y valor de la cifra", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "valor.dunum", curso: 3, params: { rango: 9999, nivel: "completas" } }, { tipo: "valor.cifra", curso: 3, params: { rango: 9999 } }] } },
  { nombre: "más ejercicios: 2.º descomposición con ceros y canje", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "valor.descdu", curso: 2, params: { rango: 999, nivel: "completas" } }, { tipo: "valor.cifra", curso: 2, params: { rango: 999 } }] } },
  { nombre: "más ejercicios en media: agrupa y pares", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "valor.agrupa", params: { rango: 30 } }, { tipo: "valor.pares", params: { rango: 20 } }] } },
  { nombre: "más ejercicios en media: descomposición y número (1.º)", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "valor.descdu", params: { rango: 50, nivel: "completas" } }, { tipo: "valor.dunum", params: { rango: 90 } }] } },
  { nombre: "más ejercicios en media: canje, cifra, oculto y cuadrado", semilla: 4, opciones: { cantidad: "mas", paginas: [{ actividades: [{ tipo: "valor.canje", params: { rango: 50 } }, { tipo: "valor.cifra", params: { rango: 50 } }] }, { actividades: [{ tipo: "juegos.oculto", params: { rango: 30 } }, { tipo: "juegos.cuadrado", params: { rango: 20 } }] }] } },
  { nombre: "más ejercicios en media: lados y rueda", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "geometria.lados", curso: 2 }, { tipo: "geometria.rueda", curso: 2 }] } },
  { nombre: "más ejercicios: oculto con rango 10 (sin más banco) y pares con rango 10", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "juegos.oculto" }, { tipo: "valor.pares" }] } },
  // 3.º · lote 3 (multiplicar): vertical, por 10/100/1000, doble/triple, y las tablas del 6 al 9
  { nombre: "3.º multiplicar vertical (3 cifras, mezcla)", semilla: 7, opciones: { actividades: [{ tipo: "multiplicar.vertical", curso: 3, params: { cifras: 3, nivel: "mezcla" } }] } },
  { nombre: "3.º multiplicar vertical y por 10 en media", semilla: 7, opciones: { actividades: [{ tipo: "multiplicar.vertical", curso: 3, params: { nivel: "con" } }, { tipo: "multiplicar.por10", curso: 3 }] } },
  { nombre: "3.º por 10, 100 y 1000 con hueco", semilla: 7, opciones: { actividades: [{ tipo: "multiplicar.por10", curso: 3, params: { modo: "hueco" } }] } },
  { nombre: "3.º más ejercicios: por 10 y doble/triple", semilla: 7, opciones: { cantidad: "mas", actividades: [{ tipo: "multiplicar.por10", curso: 3, params: { por: "100" } }] } },
  { nombre: "3.º doble, triple, mitad y tercio", semilla: 7, opciones: { actividades: [{ tipo: "multiplicar.dobletriple", curso: 3, params: { modo: "todo" } }] } },
  { nombre: "3.º más ejercicios en media: doble/triple y mitad/tercio", semilla: 7, opciones: { cantidad: "mas", actividades: [{ tipo: "multiplicar.dobletriple", curso: 3 }, { tipo: "multiplicar.dobletriple", curso: 3, params: { modo: "mitad" } }] } },
  { nombre: "3.º tablas del 6 al 9 y todas", semilla: 7, opciones: { actividades: [{ tipo: "multiplicar.tablas", curso: 3, params: { tablas: "7" } }, { tipo: "multiplicar.tablas", curso: 3, params: { tablas: "2a10", modo: "hueco" } }] } },
  { nombre: "3.º problemas de multiplicar con la tabla del 8", semilla: 7, opciones: { actividades: [{ tipo: "multiplicar.problemas", curso: 3, params: { tablas: "8" } }] } },
  // 3.º · lote 6 (medida): cambiar de unidad, unidad adecuada, duración, reloj con minutos, euros y céntimos
  { nombre: "3.º cambia de unidad (mezcla) y qué unidad usarías", semilla: 7, opciones: { actividades: [{ tipo: "medida.equivale", curso: 3 }, { tipo: "medida.unidad", curso: 3 }] } },
  { nombre: "3.º cambia de unidad: masa, de pequeña a grande", semilla: 7, opciones: { actividades: [{ tipo: "medida.equivale", curso: 3, params: { magnitud: "masa", modo: "menor" } }] } },
  { nombre: "3.º más ejercicios: unidad (longitud) y equivalencias", semilla: 7, opciones: { cantidad: "mas", actividades: [{ tipo: "medida.unidad", curso: 3, params: { magnitud: "longitud" } }, { tipo: "medida.equivale", curso: 3, params: { magnitud: "longitud" } }] } },
  { nombre: "3.º cuánto dura (mezcla, cuartos)", semilla: 7, opciones: { actividades: [{ tipo: "medida.duracion", curso: 3, params: { tarea: "mezcla", paso: 15 } }] } },
  { nombre: "3.º a qué hora termina y más ejercicios", semilla: 7, opciones: { cantidad: "mas", actividades: [{ tipo: "medida.duracion", curso: 3, params: { tarea: "fin" } }] } },
  { nombre: "3.º relojes con minutos (de 5 en 5 y de 1 en 1)", semilla: 7, opciones: { actividades: [{ tipo: "medida.reloj", curso: 3, params: { modo: "cinco" } }] } },
  { nombre: "3.º dibuja las agujas con minutos de 1 en 1", semilla: 7, opciones: { actividades: [{ tipo: "medida.reloj2", curso: 3, params: { modo: "minuto" } }] } },
  { nombre: "3.º euros y céntimos y compras con céntimos", semilla: 7, opciones: { actividades: [{ tipo: "medida.dinero", curso: 3, params: { modo: "mixto" } }, { tipo: "medida.precios", curso: 3, params: { centimos: true } }] } },
  { nombre: "3.º la vuelta con céntimos", semilla: 7, opciones: { actividades: [{ tipo: "medida.precios", curso: 3, params: { centimos: true, modo: "cambio" } }] } },
  // 3.º · lote 7 (geometría y estadística): ángulos, perímetro, traslación, líneas, cuerpos, moda, dos clases y probabilidad
  { nombre: "3.º los ángulos", semilla: 7, opciones: { actividades: [{ tipo: "geometria.angulos", curso: 3 }] } },
  { nombre: "3.º los ángulos más ejercicios en media", semilla: 7, opciones: { cantidad: "mas", actividades: [{ tipo: "geometria.angulos", curso: 3 }, { tipo: "geometria.angulos", curso: 3 }] } },
  { nombre: "3.º el perímetro con las medidas de los lados", semilla: 7, opciones: { actividades: [{ tipo: "geometria.perimetro", curso: 3 }] } },
  { nombre: "3.º el perímetro en la cuadrícula (completa y media)", semilla: 7, opciones: { paginas: [{ actividades: [{ tipo: "geometria.perimetro", curso: 3, params: { modo: "cuadricula" } }] }, { actividades: [{ tipo: "geometria.perimetro", curso: 3 }, { tipo: "geometria.perimetro", curso: 3, params: { modo: "cuadricula" } }] }] } },
  { nombre: "3.º el perímetro: más ejercicios", semilla: 7, opciones: { cantidad: "mas", actividades: [{ tipo: "geometria.perimetro", curso: 3, params: { modo: "cuadricula" } }] } },
  { nombre: "3.º traslada la figura (completa y media)", semilla: 7, opciones: { paginas: [{ actividades: [{ tipo: "geometria.traslada", curso: 3 }] }, { actividades: [{ tipo: "geometria.traslada", curso: 3 }, { tipo: "geometria.traslada", curso: 3 }] }] } },
  { nombre: "3.º traslada la figura: más ejercicios", semilla: 7, opciones: { cantidad: "mas", actividades: [{ tipo: "geometria.traslada", curso: 3 }] } },
  { nombre: "3.º líneas paralelas, perpendiculares y oblicuas", semilla: 7, opciones: { actividades: [{ tipo: "geometria.lineas", curso: 3, params: { modo: "paralelas" } }] } },
  { nombre: "3.º recta, semirrecta y segmento (media)", semilla: 7, opciones: { actividades: [{ tipo: "geometria.lineas", curso: 3, params: { modo: "rectas" } }, { tipo: "geometria.lineas", curso: 3, params: { modo: "paralelas" } }] } },
  { nombre: "3.º cuerpos: caras, aristas y vértices (completa y media)", semilla: 7, opciones: { paginas: [{ actividades: [{ tipo: "geometria.cuerpos", curso: 3, params: { modo: "elementos" } }] }, { actividades: [{ tipo: "geometria.cuerpos", curso: 3, params: { modo: "elementos" } }, { tipo: "geometria.cuerpos", curso: 3 }] }] } },
  { nombre: "3.º ¿seguro, posible o imposible?", semilla: 7, opciones: { actividades: [{ tipo: "estadistica.probable", curso: 3 }] } },
  { nombre: "3.º ¿seguro, posible o imposible? más ejercicios en media", semilla: 7, opciones: { cantidad: "mas", actividades: [{ tipo: "estadistica.probable", curso: 3 }, { tipo: "estadistica.probable", curso: 3 }] } },
  { nombre: "3.º gráfico de barras: la moda", semilla: 7, opciones: { actividades: [{ tipo: "estadistica.barras", curso: 3, params: { modo: "lee", moda: true } }] } },
  { nombre: "3.º gráfico de barras de dos clases (escala de 2)", semilla: 7, opciones: { actividades: [{ tipo: "estadistica.barras", curso: 3, params: { grupos: "dos", escala: 2 } }] } },
  { nombre: "3.º gráfico de barras de dos clases con la moda", semilla: 7, opciones: { actividades: [{ tipo: "estadistica.barras", curso: 3, params: { grupos: "dos", moda: true } }] } },
  { nombre: "3.º pictograma con la moda", semilla: 7, opciones: { actividades: [{ tipo: "estadistica.pictograma", curso: 3, params: { moda: true } }] } },
  { nombre: "3.º pictograma de dos clases (cada punto vale 2)", semilla: 7, opciones: { actividades: [{ tipo: "estadistica.pictograma", curso: 3, params: { grupos: "dos", modo: "dos" } }] } },
  { nombre: "3.º pictograma de dos clases con la moda", semilla: 7, opciones: { actividades: [{ tipo: "estadistica.pictograma", curso: 3, params: { grupos: "dos", moda: true } }] } },
  { nombre: "3.º cuenta y anota con la moda", semilla: 7, opciones: { actividades: [{ tipo: "estadistica.recuento", curso: 3, params: { moda: true } }] } },
  { nombre: "3.º cuenta y anota de dos clases", semilla: 7, opciones: { actividades: [{ tipo: "estadistica.recuento", curso: 3, params: { grupos: "dos" } }] } },
  { nombre: "3.º cuenta y anota de dos clases con la moda", semilla: 7, opciones: { actividades: [{ tipo: "estadistica.recuento", curso: 3, params: { grupos: "dos", moda: true } }] } },
  // 3.º · lote 4 (dividir): la caja, de la tabla, la familia, problemas y el reparto con ÷
  { nombre: "3.º divisiones con la caja (2 cifras, exactas)", semilla: 7, opciones: { actividades: [{ tipo: "dividir.vertical", curso: 3 }] } },
  { nombre: "3.º divisiones con la caja (3 cifras, mezcla, prueba)", semilla: 7, opciones: { actividades: [{ tipo: "dividir.vertical", curso: 3, params: { cifras: 3, nivel: "mezcla", prueba: true } }] } },
  { nombre: "3.º caja con resto y divisiones de la tabla en media", semilla: 7, opciones: { actividades: [{ tipo: "dividir.vertical", curso: 3, params: { nivel: "resto" } }, { tipo: "dividir.tabla", curso: 3, params: { modo: "porque" } }] } },
  { nombre: "3.º divisiones de la tabla", semilla: 7, opciones: { actividades: [{ tipo: "dividir.tabla", curso: 3 }] } },
  { nombre: "3.º más ejercicios: divisiones de la tabla con hueco", semilla: 7, opciones: { cantidad: "mas", actividades: [{ tipo: "dividir.tabla", curso: 3, params: { modo: "hueco", tablas: "6a9" } }] } },
  { nombre: "3.º familia de la multiplicación y la división", semilla: 7, opciones: { actividades: [{ tipo: "dividir.familia", curso: 3 }, { tipo: "dividir.familia", curso: 3, params: { modo: "libre" } }] } },
  { nombre: "3.º problemas de dividir", semilla: 7, opciones: { actividades: [{ tipo: "problemas.division", curso: 3 }] } },
  { nombre: "3.º problemas de dividir con resto", semilla: 7, opciones: { actividades: [{ tipo: "problemas.division", curso: 3, params: { modo: "resto" } }] } },
  // 3.º · lote 5 (fracciones)
  { nombre: "3.º qué parte está coloreada", semilla: 7, opciones: { actividades: [{ tipo: "fraccion.lee", curso: 3 }] } },
  { nombre: "3.º qué parte está coloreada y cómo se lee, y colorea la fracción en media", semilla: 7, opciones: { actividades: [{ tipo: "fraccion.lee", curso: 3, params: { modo: "lee" } }, { tipo: "fraccion.colorea", curso: 3, params: { den: 6 } }] } },
  { nombre: "3.º la fracción en letras", semilla: 7, opciones: { actividades: [{ tipo: "fraccion.letras", curso: 3 }] } },
  { nombre: "3.º más ejercicios: la fracción en letras", semilla: 7, opciones: { cantidad: "mas", actividades: [{ tipo: "fraccion.letras", curso: 3, params: { modo: "escribir" } }] } },
  { nombre: "3.º compara fracciones (mezcla, con tiras)", semilla: 7, opciones: { actividades: [{ tipo: "fraccion.compara", curso: 3, params: { modo: "mezcla" } }] } },
  { nombre: "3.º la fracción de un número y en la recta en media", semilla: 7, opciones: { actividades: [{ tipo: "fraccion.de", curso: 3, params: { tipo: "varias" } }, { tipo: "fraccion.recta", curso: 3 }] } },
  { nombre: "3.º fracciones en la recta: marca", semilla: 7, opciones: { actividades: [{ tipo: "fraccion.recta", curso: 3, params: { modo: "marca" } }] } },
  { nombre: "3.º reparto con el signo ÷", semilla: 7, opciones: { actividades: [{ tipo: "multiplicar.reparto", curso: 3, params: { signo: true } }, { tipo: "multiplicar.reparto", curso: 3, params: { modo: "mitad", signo: true } }] } },
  // Espacio en la ficha · paso 3, lote 5 (multiplicar y medida)
  ...["multiplicar.grupos", "multiplicar.tablas", "medida.capacidad", "medida.masa", "medida.precios"].map((t) => ({ nombre: "más ejercicios: " + t, semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: t }] } })),
  { nombre: "más ejercicios: 2.º regla, ¿m o cm?, equivalencias, horas y días", semilla: 4, opciones: { cantidad: "mas", paginas: [{ actividades: [{ tipo: "medida.longitud", curso: 2, params: { modo: "regla" } }] }, { actividades: [{ tipo: "medida.longitud", curso: 2, params: { modo: "mcm" } }] }, { actividades: [{ tipo: "medida.tiempo", curso: 2, params: { modo: "equivalencias" } }] }, { actividades: [{ tipo: "medida.tiempo", curso: 2, params: { modo: "horas" } }] }, { actividades: [{ tipo: "medida.tiempo" }] }] } },
  { nombre: "más ejercicios: tablas con hueco y una sola tabla", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "multiplicar.tablas", params: { modo: "hueco", tablas: "todas" } }, { tipo: "multiplicar.tablas", params: { tablas: "3" } }] } },
  { nombre: "más ejercicios en media: grupos y tablas", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "multiplicar.grupos", params: { modo: "mult" } }, { tipo: "multiplicar.tablas" }] } },
  { nombre: "más ejercicios en media: capacidad y masa", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "medida.capacidad" }, { tipo: "medida.masa" }] } },
  { nombre: "más ejercicios en media: precios y regla", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "medida.precios", params: { modo: "cambio" } }, { tipo: "medida.longitud", curso: 2, params: { modo: "regla" } }] } },
  { nombre: "más ejercicios en media: ¿m o cm? y equivalencias", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "medida.longitud", curso: 2, params: { modo: "mcm" } }, { tipo: "medida.tiempo", curso: 2, params: { modo: "equivalencias" } }] } },
  { nombre: "más ejercicios en media: horas y días", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "medida.tiempo", curso: 2, params: { modo: "horas" } }, { tipo: "medida.tiempo" }] } },
  // Espacio en la ficha · paso 3, último lote (Lengua restante y romanos)
  ...["frase.completa", "frase.ordena", "frase.puntua", "frase.separa", "frase.verdad", "letra.abecedario", "letra.enpalabras", "letra.falta", "letra.vocales", "orto.elige", "orto.mayuscula", "palabra.articulo", "palabra.dibuja", "palabra.intrusa", "silaba.tabla", "escritura.ordena", "lectura.instrucciones"].map((t) => ({ nombre: "más ejercicios: " + t, semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: t, curso: 1 }] } })),
  { nombre: "más ejercicios: 3.º romanos (con y sin ayuda)", semilla: 4, opciones: { cantidad: "mas", paginas: [{ actividades: [{ tipo: "rep.romanos", curso: 3 }] }, { actividades: [{ tipo: "rep.romanos", curso: 3, params: { ayuda: false, modo: "leer" } }] }] } },
  { nombre: "más ejercicios en media: frase.completa (sin ayuda) y frase.ordena", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "frase.completa", curso: 1, params: { ayuda: "sin" } }, { tipo: "frase.ordena", curso: 1 }] } },
  { nombre: "más ejercicios en media: puntua (escribir) y separa (rayas)", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "frase.puntua", curso: 1, params: { tarea: "escribe" } }, { tipo: "frase.separa", curso: 1 }] } },
  { nombre: "más ejercicios en media: separa (reescribir) y verdad", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "frase.separa", curso: 1, params: { tarea: "escribe" } }, { tipo: "frase.verdad", curso: 1 }] } },
  { nombre: "más ejercicios en media: abecedario y enpalabras (solo rodear)", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "letra.abecedario", curso: 1 }, { tipo: "letra.enpalabras", curso: 1, params: { tarea: "rodea" } }] } },
  { nombre: "más ejercicios en media: falta (sin ayuda) y vocales", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "letra.falta", curso: 1, params: { ayuda: "sin" } }, { tipo: "letra.vocales", curso: 1 }] } },
  { nombre: "más ejercicios en media: orto.elige (sin ayuda) y mayúscula (escribir)", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "orto.elige", curso: 1, params: { ayuda: "sin" } }, { tipo: "orto.mayuscula", curso: 1, params: { tarea: "escribe" } }] } },
  { nombre: "más ejercicios en media: articulo, dibuja e intrusa", semilla: 4, opciones: { cantidad: "mas", paginas: [{ actividades: [{ tipo: "palabra.articulo", curso: 1 }, { tipo: "palabra.intrusa", curso: 1 }] }, { actividades: [{ tipo: "palabra.dibuja", curso: 1 }, { tipo: "escritura.ordena", curso: 1 }] }] } },
  { nombre: "más ejercicios en media: instrucciones (dos) y romanos 3.º", semilla: 4, opciones: { cantidad: "mas", actividades: [{ tipo: "lectura.instrucciones", curso: 1, params: { ordenes: "dos" } }, { tipo: "rep.romanos", curso: 3 }] } },
  { nombre: "mayor o menor en media", semilla: 4, opciones: { actividades: [{ tipo: "orden.mayor" }, { tipo: "conteo.serie1" }] } },
  // Lengua 1.º · letra escolar ligada (Escolar_G) en las fichas de caligrafía
  ...[["palabras", "frase"], ["letra", "ordena"], ["libre"]].map((ts) => ({ nombre: "1.º escolar " + ts.join(" + "), semilla: 5, opciones: { actividades: ts.map((t) => ({ tipo: "escritura." + t, curso: 1, params: { grafia: "escolar" } })) } })),
];

function calcular(c) {
  const ficha = generar(c.opciones, c.semilla);
  const svg = (modo) => hojas(ficha, { nombres: c.nombres || [], bn: !!c.bn, modo }).map((h) => hash(h.svg));
  return { ficha, svgPapel: svg("papel"), svgSolucion: svg("solucion") };
}

const actual = Object.fromEntries(CASOS.map((c) => [c.nombre, calcular(c)]));

if (ACTUALIZAR || !existsSync(RUTA)) {
  writeFileSync(RUTA, JSON.stringify(actual, null, 1) + "\n");
  console.log(`test_doradas: ${CASOS.length} fichas doradas escritas en tests/doradas.json`);
} else {
  const guardadas = JSON.parse(readFileSync(RUTA, "utf8"));
  const t = contador();
  for (const c of CASOS) t.prueba(c.nombre, () => {
    const g = guardadas[c.nombre], a = actual[c.nombre];
    assert.ok(g, "no hay dorada: ejecuta con --actualizar");
    assert.deepEqual(a.ficha, g.ficha, "el JSON de la ficha ha cambiado");
    assert.deepEqual(a.svgPapel, g.svgPapel, "el dibujo (papel) ha cambiado");
    assert.deepEqual(a.svgSolucion, g.svgSolucion, "el dibujo (solución) ha cambiado");
  });
  const sobran = Object.keys(guardadas).filter((k) => !actual[k]);
  if (sobran.length) { console.error("Doradas sin caso:", sobran.join(", ")); process.exitCode = 1; }
  console.log(`test_doradas: ${t.n}/${CASOS.length} fichas iguales a las doradas`);
}
