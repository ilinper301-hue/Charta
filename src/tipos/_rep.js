// Charta · fábrica de los tipos «rep.*» (una representación del número: leer y dibujar).
// Port de ficha_rep() + pick() + tercios() del motor. NO es un tipo: cada rep.<nombre>.js la llama una vez.
// datos:    leer    → { rep, n, accion: "leer" }      solucion { huecos: [n] }   (cuadrito gris arriba a la derecha)
//           dibujar → { rep, n, accion: "dibujar" }   solucion { huecos: [] }    (el alumno dibuja en la plantilla)
// Completa: 9 de leer + 3 de dibujar (4 filas × 3), o 12 de leer con «lectura». Media: 3 + 3, o 6 de leer.
// Las celdas son las de siempre (4 filas); en media solo se dibujan las dos primeras.
// 2.º (rango > 100): `datos.centenas`; 3.º (rango > 1000): también `datos.millares` (hueco para 4 cifras; en la recta,
// un tercio de centenas exactas y otro de decenas exactas, para los tramos de 100 en 100 y de 10 en 10).
import { registrar } from "../nucleo/tipos.js";
import { TOP_REP } from "../render/papel.js";
import { RANGOS, maximo } from "../rep/index.js";

/** Tres tercios consecutivos de lo..hi (como tercios() del motor). */
export function tercios(lo, hi) {
  const span = []; for (let v = lo; v <= hi; v++) span.push(v);
  const k = span.length, a = Math.floor(k / 3), b = Math.floor(2 * k / 3);
  return [span.slice(0, a), span.slice(a, b), span.slice(b)];
}

/** pick() del motor: nread números para leer (repartidos por tercios) y, si ndraw > 0, uno por tercio para dibujar. */
export function pick(lo, hi, azar, nread = 9, ndraw = 3) {
  const th = tercios(lo, hi), per = Math.floor(nread / 3);
  let leer = [];
  for (const t of th) leer = leer.concat(azar.muestra(t, Math.min(per, t.length)));
  while (leer.length < nread) leer.push(azar.entero(lo, hi));
  leer = azar.barajar(leer);
  const dib = [];
  for (const t of ndraw <= 3 ? th.slice(0, ndraw) : th) {
    const cand = t.filter((x) => !leer.includes(x));
    dib.push(azar.elegir(cand.length ? cand : t));
  }
  return [leer, azar.barajar(dib)];
}

/** 3.º · recta con millares: de cada tres números, uno pasa a centena exacta y otro a decena exacta (sin repetir ni salir de 1..hi). */
export function redondearRecta(leer, dib, hi) {
  const usados = new Set(), todos = [...leer, ...dib].map((n, k) => {
    const g = k % 3 === 0 ? 100 : k % 3 === 1 ? 10 : 1;
    let v = Math.min(Math.max(Math.round(n / g) * g, g), Math.floor(hi / g) * g);
    while (usados.has(v)) v = v + g <= hi ? v + g : v - g;
    usados.add(v);
    return v;
  });
  return [todos.slice(0, leer.length), todos.slice(leer.length)];
}

/** Crea y registra el tipo rep.<nombre>. */
export function tipoRep(nombre, version = 1) {
  const [lo] = RANGOS[nombre];
  return registrar({
    id: `rep.${nombre}`,
    version,
    generar(params, azar, { tamano }) {
      const R = params.rango ?? 10, lectura = !!params.lectura, completa = tamano !== "media";
      const hi = maximo(nombre, R), cen = R > 100, mil = R > 1000;
      if (hi < lo) throw new Error(`Esta representación necesita un rango máximo mayor (máx. ${R}).`);
      const nread = completa ? (lectura ? 12 : 9) : (lectura ? 6 : 3), ndraw = lectura ? 0 : 3;
      let [leer, dib] = pick(lo, hi, azar, nread, ndraw);
      if (mil && nombre === "recta") [leer, dib] = redondearRecta(leer, dib, hi);
      const marca = { ...(cen ? { centenas: true } : {}), ...(mil ? { millares: true } : {}) };
      return {
        enunciado: "Escribe en el cuadrito el número que representa cada casilla." +
          (lectura ? "" : "\nEn la última fila te toca a ti: haz lo que dice cada casilla."),
        ejercicios: [
          ...leer.map((n) => ({ datos: { rep: nombre, n, accion: "leer", ...marca }, solucion: { huecos: [n] } })),
          ...dib.map((n) => ({ datos: { rep: nombre, n, accion: "dibujar", ...marca }, solucion: { huecos: [] } })),
        ],
      };
    },
    dibujar(p, act) {
      const es = act.ejercicios, { cel, cw, ch } = p.celdas(TOP_REP, 3, 4, 10, 10);
      es.forEach((e, idx) => p.ejercicio(e.id, () => {
        const [x, y] = cel[idx], { n } = e.datos, centenas = !!e.datos.centenas, millares = !!e.datos.millares, gx = x + cw / 2, gy = y + ch * 0.40;
        if (e.datos.accion === "leer") {
          p.marco(x, y, cw, ch, idx);
          if (millares) p.caja(x + cw - 9 - 58, y + ch - 9 - 30, 58, 30, null, 18, e.solucion.huecos[0]);   // hueco para 4 cifras
          else if (centenas) p.caja(x + cw - 9 - 46, y + ch - 9 - 30, 46, 30, null, 18, e.solucion.huecos[0]);   // hueco más ancho: hasta 3 cifras
          else p.cuadrito(x, y, cw, ch, 30, e.solucion.huecos[0]);
          p.rep(nombre, n, gx, gy, { i: idx, centenas, millares });
        } else {
          p.marco(x, y, cw, ch);
          p.text(x + 14, y + ch - 20, "DIBUJA", 8.5, { f: "PM", gris: 0.3 });
          p.text(x + cw - 16, y + ch - 36, String(n), 28, { f: "PB", anchor: "end" });
          p.plantilla(nombre, n, gx, gy, { i: idx, centenas, millares });
        }
      }));
    },
  });
}
