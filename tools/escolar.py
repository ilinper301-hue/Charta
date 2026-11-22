"""Genera src/lengua/escolar.js desde referencia/fuentes/Escolar_G.ttf (letra escolar ligada de Antonio Herrera Infantes y Anye1992).
Ejecutar tras cambiar la fuente o el léxico:  python3 tools/escolar.py
Guarda, por carácter, el avance y el contorno (path SVG en unidades de la fuente, y hacia arriba, cuádricas Q, enteros).
Caracteres: los de las fichas (a–z, ñ, vocales con tilde, ü, mayúsculas, signos) y todo lo que aparezca en datos/lexico_1.tsv y datos/frases_1.tsv.
Si falta alguno en la fuente, falla con un mensaje claro."""
import os, sys
import numpy as np, cv2
from skimage.morphology import skeletonize
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen
RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
BASICOS = "abcdefghijklmnñopqrstuvwxyzáéíóúü" + "ABCDEFGHIJKLMNÑOPQRSTUVWXYZÁÉÍÓÚÜ" + "¿?¡!.,;:-«» "

class Pluma(BasePen):
    def __init__(s, gs): super().__init__(gs); s.o = []
    def _moveTo(s, p): s.o.append("M%d %d" % (round(p[0]), round(p[1])))
    def _lineTo(s, p): s.o.append("L%d %d" % (round(p[0]), round(p[1])))
    def _qCurveToOne(s, a, p): s.o.append("Q%d %d %d %d" % (round(a[0]), round(a[1]), round(p[0]), round(p[1])))
    def _curveToOne(s, a, b, p): s.o.append("C%d %d %d %d %d %d" % (*map(round, (*a, *b, *p)),))
    def _closePath(s): s.o.append("Z")
    def _endPath(s): s.o.append("Z")

# ---------------------------------------------------------------- línea central (para el punteado: una sola línea de puntos)
class Poligonos(BasePen):
    """Contornos aplanados (cuádricas en 8 tramos), en unidades de la fuente."""
    def __init__(s, gs): super().__init__(gs); s.cs = []; s.p0 = None
    def _moveTo(s, p): s.cs.append([p]); s.p0 = p
    def _lineTo(s, p): s.cs[-1].append(p); s.p0 = p
    def _qCurveToOne(s, a, p):
        x0, y0 = s.p0
        for k in range(1, 9):
            t = k / 8; s.cs[-1].append(((1-t)**2*x0 + 2*(1-t)*t*a[0] + t*t*p[0], (1-t)**2*y0 + 2*(1-t)*t*a[1] + t*t*p[1]))
        s.p0 = p
    def _curveToOne(s, a, b, p):
        x0, y0 = s.p0
        for k in range(1, 9):
            t = k / 8; m = 1 - t
            s.cs[-1].append((m**3*x0 + 3*m*m*t*a[0] + 3*m*t*t*b[0] + t**3*p[0], m**3*y0 + 3*m*m*t*a[1] + 3*m*t*t*b[1] + t**3*p[1]))
        s.p0 = p
    def _closePath(s): pass
    def _endPath(s): pass

K, MARGEN = 2, 20   # píxeles por unidad y margen (unidades)
VEC = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]

def centro(gs, n):
    """Línea central del glifo: [[(x, y)…]…] en unidades de la fuente (esqueleto del relleno, sin ramitas cortas)."""
    pl = Poligonos(gs); gs[n].draw(pl)
    cs = [c for c in pl.cs if len(c) > 2]
    if not cs: return []
    xs = [x for c in cs for x, _ in c]; ys = [y for c in cs for _, y in c]
    x0, y1 = min(xs) - MARGEN, max(ys) + MARGEN
    W, H = int((max(xs) - x0 + MARGEN) * K) + 1, int((y1 - min(ys) + MARGEN) * K) + 1
    a_px = lambda c: np.array([[(x - x0) * K, (y1 - y) * K] for x, y in c], np.int32)
    # Relleno por paridad (los contornos de esta fuente no se solapan): cada contorno cambia dentro/fuera.
    m = np.zeros((H, W), np.uint8)
    for c in cs:
        una = np.zeros((H, W), np.uint8); cv2.fillPoly(una, [a_px(c)], 1); m ^= una
    m = m.astype(bool)
    esq = skeletonize(m)
    pts = set(zip(*np.nonzero(esq)))
    vec = lambda q: [(q[0] + a, q[1] + b) for a, b in VEC if (q[0] + a, q[1] + b) in pts]
    nodos = {q for q in pts if len(vec(q)) != 2}
    usados, trazos = set(), []
    def andar(a, b):
        cam = [a, b]; usados.add(frozenset((a, b)))
        while cam[-1] not in nodos:
            sig = [q for q in vec(cam[-1]) if frozenset((cam[-1], q)) not in usados and q != cam[-2]]
            if not sig: break
            usados.add(frozenset((cam[-1], sig[0]))); cam.append(sig[0])
            if cam[-1] == cam[0]: break
        return cam
    for a in sorted(nodos):
        for b in vec(a):
            if frozenset((a, b)) not in usados: trazos.append(andar(a, b))
    for a in sorted(pts):   # lazos sin nodos (la o)
        for b in vec(a):
            if frozenset((a, b)) not in usados: trazos.append(andar(a, b))
    out = []
    for t in trazos:
        arr = np.array([[q[1], q[0]] for q in t], np.float32).reshape(-1, 1, 2)
        simp = cv2.approxPolyDP(arr, 1.5 * K, False).reshape(-1, 2)
        out.append([(x / K + x0, y1 - y / K) for x, y in simp])
    out = limpiar(out)
    out = [[(round(x), round(y)) for x, y in l] for l in out]
    # Puntos sueltos (punto de la i, tildes pequeñas): componentes sin trazo → un punto en su centro.
    nc, et = cv2.connectedComponents(m.astype(np.uint8))
    for i in range(1, nc):
        ys_, xs_ = np.nonzero(et == i)
        if not any(et[q[0], q[1]] == i for t in trazos for q in t[:1]):
            if not any(et[q[0], q[1]] == i for t in trazos for q in t):
                out.append([(round(xs_.mean() / K + x0), round(y1 - ys_.mean() / K))] * 2)
    return out

