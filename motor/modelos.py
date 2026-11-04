"""Charta · catálogo de modelos (paso 1.1).

Tabla `MODELOS`: la app monta sus menús (curso → materia → bloque → modelo → opciones)
a partir de ella. Es solo datos: no importa ReportLab, así que puede cargarse sin el motor.

Cada modelo es un dict:
  id           "familia.clave" (único)
  curso        1..6
  materia      "matematicas" | "lengua" ...
  bloque       número de bloque (ver BLOQUES)
  familia      familia del motor (rep, conteo, sumar...)
  clave        clave dentro de la familia
  nombre       nombre visible
  descripcion  descripción corta para el maestro
  opciones     lista de opciones (ver op/num/si_no). Su `id` es el nombre del
               parámetro del motor: modo, nivel, huecos, n, cerca, lectura.
  rangos       valores admitidos de "hasta el número…" ([] = no lleva rango)
  rango        valor por defecto del rango (None si no lleva)
  tamanos      ("completa", "media"): tamaños admitidos en la ficha. En media página
               se dibuja el mismo diseño con la mitad de filas (como la ficha de muestra).
               Un valor de opción puede limitarse con su propio "tamanos".
"""

CURSOS = {1: "1.º de Primaria"}
MATERIAS = {"matematicas": "Matemáticas"}
BLOQUES = {
    1: "Los números y sus representaciones",
    2: "Contar y series",
    3: "Orden y comparación",
    4: "Valor posicional",
    5: "Sumar",
    6: "Restar",
    7: "Juegos numéricos",
    9: "Geometría",
    10: "Medida",
    11: "Estadística y patrones",
}
RANGOS = (10, 20, 30, 100)
AMBOS, COMPLETA = ("completa", "media"), ("completa",)


# ------------------------------------------------------------ tipos de opción
def op(id, etiqueta, valores, defecto=None):
    """Lista de valores: [(valor, etiqueta[, tamaños]), ...]. None = valor por defecto del motor.
    Un tercer elemento limita ese valor a ciertos tamaños, p. ej. COMPLETA."""
    return {"id": id, "etiqueta": etiqueta, "tipo": "opcion", "defecto": defecto,
            "valores": [{"valor": v[0], "etiqueta": v[1], **({"tamanos": v[2]} if len(v) > 2 else {})} for v in valores]}

def num(id, etiqueta, minimo, maximo, defecto=None):
    """Número entero. defecto None = automático (lo decide el motor)."""
    return {"id": id, "etiqueta": etiqueta, "tipo": "numero", "min": minimo, "max": maximo, "defecto": defecto}

def si_no(id, etiqueta, defecto=False):
    return {"id": id, "etiqueta": etiqueta, "tipo": "si_no", "defecto": defecto}

# opciones repetidas
NIVEL = op("nivel", "Llevadas", [(None, "Sin llevadas"), ("con", "Con llevadas"), ("mezcla", "Mezcladas")])
NIVEL_DU = op("nivel", "Números", [(None, "Decenas completas y otros"), ("completas", "Solo decenas completas")])
CERCA = si_no("cerca", "Números de la misma decena (más difícil, desde 20)")
CUANTOS = num("n", "Números por grupo", 3, 5, 4)
RELOJ = op("modo", "Horas", [(None, "En punto e y media"), ("punto", "Solo en punto"), ("media", "Solo y media")])


def _rangos(rmin, rmax):
    if rmin is None: return []
    out = []
    for v in RANGOS:
        if v < rmin: continue
        out.append(v)
        if v >= rmax: break
    return out

def M(bloque, familia, clave, nombre, descripcion, opciones=(), rmin=10, rmax=100, tam=AMBOS, rango=None):
    rg = _rangos(rmin, rmax)
    return {"id": f"{familia}.{clave}", "curso": 1, "materia": "matematicas", "bloque": bloque,
            "familia": familia, "clave": clave, "nombre": nombre, "descripcion": descripcion,
            "opciones": list(opciones), "rangos": rg,
            "rango": (rango if rango in rg else rg[0]) if rg else None, "tamanos": tam}


