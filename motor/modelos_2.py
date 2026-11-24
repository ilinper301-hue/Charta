"""Charta · Matemáticas de 2.º (ver MATES_2.md).

Un modelo puede estar en varios cursos con sus propios rangos (decidido el 8-11-2026): los de 1.º que sirven
en 2.º no cambian de id; tools/catalogo.py les añade `cursos: {"2": {"rangos": [...], "rango": N}}`.
Los modelos nuevos de 2.º (✨) irán en MODELOS_2 con curso 2 (mismo formato que modelos_app.MODELOS_APP).
"""

from modelos import M, op, AMBOS, COMPLETA

CURSO = 2
NOMBRE = "2.º de Primaria"
BLOQUES_2 = {13: "Multiplicar y repartir"}   # bloque solo de 2.º (en 1.º no sale: la app oculta los bloques sin modelos del curso)
RANGOS_2 = (100, 200, 300, 400, 500, 600, 700, 800, 900, 999)   # de 100 en 100 (decidido el 8-11-2026)


def rangos(rmin=100, rmax=999):
    return [r for r in RANGOS_2 if rmin <= r <= rmax]


# id del modelo de 1.º → (rango mínimo, rango máximo, rango por defecto) en 2.º. Se amplía lote a lote.
EN_2 = {
    # Lote 0 · representaciones con centenas
    "rep.bloques": (100, 999, 999),
    "rep.abaco": (100, 999, 999),
    "rep.du": (100, 999, 999),
    "rep.letras": (100, 999, 999),
    "rep.recta": (100, 999, 999),
    "rep.descomp": (100, 999, 999),
    # Lote 1 · ♻ reutilizados tal cual: hasta 999, por defecto 100
    **{i: (100, 999, 100) for i in (
        "conteo.anterior", "conteo.falta", "conteo.serie2", "conteo.serie5", "conteo.serie10", "conteo.series",
        "conteo.camino",
        "orden.mayor", "orden.ordena1", "orden.ordena2", "orden.entre", "orden.grupo",
        "sumar.h100", "sumar.hueco", "sumar.piramide", "sumar.tabla",
        "restar.r100", "restar.hueco", "restar.familia",
        "juegos.laberinto", "juegos.une", "juegos.cadena", "juegos.oculto",
        "problemas.suma", "problemas.resta", "problemas.mixtos", "problemas.barras",
        "trucos.sumar9", "trucos.masmenos10")},
    # Lote 1 · ♻ sin rango o con sus rangos de 1.º (None = los mismos que en 1.º)
    **{i: None for i in (
        "geometria.figuras", "geometria.cuerpos", "geometria.lineas", "geometria.posiciones", "geometria.simetria",
        "geometria.copia", "medida.calendario", "juegos.cuadrado", "juegos.colorea", "medida.capacidad",
        "estadistica.pictograma", "estadistica.recuento", "estadistica.patrones")},
    # Lote 2 · 🔧 valor posicional, sumas y restas de tres cifras: hasta 999 y por defecto 999
    **{i: (100, 999, 999) for i in (
        "valor.descdu", "valor.dunum", "valor.cifra", "valor.canje",
        "sumar.vertical", "restar.vertical", "sumar.decenas", "restar.decenas")},
    "valor.pares": (100, 999, 100),
    # Lote 2b · 🔧 recta y encadenadas con saltos de 10 y de 100, dobles y mitades hasta 100, agrupar de 100 en 100
    **{i: (100, 999, 100) for i in ("sumar.recta", "restar.recta", "sumar.encadenadas", "restar.encadenadas")},
    "sumar.dobles": (100, 100, 100),
    "valor.agrupa": (200, 300, 300),   # hasta 29 barras de diez en la casilla
    # Lote 3 · medida: reloj con cuartos y tiempo (opciones con `curso`), dinero hasta 500 € y compras hasta 100 €
    **{i: None for i in ("medida.reloj", "medida.reloj2", "medida.tiempo", "medida.longitud")},
    "medida.dinero": (200, 500, 200),
    "medida.precios": (100, 100, 100),
}

