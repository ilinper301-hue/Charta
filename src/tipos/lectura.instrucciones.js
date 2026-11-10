// lectura.instrucciones · Lee y colorea (Lengua 1.º, lote 5; LENGUA_1.md §3, bloque 7). Sin pictogramas: usa las figuras que ya dibuja Charta.
// datos:    { texto: "Colorea de rojo la estrella grande.", ordenes: [{ color, forma: "c" | "s" | "q" | "t", tam: "g" | "p" | null }], figuras: [{ forma, tam }] (en el orden en que se ven) }
// solucion: { huecos: [], colorea: [índice de la figura a colorear, uno por orden], colores: [color de cada una] }   en la solución, la figura se rellena de su color (borde rojo)
// Reglas: en cada tarjeta hay UNA sola figura que cumple la orden (no hay dos figuras iguales: forma + tamaño) y la orden nombra la figura (el círculo, la estrella…), su tamaño (grande,
//         pequeño; concordando con el nombre) y el color (de rojo, de azul…). En «dos órdenes» las dos figuras son distintas. No se repite la misma orden (forma, tamaño y color) en una ficha.
// Opciones: órdenes (figura y tamaño / solo la figura / dos órdenes seguidas) · colores (4 básicos / 8) · letra (minúscula / MAYÚSCULAS). Completa: 6 tarjetas (5 con dos órdenes); media: la mitad.
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { COLOR_SOLUCION } from "../render/papel.js";
import { cuantas } from "./_lengua.js";
import { permitida, filtrarVistas, avisoVistas } from "../lengua/vistas.js";
import { FORMAS, TAMANOS, PINTURAS, COLORES_INSTR, sintagma, textoInstruccion, figura, alCaso, ajustaLineas, parrafo } from "./_lectura.js";

const combos = () => // todas las figuras posibles (las que se ven)
   Object.keys(FORMAS).flatMap((forma) => Object.keys(TAMANOS).map((tam) => ({ forma, tam })));
const igual = (a, b) => a.forma === b.forma && a.tam === b.tam;

export default registrar({
  id: "lectura.instrucciones",
  version: 1,
  generar(params, azar, { tamano }) {
    const modo = params.ordenes === "figura" ? "figura" : params.ordenes === "dos" ? "dos" : "tamano";
    const filas = modo === "dos" ? 5 : 6, n = tamano === "media" ? Math.floor(filas / 2) : filas, colores = COLORES_INSTR(params.colores === "todos"), mayus = params.caso === "mayus";
    // con letras elegidas, solo órdenes cuya frase se escribe con ellas («Colorea de rojo la estrella grande.»)
    if (!permitida(modo === "dos" ? "Colorea de y" : "Colorea de")) throw new Error("«lectura.instrucciones» necesita las letras de «Colorea de» para escribir las órdenes." + avisoVistas());
    const formasOk = filtrarVistas(Object.keys(FORMAS), (f) => sintagma({ forma: f, tam: null })), combosOk = filtrarVistas(combos(), sintagma);
    const coloresOk = filtrarVistas(colores);
    const quedan = modo === "figura" ? formasOk.length : combosOk.length, hacen = modo === "dos" ? 2 : 1;
    if (quedan < hacen || coloresOk.length < hacen) throw new Error("«lectura.instrucciones» necesita más figuras o colores que se escriban con esas letras." + avisoVistas());
    const vistas = new Set(), usos = {}, out = [];
    for (let i = 0; i < n; i++) {
      let ordenes, figuras;
      for (let intento = 0; ; intento++) {
        if (intento > 200) throw new Error("«lectura.instrucciones» necesita más combinaciones de figura y color." + avisoVistas());
        const objetivos = modo === "figura" ? [{ forma: azar.elegir(formasOk), tam: null }] : azar.muestra(combosOk, modo === "dos" ? 2 : 1).map((c) => ({ ...c }));
        const cols = azar.barajar(coloresOk).sort((a, b) => (usos[a] || 0) - (usos[b] || 0)).slice(0, objetivos.length);   // los colores menos usados primero
        ordenes = objetivos.map((o, k) => ({ color: cols[k], forma: o.forma, tam: o.tam }));
        const claves = ordenes.map((o) => `${o.forma}|${o.tam}|${o.color}`);
        if (claves.some((c) => vistas.has(c))) continue;
        claves.forEach((c) => vistas.add(c)); ordenes.forEach((o) => { usos[o.color] = (usos[o.color] || 0) + 1; });
        // figuras: sin pares repetidos (forma + tamaño) → solo una cumple cada orden
        if (modo === "figura") {
          const tam = azar.elegir(["g", "p"]);
          figuras = azar.barajar(Object.keys(FORMAS).map((forma) => ({ forma, tam })));
        } else {
          const resto = azar.muestra(combos().filter((c) => !objetivos.some((o) => igual(o, c))), 6 - objetivos.length);
          figuras = azar.barajar([...objetivos.map((o) => ({ forma: o.forma, tam: o.tam })), ...resto]);
        }
        break;
      }
      const idx = ordenes.map((o) => figuras.findIndex((f) => f.forma === o.forma && (o.tam === null || f.tam === o.tam)));
      out.push({
        datos: { texto: alCaso(textoInstruccion(ordenes), params.caso), ordenes, figuras },
        solucion: { huecos: [], colorea: idx, colores: ordenes.map((o) => o.color) },
      });
    }
    return { enunciado: mayus ? "LEE LA ORDEN Y COLOREA LA FIGURA." : "Lee la orden y colorea la figura.", ejercicios: out };
  },
  dibujar(p, act) {
    const modo = act.params.ordenes === "dos" ? 5 : 6, { cel, cw, ch } = p.celdas(TOP, 1, modo, 10, 8);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { texto, figuras } = e.datos;
      p.marco(x, y, cw, ch, i);
      const zonaTexto = ch * 0.42, { fs, lineas } = ajustaLineas(p, texto, cw - 80, 23, 2, 15);
      parrafo(p, x + 36, y + ch - zonaTexto, zonaTexto - 4, lineas, fs, { k: 1.35 });
      const paso = (cw - 40) / figuras.length, rg = Math.min(26, paso * 0.34, (ch - zonaTexto - 10) / 2.6);
      figuras.forEach((f, k) => {
        const r = f.tam === "g" ? rg : rg * 0.58, pos = e.solucion.colorea.indexOf(k);
        const cx = x + 20 + paso * (k + 0.5), cy = y + (ch - zonaTexto) / 2 + 2;
        if (p.solucion && pos >= 0) figura(p, f.forma, cx, cy, r, { fill: PINTURAS[e.solucion.colores[pos]].c, stroke: COLOR_SOLUCION, lw: 2.6 });
        else figura(p, f.forma, cx, cy, r);
      });
    }));
  },
});
