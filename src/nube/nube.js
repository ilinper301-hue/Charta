// Charta · nube (paso 5.1): inicio de sesión con Google y fichas en /apps/charta/fichas/{id}.
// El SDK de Firebase se carga del CDN de Google SOLO si se usa la nube (sin sesión, la app no se conecta a nada).
// Mismo proyecto que Tabula, Barri, Lectori y Calculi. Reglas: cada docente solo ve y toca sus fichas.
// Sin DOM: el SDK y el almacén se inyectan (las pruebas usan uno falso).
import { firebaseConfig, FIREBASE_SDK, RUTA_FICHAS } from "./config.js";
import { aDocumento, deDocumento, mismaComposicion } from "./documento.js";

const BANDERA = "charta:nube"; // "1" = hubo sesión en este dispositivo → reconectar al abrir
const imp = (u) => import(u);
export async function cargarSdk() {
  const base = `https://www.gstatic.com/firebasejs/${FIREBASE_SDK}`;
  const [app, auth, fs] = await Promise.all([imp(`${base}/firebase-app.js`), imp(`${base}/firebase-auth.js`), imp(`${base}/firebase-firestore.js`)]);
  return { app, auth, fs };
}

export function mensajeError(e) {
  const c = (e && e.code) || "";
  // La ficha ya se ha comprobado antes de enviarla (documento.js), así que un rechazo es de sesión o de reglas.
  if (c.includes("permission-denied")) return "La nube no ha dejado guardar ni leer: cierra la sesión y vuelve a entrar con Google. Si sigue igual, las reglas de Firestore no tienen el bloque de Charta (pégalo desde firestore.rules).";
  if (c.includes("unauthenticated")) return "La sesión ha caducado: vuelve a entrar con Google.";
  if (c.includes("resource-exhausted")) return "La nube ha llegado a su límite de hoy. Inténtalo mañana.";
  if (c.includes("unauthorized-domain")) return "Este dominio no está autorizado en Firebase → Authentication → Dominios autorizados.";
  if (c.includes("popup-closed") || c.includes("cancelled-popup")) return "Se cerró la ventana de inicio de sesión.";
  if (c.includes("network") || c.includes("unavailable")) return "No hay conexión. Inténtalo cuando vuelva la red.";
  if (c.includes("not-found")) return "Esa ficha ya no está en la nube.";
  return (e && e.message) || "Error desconocido";
}

