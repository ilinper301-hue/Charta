// Charta · banco de nombres propios de 1.º para orto.mayuscula (lote 2). Sin DOM.
// Sin nombres que empiecen por «I» (la «I» mayúscula de Fredoka se confunde con la «l») ni que sean también una palabra común del léxico
// (Rosa, Luna, Pilar…): la invariante lo comprueba. `hint` = la pista que se lee al lado («una niña»).
const mk = (cat, hint, nombres) => nombres.split(" ").map((n) => ({ n, cat, hint }));

export const NINOS = mk("personas", "un niño", "Pablo Hugo Mateo Lucas Daniel Manuel Pedro Juan Diego Carlos Jorge Nico Sergio Marcos Tomás David Leo Toni Raúl Luis");
export const NINAS = mk("personas", "una niña", "Ana Marta Laura Lucía Sara Paula Elena Carla Julia Nuria Eva Noa Sofía Rocío Lola Teresa Pepa Carmen Mónica Alicia");
export const MASCOTAS = [
  ...mk("mascotas", "un perro", "Toby Coco Bruno Fido Rufo"),
  ...mk("mascotas", "una perra", "Nala Kira Peta"),
  ...mk("mascotas", "un gato", "Misi Tom Félix"),
  ...mk("mascotas", "una gata", "Mimi Mina"),
  ...mk("mascotas", "un pájaro", "Pipo"),
  ...mk("mascotas", "un conejo", "Nano"),
];
export const LUGARES = [
  ...mk("lugares", "una ciudad", "Sevilla Granada Málaga Córdoba Jaén Almería Huelva Cádiz Madrid Toledo Marbella"),
  ...mk("lugares", "un pueblo", "Ronda Jerez Antequera Motril"),
];
/** Todos los nombres: { n, cat: "personas" | "mascotas" | "lugares", hint }. */
export const NOMBRES = [...NINOS, ...NINAS, ...MASCOTAS, ...LUGARES];
/** Nombres de una categoría ("personas", "mascotas", "lugares") o de todas (null). */
export const nombresDe = (cat) => (cat ? NOMBRES.filter((x) => x.cat === cat) : NOMBRES);