# ------------------------------------------------------------ bloque 1 · representaciones
LECTURA = si_no("lectura", "Solo leer (sin la fila de dibujar)")
_REP = [  # clave, nombre, descripción, máximo útil
    ("dedos", "Los dedos", "Leer y dibujar números con los dedos de las manos.", 10),
    ("dado", "El dado", "Leer y dibujar números con puntos de uno o dos dados.", 12),
    ("domino", "El dominó", "Leer y dibujar números como fichas de dominó.", 12),
    ("marco", "El marco de diez", "Leer y rellenar marcos de diez.", 40),
    ("palotes", "Los palotes", "Contar y dibujar palotes en grupos de cinco.", 30),
    ("objetos", "Los objetos", "Contar y dibujar colecciones de objetos.", 30),
    ("regletas", "Las regletas", "Leer y dibujar números con regletas.", 30),
    ("descomp", "La descomposición", "Descomponer números en sumas.", 100),
    ("letras", "El número en letras", "Pasar de número a letras y al revés.", 100),
    ("recta", "La recta numérica", "Leer y marcar números en la recta.", 100),
    ("bloques", "Los bloques de base diez", "Leer y dibujar números con barras y cubos.", 99),
    ("cuadricula", "La cuadrícula de 100", "Leer y colorear números en la cuadrícula.", 100),
    ("monedas", "Las monedas", "Leer y dibujar cantidades con monedas.", 69),
    ("abaco", "El ábaco", "Leer y dibujar números en el ábaco.", 99),
    ("du", "Las decenas y unidades", "Leer y completar decenas y unidades.", 99),
    ("atados", "Los palitos y atados", "Leer y dibujar números con atados de diez.", 69),
]
MODELOS = [M(1, "rep", k, n, d, [LECTURA], rmax=mx) for k, n, d, mx in _REP]
MODELOS += [
    M(1, "combinada", "combinada", "¿Qué número es?", "Cada casilla, una representación distinta: escribir el número.", rmin=20),
    M(1, "suma", "suma", "Suma y dibuja", "Sumar dos representaciones y dibujar el resultado.", rmin=20),
]

# ------------------------------------------------------------ bloque 2 · conteo
HUECOS = lambda mn, mx, d=None: num("huecos", "Cuadros vacíos", mn, mx, d)
MODELOS += [
    M(2, "conteo", "cuenta", "Cuenta y escribe", "Contar dibujos y escribir el número.", rmax=30),
    M(2, "conteo", "anterior", "Anterior y posterior", "Escribir el número de antes y el de después.",
      [op("modo", "Qué se escribe", [(None, "Anterior y posterior"), ("anterior", "Solo el anterior"), ("posterior", "Solo el posterior")])]),
    M(2, "conteo", "falta", "El número que falta", "Completar el número que falta en una fila.", [HUECOS(1, 3, 1)]),
    M(2, "conteo", "serie1", "Series de 1 en 1", "Completar series de uno en uno.", [HUECOS(1, 4, 3)]),
    M(2, "conteo", "serie2", "Series de 2 en 2", "Completar series de dos en dos.", [HUECOS(1, 4, 3)]),
    M(2, "conteo", "serie5", "Series de 5 en 5", "Completar series de cinco en cinco.", [HUECOS(1, 4, 3)]),
    M(2, "conteo", "serie10", "Series de 10 en 10", "Completar series de diez en diez.", [HUECOS(1, 4, 3)], rmin=20),
    M(2, "conteo", "series", "Series mixtas", "Series con saltos distintos: descubrir el salto y completar.", [HUECOS(1, 4, 3)]),
    M(2, "conteo", "tabla", "La tabla de números", "Completar los números que faltan en la tabla.", [HUECOS(3, 30)], tam=COMPLETA),
    M(2, "conteo", "camino", "El camino de números", "Seguir las flechas y completar los números.", [HUECOS(3, 20)], tam=COMPLETA),
]

