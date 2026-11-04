// Charta · azar con semilla (mulberry32). Mismas opciones + misma semilla = misma ficha.

/** Generador mulberry32: devuelve una función que da reales en [0, 1). */
export function mulberry32(semilla) {
  let a = semilla >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Mezcla varios enteros en una semilla de 32 bits (para semillas derivadas: variante, actividad…). */
export function mezclar(...ns) {
  let h = 0x811C9DC5;
  for (const n of ns) {
    h = Math.imul(h ^ (n >>> 0), 0x01000193) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 0x5BD1E995) >>> 0;
    h ^= h >>> 15;
  }
  return h >>> 0;
}

/** Objeto de azar con utilidades. Todas son deterministas a partir de la semilla. */
export function crearAzar(semilla) {
  const r = mulberry32(semilla);
  const azar = {
    semilla: semilla >>> 0,
    real: r,
    /** Entero entre a y b, ambos incluidos. */
    entero(a, b) { return a + Math.floor(r() * (b - a + 1)); },
    elegir(lista) {
      if (!lista.length) throw new Error("elegir(): lista vacía");
      return lista[Math.floor(r() * lista.length)];
    },
    /** Copia barajada (Fisher–Yates). */
    barajar(lista) {
      const l = lista.slice();
      for (let i = l.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1));
        [l[i], l[j]] = [l[j], l[i]];
      }
      return l;
    },
    /** k elementos distintos de la lista. */
    muestra(lista, k) { return azar.barajar(lista).slice(0, k); },
    /** Azar hijo independiente (p. ej. uno por actividad). */
    hijo(...claves) { return crearAzar(mezclar(azar.semilla, ...claves)); },
  };
  return azar;
}
