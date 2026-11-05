// Charta · invariantes de la familia «palabra» (Lengua 1.º, bloque 4; ver tests/invariantes.js).
import assert from "node:assert/strict";
import { unicos, cuantos } from "./_ayuda.js";
import { enCaso, palabraValida, PALABRAS } from "./_lengua.js";
import { LEXICO } from "../../src/lengua/lexico.js";
import { articulo, plural, sinTildes } from "../../src/lengua/reglas.js";
import { BANCO } from "../../src/tipos/palabra.contrarios.js";

const ENT = new Map(LEXICO.map((e) => [e.p, e]));
const CAMPOS = ["animales", "comida", "ropa", "casa", "escuela", "cuerpo", "juguetes", "transportes", "familia", "naturaleza", "colores"];
const enLexico = (m, q = "palabra") => assert.ok(ENT.has(m), `${q}: «${m}» no está en el léxico`);
const sinI = (m, p) => { if (p.caso === "inicial") assert.ok(!/^[iíì]/.test(m), `«${m}» empieza por i con mayúscula inicial`); };
const comunes = (es) => es[0].k.filter((c) => es.every((e) => e.k.includes(c)));
const tildes = (s) => (s.match(/[áéíóú]/g) || []).length;

export default {
  "palabra.intrusa"(act, tam) {
    const es = act.ejercicios, p = act.params;
    cuantos(es, tam === "media" ? 4 : 8);
    unicos(es.flatMap((e) => e.datos.palabras), (x) => x.toLowerCase(), "palabras repetidas en la ficha");
    assert.equal(new Set(es.flatMap((e) => e.datos.palabras.map((w) => w.toLowerCase()))).size, es.length * 4, "palabras repetidas en la ficha");
    if (!p.campo) assert.equal(new Set(es.map((e) => e.datos.campo)).size, es.length, "campos repetidos con «varios»");
    for (const e of es) {
      const { palabras, campo } = e.datos, k = e.solucion.rodea;
      assert.equal(palabras.length, 4); assert.deepEqual(e.solucion.huecos, []);
      assert.ok(Number.isInteger(k) && k >= 0 && k <= 3);
      if (p.campo) assert.equal(campo, p.campo); assert.ok(CAMPOS.includes(campo));
      const ms = palabras.map((w) => enCaso(w, p.caso)), en = ms.map((m) => { enLexico(m); sinI(m, p); return ENT.get(m); });
      en.forEach((x, i) => assert.equal(x.k.includes(campo), i !== k, `«${ms[i]}»: ${i === k ? "la intrusa es del campo " + campo : "no es del campo " + campo}`));
      // solución única: solo las tres del campo comparten un campo; cualquier otra terna con la intrusa no
      for (let i = 0; i < 4; i++) { const resto = en.filter((_, j) => j !== i); if (i === k) assert.ok(comunes(resto).includes(campo)); else assert.deepEqual(comunes(resto), [], `«${ms[i]}» también podría ser la intrusa`); }
      assert.deepEqual(comunes(en), [], "las cuatro comparten campo");
    }
  },

  "palabra.clasifica"(act) {
    const es = act.ejercicios, p = act.params, nc = p.cajas === 3 ? 3 : 2, n = nc === 2 ? 4 : 3;
    cuantos(es, 3);
    const todas = es.flatMap((e) => e.datos.banco);
    assert.equal(new Set(todas.map((w) => w.toLowerCase())).size, todas.length, "palabras repetidas en la ficha");
    const titulos = es.flatMap((e) => e.datos.cajas);
    assert.equal(new Set(titulos.map((t) => t.toLowerCase())).size, titulos.length, "campos repetidos entre cajas");
    for (const e of es) {
      const { banco, cajas } = e.datos, cl = e.solucion.clasifica;
      assert.equal(cajas.length, nc); assert.equal(e.datos.n, n); assert.equal(banco.length, nc * n);
      assert.equal(cl.length, nc);
      const campos = cajas.map((t) => enCaso(t, p.caso === "mayus" ? "mayus" : "inicial", "título").toLowerCase());
      campos.forEach((c) => assert.ok(CAMPOS.includes(c), `campo «${c}»`));
      cl.forEach((ws, c) => {
        assert.equal(ws.length, n);
        for (const w of ws) {
          const m = enCaso(w, p.caso, "palabra"); enLexico(m); sinI(m, p);
          campos.forEach((cc, o) => assert.equal(ENT.get(m).k.includes(cc), o === c, `«${m}» ${o === c ? "no es" : "es"} de «${cc}»`));
        }
        assert.deepEqual(ws.map((w) => banco.indexOf(w)), ws.map((w) => banco.indexOf(w)).sort((a, b) => a - b), "cajas fuera del orden del banco");
      });
      assert.deepEqual(e.solucion.huecos, cl.flat());
      assert.deepEqual([...cl.flat()].sort(), [...banco].sort(), "el banco no es la unión de las cajas");
    }
  },

  "palabra.letras"(act, tam) {
    const es = act.ejercicios, p = act.params, marca = p.marca === "primera";
    cuantos(es, tam === "media" ? 5 : 10);
    unicos(es, (e) => e.datos.palabra.toLowerCase(), "palabras repetidas");
    for (const e of es) {
      const m = enCaso(e.datos.palabra, p.caso, "palabra"), ls = e.datos.letras;
      palabraValida(m, p);
      assert.ok(m.length >= 3 && m.length <= 5, "3 a 5 letras"); if (Number.isInteger(p.letras)) assert.equal(m.length, p.letras);
      assert.ok(!/[áéíóúü]|ch|ll|rr|qu|gu[ei]/.test(m), `«${m}»: dígrafo o tilde`);
      assert.equal(ls.length, m.length); assert.equal(e.datos.marca, marca);
      const minus = ls.map((l) => l.toLowerCase());
      assert.deepEqual([...minus].sort(), [...m].sort(), "las letras no son las de la palabra");
      assert.notEqual(minus.join(""), m, "letras ya ordenadas");
      if (marca) assert.equal(minus[0], m[0], "la letra marcada va la primera");
      if (p.caso === "mayus") ls.forEach((l) => assert.equal(l, l.toUpperCase()));
      if (p.caso === "inicial") { assert.equal(ls.filter((l) => l !== l.toLowerCase()).length, 1); assert.equal(ls.findIndex((l) => l !== l.toLowerCase()) === 0 || !marca, true); assert.ok(ls.includes(m[0].toUpperCase())); }
      if (!p.caso) ls.forEach((l) => assert.equal(l, l.toLowerCase()));
      const clave = (w) => [...sinTildes(w)].sort().join("");
      const otras = LEXICO.filter((o) => o.p !== m && clave(o.p) === clave(m) && (!marca || o.p[0] === m[0]));
      assert.deepEqual(otras.map((o) => o.p), [], "otra palabra se forma con esas letras");
      assert.deepEqual(e.solucion.huecos, [e.datos.palabra]);
    }
  },

  "palabra.cuenta"(act, tam) {
    const es = act.ejercicios, p = act.params, cas = p.respuesta === "casillas";
    cuantos(es, tam === "media" ? 5 : 10);
    unicos(es, (e) => e.datos.palabra.toLowerCase(), "palabras repetidas");
    for (const e of es) {
      const m = enCaso(e.datos.palabra, p.caso, "palabra"), ls = [...e.datos.palabra];
      palabraValida(m, p, { maxLetras: 7 }); assert.ok(ls.length >= 3);
      if (Number.isInteger(p.letras)) assert.equal(ls.length, p.letras);
      assert.equal(e.datos.n, ls.length); assert.equal(e.datos.respuesta, cas ? "casillas" : "numero");
      assert.deepEqual(e.solucion.huecos, cas ? [...ls, ls.length] : [ls.length]);
    }
    if (!Number.isInteger(p.letras) && tam !== "media") assert.ok(new Set(es.map((e) => e.datos.n)).size >= 3, "poca variedad de longitudes");
  },

  "palabra.articulo"(act, tam) {
    const es = act.ejercicios, p = act.params, mod = p.articulos || "el", indef = mod === "un" || mod === "unplural", conPl = mod === "plural" || mod === "unplural";
    cuantos(es, tam === "media" ? 6 : 12);
    unicos(es, (e) => e.datos.palabra.toLowerCase(), "palabras repetidas");
    const mayus = p.caso === "mayus", pls = es.filter((e) => e.datos.numero === "p").length;
    assert.equal(pls, conPl ? es.length / 2 : 0, "mitad plurales");
    assert.equal(es.filter((e) => e.datos.genero === "f").length, es.length / 2, "mitad femeninos");
    for (const e of es) {
      const { palabra, numero, genero } = e.datos, m = enCaso(palabra, mayus ? "mayus" : null, "palabra");
      const s = numero === "p" ? LEXICO.find((o) => plural(o.p) === m) : ENT.get(m);
      assert.ok(s, `«${m}» no sale de un nombre del léxico`); assert.equal(s.c, "n"); assert.equal(s.g, genero);
      if (numero === "p") assert.equal(plural(s.p), m);
      assert.equal(tildes(plural(s.p)), tildes(s.p), "cambio de tilde");
      if (genero === "f") assert.ok(!/^h?[aá]/.test(s.p), `«${s.p}»: femenino con a tónica (el agua)`);
      const art = articulo(genero, { plural: numero === "p", indefinido: indef });
      assert.deepEqual(e.solucion.huecos, [mayus ? art.toUpperCase() : art]);
    }
  },

  "palabra.plural"(act, tam) {
    const es = act.ejercicios, p = act.params, reves = p.sentido === "alreves", conEs = p.plural === "es", n = tam === "media" ? 6 : 12;
    cuantos(es, n);
    const sing = [];
    for (const e of es) {
      const mayus = p.caso === "mayus", vista = enCaso(e.datos.palabra, mayus ? "mayus" : null, "palabra"), resp = enCaso(e.solucion.huecos[0], mayus ? "mayus" : null, "respuesta");
      const s = reves ? resp : vista, pl = reves ? vista : resp;
      enLexico(s); assert.equal(ENT.get(s).c, "n"); assert.equal(plural(s), pl, `plural de «${s}»`); assert.notEqual(pl, s);
      assert.equal(tildes(pl), tildes(s)); assert.ok(s.length <= 8);
      assert.equal(e.datos.sentido, reves ? "singular" : "plural");
      sing.push(s);
      if (!conEs) assert.equal(pl, s + "s", `«${s}»: no es -s`);
    }
    assert.equal(new Set(sing).size, sing.length, "palabras repetidas");
    assert.equal(sing.filter((s) => plural(s) !== s + "s").length, conEs ? Math.round(n / 3) : 0, "nº de plurales en -es");
  },

  "palabra.contrarios"(act, tam) {
    const es = act.ejercicios, p = act.params, une = p.tarea !== "escribe";
    assert.ok(BANCO.length >= 40, "banco de unos 40 pares");
    for (const [a, b] of BANCO) { enLexico(a, "banco"); enLexico(b, "banco"); }
    assert.equal(new Set(BANCO.map(([a, b]) => [a, b].sort().join())).size, BANCO.length, "pares repetidos en el banco");
    const par = (a, b) => BANCO.find(([x, y]) => (x === a && y === b) || (x === b && y === a));
    cuantos(es, une ? (tam === "media" ? 4 : 8) : (tam === "media" ? 6 : 12));
    const pares = [];
    if (une) {
      const izq = es.map((e) => enCaso(e.datos.izq, p.caso, "izq")), der = es.map((e) => enCaso(e.datos.derecha, p.caso, "derecha"));
      assert.equal(new Set(der).size, der.length); assert.deepEqual([...es.map((e) => e.solucion.une)].sort(), es.map((_, i) => i), "une no es una permutación");
      assert.notDeepEqual(es.map((e) => e.solucion.une), es.map((_, i) => i), "columnas sin mezclar");
      es.forEach((e, i) => { assert.deepEqual(e.solucion.huecos, []); pares.push(par(izq[i], der[e.solucion.une])); assert.ok(pares.at(-1), `«${izq[i]}» – «${der[e.solucion.une]}» no es un par del banco`); });
    } else {
      for (const e of es) { const a = enCaso(e.datos.palabra, p.caso, "palabra"), b = enCaso(e.solucion.huecos[0], p.caso, "respuesta"); pares.push(par(a, b)); assert.ok(pares.at(-1), `«${a}» – «${b}» no es un par del banco`); }
    }
    const ws = pares.flatMap(([a, b]) => [a, b]);
    assert.equal(new Set(ws).size, ws.length, "palabras repetidas");
    const gs = pares.map((x) => x[2]).filter(Boolean); assert.equal(new Set(gs).size, gs.length, "dos pares casi sinónimos en la misma ficha");
    ws.forEach((w) => sinI(w, p));
  },

  "palabra.sopa"(act) {
    const es = act.ejercicios, p = act.params, n = p.palabras ?? 8, N = 10, dirs = p.direcciones === "diagonal" ? ["h", "v", "d"] : ["h", "v"], mayus = !p.minus;
    cuantos(es, 1);
    const { filas, palabras } = es[0].datos, sopa = es[0].solucion.sopa;
    assert.equal(es[0].datos.n, N); assert.deepEqual(es[0].solucion.huecos, []);
    assert.equal(filas.length, N);
    filas.forEach((f) => { assert.equal(f.length, N); assert.equal(f, mayus ? f.toUpperCase() : f.toLowerCase()); });
    assert.equal(palabras.length, n); assert.equal(sopa.length, n);
    const ps = palabras.map((w) => { assert.equal(w, mayus ? w.toUpperCase() : w.toLowerCase()); return w.toLowerCase(); });
    assert.equal(new Set(ps).size, n, "palabras repetidas");
    ps.forEach((m) => { enLexico(m); assert.ok(m.length >= 3 && m.length <= 8 && !/[áéíóúü]/.test(m)); ps.forEach((o) => { if (o !== m) assert.ok(!o.includes(m), `«${m}» está dentro de «${o}»`); }); });
    if (p.campo) ps.forEach((m) => assert.ok(ENT.get(m).k.includes(p.campo), `«${m}» no es de ${p.campo}`));
    else assert.ok(CAMPOS.some((c) => ps.every((m) => ENT.get(m).k.includes(c))), "las palabras no comparten campo");
    assert.deepEqual(sopa.map((s) => s.p.toLowerCase()).sort(), [...ps].sort(), "sopa ≠ palabras");
    const D = { h: [0, 1], v: [1, 0], d: [1, 1] }, lista = filas.map((f) => f.toLowerCase());
    for (const s of sopa) {
      assert.ok(dirs.includes(s.dir), `dirección ${s.dir} no pedida`);
      const [df, dc] = D[s.dir], w = s.p.toLowerCase();
      assert.ok(s.f >= 0 && s.c >= 0 && s.f + df * (w.length - 1) < N && s.c + dc * (w.length - 1) < N, "no cabe");
      [...w].forEach((l, i) => assert.equal(lista[s.f + df * i][s.c + dc * i], l, `«${w}» no está donde dice`));
    }
    for (const w of ps) { let c = 0; for (const [df, dc] of Object.values(D)) for (let f = 0; f < N; f++) for (let k = 0; k < N; k++) if (f + df * (w.length - 1) < N && k + dc * (w.length - 1) < N && [...w].every((l, i) => lista[f + df * i][k + dc * i] === l)) c++; assert.equal(c, 1, `«${w}» aparece ${c} veces`); }
    for (const d of dirs) assert.ok(sopa.some((s) => s.dir === d), `ninguna palabra en ${d}`);
  },
};