# ------------------------------------------------------------ bloque 3 · orden
MAS_MENOS = [(None, "Mezclado"), ("mayor", "Solo el mayor"), ("menor", "Solo el menor")]
MODELOS += [
    M(3, "orden", "mayor", "Mayor o menor", "Rodear el número mayor o el menor de cada pareja.", [op("modo", "Qué se rodea", MAS_MENOS), CERCA]),
    M(3, "orden", "signos", "Los signos < > =", "Escribir el signo entre dos números.",
      [op("modo", "Parejas iguales", [(None, "Con algunas iguales (=)"), ("sin", "Sin iguales")]), CERCA]),
    M(3, "orden", "grupo", "El mayor y el menor", "Escribir el mayor y el menor de cada grupo.", [CUANTOS, CERCA]),
    M(3, "orden", "ordena1", "Ordena de menor a mayor", "Ordenar números de menor a mayor.", [CUANTOS, CERCA]),
    M(3, "orden", "ordena2", "Ordena de mayor a menor", "Ordenar números de mayor a menor.", [CUANTOS, CERCA]),
    M(3, "orden", "entre", "Un número entre dos", "Escribir un número que esté entre otros dos."),
    M(3, "orden", "ordinales", "Los ordinales", "Primero, segundo, tercero…: colorear o decir el lugar.",
      [op("modo", "Tarea", [(None, "Mezclado"), ("colorea", "Colorear el que se pide"), ("lugar", "Decir el lugar")])]),
    M(3, "orden", "cantidad", "Más, menos o igual", "Comparar dos grupos de dibujos.",
      [op("modo", "Qué se rodea", [(None, "Mezclado"), ("mayor", "Solo el que tiene más"), ("menor", "Solo el que tiene menos")])], rmax=12),
]

# ------------------------------------------------------------ bloque 4 · valor posicional
MODELOS += [
    M(4, "valor", "agrupa", "Agrupa en decenas", "Rodear grupos de 10 y escribir decenas y unidades.", rmin=20, rmax=49),
    M(4, "valor", "canje", "Los canjes", "Cambiar unidades por decenas.", [NIVEL_DU], rmin=20),
    M(4, "valor", "descdu", "Descomposición en D y U", "Descomponer números en decenas y unidades.",
      [op("modo", "Forma", [(None, "Decenas y unidades (4 D + 3 U)"), ("suma", "Suma (40 + 3)")]), NIVEL_DU], rmin=30),
    M(4, "valor", "dunum", "Decenas, unidades y número", "Pasar de decenas y unidades al número y al revés.", [NIVEL_DU], rmin=30),
    M(4, "valor", "pares", "Pares e impares", "Distinguir números pares e impares.",
      [op("modo", "Tarea", [(None, "Contar puntos y rodear"), ("clasifica", "Clasificar en dos columnas", COMPLETA)])], rmax=20),
    M(4, "valor", "cifra", "El valor de la cifra", "Escribir cuánto vale cada cifra.", rmin=30),
]

