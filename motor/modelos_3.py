"""Charta · Matemáticas de 3.º (ver MATES_3.md).

Igual que 2.º (modelos_2.py): los modelos de 1.º/2.º que sirven en 3.º no cambian de id; tools/catalogo.py les
añade `cursos: {"3": {"rangos": [...], "rango": N}}`. Los nuevos de 3.º (✨) van en MODELOS_3 con curso 3.
Rangos de 1000 en 1000 y 9999 (por defecto 9999). Números de cuatro cifras SIN punto de millares (4352).
"""

from modelos import M, op, AMBOS, COMPLETA

CURSO = 3
NOMBRE = "3.º de Primaria"
BLOQUES_3 = {14: "Dividir"}   # Fracciones y Pensamiento computacional llegan en sus lotes
RANGOS_3 = (1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 9999)


def rangos(rmin=1000, rmax=9999):
    return [r for r in RANGOS_3 if rmin <= r <= rmax]


# id → (rango mínimo, rango máximo, rango por defecto) en 3.º. Se amplía lote a lote.
EN_3 = {
    # Lote 0 · representaciones con millares (con 1000, las de centenas de 2.º: repaso)
    **{i: (1000, 9999, 9999) for i in ("rep.bloques", "rep.abaco", "rep.du", "rep.letras", "rep.recta", "rep.descomp")},
    "combinada.combinada": (2000, 9999, 9999),   # ¿Qué número es? solo con millares (sus 6 representaciones llegan a 9999)
    # Lote 1 · ♻ reutilizados tal cual: de 1000 a 9999, por defecto 9999 (con 1000, el repaso de 2.º)
    **{i: (1000, 9999, 9999) for i in (
        "conteo.anterior", "conteo.falta", "conteo.serie2", "conteo.serie5", "conteo.serie10", "conteo.series",
        "conteo.camino",
        "orden.mayor", "orden.ordena1", "orden.ordena2", "orden.entre", "orden.grupo",
        "sumar.h100", "sumar.hueco", "sumar.piramide", "sumar.tabla",
        "restar.r100", "restar.hueco", "restar.familia",
        "juegos.laberinto", "juegos.une", "juegos.cadena", "juegos.oculto",
        "problemas.suma", "problemas.resta", "problemas.mixtos", "problemas.barras",
        "trucos.sumar9", "trucos.masmenos10")},
    # Lote 2 · 🔧 valor posicional con millares (con 1000, el de 2.º) y comparar con cuatro cifras
    **{i: (1000, 9999, 9999) for i in ("orden.signos", "valor.descdu", "valor.dunum", "valor.cifra", "valor.canje", "valor.pares")},
    # Lote 2 · 🔧 sumas y restas en vertical con cuatro cifras (UM, C, D, U): tres sumandos y prueba de la resta incluidos
    **{i: (1000, 9999, 9999) for i in ("sumar.vertical", "restar.vertical")},
    # Lote 2 · 🔧 centenas y millares redondos, recta y encadenadas con saltos de 10, 100 y 1000
    **{i: (1000, 9999, 9999) for i in ("sumar.decenas", "restar.decenas", "sumar.recta", "restar.recta", "sumar.encadenadas", "restar.encadenadas")},
    # Lote 3 · multiplicar: las de 2.º también en 3.º (sin rango; las tablas del 6 al 9 solo desde 3.º)
    **{i: None for i in ("multiplicar.grupos", "multiplicar.filas", "multiplicar.tablas", "multiplicar.problemas", "multiplicar.reparto")},
    # Lote 1 · ♻ sin rango o con sus rangos de 1.º (None = los mismos que en 1.º)
    **{i: None for i in (
        "geometria.figuras", "geometria.cuerpos", "geometria.posiciones", "geometria.simetria", "geometria.copia",
        "medida.calendario", "juegos.cuadrado", "juegos.colorea", "estadistica.patrones")},
}


def _n3(bloque, familia, clave, nombre, descripcion, opciones, titulo, color, rangos_=None, rango=None, tam=AMBOS):
    """✨ Modelo que solo existe en 3.º: curso 3, título (mayúsculas) y color de panel. `rangos_`: lista propia."""
    m = M(bloque, familia, clave, nombre, descripcion, opciones, tam=tam)
    rg = list(rangos_ or [])
    return {**m, "curso": CURSO, "rangos": rg, "rango": (rango if rango in rg else rg[-1]) if rg else None, "titulo": titulo, "color": color}


