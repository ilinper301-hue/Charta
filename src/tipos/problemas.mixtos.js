// problemas.mixtos · Problemas de sumar y restar (modelo propio de la app; sin motor Python).
// Ver _problemas.js: datos { texto, sit, a, b, op, obj }, solucion { huecos: [a, op, b, resultado, resultado] }.
import { registrar } from "../nucleo/tipos.js";
import { ejerciciosProblemas, enunciadoProblemas, dibujarProblemas } from "./_problemas.js";

export default registrar({
  id: "problemas.mixtos",
  version: 1,
  generar(params, azar, { tamano }) {
    return { enunciado: enunciadoProblemas, ejercicios: ejerciciosProblemas("mixtos", params, azar, tamano) };
  },
  dibujar: dibujarProblemas,
});
