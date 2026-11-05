// Charta · invariantes de la familia «orto» (Lengua 1.º, bloque 6; ver tests/invariantes.js).
import assert from "node:assert/strict";
import { unicos, cuantos } from "./_ayuda.js";
import { enCaso, palabraValida, PALABRAS } from "./_lengua.js";
import { huecosOrto, REGLAS_ORTO } from "../../src/lengua/reglas.js";
import { NOMBRES, nombresDe } from "../../src/tipos/_orto.js";

const OPC = { mpb: ["m", "n"], r: ["r", "rr"], cqu: ["c", "qu"], ggu: ["g", "gu"], cz: ["c", "z"] };
const NOMBRE = new Map(NOMBRES.map((x) => [x.n, x]));

export default {
  "orto.elige"(act, tam) {
    const es = act.ejercicios, p = act.params, ayuda = p.ayuda !== "sin";
    cuantos(es, tam === "media" ? 8 : 16);
    unicos(es, (e) => e.datos.palabra.toLowerCase(), "palabras repetidas");
    const porRegla = {};
    for (const e of es) {
      const { palabra, pos, largo, regla, opciones } = e.datos, m = enCaso(palabra, p.caso, "palabra");
      palabraValida(m, { ...p, tipo: "mixtas" }, { maxLetras: 8 });
      assert.ok(REGLAS_ORTO.includes(regla)); if (p.regla) assert.equal(regla, p.regla, "regla distinta de la pedida");
      porRegla[regla] = (porRegla[regla] || 0) + 1;
      // La solución sale de la regla ortográfica (huecosOrto), no de lo que escribe el generador.
      const h = huecosOrto(m, regla).find((x) => x.pos === pos);
      assert.ok(h, `«${m}»: no hay hueco de «${regla}» en la posición ${pos}`);
      assert.equal(h.largo, largo);
      const hacia = (t) => (p.caso === "mayus" ? t.toUpperCase() : p.caso === "inicial" && pos === 0 ? t[0].toUpperCase() + t.slice(1) : t);
      assert.deepEqual(e.solucion.huecos, [hacia(h.correcta)], "la solución no es la que dice la regla");
      assert.equal(palabra.slice(pos, pos + largo), e.solucion.huecos[0], "la solución no es lo que quitamos de la palabra");
      if (regla === "r") assert.ok(pos + largo < m.length, "r: el hueco no puede ir al final de la palabra");
      if (regla === "mpb") assert.ok("pb".includes(m[pos + 1]), "mpb: no es ante p o b");
      // Solo una opción forma una palabra del léxico.
      const otra = h.opciones.find((o) => o !== h.correcta);
      assert.ok(!PALABRAS.has(m.slice(0, pos) + otra + m.slice(pos + largo)), `«${m}»: con «${otra}» también es una palabra`);
      if (!ayuda) { assert.equal(opciones, null); continue; }
      assert.equal(opciones.length, 2); assert.equal(new Set(opciones).size, 2);
      assert.deepEqual([...opciones].map((o) => o.toLowerCase()).sort(), [...OPC[regla]].sort(), "opciones ≠ las de la regla");
      assert.ok(opciones.includes(e.solucion.huecos[0]), "falta la correcta entre las opciones");
      for (const o of opciones) assert.equal(o, hacia(o.toLowerCase()), "opción en otro caso");
    }
    if (!p.regla && tam === "completa") assert.ok(Object.keys(porRegla).length >= 4, `mezcladas: solo ${Object.keys(porRegla)}`);
  },

  "orto.mayuscula"(act, tam) {
    const es = act.ejercicios, p = act.params, escribe = p.tarea === "escribe", cat = p.nombres || null;
    cuantos(es, tam === "media" ? 6 : 12);
    for (const n of NOMBRES) {
      assert.ok(!/^[IÍ]/.test(n.n), `«${n.n}» empieza por I`);
      assert.ok(!PALABRAS.has(n.n.toLowerCase()), `«${n.n}» es también una palabra común`);
      assert.equal(n.n, n.n[0].toUpperCase() + n.n.slice(1).toLowerCase(), `«${n.n}» mal escrito`);
    }
    assert.ok(NOMBRES.filter((x) => x.hint.includes("niñ")).length >= 40 && nombresDe("mascotas").length >= 15 && nombresDe("lugares").length >= 15);
    assert.equal(new Set(NOMBRES.map((x) => x.n)).size, NOMBRES.length, "nombres repetidos en el banco");
    const vistos = new Set();
    for (const e of es) {
      const d = e.datos;
      if (escribe) {
        const n = NOMBRE.get(d.nombre); assert.ok(n, `«${d.nombre}» no está en el banco`);
        if (cat) assert.equal(n.cat, cat);
        assert.equal(d.palabra, d.nombre.toLowerCase(), "la palabra se da en minúscula"); assert.equal(d.pista, n.hint);
        assert.deepEqual(e.solucion.huecos, [d.nombre]); assert.ok(!("rodea" in e.solucion));
        assert.ok(!vistos.has(d.nombre), "nombres repetidos"); vistos.add(d.nombre);
      } else {
        assert.ok(d.palabras.length === 3, "tres palabras por fila");
        assert.deepEqual(e.solucion.huecos, []);
        const rodea = d.palabras.flatMap((w, i) => (/^[A-ZÁÉÍÓÚÑ]/.test(w) ? [i] : []));
        assert.deepEqual(e.solucion.rodea, rodea, "rodea ≠ palabras con mayúscula");
        assert.ok(rodea.length >= 1 && rodea.length <= 2, "1 o 2 nombres por fila");
        d.palabras.forEach((w, i) => {
          if (rodea.includes(i)) { const n = NOMBRE.get(w); assert.ok(n, `«${w}» no es un nombre del banco`); if (cat) assert.equal(n.cat, cat); }
          else { assert.ok(PALABRAS.has(w), `«${w}» no es del léxico`); assert.equal(w, w.toLowerCase()); assert.ok(!NOMBRE.has(w[0].toUpperCase() + w.slice(1))); }
          assert.ok(!vistos.has(w), `«${w}» repetida`); vistos.add(w);
        });
      }
    }
  },
};
