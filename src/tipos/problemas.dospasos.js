// problemas.dospasos · Problemas de dos operaciones (2.º, lote 5; modelo propio de la app). Ver _problemas2.js.
import { registrar } from "../nucleo/tipos.js";
import { generarDosPasos, dibujarDosPasos, cuantosDosPasos } from "./_problemas2.js";

export default registrar({
  id: "problemas.dospasos",
  version: 1,
  generar(params, azar, { tamano }) {
    const enunciado = params.barra === "blanco" ? "Lee, dibuja la barra, escribe las dos operaciones y contesta."
      : params.barra ? "Mira la barra, escribe las dos operaciones y contesta." : "Lee, escribe las dos operaciones y contesta.";
    return { enunciado, ejercicios: generarDosPasos(params, azar, cuantosDosPasos(params, tamano)) };
  },
  dibujar: dibujarDosPasos,
});
