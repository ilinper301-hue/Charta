// Charta · variantes «mismo contenido, otro orden» (petición de Iván, 23-11-2026: que los alumnos no se copien).
// Con `opciones.orden` en generar(), las variantes B, C… llevan los MISMOS ejercicios que la A, cambiados de sitio.
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

/** ¿Cambian de sitio los ejercicios de este tipo en las variantes «otro orden»? */
export const seReordena = (id) => ORDEN_LIBRE.has(id);

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
      if (!seReordena(a.tipo) || a.ejercicios.length < 2) return a;
      const ok = ACEPTA[a.tipo], vale = ok ? (p) => ok(p.map((j) => a.ejercicios[j])) : undefined;
      const p = permutacion(a.ejercicios.length, crearAzar(mezclar(s, a.n, 77)), vale);
      return { ...a, ejercicios: p.map((j, k) => ({ ...a.ejercicios[j], id: `a${a.n}e${k + 1}` })) };
    }),
  }));
}
