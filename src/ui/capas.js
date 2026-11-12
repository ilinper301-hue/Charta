// Charta · capas encima de la pantalla (selector; después hojas inferiores y menús) y el botón Atrás de Android
// (PLAN-DISENO fase 1, R2). Cada capa apunta una entrada de historial al abrirse; Atrás cierra siempre la de arriba.
// Al cerrarla desde la propia capa (✕, Escape, elegir) se vuelve atrás en el historial y lo que haya que hacer
// después (p. ej. ir al diseño, que apunta su propia entrada) se ejecuta cuando el historial ya ha vuelto.
// Este módulo escucha `popstate` antes que app.js y, si la vuelta era de una capa, no deja que llegue a la app.
const pila = [];
let ultimo = 0;
const enNavegador = typeof window !== "undefined" && typeof history !== "undefined";

function quitar(capa) {
  pila.splice(pila.indexOf(capa), 1);
  try { capa.alCerrar(); } finally { const f = capa.despues; capa.despues = null; f?.(); }
}

/** Abre una capa. alCerrar() la quita de la pantalla (sin tocar el historial). → { cerrar(despues?) } */
export function abrirCapa(alCerrar) {
  const capa = { id: ++ultimo, alCerrar, despues: null, cerrando: false };
  pila.push(capa);
  if (enNavegador) try { history.pushState({ ...(history.state || {}), capa: capa.id }, ""); } catch {}
  return {
    cerrar(despues) {
      if (capa.cerrando || !pila.includes(capa)) return;
      capa.cerrando = true; capa.despues = despues || null;
      if (enNavegador && history.state?.capa === capa.id) history.back();   // popstate la quitará
      else quitar(capa);
    },
  };
}

/** ¿Hay alguna capa abierta? */
export const hayCapas = () => pila.length > 0;

if (enNavegador) {
  // Recarga con una capa abierta: la entrada quedó en el historial sin capa; se limpia.
  if (history.state?.capa) try { const { capa: _, ...resto } = history.state; history.replaceState(Object.keys(resto).length ? resto : null, ""); } catch {}
  addEventListener("popstate", (ev) => {
    if (!pila.length) return;
    const n = history.state?.capa || 0;
    let cerro = false;
    while (pila.length && pila.at(-1).id > n) { quitar(pila.at(-1)); cerro = true; }
    if (cerro) ev.stopImmediatePropagation();
  });
}
