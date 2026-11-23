// Charta · variantes «mismo contenido, otro orden» (petición de Iván, 23-11-2026: que los alumnos no se copien).
// Con `opciones.orden` en generar(), las variantes B, C… llevan los MISMOS ejercicios que la A, cambiados de sitio, y
// DENTRO de cada ejercicio cambian de sitio sus piezas (opciones, palabras, letras, sílabas, figuras…; DENTRO, más abajo)
// y, en las de unir, las dos columnas (UNIR). Las soluciones se recalculan con el nuevo orden.
// Solo en los tipos de ORDEN_LIBRE: ejercicios independientes cuyo dibujo no depende del puesto (comprobado al darles
// la vuelta: invariantes y dibujo; tests/test_orden.js). El resto sale igual en todas las variantes.
// Fuera (el puesto forma parte del diseño): rep.* (primero leer, después dibujar), combinada, conteo.cuenta y series
// (alternan), juegos.une, letra.parejas, fono.rimas y palabra.contrarios (columnas emparejadas), multiplicar.tablas (en
// orden), medida.calendario/tiempo/capacidad, orden.cantidad/ordinales, valor.agrupa, sumar.dibujos, restar.quita,
// problemas.mixtos/barras/dospasos (alternan), escritura.* de copia y dictado, lectura.texto y fluidez, y los de 1–2 ejercicios.
import { crearAzar, mezclar } from "./azar.js";

export const ORDEN_LIBRE = new Set([
  // Matemáticas
  "conteo.anterior", "conteo.falta",
  "orden.entre", "orden.grupo", "orden.mayor", "orden.ordena1", "orden.ordena2", "orden.signos",
  "valor.canje", "valor.cifra", "valor.descdu", "valor.dunum", "valor.pares",
  "sumar.comp10", "sumar.comp20", "sumar.decenas", "sumar.dobles", "sumar.encadenadas", "sumar.h10", "sumar.h20", "sumar.h100",
  "sumar.hueco", "sumar.piramide", "sumar.recta", "sumar.vertical", "suma.suma",
  "restar.decenas", "restar.encadenadas", "restar.faltan", "restar.familia", "restar.hueco", "restar.mitades",
  "restar.r10", "restar.r20", "restar.r100", "restar.recta", "restar.vertical",
  "juegos.cadena", "juegos.cuadrado", "juegos.oculto",
  "problemas.suma", "problemas.resta", "problemas.dinero",
  "trucos.amigos100", "trucos.casidobles", "trucos.centenas", "trucos.compensar2", "trucos.descomponer", "trucos.descomponer2",
  "trucos.masmenos1", "trucos.masmenos10", "trucos.orden", "trucos.pasardecena2", "trucos.restadecenas", "trucos.restar919",
  "trucos.restaradelante", "trucos.restarsumando", "trucos.sumadecenas", "trucos.sumar9", "trucos.sumar919", "trucos.usar5",
  "geometria.copia", "geometria.cuerpos", "geometria.figuras", "geometria.itinerario", "geometria.lados", "geometria.lineas",
  "geometria.posiciones", "geometria.rueda", "geometria.simetria",
  "medida.dinero", "medida.euros", "medida.longitud", "medida.masa", "medida.precios", "medida.reloj", "medida.reloj2",
  "estadistica.patrones",
  "multiplicar.filas", "multiplicar.grupos", "multiplicar.problemas", "multiplicar.reparto",
  // Lengua
  "letra.abecedario", "letra.busca", "letra.enpalabras", "letra.falta", "letra.vocales",
  "silaba.falta", "silaba.junta", "silaba.ordena", "silaba.separa", "silaba.tabla",
  "fono.inicial", "fono.larga", "fono.posicion", "fono.quita", "fono.silabas",
  "palabra.articulo", "palabra.clasifica", "palabra.cuenta", "palabra.dibuja", "palabra.intrusa", "palabra.letras", "palabra.plural",
  "orto.elige", "orto.mayuscula",
  "frase.completa", "frase.ordena", "frase.puntua", "frase.separa", "frase.verdad",
  "lectura.adivinanza", "lectura.instrucciones", "lectura.ordena",
  "escritura.ordena",
]);

/** Condiciones de algunos tipos sobre el orden (las mismas que comprueban sus invariantes). */
const ACEPTA = {
  "frase.verdad": (es) => !/^0+1+$|^1+0+$/.test(es.map((e) => e.solucion.rodea).join("")),   // Sí y No mezclados
};

