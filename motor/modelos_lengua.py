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
from modelos import M, op, num, COMPLETA, AMBOS

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

# ------------------------------------------------------------------ lote 2 · fono.* (bloque 1)
MODELOS_LENGUA += [
    # >>> FONO (agente fono)
    _l(1, "fono", "silabas", "Cuenta las sílabas", "Una palabra y casillas: una palmada por sílaba; colorear una casilla por palmada o escribir el número.",
       [op("respuesta", "Respuesta", [(None, "Colorear una casilla por sílaba"), ("numero", "Escribir el número")]), LARGO_1_4, TIPO, CASO],
       "CUENTA LAS SÍLABAS", "azul"),
    _l(1, "fono", "inicial", "¿Con qué letra suena?", "Palabra con la primera (o la última) letra en hueco y tres letras para rodear la que falta.",
       [op("posicion", "Letra que falta", [(None, "La del principio"), ("final", "La del final")]),
        op("letras", "Letras para elegir", [(None, "Todas"), ("vocales", "Solo vocales"), ("consonantes", "Solo consonantes")]), TIPO, CASO],
       "¿CON QUÉ LETRA SUENA?", "rosa"),
    _l(1, "fono", "posicion", "¿Dónde está el sonido?", "Una palabra y una letra: marcar si está al principio, en medio o al final.",
       [LARGO_2_4, TIPO, CASO],
       "¿DÓNDE ESTÁ EL SONIDO?", "verde"),
    _l(1, "fono", "rimas", "Une las que riman", "Dos columnas de palabras: unir las que terminan igual (gato – pato).",
       [op("rima", "Rima", [(None, "Misma última sílaba (gato – pato)"), ("vocal", "Desde la vocal fuerte (ratón – camión)")]),
        op("parejas", "Parejas", [(None, "5 parejas"), (4, "4 parejas"), (6, "6 parejas")]), TIPO, CASO],
       "UNE LAS QUE RIMAN", "amarillo", COMPLETA),
    _l(1, "fono", "quita", "Quita una sílaba", "«Si a ca-sa le quito ca, queda…»: escribir lo que queda al quitar la primera o la última sílaba.",
       [op("quitar", "Sílaba que se quita", [(None, "La primera"), ("ultima", "La última"), ("mezcla", "La primera o la última")]), LARGO_2_4, TIPO, CASO],
       "QUITA UNA SÍLABA", "azul"),
    _l(1, "fono", "larga", "La palabra más larga", "Grupos de tres palabras: rodear la que tiene más (o menos) sílabas.",
       [op("cual", "Rodear la que tiene", [(None, "Más sílabas"), ("menos", "Menos sílabas"), ("mezcla", "Más o menos (se indica en cada grupo)")]), TIPO, CASO],
       "LA PALABRA MÁS LARGA", "rosa"),
    # <<< FONO
]
# ------------------------------------------------------------------ lote 2 · palabra.* (bloque 4)
MODELOS_LENGUA += [
    # >>> PALABRA (agente palabra)
    _l(4, "palabra", "intrusa", "La que no es del grupo", "Filas de cuatro palabras de un campo (animales, comida…) con una intrusa: rodearla.",
       [op("campo", "Campo de las palabras", [(None, "Varios (uno distinto en cada fila)")] + [(c, c.capitalize()) for c in ("animales", "comida", "ropa", "casa", "escuela", "cuerpo", "juguetes", "transportes", "familia", "naturaleza")]), CASO],
       "LA QUE NO ES DEL GRUPO", "rosa"),
    _l(4, "palabra", "clasifica", "Cada palabra en su caja", "Un banco de palabras y dos o tres cajas con el nombre del grupo: escribir cada palabra donde va.",
       [op("cajas", "Cajas", [(None, "2 cajas"), (3, "3 cajas")]), CASO],
       "CADA PALABRA EN SU CAJA", "verde", COMPLETA),
    _l(4, "palabra", "letras", "Ordena las letras", "Letras desordenadas (o · g · t · a): escribir la palabra, con la primera letra marcada o sin marcar.",
       [op("letras", "Letras de cada palabra", [(None, "3 a 5 (variadas)"), (3, "3 letras"), (4, "4 letras"), (5, "5 letras")]),
        op("marca", "Primera letra", [(None, "Sin marcar"), ("primera", "Marcada")]), TIPO, CASO],
       "ORDENA LAS LETRAS", "azul"),
    _l(4, "palabra", "cuenta", "¿Cuántas letras?", "Una palabra y un hueco para el número de letras, o casillas (una por letra) y el número.",
       [op("letras", "Letras de cada palabra", [(None, "3 a 7 (variadas)"), (3, "3 letras"), (4, "4 letras"), (5, "5 letras"), (6, "6 letras")]),
        op("respuesta", "Respuesta", [(None, "Solo el número"), ("casillas", "Casillas y número")]), TIPO, CASO],
       "¿CUÁNTAS LETRAS?", "amarillo"),
    _l(4, "palabra", "articulo", "el, la, los, las", "Poner el artículo que va con cada nombre (___ gato).",
       [op("articulos", "Artículos", [(None, "el, la"), ("un", "un, una"), ("plural", "el, la, los, las"), ("unplural", "un, una, unos, unas")]), CASO_LETRA],
       "EL, LA, LOS, LAS", "rosa"),
    _l(4, "palabra", "plural", "Uno y muchos", "Escribir el plural de cada nombre (gato, gatos; flor, flores), o el singular a partir del plural.",
       [op("plural", "Plurales", [(None, "Solo -s"), ("es", "-s y -es")]),
        op("sentido", "Sentido", [(None, "De uno a muchos"), ("alreves", "De muchos a uno")]), CASO_LETRA],
       "UNO Y MUCHOS", "verde"),
    _l(4, "palabra", "contrarios", "Los contrarios", "Unir cada palabra con su contrario (grande, pequeño) o escribirlo. Banco fijo de unos 40 pares.",
       [op("tarea", "Tarea", [(None, "Unir con flechas"), ("escribe", "Escribir el contrario")]), CASO],
       "LOS CONTRARIOS", "azul"),
    _l(4, "palabra", "sopa", "Sopa de letras", "Una sopa de letras con 6 a 8 palabras de un campo; horizontal y vertical (y diagonal si se quiere).",
       [op("campo", "Campo de las palabras", [(None, "Al azar")] + [(c, c.capitalize()) for c in ("animales", "comida", "ropa", "casa", "escuela", "cuerpo", "juguetes", "transportes", "familia", "naturaleza", "colores")]),
        op("palabras", "Palabras escondidas", [(None, "8 palabras"), (7, "7 palabras"), (6, "6 palabras")]),
        op("direcciones", "Direcciones", [(None, "Horizontal y vertical"), ("diagonal", "También en diagonal")]),
        op("minus", "Letra", [(None, "MAYÚSCULAS"), ("minus", "minúscula")])],
       "SOPA DE LETRAS", "amarillo", COMPLETA),
    _l(4, "palabra", "dibuja", "Leo y dibujo", "Una palabra y un recuadro vacío: leer la palabra y dibujar lo que dice (solo nombres que se pueden dibujar). Sin corrección.",
       [_largo("Sílabas de cada palabra", [(None, "Variadas"), (1, "1 sílaba"), (2, "2 sílabas"), (3, "3 sílabas")]), TIPO, CASO],
       "LEO Y DIBUJO", "verde"),
    # <<< PALABRA
]
# ------------------------------------------------------------------ lote 2 · orto.* (bloque 6)
MODELOS_LENGUA += [
    # >>> ORTO (agente orto)
    _l(6, "orto", "elige", "Elige la letra", "Palabras con un hueco de ortografía (ca_po, pe_o, _eso): elegir entre dos opciones o escribir sin ayuda.",
       [op("regla", "Regla", [(None, "Mezcladas"), ("mpb", "m antes de p y b"), ("r", "r / rr"), ("cqu", "c / qu"), ("ggu", "g / gu"), ("cz", "c / z")]),
        op("ayuda", "Ayuda", [(None, "Con las dos opciones para elegir"), ("sin", "Sin ayuda")]), CASO],
       "ELIGE LA LETRA", "amarillo"),
    _l(6, "orto", "mayuscula", "Nombres con mayúscula", "Nombres de personas, mascotas y pueblos: rodear las palabras que llevan mayúscula o escribirlas bien.",
       [op("tarea", "Tarea", [(None, "Rodear los nombres con mayúscula"), ("escribe", "Escribirlos con mayúscula")]),
        op("nombres", "Nombres", [(None, "Mezclados"), ("personas", "De personas"), ("mascotas", "De mascotas"), ("lugares", "De pueblos y ciudades")])],
       "NOMBRES CON MAYÚSCULA", "rosa"),
    # <<< ORTO
]
# ------------------------------------------------------------------ lote 3 · frase.* (bloque 5)
FRASE_LARGO = op("palabras", "Palabras de cada frase", [(None, "Variadas (3 a 5)"), (3, "3 palabras"), (4, "4 palabras"), (5, "5 palabras")])
MODELOS_LENGUA += [
    # >>> FRASE (agente frase)
    _l(5, "frase", "ordena", "Ordena la frase", "Palabras desordenadas (come · gato · el): ordenarlas y escribir la frase.",
       [FRASE_LARGO, op("marca", "Primera palabra", [(None, "Con mayúscula (de pista)"), ("sin", "Sin marcar")]), CASO_LETRA],
       "ORDENA LA FRASE", "azul"),
    _l(5, "frase", "separa", "Separa las palabras", "Frases escritas sin espacios (elgatocome): trazar rayas entre las palabras o reescribirlas separadas.",
       [op("tarea", "Tarea", [(None, "Trazar rayas entre las palabras"), ("escribe", "Reescribir separando")]), FRASE_LARGO, CASO_LETRA],
       "SEPARA LAS PALABRAS", "amarillo"),
    _l(5, "frase", "completa", "Completa la frase", "Frases con una palabra que falta (El ___ ladra): elegir entre tres palabras o escribirla sin ayuda.",
       [op("falta", "Qué falta", [(None, "El nombre del principio (El ___ ladra)"), ("objeto", "El nombre del final (El gato come ___)"), ("mezcla", "Los dos, mezclados")]),
        op("ayuda", "Ayuda", [(None, "Con tres palabras para elegir"), ("sin", "Sin ayuda")]), FRASE_LARGO, CASO_LETRA],
       "COMPLETA LA FRASE", "verde"),
    _l(5, "frase", "verdad", "¿Sí o no?", "Frases que son verdad o mentira (El pez nada / La vaca vuela): rodear Sí o No.",
       [CASO_LETRA],
       "¿SÍ O NO?", "rosa"),
    _l(5, "frase", "puntua", "Mayúscula y punto", "Frases a las que les falta la mayúscula o el punto (la niña salta): rodear la letra y poner el punto, o escribirlas bien.",
       [op("tarea", "Tarea", [(None, "Rodear la letra y poner el punto"), ("escribe", "Escribirla bien")]),
        op("falta", "Qué falta", [(None, "Las dos (mayúscula y punto)"), ("mayus", "Solo la mayúscula"), ("punto", "Solo el punto")]), FRASE_LARGO],
       "MAYÚSCULA Y PUNTO", "azul"),
    # <<< FRASE
]