export function crearNube({ cargar = cargarSdk, almacen = null, esperaMs = 4000 } = {}) {
  let fb = null, auth = null, db = null, arranque = null, cache = null;
  let estado = { estado: "apagada", usuario: null, error: null }; // apagada | cargando | fuera | dentro | error
  const oyentes = new Set();
  const poner = (p) => { estado = { ...estado, ...p }; oyentes.forEach((f) => { try { f({ ...estado }); } catch (e) { console.error(e); } }); };
  const bandera = (v) => { try { v ? almacen?.setItem(BANDERA, "1") : almacen?.removeItem?.(BANDERA); } catch {} };
  const uid = () => auth?.currentUser?.uid || null;
  const col = () => fb.fs.collection(db, ...RUTA_FICHAS);

  function iniciar() {
    if (arranque) return arranque;
    poner({ estado: "cargando", error: null });
    arranque = (async () => {
      try { fb = await cargar(); } catch { arranque = null; poner({ estado: "error", error: "No se pudo cargar Firebase. Revisa la conexión." }); throw new Error(estado.error); }
      const app = fb.app.initializeApp(firebaseConfig, "charta");
      try {
        db = fb.fs.initializeFirestore(app, { localCache: fb.fs.persistentLocalCache({ tabManager: fb.fs.persistentMultipleTabManager() }), ignoreUndefinedProperties: true });
      } catch { db = fb.fs.initializeFirestore(app, { localCache: fb.fs.memoryLocalCache(), ignoreUndefinedProperties: true }); }
      auth = fb.auth.getAuth(app); auth.languageCode = "es";
      try { await fb.auth.getRedirectResult(auth); } catch (e) { poner({ error: mensajeError(e) }); }
      await new Promise((listo) => {
        let primera = true;
        fb.auth.onAuthStateChanged(auth, (u) => {
          cache = null;
          if (u) { bandera(true); poner({ estado: "dentro", usuario: { nombre: u.displayName || "", correo: u.email || "", foto: u.photoURL || "" } }); }
          else poner({ estado: "fuera", usuario: null });
          if (primera) { primera = false; listo(); }
        });
      });
    })();
    return arranque;
  }

  return {
    estado: () => ({ ...estado }),
    alCambiar(f) { oyentes.add(f); return () => oyentes.delete(f); },
    /** ¿Hubo sesión en este dispositivo? Entonces conviene llamar a iniciar() al abrir la app. */
    recordada() { try { return almacen?.getItem(BANDERA) === "1"; } catch { return false; } },
    iniciar,
    async entrar() {
      await iniciar();
      if (uid()) return;
      const p = new fb.auth.GoogleAuthProvider(); p.setCustomParameters({ prompt: "select_account" });
      poner({ error: null });
      try { await fb.auth.signInWithPopup(auth, p); }
      catch (e) {
        const c = e.code || "";
        if (c.includes("popup-blocked") || c.includes("operation-not-supported")) { await fb.auth.signInWithRedirect(auth, p); return; }
        poner({ error: mensajeError(e) }); throw new Error(mensajeError(e));
      }
    },
    async salir() {
      if (!auth) return;
      bandera(false); cache = null;
      await fb.auth.signOut(auth);
    },
    /** Lista de fichas del docente, la más nueva primero (sin índice compuesto: se ordena aquí). */
    async listar() {
      await iniciar();
      const u = uid(); if (!u) return [];
      try {
        const r = await fb.fs.getDocs(fb.fs.query(col(), fb.fs.where("autor", "==", u), fb.fs.limit(300)));
        cache = r.docs.map((d) => deDocumento(d.id, d.data())).sort((a, b) => (a.creada < b.creada ? 1 : a.creada > b.creada ? -1 : 0));
        return cache;
      } catch (e) { throw new Error(mensajeError(e)); }
    },
    /** Guarda la ficha (sin nombres). Devuelve { id, repetida, pendiente }: pendiente = sin conexión, se subirá sola. */
    async guardar(ficha, comp) {
      await iniciar();
      const u = uid(); if (!u) throw new Error("Hay que iniciar sesión para guardar en la nube.");
      const ya = (cache || []).find((x) => mismaComposicion(x.composicion, comp));
      if (ya) return { id: ya.id, repetida: true, pendiente: false };
      const datos = aDocumento(ficha, comp, u);
      const ref = fb.fs.doc(col());
      let error = null;
      const escrito = fb.fs.setDoc(ref, datos).then(() => "ok", (e) => { error = e; return "error"; });
      const r = await Promise.race([escrito, new Promise((ok) => setTimeout(() => ok("pendiente"), esperaMs))]);
      if (r === "error") throw new Error(mensajeError(error));
      if (cache) cache.unshift(deDocumento(ref.id, datos));
      return { id: ref.id, repetida: false, pendiente: r === "pendiente" };
    },
    async abrir(id) {
      await iniciar();
      try {
        const d = await fb.fs.getDoc(fb.fs.doc(db, ...RUTA_FICHAS, id));
        if (!d.exists()) throw Object.assign(new Error(), { code: "not-found" });
        return deDocumento(d.id, d.data());
      } catch (e) { throw new Error(mensajeError(e)); }
    },
    async borrar(id) {
      await iniciar();
      try { await fb.fs.deleteDoc(fb.fs.doc(db, ...RUTA_FICHAS, id)); } catch (e) { throw new Error(mensajeError(e)); }
      if (cache) cache = cache.filter((x) => x.id !== id);
    },
  };
}
