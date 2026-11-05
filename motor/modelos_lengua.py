"""Charta · Lengua (solo en la app; ver LENGUA_1.md). Mismo formato que modelos.MODELOS.
Bloques propios de la materia (los números no chocan: el catálogo agrupa los bloques por materia).
Sin rango numérico (como geometría). Los modelos se añaden por lotes (lotes 1–5 de LENGUA_1.md)."""

MATERIA = "lengua"
NOMBRE = "Lengua"
FUENTE = "fredoka"          # letra por defecto de la materia (el selector de letra sigue funcionando)

BLOQUES = {
    1: "Conciencia fonológica",
    2: "Letras y sonidos",
    3: "Sílabas",
    4: "Palabras",
    5: "Frases",
    6: "Ortografía básica",
    7: "Comprensión lectora",
    8: "Escritura y caligrafía",
}

# ------------------------------------------------------------------ opciones comunes (LENGUA_1.md, §2)
# «Letras: todas» (aún no hay orden de letras del método): por eso no hay opción de letras vistas, salvo elegir una letra concreta donde el modelo la pide.
from modelos import M, op, COMPLETA, AMBOS

TIPO = op("tipo", "Tipo de sílabas", [(None, "Directas (ma, pe)"), ("inversas", "Con inversas (al, en)"), ("trabadas", "Con trabadas (pla, bra)"), ("mixtas", "Con mixtas (con, sol)")])
CASO = op("caso", "Letra", [(None, "minúscula"), ("inicial", "Mayúscula inicial"), ("mayus", "MAYÚSCULAS")])
CASO_LETRA = op("caso", "Letra", [(None, "minúscula"), ("mayus", "MAYÚSCULA")])
LETRAS = list("abcdefghijklmnñopqrstuvwxyz")
CONSONANTES = ["m", "p", "s", "l", "t", "d", "n", "f", "b", "v", "r", "j", "c", "z", "g", "h", "ñ", "ch", "ll"]
SIN_RARAS = [l for l in LETRAS if l not in "kqwxy"]      # letras con palabras de sobra para rodearlas en una lista

def _largo(etiqueta, valores):
    return op("largo", etiqueta, valores)
LARGO_1_4 = _largo("Sílabas de cada palabra", [(None, "Variadas"), (1, "1 sílaba"), (2, "2 sílabas"), (3, "3 sílabas"), (4, "4 sílabas")])
LARGO_2_4 = _largo("Sílabas de cada palabra", [(None, "Variadas"), (2, "2 sílabas"), (3, "3 sílabas"), (4, "4 sílabas")])

def _l(bloque, familia, clave, nombre, descripcion, opciones, titulo, color, tam=AMBOS):
    """Modelo de Lengua: sin rango numérico (rmin=None), con su título y su color de panel."""
    return {**M(bloque, familia, clave, nombre, descripcion, opciones, rmin=None, tam=tam), "materia": MATERIA, "titulo": titulo, "color": color}

MODELOS_LENGUA = []

