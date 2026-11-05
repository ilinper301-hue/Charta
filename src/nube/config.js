// Charta · configuración de Firebase (paso 5.1)
// Proyecto compartido con Tabula, Barri, Lectori y Calculi ("mis-apps-educativas"). Estos valores identifican
// el proyecto; no son secretos. La seguridad la dan las reglas de Firestore (bloque de Charta en firestore.rules).
export const firebaseConfig = {
  apiKey: "AIzaSyC00dEFMyJ48KM--iClXSFUbbMtoHV3ejc",
  authDomain: "mis-apps-educativas.firebaseapp.com",
  projectId: "mis-apps-educativas",
  storageBucket: "mis-apps-educativas.firebasestorage.app",
  messagingSenderId: "98830326152",
  appId: "1:98830326152:web:bd3ff75a1f83ac5fd2c23d",
};

/** Versión del SDK (CDN oficial de Google; la misma que Tabula). El service worker la guarda para usarla sin conexión. */
export const FIREBASE_SDK = "12.19.0";

/** Ruta de las fichas: /apps/charta/fichas/{id}. */
export const RUTA_FICHAS = ["apps", "charta", "fichas"];
