// Charta · ayudantes mínimos de DOM compartidos por las vistas de src/ui/ (fase 2 de PLAN-DISENO).
export const $ = (id) => document.getElementById(id);
export function el(tag, props = {}, ...hijos) { const e = Object.assign(document.createElement(tag), props); e.append(...hijos); return e; }