# ------------------------------------------------------------------ lote 5 · lectura.* (bloque 7; sin pictogramas)
MODELOS_LENGUA += [
    # >>> LECTURA (agente lectura)
    _l(7, "lectura", "texto", "Lee y responde", "Texto breve (personaje, mascota, color, lugar, comida…) y preguntas: elegir entre tres, sí o no y completar. En media página, solo el nivel 1.",
       [op("nivel", "Nivel del texto", [(None, "Nivel 1 · dos frases"), (2, "Nivel 2 · cuatro frases", COMPLETA), (3, "Nivel 3 · cuento corto", COMPLETA)]),
        op("preguntas", "Preguntas", [(None, "Variadas (elegir, sí o no, completar)"), ("elegir", "Elegir entre tres respuestas"), ("sino", "Sí o no"), ("completar", "Completar la frase")]), CASO_LETRA],
       "LEE Y RESPONDE", "azul"),
    _l(7, "lectura", "ordena", "Ordena la historia", "Tres o cuatro frases de una historia corta (rutinas, recetas, cuentos) para numerar en orden.",
       [op("tema", "Tema", [(None, "Todos (rutinas, recetas y cuentos)"), ("rutina", "Rutinas"), ("receta", "Recetas"), ("cuento", "Cuentos")]),
        op("frases", "Frases de cada historia", [(None, "3 o 4"), (3, "3 frases"), (4, "4 frases")]), CASO_LETRA],
       "ORDENA LA HISTORIA", "rosa"),
    _l(7, "lectura", "instrucciones", "Lee y colorea", "Una orden escrita («Colorea de rojo la estrella grande.») y varias figuras: colorear solo la que cumple la orden.",
       [op("ordenes", "Órdenes", [(None, "Figura y tamaño (la estrella grande)"), ("figura", "Solo la figura (el círculo)"), ("dos", "Dos órdenes seguidas")]),
        op("colores", "Colores", [(None, "Cuatro (rojo, azul, verde y amarillo)"), ("todos", "Ocho (con naranja, rosa, morado y marrón)")]), CASO_LETRA],
       "LEE Y COLOREA", "amarillo"),
    _l(7, "lectura", "adivinanza", "Adivinanzas", "Adivinanzas cortas con respuesta de una palabra, escrita en un cuadro o letra a letra.",
       [op("ayuda", "Ayuda", [(None, "Sin ayuda (escribe la palabra)"), ("letras", "Una casilla por cada letra")]), CASO_LETRA],
       "ADIVINANZAS", "verde"),
    _l(7, "lectura", "fluidez", "Lectura rápida", "Lista numerada de palabras o frases para leer en un minuto, con la casilla de palabras leídas.",
       [op("contenido", "Qué se lee", [(None, "Palabras"), ("frases", "Frases")]), TIPO, _largo("Sílabas de cada palabra", [(None, "Variadas"), (2, "2 sílabas"), (3, "3 sílabas")]), CASO],
       "LECTURA RÁPIDA", "azul", COMPLETA),
    # <<< LECTURA
]

