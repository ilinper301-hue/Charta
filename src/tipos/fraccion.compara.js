// fraccion.compara · Compara fracciones (3.º, lote 5, bloque 15; solo curso 3, sin rango).
// datos:    { a: [k, n], b: [k, n], igual: "den" | "num", dibujo: bool }   (dos fracciones propias distintas con el mismo denominador o el mismo numerador)
// solucion: { huecos: ["<" | ">"] }
// Opciones: modo (None = mismo denominador · "numerador" = mismo numerador · "mezcla" = mitad y mitad) · dibujo (si_no: dos tiras iguales partidas,
//           con su parte en gris) · den (None = hasta 12 · 6 · 10).
// Reglas: sin repetir pareja; mismo denominador: gana el numerador mayor; mismo numerador: gana el denominador menor (partes más grandes).
//         Ni «=» ni fracciones iguales.
// Dibujo: 2 columnas; con tiras, 8 (media 4); sin tiras, 12 (media 6).
import { registrar } from "../nucleo/tipos.js";
import { TOP } from "../render/papel.js";
import { denominadores, fraccion, dibujarFigura } from "./_fraccion.js";

const valor = ([k, n]) => k / n;

export default registrar({
  id: "fraccion.compara",
  version: 1,
  generar(params, azar, { tamano }) {
    const modo = params.modo ?? null, dibujo = params.dibujo ?? true, dens = denominadores(params), media = tamano === "media";
    const cnt = dibujo ? (media ? 4 : 8) : media ? 6 : 12;
    const parejas = (igual) => {   // todas las parejas posibles de ese tipo, sin orden
      const out = [];
      if (igual === "den") for (const n of dens) for (let k1 = 1; k1 < n; k1++) for (let k2 = k1 + 1; k2 < n; k2++) out.push([[k1, n], [k2, n]]);
      else for (const n1 of dens) for (const n2 of dens) if (n1 < n2) for (let k = 1; k < n1; k++) out.push([[k, n1], [k, n2]]);
      return out;
    };
    const tipos = modo === "numerador" ? ["num"] : modo === "mezcla" ? azar.barajar(["den", "num"]) : ["den"];
    const bancos = tipos.map((t) => azar.barajar(parejas(t)));
    // en la mezcla, por turnos (mitad y mitad); mismo denominador: los denominadores también por turnos
    const usados = new Set(), elegidas = [];
    for (let i = 0; elegidas.length < cnt && bancos.some((b) => b.length); i++) {
      const t = i % tipos.length, b = bancos[t];
      if (!b.length) continue;
      const cuenta = new Map(); elegidas.filter((e) => e.igual === tipos[t]).forEach((e) => cuenta.set(e.a[1], (cuenta.get(e.a[1]) ?? 0) + 1));
      const min = Math.min(...b.map((q) => cuenta.get(q[0][1]) ?? 0));
      const j = tipos[t] === "den" ? b.findIndex((q) => (cuenta.get(q[0][1]) ?? 0) === min) : 0;
      const [x, y] = b.splice(j, 1)[0], clave = `${x}|${y}`;
      if (usados.has(clave)) continue;
      usados.add(clave);
      elegidas.push({ ...(azar.entero(0, 1) ? { a: x, b: y } : { a: y, b: x }), igual: tipos[t] });
    }
    if (elegidas.length < cnt) throw new Error("Esta ficha necesita más fracciones: elige un denominador mayor.");
    const ejercicios = azar.barajar(elegidas).map((e) => ({
      datos: { a: e.a, b: e.b, igual: e.igual, dibujo },
      solucion: { huecos: [valor(e.a) > valor(e.b) ? ">" : "<"] },
    }));
    return { enunciado: "Compara las fracciones y escribe < o >." + (dibujo ? "\nLas tiras te ayudan." : ""), ejercicios };
  },
  dibujar(p, act) {
    const es = act.ejercicios, dibujo = act.params.dibujo ?? true, filas = (dibujo ? 4 : 6) * (p.parte < 1 ? 0.5 : 1);
    const { cel, cw, ch } = p.rejilla(TOP, 2, filas);
    es.forEach((e, i) => p.ejercicio(e.id, () => {
      const [x, y] = cel[i], { a, b } = e.datos, fs = 20, alto = fs * 2.1;
      p.marco(x, y, cw, ch, i);
      const cy = dibujo ? y + ch - 18 - alto / 2 : y + ch / 2 - 2, cx = x + cw / 2, sep = 58;
      fraccion(p, cx - sep, cy, a[0], a[1], fs);
      p.caja(cx - 20, cy - 19, 40, 38, null, 22, e.solucion.huecos[0]);
      fraccion(p, cx + sep, cy, b[0], b[1], fs);
      if (!dibujo) return;
      const zona = cy - alto / 2 - 10 - (y + 12), th = Math.min(30, (zona - 10) / 2), tw = cw - 60;
      [a, b].forEach(([k, n], j) => {
        const ty = y + 12 + zona - th / 2 - j * (th + 10);
        dibujarFigura(p, "tira", n, Array.from({ length: k }, (_, q) => q), x + 30 + tw / 2, ty, tw, th);
      });
    }));
  },
});
