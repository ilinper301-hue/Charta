// Charta · tema claro / oscuro / automático (como Tabula). Se guarda en charta:tema. El modo oscuro es solo de la app:
// las fichas (papel) se ven siempre blancas, como saldrán impresas.
export const TEMAS = ["sistema", "claro", "oscuro"];
const CLAVE = "charta:tema";
export const NOMBRES_TEMA = { sistema: "Automático (el del sistema)", claro: "Claro", oscuro: "Oscuro" };
export const siguienteTema = (t) => TEMAS[(TEMAS.indexOf(t) + 1) % TEMAS.length];
export const esOscuro = (t, sistemaOscuro) => t === "oscuro" || (t === "sistema" && !!sistemaOscuro);

/** Aplica el tema guardado y lo sigue si cambia el del sistema. → { actual(), poner(t) } (lo usa Ajustes; fase 3: ya no hay botón en la cabecera). */
export function iniciarTema() {
  const leer = () => { try { const t = localStorage.getItem(CLAVE); return TEMAS.includes(t) ? t : "sistema"; } catch { return "sistema"; } };
  const mq = matchMedia("(prefers-color-scheme: dark)");
  let tema = leer();
  function aplicar() {
    const oscuro = esOscuro(tema, mq.matches);
    if (oscuro) document.documentElement.dataset.tema = "oscuro"; else delete document.documentElement.dataset.tema;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = oscuro ? "#171C1C" : "#FAF9F5";
  }
  mq.addEventListener("change", aplicar);
  aplicar();
  return { actual: () => tema, poner(t) { if (!TEMAS.includes(t)) return; tema = t; try { localStorage.setItem(CLAVE, t); } catch {} aplicar(); } };
}
