"""Charta · modelos que solo existen en la app (sin equivalente en el motor Python de referencia).
Mismo formato que modelos.MODELOS (se construyen con modelos.M). Cada uno lleva además su `titulo` (el de la ficha,
en mayúsculas como el motor) y su `color` de panel. tools/catalogo.py los añade al catálogo de la app tras los del motor.
(No entran en modelos.MODELOS: tests/test_motor.py comprueba esa lista contra el motor.)"""
from modelos import M, op, si_no, COMPLETA, AMBOS

BLOQUES = {8: "Problemas", 12: "Trucos de cálculo mental"}

NIVEL_P = op("nivel", "Llevadas", [(None, "Sin llevadas"), ("con", "Con llevadas"), ("mezcla", "Mezcladas")])
SIT_SUMA = op("situacion", "Situaciones", [(None, "Variadas"), ("juntar", "Juntar dos cantidades"), ("anadir", "Añadir a lo que hay")])
SIT_RESTA = op("situacion", "Situaciones", [(None, "Variadas"), ("quitar", "Quitar o regalar"), ("comparar", "Comparar (cuántos más o menos)"), ("faltar", "Cuántos faltan")])

OPERACION_P = op("operacion", "Operaciones", [(None, "Sumas y restas"), ("suma", "Solo sumar"), ("resta", "Solo restar")])
BARRA = op("barra", "Barra", [(None, "Dibujada (con los números)"), ("blanco", "En blanco (la dibuja el alumno)")])

def _p(clave, nombre, descripcion, opciones, titulo, color):
    # rmin=10: rangos 10…100; por defecto el 20 (en 1.º los problemas empiezan con números pequeños)
    return {**M(8, "problemas", clave, nombre, descripcion, opciones, rmin=10, rmax=100, tam=AMBOS, rango=20), "titulo": titulo, "color": color}

def _t(clave, nombre, descripcion, opciones, titulo, color, rmin, rmax, rango=None):
    """Trucos de cálculo mental de Calculi (bloque 12)."""
    return {**M(12, "trucos", clave, nombre, descripcion, opciones, rmin=rmin, rmax=rmax, tam=AMBOS, rango=rango), "titulo": titulo, "color": color}

MODELOS_APP = [
    _p("suma", "Problemas de sumar", "Problemas de una operación: juntar o añadir. Nombres y objetos distintos en cada uno.", [SIT_SUMA, NIVEL_P], "PROBLEMAS DE SUMAR", "amarillo"),
    _p("resta", "Problemas de restar", "Problemas de una operación: quitar, comparar o cuántos faltan.", [SIT_RESTA, NIVEL_P], "PROBLEMAS DE RESTAR", "rosa"),
    _p("mixtos", "Problemas de sumar y restar", "Problemas mezclados: hay que decidir si se suma o se resta.", [NIVEL_P], "PROBLEMAS", "verde"),
    _p("barras", "Problemas con barras", "Modelo de barras de Singapur (como Barri): enunciado, barra de partes y total o de comparación, operación y respuesta.",
       [OPERACION_P, NIVEL_P, BARRA], "PROBLEMAS CON BARRAS", "azul"),
]

MODELOS_APP += [
    _t("masmenos1", "Uno más, uno menos", "El vecino de cada número: sumar o restar 1 (truco de Calculi).",
       [op("modo", "Operaciones", [(None, "Uno más y uno menos"), ("mas", "Solo uno más"), ("menos", "Solo uno menos")])], "UNO MÁS, UNO MENOS", "amarillo", 10, 20, 10),
    _t("descomponer", "Descomponer hasta 10", "Partir un número en dos trozos y hallar el que falta (truco de Calculi).", [], "DESCOMPONER HASTA 10", "verde", 10, 10),
    _t("orden", "El orden no importa", "Empezar por el número grande: igualdades y sumas giradas (truco de Calculi).",
       [op("forma", "Ejercicios", [(None, "Variados"), ("igualdad", "Completar la igualdad"), ("calcula", "Calcular empezando por el grande")])], "EL ORDEN NO IMPORTA", "azul", 10, 20, 10),
    _t("usar5", "Usar el 5", "Sumas de 5 a 9 separando la mano de 5 (truco de Calculi).",
       [op("modo", "Ejercicios", [(None, "Variados"), ("suma", "Solo sumas")])], "USAR EL 5", "rosa", 20, 20),
    _t("casidobles", "Casi dobles", "Sumas de dos números seguidos: el doble y uno más (truco de Calculi).", [], "CASI DOBLES", "amarillo", 20, 20),
    _t("sumar9", "Sumar 9", "Sumar 10 y quitar 1 (truco de Calculi).", [], "SUMAR 9", "azul", 20, 100, 30),
    _t("restarsumando", "Restar sumando", "Restar contando lo que falta para llegar (truco de Calculi).", [], "RESTAR SUMANDO", "rosa", 20, 20),
    _t("masmenos10", "Sumar y restar 10", "Solo cambia la decena (truco de Calculi).",
       [op("modo", "Operaciones", [(None, "Sumar y restar 10"), ("suma", "Solo sumar 10"), ("resta", "Solo restar 10")])], "SUMAR Y RESTAR 10", "verde", 30, 100, 50),
]
