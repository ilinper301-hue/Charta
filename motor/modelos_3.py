"""Charta · Matemáticas de 3.º (ver MATES_3.md).

Igual que 2.º (modelos_2.py): los modelos de 1.º/2.º que sirven en 3.º no cambian de id; tools/catalogo.py les
añade `cursos: {"3": {"rangos": [...], "rango": N}}`. Los nuevos de 3.º (✨) van en MODELOS_3 con curso 3.
Rangos de 1000 en 1000 y 9999 (por defecto 9999). Números de cuatro cifras SIN punto de millares (4352).
"""

from modelos import M, op, AMBOS, COMPLETA

CURSO = 3
NOMBRE = "3.º de Primaria"
BLOQUES_3 = {}   # Dividir, Fracciones y Pensamiento computacional llegan en sus lotes
RANGOS_3 = (1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 9999)


def rangos(rmin=1000, rmax=9999):
    return [r for r in RANGOS_3 if rmin <= r <= rmax]


# id → (rango mínimo, rango máximo, rango por defecto) en 3.º. Se amplía lote a lote.
EN_3 = {
    # Lote 0 · representaciones con millares (con 1000, las de centenas de 2.º: repaso)
    **{i: (1000, 9999, 9999) for i in ("rep.bloques", "rep.abaco", "rep.du", "rep.letras", "rep.recta", "rep.descomp")},
    "combinada.combinada": (2000, 9999, 9999),   # ¿Qué número es? solo con millares (sus 6 representaciones llegan a 9999)
}


def _n3(bloque, familia, clave, nombre, descripcion, opciones, titulo, color, rangos_=None, rango=None, tam=AMBOS):
    """✨ Modelo que solo existe en 3.º: curso 3, título (mayúsculas) y color de panel. `rangos_`: lista propia."""
    m = M(bloque, familia, clave, nombre, descripcion, opciones, tam=tam)
    rg = list(rangos_ or [])
    return {**m, "curso": CURSO, "rangos": rg, "rango": (rango if rango in rg else rg[-1]) if rg else None, "titulo": titulo, "color": color}


MODELOS_3 = [
    # Lote 0 · números romanos hasta 100 (I, V, X, L, C)
    _n3(1, "rep", "romanos", "Los números romanos", "Pasar de números romanos (I, V, X, L, C) a números y al revés, hasta 100.",
        [op("modo", "Tarea", [(None, "Los dos sentidos"), ("leer", "Romano → número (XIV = 14)"), ("escribir", "Número → romano (14 = XIV)")]),
         {"id": "ayuda", "etiqueta": "Con la tabla de los símbolos", "tipo": "si_no", "defecto": True}],
        "LOS NÚMEROS ROMANOS", "verde", rangos_=[20, 50, 100], rango=100),
]


def cursos_extra(m):
    """{"3": {"rangos", "rango"}} si el modelo (dict del catálogo) también está en 3.º; {} si no."""
    if m["id"] not in EN_3: return {}
    lo, hi, d = EN_3[m["id"]]
    rg = rangos(lo, hi)
    return {str(CURSO): {"rangos": rg, "rango": d if d in rg else rg[0]}}
