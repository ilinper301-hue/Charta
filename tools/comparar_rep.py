#!/usr/bin/env python3
"""Compara las 16 representaciones: motor Python (ReportLab) frente a src/rep/index.js (SVG).
Uso: python3 tools/comparar_rep.py [carpeta_salida=/tmp]
Genera <salida>/rep_motor.pdf|png y rep_js.html|png (hoja 1) y rep_motor_tpl.png / rep_js_tpl.png (plantillas).
Misma escala en ambos (1 unidad = 1 pt, 100 ppp)."""
import os, sys, json, subprocess
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(RAIZ, "motor"))
import generador_fichas as g
from reportlab.pdfgen import canvas

SAL = sys.argv[1] if len(sys.argv) > 1 else "/tmp"
DPI = 100
CW, CH, COLS, MARGEN = 170, 104, 6, 6
NUMS = {"dedos": [3, 7, 10], "dado": [4, 7, 12], "domino": [5, 9, 12], "marco": [7, 16, 35], "palotes": [7, 18, 30],
        "objetos": [6, 14, 27], "regletas": [8, 17, 30], "descomp": [7, 23, 60], "letras": [16, 21, 47],
        "recta": [5, 23, 70], "bloques": [14, 36, 99], "cuadricula": [9, 47, 100], "monedas": [13, 38, 69],
        "abaco": [12, 45, 99], "du": [1, 21, 78], "atados": [14, 33, 69]}
REPS = list(NUMS)

def celdas(plantillas):
    out = []
    for r, nombre in enumerate(REPS):
        if plantillas and g.CAT[nombre][g.TPL] is None: continue
        out.append(nombre)
    cel = []
    for idx, nombre in enumerate(out):
        for k, n in enumerate(NUMS[nombre]):
            col = (idx % 2) * 3 + k; fila = idx // 2
            cel.append(dict(nombre=nombre, n=n, i=k, rango=30 if n <= 30 else 100, col=col, fila=fila,
                            label=f"{nombre} n={n} i={k}"))
    filas = (len(out) + 1) // 2
    return cel, MARGEN * 2 + COLS * CW, MARGEN * 2 + filas * CH

def pdf(plantillas, ruta):
    cel, PW, PH = celdas(plantillas)
    cv = canvas.Canvas(ruta, pagesize=(PW, PH)); g.c = cv
    for e in cel:
        x = MARGEN + e["col"] * CW; y = PH - MARGEN - (e["fila"] + 1) * CH
        cv.setLineWidth(0.4); cv.setStrokeGray(0.8); cv.rect(x, y, CW, CH, stroke=1, fill=0)
        cv.setFillGray(0.5); cv.setFont("PM", 6); cv.drawString(x + 3, y + CH - 8, e["label"])
        g.RANGO = e["rango"]
        d = g.CAT[e["nombre"]]
        f = d[g.TPL] if plantillas else d[g.READ]
        f(x + CW / 2, y + CH / 2, e["n"], e["i"])
    cv.showPage(); cv.save()
    return PW, PH

JS = r"""
import { rep, plantilla } from "%s/src/rep/index.js";
import fs from "node:fs";
const { cel, pl, CW, CH, M, PW, PH } = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${PW}" height="${PH}" viewBox="0 0 ${PW} ${PH}">`;
for (const e of cel) {
  const r = pl ? plantilla(e.nombre, e.n, { i: e.i, rango: e.rango }) : rep(e.nombre, e.n, { i: e.i, rango: e.rango });
  const x = M + e.col * CW, y = M + e.fila * CH;
  s += `<rect x="${x}" y="${y}" width="${CW}" height="${CH}" fill="none" stroke="#ccc" stroke-width="0.4"/>`;
  s += `<text x="${x + 3}" y="${y + 8}" font-size="6" fill="#808080" font-family="Andika">${e.label}</text>`;
  s += `<g transform="translate(${x + CW / 2 - r.w / 2} ${y + CH / 2 - r.h / 2})">${r.svg}</g>`;
}
s += "</svg>";
process.stdout.write(s);
""" % RAIZ

def html(plantillas, ruta):
    cel, PW, PH = celdas(plantillas)
    spec = os.path.join(SAL, "_spec.json"); js = os.path.join(SAL, "_cmp.mjs")
    json.dump(dict(cel=cel, pl=plantillas, CW=CW, CH=CH, M=MARGEN, PW=PW, PH=PH), open(spec, "w"))
    open(js, "w").write(JS)
    svg = subprocess.run(["node", js, spec], check=True, capture_output=True, text=True).stdout
    fu = "file://" + os.path.join(RAIZ, "motor")
    open(ruta, "w").write(f"""<!doctype html><meta charset="utf-8"><style>
@font-face{{font-family:Andika;src:url("{fu}/Andika-Regular.ttf");font-weight:400}}
@font-face{{font-family:Andika;src:url("{fu}/Andika-Bold.ttf");font-weight:700}}
body{{margin:0;background:#fff}} svg{{display:block}}</style>{svg}""")
    return PW, PH

def main():
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox", "--allow-file-access-from-files"])
        for pl, suf in ((False, ""), (True, "_tpl")):
            rp = os.path.join(SAL, f"rep_motor{suf}.pdf"); hp = os.path.join(SAL, f"rep_js{suf}.html")
            PW, PH = pdf(pl, rp); html(pl, hp)
            base = os.path.join(SAL, f"rep_motor{suf}")
            subprocess.run(["pdftoppm", "-r", str(DPI), "-png", "-singlefile", rp, base], check=True)
            pg = b.new_page(viewport={"width": int(PW), "height": int(PH)}, device_scale_factor=DPI / 72)
            pg.goto("file://" + hp); pg.wait_for_timeout(500)
            pg.evaluate("document.fonts.ready"); pg.screenshot(path=os.path.join(SAL, f"rep_js{suf}.png")); pg.close()
        b.close()
    print("listo:", SAL, "rep_motor.png / rep_js.png (+ _tpl)")

if __name__ == "__main__":
    main()
