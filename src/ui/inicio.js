// Charta · lógica de la pantalla de inicio (paso 4.8). Sin DOM: se prueba en Node.
// Solo presentación y navegación; no toca la generación de fichas. Nunca guarda nombres de alumnos.

/** Modelos que se ofrecen como accesos rápidos mientras no hay historial. */
export const DEFECTO = ["sumar.h20", "restar.r20", "orden.signos", "rep.dado"];
export const MAX_RAPIDOS = 4;
const CLAVE_USOS = "charta:usos";

/** «Buenos días / Buenas tardes / Buenas noches», con el nombre de pila si lo hay. */
export function saludo(hora, nombre) {
  const h = Math.floor(+hora);
  const s = h >= 6 && h < 13 ? "Buenos días" : h >= 13 && h < 21 ? "Buenas tardes" : "Buenas noches";
  const n = String(nombre || "").trim().split(/\s+/)[0];
  return n ? `${s}, ${n}` : s;
}

/** «2026-11-05» → «5-11-2026». */
export const fechaCorta = (f) => (f ? String(f).slice(0, 10).split("-").reverse().map(Number).join("-") : "");

/** Cuántas veces se ha elegido cada modelo como actividad 1 (solo ids y números, en este dispositivo). */
export function crearUsos(almacen) {
  const leer = () => { try { const v = JSON.parse(almacen.getItem(CLAVE_USOS) || "{}"); return v && typeof v === "object" && !Array.isArray(v) ? v : {}; } catch { return {}; } };
  return {
    mapa: leer,
    anotar(id) {
      if (!id) return;
      const v = leer(); v[id] = (v[id] | 0) + 1;
      // Se conservan los 40 más usados: el mapa no crece sin límite.
      const top = Object.fromEntries(Object.entries(v).sort((a, b) => b[1] - a[1]).slice(0, 40));
      try { almacen.setItem(CLAVE_USOS, JSON.stringify(top)); } catch {}
    },
  };
}

/** Hasta `max` modelos: los más usados (desempata el más reciente); si faltan, los de DEFECTO. Solo los que existen. */
export function accesosRapidos({ usos = {}, recientes = [], ultimo = null, hayTipo = () => true, max = MAX_RAPIDOS } = {}) {
  const orden = [ultimo, ...recientes.flatMap((c) => (c.actividades || []).map((a) => a.tipo)), ...Object.keys(usos)].filter(Boolean);
  const vistos = [...new Set(orden)].filter(hayTipo);
  vistos.sort((a, b) => (usos[b] | 0) - (usos[a] | 0) || orden.indexOf(a) - orden.indexOf(b));
  return [...new Set([...vistos, ...DEFECTO.filter(hayTipo)])].slice(0, max);
}

/** Qué abre «Seguir con la última»: la última impresa (si sus tipos siguen existiendo) o el último modelo elegido. */
export function ultimaComposicion({ recientes = [], ultimo = null, hayTipo = () => true } = {}) {
  const c = recientes.find((r) => r.actividades?.length && r.actividades.every((a) => hayTipo(a.tipo)));
  if (c) return { composicion: c };
  return ultimo && hayTipo(ultimo) ? { modelo: ultimo } : null;
}

/** Materias disponibles (unión de todos los cursos), en el orden del catálogo: [{ id, nombre }]. */
export function materiasDisponibles(cursos, materias) {
  const vistas = new Map();
  for (const c of cursos()) for (const m of materias(c.id)) if (!vistas.has(m.id)) vistas.set(m.id, m);
  return [...vistas.values()];
}
