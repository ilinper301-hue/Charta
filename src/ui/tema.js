// Charta · tema claro / oscuro / automático (como Tabula). Se guarda en charta:tema. El modo oscuro es solo de la app:
// las fichas (papel) se ven siempre blancas, como saldrán impresas.
export const TEMAS = ["sistema", "claro", "oscuro"];
const CLAVE = "charta:tema";
const NOMBRES = { sistema: "Tema: automático", claro: "Tema: claro", oscuro: "Tema: oscuro" };
const ICONOS = {
  sistema: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 0 0 16Z" fill="currentColor"/>',
  claro: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  oscuro: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>',
};
export const siguienteTema = (t) => TEMAS[(TEMAS.indexOf(t) + 1) % TEMAS.length];
export const esOscuro = (t, sistemaOscuro) => t === "oscuro" || (t === "sistema" && !!sistemaOscuro);

export function iniciarTema(boton) {
  const leer = () => { try { const t = localStorage.getItem(CLAVE); return TEMAS.includes(t) ? t : "sistema"; } catch { return "sistema"; } };
  const mq = matchMedia("(prefers-color-scheme: dark)");
  let tema = leer();
  function aplicar() {
    const oscuro = esOscuro(tema, mq.matches);
    if (oscuro) document.documentElement.dataset.tema = "oscuro"; else delete document.documentElement.dataset.tema;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = oscuro ? "#1A1D1B" : "#FAF9F5";
    boton.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${ICONOS[tema]}</svg>`;
    boton.title = NOMBRES[tema]; boton.setAttribute("aria-label", NOMBRES[tema]);
  }
  boton.onclick = () => { tema = siguienteTema(tema); try { localStorage.setItem(CLAVE, tema); } catch {} aplicar(); };
  mq.addEventListener("change", aplicar);
  aplicar();
}