# ------------------------------------------------------------ bloque 5 · sumar
DIBUJO = op("modo", "Presentación", [(None, "Solo números"), ("dibujo", "Con dibujos")])
BLOQ = op("modo", "Presentación", [(None, "Solo números"), ("bloques", "Con bloques de base diez")])
MODELOS += [
    M(5, "sumar", "dibujos", "Suma con dibujos", "Contar dos grupos de dibujos y escribir el total.", rmax=20),
    M(5, "sumar", "recta", "Suma en la recta numérica", "Sumar dando saltos en la recta.", rmax=30),
    M(5, "sumar", "h10", "Sumas hasta 10", "Sumas horizontales con resultado hasta 10.", rmax=10),
    M(5, "sumar", "h20", "Sumas hasta 20", "Sumas horizontales con resultado hasta 20.", [NIVEL], rmin=20, rmax=20),
    M(5, "sumar", "h100", "Sumas hasta 100", "Sumas horizontales de números de dos cifras.", [NIVEL], rmin=30),
    M(5, "sumar", "vertical", "Sumas en vertical", "Sumas colocadas en columna (D y U).", [NIVEL], rmin=30),
    M(5, "sumar", "dobles", "Los dobles", "Calcular el doble de un número.", [DIBUJO], rmax=20),
    M(5, "sumar", "comp10", "Completa hasta 10", "Lo que falta para llegar a 10.", rmax=10),
    M(5, "sumar", "comp20", "Completa hasta la decena", "Lo que falta para llegar a la decena siguiente.", rmin=20),
    M(5, "sumar", "hueco", "Sumas con hueco", "Sumas con un sumando desconocido.", [NIVEL]),
    M(5, "sumar", "decenas", "Sumas de decenas", "Sumar decenas completas (20 + 30).", [BLOQ], rmin=30),
    M(5, "sumar", "encadenadas", "Sumas encadenadas", "Sumar tres números seguidos.", rmax=20),
    M(5, "sumar", "piramide", "Pirámides de sumas", "Cada casilla es la suma de las dos de abajo.", [HUECOS(1, 4, 3)]),
    M(5, "sumar", "tabla", "Tabla de sumar", "Completar una tabla de doble entrada.", [HUECOS(1, 36)], tam=COMPLETA),
]

# ------------------------------------------------------------ bloque 6 · restar
DIBUJO_R = op("modo", "Presentación", [(None, "Solo números"), ("dibujo", "Con dibujos")])
MODELOS += [
    M(6, "restar", "quita", "Resta con dibujos", "Tachar dibujos y contar los que quedan.", rmax=20),
    M(6, "restar", "recta", "Resta en la recta numérica", "Restar dando saltos hacia atrás.", rmax=30),
    M(6, "restar", "r10", "Restas hasta 10", "Restas horizontales hasta 10.", rmax=10),
    M(6, "restar", "r20", "Restas hasta 20", "Restas horizontales hasta 20.", [NIVEL], rmin=20, rmax=20),
    M(6, "restar", "r100", "Restas hasta 100", "Restas horizontales de números de dos cifras.", [NIVEL], rmin=30),
    M(6, "restar", "vertical", "Restas en vertical", "Restas colocadas en columna (D y U).", [NIVEL], rmin=30),
    M(6, "restar", "mitades", "Las mitades", "Calcular la mitad de un número par.", [DIBUJO_R], rmax=20),
    M(6, "restar", "faltan", "¿Cuánto falta?", "Lo que falta para llegar a un número."),
    M(6, "restar", "hueco", "Restas con hueco", "Restas con un término desconocido.", [NIVEL]),
    M(6, "restar", "decenas", "Restas de decenas", "Restar decenas completas (50 − 20).", [BLOQ], rmin=30),
    M(6, "restar", "encadenadas", "Restas encadenadas", "Restar dos números seguidos.", rmax=20),
    M(6, "restar", "familia", "Familias de operaciones", "Usar una suma para completar dos restas.", [NIVEL]),
]

