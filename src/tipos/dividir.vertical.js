// dividir.vertical · Divisiones con la caja (3.º, lote 4, bloque 14; solo curso 3, sin rango). Caja española: divisor arriba a la derecha,
// cociente debajo de la raya y los restos parciales bajo el dividendo (con la cifra que se baja al lado: «04»).
// datos:    { D, d }   (dividendo de 2 o 3 cifras; divisor de 2 a 9)
// solucion: { huecos: [cociente, resto] }  · con prueba: [cociente, resto, cociente, divisor, resto, dividendo] (c × d + r = D)
// Opciones: cifras (None = dividendo de 2 cifras · 3 = de 3) · nivel (None = exactas · "resto" = con resto · "mezcla" = alternadas) · prueba (si_no).
// Reglas: cociente ≥ 2 y sin ceros (en 3.º no hay cifras 0 en el cociente); por turnos, la primera cifra del dividendo vale (cociente de n cifras)
// o no vale y se toman dos (cociente de n − 1 cifras); sin repetir la división; ningún divisor más de unas pocas veces.
// Dibujo: rejilla de 3 columnas × 4 filas (12; media 6). El hueco del resto va en la última fila, bajo la última cifra del dividendo;
// los restos parciales se dejan en blanco (en la solución, en rojo). Prueba: «☐ × ☐ + ☐ = ☐» al pie de la tarjeta.
import { registrar } from "../nucleo/tipos.js";
import { TOP, T, B, COLOR_SOLUCION } from "../render/papel.js";
import { POR } from "./_multiplicar.js";

const cifras = (n) => String(n).split("").map(Number);

/** Pasos de la caja: { g0, filas: [{ col, txt }], resto, cociente } — g0 = columna de la última cifra del primer grupo;
 *  filas = restos parciales con la cifra bajada (col = columna donde acaba el número), la última es el resto final. */
export function pasosCaja(D, d) {
  const ds = cifras(D), n = ds.length, g0 = ds[0] >= d ? 0 : 1;
  let cur = Number(ds.slice(0, g0 + 1).join("")), coc = "";
  const filas = [];
  for (let j = g0; j < n; j++) {
    const q = Math.floor(cur / d), r = cur - q * d;
    coc += q;
    if (j < n - 1) { filas.push({ col: j + 1, txt: String(r) + ds[j + 1] }); cur = r * 10 + ds[j + 1]; }
    else filas.push({ col: n - 1, txt: String(r) });
  }
  return { g0, filas, resto: D % d, cociente: Number(coc) };
}

/** Divisiones de n cifras: con resto (con = true) o exactas; cociente ≥ 2 y sin ceros. */
function candidatos(n, con) {
  const out = [];
  for (let D = 10 ** (n - 1); D < 10 ** n; D++) for (let d = 2; d <= 9; d++) {
    const c = Math.floor(D / d), r = D % d;
    if (c >= 2 && !String(c).includes("0") && (r > 0) === con) out.push([D, d]);
  }
  return out;
}

