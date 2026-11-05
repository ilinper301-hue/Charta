"""Charta · genera los iconos de la PWA en iconos/ desde src/pwa/logo.svg. Uso: python3 tools/iconos.py
Necesita rsvg-convert (solo para generarlos; los PNG se suben al repositorio).
Maskable: fondo a sangre y el dibujo al 80 % (zona segura de Android).
"""
import os, re, subprocess, tempfile

RAIZ = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
OUT = os.path.join(RAIZ, "iconos")
SVG = open(os.path.join(RAIZ, "src", "pwa", "logo.svg"), encoding="utf-8").read()

def maskable(svg):
    fondo = re.search(r'<rect width="512" height="512" rx="\d+" fill="([^"]+)"/>', svg)
    cuerpo = svg[fondo.end():svg.rindex("</svg>")]
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="{fondo.group(1)}"/>'
            f'<g transform="translate(51.2 51.2) scale(.8)">{cuerpo}</g></svg>')

def png(svg, nombre, px):
    with tempfile.NamedTemporaryFile("w", suffix=".svg", delete=False) as f: f.write(svg)
    subprocess.run(["rsvg-convert", "-w", str(px), "-h", str(px), f.name, "-o", os.path.join(OUT, nombre)], check=True)
    os.unlink(f.name)

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    m = maskable(SVG)
    png(SVG, "icono-192.png", 192); png(SVG, "icono-512.png", 512); png(SVG, "favicon.png", 48)
    png(m, "maskable-192.png", 192); png(m, "maskable-512.png", 512); png(m, "apple-touch-icon.png", 180)
    print("iconos/:", ", ".join(sorted(os.listdir(OUT))))
