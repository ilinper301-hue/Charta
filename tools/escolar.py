"""Genera src/lengua/escolar.js desde referencia/fuentes/Escolar_G.ttf (letra escolar ligada de Antonio Herrera Infantes y Anye1992).
Ejecutar tras cambiar la fuente o el léxico:  python3 tools/escolar.py
Guarda, por carácter, el avance y el contorno (path SVG en unidades de la fuente, y hacia arriba, cuádricas Q, enteros).
Caracteres: los de las fichas (a–z, ñ, vocales con tilde, ü, mayúsculas, signos) y todo lo que aparezca en datos/lexico_1.tsv y datos/frases_1.tsv.
Si falta alguno en la fuente, falla con un mensaje claro."""
import os, sys
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
        filas.append("  %s: [%d, \"%s\"]," % (("\"" + c + "\"") if c not in "\"\\" else "\"\\" + c + "\"", f["hmtx"][n][0], "".join(pl.o)))
    sal = ("// GENERADO por tools/escolar.py desde referencia/fuentes/Escolar_G.ttf — no editar.\n"
           "// Escolar_G © Antonio Herrera Infantes & Anye1992. Por carácter: [avance, contorno SVG (M L Q Z) en unidades de la fuente, y hacia arriba].\n"
           "// 1000 unidades por em: altura de la x = 335 (1 cuerpo de pauta), astas a 670, rabos a −340.\n"
           "export const UNIDADES = 335;\nexport const GLIFOS = {\n" + "\n".join(filas) + "\n};\n")
    ruta = os.path.join(RAIZ, "src", "lengua", "escolar.js")
    with open(ruta, "w", encoding="utf-8") as g: g.write(sal)
    print(f"{ruta}: {len(cs)} caracteres, {len(sal.encode())} bytes")

if __name__ == "__main__": main()
