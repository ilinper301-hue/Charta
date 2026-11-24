// palabra.articulo · el, la, los, las (Lengua 1.º, lote 2; LENGUA_1.md §3, bloque 4).
// datos:    { palabra (el nombre, en singular o plural, en el caso elegido), numero: "s" | "p", genero: "m" | "f" }
// solucion: { huecos: [artículo] }     (el, la, los, las · un, una, unos, unas; en MAYÚSCULAS si la letra lo es)
// Reglas: nombre del léxico con su género (reglas.js: articulo(), plural()); sin los femeninos que empiezan por «a»/«ha» (el agua, el hada…);
//         el plural es el de reglas.js y no cambia de tilde ni de forma de otro modo (camión → camiones queda fuera); mitad masculinos y mitad
//         femeninos; con plurales, mitad singular y mitad plural. Sin repetidos. Nombres de 3 a 9 letras.
// Con letras elegidas (vistas.js): el nombre (y su plural, si la ficha lleva plurales) y el artículo que escribe el alumno usan solo ellas; si el artículo
// no se puede escribir (p. ej. «un» sin la «n»), error.
// Opciones: artículos (el, la · un, una · el, la, los, las · un, una, unos, unas) · letra (minúscula / MAYÚSCULA). Cantidad: «Más grandes» 12 (2 × 6; media: 6), «Más ejercicios» las que caben con tarjetas ≥ 46 pt.
import { registrar } from "../nucleo/tipos.js";
import { TOP, B, T, cuantosRejilla } from "../render/papel.js";
import { articulo, plural } from "../lengua/reglas.js";
import { filtrarVistas, permitida, avisoVistas } from "../lengua/vistas.js";
import { cuantas, ajusta, conTope, crece } from "./_lengua.js";
import { NOMBRES } from "./_palabra.js";

const MIN_ALTO = 46;   // alto mínimo de tarjeta con «Más ejercicios»

export default registrar({
  id: "palabra.articulo",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) {
    return conTope(cuantosRejilla(ctx, 2, MIN_ALTO, [12, 6]), cuantas(ctx.tamano, 12), (n) => elegir(params, azar, n));
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.rejilla(TOP, 2, Math.ceil(act.ejercicios.length / 2)), k = crece(ch, 110), bw = 92 * k;
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i];
      p.marco(x, y, cw, ch, i);
      const fs = ajusta(p, (q) => p.ancho(e.datos.palabra, "PB", q) + bw + 10, cw - 36, Math.min(26 * k, ch * 0.5), 14);
      p.linea(x + 14, y, cw - 14, ch, [B(bw, Math.min(40 * k, ch - 10), e.solucion.huecos[0]), T(e.datos.palabra, fs)], 10);
    }));
  },
});

function elegir(params, azar, n) {
  const mod = params.articulos || "el", indef = mod === "un" || mod === "unplural", conPl = mod === "plural" || mod === "unplural";
  const lista = filtrarVistas(NOMBRES, (e) => (conPl ? e.p + " " + plural(e.p) : e.p));
  const bolsa = { m: azar.barajar(lista.filter((e) => e.g === "m")), f: azar.barajar(lista.filter((e) => e.g === "f")) };
  const fichas = [];
  for (let i = 0; i < n; i++) fichas.push({ g: i % 2 ? "f" : "m", pl: conPl && i >= n / 2 });
  for (const { g, pl } of fichas) {
    const art = articulo(g, { plural: pl, indefinido: indef });
    if (!permitida(art)) throw new Error(`«palabra.articulo» necesita poder escribir «${art}»: usa otros artículos o más letras.` + avisoVistas());
  }
  return {
    enunciado: `Escribe ${indef ? "un, una" + (conPl ? ", unos o unas" : "") : conPl ? "el, la, los o las" : "el o la"} delante de cada nombre.`,
    ejercicios: azar.barajar(fichas).map(({ g, pl }) => {
      const e = bolsa[g].pop();
      if (!e) throw new Error("«palabra.articulo» necesita más nombres en el léxico." + avisoVistas());
      const art = articulo(g, { plural: pl, indefinido: indef }), pal = pl ? plural(e.p) : e.p, mayus = params.caso === "mayus";
      return { datos: { palabra: mayus ? pal.toUpperCase() : pal, numero: pl ? "p" : "s", genero: g }, solucion: { huecos: [mayus ? art.toUpperCase() : art] } };
    }),
  };
}