/** Orden de `lista` según la permutación `p` (nuevo[k] = lista[p[k]]). */
const segun = (lista, p) => p.map((j) => lista[j]);
/** Permutación distinta de la identidad (si se puede) que cumpla `vale`; si no hay ninguna en 200 intentos, la identidad. */
function otroOrden(n, az, vale = () => true) {
  const base = Array.from({ length: n }, (_, i) => i);
  for (let t = 0; t < 200 && n > 1; t++) {
    const p = az.barajar(base);
    if (p.some((x, i) => x !== i) && vale(p)) return p;
  }
  return base;
}
const sinSignos = (t) => String(t).toLowerCase().replace(/[.,;:¿?¡!]/g, "").replace(/\s+/g, "");
/** Opciones barajadas; la solución va por texto (no por índice). */
const opciones = (e, az) => {
  const o = e.datos.opciones;
  if (!Array.isArray(o) || o.length < 2) return e;
  return { ...e, datos: { ...e.datos, opciones: segun(o, otroOrden(o.length, az)) } };
};
/** Lista `campo` barajada y `solucion.rodea` (índice) movido con ella. */
const conIndice = (campo) => (e, az) => {
  const l = e.datos[campo];
  if (!Array.isArray(l) || l.length < 2 || !Number.isInteger(e.solucion.rodea)) return e;
  const p = otroOrden(l.length, az);
  return { ...e, datos: { ...e.datos, [campo]: segun(l, p) }, solucion: { ...e.solucion, rodea: p.indexOf(e.solucion.rodea) } };
};
/** Piezas que el alumno ordena: barajadas, sin que salgan ya en el orden bueno. */
const piezas = (campo, bueno) => (e, az) => {
  const l = e.datos[campo], meta = sinSignos(bueno(e));
  const p = otroOrden(l.length, az, (q) => sinSignos(segun(l, q).join("")) !== meta);
  return { ...e, datos: { ...e.datos, [campo]: segun(l, p) } };
};

/**
 * Cambios de orden DENTRO de cada ejercicio: (ejercicio, azar) → ejercicio con las mismas piezas en otro orden y su solución.
 * Lo que se ve cambia de sitio; lo que hay que hacer y la respuesta, no.
 */
export const DENTRO = {
  // elegir entre opciones (la solución es el texto)
  "letra.falta": opciones, "silaba.falta": opciones, "frase.completa": opciones, "orto.elige": opciones,
  "geometria.figuras": opciones, "geometria.cuerpos": opciones,
  "geometria.lineas": (e, az) => (e.datos.tipos.includes("abierta") ? e   // abierta/cerrada: orden fijo (como en la ficha)
    : { ...e, datos: { ...e.datos, tipos: segun(e.datos.tipos, otroOrden(e.datos.tipos.length, az)) } }),
  // rodear una de varias (la solución es un índice)
  "fono.inicial": conIndice("opciones"), "fono.larga": conIndice("palabras"), "palabra.intrusa": conIndice("palabras"),
  "lectura.texto": conIndice("opciones"),   // solo las preguntas de elegir (las demás no tienen opciones)
  // ordenar piezas: nunca ya en el orden bueno
  "silaba.ordena": piezas("silabas", (e) => e.datos.palabra),
  "escritura.ordena": piezas("letras", (e) => e.datos.palabra),
  "frase.ordena": piezas("palabras", (e) => e.solucion.huecos[0]),
  "orden.ordena1": (e, az) => ({ ...e, datos: { ...e.datos, valores: segun(e.datos.valores, otroOrden(e.datos.valores.length, az, (q) => segun(e.datos.valores, q).join() !== e.solucion.huecos.join())) } }),
  "orden.ordena2": (e, az) => DENTRO["orden.ordena1"](e, az),
  "orden.grupo": (e, az) => ({ ...e, datos: { ...e.datos, valores: segun(e.datos.valores, otroOrden(e.datos.valores.length, az)) } }),
  "lectura.ordena": (e, az) => {
    const { frases } = e.datos, h = e.solucion.huecos;
    const p = otroOrden(frases.length, az, (q) => segun(h, q).some((x, k) => x !== k + 1));   // nunca ya ordenadas
    return { ...e, datos: { ...e.datos, frases: segun(frases, p) }, solucion: { ...e.solucion, huecos: segun(h, p) } };
  },
  "medida.capacidad": (e, az) => {
    const p = otroOrden(e.datos.niv.length, az);
    return { ...e, datos: { ...e.datos, niv: segun(e.datos.niv, p) }, solucion: { ...e.solucion, huecos: segun(e.solucion.huecos, p) } };
  },
  // dos números: se dan la vuelta
  "orden.entre": (e) => ({ ...e, datos: { ...e.datos, a: e.datos.b, b: e.datos.a } }),
  "orden.mayor": (e) => ({ ...e, datos: { ...e.datos, a: e.datos.b, b: e.datos.a } }),
  "orden.signos": (e) => ({ ...e, datos: { a: e.datos.b, b: e.datos.a }, solucion: { ...e.solucion, huecos: [{ "<": ">", ">": "<", "=": "=" }[e.solucion.huecos[0]]] } }),
  // buscar y contar: las mismas piezas en otros sitios
  "letra.busca": (e, az) => {
    const f = e.datos.fila, p = otroOrden(f.length, az), nf = segun(f, p), pos = new Set(e.solucion.rodea);
    return { ...e, datos: { ...e.datos, fila: nf }, solucion: { ...e.solucion, rodea: p.map((j, k) => (pos.has(j) ? k : -1)).filter((k) => k >= 0) } };
  },
  "palabra.clasifica": (e, az) => {
    const banco = segun(e.datos.banco, otroOrden(e.datos.banco.length, az));
    const clasifica = e.solucion.clasifica.map((ws) => ws.slice().sort((a, b) => banco.indexOf(a) - banco.indexOf(b)));
    return { ...e, datos: { ...e.datos, banco }, solucion: { ...e.solucion, huecos: clasifica.flat(), clasifica } };
  },
  "lectura.instrucciones": (e, az) => {
    const p = otroOrden(e.datos.figuras.length, az);
    return { ...e, datos: { ...e.datos, figuras: segun(e.datos.figuras, p) }, solucion: { ...e.solucion, colorea: e.solucion.colorea.map((i) => p.indexOf(i)) } };
  },
  "valor.pares": (e, az) => (e.datos.numeros ? { ...e, datos: { ...e.datos, numeros: segun(e.datos.numeros, otroOrden(e.datos.numeros.length, az)) } } : e),
  "medida.tiempo": (e, az) => {
    if (e.datos.ops) return { ...e, datos: { ...e.datos, ops: segun(e.datos.ops, otroOrden(e.datos.ops.length, az)) } };
    if (!e.datos.orden) return e;
    const o = e.datos.orden, p = otroOrden(o.length, az, (q) => segun(o, q).some((x, k) => x !== k));   // nunca ya en orden
    return { ...e, datos: { ...e.datos, orden: segun(o, p) }, solucion: { ...e.solucion, huecos: segun(e.solucion.huecos, p) } };
  },
  "juegos.oculto": (e, az) => ({ ...e, datos: { ...e.datos, pistas: segun(e.datos.pistas, otroOrden(e.datos.pistas.length, az)) } }),
  "geometria.cuenta": (e, az) => ({ ...e, datos: { ...e.datos, figuras: segun(e.datos.figuras, otroOrden(e.datos.figuras.length, az)) } }),
  "estadistica.recuento": (e, az) => ({ ...e, datos: { ...e.datos, items: segun(e.datos.items, otroOrden(e.datos.items.length, az)) } }),
};