# ------------------------------------------------------------------ lote 4 · escritura.* (bloque 8; todo con pauta Lamela)
PAUTA = op("pauta", "Tamaño de pauta", [(None, "5 mm"), (4, "4 mm"), (3.5, "3,5 mm")])
REPASO = op("repaso", "Repaso", [(None, "Gris claro"), ("punteado", "Punteado")])
MODELOS_LENGUA += [
    # >>> ESCRITURA (agente escritura)
    _l(8, "escritura", "trazos", "Trazos", "Grafomotricidad en la pauta: líneas, ondas, bucles, puentes, arcos, zigzag y círculos con punto de inicio, repaso y filas libres.",
       [op("trazo", "Tipo de trazo", [(None, "Variados (uno distinto en cada bloque)"), ("lineas", "Líneas (horizontales, verticales, inclinadas)"), ("ondas", "Ondas"), ("bucles", "Bucles"),
                                      ("puentes", "Puentes"), ("arcos", "Arcos"), ("zigzag", "Zigzag"), ("circulos", "Círculos y óvalos")]), PAUTA],
       "TRAZOS", "verde"),
    _l(8, "escritura", "letra", "Repasa y escribe la letra", "Una letra de modelo (con flechas numeradas si la pauta es grande), filas de repaso y filas libres.",
       [op("letra", "Letra", [(None, "Al azar")] + [(l, l) for l in LETRAS] + [("palabra", "Las letras de una palabra")]),
        op("caso", "Mayúscula o minúscula", [(None, "minúscula"), ("mayus", "MAYÚSCULA"), ("ambas", "Las dos (Aa)")]),
        REPASO, op("filas", "Filas de repaso", [(None, "2 filas"), (1, "1 fila"), (3, "3 filas")]), PAUTA],
       "REPASA Y ESCRIBE LA LETRA", "amarillo"),
    _l(8, "escritura", "palabras", "Copia palabras", "Palabras con la letra trabajada: modelo, repaso y copia libre.",
       [op("letra", "Con la letra", [(None, "Todas")] + [(l, l) for l in SIN_RARAS]), TIPO, CASO, PAUTA],
       "COPIA PALABRAS", "azul"),
    _l(8, "escritura", "frase", "Copia la frase", "Frases con mayúscula y punto: modelo, repaso y copia libre.",
       [FRASE_LARGO, REPASO, PAUTA],
       "COPIA LA FRASE", "rosa"),
    _l(8, "escritura", "dictado", "Hoja de dictado", "Renglones numerados en blanco; la maestra dicta. La lista dictada solo sale en pantalla (solucionario y Fori).",
       [op("modo", "Qué se dicta", [(None, "Palabras"), ("frases", "Frases")]), num("numero", "Renglones", 5, 10, 10),
        op("letra", "Con la letra", [(None, "Todas")] + [(l, l) for l in SIN_RARAS]), PAUTA],
       "HOJA DE DICTADO", "verde"),
    _l(8, "escritura", "libre", "Escribe una frase", "Renglones libres con la frase empezada (El gato…) o con un tema para escribir. Corrección abierta.",
       [op("inicio", "Cómo empieza", [(None, "Con la frase empezada (El gato…)"), ("tema", "Con un tema para escribir")]), PAUTA],
       "ESCRIBE UNA FRASE", "amarillo"),
    _l(8, "escritura", "ordena", "Miro y escribo", "Una tarjeta con espacio en blanco para pegar el dibujo, las letras desordenadas del nombre y la pauta: ordenar las letras y escribir la palabra.",
       [op("letras", "Letras de cada palabra", [(None, "3 a 6 (variadas)"), (3, "3 letras"), (4, "4 letras"), (5, "5 letras"), (6, "6 letras")]), TIPO,
        op("caso", "Letra", [(None, "minúscula"), ("mayus", "MAYÚSCULA")]), PAUTA],
       "MIRO Y ESCRIBO", "azul"),
    # <<< ESCRITURA
]
