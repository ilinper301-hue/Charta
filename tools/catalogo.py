"""Genera src/nucleo/catalogo.js a partir de motor/modelos.py (y título y color de cada modelo del motor).
Ejecutar tras cambiar MODELOS:  python3 tools/catalogo.py
`titulo`: texto (en mayúsculas, como el motor) o {modo: texto} si depende del modo ("_" = por defecto)."""
import os, sys, json
RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
sys.path.insert(0, os.path.join(RAIZ, "motor"))
import modelos as MOD
import generador_fichas as g
import metadatos as META
import modelos_app as APP
import modelos_lengua as LEN
import modelos_2 as M2

def titulo(m):
    modo = next((o for o in m["opciones"] if o["id"] == "modo" and o["tipo"] == "opcion"), None)
    if modo is None: return g.titulo_modelo(m, {})
    ts = {("_" if v["valor"] is None else v["valor"]): g.titulo_modelo(m, {"modo": v["valor"]}) for v in modo["valores"]}
    return ts["_"] if len(set(ts.values())) == 1 and "_" in ts else ts

modelos = [{**m, "tamanos": list(m["tamanos"]), "titulo": titulo(m), "color": g.color_modelo(m), "metadatos": META.metadatos(m["id"])} for m in MOD.MODELOS]
# Modelos solo de la app (motor/modelos_app.py): sin motor Python que dé título y color.
modelos += [{**m, "tamanos": list(m["tamanos"]), "metadatos": META.metadatos(m["id"])} for m in APP.MODELOS_APP]
modelos += [{**m, "tamanos": list(m["tamanos"]), "metadatos": META.metadatos(m["id"])} for m in LEN.MODELOS_LENGUA]
modelos += [{**m, "tamanos": list(m["tamanos"]), "metadatos": META.metadatos(m["id"])} for m in M2.MODELOS_2]
# Un modelo en varios cursos (MATES_2.md): los de 1.º que sirven en 2.º llevan sus rangos de 2.º.
for m in modelos:
    extra = M2.cursos_extra(m)
    if extra: m["cursos"] = extra
    m["opciones"] = M2.opciones_2(m)   # 2.º: opciones solo con tres cifras (rmin)
# Bloques por materia (cada materia numera los suyos) y letra por defecto de cada materia (Andika si no se dice).
datos = {"cursos": {**MOD.CURSOS, M2.CURSO: M2.NOMBRE}, "materias": {**MOD.MATERIAS, LEN.MATERIA: LEN.NOMBRE},
         "bloques": {"matematicas": dict(sorted({**MOD.BLOQUES, **APP.BLOQUES}.items())), LEN.MATERIA: LEN.BLOQUES},
         "fuentes": {LEN.MATERIA: LEN.FUENTE}, "modelos": modelos}
# Fase 7 (R9): JSON compacto (sin espacios ni sangrías, −36 %); un modelo por línea para que los cambios se lean en git.
compacto = lambda x: json.dumps(x, ensure_ascii=False, separators=(",", ":"))
resto = {k: v for k, v in datos.items() if k != "modelos"}
js = ("// GENERADO por tools/catalogo.py desde motor/modelos.py. No editar a mano.\n"
      "export const CATALOGO = " + compacto(resto)[:-1] + ',"modelos":[\n' + ",\n".join(compacto(m) for m in modelos) + "\n]};\n"
      "export const POR_ID = Object.fromEntries(CATALOGO.modelos.map((m) => [m.id, m]));\n")
with open(os.path.join(RAIZ, "src", "nucleo", "catalogo.js"), "w", encoding="utf-8") as f: f.write(js)
print(f"catalogo.js: {len(modelos)} modelos")
