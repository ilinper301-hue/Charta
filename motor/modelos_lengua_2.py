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

# id de 1.º → valores por defecto en 2.º ({} = los de 1.º). Fuera quedan los de iniciación a la lectoescritura:
# letra.busca, letra.enpalabras, letra.vocales, letra.parejas, silaba.tabla, fono.inicial, fono.posicion,
# palabra.cuenta, palabra.dibuja y escritura.trazos.
EN_L2 = {
    **{i: {} for i in (
        "letra.falta", "letra.abecedario",
        "silaba.junta", "silaba.separa", "silaba.ordena", "silaba.falta",
        "fono.silabas", "fono.rimas", "fono.quita", "fono.larga",
        "palabra.intrusa", "palabra.clasifica", "palabra.letras", "palabra.articulo", "palabra.plural", "palabra.contrarios", "palabra.sopa",
        "orto.elige", "orto.mayuscula",
        "frase.ordena", "frase.separa", "frase.completa", "frase.verdad", "frase.puntua",
        "lectura.texto", "lectura.ordena", "lectura.instrucciones", "lectura.adivinanza", "lectura.fluidez")},
    **{i: PAUTA_2 for i in (
        "escritura.letra", "escritura.palabras", "escritura.frase", "escritura.dictado", "escritura.libre", "escritura.ordena")},
}

MODELOS_LENGUA_2 = []   # ✨ nuevos de 2.º (lotes 2–7 de LENGUA_2.md)


def cursos_extra(m):
    """{"2": {...}} si el modelo de Lengua (dict del catálogo) también está en 2.º; {} si no."""
    if m.get("materia") != MATERIA or m["id"] not in EN_L2: return {}
    x = {"rangos": [], "rango": None}
    if EN_L2[m["id"]]: x["params"] = dict(EN_L2[m["id"]])
    return {str(CURSO): x}
