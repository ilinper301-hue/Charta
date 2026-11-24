// Charta · invariantes de la familia «geometria» (ver tests/invariantes.js).
import assert from "node:assert/strict";
import { cuantos, unicos, ent } from "./_ayuda.js";
import { FORMAS as FORMAS_L, LADOS } from "../../src/tipos/geometria.lados.js";
import { N, DIR, FIGURAS, recorrer } from "../../src/tipos/geometria.itinerario.js";
import { ELEMENTOS } from "../../src/tipos/geometria.cuerpos.js";
import { GEOM_CUERPOS } from "../../src/tipos/geometria.dibujo.js";
import { segmentos } from "../../src/tipos/geometria.lineas.js";
import { CLASES_ANG, puntos } from "../../src/tipos/geometria.angulos.js";
import { FORMAS_P, perimetroCeldas } from "../../src/tipos/geometria.perimetro.js";
import { GC, GR, mover } from "../../src/tipos/geometria.traslada.js";

const FIGS = ["circulo", "cuadrado", "rectangulo", "triangulo"], NOMF = { circulo: "círculo", cuadrado: "cuadrado", rectangulo: "rectángulo", triangulo: "triángulo" };
const CUERPOS = ["esfera", "cubo", "cilindro", "cono", "piramide"], NOMC = { esfera: "esfera", cubo: "cubo", cilindro: "cilindro", cono: "cono", piramide: "pirámide" };

const sinHuecos = (e) => assert.deepEqual(e.solucion.huecos, [], "rodear/colorear: sin huecos escritos");
/** Opciones: 3 distintas que incluyen la correcta. */
const opciones = (e) => { assert.equal(e.datos.opciones.length, 3); assert.equal(new Set(e.datos.opciones).size, 3); assert.ok(e.datos.opciones.includes(e.solucion.correcta), "falta la correcta"); };
/** Cada clase aparece lo más repartida posible (ciclos completos de la lista). */
const repartido = (ks, lista) => {
  const c = lista.map((k) => ks.filter((x) => x === k).length), n = Math.floor(ks.length / lista.length);
  c.forEach((v) => assert.ok(v >= n && v <= n + 1, `clases mal repartidas: ${c}`));
};

