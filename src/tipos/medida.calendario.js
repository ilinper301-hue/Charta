// medida.calendario · El calendario (port de _m_calendario() del motor).
// datos:    { mes (0–11), anio, st (0 = lunes: día de la semana del 1), nd (días del mes), tipo, texto, ... }  (cada ejercicio repite mes/anio/st/nd: el calendario se dibuja una vez con el primero)
// solucion: { huecos: [respuesta] }
// Opción n: mes (1–12; sin ella, al azar). Año 2026 desde septiembre, 2027 hasta agosto.
// Preguntas: primer «día» del mes · día después · día antes · cuántos «días» hay · una semana después. Solo página completa: 5 ejercicios.
import { registrar } from "../nucleo/tipos.js";
import { TOP, W, M, T, B } from "../render/papel.js";

const DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
const DIAS_PL = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábados", "domingos"];
export const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export default registrar({
  id: "medida.calendario",
  version: 1,
  generar(params, azar) {
    const mes = params.n ? (params.n - 1) % 12 : azar.entero(0, 11), anio = mes >= 8 ? 2026 : 2027;
    const st = (new Date(Date.UTC(anio, mes, 1)).getUTCDay() + 6) % 7, nd = new Date(Date.UTC(anio, mes + 1, 0)).getUTCDate();
    const [a, b] = azar.muestra([0, 1, 2, 3, 4, 5, 6], 2);
    const pri = (k) => 1 + ((((k - st) % 7) + 7) % 7);
    const n1 = azar.entero(3, nd - 2), n2 = azar.entero(3, nd - 2), n3 = azar.entero(1, nd - 7);
    let cnt = 0; for (let d = 1; d <= nd; d++) if ((st + d - 1) % 7 === b) cnt++;
    const qs = [
      ["primero", `¿Qué número tiene el primer ${DIAS[a]}?`, pri(a)],
      ["despues", `El día después del ${n1} es el`, n1 + 1],
      ["antes", `El día antes del ${n2} es el`, n2 - 1],
      ["cuantos", `¿Cuántos ${DIAS_PL[b]} hay este mes?`, cnt],
      ["semana", `Una semana después del ${n3} es el`, n3 + 7],
    ];
    return {
      enunciado: "Mira el calendario y contesta las preguntas.",
      ejercicios: qs.map(([tipo, texto, r]) => ({ datos: { mes, anio, st, nd, tipo, texto }, solucion: { huecos: [r] } })),
    };
  },
  dibujar(p, act) {
    const { mes, anio, st, nd } = act.ejercicios[0].datos, top = TOP, cw7 = 62, chh = 40;
    const gx = M + (W - 2 * M - 7 * cw7) / 2;
    p.marco(M, top - 340, W - 2 * M, 340);
    p.text(W / 2, top - 30, `${MESES[mes][0].toUpperCase()}${MESES[mes].slice(1)} ${anio}`, 18, { f: "PB", anchor: "middle" });
    for (let q = 0; q < 7; q++) p.text(gx + (q + 0.5) * cw7, top - 56, "LMXJVSD"[q], 12, { f: "PB", anchor: "middle" });
    for (let d = 1; d <= nd; d++) {
      const r = Math.floor((st + d - 1) / 7), q = (st + d - 1) % 7, x = gx + q * cw7, y = top - 64 - (r + 1) * chh;
      p.rrect(x, y, cw7, chh, 0, { lw: 1.2 });
      p.text(x + cw7 / 2, y + chh / 2 - 5, String(d), 14, { f: "PB", anchor: "middle" });
    }
    const rh = (top - 350 - M - 4 * 8) / 5;
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const y = top - 350 - (i + 1) * rh - i * 8;
      p.marco(M, y, W - 2 * M, rh);
      p.linea(M, y, W - 2 * M, rh, [T(e.datos.texto, 14, "PM"), B(50, 36, e.solucion.huecos[0])], 12);
    }));
  },
});
