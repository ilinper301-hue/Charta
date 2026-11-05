// conteo.serie5 · Series de 5 en 5 (port de _c_series(…, [5]) del motor; ver conteo.series.js).
// datos:    { paso: 5, valores: [v…], huecos: [j…], sube }   (valores de izquierda a derecha; huecos = posiciones vacías)
// solucion: { huecos: [valores de los huecos, de izquierda a derecha] }
// Opciones: huecos (1–4, por defecto 3). Completa: 8 series; media: 4. Cada serie tiene hasta 6 números.
import { registrar } from "../nucleo/tipos.js";
import { generarSerie, dibujarSerie } from "./conteo.series.js";

export default registrar({
  id: "conteo.serie5",
  version: 1,
  generar(params, azar, { tamano }) { return generarSerie([5], params, azar, tamano); },
  dibujar: dibujarSerie,
});
