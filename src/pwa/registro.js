// Charta · registro del service worker (paso 4.5) y aviso de versión nueva. Sin efecto fuera del navegador.
export function registrarSW(avisar) {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator) || location.protocol === "file:") return;
  const habia = !!navigator.serviceWorker.controller;
  // sw.js está en la raíz del repositorio (../ desde dist/): así su scope es /Charta/.
  navigator.serviceWorker.register(new URL("../sw.js", location.href), { scope: new URL("../", location.href).pathname })
    .catch(() => {});
  // Solo se avisa si ya había una versión (la primera instalación no interrumpe).
  navigator.serviceWorker.addEventListener("controllerchange", () => { if (habia) avisar(); });
}
