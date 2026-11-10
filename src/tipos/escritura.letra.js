// escritura.letra · Repasa y escribe la letra (Lengua 1.º, lote 4; LENGUA_1.md §3, bloque 8).
// datos:    { letra: "a", texto: "Aa", forma: "sueltas" | "juntas", repaso: 2, libres: 3 }
//           (cada ejercicio es un bloque: 1 renglón de modelo en negro con punto verde de inicio (y flechas numeradas solo si el cuerpo mide ≥ 12 mm:
//            escribirTrazos lo decide; a 5 mm no hay flechas), `repaso` renglones de repaso (gris o punteado) y `libres` renglones en blanco)
// solucion: { huecos: [] }   no hay corrección (el modelo está en la hoja)
// Reglas: una letra por ficha (a elegir o al azar): completa 2 bloques (letras «sueltas» y «juntas»), media 1 (sueltas). «Las letras de una palabra»: una palabra del
//         léxico de 3 a 6 letras con 4 letras distintas (completa) o 2 (media); un bloque por cada una de las primeras letras distintas.
//         «Las dos» escribe la pareja «Aa». Filas de repaso: las pedidas (1–3, por defecto 2); si no caben (4 bloques de la palabra en 5 mm) se reducen
//         hasta floor(renglones / bloques) − 2 (1 modelo y al menos 1 libre). Los renglones libres llenan el resto de la página (filasDe).
// Opciones: letra (al azar / a–z, ñ / las de una palabra) · mayúscula o minúscula (minúscula / MAYÚSCULA / las dos) · repaso (gris / punteado) · filas de repaso (2 / 1 / 3) · pauta.
import { registrar } from "../nucleo/tipos.js";
import { cuantas, elegirPalabras } from "./_lengua.js";
import { sinTildes } from "../lengua/reglas.js";
import { contexto, recortar, repartirLibres, filasDe, mmDe, repetir } from "./_escritura.js";
import { renglones } from "../lengua/pauta.js";
import { vistasActivas, letrasActivas } from "../lengua/vistas.js";

export const LETRAS_ESCRITURA = [..."abcdefghijklmnñopqrstuvwxyz"];
/** Texto del modelo de una letra según «mayúscula o minúscula». */
export const textoLetra = (l, caso) => (caso === "mayus" ? l.toUpperCase() : caso === "ambas" ? l.toUpperCase() + l : l);

export default registrar({
  id: "escritura.letra",
  version: 1,
  generar(params, azar, { tamano }) {
    const mm = mmDe(params), N = filasDe(tamano, mm), pedidas = params.filas ?? 2, caso = params.caso || null;
    let letras, formas, enunciado;
    if (params.letra === "palabra") {
      const B = cuantas(tamano, 4);
      const distintas = (w) => [...new Set([...sinTildes(w)])];
      const [{ p: pal }] = elegirPalabras(azar, 1, {}, [2, 3], { extra: { minLetras: 3, maxLetras: 6 }, ok: (e) => distintas(e.p).length >= B, id: "escritura.letra" });
      letras = distintas(pal).slice(0, B); formas = Array(B).fill("sueltas");
      enunciado = `Repasa las letras de «${pal}»\ny escríbelas en los renglones.`;
    } else {
      const l = params.letra || azar.elegir(vistasActivas() ? letrasActivas() : LETRAS_ESCRITURA);
      letras = tamano === "media" ? [l] : [l, l]; formas = tamano === "media" ? ["sueltas"] : ["sueltas", "juntas"];
      enunciado = caso === "ambas" ? `Repasa la letra «${l.toUpperCase()}${l}»\ny escríbela en los renglones.` : `Repasa la letra «${textoLetra(l, caso)}»\ny escríbela en los renglones.`;
    }
    const B = letras.length, repaso = Math.max(0, Math.min(pedidas, Math.floor(N / B) - 2));
    const libres = repartirLibres(N, Array(B).fill(1 + repaso));
    return {
      enunciado,
      ejercicios: letras.map((l, i) => ({ datos: { letra: l, texto: textoLetra(l, caso), forma: formas[i], repaso, libres: libres[i] }, solucion: { huecos: [] } })),
    };
  },
  dibujar(p, act) {
    const ctx = contexto(p, act), { c, paso, x0, x1 } = ctx, es = act.ejercicios, estilo = act.params.repaso === "punteado" ? "punteado" : "repaso";
    const libres = recortar(es.map((e) => e.datos.libres), es.map((e) => 1 + e.datos.repaso), ctx.caben);
    let y = ctx.yTop;
    es.forEach((e, i) => p.ejercicio(e.id, () => {
      const { texto, forma, repaso } = e.datos, n = 1 + repaso + libres[i], { bases } = renglones(p, x0, x1, y, n, { mm: ctx.mm }), sep = forma === "juntas" ? 0.45 : 1.6;
      repetir(p, texto, x0 + 0.6 * c, x1, bases[0], c, "modelo", { sep });
      for (let r = 1; r <= repaso; r++) repetir(p, texto, x0 + 0.6 * c, x1, bases[r], c, estilo, { sep });
      y -= n * paso;
    }));
  },
});