MODELOS_3 = [
    # Lote 4 · dividir (bloque 14; sin rango) y problemas de dividir (bloque 8)
    _n3(14, "dividir", "tabla", "Divisiones de la tabla", "Dividir con las tablas de multiplicar (24 ÷ 6 = 4 porque 4 × 6 = 24).",
        [op("tablas", "Divisor", [(None, "Del 2 al 10"), ("2a5", "Del 2 al 5"), ("6a9", "Del 6 al 9")]),
         op("modo", "Tarea", [(None, "El cociente (24 ÷ 6 = ☐)"), ("porque", "Con su multiplicación (porque ☐ × 6 = 24)"), ("hueco", "El número que falta (24 ÷ ☐ = 4)")])],
        "DIVISIONES DE LA TABLA", "amarillo", tam=AMBOS),
    _n3(14, "dividir", "vertical", "Divisiones con la caja", "Dividir un número de 2 o 3 cifras entre una cifra con la caja, exactas o con resto.",
        [op("cifras", "Cifras del dividendo", [(None, "Dos cifras (84 ÷ 4)"), (3, "Tres cifras (756 ÷ 6)")]),
         op("nivel", "Divisiones", [(None, "Exactas"), ("resto", "Con resto"), ("mezcla", "Mezcla")]),
         {"id": "prueba", "etiqueta": "Con la prueba (cociente × divisor + resto = dividendo)", "tipo": "si_no", "defecto": False}],
        "DIVISIONES CON LA CAJA", "azul", tam=AMBOS),
    _n3(14, "dividir", "familia", "La familia de la multiplicación y la división", "Con tres números, las dos multiplicaciones y las dos divisiones (3 × 4, 4 × 3, 12 ÷ 3, 12 ÷ 4).",
        [op("tablas", "Tablas", [(None, "Del 2 al 10"), ("2a5", "Del 2 al 5"), ("6a9", "Del 6 al 9")]),
         op("modo", "Tarea", [(None, "Completa las cuatro operaciones"), ("libre", "Escribe las cuatro operaciones")])],
        "LA FAMILIA DE LA MULTIPLICACIÓN Y LA DIVISIÓN", "verde", tam=AMBOS),
    _n3(8, "problemas", "division", "Problemas de dividir", "Problemas de repartir y de agrupar, también con lo que sobra.",
        [op("modo", "Problemas", [(None, "Repartir y agrupar"), ("reparto", "Solo repartir"), ("agrupa", "Solo agrupar"), ("resto", "¿Cuántos sobran? (con resto)")]),
         op("tablas", "Divisor", [(None, "Del 2 al 10"), ("2a5", "Del 2 al 5"), ("6a9", "Del 6 al 9")])],
        "PROBLEMAS DE DIVIDIR", "rosa", tam=AMBOS),
    # Lote 3 · multiplicar (bloque 13; sin rango)
    _n3(13, "multiplicar", "vertical", "Multiplicaciones en vertical", "Multiplicar un número de 2 o 3 cifras por una cifra, con o sin llevadas.",
        [op("cifras", "Cifras del número", [(None, "Dos cifras"), (3, "Tres cifras")]),
         op("nivel", "Llevadas", [(None, "Sin llevadas"), ("con", "Con llevadas"), ("mezcla", "Mezcla")])],
        "MULTIPLICACIONES EN VERTICAL", "azul", tam=AMBOS),
    _n3(13, "multiplicar", "por10", "Por 10, 100 y 1000", "Multiplicar por 10, por 100 y por 1000 (añadir ceros).",
        [op("por", "Multiplicar por", [(None, "10, 100 y 1000"), ("10", "10"), ("100", "100")]),
         op("modo", "Tarea", [(None, "El resultado"), ("hueco", "El factor que falta")])],
        "POR 10, 100 Y 1000", "verde", tam=AMBOS),
    _n3(13, "multiplicar", "dobletriple", "Doble, triple, mitad y tercio", "Calcular el doble y el triple, la mitad y el tercio de un número.",
        [op("modo", "Calcula", [(None, "El doble y el triple"), ("mitad", "La mitad y el tercio"), ("todo", "Doble, triple, mitad y tercio")])],
        "DOBLE, TRIPLE, MITAD Y TERCIO", "rosa", tam=AMBOS),
    # Lote 2 · redondeo y estimación (3.º; con millares: desde rango 2000 y 3000)
    _n3(3, "orden", "redondea", "Redondea", "Redondear números de cuatro cifras a la decena, a la centena o al millar.",
        [op("a", "Redondea a", [(None, "Mezcla (decena, centena y millar)"), ("decena", "La decena"), ("centena", "La centena"), ("millar", "El millar")])],
        "REDONDEA", "amarillo", rangos_=rangos(2000), rango=9999, tam=AMBOS),
    _n3(3, "orden", "estima", "Estima", "Redondear los números y sumar o restar para dar un resultado aproximado.",
        [op("a", "Redondea", [(None, "Al millar"), ("centena", "A la centena")]),
         op("op", "Operación", [(None, "Sumas y restas"), ("suma", "Solo sumas"), ("resta", "Solo restas")])],
        "ESTIMA", "azul", rangos_=rangos(3000), rango=9999, tam=AMBOS),
    # Lote 0 · números romanos hasta 100 (I, V, X, L, C)
    _n3(1, "rep", "romanos", "Los números romanos", "Pasar de números romanos (I, V, X, L, C) a números y al revés, hasta 100.",
        [op("modo", "Tarea", [(None, "Los dos sentidos"), ("leer", "Romano → número (XIV = 14)"), ("escribir", "Número → romano (14 = XIV)")]),
         {"id": "ayuda", "etiqueta": "Con la tabla de los símbolos", "tipo": "si_no", "defecto": True}],
        "LOS NÚMEROS ROMANOS", "verde", rangos_=[20, 50, 100], rango=100),
]


def cursos_extra(m):
    """{"3": {"rangos", "rango"}} si el modelo (dict del catálogo) también está en 3.º; {} si no."""
    if m["id"] not in EN_3: return {}
    if EN_3[m["id"]] is None: return {str(CURSO): {"rangos": list(m.get("rangos") or []), "rango": m.get("rango")}}
    lo, hi, d = EN_3[m["id"]]
    rg = rangos(lo, hi)
    return {str(CURSO): {"rangos": rg, "rango": d if d in rg else rg[0]}}