# ------------------------------------------------------------------ lote 1 · bloque 2 (letras) y bloque 3 (sílabas)
MODELOS_LENGUA += [
    _l(2, "letra", "busca", "Rodea la letra", "Filas de letras sueltas: rodear todas las que son iguales a la pedida.",
       [op("letra", "Letra que se busca", [(None, "Al azar")] + [(l, l) for l in LETRAS]),
        op("distractoras", "Las otras letras", [(None, "Al azar"), ("confusas", "Las que se confunden (b-d-p-q, m-n, u-n…)")]), CASO_LETRA],
       "RODEA LA LETRA", "amarillo"),
    _l(2, "letra", "enpalabras", "Rodea la letra en las palabras", "Una lista de palabras: rodear la letra pedida en cada una y contar cuántas veces sale.",
       [op("letra", "Letra que se busca", [(None, "Al azar")] + [(l, l) for l in SIN_RARAS]),
        op("tarea", "Tarea", [(None, "Rodear y contar cuántas veces"), ("rodea", "Solo rodear")]), TIPO, CASO],
       "RODEA LA LETRA EN LAS PALABRAS", "rosa"),
    _l(2, "letra", "falta", "Pon la letra que falta", "Palabras con una letra en hueco (m_sa), con tres letras para elegir o sin ayuda.",
       [op("ayuda", "Ayuda", [(None, "Con tres letras para elegir"), ("sin", "Sin ayuda")]),
        op("hueco", "Letra que falta", [(None, "Cualquier letra"), ("primera", "La primera")]), TIPO, LARGO_1_4, CASO],
       "PON LA LETRA QUE FALTA", "azul"),
    _l(2, "letra", "vocales", "Completa las vocales", "Palabras con las vocales en hueco (p_l_t_): escribirlas.",
       [op("faltan", "Vocales que faltan", [(None, "Todas"), ("una", "Una"), ("azar", "Algunas (al azar)")]), TIPO, LARGO_1_4, CASO],
       "COMPLETA LAS VOCALES", "verde"),
    _l(2, "letra", "parejas", "Mayúscula y minúscula", "Unir cada mayúscula con su minúscula, o escribir la que falta.",
       [op("tarea", "Tarea", [(None, "Unir"), ("escribe", "Escribir la que falta")])],
       "MAYÚSCULA Y MINÚSCULA", "amarillo", COMPLETA),
    _l(2, "letra", "abecedario", "Antes y después", "La letra de antes, la de después o las dos, con el abecedario (con ñ).",
       [op("modo", "Letras", [(None, "La de antes y la de después"), ("anterior", "Solo la de antes"), ("posterior", "Solo la de después")]), CASO_LETRA],
       "ANTES Y DESPUÉS", "rosa"),
    _l(3, "silaba", "tabla", "Lee las sílabas", "Tabla de lectura de sílabas (ma me mi mo mu…) para leer en voz alta.",
       [op("letra", "Letra", [(None, "Todas")] + [(c, c) for c in CONSONANTES]),
        TIPO, op("orden", "Orden", [(None, "Ordenadas"), ("mezcladas", "Mezcladas")]), CASO_LETRA],
       "LEE LAS SÍLABAS", "azul", COMPLETA),
    _l(3, "silaba", "junta", "Junta las sílabas", "Juntar sílabas para formar la palabra (ca + sa), escribiéndola o uniendo columnas.",
       [op("tarea", "Tarea", [(None, "Escribir la palabra"), ("une", "Unir las sílabas")]),
        op("largo", "Sílabas de cada palabra", [(None, "2 sílabas"), (3, "3 sílabas"), ("variadas", "2 y 3 sílabas")]), TIPO, CASO],
       "JUNTA LAS SÍLABAS", "verde"),
    _l(3, "silaba", "separa", "Separa en sílabas", "Separar cada palabra en sílabas: en casillas o con rayas.",
       [op("modo", "Cómo se separa", [(None, "En casillas"), ("rayas", "Con rayas")]), LARGO_2_4, TIPO, CASO],
       "SEPARA EN SÍLABAS", "amarillo"),
    _l(3, "silaba", "ordena", "Ordena las sílabas", "Sílabas desordenadas: escribir la palabra (ta · pe · lo = pelota).",
       [LARGO_2_4, TIPO, CASO],
       "ORDENA LAS SÍLABAS", "rosa"),
    _l(3, "silaba", "falta", "Pon la sílaba que falta", "Palabras con una sílaba en hueco (pe__ta), con tres sílabas para elegir o sin ayuda.",
       [op("ayuda", "Ayuda", [(None, "Con tres sílabas para elegir"), ("sin", "Sin ayuda")]),
        op("hueco", "Sílaba que falta", [(None, "Cualquiera"), ("primera", "La primera"), ("ultima", "La última")]), LARGO_2_4, TIPO, CASO],
       "PON LA SÍLABA QUE FALTA", "azul"),
]
