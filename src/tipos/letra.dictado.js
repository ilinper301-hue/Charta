// letra.dictado · Escucho y rodeo (Lengua 1.º, bloque 2; petición de Iván 26-11-2026, ficha de discriminación auditiva y visual).
// La maestra dice una letra en cada fila y el alumno la rodea entre las del grupo (b d p q t…, que se confunden).
// datos:    { fila: [las letras del grupo, cada una una vez, en otro orden] }
// solucion: { huecos: [], rodea: [posición de la letra dictada], letra: "d" }   (la letra dictada solo está en la solución: en pantalla, rodeada en rojo)
// Opciones: grupo (b d p q t / b d p q / m n ñ u / vocales) · caso (minúscula / MAYÚSCULA).
// Con letras elegidas (vistas.js): solo las del grupo que estén elegidas (al menos 2).
// Las letras dictadas se reparten por igual (rondas del grupo barajado) y nunca la misma dos filas seguidas.
// Cantidad: 2 columnas; «Más grandes» 20 filas (media: 10), «Más ejercicios» las que caben con tarjetas ≥ 40 pt. Filas distintas.
import { registrar } from "../nucleo/tipos.js";
import { TOP, cuantosRejilla } from "../render/papel.js";
import { permitida, avisoVistas } from "../lengua/vistas.js";
import { rodear } from "../lengua/dibujo.js";
import { ajusta } from "./_lengua.js";

export const GRUPOS = { bdpqt: "bdpqt", bdpq: "bdpq", mnu: "mnñu", vocales: "aeiou" };
const MIN_ALTO = 40;

export default registrar({
  id: "letra.dictado",
  version: 1,
  cantidad: true,
  generar(params, azar, ctx) {
    const n = cuantosRejilla(ctx, 2, MIN_ALTO, [20, 10]), mayus = params.caso === "mayus", fmt = (c) => (mayus ? c.toUpperCase() : c);
    const grupo = [...GRUPOS[params.grupo || "bdpqt"]].filter((l) => permitida(l));
    if (grupo.length < 2) throw new Error("«letra.dictado» necesita al menos dos letras del grupo entre las elegidas." + avisoVistas());
    const dictadas = [];
    while (dictadas.length < n) {
      const ronda = azar.barajar([...grupo]);
      if (ronda[0] === dictadas.at(-1)) ronda.push(ronda.shift());
      dictadas.push(...ronda);
    }
    const perms = (l) => (l.length < 2 ? [l] : l.flatMap((c, i) => perms([...l.slice(0, i), ...l.slice(i + 1)]).map((r) => [c, ...r])));
    let libres = azar.barajar(perms(grupo));   // todas las filas posibles (≤ 120): sin repetir mientras haya
    const ejercicios = dictadas.slice(0, n).map((letra) => {
      if (!libres.length) libres = azar.barajar(perms(grupo));   // pocas letras elegidas: se repiten
      const fila = libres.pop();
      return { datos: { fila: fila.map(fmt) }, solucion: { huecos: [], rodea: [fila.indexOf(letra)], letra: fmt(letra) } };
    });
    return { enunciado: "Escucha el sonido y rodea la letra que has oído.", ejercicios };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.rejilla(TOP, 2, Math.ceil(act.ejercicios.length / 2)), rel = 0.3;
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], w = cw - 32 - 8, fila = e.datos.fila;
      p.marco(x, y, cw, ch, i);
      const gap = (q) => q * 0.9;
      const fs = ajusta(p, (q) => fila.reduce((t, l) => t + p.ancho(l, "PB", q) + q * 2 * rel, 0) + gap(q) * (fila.length - 1), w, Math.min(28, ch * 0.5), 10);
      rodear(p, x + 32, y, w, ch, fila, e.solucion.rodea, { fs, gap: gap(fs), relleno: rel });
    }));
  },
});