# Opciones que solo salen con números de tres cifras (`rmin`: rango mínimo; la app las oculta y validar() las
# rechaza por debajo). Las fichas de 1.º no cambian. {id: {"valores": {opción: [valores nuevos]}, "nuevas": [opciones]}}
TRES = 200
LLEVADA_3 = [{"valor": "u", "etiqueta": "Llevada solo en las unidades", "rmin": TRES},
             {"valor": "d", "etiqueta": "Llevada solo en las decenas", "rmin": 300},   # con 200 no hay 12 distintas
             {"valor": "ud", "etiqueta": "Llevada en las unidades y en las decenas", "rmin": TRES}]
OPCIONES_2 = {
    "sumar.vertical": {"valores": {"nivel": LLEVADA_3},
                       "nuevas": [{"id": "sumandos", "etiqueta": "Sumandos", "tipo": "opcion", "defecto": None, "rmin": TRES,
                                   "valores": [{"valor": None, "etiqueta": "Dos"}, {"valor": 3, "etiqueta": "Tres"}]}]},
    "restar.vertical": {"valores": {"nivel": LLEVADA_3},
                        "nuevas": [{"id": "prueba", "etiqueta": "Con la prueba de la resta", "tipo": "si_no", "defecto": False, "rmin": TRES}]},
}


SALTO = {"id": "salto", "etiqueta": "Saltos", "tipo": "opcion", "defecto": None, "rmin": 100,
         "valores": [{"valor": None, "etiqueta": "De 10 en 10"}, {"valor": 100, "etiqueta": "De 100 en 100", "rmin": 500},
                     {"valor": 1000, "etiqueta": "De 1000 en 1000", "rmin": 4000}]}   # 3.º: de 1000 en 1000 desde rango 4000
# Encadenadas: el primer número es una decena (o centena) cualquiera y los demás, saltos de 10–90 (o 100–900).
CIFRAS = {**SALTO, "valores": [{"valor": None, "etiqueta": "De 10 en 10 (350 + 20 + 40)"},
                              {"valor": 100, "etiqueta": "De 100 en 100 (300 + 200 + 100)", "rmin": 700},
                              {"valor": 1000, "etiqueta": "De 1000 en 1000 (3000 + 2000 + 1000)", "rmin": 7000}]}   # 3.º: con menos rango no hay combinaciones distintas
OPCIONES_2.update({
    "sumar.recta": {"nuevas": [SALTO]},
    "restar.recta": {"nuevas": [SALTO]},
    "sumar.encadenadas": {"nuevas": [CIFRAS, {"id": "sumandos", "etiqueta": "Sumandos", "tipo": "opcion", "defecto": None,
                                              "rmin": 100, "valores": [{"valor": None, "etiqueta": "Tres"},
                                                                       {"valor": 4, "etiqueta": "Cuatro"}]}]},
    "restar.encadenadas": {"nuevas": [{**CIFRAS, "valores": [{**CIFRAS["valores"][0], "etiqueta": "De 10 en 10 (350 − 20 − 40)"},
                                                             {**CIFRAS["valores"][1], "etiqueta": "De 100 en 100 (900 − 300 − 200)"},
                                                             {**CIFRAS["valores"][2], "etiqueta": "De 1000 en 1000 (9000 − 3000 − 2000)"}]}]},
    "sumar.dobles": {"valores": {"modo": [{"valor": "dibujo", "rmax": 20}]},   # rmax: se aplica al valor de 1.º
                     "nuevas": [{"id": "operacion", "etiqueta": "Calcula", "tipo": "opcion", "defecto": None, "rmin": 100,
                                 "valores": [{"valor": None, "etiqueta": "Dobles"}, {"valor": "mitades", "etiqueta": "Mitades"},
                                             {"valor": "mezcla", "etiqueta": "Dobles y mitades"}]}]},
})


# Lote 3 · modelos sin rango: valores que solo salen en 2.º (`curso`; visible() en ficha.js).
CUARTOS = [{"valor": "cuarto", "etiqueta": "Solo y cuarto y menos cuarto", "curso": CURSO},
           {"valor": "todas", "etiqueta": "En punto, y media, y cuarto y menos cuarto", "curso": CURSO}]
# 3.º · lote 6: minutos de 5 en 5 y de 1 en 1 (solo desde 3.º)
MINUTOS_3 = [{"valor": "cinco", "etiqueta": "Minutos de 5 en 5 (las 4:35)", "curso": 3},
             {"valor": "minuto", "etiqueta": "Minutos de 1 en 1 (las 4:37)", "curso": 3}]
