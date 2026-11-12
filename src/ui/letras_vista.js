// Charta · mapa de letras y «Mis frases» (Lengua de 1.º; fase 2 de PLAN-DISENO, antes en app.js).
// crearLetrasVista(ctx) → { marcadas, obligatorias, misFrases(), pintarLetras(), pintarMisFrases(), actividadesBase(), actividades() }
import { ABECEDARIO } from "../lengua/reglas.js";
import { VOCALES, CLAVE_LETRAS, CLAVE_OBLIGATORIAS, conLetras, vistasDe, resumenLetras, CLAVE_FRASES, conFrases, resumenFrases } from "./letras.js";
import { $, el } from "./dom.js";

export function crearLetrasVista(ctx) {
  const pintar = () => ctx.previa.pintar();
  // Mapa de letras (Lengua de 1.º): marcadas = pueden salir. Se recuerdan las últimas (las que lleva la clase).
  const marcadas = new Set(ABECEDARIO);
  try { const g = localStorage.getItem(CLAVE_LETRAS); if (g !== null) { marcadas.clear(); for (const l of g) if (ABECEDARIO.includes(l)) marcadas.add(l); } } catch {}
  // Obligatorias (pulsación larga): todas las palabras y frases llevan al menos una. Siempre están también marcadas.
  const obligatorias = new Set();
  try { for (const l of localStorage.getItem(CLAVE_OBLIGATORIAS) || "") if (ABECEDARIO.includes(l)) { obligatorias.add(l); marcadas.add(l); } } catch {}
  const teclas = ABECEDARIO.map((l) => {
    const b = el("button", { type: "button", textContent: l, className: VOCALES.includes(l) ? "vocal" : "" });
    let reloj = null, larga = false;
    const parar = () => { clearTimeout(reloj); reloj = null; };
    b.addEventListener("pointerdown", () => {
      larga = false; parar();
      reloj = setTimeout(() => {
        reloj = null; larga = true;
        if (obligatorias.has(l)) obligatorias.delete(l); else { obligatorias.add(l); marcadas.add(l); }
        try { navigator.vibrate?.(30); } catch {}
        cambiarLetras();
      }, 500);
    });
    for (const ev of ["pointerup", "pointerleave", "pointercancel"]) b.addEventListener(ev, parar);
    b.addEventListener("contextmenu", (e) => e.preventDefault());   // en Android, la pulsación larga abre el menú
    b.onclick = () => {
      if (larga) { larga = false; return; }   // la pulsación larga ya ha hecho su cambio
      if (obligatorias.has(l)) obligatorias.delete(l);   // tocar una obligatoria la deja solo marcada
      else if (marcadas.has(l)) marcadas.delete(l); else marcadas.add(l);
      cambiarLetras();
    };
    return b;
  });
  $("mapaLetras").replaceChildren(...teclas);
  function pintarLetras() {
    teclas.forEach((b, i) => {
      const l = ABECEDARIO[i], on = marcadas.has(l), ob = obligatorias.has(l);
      b.setAttribute("aria-pressed", on); b.classList.toggle("obligatoria", ob);
      b.title = ob ? "Obligatoria: todas las palabras la llevan (toca para que solo pueda salir)" : on ? "Puede salir (toca para quitarla; mantén pulsada para hacerla obligatoria)" : "No sale (toca para ponerla)";
    });
    $("letrasCuenta").textContent = resumenLetras(marcadas, obligatorias);
  }
  function cambiarLetras(guardar = true) {
    for (const l of [...obligatorias]) if (!marcadas.has(l)) obligatorias.delete(l);   // una letra que no sale no puede ser obligatoria
    if (guardar) try { localStorage.setItem(CLAVE_LETRAS, ABECEDARIO.filter((l) => marcadas.has(l)).join("")); localStorage.setItem(CLAVE_OBLIGATORIAS, ABECEDARIO.filter((l) => obligatorias.has(l)).join("")); } catch {}
    pintarLetras(); pintar();
  }
  const atajo = (id, ls) => { $(id).onclick = () => { marcadas.clear(); for (const l of ls) marcadas.add(l); cambiarLetras(); }; };
  atajo("letrasTodas", ABECEDARIO); atajo("letrasVocales", VOCALES); atajo("letrasNinguna", "");
  pintarLetras();
  // «Mis frases»: las de la clase se recuerdan en el dispositivo; viajan en la composición (params.misFrases).
  try { $("misFrases").value = localStorage.getItem(CLAVE_FRASES) || ""; } catch {}
  const misFrases = () => resumenFrases($("misFrases").value, null).frases;
  function pintarMisFrases() {
    const r = resumenFrases($("misFrases").value, vistasDe(marcadas));
    $("misFrasesCuenta").textContent = r.cuenta ? `(${r.cuenta})` : ""; $("misFrasesInfo").textContent = r.info; $("misFrasesInfo").hidden = !r.info;
  }
  $("misFrases").addEventListener("change", () => { try { localStorage.setItem(CLAVE_FRASES, $("misFrases").value); } catch {} pintar(); });
  $("misFrases").addEventListener("input", pintarMisFrases);
  // Composición: las letras en cada actividad; «Mis frases» una sola vez (fase 1, R4). Al generar, en cada actividad que las usa.
  const actividadesBase = () => conLetras(ctx.comp.editores.map((e) => e.leer()), vistasDe(marcadas), ABECEDARIO.filter((l) => obligatorias.has(l)).join(""));
  const actividades = () => conFrases(actividadesBase(), misFrases());
  return { marcadas, obligatorias, misFrases, pintarLetras, pintarMisFrases, actividadesBase, actividades };
}
