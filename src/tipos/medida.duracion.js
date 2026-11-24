// medida.duracion · ¿Cuánto dura? (3.º, lote 6, bloque 10; solo curso 3, sin rango).
// datos:    { h, m (hora de inicio, 1:00–11:55), d (minutos que dura), tarea: "dura" | "fin" }   (siempre entre las 12:00 y las 12:00 sin pasar de las 11:59: sin a. m. ni p. m.)
// solucion: dura → { huecos: [horas, minutos] } («de las 9:15 a las 10:40 → 1 h 25 min») · fin → { huecos: [h, "mm"] } («empieza a las 9:15 y dura 1 h 25 min → 10:40»)
// Opciones: tarea (None = ¿cuánto dura? · "fin" = ¿a qué hora termina? · "mezcla" = mitad y mitad) · paso (None = los minutos de 5 en 5 · 15 = cuartos de hora · 1 = de 1 en 1).
// Duración entre 15 min y 3 h 55 min, siempre con minutos distintos de 0 en al menos la mitad. Sin repetir (inicio, duración).
// Rejilla elástica de 1 columna con «Cantidad»: «Más grandes» = 8 y 4; «Más ejercicios» = las filas que caben con tarjetas ≥ 54 pt.
import { registrar } from "../nucleo/tipos.js";
import { T, B } from "../render/papel.js";
import { cuantos, pintarEl, MIN_OP } from "./_elastica.js";

const hm = (h, m) => `${h}:${String(m).padStart(2, "0")}`;
const dura = (d) => (d >= 60 ? `${Math.floor(d / 60)} h${d % 60 ? ` ${d % 60} min` : ""}` : `${d} min`);

export default registrar({
  id: "medida.duracion",
  version: 1,
  cantidad: true,
  generar(params, azar, ctx) {
    const paso = params.paso ?? 5, tarea = params.tarea ?? null, cnt = cuantos(ctx, 1, MIN_OP, [8, 4]);
    const vistos = new Set(), ejercicios = [];
    for (let i = 0; i < cnt; i++) {
      let h, m, d, ok = false;
      for (let k = 0; k < 5000 && !ok; k++) {
        h = azar.entero(1, 10); m = paso * azar.entero(0, Math.floor(59 / paso)); d = paso * azar.entero(Math.ceil(15 / paso), Math.floor(235 / paso));
        const fin = h * 60 + m + d;
        ok = fin <= 11 * 60 + 59 && !vistos.has(`${h}:${m}:${d}`) && (d % 60 !== 0 || i % 2 === 0);
      }
      if (!ok) throw new Error("No hay duraciones distintas suficientes.");
      vistos.add(`${h}:${m}:${d}`);
      const t = tarea === "mezcla" ? (i % 2 ? "fin" : "dura") : (tarea ?? "dura"), fin = h * 60 + m + d;
      ejercicios.push({ datos: { h, m, d, tarea: t }, solucion: { huecos: t === "dura" ? [Math.floor(d / 60), d % 60] : [Math.floor(fin / 60), String(fin % 60).padStart(2, "0")] } });
    }
    return {
      enunciado: tarea === "fin" ? "Calcula a qué hora termina y escríbela."
        : tarea === "mezcla" ? "Calcula cuánto dura o a qué hora termina."
        : "Calcula cuánto dura cada actividad. Escribe las horas y los minutos.",
      ejercicios,
    };
  },
  dibujar(p, act) {
    const es = act.ejercicios;
    const items = (e) => {
      const { h, m, d, tarea } = e.datos, [a, b] = e.solucion.huecos, fin = h * 60 + m + d;
      if (tarea === "dura") return [T(`De las ${hm(h, m)} a las ${hm(Math.floor(fin / 60), fin % 60)}:`, 17), B(44, 38, a), T("h", 17), B(48, 38, b), T("min", 17)];
      return [T(`Empieza a las ${hm(h, m)} y dura ${dura(d)}. Termina a las`, 17), B(44, 38, a), T(":", 19), B(48, 38, b)];
    };
    pintarEl(p, 1, es.map(items), es.map((e) => e.id), es.length, 8, 8, 1.15);
  },
});
