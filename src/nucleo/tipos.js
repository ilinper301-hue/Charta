// Charta · registro de tipos de ejercicio. Cada tipo es un módulo con:
//   id        = id de MODELOS ("sumar.h20")
//   version   entero; subirlo si cambia la forma de `datos` o `solucion`
//   generar(params, azar, { tamano }) → { enunciado, ejemplo?, ejercicios: [{ datos, solucion, pasos? }] }
//   render(actividad, modo)  (paso 2.3; modos "papel", "pantalla", "solucion")
// Documentar en cada módulo la forma de `datos` y `solucion`.

const REGISTRO = new Map();

export function registrar(t) {
  if (!t || typeof t.id !== "string") throw new Error("registrar(): falta el id del tipo");
  if (!Number.isInteger(t.version) || t.version < 1) throw new Error(`${t.id}: version debe ser un entero ≥ 1`);
  if (typeof t.generar !== "function") throw new Error(`${t.id}: falta generar()`);
  if (REGISTRO.has(t.id)) throw new Error(`${t.id}: tipo registrado dos veces`);
  REGISTRO.set(t.id, t);
  return t;
}

export function tipo(id) { return REGISTRO.get(id) || null; }
export function hayTipo(id) { return REGISTRO.has(id); }
export function listaTipos() { return [...REGISTRO.keys()]; }
