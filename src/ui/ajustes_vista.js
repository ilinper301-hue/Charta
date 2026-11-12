// Charta · Ajustes en una hoja inferior (fase 3 de PLAN-DISENO): cuenta, tema, letra y blanco y negro por defecto y
// borrador. Es el único sitio de la cuenta y del tema (antes también en la cabecera). La cuenta la pinta nube_vista.js
// en #iaCuenta / #iaCuentaTxt. crearAjustes(cb) → { abrir(), pintar() }
import { abrirHoja } from "./piezas.js";
import { TEMAS, NOMBRES_TEMA } from "./tema.js";
import { $, el } from "./dom.js";

export function crearAjustes(cb) {
  let abierta = false;
  $("iaTema").replaceChildren(...TEMAS.map((t) => el("option", { value: t, textContent: NOMBRES_TEMA[t] })));
  $("iaTema").onchange = () => cb.tema.poner($("iaTema").value);
  $("iaFuente").onchange = () => cb.ponerFuente($("iaFuente").value);
  $("iaBn").onchange = () => cb.ponerBn($("iaBn").checked);
  $("iaBorrador").onclick = () => { cb.descartarBorrador(); pintar(); };

  function pintar() {
    if (!abierta) return;
    const { fuentes, fuente } = cb.fuentes();
    $("iaFuente").replaceChildren(...fuentes.map((f) => el("option", { value: f.id, textContent: f.nombre, selected: f.id === fuente })));
    $("iaTema").value = cb.tema.actual();
    $("iaBn").checked = cb.bnDefecto();
    const hay = cb.hayBorrador();
    $("iaBorrador").disabled = !hay; $("iaBorrador").textContent = hay ? "Descartar borrador" : "No hay borrador";
  }
  function abrir() {
    abierta = true; pintar();
    abrirHoja({ titulo: "Ajustes", contenido: $("ajustes"), alCerrar: () => { abierta = false; } });
  }
  return { abrir, pintar };
}
