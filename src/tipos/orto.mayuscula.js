// orto.mayuscula · Nombres con mayúscula (Lengua 1.º, lote 2; LENGUA_1.md §3, bloque 6).
// Tarea «rodea»  datos:    { palabras: ["Marta", "mesa", "Toby"] }  tres palabras por tarjeta: 1 o 2 nombres propios (con mayúscula) y el resto
//                                       palabras comunes del léxico (en minúscula).
//                solucion: { huecos: [], rodea: [0, 2] }   posiciones de las palabras con mayúscula.
// Tarea «escribe» datos:   { palabra: "marta", pista: "una niña", nombre: "Marta" }  el nombre en minúscula y de qué es; se escribe bien en el cuadro.
//                solucion: { huecos: ["Marta"] }
// Nombres: banco de src/tipos/_orto.js (niños, niñas, mascotas, pueblos y ciudades; ninguno empieza por «I» ni es una palabra común).
// Opciones: tarea (rodear / escribir) · nombres (personas / mascotas / pueblos y ciudades / mezclados). Sin repetir ni nombres ni palabras.
// Completa: 12 tarjetas (2 × 6); media: 6. Si el banco de la categoría no llega, se usan menos nombres por tarjeta (mínimo uno).
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { rodear } from "../lengua/dibujo.js";
import { candidatas, cuantas } from "./_lengua.js";
import { NOMBRES, nombresDe } from "./_orto.js";

const COMUNES = new Set(NOMBRES.map((x) => x.n.toLowerCase()));

export default registrar({
  id: "orto.mayuscula",
  version: 1,
  generar(params, azar, { tamano }) {
    const n = cuantas(tamano, 12), escribe = params.tarea === "escribe";
    const banco = azar.barajar(nombresDe(params.nombres || null));
    if (banco.length < n) throw new Error(`«orto.mayuscula» necesita más nombres: de ese tipo solo hay ${banco.length} y hacen falta ${n}.`);
    if (escribe) {
      return {
        enunciado: "Escribe cada nombre con mayúscula\nen el cuadro gris.",
        ejercicios: banco.slice(0, n).map((x) => ({ datos: { palabra: x.n.toLowerCase(), pista: x.hint, nombre: x.n }, solucion: { huecos: [x.n] } })),
      };
    }
    // 1 nombre por tarjeta y, mientras el banco llegue, 2 en la mitad de ellas
    const dos = Math.min(Math.floor(n / 2), banco.length - n);
    const ks = azar.barajar(Array.from({ length: n }, (_, i) => (i < dos ? 2 : 1)));
    const comunes = azar.barajar(candidatas({ tipo: params.tipo }, { maxLetras: 7 }).filter((e) => !COMUNES.has(e.p)));
    if (comunes.length < n * 2) throw new Error("«orto.mayuscula» necesita más palabras comunes.");
    let b = 0;
    return {
      enunciado: "Rodea las palabras que llevan mayúscula.",
      ejercicios: ks.map((k) => {
        const ps = [...banco.slice(b, b + k).map((x) => x.n), ...Array.from({ length: 3 - k }, () => comunes.pop().p)];
        b += k;
        const palabras = azar.barajar(ps);
        return { datos: { palabras }, solucion: { huecos: [], rodea: palabras.flatMap((w, i) => (w !== w.toLowerCase() ? [i] : [])) } };
      }),
    };
  },
  dibujar(p, act) {
    const { cel, cw, ch } = p.celdas(TOP, 2, 6, 10, 8);
    act.ejercicios.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], d = e.datos;
      p.marco(x, y, cw, ch, i);
      if (d.palabras) {
        const ancho = cw - 40, anchoDe = (fs) => d.palabras.reduce((t, w) => t + p.ancho(w, "PB", fs) + fs * 0.9, 0) + 14 * (d.palabras.length - 1);
        let fs = 24; while (fs > 14 && anchoDe(fs) > ancho) fs -= 1;
        rodear(p, x + 30, y, ancho, ch, d.palabras, e.solucion.rodea, { fs, gap: 14 });
      } else {
        const bh = 38, bw = p.ancho(d.nombre, "PB", 20) + 26, zona = cw - 32 - 16 - bw - 14;
        let fs = 28; while (fs > 15 && p.ancho(d.palabra, "PB", fs) > zona) fs -= 1;
        p.text(x + 32, y + ch / 2 - fs * 0.35 + 6, d.palabra, fs, { f: "PB" });
        p.text(x + 32, y + ch / 2 - fs * 0.35 - 14, `(${d.pista})`, 10, { f: "PM", gris: 0.3 });
        p.caja(x + cw - 14 - bw, y + (ch - bh) / 2, bw, bh, null, 20, e.solucion.huecos[0]);
      }
    }));
  },
});
