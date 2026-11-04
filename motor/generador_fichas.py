import math, random, os, sys
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

G = "/usr/share/fonts/truetype/google-fonts/"
def _fuente(nombres):
    for d in ["/mnt/project/", os.path.dirname(os.path.abspath(__file__)) + "/", "/mnt/user-data/uploads/", G]:
        for n in nombres:
            if os.path.exists(d + n): return d + n
    return None
_AB = _fuente(["Andika-Bold.ttf", "Andika-B.ttf"]); _AR = _fuente(["Andika-Regular.ttf", "Andika-R.ttf", "Andika.ttf"])
if _AB and _AR:
    pdfmetrics.registerFont(TTFont("PB", _AB)); pdfmetrics.registerFont(TTFont("PM", _AR)); pdfmetrics.registerFont(TTFont("PR", _AR))
else:
    print("Aviso: no se encontró Andika (Andika-Regular.ttf y Andika-Bold.ttf); uso Poppins.")
    pdfmetrics.registerFont(TTFont("PB", G + "Poppins-Bold.ttf"))
    pdfmetrics.registerFont(TTFont("PM", G + "Poppins-Medium.ttf"))
    pdfmetrics.registerFont(TTFont("PR", G + "Poppins-Regular.ttf"))

W, H = A4
INK = 0.12
c = None
OUTDIR = "/mnt/user-data/outputs/fichas_representaciones/"

def stroke(w=1.6):
    c.setLineWidth(w); c.setStrokeGray(INK); c.setFillGray(INK)
    c.setLineCap(1); c.setLineJoin(1)

PIPS = {0: [], 1: [(.5,.5)], 2: [(.27,.73),(.73,.27)],
        3: [(.27,.73),(.5,.5),(.73,.27)],
        4: [(.27,.73),(.73,.73),(.27,.27),(.73,.27)],
        5: [(.27,.73),(.73,.73),(.5,.5),(.27,.27),(.73,.27)],
        6: [(.3,.76),(.3,.5),(.3,.24),(.7,.76),(.7,.5),(.7,.24)]}

def pips(n, x, y, s, r):
    for px, py in PIPS[n]:
        c.circle(x + px*s, y + py*s, r, stroke=0, fill=1)

def esc(fn, k):
    def f(*a):
        cx, cy = a[0], a[1]
        c.saveState(); c.translate(cx, cy); c.scale(k, k)
        fn(0, 0, *a[2:])
        c.restoreState()
    return f

# ------------------------------------------------------------ DEDOS
def mano(cx, cy, up, k=0.8):
    stroke(1.6)
    c.saveState(); c.translate(cx, cy); c.scale(k, k)
    fw, gap = 11, 3
    palm_w, palm_h = 4*fw + 3*gap + 10, 30
    px, py = -palm_w/2, -34
    heights = [30, 37, 33, 26]
    if 0 in up:
        c.saveState(); c.translate(px + 4, py + 9); c.rotate(32)
        c.roundRect(-5.5, -3, 11, 30, 5.5, stroke=1, fill=0); c.restoreState()
    for j in range(4):
        fx = px + 5 + j*(fw + gap)
        h = heights[j] if (j + 1) in up else 7
        c.roundRect(fx, py + palm_h - 6, fw, h + 6, fw/2, stroke=1, fill=0)
    c.setFillGray(1)
    c.roundRect(px, py, palm_w, palm_h, 10, stroke=1, fill=1)
    c.setFillGray(INK)
    if 0 not in up:
        c.saveState(); c.translate(px + palm_w*0.42, py + 11); c.rotate(8)
        c.roundRect(-18, -5.5, 36, 11, 5.5, stroke=1, fill=0); c.restoreState()
    c.restoreState()

def r_dedos(cx, cy, n, i):
    up = lambda k: set(range(5)) if k == 5 else set(range(1, k + 1))
    if n <= 5:
        mano(cx, cy, up(n), 1.12)
    else:
        mano(cx - 41, cy, up(5), 0.86)
        mano(cx + 43, cy, up(n - 5), 0.86)

# ------------------------------------------------------------ DADO
def die(cx, cy, n, s, vacio=False):
    stroke(1.8)
    c.roundRect(cx - s/2, cy - s/2, s, s, s*0.16, stroke=1, fill=0)
    if not vacio:
        pips(n, cx - s/2, cy - s/2, s, s*0.085)

def r_dado(cx, cy, n, i, vacio=False):
    if n <= 6:
        die(cx, cy, n, 62, vacio)
    else:
        a = (n + 1)//2; b = n - a
        if (i + n) % 2: a, b = b, a
        die(cx - 34, cy, a, 54, vacio); die(cx + 34, cy, b, 54, vacio)

# ------------------------------------------------------------ DOMINÓ
def split_dom(n, i):
    lo, hi = max(0, n - 6), min(6, n)
    a = lo + ((i*5 + n) % (hi - lo + 1)); b = n - a
    if (i + n) % 2: a, b = b, a
    return a, b

def r_domino(cx, cy, n, i, vacio=False):
    a, b = split_dom(n, i)
    stroke(1.8)
    w, h = 124, 62
    x, y = cx - w/2, cy - h/2
    c.roundRect(x, y, w, h, 9, stroke=1, fill=0)
    c.setLineWidth(1.4)
    c.line(cx, y + 6, cx, y + h - 6)
    if not vacio:
        pips(a, x + 1, y + 1, h - 2, 4.6)
        pips(b, cx + 1, y + 1, h - 2, 4.6)

# ------------------------------------------------------------ MARCO DE DIEZ
def frame(x, y, cs, fill_n, r):
    stroke(1.5)
    w, h = 5*cs, 2*cs
    c.rect(x, y, w, h, stroke=1, fill=0)
    for j in range(1, 5):
        c.line(x + j*cs, y, x + j*cs, y + h)
    c.line(x, y + cs, x + w, y + cs)
    for k in range(fill_n):
        row, col = divmod(k, 5)
        c.circle(x + col*cs + cs/2, y + h - row*cs - cs/2, r, stroke=0, fill=1)

