// Charta · ayudantes de la familia «fono» (Lengua 1.º, lote 2). Sin DOM.
// elegirIdx: como elegirPalabras de _lengua.js, pero la prueba de cada palabra conoce el número de ejercicio (i): sirve cuando cada ejercicio
// tiene un objetivo distinto (p. ej. «la letra va al principio / en medio / al final»).
import { candidatas } from "./_lengua.js";
import { avisoVistas } from "../lengua/vistas.js";

/** Barajado equilibrado: n objetivos repartidos a partes iguales entre `valores` (los que sobran, al azar). */
export function repartir(azar, n, valores) {
  const l = Array.from({ length: n }, (_, i) => valores[i % valores.length]);
  return azar.barajar(l);
}

/**
 * Elige n palabras distintas siguiendo la secuencia de largos; intento(entrada, i, azar) → algo verdadero (sus datos) o falso.
 * Devuelve [{ e, r, p }] en el orden de los ejercicios. Si no hay bastantes, error con «necesita».
 */
export function elegirIdx(azar, n, params, largos, intento, { extra = {}, id = "este modelo" } = {}) {
  const bolsas = {};
  for (const l of new Set(largos)) bolsas[l] = azar.barajar(candidatas(params, { ...extra, nSilabas: l }));
  const out = [];
  for (let i = 0; i < n; i++) {
    let hecho = false;
    for (let k = 0; k < largos.length && !hecho; k++) {
      const b = bolsas[largos[(i + k) % largos.length]];
      for (let j = b.length - 1; j >= 0; j--) {
        const r = intento(b[j], i, azar);
        if (r) { out.push({ e: b[j], r, p: b[j].p }); b.splice(j, 1); hecho = true; break; }
      }
    }
    if (!hecho) throw new Error(`«${id}» necesita más palabras: con esas opciones solo hay ${out.length} y hacen falta ${n}. Prueba con otro tipo de sílabas o con palabras de otro largo.` + avisoVistas());
  }
  return out;
}
