// Charta · selector de actividad a pantalla completa (paso 4.1).
// abrirSelector({ actual, tamano, alElegir }) — los niveles con una sola opción se saltan solos,
// pero quedan en la ruta (migas) para poder volver.
import { modelo } from "../nucleo/ficha.js";
import { PALETA } from "../render/hoja.js";
import { cursos, materias, bloques, modelos, miniatura } from "./navegacion.js";

function el(tag, props = {}, ...hijos) { const e = Object.assign(document.createElement(tag), props); e.append(...hijos); return e; }

const NIVELES = ["curso", "materia", "bloque", "modelo"];
const TITULOS = { curso: "Elige el curso", materia: "Elige la materia", bloque: "Elige el contenido", modelo: "Elige el modelo" };

export function abrirSelector({ actual = null, tamano = "completa", alElegir, alCerrar } = {}) {
  // Ruta inicial: la del modelo actual (se abre en su bloque) o vacía.
  const ruta = {};
  if (actual) { const m = modelo(actual); Object.assign(ruta, { curso: m.curso, materia: m.materia, bloque: m.bloque }); }

  const migas = el("nav", { className: "migas" });
  const titulo = el("h2");
  const rejilla = el("div", { className: "rejilla" });
  const atras = el("button", { className: "sel-atras", textContent: "←", title: "Atrás" });
  const cerrar = el("button", { className: "sel-cerrar", textContent: "✕", title: "Cerrar" });
  const capa = el("div", { className: "selector", role: "dialog" },
    el("div", { className: "sel-cab" }, atras, titulo, cerrar), migas, rejilla);
  document.body.append(capa);
  document.body.classList.add("con-selector");

  const opciones = (nivel) => nivel === "curso" ? cursos()
    : nivel === "materia" ? materias(ruta.curso)
    : nivel === "bloque" ? bloques(ruta.curso, ruta.materia)
    : modelos(ruta.curso, ruta.materia, ruta.bloque, tamano);
  const nombreDe = (nivel) => opciones(nivel).find((o) => o.id === ruta[nivel])?.nombre ?? "";

  // Primer nivel sin elegir; los de una sola opción se eligen solos.
  function nivelActual() {
    for (const n of NIVELES.slice(0, 3)) {
      if (ruta[n] === undefined) {
        const os = opciones(n);
        if (os.length === 1) ruta[n] = os[0].id; else return n;
      }
    }
    return "modelo";
  }
  const automatico = (n) => opciones(n).length === 1;

  function fin(id) {
    capa.remove(); document.body.classList.remove("con-selector");
    if (id) alElegir?.(id); else alCerrar?.();
  }

  function pintar() {
    const nivel = nivelActual(), i = NIVELES.indexOf(nivel);
    titulo.textContent = TITULOS[nivel];
    migas.replaceChildren(...NIVELES.slice(0, i).flatMap((n, k) => {
      const b = el("button", { textContent: nombreDe(n) });
      b.onclick = () => { for (const x of NIVELES.slice(k)) delete ruta[x]; pintar(); };
      return k ? [el("span", { textContent: "›" }), b] : [b];
    }));
    // Atrás: al nivel anterior que no sea automático; si no hay, cierra.
    atras.onclick = () => {
      const previos = NIVELES.slice(0, i).filter((n) => !automatico(n));
      if (!previos.length) return fin(null);
      for (const x of NIVELES.slice(NIVELES.indexOf(previos.at(-1)))) delete ruta[x];
      pintar();
    };
    rejilla.className = "rejilla" + (nivel === "modelo" ? " modelos" : "");
    const os = opciones(nivel);
    rejilla.replaceChildren(...os.map((o) => nivel === "modelo" ? tarjetaModelo(o) : tarjetaNivel(nivel, o)));
    rejilla.scrollTop = 0;
    if (nivel === "modelo") cargarMiniaturas();
  }

  function tarjetaNivel(nivel, o) {
    const b = el("button", { className: "sel-tarjeta" }, el("strong", { textContent: o.nombre }));
    if (o.n) b.append(el("small", { textContent: `${o.n} modelo${o.n > 1 ? "s" : ""}` }));
    b.onclick = () => { ruta[nivel] = o.id; pintar(); };
    return b;
  }

  function tarjetaModelo(o) {
    const [fondo, borde] = PALETA[o.color] ?? PALETA.verde;
    const mini = el("div", { className: "mini" });
    mini.style.background = fondo; mini.style.borderColor = borde;
    mini.dataset.id = o.id;
    const b = el("button", { className: "sel-tarjeta modelo" + (o.id === actual ? " actual" : ""), disabled: !o.cabe },
      mini, el("strong", { textContent: o.nombre }), el("small", { textContent: o.cabe ? o.descripcion : "Solo en página completa (una actividad)." }),
      el("small", { className: "meta", textContent: `${"●".repeat(o.dificultad)}${"○".repeat(3 - o.dificultad)} · ${o.minutos} min`, title: `Dificultad ${o.dificultad} de 3 (${["refuerzo", "estándar", "ampliación"][o.dificultad - 1]}) · unos ${o.minutos} minutos` }));
    b.onclick = () => fin(o.id);
    return b;
  }

  // Miniaturas de una en una, sin bloquear la pantalla.
  function cargarMiniaturas() {
    const pend = [...rejilla.querySelectorAll(".mini")];
    const paso = () => {
      const m = pend.shift();
      if (!m || !m.isConnected) return;
      try { m.innerHTML = miniatura(m.dataset.id); } catch { m.textContent = "—"; }
      setTimeout(paso, 0);
    };
    setTimeout(paso, 0);
  }

  cerrar.onclick = () => fin(null);
  capa.addEventListener("keydown", (e) => { if (e.key === "Escape") fin(null); });
  pintar();
  atras.focus();
}
