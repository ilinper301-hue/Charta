// Charta · pruebas de la nube (paso 5.1) con un Firebase falso en memoria.  Uso: node tests/test_nube.js
// El falso aplica las mismas condiciones que las reglas (autor = uid, campos permitidos, tamaño).
import assert from "node:assert/strict";
import "../src/tipos/index.js";
import { generar, porDefecto } from "../src/nucleo/ficha.js";
import { fichaDeDocumento, erroresFicha } from "../src/nucleo/lector.js";
import { aDocumento, deDocumento, CAMPOS, TAM_MAX } from "../src/nube/documento.js";
import { crearNube } from "../src/nube/nube.js";

const comp = { actividades: [{ tipo: "sumar.h20", params: porDefecto("sumar.h20") }, { tipo: "restar.recta", params: porDefecto("restar.recta") }],
  semilla: 5, titulo: "", variaciones: "2", bn: false, nombres: ["Ana"] };
const ficha = generar({ actividades: comp.actividades, variantes: 2 }, 5);

// Documento: sin nombres, ficha como texto, vuelve igual
const d = aDocumento(ficha, comp, "u1", new Date("2026-11-05T10:00:00.123Z"));
assert.deepEqual(Object.keys(d).sort(), [...CAMPOS].sort());
assert.equal(d.autor, "u1"); assert.equal(d.creada, "2026-11-05T10:00:00Z"); assert.deepEqual(d.tipos, ["sumar.h20", "restar.recta"]);
assert.ok(!/Ana/.test(JSON.stringify(d)), "ningún nombre de alumno en el documento");
const vuelta = fichaDeDocumento(d, "x9");
assert.equal(vuelta.id, "x9"); assert.equal(vuelta.autor, "u1");
assert.deepEqual({ ...vuelta, id: undefined, autor: undefined, creada: undefined }, { ...ficha, id: undefined, autor: undefined, creada: undefined });
assert.deepEqual(erroresFicha(vuelta), []);
assert.equal(deDocumento("x9", d).composicion.variaciones, "2");
assert.throws(() => aDocumento(ficha, comp, null), /iniciar sesión/);
assert.throws(() => aDocumento({ ...ficha, nombres: ["Ana"] }, comp, "u1"), /alumnos/);
assert.throws(() => fichaDeDocumento({ ficha: "{" }), /dañada/);
assert.throws(() => fichaDeDocumento({}), /no contiene/);
// La más grande (30 variantes) cabe
const grande = generar({ actividades: [comp.actividades[0]], variantes: 30 }, 1);
assert.ok(aDocumento(grande, comp, "u1").ficha.length < TAM_MAX);

// ---- Firebase falso ----
function falso({ conectado = true } = {}) {
  const docs = new Map(); let usuario = null, n = 0; const oy = [];
  const avisar = () => oy.forEach((f) => f(usuario));
  const permitido = (datos) => usuario && datos.autor === usuario.uid && Object.keys(datos).every((k) => CAMPOS.includes(k)) && datos.ficha.length < TAM_MAX;
  const sdk = {
    app: { initializeApp: () => ({}) },
    auth: {
      getAuth: () => ({ get currentUser() { return usuario; } }),
      GoogleAuthProvider: class { setCustomParameters() {} },
      getRedirectResult: async () => null,
      onAuthStateChanged: (_, f) => { oy.push(f); setTimeout(() => f(usuario)); },
      signInWithPopup: async () => { usuario = { uid: "u1", displayName: "Iván" }; avisar(); },
      signInWithRedirect: async () => {},
      signOut: async () => { usuario = null; avisar(); },
    },
    fs: {
      initializeFirestore: () => ({}), persistentLocalCache: () => ({}), persistentMultipleTabManager: () => ({}), memoryLocalCache: () => ({}),
      collection: (_, ...r) => ({ ruta: r.join("/") }),
      doc: (c, ...r) => (r.length ? { ruta: r.slice(0, -1).join("/"), id: r.at(-1) } : { ruta: c.ruta, id: "f" + ++n }),
      query: (c, ...f) => ({ ...c, f }), where: (k, op, v) => ({ k, v }), limit: () => null,
      setDoc: (ref, datos) => conectado ? (permitido(datos) ? (docs.set(ref.id, structuredClone(datos)), Promise.resolve())
        : Promise.reject({ code: "permission-denied" })) : new Promise(() => {}),
      getDocs: async (q) => ({ docs: [...docs].filter(([, x]) => q.f.every((w) => !w || x[w.k] === w.v)).map(([id, x]) => ({ id, data: () => x })) }),
      getDoc: async (ref) => ({ id: ref.id, exists: () => docs.has(ref.id), data: () => docs.get(ref.id) }),
      deleteDoc: async (ref) => { docs.delete(ref.id); },
    },
  };
  return { sdk, docs };
}
const mem = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; };

const F = falso(), alm = mem(), nube = crearNube({ cargar: async () => F.sdk, almacen: alm });
const vistos = []; nube.alCambiar((e) => vistos.push(e.estado));
assert.equal(nube.recordada(), false);
await nube.iniciar(); assert.equal(nube.estado().estado, "fuera");
await assert.rejects(nube.guardar(ficha, comp), /iniciar sesión/);
await nube.entrar(); assert.equal(nube.estado().estado, "dentro"); assert.equal(nube.recordada(), true);
assert.deepEqual(await nube.listar(), []);
const g = await nube.guardar(ficha, comp);
assert.equal(g.repetida, false); assert.equal(g.pendiente, false); assert.equal(F.docs.size, 1);
assert.equal((await nube.guardar(ficha, { ...comp, nombres: ["Otro"] })).repetida, true, "misma composición: no se repite");
await nube.guardar(generar({ actividades: comp.actividades, variantes: 2 }, 6), { ...comp, semilla: 6 });
const lista = await nube.listar();
assert.equal(lista.length, 2);
const abierta = await nube.abrir(g.id);
assert.equal(abierta.ficha().titulo, ficha.titulo); assert.equal(abierta.composicion.semilla, 5);
await nube.borrar(g.id); assert.equal((await nube.listar()).length, 1);
await assert.rejects(nube.abrir(g.id), /ya no está/);
await nube.salir(); assert.equal(nube.estado().estado, "fuera"); assert.equal(nube.recordada(), false);
assert.deepEqual(await nube.listar(), []);
assert.ok(vistos.includes("cargando"));

// Sin conexión: la escritura queda pendiente (Firestore la sube al volver la red)
const S = falso({ conectado: false }), off = crearNube({ cargar: async () => S.sdk, almacen: mem(), esperaMs: 20 });
await off.entrar(); assert.equal((await off.guardar(ficha, comp)).pendiente, true);
// SDK que no carga
const roto = crearNube({ cargar: async () => { throw new Error("red"); } });
await assert.rejects(roto.iniciar(), /No se pudo cargar/); assert.equal(roto.estado().estado, "error");

console.log("test_nube: documento, sesión, guardar, listar, abrir, borrar y sin conexión OK");
