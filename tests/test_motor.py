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

# ---- actividades (paso 1.2): cada modelo y opción, en página completa y media, dentro de un rectángulo
import random
from reportlab.pdfgen import canvas
CV = canvas.Canvas(OUT + "actividades.pdf", pagesize=g.A4)
BASE = g.H - g.M - 76 - (g.H - 2*g.M - 76)*0.5    # en media página nada debe bajar de aquí
low, spy_on = [1e9], [False]
def _spy(name, ys):
    f = getattr(CV, name)
    def w(*a, **k):
        if spy_on[0]:
            try: low[0] = min(low[0], ys(a))
            except Exception: pass
        return f(*a, **k)
    setattr(CV, name, w)
for nm, ys in (("roundRect", lambda a: a[1]), ("rect", lambda a: a[1]), ("drawString", lambda a: a[1]), ("drawCentredString", lambda a: a[1]),
               ("drawRightString", lambda a: a[1]), ("line", lambda a: min(a[1], a[3])), ("circle", lambda a: a[1] - a[2])):
    _spy(nm, ys)
_panel = g.panel
def _panel_spy(*a, **k): _panel(*a, **k); spy_on[0] = True
g.panel = _panel_spy

def run_act(m, p, seed, tam):
    global err, ops, fichas
    low[0] = 1e9; spy_on[0] = False
    try:
        rect = (34, 26, g.W - 68, 640) if tam == "completa" else (34, 26, g.W - 68, 330)
        clave = g.actividad(CV, rect, {"modelo": m["id"], **p}, random.Random(seed), tamano=tam); fichas += 1
        for x in EXP.finditer(clave):
            v = eval(x.group(1).replace("−", "-").replace("–", "-")); ops += 1
            if v != int(x.group(2)) or v < 0: err += 1; print("MAL", m["id"], tam, p, x.group(0))
        if tam == "media" and m["familia"] not in ("rep", "combinada", "suma") and low[0] < BASE - 2:
            err += 1; print("SE SALE DE MEDIA PÁGINA", m["id"], p, round(BASE - low[0]))
    except Exception as e:
        err += 1; print("ERROR", m["id"], tam, p, repr(e))
    spy_on[0] = False

for m in mo.MODELOS:
    for tam in m["tamanos"]:
        variantes = [{}] + [{"rango": r} for r in m["rangos"][1:]]
        for o in m["opciones"]:
            vals = [x["valor"] for x in o["valores"] if tam in x.get("tamanos", (tam,))] if o["tipo"] == "opcion" else \
                   [o["min"], o["max"]] if o["tipo"] == "numero" else [True]
            variantes += [{o["id"]: v, **({"rango": m["rangos"][-1]} if m["rangos"] else {})} for v in vals]
        for p in variantes:
            for seed in SEEDS: run_act(m, p, seed, tam)
    CV.showPage()

# ---- compositor de página (paso 1.3): combinaciones al azar, con y sin nombre, y errores esperados
rp = random.Random(7); medias = [m["id"] for m in mo.MODELOS if "media" in m["tamanos"]]
solo = [m["id"] for m in mo.MODELOS if m["tamanos"] == ("completa",)]
CVP = canvas.Canvas(OUT + "paginas.pdf", pagesize=g.A4)
for i in range(60 if FULL else 25):
    acts = [{"modelo": x} for x in (rp.sample(medias, 2) if i % 3 else [rp.choice(medias + solo)])]
    try:
        claves = g.pagina(CVP, acts, random.Random(i), nombre=("Alumno Número %d" % i) if i % 2 else ""); fichas += 1
        if len(claves) != len(acts): err += 1; print("CLAVES", acts)
        for x in EXP.finditer(" ".join(claves)):
            ops += 1
            if eval(x.group(1).replace("−", "-").replace("–", "-")) != int(x.group(2)): err += 1; print("MAL", acts, x.group(0))
    except Exception as e:
        err += 1; print("ERROR página", acts, repr(e))
    CVP.showPage()
for acts in ([{"modelo": solo[0]}, {"modelo": medias[0]}], [], [{"modelo": medias[0]}]*3):
    try: g.pagina(CVP, acts, random.Random(1)); err += 1; print("DEBERÍA FALLAR", acts)
    except ValueError: pass
CVP.save()

# ---- API generar (paso 1.4): alumnos, iguales/distintas, copias, reproducible
def _np(pdf): return len(re.findall(rb"/Type /Page\b", pdf))
base = {"actividades": [{"modelo": "sumar.h20"}, {"modelo": "restar.r20"}], "alumnos": ["Ana", "Luis", "", "Marta"], "semilla": 4}
for var in ("iguales", "distintas"):
    pdf, k = g.generar(dict(base, variaciones=var)); fichas += 1
    if _np(pdf) != 3 or len(k["paginas"]) != 3: err += 1; print("PÁGINAS", var, _np(pdf))
    dif = len({str(p["claves"]) for p in k["paginas"]})
    if (var == "iguales") != (dif == 1): err += 1; print("VARIACIONES", var, dif)
    if g.generar(dict(base, variaciones=var))[1] != k: err += 1; print("NO REPRODUCIBLE", var)
pdf, k = g.generar({"actividades": [{"modelo": "rep.dado"}], "copias": 3, "color": "rosa"})
if _np(pdf) != 3 or any(p["alumno"] for p in k["paginas"]): err += 1; print("COPIAS")
if g.generar(dict(base, semilla=5))[1] == g.generar(base)[1]: err += 1; print("OTRA VARIANTE IGUAL")

print(f"Fichas: {fichas} | operaciones comprobadas: {ops} | errores: {err} | modelos: {len(mo.MODELOS)}")
sys.exit(1 if err else 0)
