"""Charta · modelos que solo existen en la app (sin equivalente en el motor Python de referencia).
Mismo formato que modelos.MODELOS (se construyen con modelos.M). Cada uno lleva además su `titulo` (el de la ficha,
en mayúsculas como el motor) y su `color` de panel. tools/catalogo.py los añade al catálogo de la app tras los del motor.
(No entran en modelos.MODELOS: tests/test_motor.py comprueba esa lista contra el motor.)"""
from modelos import M, op, si_no, COMPLETA, AMBOS

BLOQUES = {8: "Problemas"}

NIVEL_P = op("nivel", "Llevadas", [(None, "Sin llevadas"), ("con", "Con llevadas"), ("mezcla", "Mezcladas")])
SIT_SUMA = op("situacion", "Situaciones", [(None, "Variadas"), ("juntar", "Juntar dos cantidades"), ("anadir", "Añadir a lo que hay")])
SIT_RESTA = op("situacion", "Situaciones", [(None, "Variadas"), ("quitar", "Quitar o regalar"), ("comparar", "Comparar (cuántos más o menos)"), ("faltar", "Cuántos faltan")])

def _p(clave, nombre, descripcion, opciones, titulo, color):
    # rmin=10: rangos 10…100; por defecto el 20 (en 1.º los problemas empiezan con números pequeños)
    return {**M(8, "problemas", clave, nombre, descripcion, opciones, rmin=10, rmax=100, tam=AMBOS, rango=20), "titulo": titulo, "color": color}

MODELOS_APP = [
    _p("suma", "Problemas de sumar", "Problemas de una operación: juntar o añadir. Nombres y objetos distintos en cada uno.", [SIT_SUMA, NIVEL_P], "PROBLEMAS DE SUMAR", "amarillo"),
    _p("resta", "Problemas de restar", "Problemas de una operación: quitar, comparar o cuántos faltan.", [SIT_RESTA, NIVEL_P], "PROBLEMAS DE RESTAR", "rosa"),
    _p("mixtos", "Problemas de sumar y restar", "Problemas mezclados: hay que decidir si se suma o se resta.", [NIVEL_P], "PROBLEMAS", "verde"),
]
