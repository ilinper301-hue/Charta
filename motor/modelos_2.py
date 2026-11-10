"""Charta · Matemáticas de 2.º (ver MATES_2.md).

Un modelo puede estar en varios cursos con sus propios rangos (decidido el 8-11-2026): los de 1.º que sirven
en 2.º no cambian de id; tools/catalogo.py les añade `cursos: {"2": {"rangos": [...], "rango": N}}`.
Los modelos nuevos de 2.º (✨) irán en MODELOS_2 con curso 2 (mismo formato que modelos_app.MODELOS_APP).
"""

CURSO = 2
NOMBRE = "2.º de Primaria"
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
    **{i: None for i in ("medida.reloj", "medida.reloj2", "medida.tiempo")},
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
         "valores": [{"valor": None, "etiqueta": "De 10 en 10"}, {"valor": 100, "etiqueta": "De 100 en 100", "rmin": 500}]}
# Encadenadas: el primer número es una decena (o centena) cualquiera y los demás, saltos de 10–90 (o 100–900).
CIFRAS = {**SALTO, "valores": [{"valor": None, "etiqueta": "De 10 en 10 (350 + 20 + 40)"},
                              {"valor": 100, "etiqueta": "De 100 en 100 (300 + 200 + 100)", "rmin": 700}]}
OPCIONES_2.update({
    "sumar.recta": {"nuevas": [SALTO]},
    "restar.recta": {"nuevas": [SALTO]},
    "sumar.encadenadas": {"nuevas": [CIFRAS, {"id": "sumandos", "etiqueta": "Sumandos", "tipo": "opcion", "defecto": None,
                                              "rmin": 100, "valores": [{"valor": None, "etiqueta": "Tres"},
                                                                       {"valor": 4, "etiqueta": "Cuatro"}]}]},
    "restar.encadenadas": {"nuevas": [{**CIFRAS, "valores": [{**CIFRAS["valores"][0], "etiqueta": "De 10 en 10 (350 − 20 − 40)"},
                                                             {**CIFRAS["valores"][1], "etiqueta": "De 100 en 100 (900 − 300 − 200)"}]}]},
    "sumar.dobles": {"valores": {"modo": [{"valor": "dibujo", "rmax": 20}]},   # rmax: se aplica al valor de 1.º
                     "nuevas": [{"id": "operacion", "etiqueta": "Calcula", "tipo": "opcion", "defecto": None, "rmin": 100,
                                 "valores": [{"valor": None, "etiqueta": "Dobles"}, {"valor": "mitades", "etiqueta": "Mitades"},
                                             {"valor": "mezcla", "etiqueta": "Dobles y mitades"}]}]},
})


# Lote 3 · modelos sin rango: valores que solo salen en 2.º (`curso`; visible() en ficha.js).
CUARTOS = [{"valor": "cuarto", "etiqueta": "Solo y cuarto y menos cuarto", "curso": CURSO},
           {"valor": "todas", "etiqueta": "En punto, y media, y cuarto y menos cuarto", "curso": CURSO}]
OPCIONES_2.update({
    "medida.reloj": {"valores": {"modo": CUARTOS}},
    "medida.reloj2": {"valores": {"modo": CUARTOS}},
    "medida.tiempo": {"valores": {"modo": [{"valor": "equivalencias", "etiqueta": "Horas, minutos, días, semanas y meses", "curso": CURSO},
                                           {"valor": "horas", "etiqueta": "Antes y después de una hora", "curso": CURSO}]}},
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

MODELOS_2 = []   # ✨ nuevos de 2.º (lotes 3–6)


def cursos_extra(m):
    """{"2": {"rangos", "rango"}} si el modelo (dict del catálogo) también está en 2.º; {} si no."""
    if m["id"] not in EN_2: return {}
    if EN_2[m["id"]] is None: return {str(CURSO): {"rangos": list(m.get("rangos") or []), "rango": m.get("rango")}}
    lo, hi, d = EN_2[m["id"]]
    rg = rangos(lo, hi)
    return {str(CURSO): {"rangos": rg, "rango": d if d in rg else rg[0]}}
