"""Genera src/render/anchos_fredoka.js: anchuras (milésimas de em) de Fredoka en normal (wght 400) y negrita (600, el máximo de la
fuente incrustada) para ajustar y centrar textos como hace Andika (src/rep/index.js).
Uso: python3 tools/anchos_fuente.py   (necesita fontTools; la fuente sale de src/fuentes/Fredoka.woff)"""
import os, json
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
RUTA = os.path.join(RAIZ, "src", "fuentes", "Fredoka.woff")
CARS = [chr(c) for c in range(32, 127)] + list("áéíóúüñÁÉÍÓÚÜÑ¿¡−€·×÷«»")

def tabla(w):
    f = instancer.instantiateVariableFont(TTFont(RUTA), {"wght": w}, inplace=False)
    cm, hm = f.getBestCmap(), f["hmtx"]
    return {c: round(hm[cm[ord(c)]][0] * 1000 / f["head"].unitsPerEm) for c in CARS if ord(c) in cm}
js = ("// GENERADO por tools/anchos_fuente.py. No editar a mano.\n// Anchuras de Fredoka en milésimas de em: R = normal (400), B = negrita (600).\n"
      f"export const FREDOKA_R = {json.dumps(tabla(400), ensure_ascii=False, separators=(',', ':'))};\n"
      f"export const FREDOKA_B = {json.dumps(tabla(600), ensure_ascii=False, separators=(',', ':'))};\n")
open(os.path.join(RAIZ, "src", "render", "anchos_fredoka.js"), "w", encoding="utf-8").write(js)
print("anchos_fredoka.js:", len(js), "bytes")
