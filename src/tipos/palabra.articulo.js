// palabra.articulo · el, la, los, las (Lengua 1.º, lote 2; LENGUA_1.md §3, bloque 4).
// datos:    { palabra (el nombre, en singular o plural, en el caso elegido), numero: "s" | "p", genero: "m" | "f" }
// solucion: { huecos: [artículo] }     (el, la, los, las · un, una, unos, unas; en MAYÚSCULAS si la letra lo es)
// Reglas: nombre del léxico con su género (reglas.js: articulo(), plural()); sin los femeninos que empiezan por «a»/«ha» (el agua, el hada…);
//         el plural es el de reglas.js y no cambia de tilde ni de forma de otro modo (camión → camiones queda fuera); mitad masculinos y mitad
//         femeninos; con plurales, mitad singular y mitad plural. Sin repetidos. Nombres de 3 a 9 letras.
// Opciones: artículos (el, la · un, una · el, la, los, las · un, una, unos, unas) · letra (minúscula / MAYÚSCULA). Completa: 12; media: 6.
import { registrar } from "../nucleo/tipos.js";
import { TOP, B, T } from "../render/papel.js";
import { articulo, plural } from "../lengua/reglas.js";
import { cuantas, ajusta } from "./_lengua.js";
import { NOMBRES } from "./_palabra.js";

export default registrar({
  id: "palabra.articulo",
  version: 1,
  generar(params, azar, { tamano }) {
    const n = cuantas(tamano, 12), mod = params.articulos || "el", indef = mod === "un" || mod === "unplural", conPl = mod === "plural" || mod === "unplural";
    const bolsa = { m: azar.barajar(NOMBRES.filter((e) => e.g === "m")), f: azar.barajar(NOMBRES.filter((e) => e.g === "f")) };
    const fichas = [];
    for (let i = 0; i < n; i++) fichas.push({ g: i % 2 ? "f" : "m", pl: conPl && i >= n / 2 });
    return {
      enunciado: `Escribe ${indef ? "un, una" + (conPl ? ", unos o unas" : "") : conPl ? "el, la, los o las" : "el o la"} delante de cada nombre.`,
      ejercicios: azar.barajar(fichas).map(({ g, pl }) => {
        const e = bolsa[g].pop();
        if (!e) throw new Error("«palabra.articulo» necesita más nombres en el léxico.");
        const art = articulo(g, { plural: pl, indefinido: indef }), pal = pl ? plural(e.p) : e.p, mayus = params.caso === "mayus";
        return { datos: { palabra: mayus ? pal.toUpperCase() : pal, numero: pl ? "p" : "s", genero: g }, solucion: { huecos: [mayus ? art.toUpperCase() : art] } };
      }),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 2, 6, 10, 8);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i];
      p.marco(x, y, cw, ch, i);
      const fs = ajusta(p, (q) => p.ancho(e.datos.palabra, "PB", q) + 92 + 10, cw - 36, 26, 14);
      p.linea(x + 14, y, cw - 14, ch, [B(92, 40, e.solucion.huecos[0]), T(e.datos.palabra, fs)], 10);
    }));
  },
});
