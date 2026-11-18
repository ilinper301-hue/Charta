// problemas.dospasos · Problemas de dos operaciones (2.º, lote 5; modelo propio de la app). Ver _problemas2.js.
import { registrar } from "../nucleo/tipos.js";
import { generarDosPasos, dibujarDosPasos } from "./_problemas2.js";

export default registrar({
  id: "problemas.dospasos",
  version: 1,
  generar(params, azar, { tamano }) {
    return { enunciado: "Lee, escribe las dos operaciones y contesta.", ejercicios: generarDosPasos(params, azar, tamano === "media" ? 2 : 4) };
  },
  dibujar: dibujarDosPasos,
});