# ------------------------------------------------------------ bloque 7 · juegos
OPER = lambda d: op("modo", "Operaciones", [(None, d)] + [(v, e) for v, e in (("suma", "Solo sumas"), ("resta", "Solo restas"), ("mezcla", "Sumas y restas")) if e != d])
MODELOS += [
    M(7, "juegos", "cuadrado", "Cuadrados mágicos", "Completar un cuadrado mágico 3 × 3.", [num("n", "Casillas vacías", 3, 5, 4)]),
    M(7, "juegos", "laberinto", "Laberinto de números", "Seguir una serie desde la salida hasta la meta.",
      [op("n", "Salto", [(None, "De 1 en 1"), (2, "De 2 en 2"), (5, "De 5 en 5"), (10, "De 10 en 10")])], tam=COMPLETA),
    M(7, "juegos", "une", "Une operaciones y resultados", "Unir con flechas cada operación con su resultado.",
      [OPER("Sumas y restas"), NIVEL], tam=COMPLETA),
    M(7, "juegos", "cadena", "Cadenas de números", "Seguir una cadena de operaciones."),
    M(7, "juegos", "oculto", "El número oculto", "Adivinar un número a partir de pistas."),
    M(7, "juegos", "colorea", "Colorea y descubre", "Resolver y colorear para descubrir un dibujo.",
      [op("modo", "Operaciones", [(None, "Sumas"), ("resta", "Restas")]), NIVEL,
       op("n", "Dibujo", [(None, "Al azar"), (1, "Corazón"), (2, "Casa"), (3, "Árbol"), (4, "Diamante")])], tam=COMPLETA),
]

# ------------------------------------------------------------ bloque 9 · geometría (sin rango)
MODELOS += [
    M(9, "geometria", "figuras", "Las figuras planas", "Reconocer círculo, cuadrado, triángulo y rectángulo.", rmin=None),
    M(9, "geometria", "cuenta", "Cuenta las figuras", "Contar cuántas figuras hay de cada clase.", rmin=None, tam=COMPLETA),
    M(9, "geometria", "cuerpos", "Los cuerpos geométricos", "Reconocer esfera, cubo, cilindro, cono…", rmin=None),
    M(9, "geometria", "rueda", "¿Rueda o no rueda?", "Clasificar cuerpos que ruedan y que no.", rmin=None),
    M(9, "geometria", "lineas", "Las líneas", "Recta, curva y quebrada, o abierta y cerrada.",
      [op("modo", "Tipo", [(None, "Recta, curva o quebrada"), ("cierre", "Abierta o cerrada")])], rmin=None),
    M(9, "geometria", "posiciones", "Encima, debajo, izquierda y derecha", "Situar un objeto respecto a otro.", rmin=None),
    M(9, "geometria", "simetria", "La simetría", "Completar la mitad simétrica de un dibujo.", [num("n", "Tamaño del dibujo", 3, 5, 4)], rmin=None),
    M(9, "geometria", "copia", "Copia el dibujo", "Copiar un dibujo en la cuadrícula.", rmin=None, tam=COMPLETA),
]

# ------------------------------------------------------------ bloque 10 · medida
MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
MODELOS += [
    M(10, "medida", "dinero", "Cuenta el dinero", "Contar monedas y billetes.",
      [op("modo", "Unidad", [(None, "Euros"), ("centimos", "Céntimos")])], rango=20),
    M(10, "medida", "precios", "Las compras", "Calcular el total de una compra o la vuelta.",
      [op("modo", "Tarea", [(None, "Total de la compra"), ("cambio", "La vuelta")])], rmax=20, rango=20),
    M(10, "medida", "reloj", "Los relojes", "Leer la hora en relojes de agujas.", [RELOJ], rmin=None),
    M(10, "medida", "reloj2", "Dibuja las agujas", "Dibujar las agujas para marcar una hora.", [RELOJ], rmin=None),
    M(10, "medida", "calendario", "El calendario", "Leer un calendario mensual y contestar.",
      [op("n", "Mes", [(None, "Al azar")] + [(i + 1, m) for i, m in enumerate(MESES)])], rmin=None, tam=COMPLETA),
    M(10, "medida", "tiempo", "Días y meses", "Orden de los días de la semana o de los meses.",
      [op("modo", "Tema", [(None, "Días de la semana"), ("meses", "Meses del año")])], rmin=None),
    M(10, "medida", "longitud", "Mide con cubitos", "Medir longitudes con cubitos.",
      [op("modo", "Tarea", [(None, "Medir y escribir"), ("compara", "Medir y rodear el más largo")])], rmin=None),
    M(10, "medida", "capacidad", "¿Cuánto líquido hay?", "Ordenar vasos según el líquido.", rmin=None),
]