export default {
  "geometria.lados"(act, tam) {
    const es = act.ejercicios; cuantos(es, tam === "media" ? 4 : 8);
    for (const { datos: { forma, pts }, solucion } of es) {
      assert.ok(FORMAS_L.includes(forma)); assert.equal(pts.length, LADOS[forma], "vértices de la forma");
      assert.deepEqual(solucion.huecos, [LADOS[forma], LADOS[forma]]);
      assert.equal(new Set(pts.map((q) => q + "")).size, pts.length, "vértices repetidos");
      pts.forEach(([a, b]) => assert.ok(Math.abs(a) <= 1 && Math.abs(b) <= 1, "fuera de la caja"));
      const l = pts.map(([a, b], k) => Math.hypot(a - pts[(k + 1) % pts.length][0], b - pts[(k + 1) % pts.length][1]));
      l.forEach((v) => assert.ok(v > 0.4, "lado demasiado corto"));
    }
    if (tam === "completa") repartido(es.map((e) => e.datos.forma), FORMAS_L);
  },
  "geometria.itinerario"(act) {
    const modo = act.params.modo ?? null, es = act.ejercicios, n = modo === "flechas" ? 3 : 4;
    cuantos(es, 3); unicos(es, (e) => JSON.stringify([e.datos.inicio, e.datos.pasos]), "caminos repetidos");
    for (const { datos: d, solucion } of es) {
      assert.equal(d.pasos.length, n);
      d.pasos.forEach(([dir, m], k) => {
        assert.ok(DIR[dir]); assert.ok(Number.isInteger(m) && m >= 1 && m <= 4, "casillas 1..4");
        if (k) assert.notEqual(DIR[dir][0] !== 0, DIR[d.pasos[k - 1][0]][0] !== 0, "ejes alternados");
      });
      const ruta = recorrer(d.inicio, d.pasos); assert.ok(ruta, "el camino se sale o se cruza");
      assert.deepEqual(ruta[ruta.length - 1], d.fin); ruta.forEach(([c, r]) => { assert.ok(c >= 0 && r >= 0 && c < N && r < N); });
      if (modo === "flechas") assert.deepEqual(solucion.huecos, d.pasos.flatMap(([dir, m]) => [dir, m]));
      else assert.deepEqual(solucion.huecos, []);
      if (modo === "llega") {
        assert.equal(new Set(d.figs.map((f) => f.c + "," + f.r)).size, d.figs.length, "dos figuras en una casilla");
        assert.ok(!d.figs.some((f) => f.c === d.inicio[0] && f.r === d.inicio[1]), "figura en la salida");
        const fin = d.figs.find((f) => f.c === d.fin[0] && f.r === d.fin[1]); assert.ok(fin, "sin figura en la llegada");
        assert.equal(solucion.correcta, FIGURAS[fin.k]);
      } else assert.equal(d.figs, undefined);
    }
  },
  "geometria.figuras"(act, tam) {
    const es = act.ejercicios; cuantos(es, tam === "media" ? 6 : 12);
    for (const e of es) {
      assert.ok(FIGS.includes(e.datos.fig)); assert.ok([0, 1, 2, 3].includes(e.datos.var));
      sinHuecos(e); opciones(e); assert.equal(e.solucion.correcta, NOMF[e.datos.fig]);
    }
    if (tam === "completa") repartido(es.map((e) => e.datos.fig), FIGS);
  },
  "geometria.cuenta"(act, tam) {
    cuantos(act.ejercicios, 1);
    const { datos: { figuras }, solucion } = act.ejercicios[0];
    assert.equal(figuras.length, 30);
    const cnt = FIGS.map((k) => figuras.filter((f) => f.fig === k).length);
    assert.deepEqual(solucion.huecos, cnt);
    cnt.forEach((v) => assert.ok(v >= 4 && v <= 18, `cuenta ${v} fuera de 4..18`));
    assert.equal(cnt.reduce((a, b) => a + b), 30);
    for (const f of figuras) { assert.ok(Math.abs(f.dx) <= 7 && Math.abs(f.dy) <= 7); assert.ok(FIGS.includes(f.fig)); }
  },
  "geometria.cuerpos"(act, tam) {
    if (act.params.modo === "elementos") {   // 3.º, lote 7
      const es = act.ejercicios, ks = Object.keys(ELEMENTOS); cuantos(es, tam === "media" ? 4 : 8);
      for (const e of es) {
        assert.ok(ks.includes(e.datos.cuerpo)); const [, c, a, v] = ELEMENTOS[e.datos.cuerpo];
        assert.deepEqual(e.solucion.huecos, [c, a, v]);
        const g = GEOM_CUERPOS[e.datos.cuerpo];   // el dibujo cuadra: vértices, aristas y Euler (V − A + C = 2)
        assert.equal(g.v.length, v, "vértices del dibujo"); assert.equal(g.e.length, a, "aristas del dibujo"); assert.equal(v - a + c, 2, "Euler");
        assert.ok(g.e.filter((q) => q[2]).length >= 3 || e.datos.cuerpo === "piramide_tri", "aristas ocultas");
      }
      assert.deepEqual(ELEMENTOS.cubo.slice(1), [6, 12, 8]); assert.deepEqual(ELEMENTOS.prisma_rect.slice(1), [6, 12, 8]); assert.deepEqual(ELEMENTOS.prisma_tri.slice(1), [5, 9, 6]);
      assert.deepEqual(ELEMENTOS.piramide_cuad.slice(1), [5, 8, 5]); assert.deepEqual(ELEMENTOS.piramide_tri.slice(1), [4, 6, 4]);
      if (tam === "completa") repartido(es.map((e) => e.datos.cuerpo), ks);
      return;
    }
    const es = act.ejercicios; cuantos(es, tam === "media" ? 6 : 12);
    for (const e of es) { assert.ok(CUERPOS.includes(e.datos.cuerpo)); sinHuecos(e); opciones(e); assert.equal(e.solucion.correcta, NOMC[e.datos.cuerpo]); }
    if (tam === "completa") repartido(es.map((e) => e.datos.cuerpo), CUERPOS);
  },
  "geometria.rueda"(act, tam) {
    const es = act.ejercicios; cuantos(es, tam === "media" ? 6 : 12);
    for (const e of es) {
      assert.ok(CUERPOS.includes(e.datos.cuerpo)); sinHuecos(e);
      assert.equal(e.solucion.correcta, ["esfera", "cilindro", "cono"].includes(e.datos.cuerpo) ? "rueda" : "no rueda");
    }
    if (tam === "completa") repartido(es.map((e) => e.datos.cuerpo), CUERPOS);
  },
  "geometria.lineas"(act, tam) {
    const modo3 = ["paralelas", "rectas"].includes(act.params.modo) ? act.params.modo : null;
    if (modo3) {   // 3.º, lote 7
      const es = act.ejercicios, tipos = modo3 === "paralelas" ? ["paralelas", "perpendiculares", "oblicuas"] : ["recta", "semirrecta", "segmento"];
      cuantos(es, tam === "media" ? 6 : 12);
      for (const e of es) {
        const d = e.datos; sinHuecos(e);
        assert.deepEqual([...d.tipos].sort(), [...tipos].sort(), "las tres opciones"); assert.equal(e.solucion.correcta, d.tipo); assert.ok(tipos.includes(d.tipo));
        if (modo3 === "rectas") { assert.ok(Number.isInteger(d.ang / 15) && d.ang >= 0 && d.ang < 180); assert.ok([0, 1].includes(d.inv)); continue; }
        assert.ok(Number.isInteger(d.a1 / 15) && Number.isInteger(d.a2 / 15) && d.a1 >= 0 && d.a1 < 180 && d.a2 >= 0 && d.a2 < 180, "ángulos de 15 en 15");
        const dif = ((d.a2 - d.a1) % 180 + 180) % 180;
        if (d.tipo === "paralelas") assert.equal(dif, 0); else if (d.tipo === "perpendiculares") assert.equal(dif, 90);
        else assert.ok([45, 60, 120, 135].includes(dif), `oblicuas dudosas: ${dif}°`);
        assert.ok(Number.isInteger(d.u) && Math.abs(d.u) <= 3 && Number.isInteger(d.v));
        const [A, B] = segmentos(d);
        if (d.tipo === "paralelas") { assert.ok(d.v >= 8 && d.v <= 11, "separación"); assert.ok(Math.abs(Math.atan2(A[3] - A[1], A[2] - A[0]) - Math.atan2(B[3] - B[1], B[2] - B[0])) < 1e-9, "paralelas"); }
        else {   // se cortan dentro de los dos segmentos
          const [x1, y1, x2, y2] = A, [x3, y3, x4, y4] = B, den = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3), t = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / den, u = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / den;
          assert.ok(t > 0.1 && t < 0.9 && u > 0.1 && u < 0.9, "no se cortan en el medio");
        }
      }
      if (tam === "completa") repartido(es.map((e) => e.datos.tipo), tipos);
      return;
    }
    const es = act.ejercicios, cierre = act.params.modo === "cierre", tipos = cierre ? ["abierta", "cerrada"] : ["recta", "curva", "quebrada"];
    cuantos(es, tam === "media" ? 6 : 12);
    for (const e of es) {
      const d = e.datos; sinHuecos(e);
      assert.deepEqual(cierre ? d.tipos : [...d.tipos].sort(), cierre ? tipos : [...tipos].sort()); assert.equal(e.solucion.correcta, d.tipo); assert.ok(tipos.includes(d.tipo));
      if (d.tipo === "recta") assert.ok([0, 30, 45, 60, 90, 120, 150].includes(d.ang));
      if (d.tipo === "curva") assert.ok([0, 1].includes(d.v));
      if (d.tipo === "quebrada") assert.equal(d.ys.length, 5);
      if (d.tipo === "abierta" || d.tipo === "cerrada") assert.ok([0, 1, 2, 3].includes(d.v));
    }
    if (tam === "completa") repartido(es.map((e) => e.datos.tipo), tipos);
  },
  "geometria.posiciones"(act, tam) {
    const es = act.ejercicios, RELS = ["encima", "debajo", "a la izquierda", "a la derecha"];
    cuantos(es, tam === "media" ? 4 : 8);
    for (const e of es) {
      const { a, b, rel } = e.datos; sinHuecos(e);
      assert.ok(RELS.includes(rel)); assert.equal(e.solucion.correcta, rel);
      assert.ok(a !== b && ["círculo", "cuadrado"].includes(a) && ["círculo", "cuadrado"].includes(b), "un círculo y un cuadrado");
    }
    repartido(es.map((e) => e.datos.rel), RELS);
  },
  "geometria.simetria"(act, tam) {
    const es = act.ejercicios, hc = Math.max(3, Math.min(5, act.params.n ?? 4));
    cuantos(es, tam === "media" ? 4 : 8);
    for (const e of es) {
      sinHuecos(e); assert.equal(e.datos.hc, hc); assert.equal(e.datos.pat.length, 6);
      for (const f of e.datos.pat) assert.match(f, new RegExp(`^[X.]{${hc}}$`));
      assert.ok(e.datos.pat.join("").split("X").length - 1 >= 6, "menos de 6 cuadros pintados");
      assert.ok(e.datos.pat.filter((f) => f[hc - 1] === "X").length >= 2, "menos de 2 cuadros junto al eje");
    }
  },
  "geometria.copia"(act, tam) {
    const es = act.ejercicios; cuantos(es, 8);
    unicos(es, (e) => e.datos.forma, "dibujos repetidos");
    for (const e of es) {
      sinHuecos(e);
      for (const pl of e.datos.lin) { assert.ok(pl.length >= 2); for (const [x, y] of pl) assert.ok(Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x <= 5 && y >= 0 && y <= 5, "punto fuera de la rejilla 6×6"); }
    }
  },
  "geometria.angulos"(act, tam) {
    const es = act.ejercicios; cuantos(es, tam === "media" ? 6 : 12);
    for (const e of es) {
      const { clase, ang, giro, l1, l2, opciones } = e.datos; sinHuecos(e);
      assert.deepEqual(opciones, CLASES_ANG); assert.equal(e.solucion.correcta, clase);
      assert.ok(Number.isInteger(ang / 5) && Number.isInteger(giro / 5) && giro >= 0 && giro < 360);
      if (clase === "recto") assert.equal(ang, 90); else if (clase === "agudo") assert.ok(ang >= 30 && ang <= 70, `agudo dudoso: ${ang}`); else assert.ok(ang >= 110 && ang <= 160, `obtuso dudoso: ${ang}`);
      assert.ok(l1 >= 0.85 && l1 <= 1 && l2 >= 0.85 && l2 <= 1);
      const q = puntos(giro, ang, l1, l2); assert.ok(q.y1 - q.y0 <= 1.5 + 1e-9 && q.x1 - q.x0 <= 1.9 + 1e-9, "el ángulo no cabe");
    }
    repartido(es.map((e) => e.datos.clase), CLASES_ANG);
  },
  "geometria.perimetro"(act, tam) {
    const es = act.ejercicios, cuad = act.params.modo === "cuadricula"; cuantos(es, tam === "media" ? 4 : 6);
    for (const { datos: d, solucion } of es) {
      assert.equal(solucion.huecos.length, 1);
      if (cuad) {
        assert.equal(d.forma, "cuadricula"); assert.ok(d.bw <= 7 && d.bh <= 5 && d.bw >= 1 && d.bh >= 1);
        assert.equal(new Set(d.celdas.map((q) => q + "")).size, d.celdas.length, "celdas repetidas");
        d.celdas.forEach(([c, r]) => { ent(c, 0, d.bw - 1, "columna"); ent(r, 0, d.bh - 1, "fila"); });
        assert.ok(d.celdas.some(([c]) => c === 0) && d.celdas.some(([, r]) => r === 0), "figura pegada a la esquina");
        const hay = new Set(d.celdas.map((q) => q + "")), vistas = new Set([d.celdas[0] + ""]), pila = [d.celdas[0]];   // conexa
        while (pila.length) { const [c, r] = pila.pop(); for (const [a, b] of [[c + 1, r], [c - 1, r], [c, r + 1], [c, r - 1]]) if (hay.has(a + "," + b) && !vistas.has(a + "," + b)) { vistas.add(a + "," + b); pila.push([a, b]); } }
        assert.equal(vistas.size, d.celdas.length, "figura no conexa");
        assert.equal(solucion.huecos[0], perimetroCeldas(d.celdas)); assert.ok(solucion.huecos[0] >= 8 && solucion.huecos[0] <= 30);
      } else {
        assert.ok(FORMAS_P.includes(d.forma)); assert.equal(d.pts.length, d.lados.length);
        d.lados.forEach((l, k) => {
          assert.ok(Number.isInteger(l) && l >= 1 && l <= 12, "lado");
          const [a, b] = d.pts[k], [c, q] = d.pts[(k + 1) % d.pts.length]; assert.ok(Math.abs(Math.hypot(c - a, q - b) - l) < 0.01, `el lado ${k} del dibujo (${Math.hypot(c - a, q - b).toFixed(3)}) no mide ${l}`);
        });
        assert.equal(solucion.huecos[0], d.lados.reduce((x, y) => x + y, 0));
        let area2 = 0; d.pts.forEach(([a, b], k) => { const [c, q] = d.pts[(k + 1) % d.pts.length]; area2 += a * q - c * b; }); assert.ok(area2 > 0, "vértices en sentido antihorario");
        if (d.forma === "triangulo") { const [x, y, z] = d.lados; assert.ok(x + y > z + 1 && y + z > x + 1 && x + z > y + 1, "triángulo casi plano"); }
        if (d.forma === "cuadrado") assert.equal(new Set(d.lados).size, 1); if (d.forma === "rectangulo") assert.equal(new Set(d.lados).size, 2);
      }
    }
    if (!cuad && tam === "completa") repartido(es.map((e) => e.datos.forma), FORMAS_P);
    if (cuad) unicos(es, (e) => JSON.stringify(e.datos.celdas), "figuras repetidas");
  },
  "geometria.traslada"(act, tam) {
    const es = act.ejercicios; cuantos(es, tam === "media" ? 1 : 2);
    for (const { datos: d, solucion } of es) {
      assert.equal(d.gc, GC); assert.equal(d.gr, GR); assert.ok(d.celdas.length >= 3 && d.celdas.length <= 6, "3 a 6 cuadraditos");
      assert.equal(new Set(d.celdas.map((q) => q + "")).size, d.celdas.length);
      const hay = new Set(d.celdas.map((q) => q + "")), vistas = new Set([d.celdas[0] + ""]), pila = [d.celdas[0]];
      while (pila.length) { const [c, r] = pila.pop(); for (const [a, b] of [[c + 1, r], [c - 1, r], [c, r + 1], [c, r - 1]]) if (hay.has(a + "," + b) && !vistas.has(a + "," + b)) { vistas.add(a + "," + b); pila.push([a, b]); } }
      assert.equal(vistas.size, d.celdas.length, "figura no conexa");
      assert.ok(d.pasos.length >= 1 && d.pasos.length <= 2);
      d.pasos.forEach(([dir, n]) => { assert.ok(DIR[dir]); ent(n, 1, 6, "casillas"); });
      if (d.pasos.length === 2) assert.notEqual(DIR[d.pasos[0][0]][0] !== 0, DIR[d.pasos[1][0]][0] !== 0, "una horizontal y una vertical");
      const dentro = ([c, r]) => c >= 0 && r >= 0 && c < GC && r < GR;
      assert.ok(d.celdas.every(dentro), "figura fuera de la cuadrícula"); assert.deepEqual(solucion.celdas, mover(d.celdas, d.pasos)); assert.ok(solucion.celdas.every(dentro), "la trasladada se sale");
      const bw = Math.max(...d.celdas.map((q) => q[0])) - Math.min(...d.celdas.map((q) => q[0])) + 1, bh = Math.max(...d.celdas.map((q) => q[1])) - Math.min(...d.celdas.map((q) => q[1])) + 1;
      const dx = solucion.celdas[0][0] - d.celdas[0][0], dy = solucion.celdas[0][1] - d.celdas[0][1];
      assert.ok(Math.abs(dx) >= bw || Math.abs(dy) >= bh, "la trasladada pisa a la original"); assert.deepEqual(solucion.huecos, []);
    }
  },
};
