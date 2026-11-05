"""Genera src/lengua/lexico.js desde datos/lexico_1.tsv (léxico de Lengua de 1.º; Iván puede revisarlo y añadir palabras).
Ejecutar tras cambiar el TSV:  python3 tools/lexico.py
Columnas: palabra, cat (n v a o), genero (m f -), campos (separados por comas), dibujo (s n), frec (1 2 3), extra (verbos: 3.ª persona)."""
import os, json, sys
RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
CAMPOS = "animales comida ropa casa escuela cuerpo juguetes transportes familia naturaleza colores oficios acciones cualidades otros".split()

def leer(ruta=os.path.join(RAIZ, "datos", "lexico_1.tsv")):
    filas, vistas = [], set()
    with open(ruta, encoding="utf-8") as f:
        cab = f.readline().rstrip("\n").split("\t")
        assert cab == ["palabra", "cat", "genero", "campos", "dibujo", "frec", "extra"], cab
        for n, l in enumerate(f, 2):
            if not l.strip() or l.startswith("#"): continue
            c = l.rstrip("\n").split("\t")
            if len(c) != 7: sys.exit(f"lexico_1.tsv, línea {n}: {len(c)} columnas")
            p, cat, g, campos, dib, frec, extra = c
            campos = [x.strip() for x in campos.split(",") if x.strip()]
            err = (p != p.lower() or " " in p or not p) and "palabra" or cat not in "nvao" and "cat" or \
                  (g not in ("m", "f") if cat == "n" else g != "-") and "genero" or any(x not in CAMPOS for x in campos) and "campos" or \
                  dib not in ("s", "n") and "dibujo" or frec not in ("1", "2", "3") and "frec" or \
                  ((extra == "-") if cat == "v" else (extra != "-")) and "extra" or p in vistas and "repetida"
            if err: sys.exit(f"lexico_1.tsv, línea {n} ({p}): {err}")
            vistas.add(p)
            e = {"p": p, "c": cat, "k": campos, "f": int(frec)}
            if cat == "n": e["g"] = g
            if dib == "s": e["d"] = 1
            if cat == "v": e["v3"] = extra
            filas.append(e)
    return filas

if __name__ == "__main__":
    filas = leer()
    js = ("// GENERADO por tools/lexico.py desde datos/lexico_1.tsv. No editar a mano.\n"
          "// Cada palabra: p (palabra), c (n nombre, v verbo, a adjetivo, o otra), g (género de los nombres), k (campos léxicos),\n"
          "// d (1 = se puede dibujar), f (frecuencia 1–3), v3 (verbos: 3.ª persona del presente).\n"
          "export const LEXICO = [\n" + ",\n".join(json.dumps(e, ensure_ascii=False, separators=(",", ":")) for e in filas) + "\n];\n")
    with open(os.path.join(RAIZ, "src", "lengua", "lexico.js"), "w", encoding="utf-8") as f: f.write(js)
    print(f"lexico.js: {len(filas)} palabras")
