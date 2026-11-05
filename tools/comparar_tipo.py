#!/usr/bin/env python3
"""Compara un tipo: motor Python (ReportLab) frente a render() de JS, en una página A4.
Uso: python3 tools/comparar_tipo.py <id> [<id> …] [--media] [--salida /tmp] [--dpi 50] [--solucion]
Genera <salida>/cmp_<id>_<tamaño>.png: izquierda motor, derecha JS (los números difieren: otro azar).
El JS se coloca con la misma transformación que panel() del motor (borrador del paso 2.4)."""
import os, sys, json, subprocess, argparse
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(RAIZ, "motor"))
import generador_fichas as g
from PIL import Image

JS = r"""
import { generar } from "%(raiz)s/src/nucleo/ficha.js";
import "%(raiz)s/src/tipos/index.js";
import { render } from "%(raiz)s/src/render/actividad.js";
const [id, media, modo] = process.argv.slice(2);
const acts = media === "1" ? [{ tipo: id }, { tipo: id }] : [{ tipo: id }];
const f = generar({ actividades: acts }, 7);
const W = 595.2756, H = 841.8898, M = 28;
const PAL = { amarillo: ["#fff7e6", "#f7e7c4"], rosa: ["#fbeff3", "#f2d6df"], azul: ["#eef5fc", "#d1e2f3"], verde: ["#edf7ee", "#c7e0cc"] };
let [px, py, pw, ph] = [34, 26, W - 68, H - 108 - 26];
const rects = acts.length === 1 ? [[px, py, pw, ph]] : [[px, py + (ph - 12) / 2 + 12, pw, (ph - 12) / 2], [px, py, pw, (ph - 12) / 2]];
let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#fff"/>`;
f.paginas[0].actividades.forEach((a, i) => {
  const [x, yB, w, h] = rects[i], yT = yB + h, lineas = a.enunciado.split("\n"), extra = 16 * (lineas.length - 1);
  const [fill, borde] = PAL[a.color];
  s += `<rect x="${x}" y="${H - yT}" width="${w}" height="${h}" rx="14" fill="${fill}" stroke="${borde}"/>`;
  s += `<circle cx="${x + 24}" cy="${H - (yT - 22)}" r="11" fill="#1F4E79"/>`;
  s += `<text x="${x + 24}" y="${H - (yT - 26)}" text-anchor="middle" font-family="Andika" font-weight="bold" font-size="11" fill="#fff">${a.n}</text>`;
  lineas.forEach((t, j) => { s += `<text x="${x + 45}" y="${H - (yT - 26 - j * 16)}" font-family="Andika" font-size="11.5" fill="#1f1f1f">${t}</text>`; });
  const z = render(a, modo), parte = a.tamano === "media" ? 0.5 : 1;
  const hi = (yT - 43 - extra) - (yB + 14), alto = (H - 2 * M - 76) * parte, base = H - M - 76 - alto;
  const sc = Math.min((w - 31) / (W - 2 * M), hi / alto);
  const e = x + w / 2 - (W - 2 * M) * sc / 2 - sc * M, fy = (yB + 14) + (parte < 1 ? hi - alto * sc : 0) - sc * base;
  // punto de página (X, Yarriba) → (sc·X + e, sc·Y + fy); en SVG: y' = H − (sc·(H − ysvg) + fy)
  s += `<g transform="translate(${e} ${H - fy - sc * H}) scale(${sc})">${z.svg}</g>`;
});
process.stdout.write(s + "</svg>");
"""

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("ids", nargs="+"); ap.add_argument("--media", action="store_true")
    ap.add_argument("--salida", default="/tmp"); ap.add_argument("--dpi", type=int, default=50); ap.add_argument("--solucion", action="store_true")
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
            svg = subprocess.run(["node", js, id_, "1" if a.media else "0", "solucion" if a.solucion else "papel"],
                                 check=True, capture_output=True, text=True).stdout
            hp = base + "_js.html"
            open(hp, "w").write(f"""<!doctype html><meta charset="utf-8"><style>
@font-face{{font-family:Andika;src:url("{fu}/Andika-Regular.ttf");font-weight:400}}
@font-face{{font-family:Andika;src:url("{fu}/Andika-Bold.ttf");font-weight:700}}
body{{margin:0}} svg{{display:block}}</style>{svg}""")
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
