// palabra.intrusa · La que no es del grupo (Lengua 1.º, lote 2; LENGUA_1.md §3, bloque 4).
// datos:    { palabras: [4 palabras, en el caso elegido], campo: "animales" (campo de las otras tres; no se dibuja) }
// solucion: { huecos: [], rodea: índice (0–3) de la intrusa }
// Reglas: palabras del léxico (nombres frecuentes de 3 a 9 letras; en «colores», adjetivos); tres del campo y una que no lo es;
//         solución única: ninguna otra terna de las cuatro comparte un campo léxico con su cuarta (solo las tres del campo lo hacen).
//         Sin palabras repetidas en la ficha. Con campo «Varios», cada fila es de un campo distinto.
// Con letras elegidas (vistas.js) solo entran palabras que se escriben con ellas; con «Varios» solo cuentan los campos con palabras de sobra
// (si hay menos de n, la ficha lleva menos filas, mínimo 3); con un campo fijo hacen falta n filas distintas de ese campo.
// Opciones: campo (varios o uno de los 10 con palabras de sobra) · letra (minúscula / mayúscula inicial / MAYÚSCULAS). Completa: 8 filas; media: 4.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { rodear } from "../lengua/dibujo.js";
import { vistasActivas, avisoVistas } from "../lengua/vistas.js";
import { alCaso, cuantas, ajusta } from "./_lengua.js";
import { CAMPOS_P, deCampo, deTodosCampos, camposComunes } from "./_palabra.js";

const GAP = 20, PAD = 0.9;
const anchoFila = (p, ws, fs) => ws.reduce((t, w) => t + p.ancho(w, "PB", fs) + fs * PAD, 0) + GAP * (ws.length - 1);

export default registrar({
  id: "palabra.intrusa",
  version: 1,
  generar(params, azar, { tamano }) {
    const n = cuantas(tamano, 8), caso = params.caso;
    const viables = vistasActivas() ? CAMPOS_P.filter((c) => deCampo(c, { caso }).length >= 4) : CAMPOS_P;   // 3 del campo + 1 ajena
    const campos = params.campo ? Array(n).fill(params.campo) : azar.barajar(viables).slice(0, n);
    if (campos.length < 3) throw new Error(`«palabra.intrusa» necesita palabras de al menos 3 campos distintos: con esas opciones solo hay ${campos.length}.` + avisoVistas());
    const todas = deTodosCampos({ caso }), usadas = new Set(), filas = [];
    for (const campo of campos) {
      const propias = azar.barajar(deCampo(campo, { caso }).filter((e) => !usadas.has(e.p)));
      let hecho = null;
      for (let intento = 0; intento < 60 && !hecho && propias.length >= 3; intento++) {
        const tres = azar.muestra(propias, 3);
        const ajenas = azar.barajar(todas.filter((e) => !e.k.includes(campo) && !usadas.has(e.p) && !tres.some((t) => t.p === e.p)));
        const intrusa = ajenas.find((e) => tres.every((_, j) => camposComunes([e, ...tres.filter((__, m) => m !== j)]).length === 0));
        if (intrusa) hecho = { tres, intrusa };
      }
      if (!hecho) throw new Error(`«palabra.intrusa» necesita más palabras del campo «${campo}»: no hay para ${n} filas distintas. Prueba con «Varios» o con otro campo.` + avisoVistas());
      for (const e of [...hecho.tres, hecho.intrusa]) usadas.add(e.p);
      const pos = azar.entero(0, 3), ws = hecho.tres.map((e) => e.p);
      ws.splice(pos, 0, hecho.intrusa.p);
      filas.push({ palabras: ws.map((w) => alCaso(w, caso)), campo, pos });
    }
    return {
      enunciado: "Rodea la palabra que no es del grupo.",
      ejercicios: filas.map((f) => ({ datos: { palabras: f.palabras, campo: f.campo }, solucion: { huecos: [], rodea: f.pos } })),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 1, 8, 10, 8), w = cw - 56;
    const fs = Math.min(...act.ejercicios.map((e) => ajusta(p, (q) => anchoFila(p, e.datos.palabras, q), w, 26, 12)));
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i];
      p.marco(x, y, cw, ch, i);
      rodear(p, x + 36, y, w, ch, e.datos.palabras, e.solucion.rodea, { fs, gap: GAP, tarjeta: true });
    }));
  },
});
