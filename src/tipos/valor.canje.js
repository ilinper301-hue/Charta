// valor.canje · Los canjes: cambiar unidades por decenas (port de _v_canje() y _nums_du() del motor).
// datos:    { n }   (n unidades; 10..min(R, 99))
// solucion: { huecos: [decenas, unidades] }
// Opciones: nivel null (2 decenas completas + el resto con unidades) | "completas" (solo decenas completas, pueden repetirse si hay pocas).
// Rango mínimo 20 (error «necesita»). Completa: 8 filas; media: 4.
// 2.º (rango > 100, tres cifras): datos { forma, n, centenas: true }, con tres formas barajadas (completa: 5 «dc» + 2 «cd» + 1 «cu»; media: 2 + 1 + 1):
//   "dc": «n decenas = ▢ C y ▢ D»  (n = 11..99 sin múltiplos de 10; con nivel "completas", solo 10, 20…90)   solucion { huecos: [n÷10, n mod 10] }
//   "cd": «n C = ▢ D»              (n = 1..9)                                                              solucion { huecos: [n·10] }
//   "cu": «n C = ▢ U»              (n = 1..9)                                                              solucion { huecos: [n·100] }
//   Sin repetir dentro de cada forma. Cuadros más anchos (hasta 900).
// 3.º (rango > 1000): datos { forma, n, millares: true }, mismas tres formas un nivel más arriba (dc: «n C = ▢ UM y ▢ C», cd: «n UM = ▢ C», cu: «n UM = ▢ U»). Con rango 1000 sale el de 2.º (hasta 999).
// Ayudantes compartidos con los demás tipos de «valor»: muestra(), numsDU(), numsCDU().
import { registrar } from "../nucleo/tipos.js";
import { TOP, M, W, T, B } from "../render/papel.js";

/** _muestra(): k elementos distintos del pool; si no llegan, completa repitiendo al azar. */
export function muestra(pool, k, azar) {
  const out = azar.barajar(pool).slice(0, k);
  while (out.length < k) out.push(azar.elegir(pool));
  return out;
}

/** _nums_du(): cnt números de 10..min(R, 99): decenas completas («completas») o 2 completas + el resto con unidades. */
export function numsDU(cnt, R, azar, nivel) {
  const cap = Math.min(R, 99), mult = [], rest = [];
  for (let v = 10; v <= cap; v += 10) mult.push(v);
  for (let v = 11; v <= cap; v++) if (v % 10) rest.push(v);
  if (nivel === "completas" || nivel === "ceros") return muestra(mult, cnt, azar);
  return azar.barajar([...muestra(mult, Math.min(2, cnt), azar), ...muestra(rest, cnt - 2, azar)]);
}

/** 2.º: cnt números de 100..R (R > 100). null = sin ceros en D ni en U (345); «completas» = la mitad (redondeando arriba) con algún cero (305, 340, 300) y el resto sin ceros. */
export function numsCDU(cnt, R, azar, nivel) {
  const con = [], sin = [];
  for (let v = 100; v <= Math.min(R, 999); v++) (v % 10 === 0 || Math.floor(v / 10) % 10 === 0 ? con : sin).push(v);   // con rango 1000 (repaso de 2.º), hasta 999
  if (nivel !== "completas") return muestra(sin, cnt, azar);
  const k = Math.ceil(cnt / 2);
  return azar.barajar([...muestra(con, k, azar), ...muestra(sin, cnt - k, azar)]);
}

/** 3.º (rango > 1000): cnt números de 1000..R: null = sin ceros en C, D ni U (4352); «completas» = la mitad (redondeando arriba) con algún cero (4302, 4350, 4000). */
export function numsUMCDU(cnt, R, azar, nivel) {
  const con = [], sin = [];
  for (let v = 1000; v <= R; v++) (v % 10 === 0 || Math.floor(v / 10) % 10 === 0 || Math.floor(v / 100) % 10 === 0 ? con : sin).push(v);
  if (nivel !== "completas") return muestra(sin, cnt, azar);
  const k = Math.ceil(cnt / 2);
  return azar.barajar([...muestra(con, k, azar), ...muestra(sin, cnt - k, azar)]);
}

