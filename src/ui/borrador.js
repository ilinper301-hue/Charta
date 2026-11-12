// Charta · borrador de la ficha que se está componiendo (PLAN-DISENO fase 1, R1). Sin DOM: el almacén se inyecta.
// Se guarda en cada cambio y se recupera al abrir («Seguir con la última»). Decidido por Iván (12-11-2026):
// el borrador CONSERVA los nombres de los alumnos, pero solo aquí, en `charta:borrador` de este dispositivo,
// y APARTE de la composición: { v, composicion, alumnos, copias, grupo, fecha }. La composición pasa por
// limpiar() como las favoritas, así que los nombres nunca llegan al JSON de la ficha, a la nube, a favoritas,
// recientes, URL, Tabula ni Fori. Se borra al imprimir o con «Descartar borrador».
import { limpiar } from "./guardadas.js";
import { composicionValida } from "./tabula.js";

export const CLAVE_BORRADOR = "charta:borrador";
const MAX_TEXTO = 10000;   // texto de la caja de alumnos (30 nombres de sobra)

export function crearBorrador(almacen) {
  return {
    /** Guarda la composición en curso y, aparte, el texto de alumnos tal cual. */
    guardar(comp, { alumnos = "", copias = 1, grupo = "" } = {}, ahora = new Date()) {
      try {
        const b = { v: 1, composicion: limpiar(comp), alumnos: String(alumnos || "").slice(0, MAX_TEXTO),
          copias: Math.max(1, Math.min(30, copias | 0 || 1)), ...(grupo && { grupo: String(grupo).slice(0, 100) }), fecha: ahora.toISOString() };
        almacen.setItem(CLAVE_BORRADOR, JSON.stringify(b));
        return true;
      } catch { return false; }
    },
    /** → { composicion, alumnos, copias, grupo?, fecha } o null (sin borrador, roto o con modelos que ya no existen). */
    leer(hayTipo = () => true) {
      try {
        const b = JSON.parse(almacen.getItem(CLAVE_BORRADOR) || "null");
        if (!b || b.v !== 1) return null;
        const c = composicionValida(b.composicion, hayTipo);
        if (!c) return null;
        return { composicion: limpiar(c), alumnos: typeof b.alumnos === "string" ? b.alumnos : "", copias: b.copias | 0 || 1,
          ...(typeof b.grupo === "string" && b.grupo && { grupo: b.grupo }), fecha: String(b.fecha || "") };
      } catch { return null; }
    },
    hay(hayTipo) { return !!this.leer(hayTipo); },
    descartar() { try { almacen.removeItem(CLAVE_BORRADOR); } catch {} },
  };
}
