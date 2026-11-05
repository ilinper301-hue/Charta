#!/usr/bin/env python3
"""Compara un tipo: motor Python (ReportLab) frente a render() de JS, en una página A4.
Uso: python3 tools/comparar_tipo.py <id> [<id> …] [--media] [--salida /tmp] [--dpi 50] [--solucion]
Genera <salida>/cmp_<id>_<tamaño>.png: izquierda motor, derecha JS (los números difieren: otro azar).
El JS es la página completa de src/render/hoja.js (paso 2.4). --bn: blanco y negro."""
import os, sys, json, subprocess, argparse
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(RAIZ, "motor"))
import generador_fichas as g
from PIL import Image

JS = r"""
import { generar } from "%(raiz)s/src/nucleo/ficha.js";
import "%(raiz)s/src/tipos/index.js";
import { hoja } from "%(raiz)s/src/render/hoja.js";
const [id, media, modo, bn] = process.argv.slice(2);
const acts = media === "1" ? [{ tipo: id }, { tipo: id }] : [{ tipo: id }];
const f = generar({ actividades: acts }, 7);
process.stdout.write(hoja(f.paginas[0], { titulo: f.titulo, modo, bn: bn === "1" }));
"""

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("ids", nargs="+"); ap.add_argument("--media", action="store_true")
    ap.add_argument("--salida", default="/tmp"); ap.add_argument("--dpi", type=int, default=50); ap.add_argument("--solucion", action="store_true"); ap.add_argument("--bn", action="store_true")
    a = ap.parse_args(); tam = "media" if a.media else "completa"
    js = os.path.join(a.salida, "_cmp_tipo.mjs"); open(js, "w").write(JS % {"raiz": RAIZ})
    from playwright.sync_api import sync_playwright
    fu = "file://" + os.path.join(RAIZ, "motor")
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox", "--allow-file-access-from-files"])
        for id_ in a.ids:
            base = os.path.join(a.salida, f"cmp_{id_}_{tam}")
            acts = [{"modelo": id_}] * (2 if a.media else 1)
            pdf, _ = g.generar({"actividades": acts, "semilla": 7})
            open(base + "_motor.pdf", "wb").write(pdf)
            subprocess.run(["pdftoppm", "-r", str(a.dpi), "-png", "-singlefile", base + "_motor.pdf", base + "_motor"], check=True)
            svg = subprocess.run(["node", js, id_, "1" if a.media else "0", "solucion" if a.solucion else "papel", "1" if a.bn else "0"],
                                 check=True, capture_output=True, text=True).stdout
            hp = base + "_js.html"
            open(hp, "w").write(f"""<!doctype html><meta charset="utf-8"><style>
@font-face{{font-family:Andika;src:url("{fu}/Andika-Regular.ttf");font-weight:400}}
@font-face{{font-family:Andika;src:url("{fu}/Andika-Bold.ttf");font-weight:700}}
body{{margin:0}} svg{{display:block;width:595.28px;height:841.89px}}</style>{svg}""")
            pg = b.new_page(viewport={"width": 596, "height": 842}, device_scale_factor=a.dpi / 72)
            pg.goto("file://" + hp); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(300)
            pg.screenshot(path=base + "_js.png"); pg.close()
            i1, i2 = Image.open(base + "_motor.png"), Image.open(base + "_js.png")
            out = Image.new("RGB", (i1.width + i2.width + 10, max(i1.height, i2.height)), "#888")
            out.paste(i1, (0, 0)); out.paste(i2, (i1.width + 10, 0)); out.save(base + ".png")
            print(base + ".png")
        b.close()

if __name__ == "__main__":
    main()