def r_marco(cx, cy, n, i, vacio=False):
    m = max(1, (n + 9)//10)
    cs = {1: 24, 2: 18, 3: 14, 4: 14}[m]
    w, h = 5*cs, 2*cs
    f = lambda k: 0 if vacio else min(10, max(0, n - 10*k))
    r = cs*0.33
    if m == 1:
        frame(cx - w/2, cy - h/2, cs, f(0), r)
    elif m == 2:
        gap = 9; top = cy + (2*h + gap)/2
        frame(cx - w/2, top - h, cs, f(0), r)
        frame(cx - w/2, top - 2*h - gap, cs, f(1), r)
    else:
        gap = 8; wt = 2*w + gap; top = cy + (2*h + gap)/2
        frame(cx - wt/2, top - h, cs, f(0), r)
        frame(cx - wt/2 + w + gap, top - h, cs, f(1), r)
        if m == 3:
            frame(cx - w/2, top - 2*h - gap, cs, f(2), r)
        else:
            frame(cx - wt/2, top - 2*h - gap, cs, f(2), r)
            frame(cx - wt/2 + w + gap, top - 2*h - gap, cs, f(3), r)

# ------------------------------------------------------------ PALOTES
def r_palotes(cx, cy, n, i):
    stroke(2.2)
    groups = [5]*(n//5) + ([n % 5] if n % 5 else [])
    if len(groups) <= 3:
        rows = [groups]; hh, sp, gap = 42, 10, 16
    else:
        rows = [groups[:3], groups[3:]]; hh, sp, gap = 28, 9, 14
    nr = len(rows)
    for ri, row in enumerate(rows):
        widths = [(min(g, 4) - 1)*sp for g in row]
        total = sum(widths) + gap*(len(row) - 1)
        x = cx - total/2
        yc = cy + (nr - 1)*(hh + 10)/2 - ri*(hh + 10)
        for g, wd in zip(row, widths):
            for j in range(min(g, 4)):
                c.line(x + j*sp, yc - hh/2, x + j*sp, yc + hh/2)
            if g == 5:
                c.line(x - 5, yc - hh/2 + 6, x + wd + 5, yc + hh/2 - 6)
            x += wd + gap

# ------------------------------------------------------------ OBJETOS
def star(x, y, r):
    pts = []
    for j in range(10):
        ang = math.pi/2 + j*math.pi/5
        rr = r if j % 2 == 0 else r*0.42
        pts.append((x + rr*math.cos(ang), y + rr*math.sin(ang)))
    p = c.beginPath(); p.moveTo(*pts[0])
    for q in pts[1:]: p.lineTo(*q)
    p.close(); c.drawPath(p, stroke=1, fill=0)

def tri(x, y, r):
    p = c.beginPath()
    p.moveTo(x, y + r*1.05); p.lineTo(x - r*1.05, y - r*0.8); p.lineTo(x + r*1.05, y - r*0.8)
    p.close(); c.drawPath(p, stroke=1, fill=0)

def shape(kind, x, y, r):
    if kind == 'c': c.circle(x, y, r, stroke=1, fill=0)
    elif kind == 's': star(x, y, r*1.2)
    elif kind == 'q': c.rect(x - r*0.9, y - r*0.9, r*1.8, r*1.8, stroke=1, fill=0)
    else: tri(x, y, r)

def r_objetos(cx, cy, n, i):
    kind = 'csqt'[i % 4]
    cols = 5 if n <= 10 else (6 if n <= 18 else 8)
    rows = math.ceil(n/cols)
    cols = math.ceil(n/rows)
    sp = min(28, 150/cols, 76/rows)
    r = sp*0.36
    stroke(1.5 if sp > 14 else 1.2)
    k = 0
    for ri in range(rows):
        cnt = min(cols, n - k)
        for j in range(cnt):
            shape(kind, cx + (j - (cnt - 1)/2)*sp, cy + ((rows - 1)/2 - ri)*sp, r)
        k += cnt

# ------------------------------------------------------------ REGLETAS
def r_regletas(cx, cy, n, i):
    stroke(1.8)
    bars = [n] if n <= 10 else [10]*(n//10) + ([n % 10] if n % 10 else [])
    u = 14 if n <= 10 else 13
    hh, gap = 16, 5
    tot = len(bars)*hh + (len(bars) - 1)*gap
    y = cy + tot/2
    for p in bars:
        x0 = cx - p*u/2 if n <= 10 else cx - 5*u
        c.setLineWidth(1.8)
        c.rect(x0, y - hh, p*u, hh, stroke=1, fill=0)
        c.setLineWidth(0.7)
        for j in range(1, p):
            c.line(x0 + j*u, y - hh, x0 + j*u, y)
        y -= hh + gap

# ------------------------------------------------------------ DESCOMPOSICIÓN
def descomp_txt(n, i):
    if n <= 10:
        a = (i*3 + n) % (n - 1) + 1
        return f"{a} + {n - a}"
    if n % 10 == 0:
        return "10 + 10" if n == 20 else f"{n - 10} + 10"
    return f"{(n//10)*10} + {n % 10}"

def r_descomp(cx, cy, n, i):
    c.setFillGray(INK)
    t = descomp_txt(n, i)
    fs = 40
    while pdfmetrics.stringWidth(t, "PB", fs) > 140: fs -= 1
    c.setFont("PB", fs)
    c.drawCentredString(cx, cy - fs*0.33, t)

def t_descomp(cx, cy, n, i):
    stroke(1.4)
    c.setFont("PB", 26)
    c.drawCentredString(cx, cy - 8, "+")
    c.line(cx - 66, cy - 12, cx - 22, cy - 12)
    c.line(cx + 22, cy - 12, cx + 66, cy - 12)

# ------------------------------------------------------------ LETRAS
_U = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez",
      "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho",
      "diecinueve", "veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro",
      "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve"]
_D = {3: "treinta", 4: "cuarenta", 5: "cincuenta", 6: "sesenta", 7: "setenta", 8: "ochenta", 9: "noventa"}

def nombre(n):
    if n < 30: return _U[n]
    if n == 100: return "cien"
    d, u = divmod(n, 10)
    return _D[d] + (" y " + _U[u] if u else "")

def r_letras(cx, cy, n, i):
    c.setFillGray(INK)
    t = nombre(n)
    lineas = [t]
    if len(t) > 11 and " y " in t:
        p = t.split(" y "); lineas = [p[0], "y " + p[1]]
    fs = 40
    while max(pdfmetrics.stringWidth(x, "PB", fs) for x in lineas) > 138: fs -= 1
    c.setFont("PB", fs)
    for k, x in enumerate(lineas):
        c.drawCentredString(cx, cy - fs*0.33 + (len(lineas) - 1)*fs*0.55 - k*fs*1.1, x)

def t_letras(cx, cy, n, i):
    stroke(1.4)
    c.line(cx - 66, cy - 8, cx + 66, cy - 8)

# ------------------------------------------------------------ RECTA
RANGO = 30

def r_recta(cx, cy, n, i, vacio=False):
    stroke(1.6)
    maxn = 100 if RANGO > 30 else 30
    w = 144
    step = w/maxn
    x0 = cx - w/2
    y = cy - 8
    c.line(x0 - 6, y, x0 + w + 6, y)
    for sgn, xe in ((-1, x0 - 6), (1, x0 + w + 6)):
        p = c.beginPath(); p.moveTo(xe + sgn*5, y); p.lineTo(xe, y + 3.5); p.lineTo(xe, y - 3.5); p.close()
        c.drawPath(p, stroke=0, fill=1)
    for k in range(maxn + 1):
        if maxn == 30:
            big = k % 5 == 0; draw = True; lab = big
        else:
            big = k % 10 == 0; draw = big; lab = k in (0, 50, 100)
        if draw:
            c.setLineWidth(1.3 if big else 0.9)
            c.line(x0 + k*step, y - (5.5 if big else 3), x0 + k*step, y + (5.5 if big else 3))
        if lab:
            c.setFont("PM", 8)
            c.drawCentredString(x0 + k*step, y - 18, str(k))
    if not vacio:
        mx = x0 + n*step
        c.setLineWidth(2)
        c.line(mx, y + 34, mx, y + 14)
        p = c.beginPath(); p.moveTo(mx, y + 8); p.lineTo(mx - 6, y + 18); p.lineTo(mx + 6, y + 18); p.close()
        c.drawPath(p, stroke=0, fill=1)

# ------------------------------------------------------------ BLOQUES BASE DIEZ
def _r_bloques(cx, cy, n, i):
    d, u = divmod(n, 10)
    stroke(1.6)
    bw, ub = 11, 6
    bh = 10*ub
    gap = 5; cubo = 10; cg = 3; ucols = 3
    uw = ucols*cubo + (ucols - 1)*cg if u else 0
    sep = 24 if (d and u) else 0
    total = (d*bw + (d - 1)*gap if d else 0) + sep + (min(u, ucols)*cubo + (min(u, ucols) - 1)*cg if u else 0)
    x = cx - total/2
    y0 = cy - bh/2
    for _ in range(d):
        c.setLineWidth(1.6)
        c.rect(x, y0, bw, bh, stroke=1, fill=0)
        c.setLineWidth(0.6)
        for j in range(1, 10):
            c.line(x, y0 + j*ub, x + bw, y0 + j*ub)
        x += bw + gap
    if d: x += sep - gap
    for k in range(u):
        r_, col = divmod(k, ucols)
        c.setLineWidth(1.6)
        c.rect(x + col*(cubo + cg), y0 + (cubo + cg)*r_, cubo, cubo, stroke=1, fill=0)

# ------------------------------------------------------------ CUADRÍCULA
def r_cuadricula(cx, cy, n, i, vacio=False):
    stroke(1.4)
    cs = 7.6
    w = 10*cs
    x0, y0 = cx - w/2, cy - w/2
    if not vacio:
        c.setFillGray(0.62)
        for k in range(n):
            row, col = divmod(k, 10)
            c.rect(x0 + col*cs, y0 + w - (row + 1)*cs, cs, cs, stroke=0, fill=1)
        c.setFillGray(INK)
    c.setLineWidth(0.5); c.setStrokeGray(0.45)
    for j in range(11):
        c.line(x0 + j*cs, y0, x0 + j*cs, y0 + w)
        c.line(x0, y0 + j*cs, x0 + w, y0 + j*cs)
    c.setStrokeGray(INK); c.setLineWidth(1.6)
    c.rect(x0, y0, w, w, stroke=1, fill=0)

# ------------------------------------------------------------ MONEDAS
def _r_monedas(cx, cy, n, i):
    d, u = divmod(n, 10)
    stroke(1.6)
    R, r, gt, cols, gap = 12, 7.8, 5, 3, 18
    wt = d*2*R + (d - 1)*gt if d else 0
    nuc = min(u, cols)
    wu = nuc*2*r + (nuc - 1)*4 if u else 0
    total = wt + (gap if (d and u) else 0) + wu
    x = cx - total/2
    for _ in range(d):
        c.circle(x + R, cy, R, stroke=1, fill=0)
        c.setFont("PB", 11)
        c.drawCentredString(x + R, cy - 4, "10")
        x += 2*R + gt
    if d: x += gap - gt
    rows = math.ceil(u/cols) if u else 0
    for k in range(u):
        rr, cc = divmod(k, cols)
        px = x + r + cc*(2*r + 4)
        py = cy + (rows - 1)*(r + 2) - rr*(2*r + 4)
        c.circle(px, py, r, stroke=1, fill=0)
        c.setFont("PB", 8.5)
        c.drawCentredString(px, py - 3, "1")

# ------------------------------------------------------------ ÁBACO
def abaco(cx, cy, d, u, beads=True):
    stroke(1.8)
    fw, fh = 116, 100
    x, y = cx - fw/2, cy - fh/2
    c.roundRect(x, y, fw, fh, 8, stroke=1, fill=0)
    c.setLineWidth(1.6)
    for xr, k, lab in ((cx - 28, d, "D"), (cx + 28, u, "U")):
        c.line(xr, y + 14, xr, y + fh - 5)
        c.setFillGray(INK)
        if beads:
            for j in range(k):
                c.circle(xr, y + 14 + 4.4 + j*8.8, 4.4, stroke=1, fill=1)
        c.setFont("PM", 8.5)
        c.drawCentredString(xr, y + 4, lab)

def r_abaco(cx, cy, n, i):
    d, u = divmod(n, 10)
    esc(lambda x, y: abaco(x, y, d, u), 0.7)(cx, cy)

def t_abaco(cx, cy, n, i):
    esc(lambda x, y: abaco(x, y, 0, 0, False), 0.7)(cx, cy)

# ------------------------------------------------------------ DECENAS Y UNIDADES
def r_du(cx, cy, n, i):
    d, u = divmod(n, 10)
    c.setFillGray(INK)
    for k, (num, txt) in enumerate([(d, "decenas" if d != 1 else "decena"), (u, "unidades" if u != 1 else "unidad")]):
        yy = cy + 14 - k*32
        c.setFont("PB", 28); wn = pdfmetrics.stringWidth(str(num), "PB", 28)
        c.setFont("PM", 18); wt = pdfmetrics.stringWidth(txt, "PM", 18)
        x = cx - (wn + 8 + wt)/2
        c.setFont("PB", 28); c.drawString(x, yy - 9, str(num))
        c.setFont("PM", 18); c.drawString(x + wn + 8, yy - 7, txt)

def t_du(cx, cy, n, i):
    c.setFillGray(INK); stroke(1.4)
    for k, txt in enumerate(["decenas", "unidades"]):
        yy = cy + 14 - k*32
        c.setFont("PM", 16)
        wt = pdfmetrics.stringWidth(txt, "PM", 16)
        lw = 34
        x = cx - (lw + 8 + wt)/2
        c.line(x, yy - 6, x + lw, yy - 6)
        c.drawString(x + lw + 8, yy - 6, txt)

# ------------------------------------------------------------ PALITOS Y ATADOS
def _r_atados(cx, cy, n, i):
    d, u = divmod(n, 10)
    stroke(1.0)
    sh, sp = 46, 2.7
    bw = 9*sp
    gap = 10; loose_sp = 6
    loose_w = (u - 1)*loose_sp if u else 0
    sep = 20 if (d and u) else 0
    total = (d*bw + (d - 1)*gap if d else 0) + sep + loose_w
    x = cx - total/2
    y0 = cy - sh/2
    for _ in range(d):
        c.setLineWidth(1.0)
        for j in range(10):
            c.line(x + j*sp, y0, x + j*sp, y0 + sh)
        c.setLineWidth(1.6); c.setFillGray(1)
        c.rect(x - 2, y0 + sh*0.4, bw + 4, 8, stroke=1, fill=1)
        c.setFillGray(INK)
        x += bw + gap
    if d: x += sep - gap
    c.setLineWidth(1.6)
    for k in range(u):
        c.line(x + k*loose_sp, y0, x + k*loose_sp, y0 + sh)

def r_bloques(cx, cy, n, i):
    d, u = divmod(n, 10)
    total = (d*11 + (d-1)*5 if d else 0) + (24 if (d and u) else 0) + (min(u,3)*10 + (min(u,3)-1)*3 if u else 0)
    k = min(1.3, 150/max(total, 1))
    c.saveState(); c.translate(cx, cy); c.scale(k, k)
    _r_bloques(0, 0, n, i)
    c.restoreState()

def r_monedas(cx, cy, n, i):
    d, u = divmod(n, 10)
    total = (d*24 + (d-1)*5 if d else 0) + (18 if (d and u) else 0) + (min(u,3)*15.6 + (min(u,3)-1)*4 if u else 0)
    k = min(1.3, 150/max(total, 1))
    c.saveState(); c.translate(cx, cy); c.scale(k, k)
    _r_monedas(0, 0, n, i)
    c.restoreState()

def r_atados(cx, cy, n, i):
    d, u = divmod(n, 10)
    total = (d*24.3 + (d-1)*10 if d else 0) + (20 if (d and u) else 0) + ((u-1)*6 if u else 0)
    k = min(1.3, 150/max(total, 1))
    c.saveState(); c.translate(cx, cy); c.scale(k, k)
    _r_atados(0, 0, n, i)
    c.restoreState()


# ============================================================ CATÁLOGO
# clave: (nº, TÍTULO, etiqueta, mín, máx, verbo, dibujo, plantilla_vacía)
V = lambda f: (lambda cx, cy, n, i: f(cx, cy, n, i, True))
CAT = {
 "dedos":      (1,  "LOS DEDOS",                "Dedos",               1, 10,  "DIBUJA",    r_dedos,      None),
 "dado":       (2,  "EL DADO",                  "Dado",                1, 12,  "DIBUJA",    r_dado,       V(r_dado)),
 "domino":     (3,  "EL DOMINÓ",                "Dominó",              1, 12,  "DIBUJA",    r_domino,     V(r_domino)),
 "marco":      (4,  "EL MARCO DE DIEZ",         "Marco de diez",       1, 40,  "DIBUJA",    r_marco,      V(r_marco)),
 "palotes":    (5,  "LOS PALOTES",              "Palotes",             1, 30,  "DIBUJA",    r_palotes,    None),
 "objetos":    (6,  "LOS OBJETOS",              "Objetos",             1, 30,  "DIBUJA",    r_objetos,    None),
 "regletas":   (7,  "LAS REGLETAS",             "Regletas",            1, 30,  "DIBUJA",    r_regletas,   None),
 "descomp":    (8,  "LA DESCOMPOSICIÓN",        "Descomposición",      2, 100, "DESCOMPÓN", r_descomp,    t_descomp),
 "letras":     (9,  "EL NÚMERO EN LETRAS",      "Número en letras",    1, 100, "ESCRIBE",   r_letras,     t_letras),
 "recta":      (10, "LA RECTA NUMÉRICA",        "Recta numérica",      1, 100, "MARCA",     r_recta,      V(r_recta)),
 "bloques":    (11, "LOS BLOQUES DE BASE DIEZ", "Bloques de base diez",1, 99,  "DIBUJA",    r_bloques,    None),
 "cuadricula": (12, "LA CUADRÍCULA DE 100",     "Cuadrícula de 100",   1, 100, "COLOREA",   r_cuadricula, V(r_cuadricula)),
 "monedas":    (13, "LAS MONEDAS",              "Monedas",             1, 69,  "DIBUJA",    r_monedas,    None),
 "abaco":      (14, "EL ÁBACO",                 "Ábaco",               1, 99,  "DIBUJA",    r_abaco,      t_abaco),
 "du":         (15, "LAS DECENAS Y UNIDADES",   "Decenas y unidades",  1, 99,  "COMPLETA",  r_du,         t_du),
 "atados":     (16, "LOS PALITOS Y ATADOS",     "Palitos y atados",    1, 69,  "DIBUJA",    r_atados,     None),
}
NOM, MIN, MAX, VERBO, READ, TPL, TIT = 2, 3, 4, 5, 6, 7, 1

COMB_30 = ["dedos", "marco", "descomp", "dado", "palotes", "recta", "regletas", "letras", "objetos", "marco", "domino", "domino"]
COMB_100 = ["bloques", "cuadricula", "monedas", "letras", "descomp", "recta", "palotes", "regletas", "abaco", "du", "cuadricula", "atados"]
SUMA_30 = (["marco", "palotes", "recta", "regletas", "objetos", "domino"],
           ["dedos", "dado", "marco", "objetos", "domino", "regletas", "palotes", "letras", "recta"])
SUMA_100 = (["abaco", "bloques", "cuadricula", "monedas", "du", "recta"],
            ["bloques", "monedas", "cuadricula", "letras", "recta", "atados", "regletas", "du", "abaco", "palotes"])

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "salida") + "/"
os.makedirs(OUT, exist_ok=True)
M = 28

def tercios(lo, hi):
    span = list(range(lo, hi + 1)); k = len(span)
    return [span[:k//3], span[k//3:2*k//3], span[2*k//3:]]

def pick(lo, hi, seed, nread=9, ndraw=3):
    rnd = random.Random(seed)
    th = tercios(lo, hi)
    per = nread//3
    read = []
    for t in th: read += rnd.sample(t, min(per, len(t)))
    while len(read) < nread: read.append(rnd.randint(lo, hi))
    rnd.shuffle(read)
    draw = []
    for t in th[:ndraw] if ndraw <= 3 else th:
        cand = [x for x in t if x not in read]
        draw.append(rnd.choice(cand) if cand else rnd.choice(t))
    rnd.shuffle(draw)
    return read, draw

# ------------------------------------------------------------ MARCO DE PÁGINA (estilo ficha de muestra)
PALETA = {"amarillo": ((1, .969, .902), (.969, .906, .769)), "rosa": ((.984, .937, .953), (.949, .839, .875)),
          "azul": ((.933, .961, .988), (.82, .886, .953)), "verde": ((.929, .969, .933), (.78, .878, .8))}
AZUL = (31/255, 78/255, 121/255)
COLOR = None
FAMILIA = {"conteo": "amarillo", "orden": "verde", "valor": "rosa", "sumar": "azul", "restar": "verde", "juegos": "amarillo", "geometria": "rosa", "medida": "azul", "estadistica": "verde", "suma_y_dibuja": "rosa", "que_numero_es": "verde"}

def _titulo(t):
    s_ = t.lower().replace(" d y u", " D y U")
    for k, ch in enumerate(s_):
        if ch.isalpha(): return s_[:k] + ch.upper() + s_[k + 1:]
    return s_

def _tarjetas(cv):
    orig = cv.roundRect
    def f(x, y, w, h, r, stroke=1, fill=0):
        if r == 10 and fill == 0 and stroke == 1:
            cv.saveState(); cv.setFillGray(1)
            if cv._lineWidth < 1.7: cv.setStrokeGray(0.8); cv.setLineWidth(0.8)
            orig(x, y, w, h, 9, stroke=1, fill=1); cv.restoreState()
        else: orig(x, y, w, h, r, stroke=stroke, fill=fill)
    cv.roundRect = f

_ACT = None      # modo actividad: {"rect": (x, y, w, h), "num": n, "color": c} (ver actividad())
_NOMBRE = ""     # nombre del archivo de la ficha: da el color por familia

def _lienzo(ruta):
    """Canvas de la ficha: uno nuevo (línea de órdenes) o el de la actividad en curso."""
    global _NOMBRE
    _NOMBRE = os.path.basename(ruta)
    return _ACT["cv"] if _ACT else canvas.Canvas(ruta, pagesize=A4)

def _fin(*partes):
    """Cierra la ficha y devuelve la clave de respuestas (en la línea de órdenes, además, la imprime)."""
    txt = " ".join(str(p) for p in partes)
    if not _ACT:
        c.showPage(); c.save(); print(txt)
    return txt

def color_familia(nombre=None):
    nom = _NOMBRE if nombre is None else nombre
    return COLOR or next((v for p, v in FAMILIA.items() if nom.startswith(p)), "azul")

def encabezado(titulo, nombre=""):
    """Nombre (impreso o línea en blanco), Fecha y título centrado. Igual que la ficha de muestra."""
    if not getattr(c, "_charta_tarjetas", False): _tarjetas(c); c._charta_tarjetas = True
    c.setFillGray(INK); c.setFont("PR", 10.5)
    c.drawString(34, H - 46, "Nombre:"); c.drawString(360, H - 46, "Fecha:")
    c.setLineWidth(0.8); c.setStrokeGray(0)
    x0 = 34 + pdfmetrics.stringWidth("Nombre: ", "PR", 10.5)
    c.line(x0, H - 48, 332, H - 48)
    c.line(360 + pdfmetrics.stringWidth("Fecha: ", "PR", 10.5), H - 48, 533, H - 48)
    if nombre:
        fs = 12
        while pdfmetrics.stringWidth(nombre, "PM", fs) > 332 - x0 - 8 and fs > 7: fs -= .5
        c.setFillGray(INK); c.setFont("PM", fs); c.drawString(x0 + 4, H - 45, nombre)
    tt = _titulo(titulo); fs = 16
    while pdfmetrics.stringWidth(tt, "PB", fs) > W - 80 and fs > 10: fs -= .5
    c.setFillColorRGB(*AZUL); c.setFont("PB", fs); c.drawCentredString(W/2, H - 86, tt)

def panel(rect, num, lineas, color):
    """Panel pastel con su número y enunciado; después escala el área de página completa
    (M..W-M, M..H-M-76) para que quepa dentro. Quien llama deshace la escala si hace falta."""
    x, yB, w, h = rect; yT = yB + h
    fill, borde = PALETA[color]; extra = 16*(len(lineas) - 1)
    c.setFillColorRGB(*fill); c.setStrokeColorRGB(*borde); c.setLineWidth(1)
    c.roundRect(x, yB, w, h, 14, stroke=1, fill=1)
    c.setFillColorRGB(*AZUL); c.circle(x + 24, yT - 22, 11, stroke=0, fill=1)
    c.setFillGray(1); c.setFont("PB", 11); c.drawCentredString(x + 24, yT - 26, str(num))
    c.setFillGray(INK); fs = 11.5
    while any(pdfmetrics.stringWidth(t, "PR", fs) > w - 59 for t in lineas) and fs > 8: fs -= .5
    c.setFont("PR", fs)
    for j, t in enumerate(lineas): c.drawString(x + 45, yT - 26 - j*16, t)
    hi = (yT - 43 - extra) - (yB + 14)
    alto = (H - 2*M - 76)*PARTE; base = H - M - 76 - alto      # zona de página que se encaja
    sc = min((w - 31)/(W - 2*M), hi/alto)
    c.transform(sc, 0, 0, sc, x + w/2 - (W - 2*M)*sc/2 - sc*M, (yB + 14) + ((hi - alto*sc) if PARTE < 1 else 0) - sc*base)
    c.setFillGray(INK); c.setStrokeGray(INK); c.setLineWidth(1.5)

PANEL_COMPLETO = (34, 26, W - 68, H - 108 - 26)
PARTE = 1.0      # fracción de la altura del contenido que se dibuja: 1 (completa) o 0.5 (media)

def _n(filas):
    """Filas que se dibujan: todas, o la mitad (hacia abajo) en media página, con el mismo alto."""
    return filas if PARTE >= 1 else max(1, int(filas*PARTE))

def cabecera(titulo, lineas):
    if _ACT:   # modo actividad: solo el panel, dentro del rectángulo pedido
        if not getattr(c, "_charta_tarjetas", False): _tarjetas(c); c._charta_tarjetas = True
        c.saveState()
        x, y, w, h = _ACT["rect"]; pth = c.beginPath(); pth.roundRect(x, y, w, h, 14); c.clipPath(pth, stroke=0, fill=0)
        panel(_ACT["rect"], _ACT["num"], lineas, _ACT["color"] or color_familia())
        return
    encabezado(titulo)
    panel(PANEL_COMPLETO, 1, lineas, color_familia())

def cuadrito(x, y, cw, ch, q=30):
    stroke(1.5); c.setFillGray(0.9)
    c.roundRect(x + cw - 9 - q, y + ch - 9 - q, q, q, 7, stroke=1, fill=1)
    c.setFillGray(INK)

# ------------------------------------------------------------ 1) UNA REPRESENTACIÓN
def ficha_rep(key, R, seed=1, lectura=False, outdir=OUT):
    global c, RANGO
    RANGO = R
    d = CAT[key]
    hi = min(R, d[MAX])
    nread, ndraw = ((12, 0) if lectura else (9, 3)) if PARTE >= 1 else ((6, 0) if lectura else (3, 3))
    read, draw = pick(d[MIN], hi, seed, nread, 3)
    if lectura: draw = []
    c = _lienzo(f"{outdir}{d[0]:02d}_{key}_hasta_{R}.pdf")
    c.setTitle(d[TIT].title())
    lin = ["Escribe en el cuadrito el número que representa cada casilla."]
    if not lectura: lin.append("En la última fila te toca a ti: haz lo que dice cada casilla.")
    cabecera(d[TIT], lin)
    top = H - M - 90
    GX, GY = 10, 10
    cw = (W - 2*M - 2*GX)/3
    ch = (top - M - 3*GY)/4
    cells = [("r", n) for n in read] + [("d", n) for n in draw]
    for idx, (kind, n) in enumerate(cells):
        r_, k = divmod(idx, 3)
        x = M + k*(cw + GX); y = top - (r_ + 1)*ch - r_*GY
        stroke(1.5); c.roundRect(x, y, cw, ch, 10, stroke=1, fill=0)
        gx, gy = x + cw/2, y + ch*0.40
        if kind == "r":
            c.setFillGray(0.3); c.setFont("PB", 11); c.drawString(x + 14, y + ch - 22, str(idx + 1))
            cuadrito(x, y, cw, ch)
            d[READ](gx, gy, n, idx)
        else:
            c.setFillGray(0.3); c.setFont("PM", 8.5); c.drawString(x + 14, y + ch - 20, d[VERBO])
            c.setFillGray(INK); c.setFont("PB", 28); c.drawRightString(x + cw - 16, y + ch - 36, str(n))
            if d[TPL]: d[TPL](gx, gy, n, idx)
    return _fin(f"{key} 1-{R}: lectura {read} dibujar {draw}")

# ------------------------------------------------------------ 2) ¿QUÉ NÚMERO ES?
def nums_combinada(keys, R, seed):
    rnd = random.Random(seed)
    th = tercios(1, R)
    best = None
    for _ in range(20000):
        pool = []
        for t in th: pool += rnd.sample(t, min(3, len(t)))
        nums, ok = [], True
        for k in keys:
            cand = [p for p in pool if CAT[k][MIN] <= p <= min(CAT[k][MAX], R)]
            if not cand: ok = False; break
            nums.append(rnd.choice(cand))
        if not ok: continue
        bad = any(abs(a//3 - b//3) <= 1 and abs(a % 3 - b % 3) <= 1 and nums[a] == nums[b]
                  for a in range(12) for b in range(a + 1, 12))
        if bad: continue
        best = nums
        cnt = {v: nums.count(v) for v in set(nums)}
        if sum(1 for v in cnt.values() if v >= 2) >= 3 and len(cnt) >= 7: return nums
    return best

def ficha_combinada(R, seed=1, outdir=OUT):
    global c, RANGO
    RANGO = R
    keys = COMB_30 if R <= 30 else COMB_100
    nums = nums_combinada(keys, R, seed)
    if PARTE < 1: keys, nums = keys[:6], nums[:6]     # media página: 2 filas y sin reto
    c = _lienzo(f"{outdir}que_numero_es_hasta_{R}.pdf")
    c.setTitle("¿Qué número es?")
    cabecera("¿QUÉ NÚMERO ES?", ["Observa cada casilla y escribe en el cuadrito el número que representa."])
    RETO_H = 74
    top = H - M - 70; bottom = M + RETO_H + 14
    GX, GY = 10, 9
    cw = (W - 2*M - 2*GX)/3; ch = (top - bottom - 3*GY)/4
    for idx, (k, n) in enumerate(zip(keys, nums)):
        r_, col = divmod(idx, 3)
        x = M + col*(cw + GX); y = top - (r_ + 1)*ch - r_*GY
        stroke(1.5); c.roundRect(x, y, cw, ch, 10, stroke=1, fill=0)
        c.setFillGray(0.3); c.setFont("PM", 8.5); c.drawString(x + 12, y + ch - 17, CAT[k][NOM].upper())
        cuadrito(x, y, cw, ch)
        CAT[k][READ](x + cw/2, y + ch*0.40, n, idx)
    if PARTE < 1: return _fin("combinada 1-%d:" % R, [f"{CAT[k][NOM]}={n}" for k, n in zip(keys, nums)])
    stroke(1.5)
    c.roundRect(M, M, W - 2*M, RETO_H, 10, stroke=1, fill=0)
    c.setFillGray(INK); c.setFont("PB", 10.5); c.drawString(M + 16, M + RETO_H - 22, "RETO:")
    wl = pdfmetrics.stringWidth("RETO: ", "PB", 10.5)
    c.setFont("PM", 10.5); c.drawString(M + 16 + wl, M + RETO_H - 22, "Elige una casilla y explica cómo has sabido qué número era.")
    stroke(1.0)
    c.line(M + 16, M + 26, W - M - 16, M + 26); c.line(M + 16, M + 40, W - M - 16, M + 40)
    return _fin("combinada 1-%d:" % R, [f"{CAT[k][NOM]}={n}" for k, n in zip(keys, nums)])

# ------------------------------------------------------------ 3) SUMA Y DIBUJA
def filas_suma(R, seed):
    rnd = random.Random(seed)
    res, pool = SUMA_30 if R <= 30 else SUMA_100
    res = res[:]; rnd.shuffle(res)
    usadas, filas = set(), []
    for rk in res:
        S = min(R, CAT[rk][MAX])
        for _ in range(5000):
            ak, bk = rnd.sample([p for p in pool if p != rk], 2)
            T = rnd.randint(max(4, S//3), S)
            lo = max(CAT[ak][MIN], T - CAT[bk][MAX]); hi = min(CAT[ak][MAX], T - CAT[bk][MIN])
            if lo > hi or T in usadas: continue
            a = rnd.randint(lo, hi)
            usadas.add(T); filas.append((ak, a, bk, T - a, rk, T)); break
    return filas

def ficha_suma(R, seed=1, outdir=OUT):
    global c, RANGO
    RANGO = R
    filas = filas_suma(R, seed)
    c = _lienzo(f"{outdir}suma_y_dibuja_hasta_{R}.pdf")
    c.setTitle("Suma y dibuja")
    cabecera("SUMA Y DIBUJA", ["Suma las dos cantidades, escribe el resultado y dibújalo como se indica."])
    top = H - M - 72; n = len(filas); GY = 10; SYM = 28
    bw = (W - 2*M - 2*SYM)/3; bh = (top - M - (n - 1)*GY)/n; filas = filas[:_n(n)]

    def esc_draw(fn, cx, cy, nn, ii, k):
        c.saveState(); c.translate(cx, cy); c.scale(k, k); fn(0, 0, nn, ii); c.restoreState()

    for r_, (ak, a, bk, b, rk, T) in enumerate(filas):
        y = top - (r_ + 1)*bh - r_*GY
        xs = [M, M + bw + SYM, M + 2*(bw + SYM)]
        for j, (kk, nn) in enumerate([(ak, a), (bk, b)]):
            x = xs[j]
            stroke(1.5); c.roundRect(x, y, bw, bh, 10, stroke=1, fill=0)
            c.setFillGray(0.3); c.setFont("PM", 8.5); c.drawString(x + 12, y + bh - 17, CAT[kk][NOM].upper())
            cuadrito(x, y, bw, bh, 28)
            esc_draw(CAT[kk][READ], x + bw/2, y + 8 + (bh - 8 - 36)/2, nn, r_*2 + j, 0.82)
        x = xs[2]
        stroke(1.9); c.roundRect(x, y, bw, bh, 10, stroke=1, fill=0)
        t = "DIBUJA CON: " + CAT[rk][NOM].upper(); fs_ = 8.5
        while pdfmetrics.stringWidth(t, "PM", fs_) > bw - 24: fs_ -= 0.1
        c.setFillGray(0.3); c.setFont("PM", fs_); c.drawCentredString(x + bw/2, y + bh - 17, t)
        if CAT[rk][TPL]: esc_draw(CAT[rk][TPL], x + bw/2, y + 28 + (bh - 52)/2, T, r_, 0.8)
        c.setFillGray(INK); c.setFont("PM", 9.5); c.drawString(x + 14, y + 11, "Resultado:")
        tw = pdfmetrics.stringWidth("Resultado:", "PM", 9.5)
        stroke(1.2); c.line(x + 14 + tw + 8, y + 11, x + bw - 14, y + 11)
        c.setFillGray(INK); c.setFont("PB", 26)
        c.drawCentredString(xs[0] + bw + SYM/2, y + bh/2 - 9, "+")
        c.drawCentredString(xs[1] + bw + SYM/2, y + bh/2 - 9, "=")
    return _fin("suma 1-%d:" % R, [f"{CAT[ak][NOM]} {a} + {CAT[bk][NOM]} {b} = {T} ({CAT[rk][NOM]})" for ak, a, bk, b, rk, T in filas])

# ------------------------------------------------------------ 4) CONTEO Y SERIES (bloque 2)
def caja(x, y, w, h, val=None, fs=22):
    stroke(1.5)
    if val is None:
        c.setFillGray(0.9); c.roundRect(x, y, w, h, 7, stroke=1, fill=1)
    else:
        c.setFillGray(1); c.roundRect(x, y, w, h, 7, stroke=1, fill=1)
        c.setFillGray(INK); c.setFont("PB", fs)
        c.drawCentredString(x + w/2, y + h/2 - fs*0.35, str(val))
    c.setFillGray(INK)

def _uniq(lo, hi, k, rnd):
    span = list(range(lo, hi + 1)); rnd.shuffle(span)
    out = span[:k]
    while len(out) < k: out.append(rnd.randint(lo, hi))
    return out

def _huecos(n, h, rnd):
    return set(rnd.sample(range(n), max(0, min(h, n - 2))))

def flecha(x1, y1, x2, y2, hd=4.5):
    c.line(x1, y1, x2, y2)
    dx, dy = x2 - x1, y2 - y1; d = math.hypot(dx, dy); ux, uy = dx/d, dy/d
    p = c.beginPath(); p.moveTo(x2, y2)
    p.lineTo(x2 - ux*hd*1.6 - uy*hd, y2 - uy*hd*1.6 + ux*hd)
    p.lineTo(x2 - ux*hd*1.6 + uy*hd, y2 - uy*hd*1.6 - ux*hd)
    p.close(); c.drawPath(p, stroke=0, fill=1)

def _c_cuenta(top, R, rnd, huecos, modo):
    nums, _ = pick(1, min(R, 30), rnd.randint(0, 10**6), 12, 0); nums = nums[:_n(4)*3]
    GX, GY = 10, 10
    cw = (W - 2*M - 2*GX)/3; ch = (top - M - 3*GY)/4
    for idx, n in enumerate(nums):
        r_, k = divmod(idx, 3)
        x = M + k*(cw + GX); y = top - (r_ + 1)*ch - r_*GY
        stroke(1.5); c.roundRect(x, y, cw, ch, 10, stroke=1, fill=0)
        cuadrito(x, y, cw, ch)
        c.setFillGray(0.3); c.setFont("PB", 11); c.drawString(x + 14, y + ch - 22, str(idx + 1))
        ax, ay, aw, ah = x + 14, y + 14, cw - 28, ch - 60
        cols = max(1, math.ceil(math.sqrt(n*aw/ah))); rows = math.ceil(n/cols)
        sp = min(aw/cols, ah/rows); r = min(11, sp*0.3); jit = sp*0.1
        slots = [(i_//cols, i_ % cols) for i_ in range(cols*rows)]
        rnd.shuffle(slots)
        stroke(1.5)
        for ri, ci in slots[:n]:
            shape('csqt'[idx % 4], ax + aw/2 + (ci - (cols - 1)/2)*sp + rnd.uniform(-jit, jit),
                  ay + ah/2 + ((rows - 1)/2 - ri)*sp + rnd.uniform(-jit, jit), r)
    return nums

def _c_anterior(top, R, rnd, huecos, modo):
    modo = modo or "ambos"
    lo, hi = {"ambos": (1, R - 1), "anterior": (1, R), "posterior": (0, R - 1)}[modo]
    nums = _uniq(lo, hi, 15, rnd)
    patron = {"ambos": "hnh", "anterior": "hn", "posterior": "nh"}[modo]
    GX, GY, rows = 10, 10, 5; nums = nums[:_n(rows)*3]
    cw = (W - 2*M - 2*GX)/3; ch = (top - M - (rows - 1)*GY)/rows
    bw, bh, g = 40, 46, 7
    for idx, n in enumerate(nums):
        r_, k = divmod(idx, 3)
        x = M + k*(cw + GX); y = top - (r_ + 1)*ch - r_*GY
        stroke(1.5); c.roundRect(x, y, cw, ch, 10, stroke=1, fill=0)
        c.setFillGray(0.3); c.setFont("PB", 11); c.drawString(x + 14, y + ch - 22, str(idx + 1))
        bx = x + (cw - (len(patron)*bw + (len(patron) - 1)*g))/2
        for j, t in enumerate(patron):
            caja(bx + j*(bw + g), y + (ch - 14 - bh)/2, bw, bh, n if t == "n" else None)
    return nums

def _c_falta(top, R, rnd, huecos, modo):
    L, n, cols = 5, 16, 2
    h = max(1, min(3, 1 if huecos is None else huecos))
    GX, GY = 10, 8
    rows = n//cols
    cw = (W - 2*M - GX)/cols; ch = (top - M - (rows - 1)*GY)/rows
    bw, bh, g = 40, 44, 7
    res = []
    for idx, a in enumerate(_uniq(1, max(1, R - L + 1), n, rnd)[:_n(rows)*cols]):
        r_, k = divmod(idx, cols)
        x = M + k*(cw + GX); y = top - (r_ + 1)*ch - r_*GY
        stroke(1.5); c.roundRect(x, y, cw, ch, 10, stroke=1, fill=0)
        vac = _huecos(L, h, rnd)
        bx = x + (cw - (L*bw + (L - 1)*g))/2
        for j in range(L):
            caja(bx + j*(bw + g), y + (ch - bh)/2, bw, bh, None if j in vac else a + j)
        res.append(" ".join("_" if j in vac else str(a + j) for j in range(L)) + f"  -> {[a + j for j in sorted(vac)]}")
    return res

def _c_series(top, R, rnd, huecos, pasos):
    nrows = 8
    h = 3 if huecos is None else huecos
    GY = 8
    rh = (top - M - (nrows - 1)*GY)/nrows
    bw, bh, g, lw = 52, 46, 8, 124
    usadas, res = set(), []
    for i in range(_n(nrows)):
        s = rnd.choice(pasos) if len(pasos) > 1 else pasos[0]
        L = min(6, R//s + 1)
        if L < 3: raise ValueError(f"Esta serie necesita un rango máximo mayor (paso {s}, máx. {R}).")
        lo = 1 if s == 1 else 0
        cand = [a for a in range(lo, R - (L - 1)*s + 1)
                if (s == 1) or (s == 2 and a % 2 == (i//2) % 2) or (s in (5, 10) and a % s == 0)]
        if not cand: cand = [a for a in range(lo, R - (L - 1)*s + 1) if s in (1, 2) or a % s == 0]
        cand = [a for a in cand if (a, s) not in usadas] or cand
        a = rnd.choice(cand); usadas.add((a, s))
        vals = [a + j*s for j in range(L)]
        asc = i % 2 == 0
        if not asc: vals.reverse()
        vac = _huecos(L, min(h, L - 2), rnd)
        y = top - (i + 1)*rh - i*GY
        stroke(1.5); c.roundRect(M, y, W - 2*M, rh, 10, stroke=1, fill=0)
        c.setFillGray(INK); c.setFont("PB", 12.5); c.drawString(M + 16, y + rh/2 + 2, f"de {s} en {s}")
        c.setFont("PM", 9.5); c.setFillGray(0.3); c.drawString(M + 34, y + rh/2 - 14, "sube" if asc else "baja")
        c.setFillGray(INK)
        ty = y + rh/2 - 10.5
        p = c.beginPath()
        if asc: p.moveTo(M + 16, ty - 4); p.lineTo(M + 28, ty - 4); p.lineTo(M + 22, ty + 4)
        else: p.moveTo(M + 16, ty + 4); p.lineTo(M + 28, ty + 4); p.lineTo(M + 22, ty - 4)
        p.close(); c.drawPath(p, stroke=0, fill=1)
        bx = M + lw + (W - 2*M - lw - (L*bw + (L - 1)*g))/2
        for j, v in enumerate(vals):
            caja(bx + j*(bw + g), y + (rh - bh)/2, bw, bh, None if j in vac else v)
        res.append(" ".join("_" if j in vac else str(v) for j, v in enumerate(vals)) + f"  -> {[vals[j] for j in sorted(vac)]}")
    return res

def _c_tabla(top, R, rnd, huecos, modo):
    R = min(R, 100)
    rows = math.ceil(R/10)
    h = min(30, max(3, R//5) if huecos is None else huecos)
    cw = (W - 2*M)/10; chh = min(62, (top - M)/rows)
    vac = set(rnd.sample(range(1, R + 1), min(h, R - 1)))
    for n in range(1, R + 1):
        r_, k = divmod(n - 1, 10)
        caja(M + k*cw + 2, top - (r_ + 1)*chh + 2, cw - 4, chh - 4, None if n in vac else n, 17)
    return sorted(vac)

def _c_camino(top, R, rnd, huecos, modo):
    cols = 6; L = min(36, R); s = rnd.randint(1, R - L + 1)
    rows = math.ceil(L/cols)
    h = min(L - 2, max(3, L//3) if huecos is None else huecos)
    vac = set(rnd.sample(range(1, L), h))
    cw_, ch_ = 58, 52
    px = (W - 2*M - cw_)/(cols - 1)
    py = min(118, (top - M - ch_ - 40)/(rows - 1)) if rows > 1 else 0
    def pos(k):
        r_, c_ = divmod(k, cols)
        if r_ % 2: c_ = cols - 1 - c_
        return M + c_*px, top - 26 - r_*py - ch_
    stroke(1.5)
    for k in range(L - 1):
        (x1, y1), (x2, y2) = pos(k), pos(k + 1)
        if y1 == y2:
            d = 1 if x2 > x1 else -1
            a = x1 + (cw_ + 3 if d > 0 else -3); b = x2 + (-3 if d > 0 else cw_ + 3)
            flecha(a, y1 + ch_/2, b, y2 + ch_/2)
        else:
            flecha(x1 + cw_/2, y1 - 3, x2 + cw_/2, y2 + ch_ + 3)
    for k in range(L):
        x, y = pos(k)
        caja(x, y, cw_, ch_, None if k in vac else s + k, 20)
    c.setFillGray(0.3); c.setFont("PM", 8.5)
    x, y = pos(0); c.drawCentredString(x + cw_/2, y + ch_ + 6, "SALIDA")
    x, y = pos(L - 1); c.drawCentredString(x + cw_/2, y - 12, "META")
    c.setFillGray(INK)
    return [s + k for k in sorted(vac)]

CONTEO = {
 "cuenta":   ("CUENTA Y ESCRIBE", "Cuenta los dibujos de cada casilla y escribe el número en el cuadrito.", _c_cuenta),
 "anterior": ("ANTERIOR Y POSTERIOR", "", _c_anterior),
 "falta":    ("EL NÚMERO QUE FALTA", "Escribe en cada cuadro gris el número que falta.", _c_falta),
 "serie1":   ("SERIES DE 1 EN 1", "Completa cada serie escribiendo los números que faltan en los cuadros grises.", lambda t, R, r, h, m: _c_series(t, R, r, h, [1])),
 "serie2":   ("SERIES DE 2 EN 2", "Completa cada serie escribiendo los números que faltan en los cuadros grises.", lambda t, R, r, h, m: _c_series(t, R, r, h, [2])),
 "serie5":   ("SERIES DE 5 EN 5", "Completa cada serie escribiendo los números que faltan en los cuadros grises.", lambda t, R, r, h, m: _c_series(t, R, r, h, [5])),
 "serie10":  ("SERIES DE 10 EN 10", "Completa cada serie escribiendo los números que faltan en los cuadros grises.", lambda t, R, r, h, m: _c_series(t, R, r, h, [10])),
 "series":   ("SERIES MIXTAS", "Fíjate en el salto de cada serie y escribe los números que faltan.", lambda t, R, r, h, m: _c_series(t, R, r, h, [1, 2, 5, 10] if R >= 20 else [1, 2, 5])),
 "tabla":    ("LA TABLA DE NÚMEROS", "Completa la tabla escribiendo los números que faltan.", _c_tabla),
 "camino":   ("EL CAMINO DE NÚMEROS", "Sigue las flechas y escribe los números que faltan.", _c_camino),
}
ANT_TXT = {"ambos": "Escribe el número anterior y el posterior de cada número.",
           "anterior": "Escribe el número anterior de cada número.",
           "posterior": "Escribe el número posterior de cada número."}

def ficha_conteo(key, R, seed=1, huecos=None, modo=None, outdir=OUT):
    global c, RANGO
    RANGO = R
    tit, ins, fn = CONTEO[key]
    if key == "anterior": ins = ANT_TXT[modo or "ambos"]
    rnd = random.Random(seed)
    c = _lienzo(f"{outdir}conteo_{key}_hasta_{R}.pdf")
    c.setTitle(tit.title())
    cabecera(tit, [ins])
    res = fn(H - M - 76, R, rnd, huecos, modo)
    return _fin(f"{key} 1-{R}: {res}")

# ------------------------------------------------------------ 5) ORDEN Y COMPARACIÓN (bloque 3)
def _grupo(k, R, rnd, cerca=False):
    lo, hi = 1, R
    if cerca and R >= 20:
        ds = [d for d in range(R//10 + 1) if min(R, d*10 + 9) - max(1, d*10) + 1 >= k]
        d = rnd.choice(ds); lo, hi = max(1, d*10), min(R, d*10 + 9)
    return rnd.sample(range(lo, hi + 1), k)

def _pares(cnt, R, rnd, cerca, iguales=0):
    eq = set(rnd.sample(range(cnt), iguales)) if iguales else set()
    out, vistos = [], set()
    for i in range(cnt):
        for _ in range(300):
            if i in eq: a = rnd.randint(1, R); p = (a, a)
            else: p = tuple(_grupo(2, R, rnd, cerca))
            if p not in vistos: break
        vistos.add(p); out.append(p)
    return out

def _celdas(top, cols, rows, GX=10, GY=10):
    cw = (W - 2*M - (cols - 1)*GX)/cols; ch = (top - M - (rows - 1)*GY)/rows
    return [(M + k*(cw + GX), top - (r + 1)*ch - r*GY) for r in range(_n(rows)) for k in range(cols)], cw, ch

def _marco(x, y, w, h, idx=None, lab=""):
    stroke(1.5); c.roundRect(x, y, w, h, 10, stroke=1, fill=0)
    c.setFillGray(0.3)
    if idx is not None: c.setFont("PB", 11); c.drawString(x + 14, y + h - 22, str(idx + 1))
    if lab: c.setFont("PM", 8.5); c.drawString(x + (34 if idx is not None else 14), y + h - 21, lab)
    c.setFillGray(INK)

def _o_mayor(top, R, rnd, n, modo, cerca):
    modo = modo or "mezcla"
    pares = _pares(15, R, rnd, cerca)
    t = {"mayor": ["mayor"]*15, "menor": ["menor"]*15}.get(modo) or (["mayor"]*8 + ["menor"]*7)
    if modo == "mezcla": rnd.shuffle(t)
    cel, cw, ch = _celdas(top, 3, 5)
    bw, bh, g = 60, 54, 16
    res = []
    for i, ((x, y), (a, b)) in enumerate(zip(cel, pares)):
        _marco(x, y, cw, ch, i, "RODEA EL " + t[i].upper())
        bx = x + (cw - 2*bw - g)/2
        for j, v in enumerate((a, b)):
            caja(bx + j*(bw + g), y + (ch - 26 - bh)/2, bw, bh, v, 26)
        res.append(f"{a}-{b}: {max(a, b) if t[i] == 'mayor' else min(a, b)}")
    return res

def _o_signos(top, R, rnd, n, modo, cerca):
    pares = _pares(15, R, rnd, cerca, 0 if modo == "sin" else 3)
    cel, cw, ch = _celdas(top, 3, 5)
    res = []
    for i, ((x, y), (a, b)) in enumerate(zip(cel, pares)):
        _marco(x, y, cw, ch, i)
        ws = (46, 40, 46); g = 8; bx = x + (cw - sum(ws) - 2*g)/2; by = y + (ch - 46 - 10)/2
        caja(bx, by, 46, 46, a, 22); caja(bx + 46 + g, by, 40, 46, None); caja(bx + 86 + 2*g, by, 46, 46, b, 22)
        res.append(f"{a} {'<' if a < b else '>' if a > b else '='} {b}")
    return res

def _o_grupo(top, R, rnd, n, modo, cerca):
    n = max(3, min(5, n or 4))
    cel, cw, ch = _celdas(top, 2, 5)
    bw, bh, g = 40, 38, 6
    res = []
    for i, (x, y) in enumerate(cel):
        gr = _grupo(n, R, rnd, cerca); _marco(x, y, cw, ch, i)
        bx = x + (cw - (n*bw + (n - 1)*g))/2
        for j, v in enumerate(gr): caja(bx + j*(bw + g), y + ch - 30 - bh, bw, bh, v, 18)
        x0 = x + (cw - 212)/2
        c.setFillGray(INK); c.setFont("PM", 10.5)
        for j, lab in enumerate(("Mayor", "Menor")):
            c.drawString(x0 + j*120, y + 26, lab); caja(x0 + j*120 + 50, y + 14, 42, 34, None)
        res.append(f"{gr}: mayor {max(gr)}, menor {min(gr)}")
    return res

def _o_ordena(top, R, rnd, n, modo, cerca, desc=False):
    n = max(3, min(5, n or 4)); rows = 6; GY = 10
    rh = (top - M - (rows - 1)*GY)/rows
    bw, bh, g, lw = 44, 36, 16, 132
    res = []
    for i in range(_n(rows)):
        gr = _grupo(n, R, rnd, cerca)
        meta = sorted(gr, reverse=desc)
        while gr == meta: rnd.shuffle(gr)
        y = top - (i + 1)*rh - i*GY
        _marco(M, y, W - 2*M, rh)
        bx = M + 16 + lw + (W - 2*M - 32 - lw - (n*bw + (n - 1)*g))/2
        c.setFillGray(0.3); c.setFont("PM", 10)
        c.drawString(M + 16, y + rh - 14 - bh/2 - 3, "Números")
        c.drawString(M + 16, y + 14 + bh/2 - 3, "De mayor a menor" if desc else "De menor a mayor")
        c.setFillGray(INK)
        for j in range(n):
            caja(bx + j*(bw + g), y + rh - 14 - bh, bw, bh, gr[j], 18)
            caja(bx + j*(bw + g), y + 14, bw, bh, None)
            if j < n - 1:
                c.setFont("PB", 17); c.drawCentredString(bx + j*(bw + g) + bw + g/2, y + 14 + bh/2 - 6, ">" if desc else "<")
        res.append(f"{gr} -> {meta}")
    return res

def _o_ordena2(top, R, rnd, n, modo, cerca): return _o_ordena(top, R, rnd, n, modo, cerca, True)

def _o_entre(top, R, rnd, n, modo, cerca):
    cel, cw, ch = _celdas(top, 3, 5)
    dmax = max(4, R//5); vistos, res = set(), []
    for i, (x, y) in enumerate(cel):
        for _ in range(500):
            d = rnd.randint(2, dmax); a = rnd.randint(1, R - d)
            if (a, d) not in vistos: break
        vistos.add((a, d)); p = (a, a + d) if rnd.random() < .5 else (a + d, a)
        _marco(x, y, cw, ch, i)
        ws = (46, 40, 46); g = 8; bx = x + (cw - sum(ws) - 2*g)/2; by = y + (ch - 46 - 10)/2
        caja(bx, by, 46, 46, p[0], 22); caja(bx + 46 + g, by, 40, 46, None); caja(bx + 86 + 2*g, by, 46, 46, p[1], 22)
        res.append(f"{p[0]} _ {p[1]} -> {min(p) + 1}..{max(p) - 1}")
    return res

def _flor(x, y):
    c.line(x, y - 16, x, y - 3); c.line(x, y - 11, x + 6, y - 7)
    c.setFillGray(1)
    for j in range(5):
        a = math.pi/2 + j*2*math.pi/5
        c.circle(x + 8.5*math.cos(a), y + 5 + 8.5*math.sin(a), 5.2, stroke=1, fill=1)
    c.circle(x, y + 5, 4.3, stroke=1, fill=1); c.setFillGray(INK)

def _coche(x, y):
    c.roundRect(x - 17, y - 8, 34, 11, 3, stroke=1, fill=0)
    c.roundRect(x - 9, y + 3, 18, 9, 3, stroke=1, fill=0)
    c.setFillGray(1)
    for dx in (-9, 9): c.circle(x + dx, y - 9, 4.2, stroke=1, fill=1)
    c.setFillGray(INK)

def _nino(x, y):
    c.circle(x, y + 12, 5, stroke=1, fill=0); c.line(x, y + 7, x, y - 6); c.line(x - 8, y + 2, x + 8, y + 2)
    c.line(x, y - 6, x - 6, y - 16); c.line(x, y - 6, x + 6, y - 16)

def _o_ordinales(top, R, rnd, n, modo, cerca):
    modo = modo or "mezcla"; rows = 6; GY = 8
    rh = (top - M - (rows - 1)*GY)/rows; pitch = 48; res = []
    for i in range(_n(rows)):
        y = top - (i + 1)*rh - i*GY
        tipo = "colorea" if (modo == "colorea" or (modo == "mezcla" and i % 2 == 0)) else "lugar"
        m = rnd.randint(7, 10); k = rnd.randint(1, m)
        _marco(M, y, W - 2*M, rh)
        cy = y + 42; x0 = M + (W - 2*M - m*pitch)/2 + pitch/2
        stroke(1.5)
        for j in range(m): (_flor, _coche, _nino)[i % 3](x0 + j*pitch, cy)
        c.setFillGray(INK); c.setFont("PB", 10.5)
        if tipo == "colorea":
            c.drawString(M + 16, y + rh - 22, f"COLOREA EL {k}.º")
        else:
            c.drawString(M + 16, y + rh - 22, "¿QUÉ LUGAR OCUPA EL DIBUJO MARCADO?")
            stroke(1.6); flecha(x0 + (k - 1)*pitch, cy + 36, x0 + (k - 1)*pitch, cy + 21)
            caja(W - M - 62, y + rh - 46, 34, 30, None); c.setFillGray(INK); c.setFont("PM", 12); c.drawString(W - M - 25, y + rh - 33, "º")
        c.setFillGray(0.3); c.setFont("PM", 7.5); c.drawString(M + 16, y + 7, "EMPIEZA")
        stroke(1.0); flecha(M + 56, y + 10, M + 84, y + 10, 3.5)
        res.append(f"{tipo} {k}.º de {m}")
    return res

def _dispersa(ax, ay, aw, ah, n, kind, rnd):
    cols = max(1, math.ceil(math.sqrt(n*aw/ah))); rows = math.ceil(n/cols)
    sp = min(aw/cols, ah/rows); r = min(11, sp*0.3); jit = sp*0.1
    slots = [(i//cols, i % cols) for i in range(cols*rows)]; rnd.shuffle(slots); stroke(1.5)
    for ri, ci in slots[:n]:
        shape(kind, ax + aw/2 + (ci - (cols - 1)/2)*sp + rnd.uniform(-jit, jit),
              ay + ah/2 + ((rows - 1)/2 - ri)*sp + rnd.uniform(-jit, jit), r)

def _o_cantidad(top, R, rnd, n, modo, cerca):
    modo = modo or "mezcla"; mx = min(R, 12)
    cel, cw, ch = _celdas(top, 2, 4)
    eq = set(rnd.sample(range(8), 2)); res = []
    t = {"mayor": ["más"]*8, "menor": ["menos"]*8}.get(modo) or (["más"]*4 + ["menos"]*4)
    if modo == "mezcla": rnd.shuffle(t)
    for i, (x, y) in enumerate(cel):
        a = rnd.randint(1, mx)
        b = a if i in eq else rnd.choice([v for v in range(1, mx + 1) if v != a])
        _marco(x, y, cw, ch, i, "RODEA EL GRUPO QUE TIENE " + t[i].upper())
        stroke(1.2); c.line(x + cw/2, y + 14, x + cw/2, y + ch - 40)
        kind = 'csqt'[i % 4]
        for j, v in enumerate((a, b)):
            _dispersa(x + 12 + j*cw/2, y + 14, cw/2 - 24, ch - 56, v, kind, rnd)
        res.append(f"{a} vs {b}: {t[i]}" + (" (iguales)" if a == b else ""))
    return res

ORDEN = {
 "mayor":     ("MAYOR O MENOR", None, _o_mayor),
 "signos":    ("LOS SIGNOS < > =", "Escribe <, > o = en el cuadro gris.", _o_signos),
 "grupo":     ("EL MAYOR Y EL MENOR", "Escribe el número mayor y el número menor de cada grupo.", _o_grupo),
 "ordena1":   ("ORDENA DE MENOR A MAYOR", "Escribe los números ordenados de menor a mayor en los cuadros grises.", _o_ordena),
 "ordena2":   ("ORDENA DE MAYOR A MENOR", "Escribe los números ordenados de mayor a menor en los cuadros grises.", _o_ordena2),
 "entre":     ("UN NÚMERO ENTRE DOS", "Escribe un número que esté entre los dos.", _o_entre),
 "ordinales": ("LOS ORDINALES", "Cuenta desde el principio y haz lo que pide cada fila.", _o_ordinales),
 "cantidad":  ("MÁS, MENOS O IGUAL", "Compara los grupos. Si hay la misma cantidad, rodea los dos.", _o_cantidad),
}
MAYOR_TXT = {"mayor": "Rodea el número mayor de cada pareja.", "menor": "Rodea el número menor de cada pareja.",
             "mezcla": "Mira lo que pide cada casilla y rodea el número mayor o el menor."}

def ficha_orden(key, R, seed=1, n=None, modo=None, cerca=False, outdir=OUT):
    global c, RANGO
    RANGO = R
    tit, ins, fn = ORDEN[key]
    if key == "mayor": ins = MAYOR_TXT[modo or "mezcla"]
    rnd = random.Random(seed)
    c = _lienzo(f"{outdir}orden_{key}_hasta_{R}.pdf")
    c.setTitle(tit.title())
    cabecera(tit, [ins])
    res = fn(H - M - 76, R, rnd, n, modo, cerca)
    return _fin(f"{key} 1-{R}: {res}")

# ------------------------------------------------------------ 6) VALOR POSICIONAL (bloque 4)
def _muestra(pool, k, rnd):
    s = pool[:]; rnd.shuffle(s); out = s[:k]
    while len(out) < k: out.append(rnd.choice(pool))
    return out

def _nums_du(cnt, R, rnd, nivel):
    cap = min(R, 99)
    mult = list(range(10, cap + 1, 10)); rest = [v for v in range(11, cap + 1) if v % 10]
    if nivel in ("completas", "ceros"): return _muestra(mult, cnt, rnd)
    out = _muestra(mult, 2, rnd) + _muestra(rest, cnt - 2, rnd)
    rnd.shuffle(out); return out

def _linea(x, y, w, h, items, gap=8):
    ws = [pdfmetrics.stringWidth(it[1], it[2], it[3]) if it[0] == "t" else it[2] for it in items]
    cx = x + (w - sum(ws) - gap*(len(items) - 1))/2
    for it, wi in zip(items, ws):
        if it[0] == "t":
            c.setFillGray(INK); c.setFont(it[2], it[3]); c.drawString(cx, y + h/2 - it[3]*0.33, it[1])
        else:
            caja(cx, y + (h - it[3])/2, it[2], it[3], it[1], 20)
        cx += wi + gap

def _v_agrupa(top, R, rnd, nivel, modo):
    cap = min(R, 49)
    if cap < 20: raise ValueError("Agrupa en decenas necesita un rango máximo de al menos 20.")
    nums = [rnd.choice(range(10, cap + 1, 10))] + _muestra([v for v in range(11, cap + 1) if v % 10], 5, rnd)
    rnd.shuffle(nums)
    cel, cw, ch = _celdas(top, 2, 3)
    for i, ((x, y), n) in enumerate(zip(cel, nums)):
        _marco(x, y, cw, ch, i)
        ax, aw = x + 16, cw - 32; rows = math.ceil(n/10)
        sx = aw/10; sy = min(26, (ch - 92)/rows); r = min(7, sx*0.3)
        ytop = y + ch - 38 - sy/2 - ((ch - 92) - rows*sy)/2
        stroke(1.5)
        for k in range(n):
            rr, cc = divmod(k, 10)
            shape('csqt'[i % 4], ax + sx/2 + cc*sx + rnd.uniform(-1.5, 1.5), ytop - rr*sy + rnd.uniform(-1.5, 1.5), r)
        x0 = x + (cw - 202)/2
        for j, lab in enumerate(("decenas", "unidades")):
            bx = x0 + j*110
            caja(bx, y + 12, 40, 34, None)
            c.setFillGray(INK); c.setFont("PM", 11); c.drawString(bx + 46, y + 25, lab)
    return [f"{n} = {n//10} D y {n % 10} U" for n in nums]

def _v_canje(top, R, rnd, nivel, modo):
    if min(R, 99) < 20: raise ValueError("Los canjes necesitan un rango máximo de al menos 20.")
    nums = _nums_du(8, R, rnd, nivel)
    rows, GY = 8, 8; rh = (top - M - (rows - 1)*GY)/rows; nums = nums[:_n(rows)]
    for i, n in enumerate(nums):
        y = top - (i + 1)*rh - i*GY
        _marco(M, y, W - 2*M, rh)
        _linea(M, y, W - 2*M, rh, [("t", f"{n} unidades", "PB", 17), ("t", "=", "PB", 17), ("b", None, 44, 38),
               ("t", "decena(s)", "PM", 13), ("t", "y", "PM", 13), ("b", None, 44, 38), ("t", "unidad(es)", "PM", 13)], 12)
    return [f"{n} = {n//10} D y {n % 10} U" for n in nums]

def _v_descdu(top, R, rnd, nivel, modo):
    if R < 30: raise ValueError("La descomposición D/U necesita un rango máximo de al menos 30.")
    nums = _nums_du(15, R, rnd, nivel)
    cel, cw, ch = _celdas(top, 3, 5)
    for i, ((x, y), n) in enumerate(zip(cel, nums)):
        _marco(x, y, cw, ch, i)
        _linea(x, y + ch/2 - 4, cw, ch/2 - 8, [("t", str(n), "PB", 24)])
        if modo == "suma":
            it = [("t", "=", "PB", 17), ("b", None, 46, 38), ("t", "+", "PB", 17), ("b", None, 46, 38)]
        else:
            it = [("t", "=", "PB", 17), ("b", None, 38, 36), ("t", "D", "PM", 13), ("t", "+", "PB", 15), ("b", None, 38, 36), ("t", "U", "PM", 13)]
        _linea(x, y + 6, cw, ch/2 - 10, it, 6)
    return [f"{n} = {n//10*10} + {n % 10}" if modo == "suma" else f"{n} = {n//10} D + {n % 10} U" for n in nums]

def _v_dunum(top, R, rnd, nivel, modo):
    if R < 30: raise ValueError("Este modelo necesita un rango máximo de al menos 30.")
    nums = _nums_du(12, R, rnd, nivel)
    tipos = ["a"]*6 + ["b"]*6; rnd.shuffle(tipos)
    cel, cw, ch = _celdas(top, 2, 6)
    for i, ((x, y), n, t) in enumerate(zip(cel, nums, tipos)):
        _marco(x, y, cw, ch, i)
        txt = ("t", f"{n//10} D y {n % 10} U", "PB", 17)
        it = [txt, ("t", "=", "PB", 17), ("b", None, 56, 44)] if t == "a" else [("b", None, 56, 44), ("t", "=", "PB", 17), txt]
        _linea(x + 22, y, cw - 22, ch, it, 10)
    return [f"{n//10} D y {n % 10} U <-> {n}" for n in nums]

def _v_pares(top, R, rnd, nivel, modo):
    if modo == "clasifica":
        ev, od = list(range(2, R + 1, 2)), list(range(1, R + 1, 2))
        E = rnd.sample(ev, min(6, len(ev))); O = rnd.sample(od, min(6, len(od)))
        nums = E + O; rnd.shuffle(nums)
        bw, bh, g, ph = 56, 46, 12, 132
        _marco(M, top - ph, W - 2*M, ph)
        for j, v in enumerate(nums):
            r_, k = divmod(j, 6); m = min(6, len(nums) - 6*r_)
            bx = M + (W - 2*M - (m*bw + (m - 1)*g))/2
            caja(bx + k*(bw + g), top - 14 - bh - r_*(bh + 10), bw, bh, v, 20)
        t2 = top - ph - 12; pw = (W - 2*M - 12)/2
        for j, (tit, cnt) in enumerate((("PARES", len(E)), ("IMPARES", len(O)))):
            px = M + j*(pw + 12); _marco(px, M, pw, t2 - M)
            c.setFillGray(INK); c.setFont("PB", 15); c.drawCentredString(px + pw/2, t2 - 30, tit)
            for k in range(cnt): caja(px + (pw - 120)/2, t2 - 50 - 60 - k*74, 120, 60, None)
        return {"pares": sorted(E), "impares": sorted(O)}
    cap = min(R, 20)
    ev, od = list(range(2, cap + 1, 2)), list(range(1, cap + 1, 2))
    nums = _muestra(ev, 6, rnd) + _muestra(od, 6, rnd); rnd.shuffle(nums)
    cel, cw, ch = _celdas(top, 3, 4)
    for i, ((x, y), n) in enumerate(zip(cel, nums)):
        _marco(x, y, cw, ch, i)
        cols = math.ceil(n/2); pitch = min(22, (cw - 36)/cols); r = min(6, pitch*0.32)
        x0 = x + cw/2 - (cols - 1)*pitch/2; yc = y + ch*0.60
        c.setFillGray(INK)
        for k in range(n): c.circle(x0 + (k//2)*pitch, yc + pitch/2 - (k % 2)*pitch, r, stroke=0, fill=1)
        stroke(1.5)
        for j, lab in enumerate(("PAR", "IMPAR")):
            bx = x + cw/2 + (j - 1)*70 + 3
            c.roundRect(bx, y + 14, 64, 30, 8, stroke=1, fill=0)
            c.setFillGray(INK); c.setFont("PB", 11); c.drawCentredString(bx + 32, y + 25, lab)
    return [f"{n}: {'par' if n % 2 == 0 else 'impar'}" for n in nums]

def _v_cifra(top, R, rnd, nivel, modo):
    if R < 30: raise ValueError("El valor de la cifra necesita un rango máximo de al menos 30.")
    cand = [v for v in range(12, min(R, 99) + 1) if v % 10 and v//10 != v % 10]
    nums = rnd.sample(cand, 8)
    rows, GY = 8, 8; rh = (top - M - (rows - 1)*GY)/rows; nums = nums[:_n(rows)]
    for i, n in enumerate(nums):
        y = top - (i + 1)*rh - i*GY
        _marco(M, y, W - 2*M, rh)
        d, u = divmod(n, 10)
        _linea(M, y, W - 2*M, rh, [("t", f"En {n},", "PB", 16), ("t", f"el {d} vale", "PM", 14), ("b", None, 56, 38),
               ("t", f"y el {u} vale", "PM", 14), ("b", None, 56, 38)], 14)
    return [f"{n}: {n//10*10} y {n % 10}" for n in nums]

VALOR = {
 "agrupa": ("AGRUPA EN DECENAS", "Rodea grupos de 10 y escribe cuántas decenas y unidades hay.", _v_agrupa),
 "canje":  ("LOS CANJES", "Cambia las unidades por decenas y escribe cuántas decenas y unidades son.", _v_canje),
 "descdu": ("DESCOMPOSICIÓN EN D Y U", None, _v_descdu),
 "dunum":  ("DECENAS, UNIDADES Y NÚMERO", "Completa cada casilla con el número o con sus decenas y unidades.", _v_dunum),
 "pares":  ("PARES E IMPARES", None, _v_pares),
 "cifra":  ("EL VALOR DE LA CIFRA", "Escribe cuánto vale cada cifra.", _v_cifra),
}

def ficha_valor(key, R, seed=1, nivel=None, modo=None, outdir=OUT):
    global c, RANGO
    RANGO = R
    tit, ins, fn = VALOR[key]
    if key == "descdu": ins = "Descompón cada número en una suma de decenas y unidades." if modo == "suma" else "Descompón cada número en decenas (D) y unidades (U)."
    if key == "pares": ins = "Escribe cada número en su columna: pares o impares." if modo == "clasifica" else "Cuenta los puntos de cada casilla y rodea si el número es par o impar."
    rnd = random.Random(seed)
    suf = f"_{modo}" if modo else ""
    c = _lienzo(f"{outdir}valor_{key}{suf}_hasta_{R}.pdf")
    c.setTitle(tit.title())
    cabecera(tit, [ins])
    res = fn(H - M - 76, R, rnd, nivel, modo)
    return _fin(f"{key} 1-{R}: {res}")

# ------------------------------------------------------------ 7) SUMA (bloque 5)
def T(s, fs=19, f="PB"): return ("t", s, f, fs)
def B(w=44, h=38): return ("b", None, w, h)

def _unico(pool, vistos, rnd):
    for _ in range(80):
        p = rnd.choice(pool)
        if p not in vistos: break
    vistos.add(p); return p

def _pares_suma(R, nivel, cnt, rnd):
    nivel = nivel or "sin"
    if R <= 10:
        grupos = [[(a, b) for a in range(1, 10) for b in range(1, 10) if a + b <= 10]]
    elif R <= 20:
        sin = [(a, b) for a in range(1, 20) for b in range(1, 20) if a + b <= 20 and not (a < 10 and b < 10 and a + b > 10)]
        con = [(a, b) for a in range(2, 10) for b in range(2, 10) if a + b > 10]
        grupos = {"sin": [sin], "con": [con], "mezcla": [sin, con]}[nivel]
    else:
        cap = min(R, 99); ten = range(10, cap + 1, 10)
        dd = [(a, b) for a in ten for b in ten if a + b <= cap]
        du = [(a, b) for a in ten for b in range(1, 10) if a + b <= cap]; du += [(b, a) for a, b in du]
        uu = [a for a in range(11, cap) if a % 10]
        s = [(a, b) for a in uu for b in range(1, 10) if a % 10 + b < 10 and a + b <= cap]
        k = [(a, b) for a in uu for b in range(1, 10) if a % 10 + b >= 10 and a + b <= cap]
        grupos = {"sin": [dd, du, s], "con": [k], "mezcla": [dd, du, s, k]}[nivel]
    vistos = set(); out = [_unico(grupos[i % len(grupos)], vistos, rnd) for i in range(cnt)]
    rnd.shuffle(out); return out

def _pintar(top, cols, rows, entries, rows_ref=None):
    GX, GY = 10, 8; rr = rows_ref or rows; entries = entries[:_n(rows)*cols]
    cw = (W - 2*M - (cols - 1)*GX)/cols; ch = (top - M - (rr - 1)*GY)/rr
    for i, (items, _) in enumerate(entries):
        r_, k = divmod(i, cols)
        x = M + k*(cw + GX); y = top - (r_ + 1)*ch - r_*GY
        _marco(x, y, cw, ch); _linea(x, y, cw, ch, items, 8)
    return [e[1] for e in entries]

def _s_dibujos(top, R, rnd, nivel, modo, huecos):
    cap = 10 if R <= 10 else 20
    cel, cw, ch = _celdas(top, 2, 4); res = []
    for i, (x, y) in enumerate(cel):
        t = rnd.randint(3, cap); a = rnd.randint(1, t - 1); b = t - a
        _marco(x, y, cw, ch, i); kind = 'csqt'[i % 4]; aw = (cw - 60)/2; ah = ch - 80
        _dispersa(x + 14, y + 56, aw, ah, a, kind, rnd); _dispersa(x + cw - 14 - aw, y + 56, aw, ah, b, kind, rnd)
        c.setFillGray(INK); c.setFont("PB", 26); c.drawCentredString(x + cw/2, y + 56 + ah/2 - 9, "+")
        _linea(x, y + 8, cw, 44, [T("Total =", 14, "PM"), B(52, 38)], 8)
        res.append(f"{a} + {b} = {t}")
    return res

def _s_recta(top, R, rnd, nivel, modo, huecos):
    N = 10 if R <= 10 else 20 if R <= 20 else 30
    rows, GY = 6, 10; rh = (top - M - (rows - 1)*GY)/rows
    L = W - 2*M - 60; step = L/N; res = []
    for i in range(_n(rows)):
        b = rnd.randint(2, min(9, N - 2)); a = rnd.randint(1, N - b)
        y = top - (i + 1)*rh - i*GY; _marco(M, y, W - 2*M, rh)
        _linea(M, y + rh - 44, W - 2*M, 36, [T(f"{a} + {b} =", 19), B(54, 34)], 10)
        x0, y0 = M + 30, y + 28
        stroke(1.4); c.line(x0 - 8, y0, x0 + L + 8, y0)
        for k in range(N + 1):
            c.setLineWidth(1.2); c.line(x0 + k*step, y0 - 4, x0 + k*step, y0 + 4)
            c.setFont("PM", 7.5); c.drawCentredString(x0 + k*step, y0 - 14, str(k))
        xa, xb = x0 + a*step, x0 + (a + b)*step
        stroke(1.8); p = c.beginPath(); p.moveTo(xa, y0 + 3); p.curveTo(xa, y0 + 30, xb, y0 + 30, xb, y0 + 7); c.drawPath(p, stroke=1, fill=0)
        q = c.beginPath(); q.moveTo(xb, y0 + 2); q.lineTo(xb - 4, y0 + 9); q.lineTo(xb + 4, y0 + 9); q.close(); c.drawPath(q, stroke=0, fill=1)
        c.circle(xa, y0, 3, stroke=0, fill=1)
        c.setFont("PM", 9); c.drawCentredString((xa + xb)/2, y0 + 26, f"+{b}")
        res.append(f"{a} + {b} = {a + b}")
    return res

def _s_horiz(top, R, rnd, nivel):
    ps = _pares_suma(R, nivel, 24, rnd)
    return _pintar(top, 3, 8, [([T(f"{a} + {b} =", 19), B(42, 38)], f"{a} + {b} = {a + b}") for a, b in ps])

def _s_vertical(top, R, rnd, nivel, modo, huecos):
    cap = min(R, 99); nivel = nivel or "sin"; ps, vistos = [], set()
    while len(ps) < 12:
        con = nivel == "con" or (nivel == "mezcla" and len(ps) % 2)
        for _ in range(500):
            a = rnd.randint(11, cap - 1); b = rnd.randint(1, cap - a)
            if ((a % 10 + b % 10) >= 10) == con and (a, b) not in vistos: break
        vistos.add((a, b)); ps.append((a, b))
    rnd.shuffle(ps)
    cel, cw, ch = _celdas(top, 3, 4); res = []
    for i, ((x, y), (a, b)) in enumerate(zip(cel, ps)):
        _marco(x, y, cw, ch, i); xt, xu = x + cw/2 - 17, x + cw/2 + 17
        c.setFillGray(0.3); c.setFont("PM", 9); c.drawCentredString(xt, y + ch - 20, "D"); c.drawCentredString(xu, y + ch - 20, "U")
        c.setFillGray(INK); c.setFont("PB", 24)
        for j, v in enumerate((a, b)):
            yy = y + ch - 56 - j*34
            if v >= 10: c.drawCentredString(xt, yy, str(v//10))
            c.drawCentredString(xu, yy, str(v % 10))
        c.drawCentredString(xt - 38, y + ch - 90, "+")
        stroke(1.6); c.line(xt - 28, y + ch - 98, xu + 24, y + ch - 98)
        caja(xt - 15, y + 14, 30, 40, None); caja(xu - 15, y + 14, 30, 40, None)
        res.append(f"{a} + {b} = {a + b}")
    return res

def _s_dobles(top, R, rnd, nivel, modo, huecos):
    cap = max(2, min(10, R//2))
    cs = _muestra([(n, f) for n in range(1, cap + 1) for f in (0, 1)], 12, rnd)
    cel, cw, ch = _celdas(top, 3, 4); res = []
    for i, ((x, y), (n, f)) in enumerate(zip(cel, cs)):
        _marco(x, y, cw, ch, i)
        it = [T(f"{n} + {n} =", 17), B(44, 38)] if f == 0 else [T(f"Doble de {n} =", 14), B(44, 38)]
        if modo == "dibujo":
            pitch = min(20, (cw - 36)/n); r = min(6, pitch*0.3); x0 = x + cw/2 - (n - 1)*pitch/2; c.setFillGray(INK)
            for j in range(n):
                c.circle(x0 + j*pitch, y + 128 + pitch/2, r, stroke=0, fill=1); c.circle(x0 + j*pitch, y + 128 - pitch/2, r, stroke=0, fill=1)
            _linea(x, y + 10, cw, 60, it, 8)
        else: _linea(x, y, cw, ch, it, 8)
        res.append(f"{n} + {n} = {2*n}")
    return res

def _s_comp10(top, R, rnd, nivel, modo, huecos):
    es = []
    for a in range(1, 10):
        es.append(([T(f"{a} +"), B(), T("= 10")], str(10 - a)))
        es.append(([B(), T(f"+ {a} = 10")], str(10 - a)))
    rnd.shuffle(es); return _pintar(top, 3, 6, es)

def _s_comp20(top, R, rnd, nivel, modo, huecos):
    cap = min(R, 100)
    cs = [(a, o) for a in range(11, cap) if a % 10 for o in (0, 1)]
    es = []
    for a, o in rnd.sample(cs, 18):
        t = (a//10 + 1)*10
        es.append(([T(f"{a} +"), B(), T(f"= {t}")] if o == 0 else [B(), T(f"+ {a} = {t}")], f"{a} + {t - a} = {t}"))
    return _pintar(top, 3, 6, es)

def _s_hueco(top, R, rnd, nivel, modo, huecos):
    es = []
    for a, b in _pares_suma(min(R, 99), nivel, 24, rnd):
        if rnd.random() < .5: es.append(([B(), T(f"+ {b} = {a + b}")], f"{a} + {b} = {a + b}"))
        else: es.append(([T(f"{a} +"), B(), T(f"= {a + b}")], f"{a} + {b} = {a + b}"))
    return _pintar(top, 3, 8, es)

def _varilla(x, y):
    stroke(1.3); c.rect(x, y, 9, 34, stroke=1, fill=0); c.setLineWidth(0.5)
    for j in range(1, 10): c.line(x, y + j*3.4, x + 9, y + j*3.4)

def _s_decenas(top, R, rnd, nivel, modo, huecos):
    cap = min(R, 100)
    pool = [(a, b) for a in range(10, cap, 10) for b in range(10, cap, 10) if a + b <= cap]
    if modo == "bloques":
        n = max(2, min(10, len(pool)) - min(10, len(pool)) % 2); ps = rnd.sample(pool, n)
        cel, cw, ch = _celdas(top, 2, 5, 10, 10); res = []
        for i, ((x, y), (a, b)) in enumerate(zip(cel, ps)):
            _marco(x, y, cw, ch, i); na, nb = a//10, b//10
            tot = (na + nb)*12 + 30; xx = x + (cw - tot)/2; yy = y + ch*0.45
            for j in range(na): _varilla(xx + j*12, yy)
            c.setFillGray(INK); c.setFont("PB", 20); c.drawCentredString(xx + na*12 + 12, yy + 10, "+")
            for j in range(nb): _varilla(xx + na*12 + 30 + j*12, yy)
            _linea(x, y + 8, cw, 46, [T(f"{a} + {b} =", 19), B(50, 38)], 8)
            res.append(f"{a} + {b} = {a + b}")
        return res
    ex = rnd.sample([(a, b, f) for a, b in pool for f in range(3)], min(24, len(pool)*3)); es = []
    for a, b, f in ex:
        t = a + b
        es.append(([T(f"{a} + {b} ="), B()], f"{a} + {b} = {t}") if f == 0 else
                  ([T(f"{a} +"), B(), T(f"= {t}")], f"{a} + {b} = {t}") if f == 1 else
                  ([B(), T(f"+ {b} = {t}")], f"{a} + {b} = {t}"))
    return _pintar(top, 3, len(es)//3, es, 8)

def _s_enc(top, R, rnd, nivel, modo, huecos):
    cap = 10 if R <= 10 else 20; vistos, es = set(), []
    while len(es) < 16:
        for _ in range(300):
            t = rnd.randint(max(5, cap//2), cap); p = sorted(rnd.sample(range(1, t), 2))
            tr = (p[0], p[1] - p[0], t - p[1])
            if tr not in vistos: break
        vistos.add(tr); es.append(([T(f"{tr[0]} + {tr[1]} + {tr[2]} =", 18), B(44, 36)], f"{tr[0]} + {tr[1]} + {tr[2]} = {t}"))
    return _pintar(top, 2, 8, es)

def _resoluble(known):
    k = set(known); ch = True
    while ch:
        ch = False
        for rel in ((0, 1, 3), (1, 2, 4), (3, 4, 5)):
            if len([j for j in rel if j in k]) == 2 and len(k & set(rel)) < 3: k |= set(rel); ch = True
    return len(k) == 6

def _s_piramide(top, R, rnd, nivel, modo, huecos):
    cap = R if R <= 20 else min(R, 99); mx = max(2, cap//4 if R > 20 else cap//3)
    h = max(1, min(4, 3 if huecos is None else huecos))
    cel, cw, ch = _celdas(top, 2, 3); res = []
    bw, bh, g = 46, 40, 6
    for i, (x, y) in enumerate(cel):
        for _ in range(300):
            b0, b1, b2 = (rnd.randint(1, mx) for _ in range(3))
            if b0 + 2*b1 + b2 <= cap: break
        v = [b0, b1, b2, b0 + b1, b1 + b2, 2*b1 + b0 + b2]
        for _ in range(300):
            vac = set(rnd.sample(range(6), h))
            if _resoluble([j for j in range(6) if j not in vac]): break
        _marco(x, y, cw, ch, i); cx = x + cw/2; base = y + (ch - 140)/2
        pos = [(cx + (j - 1)*(bw + g), base) for j in range(3)] + [(cx + (j - .5)*(bw + g), base + 50) for j in range(2)] + [(cx, base + 100)]
        for j, (px, py) in enumerate(pos): caja(px - bw/2, py, bw, bh, None if j in vac else v[j], 18)
        res.append(f"base {v[:3]}, medio {v[3:5]}, cima {v[5]}; huecos {sorted(vac)}")
    return res

def _s_tabla(top, R, rnd, nivel, modo, huecos):
    if R <= 10: rows = cols = list(range(1, 6))
    elif R <= 20: rows = sorted(rnd.sample(range(1, 11), 6)); cols = sorted(rnd.sample(range(1, 11), 6))
    else:
        tens = list(range(10, min(R, 99) - 8, 10)); rows = sorted(rnd.sample(tens, min(6, len(tens)))); cols = sorted(rnd.sample(range(1, 10), 6))
    kr, kc = len(rows), len(cols); cs = min(78, (W - 2*M)/(kc + 1), (top - M - 10)/(kr + 1))
    x0 = M + (W - 2*M - (kc + 1)*cs)/2; y0 = top - 10
    n_h = round(kr*kc*0.55) if huecos is None else min(huecos, kr*kc)
    vac = set(rnd.sample(range(kr*kc), n_h))
    def cab(x, y, t):
        stroke(2.4); c.setFillGray(1); c.roundRect(x + 2, y + 2, cs - 4, cs - 4, 8, stroke=1, fill=1)
        c.setFillGray(INK); c.setFont("PB", 18); c.drawCentredString(x + cs/2, y + cs/2 - 6.5, str(t))
    stroke(2.4); c.circle(x0 + cs/2, y0 - cs/2, cs*0.3, stroke=1, fill=0)
    c.setFont("PB", 22); c.drawCentredString(x0 + cs/2, y0 - cs/2 - 7.5, "+")
    for j, v in enumerate(cols): cab(x0 + (j + 1)*cs, y0 - cs, v)
    for i, v in enumerate(rows): cab(x0, y0 - (i + 2)*cs, v)
    for i, rv in enumerate(rows):
        for j, cv in enumerate(cols):
            caja(x0 + (j + 1)*cs + 2, y0 - (i + 2)*cs + 2, cs - 4, cs - 4, None if i*kc + j in vac else rv + cv, 18)
    return {"filas": rows, "columnas": cols, "huecos": n_h}

SUMAR = {
 "dibujos":     ("SUMA CON DIBUJOS", "Cuenta los dibujos de cada grupo y escribe el total.", _s_dibujos, 10),
 "recta":       ("SUMA EN LA RECTA NUMÉRICA", "Sigue el salto en la recta y escribe el resultado.", _s_recta, 10),
 "h10":         ("SUMAS HASTA 10", "Calcula y escribe el resultado en el cuadro gris.", lambda t, R, r, n, m, h: _s_horiz(t, 10, r, n), 10),
 "h20":         ("SUMAS HASTA 20", "Calcula y escribe el resultado en el cuadro gris.", lambda t, R, r, n, m, h: _s_horiz(t, 20, r, n), 20),
 "h100":        ("SUMAS HASTA 100", "Calcula y escribe el resultado en el cuadro gris.", lambda t, R, r, n, m, h: _s_horiz(t, R, r, n), 30),
 "vertical":    ("SUMAS EN VERTICAL", "Suma primero las unidades y después las decenas.", _s_vertical, 30),
 "dobles":      ("LOS DOBLES", "Calcula el doble de cada número.", _s_dobles, 10),
 "comp10":      ("COMPLETA HASTA 10", "Escribe el número que falta para llegar a 10.", _s_comp10, 10),
 "comp20":      ("COMPLETA HASTA LA DECENA", "Escribe el número que falta para llegar a la decena siguiente.", _s_comp20, 20),
 "hueco":       ("SUMAS CON HUECO", "Escribe el número que falta.", _s_hueco, 10),
 "decenas":     ("SUMAS DE DECENAS", "Suma las decenas y escribe el resultado.", _s_decenas, 30),
 "encadenadas": ("SUMAS ENCADENADAS", "Suma los tres números y escribe el resultado.", _s_enc, 10),
 "piramide":    ("PIRÁMIDES DE SUMAS", "Cada casilla es la suma de las dos de abajo. Completa las que faltan.", _s_piramide, 10),
 "tabla":       ("TABLA DE SUMAR", "Suma el número de la fila y el de la columna y completa la tabla.", _s_tabla, 10),
}

def ficha_sumar(key, R, seed=1, nivel=None, modo=None, huecos=None, outdir=OUT):
    global c, RANGO
    RANGO = R
    tit, ins, fn, rmin = SUMAR[key]
    if R < rmin: raise ValueError(f"{tit.capitalize()} necesita un rango máximo de al menos {rmin}.")
    rnd = random.Random(seed)
    suf = (f"_{modo}" if modo else "") + (f"_{nivel}" if nivel else "")
    c = _lienzo(f"{outdir}sumar_{key}{suf}_hasta_{R}.pdf")
    c.setTitle(tit.title())
    cabecera(tit, [ins])
    res = fn(H - M - 76, R, rnd, nivel, modo, huecos)
    return _fin(f"{key} 1-{R}: {res}")

# ------------------------------------------------------------ 8) RESTA (bloque 6)
MENOS = "−" if all(0x2212 in pdfmetrics.getFont(n).face.charToGlyph for n in ("PB", "PM")) else "–"

def _pares_resta(R, nivel, cnt, rnd):
    nivel = nivel or "sin"
    if R <= 10:
        grupos = [[(a, b) for a in range(2, 11) for b in range(1, a)]]
    elif R <= 20:
        sin = [(a, b) for a in range(2, 21) for b in range(1, a) if a <= 10 or a - b >= 10]
        con = [(a, b) for a in range(11, 20) for b in range(2, 10) if b < a and a - b < 10]
        grupos = {"sin": [sin], "con": [con], "mezcla": [sin, con]}[nivel]
    else:
        cap = min(R, 99); ten = range(10, cap + 1, 10)
        dd = [(a, b) for a in ten for b in ten if b < a]
        uu = [a for a in range(11, cap + 1) if a % 10]
        du = [(a, b) for a in uu for b in range(1, 10) if b <= a % 10 and b < a]
        dudu = [(a, b) for a in uu for b in range(11, a) if b % 10 <= a % 10]
        con = [(a, b) for a in range(11, cap + 1) for b in range(2, 10) if a % 10 < b]
        grupos = {"sin": [dd, du, dudu], "con": [con], "mezcla": [dd, du, dudu, con]}[nivel]
    vistos = set(); out = [_unico(grupos[i % len(grupos)], vistos, rnd) for i in range(cnt)]
    rnd.shuffle(out); return out

def _quita(ax, ay, aw, ah, n, k, kind, rnd):
    cols = max(1, math.ceil(math.sqrt(n*aw/ah))); rows = math.ceil(n/cols)
    sp = min(aw/cols, ah/rows); r = min(11, sp*0.3); jit = sp*0.08
    slots = [(i//cols, i % cols) for i in range(cols*rows)]; rnd.shuffle(slots)
    tach = set(rnd.sample(range(n), k))
    for j, (ri, ci) in enumerate(slots[:n]):
        px = ax + aw/2 + (ci - (cols - 1)/2)*sp + rnd.uniform(-jit, jit); py = ay + ah/2 + ((rows - 1)/2 - ri)*sp + rnd.uniform(-jit, jit)
        stroke(1.5); shape(kind, px, py, r)
        if j in tach:
            stroke(1.9); d = r*1.3; c.line(px - d, py - d, px + d, py + d); c.line(px - d, py + d, px + d, py - d)

def _r_quita(top, R, rnd, nivel, modo, huecos):
    cap = 10 if R <= 10 else 20
    cel, cw, ch = _celdas(top, 2, 4); res = []
    for i, (x, y) in enumerate(cel):
        a = rnd.randint(4, cap); b = rnd.randint(1, a - 1)
        _marco(x, y, cw, ch, i)
        _quita(x + 14, y + 56, cw - 28, ch - 80, a, b, 'csqt'[i % 4], rnd)
        _linea(x, y + 8, cw, 44, [T("Quedan =", 14, "PM"), B(52, 38)], 8)
        res.append(f"{a} {MENOS} {b} = {a - b}")
    return res

def _r_recta(top, R, rnd, nivel, modo, huecos):
    N = 10 if R <= 10 else 20 if R <= 20 else 30
    rows, GY = 6, 10; rh = (top - M - (rows - 1)*GY)/rows
    L = W - 2*M - 60; step = L/N; res = []
    for i in range(_n(rows)):
        b = rnd.randint(2, min(9, N - 2)); a = rnd.randint(b + 1, N)
        y = top - (i + 1)*rh - i*GY; _marco(M, y, W - 2*M, rh)
        _linea(M, y + rh - 44, W - 2*M, 36, [T(f"{a} {MENOS} {b} =", 19), B(54, 34)], 10)
        x0, y0 = M + 30, y + 28
        stroke(1.4); c.line(x0 - 8, y0, x0 + L + 8, y0)
        for k in range(N + 1):
            c.setLineWidth(1.2); c.line(x0 + k*step, y0 - 4, x0 + k*step, y0 + 4)
            c.setFont("PM", 7.5); c.drawCentredString(x0 + k*step, y0 - 14, str(k))
        xa, xb = x0 + a*step, x0 + (a - b)*step
        stroke(1.8); p = c.beginPath(); p.moveTo(xa, y0 + 3); p.curveTo(xa, y0 + 30, xb, y0 + 30, xb, y0 + 7); c.drawPath(p, stroke=1, fill=0)
        q = c.beginPath(); q.moveTo(xb, y0 + 2); q.lineTo(xb - 4, y0 + 9); q.lineTo(xb + 4, y0 + 9); q.close(); c.drawPath(q, stroke=0, fill=1)
        c.circle(xa, y0, 3, stroke=0, fill=1)
        c.setFont("PM", 9); c.drawCentredString((xa + xb)/2, y0 + 26, f"{MENOS}{b}")
        res.append(f"{a} {MENOS} {b} = {a - b}")
    return res

def _r_horiz(top, R, rnd, nivel):
    ps = _pares_resta(R, nivel, 24, rnd)
    return _pintar(top, 3, 8, [([T(f"{a} {MENOS} {b} =", 19), B(42, 38)], f"{a} {MENOS} {b} = {a - b}") for a, b in ps])

def _r_vertical(top, R, rnd, nivel, modo, huecos):
    cap = min(R, 99); nivel = nivel or "sin"; ps, vistos = [], set()
    while len(ps) < 12:
        con = nivel == "con" or (nivel == "mezcla" and len(ps) % 2)
        for _ in range(800):
            a = rnd.randint(21, cap); b = rnd.randint(1, a - 1)
            if ((b % 10) > (a % 10)) == con and (a, b) not in vistos: break
        vistos.add((a, b)); ps.append((a, b))
    rnd.shuffle(ps)
    cel, cw, ch = _celdas(top, 3, 4); res = []
    for i, ((x, y), (a, b)) in enumerate(zip(cel, ps)):
        _marco(x, y, cw, ch, i); xt, xu = x + cw/2 - 17, x + cw/2 + 17
        c.setFillGray(0.3); c.setFont("PM", 9); c.drawCentredString(xt, y + ch - 20, "D"); c.drawCentredString(xu, y + ch - 20, "U")
        c.setFillGray(INK); c.setFont("PB", 24)
        for j, v in enumerate((a, b)):
            yy = y + ch - 56 - j*34
            if v >= 10: c.drawCentredString(xt, yy, str(v//10))
            c.drawCentredString(xu, yy, str(v % 10))
        c.drawCentredString(xt - 38, y + ch - 90, MENOS)
        stroke(1.6); c.line(xt - 28, y + ch - 98, xu + 24, y + ch - 98)
        caja(xt - 15, y + 14, 30, 40, None); caja(xu - 15, y + 14, 30, 40, None)
        res.append(f"{a} {MENOS} {b} = {a - b}")
    return res

def _r_mitades(top, R, rnd, nivel, modo, huecos):
    cap = min(R, 20)
    cs = _muestra([(n, f) for n in range(2, cap + 1, 2) for f in (0, 1)], 12, rnd)
    cel, cw, ch = _celdas(top, 3, 4); res = []
    for i, ((x, y), (n, f)) in enumerate(zip(cel, cs)):
        _marco(x, y, cw, ch, i)
        it = [T(f"La mitad de {n} =", 14), B(44, 38)] if f == 0 else [T(f"{n} =", 17), B(40, 38), T("+", 17), B(40, 38)]
        if modo == "dibujo":
            h = n//2; pitch = min(20, (cw - 36)/h); r = min(6, pitch*0.3); x0 = x + cw/2 - (h - 1)*pitch/2; c.setFillGray(INK)
            for j in range(h):
                c.circle(x0 + j*pitch, y + 128 + pitch/2, r, stroke=0, fill=1); c.circle(x0 + j*pitch, y + 128 - pitch/2, r, stroke=0, fill=1)
            _linea(x, y + 10, cw, 60, it, 8)
        else: _linea(x, y, cw, ch, it, 8)
        res.append(f"{n} -> {n//2}")
    return res

def _r_faltan(top, R, rnd, nivel, modo, huecos):
    cap = min(R, 100); es, vistos = [], set()
    while len(es) < 16:
        for _ in range(300):
            a = rnd.randint(1, cap - 1)
            if R <= 10: t = 10
            elif R <= 20: t = 10 if a < 10 else 20
            else: t = (a//10 + 1)*10
            if a % 10 == 0 and R > 10: continue
            if t <= cap and a not in vistos: break
        vistos.add(a); es.append(([T(f"De {a} a {t} faltan", 16), B(44, 38)], f"{t} {MENOS} {a} = {t - a}"))
    return _pintar(top, 2, 8, es)

def _r_hueco(top, R, rnd, nivel, modo, huecos):
    es = []
    for a, b in _pares_resta(min(R, 99), nivel, 24, rnd):
        c_ = a - b
        if rnd.random() < .5: es.append(([B(), T(f"{MENOS} {b} = {c_}")], f"{a} {MENOS} {b} = {c_}"))
        else: es.append(([T(f"{a} {MENOS}"), B(), T(f"= {c_}")], f"{a} {MENOS} {b} = {c_}"))
    return _pintar(top, 3, 8, es)

def _r_decenas(top, R, rnd, nivel, modo, huecos):
    cap = min(R, 100)
    pool = [(a, b) for a in range(20, cap + 1, 10) for b in range(10, a, 10)]
    if modo == "bloques":
        n = max(2, min(10, len(pool)) - min(10, len(pool)) % 2); ps = rnd.sample(pool, n)
        cel, cw, ch = _celdas(top, 2, 5, 10, 10); res = []
        for i, ((x, y), (a, b)) in enumerate(zip(cel, ps)):
            _marco(x, y, cw, ch, i); na, nb = a//10, b//10
            xx = x + (cw - na*12)/2; yy = y + ch*0.45
            for j in range(na): _varilla(xx + j*12, yy)
            stroke(1.9)
            for j in range(na - nb, na): c.line(xx + j*12 - 1, yy - 2, xx + j*12 + 10, yy + 36); c.line(xx + j*12 - 1, yy + 36, xx + j*12 + 10, yy - 2)
            _linea(x, y + 8, cw, 46, [T(f"{a} {MENOS} {b} =", 19), B(50, 38)], 8)
            res.append(f"{a} {MENOS} {b} = {a - b}")
        return res
    ex = rnd.sample([(a, b, f) for a, b in pool for f in range(3)], min(24, len(pool)*3)); es = []
    for a, b, f in ex:
        t = a - b; r_ = f"{a} {MENOS} {b} = {t}"
        es.append(([T(f"{a} {MENOS} {b} ="), B()], r_) if f == 0 else ([T(f"{a} {MENOS}"), B(), T(f"= {t}")], r_) if f == 1 else ([B(), T(f"{MENOS} {b} = {t}")], r_))
    return _pintar(top, 3, len(es)//3, es, 8)

def _r_enc(top, R, rnd, nivel, modo, huecos):
    cap = 10 if R <= 10 else 20; vistos, es = set(), []
    while len(es) < 16:
        for _ in range(300):
            a = rnd.randint(max(6, cap//2), cap); b = rnd.randint(1, a - 2); c_ = rnd.randint(1, a - b - 1) if a - b > 1 else 1
            if (a, b, c_) not in vistos and a - b - c_ >= 0: break
        vistos.add((a, b, c_)); es.append(([T(f"{a} {MENOS} {b} {MENOS} {c_} =", 18), B(44, 36)], f"{a} {MENOS} {b} {MENOS} {c_} = {a - b - c_}"))
    return _pintar(top, 2, 8, es)

def _r_familia(top, R, rnd, nivel, modo, huecos):
    ps = [p for p in _pares_suma(R, nivel, 20, rnd) if p[0] != p[1]][:8]
    cel, cw, ch = _celdas(top, 2, 4); res = []
    for i, ((x, y), (a, b)) in enumerate(zip(cel, ps)):
        t = a + b; _marco(x, y, cw, ch, i)
        _linea(x, y + ch - 62, cw, 44, [T(f"{a} + {b} = {t}", 20)], 8)
        _linea(x, y + 62, cw, 46, [T(f"{t} {MENOS} {a} =", 18), B(48, 36)], 8)
        _linea(x, y + 10, cw, 46, [T(f"{t} {MENOS} {b} =", 18), B(48, 36)], 8)
        res.append(f"{a} + {b} = {t}; {t - a}; {t - b}")
    return res

RESTAR = {
 "quita":       ("RESTA CON DIBUJOS", "Quita los dibujos tachados y escribe cuántos quedan.", _r_quita, 10),
 "recta":       ("RESTA EN LA RECTA NUMÉRICA", "Salta hacia atrás en la recta y escribe el resultado.", _r_recta, 10),
 "r10":         ("RESTAS HASTA 10", "Calcula y escribe el resultado en el cuadro gris.", lambda t, R, r, n, m, h: _r_horiz(t, 10, r, n), 10),
 "r20":         ("RESTAS HASTA 20", "Calcula y escribe el resultado en el cuadro gris.", lambda t, R, r, n, m, h: _r_horiz(t, 20, r, n), 20),
 "r100":        ("RESTAS HASTA 100", "Calcula y escribe el resultado en el cuadro gris.", lambda t, R, r, n, m, h: _r_horiz(t, R, r, n), 30),
 "vertical":    ("RESTAS EN VERTICAL", "Resta primero las unidades y después las decenas.", _r_vertical, 30),
 "mitades":     ("LAS MITADES", "Escribe la mitad de cada número.", _r_mitades, 10),
 "faltan":      ("¿CUÁNTO FALTA?", "Escribe cuánto falta para llegar al número.", _r_faltan, 10),
 "hueco":       ("RESTAS CON HUECO", "Escribe el número que falta.", _r_hueco, 10),
 "decenas":     ("RESTAS DE DECENAS", "Resta las decenas y escribe el resultado.", _r_decenas, 30),
 "encadenadas": ("RESTAS ENCADENADAS", "Resta de izquierda a derecha y escribe el resultado.", _r_enc, 10),
 "familia":     ("FAMILIAS DE OPERACIONES", "Usa la suma para completar las dos restas.", _r_familia, 10),
}

def ficha_restar(key, R, seed=1, nivel=None, modo=None, huecos=None, outdir=OUT):
    global c, RANGO
    RANGO = R
    tit, ins, fn, rmin = RESTAR[key]
    if R < rmin: raise ValueError(f"{tit.capitalize()} necesita un rango máximo de al menos {rmin}.")
    rnd = random.Random(seed)
    suf = (f"_{modo}" if modo else "") + (f"_{nivel}" if nivel else "")
    c = _lienzo(f"{outdir}restar_{key}{suf}_hasta_{R}.pdf")
    c.setTitle(tit.title())
    cabecera(tit, [ins])
    res = fn(H - M - 76, R, rnd, nivel, modo, huecos)
    return _fin(f"{key} 1-{R}: {res}")

# ------------------------------------------------------------ 9) JUEGOS (bloque 7)
def _sim(m, k):
    for _ in range(k % 4): m = [list(r) for r in zip(*m[::-1])]
    return [r[::-1] for r in m] if k >= 4 else m

_LIN = ([[(r, q) for q in range(3)] for r in range(3)] + [[(r, q) for r in range(3)] for q in range(3)]
        + [[(i, i) for i in range(3)], [(i, 2 - i) for i in range(3)]])

def _mag_resoluble(known):
    k = set(known); ch = True
    while ch:
        ch = False
        for ln in _LIN:
            u = [p for p in ln if p not in k]
            if len(u) == 1: k.add(u[0]); ch = True
    return len(k) == 9

def _j_cuadrado(top, R, rnd, nivel, modo, n):
    base = [[2, 7, 6], [9, 5, 1], [4, 3, 8]]; h = max(3, min(5, n or 4))
    cs = rnd.sample([(s, k) for s in range(8) for k in range(min(R - 9, 4) + 1)], 6)
    cel, cw, ch = _celdas(top, 2, 3); res = []; cells = [(r, q) for r in range(3) for q in range(3)]
    for i, ((x, y), (s, k)) in enumerate(zip(cel, cs)):
        m = [[v + k for v in r] for r in _sim(base, s)]; S = 15 + 3*k
        for _ in range(500):
            vac = set(rnd.sample(cells, h))
            if _mag_resoluble([p for p in cells if p not in vac]): break
        _marco(x, y, cw, ch, i)
        c.setFillGray(INK); c.setFont("PB", 14); c.drawCentredString(x + cw/2, y + ch - 30, f"Suma mágica: {S}")
        bs, g = 44, 6; gx = x + (cw - (3*bs + 2*g))/2
        for r in range(3):
            for q in range(3): caja(gx + q*(bs + g), y + 14 + (2 - r)*(bs + g), bs, bs, None if (r, q) in vac else m[r][q], 20)
        res.append(f"S={S}: {m} huecos {sorted(vac)}")
    return res

def _camino_azar(rnd, n, L):
    def vec(p): return [(p[0] + a, p[1] + b) for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1)) if 0 <= p[0] + a < n and 0 <= p[1] + b < n]
    for _ in range(200):
        path = [(rnd.randrange(n), rnd.randrange(n))]
        def dfs():
            if len(path) == L: return True
            vs = [q for q in vec(path[-1]) if q not in path]; rnd.shuffle(vs)
            for q in vs:
                path.append(q)
                if dfs(): return True
                path.pop()
            return False
        if dfs(): return path

def _j_laberinto(top, R, rnd, nivel, modo, n):
    p = n or 1
    if p not in (1, 2, 5, 10): raise ValueError("El paso (--n) debe ser 1, 2, 5 o 10.")
    lo = 1 if p == 1 else 0; L = min(13, (R - lo)//p + 1)
    if L < 8: raise ValueError(f"Con saltos de {p} el laberinto necesita un rango máximo mayor (mínimo {lo + 7*p}).")
    N, cs, res = 5, 62, []
    for k in range(2):
        s0 = rnd.choice(range(lo, R - (L - 1)*p + 1, p if p in (5, 10) else 1))
        vals = [s0 + j*p for j in range(L)]; path = _camino_azar(rnd, N, L)
        libres = [v for v in range(0, R + 1) if v not in vals] or [R + 1]
        g = {pos: vals[j] for j, pos in enumerate(path)}
        y0 = top - k*360 - 350; _marco(M, y0, W - 2*M, 350)
        gx = M + (W - 2*M - N*cs)/2; gy = y0 + (350 - N*cs)/2
        for r in range(N):
            for q in range(N):
                x, y = gx + q*cs, gy + (N - 1 - r)*cs
                caja(x + 2, y + 2, cs - 4, cs - 4, g.get((r, q), rnd.choice(libres)), 20)
        c.setFillGray(0.3); c.setFont("PM", 6.5)
        for pos, tag in ((path[0], "SALIDA"), (path[-1], "META")):
            c.drawCentredString(gx + pos[1]*cs + cs/2, gy + (N - 1 - pos[0])*cs + 7, tag)
        res.append(vals)
    return res

def _j_une(top, R, rnd, nivel, modo, n):
    modo = modo or "mezcla"; srcs = {"suma": [0], "resta": [1], "mezcla": [0, 1]}[modo]
    ps = [_pares_suma(R, nivel, 60, rnd), _pares_resta(R, nivel, 60, rnd)]
    ops, usados = [], set()
    for i in range(120):
        if len(ops) == 8: break
        t = srcs[len(ops) % len(srcs)]; a, b = ps[t][i % 60]; r_ = a + b if t == 0 else a - b
        if r_ not in usados: usados.add(r_); ops.append((a, b, t, r_))
    while len(ops) < 8: ops.append(ops[len(ops) % len(ops)])
    rnd.shuffle(ops); der = [o[3] for o in ops]; rnd.shuffle(der)
    rh = (top - M)/8; lw, rw, hh = 170, 110, 54; xl, xr = M + 20, W - M - 20 - rw
    for i, (a, b, t, r_) in enumerate(ops):
        y = top - (i + 1)*rh + (rh - hh)/2
        stroke(1.5); c.roundRect(xl, y, lw, hh, 10, stroke=1, fill=0); c.roundRect(xr, y, rw, hh, 10, stroke=1, fill=0)
        c.setFillGray(INK); c.setFont("PB", 22); c.drawCentredString(xl + lw/2, y + hh/2 - 7.5, f"{a} {'+' if t == 0 else MENOS} {b}")
        c.setFont("PB", 24); c.drawCentredString(xr + rw/2, y + hh/2 - 8, str(der[i]))
        c.circle(xl + lw, y + hh/2, 5, stroke=1, fill=1); c.circle(xr, y + hh/2, 5, stroke=1, fill=1)
    return [f"{a} {'+' if t == 0 else MENOS} {b} = {r_}" for a, b, t, r_ in ops]

def _j_cadena(top, R, rnd, nivel, modo, n):
    cap = min(R, 99); mags = list(range(1, 6 if R <= 10 else 10)) + ([10] if R > 20 else [])
    rows, GY = 7, 8; rh = (top - M - (rows - 1)*GY)/rows
    bw, bh, g = 48, 42, 64; x0 = M + (W - 2*M - (5*bw + 4*g))/2; res = []
    for i in range(_n(rows)):
        v = rnd.randint(max(1, cap//5), cap - cap//5); vals, ops = [v], []
        for _ in range(4):
            op = [m for m in mags if v + m <= cap] + [-m for m in mags if v - m >= 0]
            m = rnd.choice(op); v += m; vals.append(v); ops.append(m)
        y = top - (i + 1)*rh - i*GY; _marco(M, y, W - 2*M, rh); by = y + (rh - bh)/2
        for j in range(5):
            caja(x0 + j*(bw + g), by, bw, bh, vals[0] if j == 0 else None, 20)
            if j < 4:
                xa, xb = x0 + j*(bw + g) + bw + 5, x0 + (j + 1)*(bw + g) - 5
                stroke(1.6); flecha(xa, by + bh/2, xb, by + bh/2)
                c.setFillGray(INK); c.setFont("PB", 14); c.drawCentredString((xa + xb)/2, by + bh/2 + 8, ("+" if ops[j] > 0 else MENOS) + str(abs(ops[j])))
        res.append(vals)
    return res

def _pistas(t, R, rnd):
    C = set(range(1, R + 1)); out, usados = [], set()
    def pista(tp):
        if tp == "gt": a = rnd.randint(max(1, t - 6), t - 1); return f"Soy mayor que {a}.", {v for v in C if v > a}
        if tp == "lt": b = rnd.randint(t + 1, min(R + 1, t + 6)); return f"Soy menor que {b}.", {v for v in C if v < b}
        if tp == "par": return ("Soy par.", {v for v in C if v % 2 == 0}) if t % 2 == 0 else ("Soy impar.", {v for v in C if v % 2})
        if tp == "dec": d = t//10; return f"Tengo {d} decena{'s' if d != 1 else ''}.", {v for v in C if v//10 == d}
        if tp == "uni": u = t % 10; return f"Tengo {u} unidad{'es' if u != 1 else ''}.", {v for v in C if v % 10 == u}
    tipos = ["gt", "lt", "par", "uni"] + (["dec"] if t >= 10 else []); rnd.shuffle(tipos)
    for tp in tipos:
        if len(out) >= 3 or (len(C) == 1 and len(out) >= 2): break
        txt, S = pista(tp)
        if len(S) < len(C) or len(out) < 2: out.append(txt); C = C & S
    if len(C) > 1:
        out.append(f"Vengo después del {t - 1}." if rnd.random() < .5 else f"Vengo antes del {t + 1}."); C = {t}
    return out, C

def _j_oculto(top, R, rnd, nivel, modo, n):
    ts = _muestra(list(range(2, R)), 8, rnd)
    cel, cw, ch = _celdas(top, 2, 4); res = []
    for i, ((x, y), t) in enumerate(zip(cel, ts)):
        pistas, C = _pistas(t, R, rnd); assert C == {t}
        _marco(x, y, cw, ch, i, "¿QUÉ NÚMERO SOY?")
        c.setFillGray(INK); c.setFont("PR", 12)
        for k, p in enumerate(pistas): c.drawString(x + 18, y + ch - 50 - k*19, p)
        _linea(x, y + 8, cw, 44, [T("Soy el", 14, "PM"), B(54, 38)], 8)
        res.append(f"{t}: {pistas}")
    return res

SHAPES = {"corazon": [".XX.XX", "XXXXXX", "XXXXXX", ".XXXX.", "..XX.."],
          "casa": ["..XX..", ".XXXX.", "XXXXXX", "XXXXXX", "XX..XX", "XX..XX"],
          "arbol": ["..XX..", ".XXXX.", "XXXXXX", ".XXXX.", "..XX..", "..XX.."],
          "diamante": ["..XX..", ".XXXX.", "XXXXXX", "XXXXXX", ".XXXX.", "..XX.."]}

def _op_valor(v, cap, resta, R, nivel, rnd):
    for k in range(400):
        if not resta:
            a = rnd.randint(1, v - 1); b = v - a; ll = (a % 10 + b % 10) >= 10
        else:
            b = rnd.randint(1, cap - v); a = v + b; ll = (a % 10) < (b % 10)
        if R <= 20 or nivel == "mezcla" or ll == (nivel == "con"): break
    return a, b

def _j_colorea(top, R, rnd, nivel, modo, n):
    resta = modo == "resta"; cap = min(R, 99)
    forma = list(SHAPES)[(n - 1) % 4] if n else rnd.choice(list(SHAPES)); mapa = SHAPES[forma]
    tgt = rnd.randint(2, max(3, cap//2)) if resta else rnd.randint(max(6, cap//3), cap)
    if resta: tgt = min(tgt, cap - 1)
    valid = [v for v in range(2, cap + (0 if resta else 1)) if v != tgt] if resta else [v for v in range(2, cap + 1) if v != tgt]
    cerca = [v for v in valid if abs(v - tgt) <= 3] or valid
    rows = len(mapa); g = 6; cw = (W - 2*M - 5*g)/6; chh = min(84, (top - M - 70 - (rows - 1)*g)/rows)
    c.setFillGray(INK); c.setFont("PB", 18); c.drawCentredString(W/2, top - 26, f"Colorea las casillas que dan {tgt}")
    gy = top - 56; ops = []
    for r in range(rows):
        for q in range(6):
            v = tgt if mapa[r][q] == "X" else (rnd.choice(cerca) if rnd.random() < .6 else rnd.choice(valid))
            if resta and v >= cap: v = cap - 1
            a, b = _op_valor(v, cap, resta, R, nivel, rnd); txt = f"{a} {MENOS if resta else '+'} {b}"
            x, y = M + q*(cw + g), gy - (r + 1)*chh - r*g
            stroke(1.5); c.roundRect(x, y, cw, chh, 10, stroke=1, fill=0)
            fs = 20
            while pdfmetrics.stringWidth(txt, "PB", fs) > cw - 12: fs -= 0.5
            c.setFillGray(INK); c.setFont("PB", fs); c.drawCentredString(x + cw/2, y + chh/2 - fs*0.33, txt)
            ops.append(txt if mapa[r][q] == "X" else None)
    return f"{forma}, resultado {tgt}"

JUEGOS = {
 "cuadrado":  ("CUADRADOS MÁGICOS", "Completa el cuadrado: filas, columnas y diagonales suman lo mismo.", _j_cuadrado, 10),
 "laberinto": ("LABERINTO DE NÚMEROS", lambda m, n: f"Sigue los números de {n or 1} en {n or 1}, desde la salida hasta la meta.", _j_laberinto, 10),
 "une":       ("UNE OPERACIONES Y RESULTADOS", "Une cada operación con su resultado.", _j_une, 10),
 "cadena":    ("CADENAS DE NÚMEROS", "Sigue las operaciones y escribe el número de cada cuadro.", _j_cadena, 10),
 "oculto":    ("EL NÚMERO OCULTO", "Lee las pistas y escribe qué número soy.", _j_oculto, 10),
 "colorea":   ("COLOREA Y DESCUBRE", "Resuelve las operaciones y colorea las casillas del resultado indicado.", _j_colorea, 10),
}

def ficha_juegos(key, R, seed=1, nivel=None, modo=None, n=None, outdir=OUT):
    global c, RANGO
    RANGO = R
    tit, ins, fn, rmin = JUEGOS[key]
    if R < rmin: raise ValueError(f"{tit.capitalize()} necesita un rango máximo de al menos {rmin}.")
    if callable(ins): ins = ins(modo, n)
    rnd = random.Random(seed)
    suf = (f"_{modo}" if modo else "") + (f"_{nivel}" if nivel else "") + (f"_{n}" if n else "")
    c = _lienzo(f"{outdir}juegos_{key}{suf}_hasta_{R}.pdf")
    c.setTitle(tit.title())
    cabecera(tit, [ins])
    res = fn(H - M - 76, R, rnd, nivel, modo, n)
    return _fin(f"{key} 1-{R}: {res}")

# ------------------------------------------------------------ 10) GEOMETRÍA (bloque 9)
FIGS = ["circulo", "cuadrado", "rectangulo", "triangulo"]
NOMF = {"circulo": "círculo", "cuadrado": "cuadrado", "rectangulo": "rectángulo", "triangulo": "triángulo"}
CUERPOS = ["esfera", "cubo", "cilindro", "cono", "piramide"]
NOMC = {"esfera": "esfera", "cubo": "cubo", "cilindro": "cilindro", "cono": "cono", "piramide": "pirámide"}

def _fig(kind, cx, cy, s, var=0):
    stroke(1.9)
    if kind == "circulo": c.circle(cx, cy, s*0.5, stroke=1, fill=0)
    elif kind == "cuadrado": c.rect(cx - s*0.45, cy - s*0.45, s*0.9, s*0.9, stroke=1, fill=0)
    elif kind == "rectangulo":
        w, h = (s*1.3, s*0.7) if var % 2 == 0 else (s*0.7, s*1.3)
        c.rect(cx - w/2, cy - h/2, w, h, stroke=1, fill=0)
    else:
        pts = [[(-.55, -.45), (.55, -.45), (0, .5)], [(-.55, -.45), (.55, -.45), (-.55, .5)],
               [(-.55, .45), (.55, .45), (0, -.5)], [(-.5, -.45), (.6, -.45), (.2, .5)]][var % 4]
        p = c.beginPath(); p.moveTo(cx + pts[0][0]*s, cy + pts[0][1]*s)
        for q in pts[1:]: p.lineTo(cx + q[0]*s, cy + q[1]*s)
        p.close(); c.drawPath(p, stroke=1, fill=0)

def _cuerpo(kind, cx, cy, s):
    stroke(1.8); r = s/2
    if kind == "esfera":
        c.circle(cx, cy, r, stroke=1, fill=0); c.setLineWidth(1.1)
        c.arc(cx - r, cy - r*0.3, cx + r, cy + r*0.3, 180, 180)
        c.setDash(2, 2); c.arc(cx - r, cy - r*0.3, cx + r, cy + r*0.3, 0, 180); c.setDash()
    elif kind == "cubo":
        a = s*0.7; d = s*0.28; x0 = cx - (a + d)/2; y0 = cy - (a + d)/2
        c.rect(x0, y0, a, a, stroke=1, fill=0)
        p = c.beginPath(); p.moveTo(x0, y0 + a); p.lineTo(x0 + d, y0 + a + d); p.lineTo(x0 + a + d, y0 + a + d); p.lineTo(x0 + a, y0 + a)
        c.drawPath(p, stroke=1, fill=0)
        c.line(x0 + a, y0, x0 + a + d, y0 + d); c.line(x0 + a + d, y0 + d, x0 + a + d, y0 + a + d)
    elif kind == "cilindro":
        w = s*0.75; h = s*0.8; e = w*0.2; x0 = cx - w/2; y0 = cy - h/2
        c.ellipse(x0, y0 + h - e, x0 + w, y0 + h + e, stroke=1, fill=0)
        c.arc(x0, y0 - e, x0 + w, y0 + e, 180, 180); c.line(x0, y0, x0, y0 + h); c.line(x0 + w, y0, x0 + w, y0 + h)
    elif kind == "cono":
        w = s*0.8; h = s*0.9; e = w*0.2; x0 = cx - w/2; y0 = cy - h/2
        c.arc(x0, y0 - e, x0 + w, y0 + e, 180, 180)
        c.setLineWidth(1.1); c.setDash(2, 2); c.arc(x0, y0 - e, x0 + w, y0 + e, 0, 180); c.setDash(); c.setLineWidth(1.8)
        c.line(x0, y0, cx, y0 + h); c.line(x0 + w, y0, cx, y0 + h)
    else:
        a = s*0.75; d = s*0.3; x0 = cx - (a + d)/2; y0 = cy - s*0.45; ap = (x0 + (a + d)/2, y0 + s*0.95)
        c.line(x0, y0, x0 + a, y0); c.line(x0 + a, y0, x0 + a + d, y0 + d)
        for q in ((x0, y0), (x0 + a, y0), (x0 + a + d, y0 + d)): c.line(q[0], q[1], ap[0], ap[1])
        c.setLineWidth(1.1); c.setDash(2, 2)
        c.line(x0 + a + d, y0 + d, x0 + d, y0 + d); c.line(x0 + d, y0 + d, x0, y0); c.line(x0 + d, y0 + d, ap[0], ap[1]); c.setDash()

def _chips(cx, y, opts, fs=10.5, h=22, gap=6):
    ws = [pdfmetrics.stringWidth(o, "PM", fs) + 16 for o in opts]
    x = cx - (sum(ws) + gap*(len(opts) - 1))/2
    for o, w_ in zip(opts, ws):
        stroke(1.2); c.roundRect(x, y, w_, h, 8, stroke=1, fill=0)
        c.setFillGray(INK); c.setFont("PM", fs); c.drawCentredString(x + w_/2, y + h/2 - fs*0.33, o)
        x += w_ + gap

def _tres(pool, ok, rnd):
    o = [ok] + rnd.sample([p for p in pool if p != ok], 2); rnd.shuffle(o); return o

def _ciclo(lst, n, rnd):
    out = []
    while len(out) < n:
        b = lst[:]; rnd.shuffle(b); out += b
    out = out[:n]; rnd.shuffle(out); return out

def _g_figuras(top, rnd, modo, n):
    cel, cw, ch = _celdas(top, 2, 6); ks = _ciclo(FIGS, 12, rnd); res = []
    for i, ((x, y), k) in enumerate(zip(cel, ks)):
        _marco(x, y, cw, ch, i); _fig(k, x + cw/2, y + ch*0.6, 44, rnd.randrange(4))
        _chips(x + cw/2, y + 10, [NOMF[o] for o in _tres(FIGS, k, rnd)]); res.append(NOMF[k])
    return res

def _g_cuenta(top, rnd, modo, n):
    cnt = [4]*4
    for _ in range(14): cnt[rnd.randrange(4)] += 1
    ks = [k for k, m in zip(FIGS, cnt) for _ in range(m)]; rnd.shuffle(ks)
    _marco(M, top - 480, W - 2*M, 480); px = (W - 2*M)/6
    for j, k in enumerate(ks):
        r_, q = divmod(j, 6)
        _fig(k, M + (q + .5)*px + rnd.uniform(-7, 7), top - (r_ + .5)*96 + rnd.uniform(-7, 7), 38, rnd.randrange(4))
    cw = (W - 2*M - 30)/4; ch = 120; y = top - 490 - ch
    for j, k in enumerate(FIGS):
        x = M + j*(cw + 10); _marco(x, y, cw, ch)
        _fig(k, x + cw/2, y + ch - 38, 36, 0); caja(x + cw/2 - 28, y + 12, 56, 42, None)
    return dict(zip(FIGS, cnt))

def _g_cuerpos(top, rnd, modo, n):
    cel, cw, ch = _celdas(top, 2, 6); ks = _ciclo(CUERPOS, 12, rnd); res = []
    for i, ((x, y), k) in enumerate(zip(cel, ks)):
        _marco(x, y, cw, ch, i); _cuerpo(k, x + cw/2, y + ch*0.6, 56)
        _chips(x + cw/2, y + 10, [NOMC[o] for o in _tres(CUERPOS, k, rnd)]); res.append(NOMC[k])
    return res

def _g_rueda(top, rnd, modo, n):
    cel, cw, ch = _celdas(top, 3, 4); ks = _ciclo(CUERPOS, 12, rnd); res = []
    for i, ((x, y), k) in enumerate(zip(cel, ks)):
        _marco(x, y, cw, ch, i); _cuerpo(k, x + cw/2, y + ch*0.6, 62)
        _chips(x + cw/2, y + 14, ["rueda", "no rueda"], 11); res.append(f"{NOMC[k]}: {'rueda' if k in ('esfera', 'cilindro', 'cono') else 'no rueda'}")
    return res

def _trazo(tipo, cx, cy, rnd):
    stroke(2.0); p = c.beginPath()
    if tipo == "recta":
        a = rnd.choice([0, 30, 45, 60, 90, 120, 150]); dx, dy = 52*math.cos(math.radians(a)), 52*math.sin(math.radians(a))
        c.line(cx - dx, cy - dy, cx + dx, cy + dy)
    elif tipo == "curva":
        if rnd.random() < .5: p.moveTo(cx - 55, cy); p.curveTo(cx - 20, cy + 45, cx + 20, cy - 45, cx + 55, cy)
        else: p.moveTo(cx - 50, cy - 20); p.curveTo(cx - 30, cy + 32, cx + 30, cy + 32, cx + 50, cy - 20)
        c.drawPath(p, stroke=1, fill=0)
    elif tipo == "quebrada":
        ys = [rnd.choice([-18, -8]), rnd.choice([12, 20]), rnd.choice([-18, -8]), rnd.choice([12, 20]), rnd.choice([-18, 0])]
        pts = [(cx - 56 + j*28, cy + ys[j]) for j in range(5)]; p.moveTo(*pts[0])
        for q in pts[1:]: p.lineTo(*q)
        c.drawPath(p, stroke=1, fill=0)
    elif tipo == "abierta":
        v = rnd.randrange(4)
        if v == 0: c.arc(cx - 32, cy - 28, cx + 32, cy + 28, 40, 280)
        elif v == 1: p.moveTo(cx - 40, cy - 22); p.lineTo(cx, cy + 26); p.lineTo(cx + 40, cy - 22); c.drawPath(p, stroke=1, fill=0)
        elif v == 2: p.moveTo(cx - 28, cy + 26); p.lineTo(cx - 28, cy - 18); p.curveTo(cx - 28, cy - 34, cx + 28, cy - 34, cx + 28, cy - 18); p.lineTo(cx + 28, cy + 26); c.drawPath(p, stroke=1, fill=0)
        else: p.moveTo(cx - 50, cy - 10); p.curveTo(cx - 25, cy + 40, cx + 5, cy - 30, cx + 20, cy + 10); p.lineTo(cx + 50, cy - 15); c.drawPath(p, stroke=1, fill=0)
    else:
        v = rnd.randrange(4)
        if v == 0: c.ellipse(cx - 40, cy - 26, cx + 40, cy + 26, stroke=1, fill=0)
        elif v == 1: c.rect(cx - 38, cy - 22, 76, 44, stroke=1, fill=0)
        elif v == 2: p.moveTo(cx - 40, cy - 24); p.lineTo(cx + 40, cy - 24); p.lineTo(cx, cy + 26); p.close(); c.drawPath(p, stroke=1, fill=0)
        else:
            p.moveTo(cx - 38, cy); p.curveTo(cx - 38, cy + 40, cx + 10, cy + 34, cx + 36, cy + 10); p.curveTo(cx + 50, cy - 18, cx + 10, cy - 34, cx - 10, cy - 24); p.curveTo(cx - 30, cy - 18, cx - 38, cy - 10, cx - 38, cy)
            p.close(); c.drawPath(p, stroke=1, fill=0)

def _g_lineas(top, rnd, modo, n):
    cierre = modo == "cierre"; tipos = ["abierta", "cerrada"] if cierre else ["recta", "curva", "quebrada"]
    cel, cw, ch = _celdas(top, 2, 6); ks = _ciclo(tipos, 12, rnd); res = []
    for i, ((x, y), k) in enumerate(zip(cel, ks)):
        _marco(x, y, cw, ch, i); _trazo(k, x + cw/2, y + ch*0.6, rnd)
        _chips(x + cw/2, y + 10, tipos, 11); res.append(k)
    return res

def _g_posiciones(top, rnd, modo, n):
    rels = ["encima", "debajo", "a la izquierda", "a la derecha"]; ks = _ciclo(rels, 8, rnd)
    cel, cw, ch = _celdas(top, 2, 4); res = []
    for i, ((x, y), rel) in enumerate(zip(cel, ks)):
        _marco(x, y, cw, ch, i); inv = rnd.random() < .5
        A, Bn = ("cuadrado", "círculo") if inv else ("círculo", "cuadrado")
        c.setFillGray(INK); c.setFont("PR", 11); c.drawCentredString(x + cw/2, y + ch - 22, f"El {A} está ______ del {Bn}.")
        dx, dy = {"encima": (0, 34), "debajo": (0, -34), "a la izquierda": (-52, 0), "a la derecha": (52, 0)}[rel]
        cx, cy = x + cw/2, y + 58 + (ch - 58 - 30)/2
        cx, cy = cx - dx/2, cy - dy/2
        for (ox, oy, nom) in ((cx, cy, Bn), (cx + dx, cy + dy, A)):
            (c.circle(ox, oy, 12, stroke=1, fill=0) if nom == "círculo" else c.rect(ox - 11, oy - 11, 22, 22, stroke=1, fill=0)) if stroke(1.9) is None else None
        _chips(x + cw/2, y + 34, rels[:2], 10.5); _chips(x + cw/2, y + 8, rels[2:], 10.5)
        res.append(f"El {A} está {rel} del {Bn}")
    return res

def _g_simetria(top, rnd, modo, n):
    hc = max(3, min(5, n or 4)); rows, cs = 6, 20
    cel, cw, ch = _celdas(top, 2, 4); res = []
    for i, (x, y) in enumerate(cel):
        _marco(x, y, cw, ch, i)
        while True:
            pat = [[rnd.random() < .45 for _ in range(hc)] for _ in range(rows)]
            if sum(map(sum, pat)) >= 6 and sum(pat[r][hc - 1] for r in range(rows)) >= 2: break
        gx = x + (cw - 2*hc*cs)/2; gy = y + (ch - rows*cs)/2 - 6
        c.setFillGray(0.45)
        for r in range(rows):
            for q in range(hc):
                if pat[r][q]: c.rect(gx + q*cs, gy + (rows - 1 - r)*cs, cs, cs, stroke=0, fill=1)
        c.setStrokeGray(0.6); c.setLineWidth(0.5)
        for q in range(2*hc + 1): c.line(gx + q*cs, gy, gx + q*cs, gy + rows*cs)
        for r in range(rows + 1): c.line(gx, gy + r*cs, gx + 2*hc*cs, gy + r*cs)
        stroke(1.6); c.rect(gx, gy, 2*hc*cs, rows*cs, stroke=1, fill=0)
        c.setLineWidth(1.6); c.setDash(4, 3); c.line(gx + hc*cs, gy - 6, gx + hc*cs, gy + rows*cs + 6); c.setDash()
        res.append(["".join("X" if v else "." for v in r) for r in pat])
    return res

FORMAS = {"casa": [[(0, 0), (4, 0), (4, 3), (2, 5), (0, 3), (0, 0)]], "flecha": [[(0, 2), (3, 2), (3, 4), (5, 2), (3, 0), (3, 2)]],
          "escalera": [[(0, 0), (0, 1), (1, 1), (1, 2), (2, 2), (2, 3), (3, 3), (3, 4), (4, 4), (4, 0), (0, 0)]],
          "zigzag": [[(0, 1), (1, 4), (2, 1), (3, 4), (4, 1), (5, 4)]], "bandera": [[(1, 0), (1, 5), (5, 4), (1, 3)]],
          "diamante": [[(2, 0), (4, 2), (2, 4), (0, 2), (2, 0)]], "T": [[(0, 5), (4, 5), (4, 4), (2, 4), (2, 0), (1, 0), (1, 4), (0, 4), (0, 5)]],
          "barco": [[(0, 2), (5, 2), (4, 0), (1, 0), (0, 2)], [(2, 2), (2, 5), (4, 2)]]}

def _g_copia(top, rnd, modo, n):
    cel, cw, ch = _celdas(top, 2, 4); nom = list(FORMAS); rnd.shuffle(nom); sp = 22; res = []
    for i, (x, y) in enumerate(cel):
        _marco(x, y, cw, ch, i); lin = [[(px, py) for px, py in pl] for pl in FORMAS[nom[i]]]
        for _ in range(rnd.randrange(4)): lin = [[(py, 5 - px) for px, py in pl] for pl in lin]
        if rnd.random() < .5: lin = [[(5 - px, py) for px, py in pl] for pl in lin]
        gx1 = x + (cw - 244)/2; gx2 = gx1 + 134; gy = y + (ch - 110)/2 - 4
        c.setFillGray(INK)
        for gx in (gx1, gx2):
            for a in range(6):
                for b in range(6): c.circle(gx + a*sp, gy + b*sp, 1.8, stroke=0, fill=1)
        stroke(2.2)
        for pl in lin:
            p = c.beginPath(); p.moveTo(gx1 + pl[0][0]*sp, gy + pl[0][1]*sp)
            for px, py in pl[1:]: p.lineTo(gx1 + px*sp, gy + py*sp)
            c.drawPath(p, stroke=1, fill=0)
        res.append(nom[i])
    return res

GEOM = {
 "figuras":    ("LAS FIGURAS PLANAS", "Rodea el nombre de cada figura.", _g_figuras),
 "cuenta":     ("CUENTA LAS FIGURAS", "Cuenta cuántas figuras de cada clase hay y escribe el número.", _g_cuenta),
 "cuerpos":    ("LOS CUERPOS GEOMÉTRICOS", "Rodea el nombre de cada cuerpo geométrico.", _g_cuerpos),
 "rueda":      ("¿RUEDA O NO RUEDA?", "Rodea si cada cuerpo rueda o no rueda.", _g_rueda),
 "lineas":     ("LAS LÍNEAS", lambda m, n: "Rodea si cada línea es abierta o cerrada." if m == "cierre" else "Rodea el nombre de cada línea.", _g_lineas),
 "posiciones": ("ENCIMA, DEBAJO, IZQUIERDA Y DERECHA", "Mira el dibujo y rodea dónde está el primer objeto.", _g_posiciones),
 "simetria":   ("LA SIMETRÍA", "Colorea la parte que falta para que los dos lados sean iguales.", _g_simetria),
 "copia":      ("COPIA EL DIBUJO", "Copia cada dibujo en la cuadrícula de la derecha.", _g_copia),
}

def ficha_geometria(key, seed=1, modo=None, n=None, outdir=OUT):
    global c, RANGO
    tit, ins, fn = GEOM[key]
    if callable(ins): ins = ins(modo, n)
    rnd = random.Random(seed)
    suf = (f"_{modo}" if modo else "") + (f"_{n}" if n else "")
    c = _lienzo(f"{outdir}geometria_{key}{suf}.pdf")
    c.setTitle(tit.title())
    cabecera(tit, [ins])
    res = fn(H - M - 76, rnd, modo, n)
    return _fin(f"{key}: {res}")

# ------------------------------------------------------------ 11) MEDIDA Y DINERO (bloque 10)
DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
DIAS_PL = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábados", "domingos"]
MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
BILLETES = {5: (52, 28), 10: (56, 28), 20: (60, 28), 50: (64, 28)}
RADIO = {"€": {1: 15, 2: 17}, "c": {1: 10, 2: 11.5, 5: 13, 10: 12, 20: 14, 50: 15}}

def _chips2(cx, y, opts, maxw, fs=10.5):
    while sum(pdfmetrics.stringWidth(o, "PM", fs) + 14 for o in opts) + 6*(len(opts) - 1) > maxw and fs > 7: fs -= .5
    _chips(cx, y, opts, fs)

def _item_dinero(kind, v, x, y, u):
    stroke(1.6)
    if kind == "m":
        r = RADIO[u][v]; c.circle(x, y, r, stroke=1, fill=0); c.setLineWidth(0.7); c.circle(x, y, r - 2.8, stroke=1, fill=0)
        c.setFillGray(INK); c.setFont("PB", 9 if u == "€" else 7.5); c.drawCentredString(x, y - 3, f"{v} €" if u == "€" else f"{v} c")
    else:
        w, h = BILLETES[v]; c.roundRect(x - w/2, y - h/2, w, h, 4, stroke=1, fill=0); c.setLineWidth(0.7); c.rect(x - w/2 + 3, y - h/2 + 3, w - 6, h - 6, stroke=1, fill=0)
        c.setFillGray(INK); c.setFont("PB", 11); c.drawCentredString(x, y - 4, f"{v} €")

def _m_dinero(top, R, rnd, modo, n):
    cent = modo == "centimos"; u = "c" if cent else "€"; cap = min(R, 99) if cent else min(R, 50)
    vals = [("m", v) for v in (1, 2, 5, 10, 20, 50)] if cent else [("m", 1), ("m", 2)] + [("b", v) for v in (5, 10, 20) if v <= cap]
    cel, cw, ch = _celdas(top, 2, 4); res, vistos = [], set()
    for i, (x, y) in enumerate(cel):
        for _ in range(800):
            its = sorted((rnd.choice(vals) for _ in range(rnd.randint(2, 6))), key=lambda t: -t[1]); tot = sum(v for _, v in its)
            if 3 <= tot <= cap and tot not in vistos: break
        vistos.add(tot); _marco(x, y, cw, ch, i)
        ws = [2*RADIO[u][v] if k == "m" else BILLETES[v][0] for k, v in its]; lin, cur = [[]], 0
        for it, w_ in zip(its, ws):
            if cur + w_ > cw - 28 and lin[-1]: lin.append([]); cur = 0
            lin[-1].append((it, w_)); cur += w_ + 8
        yc = y + 54 + (ch - 54 - 30)/2 + (len(lin) - 1)*18
        for ln in lin:
            tw = sum(w_ for _, w_ in ln) + 8*(len(ln) - 1); xx = x + (cw - tw)/2
            for (k, v), w_ in ln: _item_dinero(k, v, xx + w_/2, yc, u); xx += w_ + 8
            yc -= 36
        _linea(x, y + 8, cw, 44, [T("Total =", 14, "PM"), B(54, 36), T("€" if not cent else "cent.", 14, "PM")], 8)
        res.append(tot)
    return res

PRODUCTOS = {"lápiz": (1, 3), "goma": (1, 2), "sacapuntas": (1, 2), "regla": (2, 3), "pegamento": (2, 4), "cuaderno": (3, 5), "pelota": (4, 8), "libro": (5, 9), "mochila": (8, 12)}

def _etiqueta(x, y, nom, p, w=104, h=50):
    stroke(1.5); c.roundRect(x, y, w, h, 8, stroke=1, fill=0)
    c.setFillGray(INK); c.setFont("PM", 12); c.drawCentredString(x + w/2, y + h - 18, nom); c.setFont("PB", 16); c.drawCentredString(x + w/2, y + 9, f"{p} €")

def _m_precios(top, R, rnd, modo, n):
    cel, cw, ch = _celdas(top, 2, 5); res = []; cap = min(R, 20)
    for i, (x, y) in enumerate(cel):
        _marco(x, y, cw, ch, i)
        if modo == "cambio":
            P = rnd.choice([p for p in (5, 10, 20) if p <= cap]); nom = rnd.choice([k for k, v in PRODUCTOS.items() if v[0] < P]); lo, hi = PRODUCTOS[nom]
            pr = rnd.randint(lo, min(hi, P - 1))
            _etiqueta(x + 26, y + ch - 66, nom, pr); c.setFillGray(INK); c.setFont("PM", 12); c.drawString(x + 142, y + ch - 36, "Pago con"); _item_dinero("b", P, x + 195, y + ch - 56, "€")
            _linea(x, y + 8, cw, 40, [T("Me devuelven", 13, "PM"), B(46, 34), T("€", 14, "PM")], 8); res.append(f"{P} - {pr} = {P - pr}")
        else:
            for _ in range(300):
                a, b = rnd.sample(list(PRODUCTOS), 2); pa, pb = rnd.randint(*PRODUCTOS[a]), rnd.randint(*PRODUCTOS[b])
                if pa + pb <= cap: break
            _etiqueta(x + 20, y + ch - 66, a, pa); _etiqueta(x + cw - 124, y + ch - 66, b, pb)
            c.setFillGray(INK); c.setFont("PB", 22); c.drawCentredString(x + cw/2, y + ch - 50, "+")
            _linea(x, y + 8, cw, 40, [T("Cuesta en total", 13, "PM"), B(46, 34), T("€", 14, "PM")], 8); res.append(f"{pa} + {pb} = {pa + pb}")
    return res

def _reloj(cx, cy, r, h, m, manos=True):
    stroke(2.0); c.circle(cx, cy, r, stroke=1, fill=0); c.setLineWidth(1.0)
    for k in range(12):
        a = math.radians(90 - 30*k); c.line(cx + (r - 4)*math.cos(a), cy + (r - 4)*math.sin(a), cx + r*math.cos(a), cy + r*math.sin(a))
    c.setFillGray(INK); c.setFont("PB", r*0.27)
    for k in range(1, 13):
        a = math.radians(90 - 30*k); c.drawCentredString(cx + r*0.74*math.cos(a), cy + r*0.74*math.sin(a) - r*0.09, str(k))
    if manos:
        a = math.radians(90 - (30*(h % 12) + m*0.5)); c.setLineWidth(3.4); c.line(cx, cy, cx + r*0.42*math.cos(a), cy + r*0.42*math.sin(a))
        a = math.radians(90 - 6*m); c.setLineWidth(1.8); c.line(cx, cy, cx + r*0.64*math.cos(a), cy + r*0.64*math.sin(a))
    c.circle(cx, cy, 2.3, stroke=0, fill=1)

def _horas(rnd, modo):
    modo = modo or "mezcla"
    if modo == "punto": return [(h, 0) for h in rnd.sample(range(1, 13), 12)]
    if modo == "media": return [(h, 30) for h in rnd.sample(range(1, 13), 12)]
    out = [(h, 0) for h in rnd.sample(range(1, 13), 6)] + [(h, 30) for h in rnd.sample(range(1, 13), 6)]; rnd.shuffle(out); return out

def _m_reloj(top, R, rnd, modo, n):
    cel, cw, ch = _celdas(top, 3, 4); hs = _horas(rnd, modo)
    for i, ((x, y), (h, m)) in enumerate(zip(cel, hs)):
        _marco(x, y, cw, ch, i); _reloj(x + cw/2, y + ch*0.6, 44, h, m)
        _linea(x, y + 8, cw, 46, [B(42, 34), T(":", 22), B(42, 34)], 8)
    return [f"{h}:{m:02d}" for h, m in hs]

def _m_reloj2(top, R, rnd, modo, n):
    cel, cw, ch = _celdas(top, 3, 4); hs = _horas(rnd, modo)
    for i, ((x, y), (h, m)) in enumerate(zip(cel, hs)):
        _marco(x, y, cw, ch, i); c.setFillGray(INK); c.setFont("PB", 26); c.drawCentredString(x + cw/2, y + ch - 36, f"{h}:{m:02d}")
        _reloj(x + cw/2, y + (ch - 48)/2, 46, h, m, False)
    return [f"{h}:{m:02d}" for h, m in hs]

def _m_calendario(top, R, rnd, modo, n):
    import calendar as _cal
    mes = (n - 1) % 12 if n else rnd.randrange(12); anio = 2026 if mes >= 8 else 2027
    st, nd = _cal.monthrange(anio, mes + 1); cw7, chh = 62, 40
    gx = M + (W - 2*M - 7*cw7)/2; _marco(M, top - 340, W - 2*M, 340)
    c.setFillGray(INK); c.setFont("PB", 18); c.drawCentredString(W/2, top - 30, f"{MESES[mes].capitalize()} {anio}"); c.setFont("PB", 12)
    for q in range(7): c.drawCentredString(gx + (q + .5)*cw7, top - 56, "LMXJVSD"[q])
    stroke(1.2)
    for d in range(1, nd + 1):
        r_, q = divmod(st + d - 1, 7); x, y = gx + q*cw7, top - 64 - (r_ + 1)*chh
        c.rect(x, y, cw7, chh, stroke=1, fill=0); c.setFillGray(INK); c.setFont("PB", 14); c.drawCentredString(x + cw7/2, y + chh/2 - 5, str(d))
    a, b = rnd.sample(range(7), 2)
    pri = lambda k: 1 + ((k - st) % 7)
    n1, n2, n3 = rnd.randint(3, nd - 2), rnd.randint(3, nd - 2), rnd.randint(1, nd - 7)
    cnt = sum(1 for d in range(1, nd + 1) if (st + d - 1) % 7 == b)
    qs = [(f"¿Qué número tiene el primer {DIAS[a]}?", pri(a)), (f"El día después del {n1} es el", n1 + 1), (f"El día antes del {n2} es el", n2 - 1),
          (f"¿Cuántos {DIAS_PL[b]} hay este mes?", cnt), (f"Una semana después del {n3} es el", n3 + 7)]
    rh = (top - 350 - M - 4*8)/5
    for i, (t_, ans) in enumerate(qs):
        y = top - 350 - (i + 1)*rh - i*8; _marco(M, y, W - 2*M, rh); _linea(M, y, W - 2*M, rh, [T(t_, 14, "PM"), B(50, 36)], 12)
    return {"mes": f"{MESES[mes]} {anio}", "dias": nd, "primer_dia": DIAS[st], "respuestas": [q[1] for q in qs]}

def _m_tiempo(top, R, rnd, modo, n):
    if modo == "meses":
        fh = 300; _marco(M, top - fh, W - 2*M, fh); ms = list(range(12)); rnd.shuffle(ms); colw = (W - 2*M - 20)/4
        for j, mm in enumerate(ms):
            r_, q = divmod(j, 4); x = M + 10 + q*colw; y = top - 20 - (r_ + 1)*88 + 22
            c.setFillGray(INK); c.setFont("PM", 12.5); c.drawCentredString(x + colw/2, y + 52, MESES[mm]); caja(x + colw/2 - 20, y + 12, 40, 34, None)
        cel, cw, ch = _celdas(top - fh - 10, 2, 3); res = []
        if PARTE < 1: cel = []      # media página: solo ordenar los meses
        for i, ((x, y), mm) in enumerate(zip(cel, rnd.sample(range(12), 6))):
            sig = (mm + 1) % 12; _marco(x, y, cw, ch, i)
            c.setFillGray(INK); c.setFont("PR", 12); c.drawCentredString(x + cw/2, y + ch - 44, f"Después de {MESES[mm]} viene")
            ops = [sig] + rnd.sample([k for k in range(12) if k != sig], 2); rnd.shuffle(ops); _chips2(x + cw/2, y + 24, [MESES[o] for o in ops], cw - 12)
            res.append(f"{MESES[mm]} -> {MESES[sig]}")
        return {"orden": [MESES[k] for k in ms], "siguientes": res}
    rows, GY = 6, 10; rh = (top - M - (rows - 1)*GY)/rows; colw = (W - 2*M - 20)/7; res = []
    for i in range(_n(rows)):
        ds = list(range(7))
        while ds == list(range(7)): rnd.shuffle(ds)
        y = top - (i + 1)*rh - i*GY; _marco(M, y, W - 2*M, rh)
        for j, d in enumerate(ds):
            x = M + 10 + j*colw; c.setFillGray(INK); c.setFont("PM", 12.5); c.drawCentredString(x + colw/2, y + rh - 32, DIAS[d]); caja(x + colw/2 - 20, y + 16, 40, 36, None)
        res.append([DIAS[d] for d in ds])
    return res

def _m_longitud(top, R, rnd, modo, n):
    compara = modo == "compara"; rows, GY = 6, 10; rh = (top - M - (rows - 1)*GY)/rows; u = 26; res = []
    nombres = ["lápiz", "cinta", "tira", "palo", "cuerda", "pajita", "regla", "hoja"]; rnd.shuffle(nombres)
    for i in range(_n(rows)):
        y = top - (i + 1)*rh - i*GY; _marco(M, y, W - 2*M, rh); gx = M + 108
        n1 = rnd.randint(2, 12); n2 = rnd.choice([v for v in range(2, 13) if v != n1]); bars = [n1, n2] if compara else [n1]
        for j, nb in enumerate(bars):
            by = y + rh - 36 - j*26; c.setFillGray(0.82); stroke(1.5); c.setFillGray(0.82); c.roundRect(gx, by, nb*u, 16, 6, stroke=1, fill=1)
            c.setFillGray(INK); c.setFont("PM", 12); c.drawString(M + 16, by + 3, (("A" if j == 0 else "B") if compara else f"El {nombres[i]}"))
        stroke(1.3)
        for k in range(12): c.rect(gx + k*u, y + 12, u, u, stroke=1, fill=0)
        if compara: _chips(W - M - 62, y + rh/2 - 11, ["A", "B"], 12)
        else:
            caja(W - M - 96, y + rh/2 - 6, 50, 36, None); c.setFillGray(INK); c.setFont("PM", 10.5); c.drawString(W - M - 42, y + rh/2 + 6, "cubitos")
        res.append(f"{bars}")
    return res

def _m_capacidad(top, R, rnd, modo, n):
    cel, cw, ch = _celdas(top, 2, 4); res = []
    for i, (x, y) in enumerate(cel):
        niv = rnd.sample([1, 2, 3, 4, 5], 3); asc = i % 2 == 0
        _marco(x, y, cw, ch, i); c.setFillGray(0.3); c.setFont("PM", 9.5); c.drawString(x + 34, y + ch - 21, "DE MENOS A MÁS" if asc else "DE MÁS A MENOS")
        gw, gh, g = 40, 66, 30; gx0 = x + (cw - (3*gw + 2*g))/2; orden = sorted(niv, reverse=not asc)
        for j, lv in enumerate(niv):
            gx, gy = gx0 + j*(gw + g), y + 64; c.setFillGray(0.72); c.rect(gx + .8, gy + .8, gw - 1.6, gh*0.18*lv, stroke=0, fill=1)
            stroke(1.9); p = c.beginPath(); p.moveTo(gx, gy + gh); p.lineTo(gx, gy); p.lineTo(gx + gw, gy); p.lineTo(gx + gw, gy + gh); c.drawPath(p, stroke=1, fill=0)
            caja(gx, y + 16, gw, 34, None)
        res.append([orden.index(v) + 1 for v in niv])
    return res

MEDIDA = {
 "dinero":     ("CUENTA EL DINERO", "Cuenta las monedas y los billetes y escribe el total.", _m_dinero),
 "precios":    ("LAS COMPRAS", lambda m: "Calcula cuánto dinero te devuelven y escríbelo." if m == "cambio" else "Calcula cuánto cuesta lo que compras y escribe el total.", _m_precios),
 "reloj":      ("LOS RELOJES", "Escribe la hora que marca cada reloj.", _m_reloj),
 "reloj2":     ("DIBUJA LAS AGUJAS", "Dibuja las agujas para marcar la hora.", _m_reloj2),
 "calendario": ("EL CALENDARIO", "Mira el calendario y contesta las preguntas.", _m_calendario),
 "tiempo":     (lambda m: "LOS MESES DEL AÑO" if m == "meses" else "LOS DÍAS DE LA SEMANA", lambda m: "Escribe el orden de los meses y rodea el mes que viene después." if m == "meses" else "Escribe el número de orden de cada día, empezando por el lunes.", _m_tiempo),
 "longitud":   ("MIDE CON CUBITOS", lambda m: "Mide con los cubitos y rodea el más largo." if m == "compara" else "Cuenta cuántos cubitos mide cada objeto y escribe el número.", _m_longitud),
 "capacidad":  ("¿CUÁNTO LÍQUIDO HAY?", "Ordena los vasos según el líquido que tienen, como dice cada casilla.", _m_capacidad),
}

def ficha_medida(key, R=20, seed=1, modo=None, n=None, outdir=OUT):
    global c, RANGO
    RANGO = R
    tit, ins, fn = MEDIDA[key]
    if callable(tit): tit = tit(modo)
    if callable(ins): ins = ins(modo)
    if key in ("dinero", "precios") and R < 10: raise ValueError("Este modelo necesita un rango máximo de al menos 10.")
    rnd = random.Random(seed)
    suf = (f"_{modo}" if modo else "") + (f"_hasta_{R}" if key in ("dinero", "precios") else "")
    c = _lienzo(f"{outdir}medida_{key}{suf}.pdf")
    c.setTitle(tit.title())
    cabecera(tit, [ins])
    res = fn(H - M - 76, R, rnd, modo, n)
    return _fin(f"{key}: {res}")

# ------------------------------------------------------------ 12) ESTADÍSTICA Y PATRONES (bloque 11)
NOMS = {"c": "círculos", "s": "estrellas", "q": "cuadrados", "t": "triángulos"}

def _datos(rnd, mx, k=4):
    for _ in range(500):
        v = [rnd.randint(1, mx) for _ in range(k)]
        if len(set(v)) == k: return v
    return rnd.sample(range(1, mx + 1), k)

def _e_pictograma(top, R, rnd, modo, n):
    dos = modo == "dos"; mx = min(R, 10); kinds = list("csqt"); rnd.shuffle(kinds)
    v = [2*x for x in _datos(rnd, mx//2 if dos else mx)] if dos else _datos(rnd, mx)
    ph = 250; _marco(M, top - ph, W - 2*M, ph)
    c.setFillGray(INK); c.setFont("PB", 13); c.drawCentredString(W/2, top - 24, "Figuras favoritas de la clase")
    if dos:
        c.setFont("PM", 10); c.drawString(W - M - 110, top - 24, "= 2 votos"); c.setFillGray(INK); c.circle(W - M - 122, top - 20, 7, stroke=0, fill=1)
    rh = (ph - 44)/4
    for j, (k, val) in enumerate(zip(kinds, v)):
        y = top - 40 - (j + .5)*rh; c.setFillGray(INK); c.setFont("PM", 12); c.drawString(M + 18, y - 4, NOMS[k].capitalize())
        stroke(0.8); c.setStrokeGray(0.75); c.line(M + 112, y - rh/2 + 2, W - M - 14, y - rh/2 + 2); c.setStrokeGray(INK)
        ico = val//2 if dos else val
        for q in range(ico):
            if dos: c.setFillGray(INK); c.circle(M + 132 + q*38, y, 11, stroke=0, fill=1)
            else: stroke(1.6); shape(k, M + 132 + q*38, y, 11)
    i_, o_ = rnd.sample(range(4), 2); a, b = (i_, o_) if v[i_] > v[o_] else (o_, i_)
    qs = [("b", f"¿Cuántos votos tienen los {NOMS[kinds[i_]]}?", v[i_]), ("b", f"¿Cuántos votos tienen los {NOMS[kinds[o_]]}?", v[o_]),
          ("c", "¿Qué figura tiene más votos?", NOMS[kinds[v.index(max(v))]]), ("c", "¿Qué figura tiene menos votos?", NOMS[kinds[v.index(min(v))]]),
          ("b", f"¿Cuántos votos más tienen los {NOMS[kinds[a]]} que los {NOMS[kinds[b]]}?", v[a] - v[b])]
    if sum(v) <= max(R, 20): qs.append(("b", "¿Cuántos votos hay en total?", sum(v)))
    t2 = top - ph - 10; rh2 = (t2 - M - (len(qs) - 1)*8)/len(qs)
    for j, (tp, txt, ans) in enumerate(qs):
        y = t2 - (j + 1)*rh2 - j*8; _marco(M, y, W - 2*M, rh2)
        if tp == "b": _linea(M, y, W - 2*M, rh2, [T(txt, 13, "PM"), B(50, 36)], 12)
        else:
            c.setFillGray(INK); c.setFont("PM", 13); c.drawCentredString(W/2, y + rh2 - 26, txt)
            _chips(W/2, y + 10, [NOMS[k] for k in kinds], 11)
    return {"datos": dict(zip([NOMS[k] for k in kinds], v)), "respuestas": [q[2] for q in qs]}

def _e_recuento(top, R, rnd, modo, n):
    mx = min(R, 9) if R <= 20 else 12; kinds = list("csqt"); v = _datos(rnd, mx); v = [max(2, x) for x in v]
    items = [k for k, m in zip(kinds, v) for _ in range(m)]; rnd.shuffle(items)
    ph = 330; _marco(M, top - ph, W - 2*M, ph)
    cols = 8; rows = math.ceil(len(items)/cols); sx = (W - 2*M - 40)/cols; sy = (ph - 30)/rows
    for j, k in enumerate(items):
        r_, q = divmod(j, cols); stroke(1.6)
        shape(k, M + 20 + (q + .5)*sx + rnd.uniform(-sx*.2, sx*.2), top - 15 - (r_ + .5)*sy + rnd.uniform(-sy*.15, sy*.15), min(13, sy*.28))
    t2 = top - ph - 12; rh = (t2 - 22 - M - 74 - 3*6)/4
    hx = [M, M + 150, W - M - 110]; c.setFillGray(INK); c.setFont("PB", 12)
    for x, lab in zip(hx, ("Figura", "Recuento", "Número")): c.drawString(x + 12, t2 - 14, lab)
    t2 -= 22
    for j, k in enumerate(kinds):
        y = t2 - (j + 1)*rh - j*6; _marco(M, y, W - 2*M, rh)
        stroke(1.6); shape(k, M + 28, y + rh/2, 11); c.setFillGray(INK); c.setFont("PM", 12); c.drawString(M + 48, y + rh/2 - 4, NOMS[k])
        stroke(0.8); c.setStrokeGray(0.75); c.line(hx[1], y + 6, hx[1], y + rh - 6); c.line(hx[2], y + 6, hx[2], y + rh - 6); c.setStrokeGray(INK)
        caja(hx[2] + 30, y + (rh - 36)/2, 50, 36, None)
    _marco(M, M, W - 2*M, 62); c.setFillGray(INK); c.setFont("PM", 13); c.drawCentredString(W/2, M + 38, "¿De qué figura hay más?")
    _chips(W/2, M + 8, [NOMS[k] for k in kinds], 11)
    return dict(zip([NOMS[k] for k in kinds], v))

def _e_barras(top, R, rnd, modo, n):
    lee = modo == "lee"; mx = min(R, 10); kinds = list("csqt"); rnd.shuffle(kinds); v = _datos(rnd, mx)
    tw = (W - 2*M - 30)/4
    for j, (k, val) in enumerate(zip(kinds, v)):
        x = M + j*(tw + 10); _marco(x, top - 58, tw, 58); stroke(1.6); shape(k, x + 30, top - 29, 12)
        if lee: caja(x + tw - 64, top - 49, 48, 40, None)
        else: c.setFillGray(INK); c.setFont("PB", 22); c.drawCentredString(x + tw - 40, top - 37, str(val))
    gh = 360; gy = top - 80 - gh; _marco(M, gy - 10, W - 2*M, gh + 10)
    cw_, ch_ = 64, (gh - 70)/mx; gx = M + (W - 2*M - (4*cw_ + 3*30))/2 + 10
    c.setFillGray(INK); c.setFont("PM", 10)
    for r in range(1, mx + 1): c.drawRightString(gx - 10, gy + 40 + (r - .5)*ch_ - 3.5, str(r))
    for j, (k, val) in enumerate(zip(kinds, v)):
        x = gx + j*(cw_ + 30)
        for r in range(mx):
            yy = gy + 40 + r*ch_
            if lee and r < val: c.setFillGray(0.62); c.rect(x, yy, cw_, ch_, stroke=0, fill=1)
            c.setStrokeGray(0.55); c.setLineWidth(0.8); c.rect(x, yy, cw_, ch_, stroke=1, fill=0)
        stroke(1.6); shape(k, x + cw_/2, gy + 20, 11)
    t2 = gy - 22; i_, o_ = rnd.sample(range(4), 2)
    qs = [("¿Qué figura tiene la barra más alta?", NOMS[kinds[v.index(max(v))]]), (f"¿Cuántos {NOMS[kinds[i_]]} y {NOMS[kinds[o_]]} hay en total?", v[i_] + v[o_])]
    rh = (t2 - M - 8)/2
    for j, (txt, ans) in enumerate(qs):
        y = t2 - (j + 1)*rh - j*8; _marco(M, y, W - 2*M, rh)
        if j == 0: c.setFillGray(INK); c.setFont("PM", 13); c.drawCentredString(W/2, y + rh - 24, txt); _chips(W/2, y + 8, [NOMS[k] for k in kinds], 11)
        else: _linea(M, y, W - 2*M, rh, [T(txt, 13, "PM"), B(50, 36)], 12)
    return {"datos": dict(zip([NOMS[k] for k in kinds], v)), "respuestas": [q[1] for q in qs]}

PATRONES = ["AB", "AAB", "ABB", "ABC", "AABB", "AB", "ABC", "AAB"]

def _e_patrones(top, R, rnd, modo, n):
    hueco = modo == "hueco"; rows, GY = 8, 8; rh = (top - M - (rows - 1)*GY)/rows; bs, g = 40, 6; res = []
    pats = PATRONES[:]; rnd.shuffle(pats); pats = pats[:_n(rows)]
    for i, p in enumerate(pats):
        ks = rnd.sample("csqt", len(set(p))); mp = dict(zip(sorted(set(p)), ks))
        L = 11 if not hueco else 10; seq = [mp[p[j % len(p)]] for j in range(L)]
        vis = 2*len(p) + (1 if len(p) <= 3 else 0)
        vac = set(range(vis, L)) if not hueco else set(rnd.sample(range(len(p) + 1, L), 3))
        y = top - (i + 1)*rh - i*GY; _marco(M, y, W - 2*M, rh)
        n_ = min(L, vis + 3) if not hueco else L; x0 = M + (W - 2*M - (n_*bs + (n_ - 1)*g))/2
        for j in range(n_):
            x = x0 + j*(bs + g); by = y + (rh - bs)/2
            if j in vac: caja(x, by, bs, bs, None)
            else:
                stroke(1.2); c.setStrokeGray(0.75); c.roundRect(x, by, bs, bs, 7, stroke=1, fill=0); c.setStrokeGray(INK)
                stroke(1.7); shape(seq[j], x + bs/2, by + bs/2, 11)
        res.append(f"{p}: " + " ".join(NOMS[seq[j]][:-1] if NOMS[seq[j]].endswith("s") else NOMS[seq[j]] for j in sorted(vac) if j < n_))
    return res

ESTAD = {
 "pictograma": ("EL PICTOGRAMA", lambda m: "Mira el pictograma (cada punto vale 2 votos) y contesta." if m == "dos" else "Mira el pictograma y contesta las preguntas.", _e_pictograma),
 "recuento":   ("CUENTA Y ANOTA", "Haz palotes para contar cada figura y escribe el número.", _e_recuento),
 "barras":     ("EL GRÁFICO DE BARRAS", lambda m: "Mira el gráfico, escribe los datos y contesta." if m == "lee" else "Colorea una casilla por cada figura y contesta.", _e_barras),
 "patrones":   ("LOS PATRONES", lambda m: "Dibuja las figuras que faltan en los cuadros grises." if m == "hueco" else "Descubre el patrón y dibuja las figuras que siguen.", _e_patrones),
}

def ficha_estadistica(key, R=10, seed=1, modo=None, n=None, outdir=OUT):
    global c, RANGO
    RANGO = R
    tit, ins, fn = ESTAD[key]
    if callable(ins): ins = ins(modo)
    if R < 10: raise ValueError("Este modelo necesita un rango máximo de al menos 10.")
    rnd = random.Random(seed)
    suf = (f"_{modo}" if modo else "") + (f"_hasta_{R}" if key != "patrones" else "")
    c = _lienzo(f"{outdir}estadistica_{key}{suf}.pdf")
    c.setTitle(tit.title())
    cabecera(tit, [ins])
    res = fn(H - M - 76, R, rnd, modo, n)
    return _fin(f"{key}: {res}")

# ------------------------------------------------------------ ACTIVIDADES (paso 1.2)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import modelos as MOD

_FICHA = {"rep": "ficha_rep", "combinada": "ficha_combinada", "suma": "ficha_suma", "conteo": "ficha_conteo",
          "orden": "ficha_orden", "valor": "ficha_valor", "sumar": "ficha_sumar", "restar": "ficha_restar",
          "juegos": "ficha_juegos", "geometria": "ficha_geometria", "medida": "ficha_medida", "estadistica": "ficha_estadistica"}
_R_DEF = {"medida": 20, "estadistica": 10}   # rango interno de los modelos que no lo piden

def _llamar(m, p, seed, **extra):
    """Llama a la función de su familia con los parámetros ya validados (sin 'rango')."""
    p = dict(p); R = p.pop("rango", None) or _R_DEF.get(m["familia"])
    f = globals()[_FICHA[m["familia"]]]
    a = (R,) if m["familia"] in ("combinada", "suma") else (m["clave"],) if R is None else (m["clave"], R)
    return f(*a, seed, **{k: v for k, v in p.items() if v is not None}, **extra)

def titulo_modelo(m, p):
    """Título que pone el motor a la ficha de ese modelo (sin dibujar nada)."""
    d = {"rep": CAT, "conteo": CONTEO, "orden": ORDEN, "valor": VALOR, "sumar": SUMAR, "restar": RESTAR, "juegos": JUEGOS,
         "geometria": GEOM, "medida": MEDIDA, "estadistica": ESTAD}.get(m["familia"])
    if d is None: return {"combinada": "¿QUÉ NÚMERO ES?", "suma": "SUMA Y DIBUJA"}[m["familia"]]
    t = d[m["clave"]][TIT] if m["familia"] == "rep" else d[m["clave"]][0]
    return t(p.get("modo")) if callable(t) else t

def actividad(cv, rect, params, rnd, num=1, color=None, tamano="completa"):
    """Dibuja un modelo como actividad dentro de `rect` = (x, y, ancho, alto) del canvas `cv`:
    panel de color con su número y enunciado, y el contenido escalado dentro.
    params = {"modelo": "sumar.h20", "rango": 20, "nivel": "con", ...}; rnd da la semilla.
    Devuelve la clave de respuestas (texto). El diseño de cada modelo no cambia."""
    global _ACT, c, PARTE
    params = dict(params); m = MOD.modelo(params.pop("modelo"))
    p = MOD.validar(m["id"], params, tamano)
    _ACT = {"cv": cv, "rect": rect, "num": num, "color": color}
    c = cv; PARTE = 0.5 if tamano == "media" else 1.0
    try:
        return _llamar(m, p, rnd.randrange(1 << 30), outdir="")
    finally:
        cv.restoreState(); _ACT = None; PARTE = 1.0

# ------------------------------------------------------------ COMPOSITOR DE PÁGINA (paso 1.3)
ORDEN_COLOR = ["amarillo", "rosa", "azul", "verde"]

def color_modelo(m):
    """Color del panel según la familia (el mismo que tiene su ficha suelta)."""
    return color_familia({"combinada": "que_numero_es", "suma": "suma_y_dibuja"}.get(m["familia"], m["familia"]))

def titulo_pagina(acts):
    """Título por defecto: el del modelo; con dos, «X y y» (el segundo en minúscula)."""
    ts = [_titulo(titulo_modelo(MOD.modelo(a["modelo"]), a)) for a in acts]
    if len(ts) == 1 or ts[0] == ts[1]: return ts[0]
    return ts[0] + " y " + ts[1][0].lower() + ts[1][1:]

def pagina(cv, acts, rnd, titulo=None, nombre="", colores=None):
    """Una página A4: Nombre (impreso o en blanco), Fecha, título y 1 o 2 actividades,
    cada una en su panel de color y con su número, como la ficha de muestra.
    acts = [{"modelo": id, ...params}, ...]; colores = lista opcional (None = automático).
    Devuelve la lista de claves (una por actividad). No llama a showPage()."""
    global c
    if not 1 <= len(acts) <= 2: raise ValueError("Una página lleva 1 o 2 actividades.")
    tam = "completa" if len(acts) == 1 else "media"
    for a in acts:
        m = MOD.modelo(a["modelo"])
        if tam not in m["tamanos"]: raise ValueError(f"«{m['nombre']}» solo cabe en una página completa.")
    c = cv
    tit = titulo or titulo_pagina(acts)
    encabezado(tit, nombre)
    cols, usados = [], []
    for i, a in enumerate(acts):
        k = (colores or [None]*2)[i] or color_modelo(MOD.modelo(a["modelo"]))
        if k in usados and not (colores and colores[i]):     # dos paneles seguidos, colores distintos
            k = next(x for x in ORDEN_COLOR[ORDEN_COLOR.index(k) + 1:] + ORDEN_COLOR if x not in usados)
        cols.append(k); usados.append(k)
    if tam == "completa":
        rects = [PANEL_COMPLETO]
    else:
        x, y, w, h = PANEL_COMPLETO; GAP = 12; hh = (h - GAP)/2
        rects = [(x, y + hh + GAP, w, hh), (x, y, w, hh)]
    claves = [actividad(cv, r, a, rnd, num=i + 1, color=k, tamano=tam) for i, (a, r, k) in enumerate(zip(acts, rects, cols))]
    c = cv
    return claves

# ------------------------------------------------------------ API ÚNICA (paso 1.4)
def generar(spec):
    """Genera el PDF completo. spec = {
        "actividades": [{"modelo": "sumar.h20", "rango": 20, ...}, ...]   (1 o 2),
        "alumnos": ["Ana", "Luis", ...]     (vacía o ausente: una ficha con la línea de nombre en blanco),
        "copias": 1                         (solo sin alumnos: cuántas páginas),
        "variaciones": "iguales" | "distintas"   (distintas: otros números en cada página),
        "semilla": 1,                        (otra variante = otra semilla)
        "titulo": None, "color": None | "azul" | ["rosa", "azul"] }
    Devuelve (pdf_bytes, clave). clave = {"titulo", "paginas": [{"alumno", "claves": [...]}, ...]};
    con fichas iguales todas las páginas comparten la misma clave. La clave no va en el PDF."""
    import io
    acts = spec.get("actividades") or []
    alumnos = [a.strip() for a in (spec.get("alumnos") or []) if a and a.strip()]
    nombres = alumnos or [""]*max(1, int(spec.get("copias") or 1))
    distintas = spec.get("variaciones", "iguales") == "distintas"
    semilla = int(spec.get("semilla") or 1)
    col = spec.get("color"); colores = [col]*len(acts) if isinstance(col, str) else col
    titulo = spec.get("titulo") or titulo_pagina(acts) if acts else None
    buf = io.BytesIO()
    cv = canvas.Canvas(buf, pagesize=A4); cv.setTitle(titulo or "Charta"); cv.setAuthor("Charta")
    paginas = []
    for i, nom in enumerate(nombres):
        rnd = random.Random(semilla*1000003 + (i if distintas else 0))
        claves = pagina(cv, acts, rnd, titulo=titulo, nombre=nom, colores=colores)
        cv.showPage(); paginas.append({"alumno": nom, "claves": claves})
    cv.setTitle(titulo or "Charta"); cv.save()
    return buf.getvalue(), {"titulo": titulo, "variaciones": "distintas" if distintas else "iguales", "paginas": paginas}

# ------------------------------------------------------------ CLI
USO = """Uso:
  python generador_fichas.py rep <clave|todas> <máx> [--lectura] [--seed N]
  python generador_fichas.py combinada <máx> [--seed N]
  python generador_fichas.py suma <máx> [--seed N]
  python generador_fichas.py conteo <clave> <máx> [--huecos N] [--modo ambos|anterior|posterior] [--seed N]
  python generador_fichas.py orden <clave> <máx> [--n N] [--modo mayor|menor|mezcla|sin|colorea|lugar] [--cerca] [--seed N]
  python generador_fichas.py valor <clave> <máx> [--nivel completas|mezcla] [--modo suma|marca|clasifica] [--seed N]
  python generador_fichas.py sumar <clave> <máx> [--nivel sin|con|mezcla] [--modo dibujo|bloques] [--huecos N] [--seed N]
  python generador_fichas.py restar <clave> <máx> [--nivel sin|con|mezcla] [--modo dibujo|bloques] [--seed N]
  python generador_fichas.py juegos <clave> <máx> [--nivel sin|con|mezcla] [--modo suma|resta|mezcla] [--n N] [--seed N]
  python generador_fichas.py geometria <clave> [--modo tipo|cierre] [--n N] [--seed N]
  python generador_fichas.py medida <clave> [<máx>] [--modo ...] [--seed N]   (máx solo en dinero y precios)
  python generador_fichas.py estadistica <clave> [<máx>] [--modo dos|lee|hueco] [--seed N]
Claves conteo: """ + ", ".join(CONTEO) + """
Claves orden: """ + ", ".join(ORDEN) + """
Claves valor: """ + ", ".join(VALOR) + """
Claves sumar: """ + ", ".join(SUMAR) + """
Claves restar: """ + ", ".join(RESTAR) + """
Claves juegos: """ + ", ".join(JUEGOS) + """
Claves geometria: """ + ", ".join(GEOM) + """
Claves medida: """ + ", ".join(MEDIDA) + """
Claves estadistica: """ + ", ".join(ESTAD) + """
Claves rep: """ + ", ".join(CAT) + """
Opción común: --color amarillo|rosa|azul|verde (color del marco; si no, según el tipo de ficha)
Salida: /mnt/user-data/outputs/ (la clave de respuestas se imprime en consola, no en el PDF)."""

if __name__ == "__main__":
    a = sys.argv[1:]
    if not a: print(USO); sys.exit()
    seed = int(a[a.index("--seed") + 1]) if "--seed" in a else 1
    if "--color" in a: COLOR = a[a.index("--color") + 1]
    pos = [x for k, x in enumerate(a) if not x.startswith("--") and not (k > 0 and a[k - 1] in ("--seed", "--huecos", "--modo", "--n", "--nivel", "--color"))]
    huecos = int(a[a.index("--huecos") + 1]) if "--huecos" in a else None
    opc = a[a.index("--modo") + 1] if "--modo" in a else None
    nel = int(a[a.index("--n") + 1]) if "--n" in a else None
    niv = a[a.index("--nivel") + 1] if "--nivel" in a else None
    modo = pos[0]
    if modo == "rep":
        clave, R = pos[1], int(pos[2])
        if clave == "todas":
            os.makedirs(OUT + "fichas_representaciones/", exist_ok=True)
            for s_, k in enumerate(CAT):
                ficha_rep(k, R, seed + s_, "--lectura" in a, OUT + "fichas_representaciones/")
        else:
            ficha_rep(clave, R, seed, "--lectura" in a)
    elif modo == "combinada": ficha_combinada(int(pos[1]), seed)
    elif modo == "suma": ficha_suma(int(pos[1]), seed)
    elif modo == "orden": ficha_orden(pos[1], int(pos[2]), seed, nel, opc, "--cerca" in a)
    elif modo == "valor": ficha_valor(pos[1], int(pos[2]), seed, niv, opc)
    elif modo == "sumar": ficha_sumar(pos[1], int(pos[2]), seed, niv, opc, huecos)
    elif modo == "restar": ficha_restar(pos[1], int(pos[2]), seed, niv, opc, huecos)
    elif modo == "juegos": ficha_juegos(pos[1], int(pos[2]), seed, niv, opc, nel)
    elif modo == "geometria": ficha_geometria(pos[1], seed, opc, nel)
    elif modo == "medida": ficha_medida(pos[1], int(pos[2]) if len(pos) > 2 else 20, seed, opc, nel)
    elif modo == "estadistica": ficha_estadistica(pos[1], int(pos[2]) if len(pos) > 2 else 10, seed, opc, nel)
    elif modo == "conteo": ficha_conteo(pos[1], int(pos[2]), seed, huecos, opc)
    else: print(USO)