OPCIONES_2.update({
    "medida.reloj": {"valores": {"modo": CUARTOS + MINUTOS_3}},
    "medida.reloj2": {"valores": {"modo": CUARTOS + MINUTOS_3}},
    "medida.tiempo": {"valores": {"modo": [{"valor": "equivalencias", "etiqueta": "Horas, minutos, días, semanas y meses", "curso": CURSO},
                                           {"valor": "horas", "etiqueta": "Antes y después de una hora", "curso": CURSO}]}},
    # Lote 3c · regla en centímetros reales y ¿m o cm?
    "medida.longitud": {"valores": {"modo": [{"valor": "regla", "etiqueta": "Mide con la regla (cm)", "curso": CURSO},
                                             {"valor": "mcm", "etiqueta": "¿Metros o centímetros?", "curso": CURSO}]}},
})


# Lote 4 · gráfico de barras con escala de 2 en 2 o de 5 en 5 y pregunta de comparar (opciones con `curso`)
OPCIONES_2.update({
    "estadistica.barras": {"nuevas": [
        {"id": "escala", "etiqueta": "Escala del gráfico", "tipo": "opcion", "defecto": None, "curso": CURSO,
         "valores": [{"valor": None, "etiqueta": "De 1 en 1"}, {"valor": 2, "etiqueta": "De 2 en 2"}, {"valor": 5, "etiqueta": "De 5 en 5"}]},
        {"id": "pregunta", "etiqueta": "Pregunta final", "tipo": "opcion", "defecto": None, "curso": CURSO,
         "valores": [{"valor": None, "etiqueta": "¿Cuántos hay en total?"}, {"valor": "mas", "etiqueta": "¿Cuántos más hay?"}]}]},
})
EN_2["estadistica.barras"] = None


# 3.º · lote 3: todas las tablas (del 6 al 9 y «del 2 al 10»); solo desde 3.º (`curso`)
TABLAS_3 = [{"valor": str(t), "etiqueta": f"Del {t}", "curso": 3} for t in (6, 7, 8, 9)] + [{"valor": "2a10", "etiqueta": "Todas, del 2 al 10", "curso": 3}]
OPCIONES_2.update({
    "multiplicar.tablas": {"valores": {"tablas": TABLAS_3}},
    "multiplicar.problemas": {"valores": {"tablas": TABLAS_3}},
    # 3.º · lote 4: el reparto con el signo ÷ (solo desde 3.º)
    "multiplicar.reparto": {"nuevas": [{"id": "signo", "etiqueta": "Con el signo ÷ (12 ÷ 3 = 4)", "tipo": "si_no", "defecto": False, "curso": 3}]},
})

# 3.º · lote 6: precios con céntimos (2,50 €) y monedas de euros y céntimos juntas (solo desde 3.º)
OPCIONES_2.update({
    "medida.precios": {"nuevas": [{"id": "centimos", "etiqueta": "Con céntimos (2,50 €)", "tipo": "si_no", "defecto": False, "curso": 3}]},
    "medida.dinero": {"valores": {"modo": [{"valor": "mixto", "etiqueta": "Euros y céntimos juntos (2,70 €)", "curso": 3}]}},
})


def opciones_2(m):
    """Opciones del modelo (dict del catálogo) con las de tres cifras añadidas (lista nueva; m no cambia)."""
    extra = OPCIONES_2.get(m["id"])
    if not extra: return m["opciones"]
    def junta(o):
        vs, nuevos = [dict(v) for v in o["valores"]], extra.get("valores", {}).get(o["id"], [])
        for n in nuevos:   # mismo valor que uno de 1.º → solo se le añaden campos (p. ej. rmax); si no, valor nuevo
            igual = next((v for v in vs if v["valor"] == n["valor"]), None)
            if igual: igual.update({k: x for k, x in n.items() if k != "valor"})
            else: vs.append(n)
        return {**o, "valores": vs}
    ops = [junta(o) if o["tipo"] == "opcion" else o for o in m["opciones"]]
    return ops + extra.get("nuevas", [])

def _n2(bloque, familia, clave, nombre, descripcion, opciones, titulo, color, rmin=None, rmax=None, rango=None, tam=AMBOS):
    """✨ Modelo que solo existe en 2.º: curso 2, título (mayúsculas) y color de panel."""
    m = M(bloque, familia, clave, nombre, descripcion, opciones, tam=tam)
    rg = rangos(rmin, rmax) if rmin else []
    return {**m, "curso": CURSO, "rangos": rg, "rango": (rango if rango in rg else rg[0]) if rg else None, "titulo": titulo, "color": color}