/** De unir (columna izquierda con la derecha): filas de la izquierda y casillas de la derecha barajadas por separado; `une` se recalcula. */
export const UNIR = new Set(["juegos.une", "letra.parejas", "fono.rimas", "palabra.contrarios", "silaba.junta"]);
function unirEnOtroOrden(es, az) {
  const n = es.length, der = es.map((e) => e.datos.derecha);
  const P = permutacion(n, az);                                   // filas de la izquierda: ninguna en su sitio
  const Q = otroOrden(n, az, (q) => P.some((j, k) => q.indexOf(es[j].solucion.une) !== k));   // sin quedar todas en línea recta
  return P.map((j, k) => ({ ...es[j], datos: { ...es[j].datos, derecha: der[Q[k]] }, solucion: { ...es[j].solucion, une: Q.indexOf(es[j].solucion.une) } }));
}

/** ¿Cambia algo de este tipo en las variantes «otro orden»? (los ejercicios de sitio, sus piezas o las columnas de unir) */
export const seReordena = (id) => ORDEN_LIBRE.has(id) || id in DENTRO || UNIR.has(id);

/** Permutación de 0..n−1 sin ningún índice en su sitio (si n ≥ 2) que cumpla `vale(p)`, determinista con `azar`. */
export function permutacion(n, azar, vale = () => true) {
  const base = Array.from({ length: n }, (_, i) => i);
  if (n < 2) return base;
  for (let t = 0; t < 200; t++) {
    const p = azar.barajar(base);
    if (p.every((x, i) => x !== i) && vale(p)) return p;
  }
  return base.map((_, i) => (i + 1) % n);   // rotación: nunca debería hacer falta
}

/** Páginas de la variante con semilla `s`: las de la A con los ejercicios cambiados de sitio (ids por posición, como generar()). */
export function reordenarPaginas(paginas, s) {
  return paginas.map((pag) => ({
    ...pag,
    actividades: pag.actividades.map((a) => {
      let es = a.ejercicios;
      const az = crearAzar(mezclar(s, a.n, 77));
      if (UNIR.has(a.tipo) && es.length >= 2 && es[0].datos.derecha !== undefined) es = unirEnOtroOrden(es, az);
      else if ((ORDEN_LIBRE.has(a.tipo) || UNIR.has(a.tipo)) && es.length >= 2) {
        const ok = ACEPTA[a.tipo], txt = es.map((e) => JSON.stringify(e.datos));
        const vale = (p) => p.some((j, k) => txt[j] !== txt[k]) && (!ok || ok(p.map((j) => es[j])));   // que se note (hay ejercicios repetidos)
        es = permutacion(es.length, az, vale).map((j) => es[j]);
      }
      const dentro = DENTRO[a.tipo];
      if (dentro) es = es.map((e, k) => dentro(e, crearAzar(mezclar(s, a.n, 78, k))));
      return es === a.ejercicios ? a : { ...a, ejercicios: es.map((e, k) => ({ ...e, id: `a${a.n}e${k + 1}` })) };
    }),
  }));
}
