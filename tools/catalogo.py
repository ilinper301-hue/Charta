"""Genera src/nucleo/catalogo.js a partir de motor/modelos.py (y título y color de cada modelo del motor).
Ejecutar tras cambiar MODELOS:  python3 tools/catalogo.py
`titulo`: texto (en mayúsculas, como el motor) o {modo: texto} si depende del modo ("_" = por defecto)."""
import os, sys, json
RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
sys.path.insert(0, os.path.join(RAIZ, "motor"))
import modelos as MOD
import generador_fichas as g

def titulo(m):
    modo = next((o for o in m["opciones"] if o["id"] == "modo" and o["tipo"] == "opcion"), None)
    if modo is None: return g.titulo_modelo(m, {})
    ts = {("_" if v["valor"] is None else v["valor"]): g.titulo_modelo(m, {"modo": v["valor"]}) for v in modo["valores"]}
    return ts["_"] if len(set(ts.values())) == 1 and "_" in ts else ts

modelos = [{**m, "tamanos": list(m["tamanos"]), "titulo": titulo(m), "color": g.color_modelo(m)} for m in MOD.MODELOS]
datos = {"cursos": MOD.CURSOS, "materias": MOD.MATERIAS, "bloques": MOD.BLOQUES, "modelos": modelos}
js = ("// GENERADO por tools/catalogo.py desde motor/modelos.py. No editar a mano.\n"
      "export const CATALOGO = " + json.dumps(datos, ensure_ascii=False, indent=1) + ";\n"
      "export const POR_ID = Object.fromEntries(CATALOGO.modelos.map((m) => [m.id, m]));\n")
with open(os.path.join(RAIZ, "src", "nucleo", "catalogo.js"), "w", encoding="utf-8") as f: f.write(js)
print(f"catalogo.js: {len(modelos)} modelos")
