// problemas.resta · Problemas de restar (modelo propio de la app; sin motor Python).
// Ver _problemas.js: datos { texto, sit, a, b, op, obj }, solucion { huecos: [a, op, b, resultado, resultado] }.
import { registrar } from "../nucleo/tipos.js";
import { ejerciciosProblemas, enunciadoProblemas, dibujarProblemas } from "./_problemas.js";

export default registrar({
  id: "problemas.resta",
  version: 1,
  generar(params, azar, { tamano }) {
    return { enunciado: enunciadoProblemas, ejercicios: ejerciciosProblemas("resta", params, azar, tamano) };
  },
  dibujar: dibujarProblemas,
});
