// conteo.serie10 · Series de 10 en 10 (port de _c_series(…, [10]) del motor; ver conteo.series.js).
// datos:    { paso: 10, valores: [v…], huecos: [j…], sube }   (valores de izquierda a derecha; huecos = posiciones vacías)
// solucion: { huecos: [valores de los huecos, de izquierda a derecha] }
// Opciones: huecos (1–4, por defecto 3). Cantidad: «Más grandes» = 8 series en completa y 4 en media; «Más ejercicios» = 10 y 5 (ver conteo.series.js). Cada serie tiene hasta 6 números.
import { registrar } from "../nucleo/tipos.js";
import { generarSerie, dibujarSerie } from "./conteo.series.js";

export default registrar({
  id: "conteo.serie10",
  version: 2,
  cantidad: true,
  generar(params, azar, ctx) { return generarSerie([10], params, azar, ctx); },
  dibujar: dibujarSerie,
});