MODELOS_2 = [   # ✨ nuevos de 2.º (lotes 3–6)
    _n2(10, "medida", "euros", "Paga con billetes y monedas", "Pagar una cantidad con el menor número de billetes y monedas (hasta 500 €).", [],
        "PAGA CON BILLETES Y MONEDAS", "verde", rmin=100, rmax=500, rango=200),
    _n2(10, "medida", "masa", "¿Cuánto pesa?", "Balanza con pesas de 1 kg y de medio kilo: pesa más, menos o igual.", [],
        "¿CUÁNTO PESA?", "azul"),
    # Lote 4 · geometría y estadística
    _n2(9, "geometria", "lados", "Lados y vértices", "Contar los lados y los vértices de polígonos dibujados.", [],
        "LADOS Y VÉRTICES", "amarillo"),
    _n2(9, "geometria", "itinerario", "Sigue el camino", "Seguir flechas en una cuadrícula, o escribir las flechas de un camino.",
        [op("modo", "Tarea", [(None, "Dibuja el camino"), ("llega", "¿Dónde llegas?"), ("flechas", "Escribe las flechas")])],
        "SIGUE EL CAMINO", "rosa", tam=COMPLETA),
    # Lote 5 · trucos de 2.º (Calculi c2)
    _n2(12, "trucos", "amigos100", "Amigos del 100", "Truco: buscar el amigo del 100 (30 + 70, 45 + 55).",
        [op("modo", "Números", [(None, "Decenas exactas y otros números"), ("decenas", "Solo decenas exactas (30 + 70)")])],
        "AMIGOS DEL 100", "amarillo"),
    _n2(12, "trucos", "sumadecenas", "Sumar decenas", "Truco: al sumar decenas, las unidades no cambian (47 + 30).", [],
        "SUMAR DECENAS", "verde"),
    _n2(12, "trucos", "restadecenas", "Restar decenas", "Truco: al restar decenas, las unidades no cambian (85 − 40).", [],
        "RESTAR DECENAS", "azul"),
    _n2(12, "trucos", "descomponer2", "Decenas y unidades", "Truco: sumar por separado las decenas y las unidades, sin llevada (34 + 25).", [],
        "DECENAS Y UNIDADES", "rosa"),
    _n2(12, "trucos", "pasardecena2", "Pasar la decena", "Truco: completar la decena y sumar lo que sobra (38 + 7 = 40 + 5).", [],
        "PASAR LA DECENA", "amarillo"),
    _n2(12, "trucos", "sumar919", "Sumar 9 y 19", "Truco: sumar 10 o 20 y quitar 1 (36 + 19).", [],
        "SUMAR 9 Y 19", "verde"),
    _n2(12, "trucos", "restar919", "Restar 9 y 19", "Truco: restar 10 o 20 y devolver 1 (52 − 19).", [],
        "RESTAR 9 Y 19", "azul"),
    _n2(12, "trucos", "compensar2", "Redondear y compensar", "Truco: redondear a la decena, sumar y quitar lo que sobra (48 + 25).", [],
        "REDONDEAR Y COMPENSAR", "rosa"),
    _n2(12, "trucos", "centenas", "Sumar y restar centenas", "Truco: solo cambian las centenas (340 + 200, 700 − 300).",
        [op("modo", "Operaciones", [(None, "Sumar y restar"), ("suma", "Solo sumar"), ("resta", "Solo restar")])],
        "SUMAR Y RESTAR CENTENAS", "amarillo"),
    _n2(12, "trucos", "restaradelante", "Restar hacia delante", "Truco: contar cuánto falta del número pequeño al grande (62 − 58).", [],
        "RESTAR HACIA DELANTE", "verde"),
]