export default registrar({
  id: "dividir.vertical",
  version: 1,
  generar(params, azar, { tamano }) {
    const n = params.cifras === 3 ? 3 : 2, nivel = params.nivel || "exacta", cnt = tamano === "media" ? 6 : 12, prueba = !!params.prueba;
    const bancos = { false: candidatos(n, false), true: candidatos(n, true) };
    const largo = ([D, d]) => cifras(D)[0] >= d;   // la primera cifra vale: cociente de n cifras
    const ps = [], vistos = new Set(), porD = {};
    for (let i = 0; i < cnt; i++) {
      const con = nivel === "resto" || (nivel === "mezcla" && i % 2 === 1), pool = bancos[con];
      const quiereLargo = (nivel === "mezcla" ? Math.floor(i / 2) : i) % 2 === 0;
      const tope = Math.ceil(cnt / 8) + 1;   // 8 divisores posibles
      const libres = pool.filter((q) => !vistos.has(q.join()) && (porD[q[1]] ?? 0) < tope);
      const buenas = libres.filter((q) => largo(q) === quiereLargo);
      const lib = buenas.length ? buenas : libres.length ? libres : pool.filter((q) => !vistos.has(q.join()));
      if (!lib.length) throw new Error("No hay divisiones distintas para esta ficha.");
      const q = azar.elegir(lib); vistos.add(q.join()); porD[q[1]] = (porD[q[1]] ?? 0) + 1; ps.push(q);
    }
    return {
      enunciado: prueba ? "Divide con la caja, escribe el cociente y el resto\ny haz la prueba." : "Divide con la caja y escribe el cociente y el resto.",
      ejercicios: azar.barajar(ps).map(([D, d]) => {
        const c = Math.floor(D / d), r = D % d;
        return { datos: { D, d }, solucion: { huecos: prueba ? [c, r, c, d, r, D] : [c, r] } };
      }),
    };
  },
  dibujar(p, act) {
    const prueba = !!act.params.prueba, es = act.ejercicios;
    const { cel, cw, ch } = p.rejilla(TOP, 3, p.parte < 1 ? 2 : 4);
    // Un mismo tamaño para todas las cajas: crecen (hasta ×1,4) con el sitio que deja la tarjeta más llena; nunca bajan de ×0,8.
    const nMax = Math.max(...es.map((e) => String(e.datos.D).length)), fMax = Math.max(...es.map((e) => pasosCaja(e.datos.D, e.datos.d).filas.length));
    const abajo = 8 + (prueba ? 34 : 0), sitio = ch - 30 - abajo;   // del pie del número de ejercicio al de la tarjeta (o a la prueba)
    const alto1 = Math.max(24 + 30 * fMax, 63), ancho1 = nMax * 16 + 8 + 66;
    const k = Math.max(0.8, Math.min(1.4, sitio / alto1, (cw - 14) / ancho1));
    const sp = 16 * k, fs = 22 * k, anchoDer = 66 * k, lh = 30 * k;
    es.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { D, d } = e.datos, ds = cifras(D), n = ds.length, { filas } = pasosCaja(D, d);
      p.marco(x, y, cw, ch, i);
      const left = x + (cw - (n * sp + 8 * k + anchoDer)) / 2, colC = (j) => left + (j + 0.5) * sp, xv = left + n * sp + 8 * k;
      const base0 = y + abajo + (sitio + alto1 * k) / 2 - fs * 0.85;   // bloque centrado en su sitio (con el alto de la más larga)
      // dividendo, divisor y la caja (raya vertical a la izquierda del divisor y horizontal debajo)
      ds.forEach((c, j) => p.text(colC(j), base0, String(c), fs, { anchor: "middle" }));
      p.text(xv + 10 * k, base0, String(d), fs);
      const yh = base0 - 8 * k;
      p.line(xv, yh, xv, base0 + fs * 0.85, { lw: 1.6 });
      p.line(xv, yh, xv + anchoDer - 4 * k, yh, { lw: 1.6 });
      // cociente (hueco bajo la raya)
      p.caja(xv + 5 * k, yh - 36 * k, anchoDer - 14 * k, 30 * k, null, fs, e.solucion.huecos[0]);
      // restos parciales (en blanco; rojos en la solución) y el resto final en su hueco
      filas.forEach((f, q) => {
        const bk = base0 - (q + 1) * lh;
        if (q === filas.length - 1) p.caja(colC(f.col) - 14 * k, bk + fs * 0.35 - 13 * k, 28 * k, 26 * k, null, fs * 0.9, e.solucion.huecos[1]);
        // «#c62828» = COLOR_SOLUCION en minúsculas: no es un hueco (test_tipos cuenta los fill="#C62828" de los huecos)
        else if (p.solucion) f.txt.split("").forEach((c, j, a) => p.text(colC(f.col - (a.length - 1 - j)), bk, c, fs, { anchor: "middle", gris: COLOR_SOLUCION.toLowerCase() }));
      });
      if (prueba) {
        const [, , c, dv, r, DD] = e.solucion.huecos;
        p.linea(x, y + 6, cw, 30, [B(40, 26, c), T(POR, 15), B(24, 26, dv), T("+", 15), B(24, 26, r), T("=", 15), B(46, 26, DD)], 5);
      }
    }));
  },
});
