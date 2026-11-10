// medida.precios · Las compras (port de _m_precios() y _etiqueta() del motor).
// datos:    total → { a: [nombre, precio], b: [nombre, precio] } · cambio → { nom, precio, pago }
// solucion: { huecos: [a + b] } o { huecos: [pago − precio] }
// Opciones: modo null (total de la compra) | "cambio" (la vuelta de un billete de 5, 10 o 20 €); rango 10 | 20 (tope de la suma / billete).
// 2.º (rango 100): productos más caros (hasta 60 €), total hasta 100 € y billetes de 20, 50 y 100 €.
// Completa: 10 tarjetas (2 × 5); media: 4 (2 filas).
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B } from "../render/papel.js";
import { itemDinero } from "./medida.dinero.js";

/** 2.º (lote 3, rango 100): precios en euros enteros hasta 100 €; la vuelta de billetes de 20, 50 y 100 €. */
const PRODUCTOS_2 = { estuche: [5, 12], camiseta: [8, 16], muñeca: [10, 20], libro: [9, 18], balón: [12, 25], "juego de mesa": [15, 30], mochila: [18, 35], zapatillas: [25, 45], patinete: [35, 60], cometa: [6, 14] };
const PRODUCTOS = { "lápiz": [1, 3], goma: [1, 2], sacapuntas: [1, 2], regla: [2, 3], pegamento: [2, 4], cuaderno: [3, 5], pelota: [4, 8], libro: [5, 9], mochila: [8, 12] };

/** _etiqueta(): rótulo con el nombre y el precio. */
function etiqueta(p, x, y, nom, precio, w = 104, h = 50) {
  p.rrect(x, y, w, h, 8, { lw: 1.5 });
  p.text(x + w / 2, y + h - 18, nom, 12, { f: "PM", anchor: "middle" });
  p.text(x + w / 2, y + 9, `${precio} €`, 16, { f: "PB", anchor: "middle" });
}

export default registrar({
  id: "medida.precios",
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 20;
    if (R < 10) throw new Error("Este modelo necesita un rango máximo de al menos 10.");
    const dos = R > 20, P = dos ? PRODUCTOS_2 : PRODUCTOS, pagos = dos ? [20, 50, 100] : [5, 10, 20];
    const cap = dos ? R : Math.min(R, 20), cambio = params.modo === "cambio", cnt = tamano === "media" ? 4 : 10, nombres = Object.keys(P), ejercicios = [];
    for (let i = 0; i < cnt; i++) {
      if (cambio) {
        const pago = azar.elegir(pagos.filter((v) => v <= cap));
        const nom = azar.elegir(nombres.filter((k) => P[k][0] < pago)), [lo, hi] = P[nom];
        const precio = azar.entero(lo, Math.min(hi, pago - 1));
        ejercicios.push({ datos: { nom, precio, pago }, solucion: { huecos: [pago - precio] } });
      } else {
        let a, b, pa, pb, ok = false;
        for (let k = 0; k < 2000 && !ok; k++) {
          [a, b] = azar.muestra(nombres, 2); pa = azar.entero(...P[a]); pb = azar.entero(...P[b]);
          ok = pa + pb <= cap;
        }
        if (!ok) throw new Error("Este modelo necesita un rango máximo mayor.");
        ejercicios.push({ datos: { a: [a, pa], b: [b, pb] }, solucion: { huecos: [pa + pb] } });
      }
    }
    return { enunciado: cambio ? "Calcula cuánto dinero te devuelven y escríbelo." : "Calcula cuánto cuesta lo que compras y escribe el total.", ejercicios };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 2, 5);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], d = e.datos, sol = e.solucion.huecos[0];
      p.marco(x, y, cw, ch, i);
      if (d.pago !== undefined) {
        etiqueta(p, x + 26, y + ch - 66, d.nom, d.precio);
        p.text(x + 142, y + ch - 36, "Pago con", 12, { f: "PM" });
        itemDinero(p, "b", d.pago, x + 195, y + ch - 56, "€");
        p.linea(x, y + 8, cw, 40, [T("Me devuelven", 13, "PM"), B(46, 34, sol), T("€", 14, "PM")], 8);
      } else {
        etiqueta(p, x + 20, y + ch - 66, d.a[0], d.a[1]);
        etiqueta(p, x + cw - 124, y + ch - 66, d.b[0], d.b[1]);
        p.text(x + cw / 2, y + ch - 50, "+", 22, { f: "PB", anchor: "middle" });
        p.linea(x, y + 8, cw, 40, [T("Cuesta en total", 13, "PM"), B(46, 34, sol), T("€", 14, "PM")], 8);
      }
    }));
  },
});