# Lote 5 · problemas: situaciones nuevas de 2.º en los de una operación (valores con `curso`) y dos modelos nuevos
SIT_TODAS = {"valor": "todas", "etiqueta": "Variadas, también las nuevas", "curso": CURSO}
INICIO = {"valor": "inicio", "etiqueta": "¿Cuántos había al principio?", "curso": CURSO}
OPCIONES_2.update({
    "problemas.suma": {"valores": {"situacion": [INICIO, SIT_TODAS]}},
    "problemas.resta": {"valores": {"situacion": [{"valor": "igualar", "etiqueta": "Igualar (cuántos le faltan para tener los mismos)", "curso": CURSO},
                                                  INICIO, SIT_TODAS]}},
})
NIVEL_2P = op("nivel", "Llevadas", [(None, "Sin llevadas"), ("con", "Con llevadas"), ("mezcla", "Mezcladas")])
MODELOS_2 += [
    _n2(8, "problemas", "dospasos", "Problemas de dos operaciones", "Tenía 45, me dan 20 y gasto 30: dos operaciones y la respuesta.",
        [op("operaciones", "Operaciones", [(None, "Variadas"), ("mixtas", "Sumar y restar"), ("suma", "Sumar dos veces"), ("resta", "Restar dos veces")]), NIVEL_2P,
         op("barra", "Barra", [(None, "Sin barra"), ("dibujada", "Dibujada (con los números)"), ("blanco", "En blanco (la dibuja el alumno)")])],
        "PROBLEMAS DE DOS OPERACIONES", "azul", rmin=100, rmax=999, rango=100),
    _n2(8, "problemas", "dinero", "Problemas de compras", "Precios en euros: cuánto pago, cuánto me devuelven, cuánto me queda o me falta.",
        [op("situacion", "Situaciones", [(None, "Variadas"), ("pagar", "¿Cuánto paga? (sumar precios)"), ("vuelta", "¿Cuánto le devuelven?"),
                                         ("queda", "¿Cuánto le queda?"), ("falta", "¿Cuánto le falta?")])],
        "PROBLEMAS DE COMPRAS", "verde", rmin=100, rmax=500, rango=100),
]


# Lote 6 · multiplicar y repartir (bloque 13): sin rango; tablas del 2, 3, 4, 5 y 10 (opción `tablas`)
TABLAS = op("tablas", "Tablas", [(None, "Del 2, 5 y 10"), ("2", "Del 2"), ("3", "Del 3"), ("4", "Del 4"), ("5", "Del 5"), ("10", "Del 10"),
                                 ("todas", "Del 2, 3, 4, 5 y 10")])
MODELOS_2 += [
    _n2(13, "multiplicar", "grupos", "Grupos iguales", "Contar grupos iguales de puntos y escribir la suma repetida y la multiplicación (3 grupos de 4 = 3 × 4).",
        [op("modo", "Qué se escribe", [(None, "Suma y multiplicación"), ("mult", "Solo la multiplicación")])],
        "GRUPOS IGUALES", "amarillo"),
    _n2(13, "multiplicar", "filas", "Filas y columnas", "Matrices de puntos: cuántas filas de cuántos y la multiplicación.",
        [op("modo", "Qué se escribe", [(None, "Una multiplicación"), ("dos", "Las dos multiplicaciones")])],
        "FILAS Y COLUMNAS", "verde"),
    _n2(13, "multiplicar", "tablas", "Las tablas", "Multiplicaciones de las tablas del 2, 3, 4, 5 y 10: el resultado, el factor que falta o la tabla en orden.",
        [TABLAS, op("modo", "Tarea", [(None, "Resultado"), ("hueco", "El factor que falta"), ("orden", "La tabla en orden")])],
        "LAS TABLAS", "azul"),
    _n2(13, "multiplicar", "problemas", "Problemas de multiplicar", "Problemas de grupos iguales (cajas, bolsas, filas de sillas…) con su operación y su respuesta.",
        [TABLAS], "PROBLEMAS DE MULTIPLICAR", "rosa"),
    _n2(13, "multiplicar", "reparto", "Reparte", "Repartir en partes iguales con dibujo, y la mitad y el tercio de un número.",
        [op("modo", "Tarea", [(None, "Repartir en partes iguales"), ("mitad", "La mitad y el tercio")])],
        "REPARTE", "amarillo"),
]

def cursos_extra(m):
    """{"2": {"rangos", "rango"}} si el modelo (dict del catálogo) también está en 2.º; {} si no."""
    if m["id"] not in EN_2: return {}
    if EN_2[m["id"]] is None: return {str(CURSO): {"rangos": list(m.get("rangos") or []), "rango": m.get("rango")}}
    lo, hi, d = EN_2[m["id"]]
    rg = rangos(lo, hi)
    return {str(CURSO): {"rangos": rg, "rango": d if d in rg else rg[0]}}
