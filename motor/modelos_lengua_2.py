"""Charta · Lengua de 2.º (ver LENGUA_2.md, en los documentos del proyecto de Claude).

Como en Matemáticas (modelos_2.py): los modelos de 1.º que sirven en 2.º no cambian de id; tools/catalogo.py les
añade `cursos: {"2": {"rangos": [], "rango": None, "params": {...}}}`. `params` son valores por defecto propios de 2.º
(porDefecto() en ficha.js los aplica). Los nuevos de 2.º (✨) irán en MODELOS_LENGUA_2 con curso 2.
Decisiones de Iván (25-11-2026): el alumnado escribe en imprenta; pauta Lamela de 4 mm por defecto.
En 2.º no hay mapa de letras (esLengua1) y buscar() también da las palabras de datos/lexico_2.tsv (n: 2).
"""

from modelos_lengua import MATERIA

CURSO = 2
PAUTA_2 = {"pauta": 4}
MIXTAS = {"tipo": "mixtas"}   # 2.º: sílabas trabadas y mixtas por defecto (la dificultad se gradúa con «Tipo de sílabas»)

# id de 1.º → valores por defecto en 2.º ({} = los de 1.º). Fuera quedan los de iniciación a la lectoescritura:
# letra.busca, letra.enpalabras, letra.vocales, letra.parejas, silaba.tabla, fono.inicial, fono.posicion,
# palabra.cuenta, palabra.dibuja y escritura.trazos.
EN_L2 = {
    **{i: {} for i in (
        "letra.falta", "letra.abecedario",
        "palabra.intrusa", "palabra.clasifica", "palabra.letras", "palabra.articulo", "palabra.plural", "palabra.contrarios",
        "orto.elige", "orto.mayuscula", "frase.verdad",
        "lectura.texto", "lectura.ordena", "lectura.instrucciones", "lectura.adivinanza", "lectura.fluidez")},
    # Lote 1 (LENGUA_2.md): ♻ con las opciones de 2.º (palabras de 1 a 5 sílabas, frases de 4 a 8 palabras)
    **{i: MIXTAS for i in ("silaba.separa", "silaba.ordena", "silaba.falta", "fono.silabas", "fono.larga", "fono.quita", "fono.rimas")},
    "silaba.junta": {**MIXTAS, "largo": "variadas2"},
    "palabra.sopa": {"direcciones": "diagonal"},
    **{i: {"palabras": "v2"} for i in ("frase.ordena", "frase.separa", "frase.completa", "frase.puntua")},
    **{i: PAUTA_2 for i in (
        "escritura.letra", "escritura.palabras", "escritura.frase", "escritura.dictado", "escritura.libre", "escritura.ordena")},
}

# Opciones y valores solo de 2.º (`curso: 2`: ficha.js visible(); en 1.º no se ofrecen ni se guardan). Mismo formato que OPCIONES_2 de modelos_2.py.
def _v(valor, etiqueta): return {"valor": valor, "etiqueta": etiqueta, "curso": CURSO}
CINCO = [_v(5, "5 sílabas")]
def _frases(*extra, v2="Variadas (4 a 8)"): return [_v("v2", v2)] + [_v(n, f"{n} palabras") for n in extra]
OPCIONES_L2 = {
    "fono.silabas": {"valores": {"largo": CINCO}},
    "fono.quita": {"valores": {"largo": CINCO}},
    "silaba.separa": {"valores": {"largo": CINCO}},
    "silaba.ordena": {"valores": {"largo": CINCO}},
    "silaba.falta": {"valores": {"largo": CINCO}},
    "silaba.junta": {"valores": {"largo": [_v(4, "4 sílabas"), _v(5, "5 sílabas"), _v("variadas2", "De 2 a 4 sílabas (al unir, de 2)")]}},
    "palabra.sopa": {"valores": {"palabras": [_v(9, "9 palabras"), _v(10, "10 palabras")]}},
    "frase.ordena": {"valores": {"palabras": _frases(6, 7, v2="Variadas (4 a 7)")}},
    "frase.separa": {"valores": {"palabras": _frases(6, 7, 8)}},
    "frase.completa": {"valores": {"palabras": _frases(6, 7, 8)}},
    "frase.puntua": {"valores": {"palabras": _frases(6, 7, 8), "falta": [_v("dos", "Dos frases seguidas (punto y mayúscula; se escriben bien)")]}},
}

def opciones_l2(m):
    """Opciones del modelo (dict del catálogo) con las valores solo de 2.º añadidos (lista nueva; m no cambia)."""
    extra = OPCIONES_L2.get(m["id"])
    if not extra: return m["opciones"]
    def junta(o):
        nuevos = extra.get("valores", {}).get(o["id"], [])
        return {**o, "valores": [dict(v) for v in o["valores"]] + [dict(n) for n in nuevos]} if nuevos else o
    return [junta(o) if o["tipo"] == "opcion" else o for o in m["opciones"]]

MODELOS_LENGUA_2 = []   # ✨ nuevos de 2.º (lotes 2–7 de LENGUA_2.md)


def cursos_extra(m):
    """{"2": {...}} si el modelo de Lengua (dict del catálogo) también está en 2.º; {} si no."""
    if m.get("materia") != MATERIA or m["id"] not in EN_L2: return {}
    x = {"rangos": [], "rango": None}
    if EN_L2[m["id"]]: x["params"] = dict(EN_L2[m["id"]])
    return {str(CURSO): x}
