// problemas.barras · Problemas con barras (modelo de Singapur, como Barri; modelo propio de la app).
// Mismos enunciados y cantidades que problemas.suma/resta/mixtos (ver _problemas.js), con la barra de partes y total
// (o de comparación) dibujada bajo el enunciado, o un recuadro en blanco para que la dibuje el alumno (opción `barra`).
// datos:    { texto, sit, a, b, op, obj, nombres: [N, M] }   solucion: { huecos: [a, op, b, resultado, resultado] }
import { registrar } from "../nucleo/tipos.js";
import { generarProblemas, dibujarProblemasBarras } from "./_problemas.js";

export default registrar({
  id: "problemas.barras",
  version: 1,
  generar(params, azar, { tamano }) {
    const clase = params.operacion === "suma" ? "suma" : params.operacion === "resta" ? "resta" : "mixtos";
    const ejercicios = generarProblemas(clase, params, azar, tamano === "media" ? 2 : 4).map((d) => ({
      datos: { texto: d.texto, sit: d.sit, a: d.a, b: d.b, op: d.op, obj: d.obj, nombres: d.nombres },
      solucion: { huecos: [d.a, d.op, d.b, d.res, d.res] },
    }));
    return { enunciado: params.barra === "blanco" ? "Lee, dibuja la barra, escribe la operación y contesta." : "Mira la barra, escribe la operación y contesta.", ejercicios };
  },
  dibujar: dibujarProblemasBarras,
});
