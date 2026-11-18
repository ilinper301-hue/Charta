// problemas.dinero · Problemas de compras con euros (2.º, lote 5; modelo propio de la app). Ver _problemas2.js.
import { registrar } from "../nucleo/tipos.js";
import { generarDinero } from "./_problemas2.js";
import { dibujarProblemas } from "./_problemas.js";

export default registrar({
  id: "problemas.dinero",
  version: 1,
  generar(params, azar, { tamano }) {
    return { enunciado: "Lee, escribe la operación y contesta.", ejercicios: generarDinero(params, azar, tamano === "media" ? 2 : 4) };
  },
  dibujar: dibujarProblemas,
});
