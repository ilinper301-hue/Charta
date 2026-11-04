"""Prueba de regresión del motor de Charta.
Uso:  python3 tests/test_motor.py          (rápida: 2 semillas)
      python3 tests/test_motor.py --full   (completa: 5 semillas, todos los niveles)
Genera todas las fichas en una carpeta temporal y comprueba:
  - que ningún modelo da error,
  - que todas las operaciones de la clave son correctas y no negativas.
"""
import sys, os, io, re, tempfile, contextlib
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "motor"))
import generador_fichas as g

FULL = "--full" in sys.argv
SEEDS = range(1, 6) if FULL else (1, 2)
NIVELES = (None, "con", "mezcla") if FULL else (None, "mezcla")
OUT = tempfile.mkdtemp() + "/"
EXP = re.compile(r"(?<![\d] )(?<![+−–-] )(\d+(?: [+−–] \d+)+) = (-?\d+)")
err = ops = fichas = 0

def run(f, *a, **k):
    global err, ops, fichas
    try:
        with contextlib.redirect_stdout(io.StringIO()) as buf: f(*a, outdir=OUT, **k)
        fichas += 1
        for m in EXP.finditer(buf.getvalue()):
            v = eval(m.group(1).replace("−", "-").replace("–", "-")); ops += 1
            if v != int(m.group(2)) or v < 0: err += 1; print("MAL", f.__name__, a, k, m.group(0))
    except Exception as e:
        err += 1; print("ERROR", f.__name__, a, k, repr(e))

for seed in SEEDS:
    for R in (10, 20, 30, 100):
        for k in g.CAT: run(g.ficha_rep, k, R, seed)
        if R >= 20: run(g.ficha_combinada, R, seed); run(g.ficha_suma, R, seed)
        for k in g.CONTEO:
            if not (k == "serie10" and R < 20): run(g.ficha_conteo, k, R, seed)
        for k in g.ORDEN: run(g.ficha_orden, k, R, seed)
        for k in g.VALOR:
            if R >= (30 if k in ("descdu", "dunum", "cifra") else 20 if k in ("agrupa", "canje") else 10): run(g.ficha_valor, k, R, seed)
        for d, f in ((g.SUMAR, g.ficha_sumar), (g.RESTAR, g.ficha_restar)):
            for k, v in d.items():
                if R >= v[3]:
                    for nv in NIVELES: run(f, k, R, seed, nivel=nv)
        for k in g.JUEGOS: run(g.ficha_juegos, k, R, seed)
        run(g.ficha_medida, "dinero", R, seed); run(g.ficha_medida, "precios", R, seed); run(g.ficha_medida, "precios", R, seed, modo="cambio")
        for k in g.ESTAD: run(g.ficha_estadistica, k, R, seed)
    for k in g.GEOM: run(g.ficha_geometria, k, seed)
    for k in ("reloj", "reloj2", "calendario", "tiempo", "longitud", "capacidad"): run(g.ficha_medida, k, 20, seed)

# ---- catálogo MODELOS (paso 1.1): cubre el motor y cada opción funciona
import modelos as mo
FAM = {"rep": g.CAT, "conteo": g.CONTEO, "orden": g.ORDEN, "valor": g.VALOR, "sumar": g.SUMAR, "restar": g.RESTAR,
       "juegos": g.JUEGOS, "geometria": g.GEOM, "medida": g.MEDIDA, "estadistica": g.ESTAD}
FN = {"rep": g.ficha_rep, "combinada": g.ficha_combinada, "suma": g.ficha_suma, "conteo": g.ficha_conteo,
      "orden": g.ficha_orden, "valor": g.ficha_valor, "sumar": g.ficha_sumar, "restar": g.ficha_restar,
      "juegos": g.ficha_juegos, "geometria": g.ficha_geometria, "medida": g.ficha_medida, "estadistica": g.ficha_estadistica}
ids = {(m["familia"], m["clave"]) for m in mo.MODELOS}
for f, d in FAM.items():
    for k in d:
        if (f, k) not in ids: err += 1; print("FALTA EN MODELOS", f, k)
for f, k in ids:
    if f in FAM and k not in FAM[f]: err += 1; print("NO EXISTE EN EL MOTOR", f, k)

def run_modelo(m, p, seed):
    p = mo.validar(m["id"], p); R = p.pop("rango")
    R = R or {"medida": 20, "estadistica": 10}.get(m["familia"])
    a = (R,) if m["familia"] in ("combinada", "suma") else (m["clave"],) if R is None else (m["clave"], R)
    run(FN[m["familia"]], *a, seed, **{k: v for k, v in p.items() if v is not None})

for m in mo.MODELOS:
    variantes = [{}] + [{"rango": r} for r in m["rangos"][1:]]
    for o in m["opciones"]:
        vals = [x["valor"] for x in o["valores"]] if o["tipo"] == "opcion" else \
               [o["min"], o["max"]] if o["tipo"] == "numero" else [True]
        variantes += [{o["id"]: v, "rango": r} for v in vals for r in (m["rangos"] or [None])[-1:]]
    for p in variantes:
        if p.get("rango", 0) is None: p.pop("rango")
        for seed in SEEDS[:1]: run_modelo(m, p, seed)

print(f"Fichas: {fichas} | operaciones comprobadas: {ops} | errores: {err} | modelos: {len(mo.MODELOS)}")
sys.exit(1 if err else 0)