export default registrar({
  id: "valor.canje",
  version: 1,
  generar(params, azar, { tamano }) {
    const R = params.rango ?? 20, cnt = tamano === "media" ? 4 : 8;
    if (Math.min(R, 99) < 20) throw new Error("Los canjes necesitan un rango máximo de al menos 20.");
    if (R > 1000) {   // 3.º: un nivel más (UM, C, D): «n C = ▢ UM y ▢ C», «n UM = ▢ C», «n UM = ▢ U»
      const [a, b, c] = tamano === "media" ? [2, 1, 1] : [5, 2, 1], pool = [], uno = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      for (let v = params.nivel === "completas" ? 10 : 11; v <= 99; v += params.nivel === "completas" ? 10 : 1) if (params.nivel === "completas" || v % 10) pool.push(v);
      return {
        enunciado: "Cambia centenas y millares: escribe cuántos millares, centenas o unidades son.",
        ejercicios: azar.barajar([
          ...muestra(pool, a, azar).map((n) => ({ forma: "dc", n, h: [Math.floor(n / 10), n % 10] })),
          ...muestra(uno, b, azar).map((n) => ({ forma: "cd", n, h: [n * 10] })),
          ...muestra(uno, c, azar).map((n) => ({ forma: "cu", n, h: [n * 1000] })),
        ]).map(({ forma, n, h }) => ({ datos: { forma, n, millares: true }, solucion: { huecos: h } })),
      };
    }
    if (R > 100) {
      const [a, b, c] = tamano === "media" ? [2, 1, 1] : [5, 2, 1], pool = [];
      for (let v = params.nivel === "completas" ? 10 : 11; v <= 99; v += params.nivel === "completas" ? 10 : 1) if (params.nivel === "completas" || v % 10) pool.push(v);
      const uno = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      return {
        enunciado: "Cambia decenas y centenas: escribe cuántas centenas, decenas o unidades son.",
        ejercicios: azar.barajar([
          ...muestra(pool, a, azar).map((n) => ({ forma: "dc", n, h: [Math.floor(n / 10), n % 10] })),
          ...muestra(uno, b, azar).map((n) => ({ forma: "cd", n, h: [n * 10] })),
          ...muestra(uno, c, azar).map((n) => ({ forma: "cu", n, h: [n * 100] })),
        ]).map(({ forma, n, h }) => ({ datos: { forma, n, centenas: true }, solucion: { huecos: h } })),
      };
    }
    return {
      enunciado: "Cambia las unidades por decenas y escribe cuántas decenas y unidades son.",
      ejercicios: numsDU(cnt, R, azar, params.nivel).map((n) => ({ datos: { n }, solucion: { huecos: [Math.floor(n / 10), n % 10] } })),
    };
  },
  dibujar(p, act) {
    const rows = 8, GY = 8, rh = (TOP - M - (rows - 1) * GY) / rows;
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const { n, forma } = e.datos, y = TOP - (i + 1) * rh - i * GY, [d, u] = e.solucion.huecos;
      p.marco(M, y, W - 2 * M, rh);
      if (e.datos.millares) {
        const it = forma === "dc" ? [T(`${n} centenas`, 17), T("=", 17), B(52, 38, d), T("UM", 13, "PM"), T("y", 13, "PM"), B(44, 38, u), T("C", 13, "PM")]
          : [T(`${n} UM`, 17), T("=", 17), B(66, 38, d), T(forma === "cd" ? "C" : "U", 13, "PM")];
        p.linea(M, y, W - 2 * M, rh, it, 12);
        return;
      }
      if (e.datos.centenas) {
        const it = forma === "dc" ? [T(`${n} decenas`, 17), T("=", 17), B(56, 38, d), T("C", 13, "PM"), T("y", 13, "PM"), B(44, 38, u), T("D", 13, "PM")]
          : [T(`${n} C`, 17), T("=", 17), B(60, 38, d), T(forma === "cd" ? "D" : "U", 13, "PM")];
        p.linea(M, y, W - 2 * M, rh, it, 12);
        return;
      }
      p.linea(M, y, W - 2 * M, rh, [T(`${n} unidades`, 17), T("=", 17), B(44, 38, d), T("decena(s)", 13, "PM"), T("y", 13, "PM"),
        B(44, 38, u), T("unidad(es)", 13, "PM")], 12);
    }));
  },
});
