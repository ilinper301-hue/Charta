"""Charta · src/ → dist/index.html (un solo archivo, sin dependencias).
Uso:  python3 tools/build.py            (escribe dist/index.html)
      python3 tools/build.py --js       (solo el JS empaquetado, a la salida estándar; lo usan las pruebas)

Empaquetador mínimo de módulos ES: cada módulo va en una función y sus import/export se
reescriben a __req(). Formas admitidas (las únicas que usa src/):
  import "./x.js";   import { a, b as c } from "./x.js";   import X from "./x.js";
  export function f / export const a / export let / export class / export default expr;
  export { a, b } from "./x.js";
"""
import os, re, sys, json, posixpath

RAIZ = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
SRC = os.path.join(RAIZ, "src")
DIST = os.path.join(RAIZ, "dist")

IMP_NADA = re.compile(r'^import\s+"([^"]+)";?\s*$', re.M)
IMP_NOMBRES = re.compile(r'^import\s*\{([^}]*)\}\s*from\s*"([^"]+)";?\s*$', re.M)
IMP_DEFECTO = re.compile(r'^import\s+([A-Za-z_$][\w$]*)\s+from\s*"([^"]+)";?\s*$', re.M)
REEXP = re.compile(r'^export\s*\{([^}]*)\}\s*from\s*"([^"]+)";?\s*$', re.M)
EXP_DECL = re.compile(r'^export\s+(async\s+function\*?|function\*?|const|let|class)\s+([A-Za-z_$][\w$]*)', re.M)
EXP_DEF = re.compile(r'^export\s+default\s+', re.M)

def _resolver(desde, ruta):
    if not ruta.startswith("."): sys.exit(f"build: import no relativo «{ruta}» en {desde}")
    return posixpath.normpath(posixpath.join(posixpath.dirname(desde), ruta))

def _alias(lista):
    out = []
    for parte in filter(None, (x.strip() for x in lista.split(","))):
        a, _, b = parte.partition(" as ")
        out.append((a.strip(), (b or a).strip()))
    return out

def empaquetar(entrada="app.js"):
    modulos, pendientes = {}, [entrada]
    while pendientes:
        r = pendientes.pop()
        if r in modulos: continue
        p = os.path.join(SRC, r)
        if not os.path.isfile(p): sys.exit(f"build: no existe src/{r}")
        cod = open(p, encoding="utf-8").read()
        exps, n = [], [0]
        def req(ruta):
            d = _resolver(r, ruta); pendientes.append(d); return f'__req({json.dumps(d)})'
        def reexp(m):
            n[0] += 1; v = f"__r{n[0]}"
            for a, b in _alias(m.group(1)): exps.append(f"get {b}() {{ return {v}.{a}; }}")
            return f"const {v} = {req(m.group(2))};"
        cod = REEXP.sub(reexp, cod)
        cod = IMP_NADA.sub(lambda m: req(m.group(1)) + ";", cod)
        cod = IMP_NOMBRES.sub(lambda m: "const { " + ", ".join(a if a == b else f"{a}: {b}" for a, b in _alias(m.group(1))) + f" }} = {req(m.group(2))};", cod)
        cod = IMP_DEFECTO.sub(lambda m: f"const {m.group(1)} = {req(m.group(2))}.default;", cod)
        def decl(m):
            exps.append(f"get {m.group(2)}() {{ return {m.group(2)}; }}"); return f"{m.group(1)} {m.group(2)}"
        cod = EXP_DECL.sub(decl, cod)
        if EXP_DEF.search(cod):
            cod = EXP_DEF.sub("const __default = ", cod, count=1); exps.append("get default() { return __default; }")
        resto = re.search(r'^\s*(import|export)\b.*$', cod, re.M)
        if resto: sys.exit(f"build: forma no admitida en src/{r}: {resto.group(0).strip()}")
        modulos[r] = f"(__exp) => {{\n{cod}\nObject.defineProperties(__exp, Object.getOwnPropertyDescriptors({{ {', '.join(exps)} }}));\n}}"
    cuerpo = ",\n".join(f"{json.dumps(k)}: {v}" for k, v in sorted(modulos.items()))
    return ("(() => {\n\"use strict\";\nconst __mods = {\n" + cuerpo + "\n};\nconst __cache = {};\n"
            "function __req(r) { if (!__cache[r]) { __cache[r] = {}; __mods[r](__cache[r]); } return __cache[r]; }\n"
            f"__req({json.dumps(entrada)});\n}})();\n")

def construir():
    html = open(os.path.join(SRC, "index.html"), encoding="utf-8").read()
    css = open(os.path.join(SRC, "estilos.css"), encoding="utf-8").read()
    js = empaquetar("app.js").replace("</script", "<\\/script")
    html = html.replace('<link rel="stylesheet" href="estilos.css">', "<style>\n" + css + "</style>")
    html = html.replace('<script type="module" src="app.js"></script>', "<script>\n" + js + "</script>")
    if 'src="app.js"' in html or 'href="estilos.css"' in html: sys.exit("build: no se encontró el <link> o el <script> en src/index.html")
    os.makedirs(DIST, exist_ok=True)
    with open(os.path.join(DIST, "index.html"), "w", encoding="utf-8") as f: f.write(html)
    print(f"dist/index.html: {len(html.encode()) // 1024} KB")

if __name__ == "__main__":
    if "--js" in sys.argv: sys.stdout.write(empaquetar("app.js"))
    else: construir()
