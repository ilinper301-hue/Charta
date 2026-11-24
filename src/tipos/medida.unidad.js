// medida.unidad · ¿Qué unidad usarías? (3.º, lote 6, bloque 10; solo curso 3, sin rango).
// datos:    { objeto, unidades: ["km", "m", "cm", "mm"] | ["kg", "g"] | ["l", "ml"], mag }
// solucion: { huecos: [], unidad } (se rodea la unidad; en la solución, en rojo)
// Opción magnitud: None = longitud, masa y capacidad por turnos · "longitud" (km, m, cm, mm) · "masa" (kg, g) · "capacidad" (l, ml).
// Cada unidad sale el mismo número de veces (±1) y ningún objeto se repite. Objetos sin duda posible para un niño de 3.º.
// Rejilla elástica de 2 columnas con «Cantidad»: «Más grandes» = 12 y 6; «Más ejercicios» = las filas que caben con tarjetas ≥ 62 pt, sin pasar del banco.
import { registrar } from "../nucleo/tipos.js";
import { TOP, cuantosRejilla } from "../render/papel.js";
import { chips } from "./medida.tiempo.js";

export const UNIDADES_3 = {
  longitud: { km: ["La distancia de Sevilla a Madrid", "Un viaje en coche a otra ciudad", "La vuelta ciclista a España", "La carrera de un maratón", "La distancia de la Tierra a la Luna"],
              m: ["El largo del patio", "La altura de una casa", "El largo de una piscina", "El largo de un autobús", "La altura de un árbol", "El ancho de la clase"],
              cm: ["El largo de un lápiz", "El ancho de tu mano", "El largo de una goma", "La altura de un vaso", "El largo de tu pie", "El ancho de un libro"],
              mm: ["El grosor de una moneda", "El largo de una hormiga", "El grosor de una hoja de papel", "El largo de un grano de arroz", "El grosor de una uña"] },
  masa: { kg: ["Una sandía", "Una mochila llena", "Un saco de patatas", "Un perro grande", "Un niño de tu edad", "Un melón"],
          g: ["Una moneda", "Un lápiz", "Una goma", "Una cuchara", "Una pluma", "Un sacapuntas"] },
  capacidad: { l: ["Una garrafa de agua", "Una bañera", "Un cubo de fregar", "El depósito de un coche", "Una botella grande de refresco", "Un acuario"],
               ml: ["Una cucharada de jarabe", "Un yogur", "Un vaso de zumo", "Una gota de colonia", "Una cucharilla de café", "Un frasco de perfume"] },
};
const MAGS = ["longitud", "masa", "capacidad"];
const ROJO = "#C62828", MIN_ALTO = 62;

export default registrar({
  id: "medida.unidad",
  version: 1,
  cantidad: true,
  generar(params, azar, ctx) {
    const mags = params.magnitud ? [params.magnitud] : MAGS;
    // una cola de objetos por unidad; el orden de turnos reparte las magnitudes y las unidades
    const colas = [];
    const maxU = Math.max(...mags.map((m) => Object.keys(UNIDADES_3[m]).length));
    for (let u = 0; u < maxU; u++) for (const m of mags) {
      const us = Object.keys(UNIDADES_3[m]);
      if (u < us.length) colas.push({ mag: m, unidad: us[u], objetos: azar.barajar(UNIDADES_3[m][us[u]]) });
    }
    const banco = colas.reduce((t, c) => t + c.objetos.length, 0);
    const cnt = Math.min(cuantosRejilla(ctx, 2, MIN_ALTO, [12, 6]), Math.floor(banco / 2) * 2), sel = [];
    for (let i = 0; sel.length < cnt; i++) {
      const c = colas[i % colas.length];
      if (c.objetos.length) sel.push({ objeto: c.objetos.shift(), unidad: c.unidad, mag: c.mag });
    }
    return {
      enunciado: "¿Qué unidad usarías para medirlo? Rodéala.",
      ejercicios: azar.barajar(sel).map(({ objeto, unidad, mag }) => ({ datos: { objeto, unidades: Object.keys(UNIDADES_3[mag]), mag }, solucion: { huecos: [], unidad } })),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.rejilla(TOP, 2, Math.ceil(act.ejercicios.length / 2));
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { objeto, unidades } = e.datos;
      p.marco(x, y, cw, ch, i);
      let fs = 13; while (p.ancho(objeto, "PM", fs) > cw - 84 && fs > 9.5) fs -= 0.5;
      p.text(x + cw / 2, y + ch - 18 - fs * 0.33, objeto, fs, { f: "PM", anchor: "middle" });
      const pos = chips(p, x + cw / 2, y + 10, unidades, 14, 26, 8);
      if (p.solucion) { const [cx, w] = pos[unidades.indexOf(e.solucion.unidad)]; p.rrect(cx - 3, y + 7, w + 6, 32, 12, { lw: 1.6, stroke: ROJO }); }
    }));
  },
});
