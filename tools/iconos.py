"""Charta · genera los iconos de la PWA en iconos/ (PNG). Uso: python3 tools/iconos.py
Dibujo: hoja blanca con esquina doblada, nombre y dos paneles pastel (como la ficha), sobre verde oscuro.
"""
import os
from PIL import Image, ImageDraw

RAIZ = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
OUT = os.path.join(RAIZ, "iconos")
VERDE, VERDE_OSC = "#1B4D3E", "#133A2E"
S = 1024  # se dibuja grande y se reduce (suavizado)

def dibujo(escala, redondeo):
    """escala: tamaño de la hoja respecto al icono (maskable: más pequeña, zona segura)."""
    im = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, S - 1, S - 1), radius=int(S * redondeo), fill=VERDE)
    h = S * escala; w = h * 0.76; x0 = (S - w) / 2; y0 = (S - h) / 2; x1 = x0 + w; y1 = y0 + h
    dob = w * 0.24; r = w * 0.05
    # sombra
    d.rounded_rectangle((x0 + 14, y0 + 18, x1 + 14, y1 + 18), radius=r, fill=VERDE_OSC)
    # hoja con esquina doblada (arriba a la derecha)
    d.rounded_rectangle((x0, y0, x1, y1), radius=r, fill="#FFFFFF")
    d.polygon([(x1 - dob, y0 - 2), (x1 + 2, y0 - 2), (x1 + 2, y0 + dob)], fill=VERDE)
    d.polygon([(x1 - dob, y0), (x1 - dob, y0 + dob), (x1, y0 + dob)], fill="#D5E3DB")
    m = w * 0.12; lw = max(6, int(w * 0.035))
    # línea del nombre y título
    d.rounded_rectangle((x0 + m, y0 + h * 0.13, x1 - dob - m * 0.4, y0 + h * 0.13 + lw), radius=lw / 2, fill="#9FB3A9")
    d.rounded_rectangle((x0 + w * 0.3, y0 + h * 0.23, x1 - w * 0.3, y0 + h * 0.23 + lw * 1.4), radius=lw, fill="#1F4E79")
    # dos paneles pastel con un círculo azul y casillas
    for i, (fondo, borde) in enumerate((("#FFF2C2", "#E9CF6E"), ("#D9ECFA", "#8DBBE0"))):
        py0 = y0 + h * (0.33 + i * 0.32); py1 = py0 + h * 0.27
        d.rounded_rectangle((x0 + m * 0.6, py0, x1 - m * 0.6, py1), radius=r * 0.8, fill=fondo, outline=borde, width=lw // 2)
        cr = h * 0.035; cx = x0 + m * 0.6 + cr * 1.8; cy = py0 + cr * 1.8
        d.ellipse((cx - cr, cy - cr, cx + cr, cy + cr), fill="#1F4E79")
        bw = (w - m * 1.2 - cr * 4) / 3.6
        for k in range(3):
            bx = x0 + m * 0.6 + cr * 2 + k * bw * 1.2 + bw * 0.25
            d.rounded_rectangle((bx, py0 + h * 0.11, bx + bw, py1 - h * 0.04), radius=r * 0.5, fill="#FFFFFF", outline="#C9D1CD", width=lw // 3)
    return im

def guardar(im, nombre, px):
    im.resize((px, px), Image.LANCZOS).save(os.path.join(OUT, nombre), optimize=True)

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    normal = dibujo(0.74, 0.22)
    mask = dibujo(0.62, 0.0)  # zona segura: el 80 % central
    guardar(normal, "icono-192.png", 192); guardar(normal, "icono-512.png", 512)
    guardar(mask, "maskable-512.png", 512); guardar(mask, "maskable-192.png", 192)
    guardar(normal, "favicon.png", 48); guardar(mask, "apple-touch-icon.png", 180)
    print("iconos/:", ", ".join(sorted(os.listdir(OUT))))
