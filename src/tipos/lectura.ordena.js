// lectura.ordena · Ordena la historia (Lengua 1.º, lote 5; LENGUA_1.md §3, bloque 7).
// datos:    { frases: [las frases de una secuencia de 3 o 4, desordenadas, en el caso elegido], tema: "rutina" | "receta" | "cuento", id: nº de la secuencia en el banco }
// solucion: { huecos: [1..k] }   el número que va en la casilla de cada frase, en el orden en que se ven (rojo en la solución)
// Reglas: banco 📚 de secuencias de _lectura.js (SECUENCIAS: rutinas, recetas y cuentos cortos; ~35 con un solo orden posible: abrir antes de cerrar, romper antes de freír…);
//         palabras del léxico de 1.º; nunca se ven en el orden correcto; sin repetir secuencias. Con todos los temas se reparten por turnos.
// Opciones: tema (todos / rutinas / recetas / cuentos) · frases de cada secuencia (3 o 4 / 3 / 4) · letra (minúscula / MAYÚSCULAS). Completa: 4 secuencias; media: 2.
import { registrar } from "../nucleo/tipos.js";
import { TOP, ZONA } from "../render/papel.js";
import { cuantas, ajusta } from "./_lengua.js";
import { elegirSecuencias, desordenarIdx, alCaso } from "./_lectura.js";

export default registrar({
  id: "lectura.ordena",
  version: 1,
  generar(params, azar, { tamano }) {
    const n = cuantas(tamano, 4), mayus = params.caso === "mayus";
    const secs = elegirSecuencias(azar, n, { tema: params.tema || null, frases: params.frases || null });
    return {
      enunciado: mayus ? "LEE LAS FRASES.\nESCRIBE 1, 2, 3… PARA PONERLAS EN ORDEN." : "Lee las frases.\nEscribe 1, 2, 3… para ponerlas en orden.",
      ejercicios: azar.barajar(secs).map((s) => {
        const orden = desordenarIdx(azar, s.frases.length);
        return { datos: { frases: orden.map((i) => alCaso(s.frases[i], params.caso)), tema: s.tema, id: s.id }, solucion: { huecos: orden.map((i) => i + 1) } };
      }),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 1, 4, 10, 10);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], fr = e.datos.frases, k = fr.length;
      p.marco(x, y, cw, ch, i);
      const fila = Math.min(42, (ch - 22) / k), q = Math.min(32, fila - 6), fs = ajusta(p, (z) => Math.max(...fr.map((f) => p.ancho(f, "PB", z))), cw - 130, 21, 14);
      const y0 = y + ch - 12 - fila;
      fr.forEach((f, j) => {
        const yy = y0 - j * fila;
        p.caja(x + 38, yy + (fila - q) / 2, q, q, null, 20, e.solucion.huecos[j]);
        p.text(x + 38 + q + 16, yy + fila / 2 - fs * 0.35, f, fs, { f: "PB" });
      });
    }));
  },
});
