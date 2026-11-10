"""Genera src/lengua/frases_1.js desde datos/frases_1.tsv (frases para las primeras letras de 1.º; Iván puede revisarlo y añadir).
Ejecutar tras cambiar el TSV:  python3 tools/frases.py      (--revisar: lista las palabras que no están en el léxico)
Columnas: etapa (la letra nueva, en el orden de ORDEN), frase («Lola lee a Lalo.»).
Reglas: 3 a 5 palabras; mayúscula inicial y punto final; sin otros signos; solo letras de su etapa o anteriores
(la «y» suelta vale siempre); lleva la letra de su etapa; sin repetir."""
import os, sys, json, unicodedata
RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
# Orden de las letras de Iván (los dígrafos ll, ch y qu cuentan como letra propia: no salen antes de su etapa).
ORDEN = "a e i o u l m s n h d f p t r b v ñ y k c z q g j w x ll ch".split()
ETAPAS = ORDEN[5:]

def sin_tildes(t):
    return "".join(c for c in unicodedata.normalize("NFD", t) if unicodedata.category(c) != "Mn" or c == "̃").replace("ñ", "ñ")

def unidades(palabra):
    """Letras de una palabra: «ll», «ch» y «qu» como una sola; el resto, letra a letra (sin tildes)."""
    p, out, i = sin_tildes(palabra.lower()), [], 0
    while i < len(p):
        if p[i:i + 2] in ("ll", "ch"): out.append(p[i:i + 2]); i += 2
        elif p[i:i + 2] == "qu": out.append("q"); i += 2
        else: out.append(p[i]); i += 1
    return out

def leer(ruta=os.path.join(RAIZ, "datos", "frases_1.tsv")):
    filas, vistas = [], set()
    with open(ruta, encoding="utf-8") as f:
        cab = f.readline().rstrip("\n").split("\t")
        assert cab == ["etapa", "frase"], cab
        for n, l in enumerate(f, 2):
            if not l.strip() or l.startswith("#"): continue
            c = l.rstrip("\n").split("\t")
            if len(c) != 2: sys.exit(f"frases_1.tsv, línea {n}: {len(c)} columnas")
            etapa, t = c[0].strip().lower(), c[1].strip()
            def mal(msg): sys.exit(f"frases_1.tsv, línea {n} («{t}»): {msg}")
            if etapa not in ETAPAS: mal(f"etapa «{etapa}» no válida")
            if not t.endswith(".") or not t[0].isupper(): mal("mayúscula al principio y punto al final")
            ws = t[:-1].split(" ")
            if not 3 <= len(ws) <= 5: mal(f"{len(ws)} palabras (de 3 a 5)")
            if any(not w or not all(ch.isalpha() for ch in w) for w in ws): mal("solo letras y espacios (sin comas ni otros signos)")
            permitidas = set(ORDEN[:ORDEN.index(etapa) + 1])
            letras = [u for w in ws if w.lower() != "y" for u in unidades(w)]
            fuera = sorted(set(u for u in letras if u not in permitidas))
            if fuera: mal(f"lleva {', '.join(fuera)}, que aún no se ha visto en la etapa «{etapa}»")
            if etapa not in letras and not (etapa == "y" and any(w.lower() == "y" for w in ws)): mal(f"no lleva la «{etapa}»")
            clave = t.lower()
            if clave in vistas: mal("repetida")
            vistas.add(clave)
            filas.append((etapa, ws))
    # nombres propios: las palabras con mayúscula que no son la primera
    nombres = {w for _, ws in filas for w in ws[1:] if w[0].isupper()}
    out = []
    for etapa, ws in filas:
        w0 = ws[0] if ws[0] in nombres else ws[0][0].lower() + ws[0][1:]
        out.append({"e": etapa, "w": [w0, *ws[1:]]})
    return out

def revisar(filas):
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from lexico import leer as leer_lexico
    lex = {e["p"] for e in leer_lexico()} | {e.get("v3") for e in leer_lexico() if e.get("v3")}
    raras = {}
    for f in filas:
        for w in f["w"]:
            if w[0].isupper(): continue
            if w not in lex and w.rstrip("s") not in lex and w[:-2] not in lex: raras[w] = raras.get(w, 0) + 1
    print(f"{len(raras)} palabras fuera del léxico (revisar a mano):")
    print(" ".join(sorted(raras)))

if __name__ == "__main__":
    filas = leer()
    if "--revisar" in sys.argv: revisar(filas)
    js = ("// GENERADO por tools/frases.py desde datos/frases_1.tsv. No editar a mano.\n"
          "// Frases para las primeras letras de 1.º: e = etapa (letra nueva), w = palabras (minúscula salvo nombres propios).\n"
          "export const FRASES_1 = [\n" + ",\n".join(json.dumps(e, ensure_ascii=False, separators=(",", ":")) for e in filas) + "\n];\n")
    with open(os.path.join(RAIZ, "src", "lengua", "frases_1.js"), "w", encoding="utf-8") as f: f.write(js)
    cuenta = {}
    for e in filas: cuenta[e["e"]] = cuenta.get(e["e"], 0) + 1
    print(f"frases_1.js: {len(filas)} frases · " + " ".join(f"{k}:{cuenta.get(k, 0)}" for k in ETAPAS if cuenta.get(k)))