def _largo(l): return sum(((l[i][0] - l[i-1][0]) ** 2 + (l[i][1] - l[i-1][1]) ** 2) ** .5 for i in range(1, len(l)))
def _cerca(a, b, r=5): return abs(a[0] - b[0]) <= r and abs(a[1] - b[1]) <= r

def limpiar(ls):
    """Quita los trocitos de los cruces y las ramitas cortas de las puntas, y une los tramos que siguen uno a otro."""
    extremos = lambda ls, i, k: sum(1 for j, m in enumerate(ls) if j != i for e in (m[0], m[-1]) if _cerca(e, k))
    # Trocitos de los cruces fuera; los puntos aislados (el de la i, la j, la ñ…) se quedan como un solo punto.
    ls = [l if _largo(l) >= 4 else [l[0], l[0]] for i, l in enumerate(ls) if _largo(l) >= 4 or (extremos(ls, i, l[0]) == 0 and extremos(ls, i, l[-1]) == 0)]
    for _ in range(2):   # ramitas: < 35 unidades con una punta suelta y la otra unida
        if len(ls) < 2: break
        ls = [l for i, l in enumerate(ls) if not (_largo(l) < 35 and (extremos(ls, i, l[0]) == 0) != (extremos(ls, i, l[-1]) == 0))]
    unido = True
    while unido:   # unir dos tramos que se tocan en un punto donde solo llegan ellos dos
        unido = False
        for i, l in enumerate(ls):
            for j, m in enumerate(ls):
                if i >= j: continue
                for li, lp in ((l, l[-1]), (l[::-1], l[0])):
                    for mj, mp in ((m, m[0]), (m[::-1], m[-1])):
                        if _cerca(lp, mp) and extremos(ls, i, lp) == 1:
                            ls[i] = li + mj[1:]; del ls[j]; unido = True; break
                    if unido: break
                if unido: break
            if unido: break
    return ls

def d_centro(ls): return "".join("M%d %d" % l[0] + "".join("L%d %d" % q for q in l[1:]) for l in ls)

def caracteres():
    cs = set(BASICOS)
    for ruta, col in (("lexico_1.tsv", 0), ("frases_1.tsv", 1)):
        with open(os.path.join(RAIZ, "datos", ruta), encoding="utf-8") as f:
            for l in f.read().splitlines()[1:]:
                if not l.strip() or l.startswith("#"): continue
                p = l.split("\t")
                if len(p) > col: cs.update(p[col])
                if ruta == "lexico_1.tsv" and len(p) > 6 and p[6] != "-": cs.update(p[6])   # 3.ª persona
    cs.discard("\t"); cs.discard("\n")
    return sorted(cs)

def main():
    f = TTFont(os.path.join(RAIZ, "referencia", "fuentes", "Escolar_G.ttf")); cm = f.getBestCmap(); gs = f.getGlyphSet()
    if f["head"].unitsPerEm != 1000: sys.exit("Escolar_G: se esperaban 1000 unidades por em.")
    cs = caracteres(); falta = [c for c in cs if ord(c) not in cm]
    if falta: sys.exit("Escolar_G no tiene estos caracteres: " + " ".join(f"«{c}» (U+{ord(c):04X})" for c in falta))
    filas = []
    for c in cs:
        n = cm[ord(c)]; pl = Pluma(gs); gs[n].draw(pl)
        filas.append("  %s: [%d, \"%s\", \"%s\"]," % (("\"" + c + "\"") if c not in "\"\\" else "\"\\" + c + "\"", f["hmtx"][n][0], "".join(pl.o), d_centro(centro(gs, n)) if c != " " else ""))
    sal = ("// GENERADO por tools/escolar.py desde referencia/fuentes/Escolar_G.ttf — no editar.\n"
           "// Escolar_G © Antonio Herrera Infantes & Anye1992. Por carácter: [avance, contorno SVG (M L Q Z), línea central (M L, para el punteado)] en unidades de la fuente, y hacia arriba.\n"
           "// 1000 unidades por em: altura de la x = 335 (1 cuerpo de pauta), astas a 670, rabos a −340.\n"
           "export const UNIDADES = 335;\nexport const GLIFOS = {\n" + "\n".join(filas) + "\n};\n")
    ruta = os.path.join(RAIZ, "src", "lengua", "escolar.js")
    with open(ruta, "w", encoding="utf-8") as g: g.write(sal)
    print(f"{ruta}: {len(cs)} caracteres, {len(sal.encode())} bytes")

if __name__ == "__main__": main()