# ------------------------------------------------------------ bloque 11 · estadística
MODELOS += [
    M(11, "estadistica", "pictograma", "El pictograma", "Leer un pictograma y contestar.",
      [op("modo", "Valor del dibujo", [(None, "Cada dibujo vale 1"), ("dos", "Cada dibujo vale 2")])], rmax=10, tam=COMPLETA),
    M(11, "estadistica", "recuento", "Cuenta y anota", "Contar con palotes y escribir el número.", rmax=30, tam=COMPLETA),
    M(11, "estadistica", "barras", "El gráfico de barras", "Hacer o leer un gráfico de barras.",
      [op("modo", "Tarea", [(None, "Colorear el gráfico"), ("lee", "Leer el gráfico")])], rmax=10, tam=COMPLETA),
    M(11, "estadistica", "patrones", "Los patrones", "Continuar o completar series de figuras.",
      [op("modo", "Tarea", [(None, "Continuar la serie"), ("hueco", "Completar huecos")])], rmin=None),
]

POR_ID = {m["id"]: m for m in MODELOS}
assert len(POR_ID) == len(MODELOS), "id repetido en MODELOS"


# ------------------------------------------------------------ consultas para la app
def modelo(id):
    return POR_ID[id]

def menu(curso=None, materia=None):
    """Árbol {curso: {materia: {bloque: [modelos]}}} filtrado opcionalmente."""
    arbol = {}
    for m in MODELOS:
        if curso and m["curso"] != curso or materia and m["materia"] != materia: continue
        arbol.setdefault(m["curso"], {}).setdefault(m["materia"], {}).setdefault(m["bloque"], []).append(m)
    return arbol

def por_defecto(id):
    """Parámetros por defecto de un modelo: {'rango': R, opción: valor, ...}."""
    m = POR_ID[id]
    p = {o["id"]: o["defecto"] for o in m["opciones"]}
    p["rango"] = m["rango"]
    return p

def validar(id, params, tamano="completa"):
    """Comprueba y completa los parámetros. Devuelve un dict nuevo o lanza ValueError."""
    m = POR_ID[id]; p = por_defecto(id); p.update(params or {})
    if tamano not in m["tamanos"]: raise ValueError(f"{id}: no admite el tamaño '{tamano}'")
    ok = {o["id"]: o for o in m["opciones"]}
    for k, v in p.items():
        if k == "rango":
            if m["rangos"] and v not in m["rangos"]: raise ValueError(f"{id}: rango {v} no admitido {m['rangos']}")
            continue
        o = ok.get(k)
        if o is None: raise ValueError(f"{id}: opción desconocida '{k}'")
        if o["tipo"] == "opcion":
            x = next((x for x in o["valores"] if x["valor"] == v), None)
            if x is None: raise ValueError(f"{id}: valor '{v}' no válido para {k}")
            if tamano not in x.get("tamanos", (tamano,)): raise ValueError(f"{id}: '{x['etiqueta']}' solo en {x['tamanos']}")
        if o["tipo"] == "numero" and v is not None and not (o["min"] <= v <= o["max"]):
            raise ValueError(f"{id}: {k}={v} fuera de {o['min']}–{o['max']}")
        if o["tipo"] == "si_no" and not isinstance(v, bool): raise ValueError(f"{id}: {k} debe ser sí/no")
    return p

def a_json():
    """Catálogo completo para la app (JSON)."""
    import json
    return json.dumps({"cursos": CURSOS, "materias": MATERIAS, "bloques": BLOQUES, "modelos": MODELOS}, ensure_ascii=False)
